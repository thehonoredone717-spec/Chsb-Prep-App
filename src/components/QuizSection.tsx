import { doc, onSnapshot, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import {
  AlertTriangle,
  Award,
  Battery,
  BatteryCharging,
  BatteryLow,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  KeyRound,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AttemptRecord, UI_COPY, pickText } from '../data/subjects';
import { STUDENT_EMAIL, UserProfile, db, sanitizeDisplayName } from '../firebase';
import { DeadlineTimer } from './DeadlineTimer';
import { playSound } from '../utils/sound';
import { FormattedMathText } from './FormattedMathText';
import { MathShapeDiagram } from './MathShapeDiagram';

const CameraProctor = lazy(() =>
  import('./CameraProctor').then((m) => ({ default: m.CameraProctor }))
);
const CertificateModal = lazy(() =>
  import('./CertificateModal').then((m) => ({ default: m.CertificateModal }))
);
const ScientificCalculator = lazy(() =>
  import('./ScientificCalculator').then((m) => ({ default: m.ScientificCalculator }))
);
import {
  ActiveQuizQuestion,
  DifficultyLevel,
  QuizMode,
  QuizSectionKind,
  SubjectConfig,
  SubjectId,
  TopicDrillRequest,
  UILanguage,
  VariantSelection,
} from '../types/quiz';
import {
  DIFFICULTY_LEVELS,
  QUESTIONS_PER_TOPIC_VARIANT,
  VARIANTS_PER_SECTION,
  buildTopicVariantQuestions,
  buildVariantQuestions,
  formatTime,
  getCorrectDisplayIndex,
  getDifficultyLabel,
  getLocalizedField,
  getLocalizedOptions,
  getNextVariant,
  getTopicVariantCount,
  getVariantChoices,
  getVariantLabel,
  gradeOf,
  isChoiceCorrect,
} from '../utils/quizEngine';
import {
  isFullscreenActive,
  requestAppFullscreen,
  unlockSystemKeys,
} from '../utils/fullscreen';
import { useWarningsPaused } from '../utils/warningPause';

interface AssignedSlot {
  docId: string;
  studentUid: string;
  variant: number;
  attemptsAllowed: number;
  attemptsUsed: number;
  hasExplicitCounters: boolean;
  retakeCodePending: boolean;
}

function generateSixDigitCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return String(num);
}

interface QuizSectionProps {
  subject: SubjectConfig;
  sectionKind: QuizSectionKind;
  initialTopicDrill?: TopicDrillRequest | null;
  lang: UILanguage;
  userProfile?: UserProfile | null;
  history?: AttemptRecord[];
  onOpenGuide: () => void;
  onRecordAttempt: (record: AttemptRecord) => void;
  onRunningStateChange?: (running: boolean) => void;
  registerFinishQuiz?: (fn: (() => void) | null) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;
const MAX_WARNINGS = 3;
const GRACE_SECONDS = 3;

const SUBJECT_DURATION_MINUTES: Record<SubjectId, number> = {
  english: 30,
  math: 40,
  history: 35,
  science: 35,
  computing: 40,
  uzbek: 30,
};

interface BatteryManagerLike extends EventTarget {
  level: number;
  charging: boolean;
}

function playWarningBeep(isFinalZero: boolean) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isFinalZero ? 'sawtooth' : 'triangle';
    osc.frequency.value = isFinalZero ? 320 : 620;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (isFinalZero ? 0.35 : 0.16));
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    // Ignore Web Audio restriction errors
  }
}

export function QuizSection({
  subject,
  sectionKind,
  initialTopicDrill = null,
  lang,
  userProfile,
  history = [],
  onOpenGuide,
  onRecordAttempt,
  onRunningStateChange,
  registerFinishQuiz,
}: QuizSectionProps) {
  const copy = UI_COPY[lang];
  const isExamSection = sectionKind === 'exam';
  const warningsPaused = useWarningsPaused() || !isExamSection;
  const warningsPausedRef = useRef<boolean>(warningsPaused);
  warningsPausedRef.current = warningsPaused;

  const isStudent = userProfile?.role !== 'teacher' && userProfile?.role !== 'owner';
  const enforceAssignment = isExamSection && isStudent;

  const [testScope, setTestScope] = useState<'variants' | 'topics'>('variants');
  const [selectedTopic, setSelectedTopic] = useState<string>(() => subject.topics[0] ?? '');
  const [topicVariant, setTopicVariant] = useState<number>(1);
  const lastHandledDrillNonceRef = useRef<number>(0);

  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [variant, setVariant] = useState<VariantSelection>(1);
  const [subjectAssignments, setSubjectAssignments] = useState<
    Partial<Record<DifficultyLevel, AssignedSlot>>
  >({});
  const [assignmentsLoaded, setAssignmentsLoaded] = useState<boolean>(!enforceAssignment);

  const [retakeInput, setRetakeInput] = useState<string>('');
  const [retakeBusy, setRetakeBusy] = useState<boolean>(false);
  const [retakeError, setRetakeError] = useState<string | null>(null);
  const [retakeSuccess, setRetakeSuccess] = useState<string | null>(null);
  const autoSentCodesRef = useRef<Set<string>>(new Set());

  const activeBuiltRef = useRef<{
    subjectId: SubjectId;
    diff: DifficultyLevel;
    variant: number;
  } | null>(null);

  const activeAssignment: AssignedSlot | null = enforceAssignment
    ? (subjectAssignments[difficulty] ?? null)
    : null;
  const assignedVariant: number | null = activeAssignment?.variant ?? null;

  const effectiveAllowed = activeAssignment?.attemptsAllowed ?? 1;
  const effectiveUsed = useMemo(() => {
    if (!enforceAssignment || !activeAssignment) return 0;
    if (activeAssignment.hasExplicitCounters) {
      return activeAssignment.attemptsUsed;
    }
    const vLabelUz = getVariantLabel(activeAssignment.variant, 'uz');
    const vLabelEn = getVariantLabel(activeAssignment.variant, 'en');
    const hasLegacyAttempt = history.some(
      (rec) =>
        rec.subjectId === subject.id &&
        rec.mode === 'exam' &&
        rec.difficulty === difficulty &&
        (rec.variant === vLabelUz || rec.variant === vLabelEn)
    );
    return hasLegacyAttempt ? Math.max(activeAssignment.attemptsUsed, 1) : activeAssignment.attemptsUsed;
  }, [enforceAssignment, activeAssignment, history, subject.id, difficulty]);

  const hasAttemptsLeft =
    !enforceAssignment || (activeAssignment !== null && effectiveUsed < effectiveAllowed);

  const assignedDifficulties = useMemo(
    () => DIFFICULTY_LEVELS.filter((lvl) => subjectAssignments[lvl] !== undefined),
    [subjectAssignments]
  );

  const difficultyRef = useRef<DifficultyLevel>(difficulty);
  difficultyRef.current = difficulty;

  useEffect(() => {
    setRetakeInput('');
    setRetakeError(null);
    setRetakeSuccess(null);
  }, [subject.id, difficulty, sectionKind]);

  useEffect(() => {
    if (!enforceAssignment || !userProfile) {
      setSubjectAssignments({});
      setAssignmentsLoaded(true);
      activeBuiltRef.current = null;
      return;
    }

    setSubjectAssignments({});
    setAssignmentsLoaded(false);
    activeBuiltRef.current = null;

    const isIbrohim =
      userProfile.email?.toLowerCase() === STUDENT_EMAIL ||
      userProfile.username.toLowerCase().includes('ibrohim');

    const primaryMap: Partial<Record<DifficultyLevel, AssignedSlot>> = {};
    const fallbackMap: Partial<Record<DifficultyLevel, AssignedSlot>> = {};
    const firedKeys = new Set<string>();
    const totalExpected = DIFFICULTY_LEVELS.length * (isIbrohim ? 2 : 1);
    let didAutoSelectForSubject = false;

    const parseSlot = (
      docId: string,
      studentUidFallback: string,
      data: {
        studentUid?: string;
        variant?: number;
        attemptsAllowed?: number;
        attemptsUsed?: number;
        retakeCodePending?: boolean;
      }
    ): AssignedSlot | null => {
      if (typeof data.variant !== 'number') return null;
      const hasExplicitCounters =
        typeof data.attemptsAllowed === 'number' && typeof data.attemptsUsed === 'number';
      return {
        docId,
        studentUid: data.studentUid || studentUidFallback,
        variant: data.variant,
        attemptsAllowed: typeof data.attemptsAllowed === 'number' ? data.attemptsAllowed : 1,
        attemptsUsed: typeof data.attemptsUsed === 'number' ? data.attemptsUsed : 0,
        hasExplicitCounters,
        retakeCodePending: data.retakeCodePending === true,
      };
    };

    const syncAssignments = () => {
      const merged: Partial<Record<DifficultyLevel, AssignedSlot>> = {};
      for (const lvl of DIFFICULTY_LEVELS) {
        const slot = primaryMap[lvl] ?? fallbackMap[lvl];
        if (slot) {
          merged[lvl] = slot;
        }
      }
      setSubjectAssignments(merged);

      const allReady = firedKeys.size >= totalExpected;
      if (allReady) {
        setAssignmentsLoaded(true);
      }

      const currentDiff = difficultyRef.current;
      let targetDiff = currentDiff;
      if (allReady && !didAutoSelectForSubject && merged[currentDiff] === undefined) {
        const firstAssigned = DIFFICULTY_LEVELS.find((l) => merged[l] !== undefined);
        if (firstAssigned) {
          targetDiff = firstAssigned;
          setDifficulty(firstAssigned);
        }
        didAutoSelectForSubject = true;
      } else if (allReady) {
        didAutoSelectForSubject = true;
      }

      const resolvedSlot = merged[targetDiff] ?? null;
      if (resolvedSlot !== null) {
        const prevBuilt = activeBuiltRef.current;
        const assignmentIdentityChanged =
          !prevBuilt ||
          prevBuilt.subjectId !== subject.id ||
          prevBuilt.diff !== targetDiff ||
          prevBuilt.variant !== resolvedSlot.variant;

        if (assignmentIdentityChanged) {
          activeBuiltRef.current = {
            subjectId: subject.id,
            diff: targetDiff,
            variant: resolvedSlot.variant,
          };
          setVariant(resolvedSlot.variant);
          setQuestions(buildVariantQuestions(subject, 'exam', resolvedSlot.variant));
          setAnswers({});
          setCurrentIndex(0);
          setStarted(false);
          setSubmitted(false);
        }
      } else if (allReady) {
        activeBuiltRef.current = null;
        setStarted(false);
        setSubmitted(false);
      }
    };

    const unsubs: Array<() => void> = [];

    for (const lvl of DIFFICULTY_LEVELS) {
      const primaryKey = `p_${lvl}`;
      const primaryDocId = `${userProfile.uid}_${subject.id}_${lvl}`;
      const primaryRef = doc(db, 'studentAssignments', primaryDocId);
      unsubs.push(
        onSnapshot(
          primaryRef,
          (snap) => {
            if (snap.exists()) {
              const slot = parseSlot(
                primaryDocId,
                userProfile.uid,
                snap.data() as {
                  studentUid?: string;
                  variant?: number;
                  attemptsAllowed?: number;
                  attemptsUsed?: number;
                  retakeCodePending?: boolean;
                }
              );
              if (slot) {
                primaryMap[lvl] = slot;
              } else {
                delete primaryMap[lvl];
              }
            } else {
              delete primaryMap[lvl];
            }
            firedKeys.add(primaryKey);
            syncAssignments();
          },
          () => {
            delete primaryMap[lvl];
            firedKeys.add(primaryKey);
            syncAssignments();
          }
        )
      );

      if (isIbrohim) {
        const fallbackKey = `f_${lvl}`;
        const fallbackDocId = `student_ibrohimbek_profile_${subject.id}_${lvl}`;
        const fallbackRef = doc(db, 'studentAssignments', fallbackDocId);
        unsubs.push(
          onSnapshot(
            fallbackRef,
            (snap) => {
              if (snap.exists()) {
                const slot = parseSlot(
                  fallbackDocId,
                  'student_ibrohimbek_profile',
                  snap.data() as {
                    studentUid?: string;
                    variant?: number;
                    attemptsAllowed?: number;
                    attemptsUsed?: number;
                    retakeCodePending?: boolean;
                  }
                );
                if (slot) {
                  fallbackMap[lvl] = slot;
                } else {
                  delete fallbackMap[lvl];
                }
              } else {
                delete fallbackMap[lvl];
              }
              firedKeys.add(fallbackKey);
              syncAssignments();
            },
            () => {
              delete fallbackMap[lvl];
              firedKeys.add(fallbackKey);
              syncAssignments();
            }
          )
        );
      }
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [enforceAssignment, userProfile, subject]);

  const [questions, setQuestions] = useState<ActiveQuizQuestion[]>(() =>
    buildVariantQuestions(subject, sectionKind, 1)
  );
  const mode: QuizMode = isExamSection ? 'exam' : 'practice';
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong'>('all');
  const [rotationCount, setRotationCount] = useState<number>(0);
  const [pendingSwitchAction, setPendingSwitchAction] = useState<(() => void) | null>(null);

  const sendRetakeCodeToTeacher = useCallback(
    async (slot: AssignedSlot, forceUsedCount: number) => {
      if (!userProfile) return;
      const newCode = generateSixDigitCode();
      const batch = writeBatch(db);
      const codeRef = doc(db, 'retakeCodes', slot.docId);
      batch.set(codeRef, {
        id: slot.docId,
        assignmentId: slot.docId,
        studentUid: slot.studentUid,
        studentName: sanitizeDisplayName(userProfile.displayName, userProfile.username),
        subjectId: subject.id,
        difficulty,
        variant: slot.variant,
        code: newCode,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.update(
        doc(db, 'studentAssignments', slot.docId),
        slot.hasExplicitCounters
          ? {
              retakeCodePending: true,
              updatedAt: serverTimestamp(),
            }
          : {
              attemptsAllowed: 1,
              attemptsUsed: forceUsedCount,
              retakeCodePending: true,
              updatedAt: serverTimestamp(),
            }
      );
      await batch.commit();
    },
    [userProfile, subject.id, difficulty]
  );

  // Automatically send 6-digit unlock code to teachers once 1st attempt is finished or locked in Imtihon
  useEffect(() => {
    if (!enforceAssignment || !assignmentsLoaded || !activeAssignment) return;
    if (effectiveUsed < effectiveAllowed) {
      autoSentCodesRef.current.delete(activeAssignment.docId);
      return;
    }
    if (
      (started && !submitted) ||
      effectiveAllowed >= 2 ||
      activeAssignment.retakeCodePending
    ) {
      return;
    }
    if (autoSentCodesRef.current.has(activeAssignment.docId)) {
      return;
    }
    autoSentCodesRef.current.add(activeAssignment.docId);
    void sendRetakeCodeToTeacher(activeAssignment, Math.max(1, effectiveUsed)).catch((err) => {
      console.error('Failed to auto-dispatch retake code to teacher:', err);
    });
  }, [
    enforceAssignment,
    assignmentsLoaded,
    activeAssignment,
    started,
    submitted,
    effectiveUsed,
    effectiveAllowed,
    sendRetakeCodeToTeacher,
  ]);

  // Per-test anti-cheat focus / tab / desktop guard state (3 warnings, 3s grace period)
  const [warningsLeft, setWarningsLeft] = useState<number>(MAX_WARNINGS);
  const [isAway, setIsAway] = useState<boolean>(false);
  const [graceSecondsLeft, setGraceSecondsLeft] = useState<number>(GRACE_SECONDS);
  const [warningModal, setWarningModal] = useState<{
    remaining: number;
    deductedCount: number;
  } | null>(null);
  const [forcedZero, setForcedZero] = useState<boolean>(false);
  const [showForcedZeroOverlay, setShowForcedZeroOverlay] = useState<boolean>(false);
  const [fullscreenLost, setFullscreenLost] = useState<boolean>(false);
  const [securityViolationMsg, setSecurityViolationMsg] = useState<string | null>(null);

  const awayStartedAtRef = useRef<number | null>(null);
  const deductedThisAwayRef = useRef<number>(0);
  const basePenaltyThisAwayRef = useRef<number>(0);
  const warningsLeftRef = useRef<number>(MAX_WARNINGS);
  const submittedRef = useRef<boolean>(false);
  const blurConfirmTimerRef = useRef<number | null>(null);
  const wasFullscreenInTestRef = useRef<boolean>(false);
  const guardArmedAtRef = useRef<number>(0);
  const lastAwayPenaltyAtRef = useRef<number>(0);
  const lastScreenshotPenaltyRef = useRef<number>(0);
  const originalTitleRef = useRef<string>(
    typeof document !== 'undefined' ? document.title : 'Grade 7 ChSB'
  );

  // Camera proctoring state & permissions
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'requesting' | 'active' | 'denied' | 'error'
  >('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false);
  const [secretUsedIds, setSecretUsedIds] = useState<string[]>([]);
  const lastRafAtRef = useRef<number>(
    typeof performance !== 'undefined' ? performance.now() : 0
  );

  const requestCamera = useCallback(async (): Promise<boolean> => {
    if (cameraStream && cameraStream.active) {
      setCameraStatus('active');
      return true;
    }
    setCameraStatus('requesting');
    setCameraError(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error(
          lang === 'uz'
            ? 'Brauzeringizda veb-kamera funksiyasi mavjud emas'
            : 'Camera access is not supported by your browser'
        );
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (constraintErr: unknown) {
        const cName = (constraintErr as { name?: string })?.name;
        if (cName === 'NotAllowedError' || cName === 'PermissionDeniedError') {
          throw constraintErr;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
      setCameraStream(stream);
      setCameraStatus('active');
      return true;
    } catch (err: unknown) {
      const errName = (err as { name?: string })?.name;
      let msg =
        lang === 'uz'
          ? 'Kameraga ulanishda xatolik yuz berdi. Brauzer sozlamalarida kameraga ruxsat bering.'
          : 'Failed to access camera. Please allow camera permissions in browser settings.';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        msg =
          lang === 'uz'
            ? 'Kameradan foydalanish rad etildi. Brauzer manzillar panelidagi qulf belgisini bosib kameraga ruxsat bering.'
            : 'Camera access was denied. Please click the lock icon in the address bar to allow camera.';
        setCameraStatus('denied');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        msg =
          lang === 'uz'
            ? 'Kompyuteringizda veb-kamera topilmadi.'
            : 'No webcam was found on this computer.';
        setCameraStatus('error');
      } else {
        setCameraStatus('error');
      }
      setCameraError(msg);
      return false;
    }
  }, [cameraStream, lang]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const resetFocusGuard = useCallback(() => {
    if (blurConfirmTimerRef.current !== null) {
      window.clearTimeout(blurConfirmTimerRef.current);
      blurConfirmTimerRef.current = null;
    }
    awayStartedAtRef.current = null;
    deductedThisAwayRef.current = 0;
    basePenaltyThisAwayRef.current = 0;
    warningsLeftRef.current = MAX_WARNINGS;
    submittedRef.current = false;
    setWarningsLeft(MAX_WARNINGS);
    setIsAway(false);
    setGraceSecondsLeft(GRACE_SECONDS);
    setWarningModal(null);
    setForcedZero(false);
    setShowForcedZeroOverlay(false);
    setFullscreenLost(false);
    setSecurityViolationMsg(null);
    wasFullscreenInTestRef.current = isFullscreenActive();
    setPendingSwitchAction(null);
    if (typeof document !== 'undefined') {
      document.title = originalTitleRef.current;
    }
  }, []);

  // Reset quiz state whenever user switches subject or Test/Exam section
  useEffect(() => {
    const firstTopic = subject.topics[0] ?? '';
    setSelectedTopic(firstTopic);
    setTopicVariant(1);
    setTestScope('variants');

    if (enforceAssignment) {
      setAnswers({});
      setCurrentIndex(0);
      setStarted(false);
      setSubmitted(false);
      setElapsedSeconds(0);
      setReviewFilter('all');
      setRotationCount(0);
      setSecretUsedIds([]);
      resetFocusGuard();
      return;
    }

    const fresh = buildVariantQuestions(subject, sectionKind, 1);
    setVariant(1);
    setQuestions(fresh);
    setAnswers({});
    setCurrentIndex(0);
    setStarted(false);
    setSubmitted(false);
    setElapsedSeconds(0);
    setReviewFilter('all');
    setRotationCount(0);
    setSecretUsedIds([]);
    resetFocusGuard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject.id, sectionKind, enforceAssignment]);

  // Handle deep-link Topic Variant launch from StudyGuidePanel
  useEffect(() => {
    if (
      !initialTopicDrill ||
      sectionKind !== 'test' ||
      initialTopicDrill.subjectId !== subject.id ||
      initialTopicDrill.nonce === lastHandledDrillNonceRef.current
    ) {
      return;
    }
    lastHandledDrillNonceRef.current = initialTopicDrill.nonce;
    const validTopic = subject.topics.includes(initialTopicDrill.topic)
      ? initialTopicDrill.topic
      : (subject.topics[0] ?? '');
    if (!validTopic) return;
    const maxV = getTopicVariantCount(subject, validTopic);
    const safeV = Math.max(1, Math.min(maxV, initialTopicDrill.variant));

    setTestScope('topics');
    setSelectedTopic(validTopic);
    setTopicVariant(safeV);
    setQuestions(buildTopicVariantQuestions(subject, validTopic, safeV));
    setAnswers({});
    setCurrentIndex(0);
    setStarted(false);
    setSubmitted(false);
    setElapsedSeconds(0);
    setReviewFilter('all');
    setRotationCount((c) => c + 1);
    setSecretUsedIds([]);
    resetFocusGuard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopicDrill, subject.id, sectionKind]);

  const isTopicDrillActive = !isExamSection && testScope === 'topics';
  const totalDurationSeconds = isTopicDrillActive
    ? 15 * 60
    : (SUBJECT_DURATION_MINUTES[subject.id] ?? 30) * 60;
  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryCharging, setBatteryCharging] = useState<boolean>(false);
  const [batterySupported, setBatterySupported] = useState<boolean>(true);
  const [nowTime, setNowTime] = useState<Date>(() => new Date());

  // Live exam timer (runs only after user clicks Start)
  useEffect(() => {
    if (!started || submitted) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [started, submitted, subject.id, difficulty, variant, rotationCount]);

  // Live current clock (updates every second during active test)
  useEffect(() => {
    if (!started || submitted) return;
    setNowTime(new Date());
    const interval = window.setInterval(() => {
      setNowTime(new Date());
    }, 1000);
    return () => window.clearInterval(interval);
  }, [started, submitted]);

  // Live battery level & charging monitor (real Battery Status API, graceful fallback if unsupported)
  useEffect(() => {
    if (!started || submitted) return;
    let cancelled = false;
    let batteryRef: BatteryManagerLike | null = null;
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>;
    };

    const syncBattery = () => {
      if (!batteryRef || cancelled) return;
      setBatteryLevel(Math.round(batteryRef.level * 100));
      setBatteryCharging(Boolean(batteryRef.charging));
    };

    if (typeof nav.getBattery !== 'function') {
      setBatterySupported(false);
      setBatteryLevel(null);
      return;
    }

    setBatterySupported(true);
    nav
      .getBattery()
      .then((bat) => {
        if (cancelled) return;
        batteryRef = bat;
        syncBattery();
        bat.addEventListener('levelchange', syncBattery);
        bat.addEventListener('chargingchange', syncBattery);
      })
      .catch(() => {
        if (!cancelled) {
          setBatterySupported(false);
          setBatteryLevel(null);
        }
      });

    return () => {
      cancelled = true;
      if (batteryRef) {
        batteryRef.removeEventListener('levelchange', syncBattery);
        batteryRef.removeEventListener('chargingchange', syncBattery);
      }
    };
  }, [started, submitted]);

  // Auto-submit when countdown reaches 00:00
  useEffect(() => {
    if (!started || submitted) return;
    if (elapsedSeconds >= totalDurationSeconds) {
      finishHandlerRef.current();
    }
  }, [started, submitted, elapsedSeconds, totalDurationSeconds]);

  const startSession = (
    nextDiff: DifficultyLevel,
    nextVar: VariantSelection,
    prevIds: string[]
  ) => {
    const nextQuestions = buildVariantQuestions(subject, sectionKind, nextVar, prevIds);
    if (enforceAssignment && typeof nextVar === 'number') {
      activeBuiltRef.current = {
        subjectId: subject.id,
        diff: nextDiff,
        variant: nextVar,
      };
    } else if (!enforceAssignment) {
      activeBuiltRef.current = null;
    }
    setTestScope('variants');
    setDifficulty(nextDiff);
    setVariant(nextVar);
    setQuestions(nextQuestions);
    setAnswers({});
    setCurrentIndex(0);
    setStarted(false);
    setSubmitted(false);
    setElapsedSeconds(0);
    setReviewFilter('all');
    setRotationCount((c) => c + 1);
    setSecretUsedIds([]);
    setRetakeError(null);
    setRetakeSuccess(null);
    resetFocusGuard();
  };

  const startTopicSession = (topicName: string, tVariant: number) => {
    if (isExamSection) return;
    const nextQuestions = buildTopicVariantQuestions(subject, topicName, tVariant);
    activeBuiltRef.current = null;
    setTestScope('topics');
    setSelectedTopic(topicName);
    setTopicVariant(tVariant);
    setQuestions(nextQuestions);
    setAnswers({});
    setCurrentIndex(0);
    setStarted(false);
    setSubmitted(false);
    setElapsedSeconds(0);
    setReviewFilter('all');
    setRotationCount((c) => c + 1);
    setSecretUsedIds([]);
    setRetakeError(null);
    setRetakeSuccess(null);
    resetFocusGuard();
  };

  const guardSwitch = (action: () => void) => {
    if (started && !submitted) {
      setPendingSwitchAction(() => action);
      return;
    }
    action();
  };

  // Swap to next variant on Restart
  const handleStartOver = () => {
    if (enforceAssignment) return;
    guardSwitch(() => {
      if (isTopicDrillActive) {
        const maxTv = getTopicVariantCount(subject, selectedTopic);
        const nextTv = topicVariant < maxTv ? topicVariant + 1 : 1;
        startTopicSession(selectedTopic, nextTv);
        return;
      }
      const nextVar = getNextVariant(variant, subject.id);
      const prevIds = questions.map((q) => q.source.id);
      startSession(difficulty, nextVar, prevIds);
    });
  };

  const handleSelectDifficulty = (chosenDifficulty: DifficultyLevel) => {
    if (chosenDifficulty === difficulty && !submitted) return;
    guardSwitch(() => {
      const targetVar = enforceAssignment
        ? (subjectAssignments[chosenDifficulty]?.variant ?? 1)
        : variant;
      const prevIds = questions.map((q) => q.source.id);
      startSession(chosenDifficulty, targetVar, prevIds);
    });
  };

  const handleSelectVariant = (chosenVariant: VariantSelection) => {
    if (enforceAssignment) return; // Locked for students in Imtihon
    if (chosenVariant === variant && !isTopicDrillActive && !submitted) return;
    guardSwitch(() => {
      const prevIds = questions.map((q) => q.source.id);
      startSession(difficulty, chosenVariant, prevIds);
    });
  };

  const handleSelectTopicDrill = (topicName: string, tv: number) => {
    if (isExamSection) return;
    if (isTopicDrillActive && selectedTopic === topicName && topicVariant === tv && !submitted) {
      return;
    }
    guardSwitch(() => {
      startTopicSession(topicName, tv);
    });
  };

  const handleVerifyRetakeCode = async () => {
    if (!enforceAssignment || !activeAssignment) return;
    const cleaned = retakeInput.replace(/\s+/g, '').trim();
    if (!/^[0-9]{6}$/.test(cleaned)) {
      setRetakeError(
        lang === 'uz'
          ? 'Iltimos, ustozga borgan 6 xonali raqamli kodni kiriting.'
          : 'Please enter the 6-digit numeric code sent to your teacher.'
      );
      return;
    }

    setRetakeBusy(true);
    setRetakeError(null);
    setRetakeSuccess(null);

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'retakeCodes', activeAssignment.docId), {
        code: cleaned,
        status: 'used',
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'studentAssignments', activeAssignment.docId), {
        attemptsAllowed: effectiveAllowed + 1,
        retakeCodePending: false,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();

      setRetakeInput('');
      setRetakeSuccess(
        lang === 'uz'
          ? '2-urinish muvaffaqiyatli ochildi! Endi imtihonni boshlashingiz mumkin.'
          : '2nd attempt unlocked! You can now start your exam.'
      );
    } catch (err) {
      console.error('Retake code verification failed:', err);
      setRetakeError(
        lang === 'uz'
          ? 'Kod noto‘g‘ri yoki muddati tugagan! Ustozga borgan 6 xonali kodni tekshirib qayta kiriting.'
          : 'Incorrect or expired code! Check the 6-digit code with your teacher and try again.'
      );
    } finally {
      setRetakeBusy(false);
    }
  };

  const handleBeginTest = async () => {
    if (enforceAssignment && (!assignmentsLoaded || !activeAssignment || effectiveUsed >= effectiveAllowed)) {
      return;
    }
    if (!warningsPausedRef.current && cameraStatus !== 'active') {
      const ok = await requestCamera();
      if (!ok) return;
    }

    if (enforceAssignment && activeAssignment) {
      try {
        await updateDoc(
          doc(db, 'studentAssignments', activeAssignment.docId),
          activeAssignment.hasExplicitCounters
            ? {
                attemptsUsed: effectiveUsed + 1,
                updatedAt: serverTimestamp(),
              }
            : {
                attemptsAllowed: effectiveAllowed,
                attemptsUsed: effectiveUsed + 1,
                updatedAt: serverTimestamp(),
              }
        );
      } catch (err) {
        console.error('Failed to record attempt start:', err);
        setRetakeError(
          lang === 'uz'
            ? 'Urinishni boshlashda xatolik yuz berdi. Sahifani yangilab qayta urinib ko‘ring.'
            : 'Could not start attempt. Please refresh and try again.'
        );
        return;
      }
    }

    resetFocusGuard();
    setSecretUsedIds([]);
    guardArmedAtRef.current = Date.now() + 700;
    setElapsedSeconds(0);
    setStarted(true);
    if (!warningsPausedRef.current) {
      void requestAppFullscreen(true).then((entered) => {
        if (entered) {
          wasFullscreenInTestRef.current = true;
          guardArmedAtRef.current = Date.now() + 700;
          setFullscreenLost(false);
        }
      });
    }
  };

  const handleSelectOption = (displayIdx: number) => {
    if (!started || submitted) return;
    if (mode === 'practice' && answers[currentIndex] !== undefined) return;
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: displayIdx,
    }));
    const activeQ = questions[currentIndex];
    if (mode === 'practice' && activeQ) {
      playSound(isChoiceCorrect(activeQ, displayIdx) ? 'success' : 'warning');
    } else {
      playSound('click');
    }
  };

  const getAttemptVariantName = () => {
    if (isTopicDrillActive) {
      const topicIdx = Math.max(0, subject.topics.indexOf(selectedTopic));
      return `M${topicIdx + 1} · Variant ${topicVariant}`;
    }
    return getVariantLabel(variant, lang);
  };

  const handleSubmit = () => {
    if (submitted || submittedRef.current) return;
    submittedRef.current = true;
    awayStartedAtRef.current = null;
    if (blurConfirmTimerRef.current !== null) {
      window.clearTimeout(blurConfirmTimerRef.current);
      blurConfirmTimerRef.current = null;
    }
    setIsAway(false);
    setWarningModal(null);
    if (typeof document !== 'undefined') {
      document.title = originalTitleRef.current;
    }

    const totalQ = Math.max(1, questions.length);
    let correct = 0;
    questions.forEach((q, idx) => {
      if (isChoiceCorrect(q, answers[idx])) {
        correct += 1;
      }
    });
    const pct = Math.round((correct / totalQ) * 100);
    const { grade } = gradeOf(pct);

    onRecordAttempt({
      id: `${subject.id}-${Date.now()}`,
      subjectId: subject.id,
      difficulty,
      variant: getAttemptVariantName(),
      mode,
      score: correct,
      total: totalQ,
      percentage: pct,
      grade,
      elapsedSeconds,
      completedAt: new Date().toISOString(),
    });
    playSound('complete');
    setSubmitted(true);
  };

  // Keep latest callback for immediate zero-score termination when 3rd warning runs out
  const forceZeroSubmitRef = useRef<() => void>(() => {});
  forceZeroSubmitRef.current = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    awayStartedAtRef.current = null;
    if (blurConfirmTimerRef.current !== null) {
      window.clearTimeout(blurConfirmTimerRef.current);
      blurConfirmTimerRef.current = null;
    }
    warningsLeftRef.current = 0;
    setWarningsLeft(0);
    setIsAway(false);
    setWarningModal(null);
    setForcedZero(true);
    setShowForcedZeroOverlay(true);
    if (typeof document !== 'undefined') {
      document.title = originalTitleRef.current;
    }
    playWarningBeep(true);

    const totalQ = Math.max(1, questions.length);
    const { grade } = gradeOf(0);
    onRecordAttempt({
      id: `${subject.id}-${Date.now()}`,
      subjectId: subject.id,
      difficulty,
      variant: getAttemptVariantName(),
      mode,
      score: 0,
      total: totalQ,
      percentage: 0,
      grade,
      elapsedSeconds,
      completedAt: new Date().toISOString(),
      cheated: true,
    });
    setSubmitted(true);
  };

  const triggerInstantPenalty = useCallback(
    (reasonUz: string, reasonEn: string) => {
      if (submittedRef.current || warningsPausedRef.current) return;
      const now = Date.now();
      if (now - lastScreenshotPenaltyRef.current < 1000) return;
      if (now - lastAwayPenaltyAtRef.current < 800) return;
      lastScreenshotPenaltyRef.current = now;
      lastAwayPenaltyAtRef.current = now;

      try {
        void navigator.clipboard?.writeText?.('').catch(() => {});
      } catch {
        // Ignore clipboard errors
      }

      const nextWarnings = Math.max(0, warningsLeftRef.current - 1);
      warningsLeftRef.current = nextWarnings;
      setWarningsLeft(nextWarnings);
      if (nextWarnings <= 0) {
        forceZeroSubmitRef.current();
        return;
      }
      playWarningBeep(false);
      setSecurityViolationMsg(lang === 'uz' ? reasonUz : reasonEn);
    },
    [lang]
  );

  // Sync running state and submit callback with App navigation guard
  const finishHandlerRef = useRef<() => void>(() => {});
  finishHandlerRef.current = handleSubmit;
  const onRunningStateChangeRef = useRef(onRunningStateChange);
  onRunningStateChangeRef.current = onRunningStateChange;
  const registerFinishQuizRef = useRef(registerFinishQuiz);
  registerFinishQuizRef.current = registerFinishQuiz;

  useEffect(() => {
    const active = started && !submitted;
    onRunningStateChangeRef.current?.(active);
    registerFinishQuizRef.current?.(active ? () => finishHandlerRef.current() : null);
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('quiz-locked', active);
    }
    if (!active) {
      unlockSystemKeys();
    }
    return () => {
      onRunningStateChangeRef.current?.(false);
      registerFinishQuizRef.current?.(null);
      if (typeof document !== 'undefined') {
        document.body.classList.remove('quiz-locked');
      }
      unlockSystemKeys();
    };
  }, [started, submitted]);

  // Keyboard shortcuts during active quiz (A-D / 1-4 to select option, Left/Right arrows to navigate)
  useEffect(() => {
    if (!started || submitted || warningModal || pendingSwitchAction || calculatorOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      const mapOption: Record<string, number> = {
        '1': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        a: 0,
        b: 1,
        c: 2,
        d: 3,
      };

      if (key in mapOption) {
        const idx = mapOption[key];
        const currentQ = questions[currentIndex];
        if (!currentQ) return;
        if (mode === 'practice' && answers[currentIndex] !== undefined) return;
        e.preventDefault();
        setAnswers((prev) => ({
          ...prev,
          [currentIndex]: idx,
        }));
        if (mode === 'practice') {
          playSound(isChoiceCorrect(currentQ, idx) ? 'success' : 'warning');
        } else {
          playSound('click');
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(Math.max(0, questions.length - 1), i + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(0, i - 1));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    started,
    submitted,
    warningModal,
    pendingSwitchAction,
    calculatorOpen,
    questions,
    currentIndex,
    mode,
    answers,
  ]);

  // Monitor tab switching, window blur, virtual desktop, fullscreen exit, screenshots & system keys
  useEffect(() => {
    if (!started || submitted || warningsPaused) return;

    guardArmedAtRef.current = Date.now() + 700;
    wasFullscreenInTestRef.current = isFullscreenActive();

    lastRafAtRef.current = performance.now();
    let rafId = 0;
    let unmounted = false;

    const rafLoop = (now: number) => {
      if (unmounted) return;
      lastRafAtRef.current = now;
      rafId = window.requestAnimationFrame(rafLoop);
    };
    rafId = window.requestAnimationFrame(rafLoop);

    const startAwayTracking = (backdateMs = 0) => {
      if (submittedRef.current) return;
      if (awayStartedAtRef.current !== null) return;
      const now = Date.now();
      awayStartedAtRef.current = now - Math.max(0, backdateMs);

      if (now >= guardArmedAtRef.current && now - lastAwayPenaltyAtRef.current > 800) {
        lastAwayPenaltyAtRef.current = now;
        const nextWarnings = Math.max(0, warningsLeftRef.current - 1);
        warningsLeftRef.current = nextWarnings;
        setWarningsLeft(nextWarnings);
        if (nextWarnings <= 0) {
          forceZeroSubmitRef.current();
          return;
        }
        basePenaltyThisAwayRef.current = 1;
        deductedThisAwayRef.current = 1;
      } else {
        basePenaltyThisAwayRef.current = 0;
        deductedThisAwayRef.current = 0;
      }

      setIsAway(true);
      setGraceSecondsLeft(GRACE_SECONDS);
      playWarningBeep(false);
    };

    const stopAwayTracking = () => {
      if (blurConfirmTimerRef.current !== null) {
        window.clearTimeout(blurConfirmTimerRef.current);
        blurConfirmTimerRef.current = null;
      }
      if (awayStartedAtRef.current === null) return;

      const elapsedMs = Date.now() - awayStartedAtRef.current;
      const totalStepsNeeded =
        basePenaltyThisAwayRef.current + Math.floor(elapsedMs / (GRACE_SECONDS * 1000));
      if (totalStepsNeeded > deductedThisAwayRef.current) {
        const delta = totalStepsNeeded - deductedThisAwayRef.current;
        deductedThisAwayRef.current = totalStepsNeeded;
        const nextWarnings = Math.max(0, warningsLeftRef.current - delta);
        warningsLeftRef.current = nextWarnings;
        setWarningsLeft(nextWarnings);
        if (nextWarnings <= 0) {
          forceZeroSubmitRef.current();
          return;
        }
      }
      if (submittedRef.current) return;

      const lostCount = deductedThisAwayRef.current;
      awayStartedAtRef.current = null;
      deductedThisAwayRef.current = 0;
      basePenaltyThisAwayRef.current = 0;
      setIsAway(false);
      setGraceSecondsLeft(GRACE_SECONDS);
      document.title = originalTitleRef.current;

      if (lostCount > 0) {
        setWarningModal({
          remaining: warningsLeftRef.current,
          deductedCount: lostCount,
        });
      }
    };

    const tickAwayProgress = () => {
      if (submittedRef.current) return;

      const hiddenOrUnfocused =
        document.hidden ||
        document.visibilityState !== 'visible' ||
        !document.hasFocus();
      const rafGapMs = performance.now() - lastRafAtRef.current;
      const rafStalled = rafGapMs > 800;

      if (hiddenOrUnfocused || rafStalled) {
        if (awayStartedAtRef.current === null) {
          startAwayTracking(rafStalled ? Math.min(800, Math.floor(rafGapMs)) : 0);
        }
      } else if (
        awayStartedAtRef.current !== null &&
        (!wasFullscreenInTestRef.current || isFullscreenActive())
      ) {
        stopAwayTracking();
        return;
      }

      if (awayStartedAtRef.current === null) return;
      const elapsedMs = Date.now() - awayStartedAtRef.current;
      const timerSteps = Math.floor(elapsedMs / (GRACE_SECONDS * 1000));
      const totalStepsNeeded = basePenaltyThisAwayRef.current + timerSteps;

      if (totalStepsNeeded > deductedThisAwayRef.current) {
        const delta = totalStepsNeeded - deductedThisAwayRef.current;
        deductedThisAwayRef.current = totalStepsNeeded;
        const nextWarnings = Math.max(0, warningsLeftRef.current - delta);
        warningsLeftRef.current = nextWarnings;
        setWarningsLeft(nextWarnings);

        if (nextWarnings <= 0) {
          forceZeroSubmitRef.current();
          return;
        }
        playWarningBeep(false);
      }

      const nextBoundaryMs = (timerSteps + 1) * GRACE_SECONDS * 1000;
      const secLeft = Math.max(1, Math.ceil((nextBoundaryMs - elapsedMs) / 1000));
      setGraceSecondsLeft(secLeft);
      document.title =
        lang === 'uz'
          ? `⚠️ (${secLeft}s) Testga qayting! — ${warningsLeftRef.current}/${MAX_WARNINGS}`
          : `⚠️ (${secLeft}s) Return to quiz! — ${warningsLeftRef.current}/${MAX_WARNINGS}`;
    };

    const handleVisibilityChange = () => {
      if (submittedRef.current) return;
      if (document.hidden || document.visibilityState !== 'visible') {
        startAwayTracking();
        tickAwayProgress();
      } else if (document.hasFocus()) {
        stopAwayTracking();
      }
    };

    const handleWindowBlur = () => {
      if (submittedRef.current) return;
      if (blurConfirmTimerRef.current !== null) {
        window.clearTimeout(blurConfirmTimerRef.current);
      }
      // Immediate cover and penalty when losing focus (blocks virtual desktop switches, Ask Gemini, Snipping Tool, etc.)
      startAwayTracking();
      tickAwayProgress();
    };

    const handleFocusOut = () => {
      if (submittedRef.current) return;
      window.setTimeout(() => {
        if (!submittedRef.current && (!document.hasFocus() || document.hidden)) {
          startAwayTracking();
          tickAwayProgress();
        }
      }, 40);
    };

    const handleWindowFocus = () => {
      if (submittedRef.current) return;
      lastRafAtRef.current = performance.now();
      if (!document.hidden && document.hasFocus()) {
        stopAwayTracking();
      }
    };

    const handleFullscreenChange = () => {
      if (submittedRef.current) return;
      if (isFullscreenActive()) {
        wasFullscreenInTestRef.current = true;
        guardArmedAtRef.current = Date.now() + 500;
        setFullscreenLost(false);
        lastRafAtRef.current = performance.now();
        if (!document.hidden && document.hasFocus()) {
          stopAwayTracking();
        }
      } else if (wasFullscreenInTestRef.current) {
        setFullscreenLost(true);
        startAwayTracking();
        tickAwayProgress();
      }
    };

    const handleKeyGuard = (e: KeyboardEvent) => {
      if (submittedRef.current) return;
      const keyLower = (e.key || '').toLowerCase();
      const isPrintScreen =
        e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44;
      const isMetaOrWin =
        e.key === 'Meta' ||
        e.key === 'OS' ||
        e.code === 'MetaLeft' ||
        e.code === 'MetaRight' ||
        e.metaKey;
      const isAltTab = e.altKey && (e.key === 'Tab' || e.code === 'Tab');
      const isVirtualDesktopCombo =
        (isMetaOrWin && (e.ctrlKey || e.key === 'Tab' || e.code === 'Tab' || keyLower === 'd')) ||
        (e.ctrlKey && e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'));
      const isBlockedCtrlCombo =
        e.ctrlKey &&
        (['p', 's', 'u', 'c', 'x', 'a', 'g'].includes(keyLower) ||
          (e.shiftKey && ['i', 'j', 'c', 's'].includes(keyLower)));
      const isSystemNavKey = e.key === 'Escape' || e.key === 'F11' || e.key === 'F12';

      if (
        isPrintScreen ||
        isMetaOrWin ||
        isAltTab ||
        isVirtualDesktopCombo ||
        isBlockedCtrlCombo ||
        isSystemNavKey
      ) {
        e.preventDefault();
        e.stopPropagation();
      }

      const isScreenshotOrSystemCombo =
        isPrintScreen ||
        isMetaOrWin ||
        isAltTab ||
        isVirtualDesktopCombo ||
        (e.ctrlKey && e.shiftKey && keyLower === 's') ||
        (e.ctrlKey && keyLower === 'p') ||
        (isMetaOrWin && e.shiftKey && ['3', '4', '5', 's'].includes(keyLower));

      if (isScreenshotOrSystemCombo) {
        triggerInstantPenalty(
          'Skrinshot olish, boshqa desktop/oynaga o‘tish (Win+Ctrl+Arrow, Win+Tab, Alt+Tab) yoki Win tugmalarini bosish taqiqlanadi! 1 ta ogohlantirish olib tashlandi.',
          'Screenshots, switching desktops/windows (Win+Ctrl+Arrow, Win+Tab, Alt+Tab), and Win keys are prohibited! 1 warning was deducted.'
        );
      }
    };

    const preventAction = (e: Event) => {
      e.preventDefault();
    };

    const intervalId = window.setInterval(tickAwayProgress, 200);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('freeze', handleWindowBlur);
    window.addEventListener('pagehide', handleWindowBlur);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('keydown', handleKeyGuard, { capture: true });
    window.addEventListener('keyup', handleKeyGuard, { capture: true });
    document.addEventListener('contextmenu', preventAction, { capture: true });
    document.addEventListener('copy', preventAction, { capture: true });
    document.addEventListener('cut', preventAction, { capture: true });
    document.addEventListener('selectstart', preventAction, { capture: true });
    document.addEventListener('dragstart', preventAction, { capture: true });

    return () => {
      unmounted = true;
      window.cancelAnimationFrame(rafId);
      window.clearInterval(intervalId);
      if (blurConfirmTimerRef.current !== null) {
        window.clearTimeout(blurConfirmTimerRef.current);
        blurConfirmTimerRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('freeze', handleWindowBlur);
      window.removeEventListener('pagehide', handleWindowBlur);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('keydown', handleKeyGuard, { capture: true });
      window.removeEventListener('keyup', handleKeyGuard, { capture: true });
      document.removeEventListener('contextmenu', preventAction, { capture: true });
      document.removeEventListener('copy', preventAction, { capture: true });
      document.removeEventListener('cut', preventAction, { capture: true });
      document.removeEventListener('selectstart', preventAction, { capture: true });
      document.removeEventListener('dragstart', preventAction, { capture: true });
      document.title = originalTitleRef.current;
    };
  }, [started, submitted, warningsPaused, lang, subject.id, difficulty, variant, rotationCount, triggerInstantPenalty]);

  const answeredCount = Object.keys(answers).length;
  const activeQuestion = questions[currentIndex];
  const variantChoices = useMemo(() => getVariantChoices(subject.id), [subject.id]);

  const MAX_SECRET_USES = 5;
  const isMathActiveQuiz =
    subject.id === 'math' && started && !submitted && Boolean(activeQuestion);
  const activeQuestionId = activeQuestion?.source.id ?? '';
  const secretRemaining = Math.max(0, MAX_SECRET_USES - secretUsedIds.length);
  const canRevealActiveMath =
    isMathActiveQuiz &&
    (secretUsedIds.includes(activeQuestionId) || secretRemaining > 0);

  const handleSecretCodeUsed = useCallback(() => {
    if (!isMathActiveQuiz || !activeQuestionId) return;
    setSecretUsedIds((prev) => {
      if (prev.includes(activeQuestionId) || prev.length >= MAX_SECRET_USES) {
        return prev;
      }
      return [...prev, activeQuestionId];
    });
  }, [isMathActiveQuiz, activeQuestionId]);

  const secretMathAnswer = useMemo(() => {
    if (!canRevealActiveMath || !activeQuestion) {
      return null;
    }
    const opts = getLocalizedOptions(activeQuestion.source.opts, lang);
    const correctDisp = getCorrectDisplayIndex(activeQuestion);
    const correctText = opts[activeQuestion.optionOrder[correctDisp]];
    return `${OPTION_LETTERS[correctDisp]}. ${correctText}`;
  }, [canRevealActiveMath, activeQuestion, lang]);

  const resultsSummary = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    const topicMap = new Map<string, { ok: number; total: number }>();

    questions.forEach((q, idx) => {
      const entry = topicMap.get(q.source.topic) ?? { ok: 0, total: 0 };
      entry.total += 1;
      if (isChoiceCorrect(q, answers[idx])) {
        correct += 1;
        entry.ok += 1;
      }
      topicMap.set(q.source.topic, entry);
    });

    const totalQ = Math.max(1, questions.length);
    const finalCorrect = forcedZero ? 0 : correct;
    const percentage = Math.round((finalCorrect / totalQ) * 100);
    const gradeInfo = gradeOf(percentage);
    const topicRows = Array.from(topicMap.entries()).map(([topic, stat]) => ({
      topic,
      ok: stat.ok,
      total: stat.total,
      pct: Math.round((stat.ok / stat.total) * 100),
    }));

    return { correct: finalCorrect, percentage, gradeInfo, topicRows };
  }, [submitted, questions, answers, forcedZero]);

  return (
    <section className="space-y-5">
      {/* Active Test Telemetry Bar (Battery, Clock, Animated Deadline Timer, Calculator) */}
      {started && !submitted ? (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-start">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
              {!batterySupported || batteryLevel === null ? (
                <Battery className="h-4 w-4 text-slate-400" aria-hidden="true" />
              ) : batteryCharging ? (
                <BatteryCharging className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : batteryLevel <= 20 ? (
                <BatteryLow className="h-4 w-4 text-rose-600" aria-hidden="true" />
              ) : (
                <Battery className="h-4 w-4 text-teal-700" aria-hidden="true" />
              )}
              <span className="text-xs font-medium text-slate-500">
                {lang === 'uz' ? 'Zaryad:' : 'Battery:'}
              </span>
              <span
                className={`font-mono-num font-bold ${
                  batteryLevel !== null && batteryLevel <= 20 && !batteryCharging
                    ? 'text-rose-700'
                    : batteryCharging
                      ? 'text-emerald-700'
                      : 'text-slate-900'
                }`}
              >
                {batterySupported && batteryLevel !== null
                  ? `${batteryLevel}%`
                  : 'N/A'}
              </span>
            </div>

            <span className="hidden h-4 w-px bg-slate-200 sm:inline-block" aria-hidden="true" />

            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Clock className="h-4 w-4 text-slate-600" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-500">
                {lang === 'uz' ? 'Soat:' : 'Time:'}
              </span>
              <span className="font-mono-num font-bold text-slate-900">
                {nowTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCalculatorOpen((open) => !open)}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 lg:hidden ${
                calculatorOpen
                  ? 'border-teal-700 bg-teal-50 text-teal-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Calculator className="h-4 w-4 text-teal-700" aria-hidden="true" />
              <span>{lang === 'uz' ? 'Kalkulyator' : 'Calculator'}</span>
            </button>
          </div>

          <div className="flex justify-center">
            <DeadlineTimer
              totalSeconds={totalDurationSeconds}
              remainingSeconds={remainingSeconds}
              formattedTime={formatTime(remainingSeconds)}
              lang={lang}
            />
          </div>

          <div className="hidden lg:flex lg:items-center lg:justify-end">
            <button
              type="button"
              onClick={() => setCalculatorOpen((open) => !open)}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg border px-4 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                calculatorOpen
                  ? 'border-teal-700 bg-teal-50 text-teal-800'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Calculator className="h-4 w-4 text-teal-700" aria-hidden="true" />
              <span>{lang === 'uz' ? 'Kalkulyator' : 'Calculator'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                  isExamSection
                    ? 'bg-slate-900 text-white'
                    : 'bg-teal-50 text-teal-800 ring-1 ring-teal-200'
                }`}
              >
                {isExamSection
                  ? lang === 'uz'
                    ? 'Rasmiy Imtihon (ChSB) · 20 alohida variant'
                    : 'Official Exam (ChSB) · 20 Dedicated Variants'
                  : lang === 'uz'
                    ? 'Test mashq bo‘limi · 20 variant + Mavzu testlari'
                    : 'Practice Test Section · 20 Variants + Topic Drills'}
              </span>
              <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-slate-900">
                {pickText(subject.title, lang)}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {pickText(subject.subtitle, lang)} · {pickText(subject.questionLangNote, lang)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCalculatorOpen((open) => !open)}
                className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  calculatorOpen
                    ? 'border-teal-700 bg-teal-50 text-teal-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calculator className="h-4 w-4 text-teal-700" aria-hidden="true" />
                <span>{lang === 'uz' ? 'Kalkulyator' : 'Calculator'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenGuide}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <BookOpen className="h-4 w-4 text-teal-700" aria-hidden="true" />
                <span>{copy.navGuide}</span>
              </button>

              {!enforceAssignment && (
                <button
                  type="button"
                  onClick={handleStartOver}
                  title={copy.startOverHint}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>{copy.startOver}</span>
                </button>
              )}
            </div>
          </div>

          {isExamSection ? (
            <>
              {/* Exam Section: Difficulty tier (for teacher assignment matching) */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {copy.difficultyLabel}:
                  </span>
                  <div
                    role="group"
                    aria-label={copy.difficultyLabel}
                    className="inline-flex flex-wrap rounded-lg bg-slate-100 p-0.5"
                  >
                    {DIFFICULTY_LEVELS.map((lvl) => {
                      const active = difficulty === lvl;
                      const assignedForLvl = enforceAssignment ? subjectAssignments[lvl] : undefined;
                      const isLockedLvl =
                        enforceAssignment && assignmentsLoaded && assignedForLvl === undefined;
                      const activeColor =
                        lvl === 'easy'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : lvl === 'medium'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-rose-700 text-white shadow-xs';
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleSelectDifficulty(lvl)}
                          className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-md px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 sm:text-sm ${
                            active ? activeColor : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>{getDifficultyLabel(lvl, lang)}</span>
                          {enforceAssignment && assignedForLvl !== undefined && (
                            <span className="rounded bg-black/15 px-1.5 py-0.5 text-[10px] font-bold">
                              V{assignedForLvl.variant}
                            </span>
                          )}
                          {isLockedLvl && (
                            <Lock className="h-3 w-3 opacity-70" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                  <span>{copy.modeExam}</span>
                </span>
              </div>

              {/* 20 Dedicated Exam Variants */}
              <div className="mt-3 border-t border-slate-100 pt-3">
                {enforceAssignment && !assignmentsLoaded && (
                  <div className="mb-2.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    <span>
                      {lang === 'uz'
                        ? 'Biriktirilgan imtihon varianti tekshirilmoqda...'
                        : 'Checking assigned exam variant...'}
                    </span>
                  </div>
                )}
                {enforceAssignment && assignmentsLoaded && assignedVariant === null && (
                  <div className="mb-2.5 rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-xs font-semibold text-rose-900">
                    {lang === 'uz'
                      ? `🔒 Sizga ${pickText(subject.shortLabel, lang)} Imtihon bo‘limida "${getDifficultyLabel(difficulty, lang)}" darajasi uchun variant biriktirilmagan. Test bo‘limida erkin mashq qilishingiz mumkin.`
                      : `🔒 No exam variant is assigned to you for ${pickText(subject.shortLabel, lang)} (${getDifficultyLabel(difficulty, lang)}). You can still practice freely in the Test section.`}
                  </div>
                )}
                {enforceAssignment && assignedVariant !== null && (
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs font-semibold text-amber-900">
                    <span>
                      {lang === 'uz'
                        ? `🔒 Ustozingiz sizga Imtihon uchun faqat ${getVariantLabel(assignedVariant, lang)}ni biriktirgan.`
                        : `🔒 Your teacher assigned ${getVariantLabel(assignedVariant, lang)} for this exam tier.`}
                    </span>
                    <span
                      className={`font-mono-num rounded px-2 py-0.5 text-[11px] font-bold ${
                        hasAttemptsLeft
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {lang === 'uz'
                        ? `Urinish: ${effectiveUsed}/${effectiveAllowed}`
                        : `Attempts: ${effectiveUsed}/${effectiveAllowed}`}
                    </span>
                  </div>
                )}
                <div
                  role="group"
                  aria-label={lang === 'uz' ? 'Imtihon variantlari' : 'Exam Variants'}
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {variantChoices.map((v) => {
                    const isAssigned =
                      enforceAssignment && assignedVariant !== null && assignedVariant === v;
                    const active = enforceAssignment ? isAssigned : variant === v;
                    return (
                      <button
                        key={String(v)}
                        type="button"
                        disabled={enforceAssignment}
                        onClick={() => handleSelectVariant(v)}
                        className={`min-h-[34px] rounded-lg px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                          active
                            ? isAssigned
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                        } ${enforceAssignment ? 'cursor-not-allowed opacity-75' : ''}`}
                      >
                        {getVariantLabel(v, lang)} {isAssigned ? '🔒' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Test Practice Section: 20 Full Variants vs Per-Topic Variants (3 each) */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div
                  role="tablist"
                  aria-label={lang === 'uz' ? 'Test turi' : 'Test Mode Type'}
                  className="inline-flex flex-wrap rounded-lg bg-slate-100 p-0.5"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={testScope === 'variants'}
                    onClick={() =>
                      guardSwitch(() => startSession(difficulty, typeof variant === 'number' ? variant : 1, []))
                    }
                    className={`min-h-[36px] rounded-md px-3.5 text-xs font-semibold transition-colors sm:text-sm ${
                      testScope === 'variants'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'uz'
                      ? `${VARIANTS_PER_SECTION} ta Variant (25 savol)`
                      : `${VARIANTS_PER_SECTION} Variants (25 Qs)`}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={testScope === 'topics'}
                    onClick={() =>
                      guardSwitch(() => startTopicSession(selectedTopic || subject.topics[0], 1))
                    }
                    className={`min-h-[36px] rounded-md px-3.5 text-xs font-semibold transition-colors sm:text-sm ${
                      testScope === 'topics'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'uz'
                      ? `Mavzu testlari (${subject.topics.length} × 3 variant)`
                      : `Topic Drills (${subject.topics.length} × 3 Variants)`}
                  </button>
                </div>

                <span className="inline-flex items-center rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
                  {copy.modePractice}
                </span>
              </div>

              {testScope === 'variants' ? (
                <div
                  role="group"
                  aria-label={lang === 'uz' ? 'Test variantlari' : 'Practice Variants'}
                  className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3"
                >
                  {variantChoices.map((v) => {
                    const active = variant === v;
                    return (
                      <button
                        key={String(v)}
                        type="button"
                        onClick={() => handleSelectVariant(v)}
                        className={`min-h-[34px] rounded-lg px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                          active
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        {getVariantLabel(v, lang)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subject.topics.map((topicName, tIdx) => {
                    const tvCount = getTopicVariantCount(subject, topicName);
                    const isTopicSelected = selectedTopic === topicName;
                    return (
                      <div
                        key={topicName}
                        className={`flex flex-col justify-between gap-2 rounded-lg border p-3 transition-colors ${
                          isTopicSelected
                            ? 'border-teal-300 bg-teal-50/50'
                            : 'border-slate-200 bg-slate-50/60'
                        }`}
                      >
                        <p className="text-xs font-bold leading-snug text-slate-800">
                          <span className="font-mono-num mr-1.5 text-teal-700">
                            {String(tIdx + 1).padStart(2, '0')}.
                          </span>
                          {topicName}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Array.from({ length: tvCount }, (_, i) => i + 1).map((tv) => {
                            const activeTv = isTopicSelected && topicVariant === tv;
                            return (
                              <button
                                key={tv}
                                type="button"
                                onClick={() => handleSelectTopicDrill(topicName, tv)}
                                className={`min-h-[28px] rounded-md px-2.5 text-[11px] font-semibold transition-colors ${
                                  activeTv
                                    ? 'bg-teal-700 text-white shadow-xs'
                                    : 'border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'
                                }`}
                              >
                                V{tv} ({QUESTIONS_PER_TOPIC_VARIANT})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className="font-mono-num mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500">
            <span>
              {isTopicDrillActive
                ? `${selectedTopic} · Variant ${topicVariant}`
                : `${isExamSection ? getDifficultyLabel(difficulty, lang) + ' · ' : ''}${
                    !enforceAssignment || assignedVariant !== null
                      ? getVariantLabel(variant, lang)
                      : lang === 'uz'
                        ? 'Variant biriktirilmagan'
                        : 'No variant assigned'
                  }`}{' '}
              · {questions.length} {lang === 'uz' ? 'savol' : 'questions'} ·{' '}
              {Math.round(totalDurationSeconds / 60)} {lang === 'uz' ? 'daq' : 'min'}
            </span>
            <div className="flex flex-wrap items-center gap-4">
              {!warningsPaused && (
                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${
                    warningsLeft === 3
                      ? 'text-emerald-700'
                      : warningsLeft === 2
                        ? 'text-amber-700'
                        : 'text-rose-700'
                  }`}
                  title={
                    lang === 'uz'
                      ? 'Boshqa oyna, sayt yoki desktopga o‘tsangiz darhol 1 ta ogohlantirish kamayadi'
                      : 'Switching windows, tabs, or desktops immediately deducts 1 warning'
                  }
                >
                  {warningsLeft === MAX_WARNINGS ? (
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>
                    {lang === 'uz' ? 'Ogohlantirish' : 'Warnings'}: {warningsLeft}/{MAX_WARNINGS}
                  </span>
                </span>
              )}
              <span>
                {copy.timeLabel}: {formatTime(submitted ? elapsedSeconds : totalDurationSeconds)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Red Away Countdown Overlay */}
      {started && !submitted && !warningsPaused && isAway && (
        <div
          role="alert"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-rose-700 p-6 text-center text-white"
        >
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-white">
              <AlertTriangle className="h-11 w-11" aria-hidden="true" />
            </div>

            <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              {lang === 'uz'
                ? 'DIQQAT! TEST OYNASIDAN CHIQIB KETDINGIZ!'
                : 'ATTENTION! YOU LEFT THE QUIZ WINDOW!'}
            </h2>

            <div className="font-mono-num mt-8 flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-white/80 bg-rose-800 text-6xl font-extrabold text-white shadow-2xl sm:h-40 sm:w-40 sm:text-7xl">
              {graceSecondsLeft}s
            </div>

            <p className="mt-8 max-w-xl text-lg font-semibold leading-relaxed text-rose-50 sm:text-xl">
              {lang === 'uz'
                ? `Test oynasidan chiqish taqiqlanadi! ${graceSecondsLeft} soniya ichida qaytmasangiz yana 1 ta ogohlantirish olib tashlanadi!`
                : `Leaving the quiz window is prohibited! Return within ${graceSecondsLeft} seconds or another warning will be deducted!`}
            </p>

            <div className="font-mono-num mt-5 rounded-xl border border-white/30 bg-rose-900/60 px-5 py-2.5 text-base font-bold text-white">
              {lang === 'uz' ? 'Qolgan ogohlantirishlar' : 'Warnings remaining'}: {warningsLeft} /{' '}
              {MAX_WARNINGS}
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Red Warning Deducted Overlay */}
      {started && !submitted && !warningsPaused && warningModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-rose-800/95 p-6 text-center text-white"
        >
          <div className="w-full max-w-xl rounded-2xl border-2 border-rose-300/60 bg-rose-950/90 p-8 shadow-2xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600 text-white">
              <ShieldAlert className="h-9 w-9" aria-hidden="true" />
            </div>

            <h2 className="mt-5 font-display text-2xl font-extrabold text-white sm:text-4xl">
              {lang === 'uz' ? 'TEST QOIDASI OGOHLANTIRISHI' : 'QUIZ FOCUS WARNING'}
            </h2>

            <p className="mt-4 text-base font-medium leading-relaxed text-rose-100 sm:text-lg">
              {lang === 'uz'
                ? `Boshqa sayt, oyna yoki desktopga o‘tganingiz uchun ${warningModal.deductedCount} ta ogohlantirish olib tashlandi.`
                : `You switched away from the test tab, window, or desktop, so ${warningModal.deductedCount} warning was deducted.`}
            </p>

            <div className="mt-6 rounded-xl border border-rose-400/50 bg-rose-900/70 p-4">
              <p className="font-mono-num text-lg font-extrabold text-white sm:text-xl">
                {lang === 'uz'
                  ? `Qolgan ogohlantirishlar: ${warningModal.remaining} / ${MAX_WARNINGS}`
                  : `Remaining warnings: ${warningModal.remaining} / ${MAX_WARNINGS}`}
              </p>
              <p className="mt-1.5 text-sm text-rose-100">
                {lang === 'uz'
                  ? 'Agar barcha 3 ta ogohlantirish tugasa, test shu zahoti yakunlanadi va natijangiz 0 bo‘ladi.'
                  : 'If all 3 warnings run out, the test ends immediately with a score of 0.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setWarningModal(null);
                guardArmedAtRef.current = Date.now() + 700;
                void requestAppFullscreen(true).then((entered) => {
                  if (entered) {
                    wasFullscreenInTestRef.current = true;
                    guardArmedAtRef.current = Date.now() + 700;
                    setFullscreenLost(false);
                  }
                });
              }}
              className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-white px-6 text-base font-extrabold text-rose-900 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {lang === 'uz' ? 'Tushunarli, testga qaytish' : 'Understood, continue quiz'}
            </button>
          </div>
        </div>
      )}

      {/* Full-Screen Red Security Shield (Screenshot / Win+G / Blocked Shortcut) */}
      {started && !submitted && !warningsPaused && securityViolationMsg && !isAway && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[105] flex flex-col items-center justify-center bg-rose-700 p-6 text-center text-white"
        >
          <div className="w-full max-w-xl rounded-2xl border-2 border-white/40 bg-rose-900/90 p-8 shadow-2xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white">
              <ShieldAlert className="h-9 w-9" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-extrabold text-white sm:text-4xl">
              {lang === 'uz' ? 'TAQIQLANGAN HARAKAT!' : 'PROHIBITED ACTION DETECTED!'}
            </h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-rose-100 sm:text-lg">
              {securityViolationMsg}
            </p>
            <div className="mt-5 rounded-xl border border-rose-300/40 bg-rose-950/60 p-3.5 font-mono-num text-lg font-extrabold text-white">
              {lang === 'uz' ? 'Qolgan ogohlantirishlar' : 'Remaining warnings'}: {warningsLeft} /{' '}
              {MAX_WARNINGS}
            </div>
            <button
              type="button"
              onClick={() => {
                setSecurityViolationMsg(null);
                guardArmedAtRef.current = Date.now() + 700;
                void requestAppFullscreen(true);
              }}
              className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-white px-6 text-base font-extrabold text-rose-900 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {lang === 'uz' ? 'Tushunarli, testga qaytish' : 'Understood, continue quiz'}
            </button>
          </div>
        </div>
      )}

      {/* Full-Screen Red Lock when user exits Fullscreen mid-test */}
      {started && !submitted && !warningsPaused && fullscreenLost && !isAway && !securityViolationMsg && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[105] flex flex-col items-center justify-center bg-rose-700 p-6 text-center text-white"
        >
          <div className="w-full max-w-xl rounded-2xl border-2 border-white/40 bg-rose-900/90 p-8 shadow-2xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white">
              <ShieldAlert className="h-9 w-9" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-extrabold text-white sm:text-4xl">
              {lang === 'uz'
                ? 'FULLSCREENDAN CHIQISH TAQIQLANADI!'
                : 'EXITING FULLSCREEN IS NOT ALLOWED!'}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-rose-100 sm:text-lg">
              {lang === 'uz'
                ? 'Testni davom ettirish uchun to‘liq ekran rejimiga qayting.'
                : 'Return to fullscreen mode to continue your test.'}
            </p>
            <button
              type="button"
              onClick={() => {
                guardArmedAtRef.current = Date.now() + 700;
                void requestAppFullscreen(true).then((entered) => {
                  if (entered) {
                    guardArmedAtRef.current = Date.now() + 700;
                    setFullscreenLost(false);
                  }
                });
              }}
              className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-white px-6 text-base font-extrabold text-rose-900 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {lang === 'uz' ? 'To‘liq ekranga qaytish' : 'Return to Fullscreen'}
            </button>
          </div>
        </div>
      )}

      {/* Full-Screen Red Forced-Zero Termination Overlay */}
      {submitted && forcedZero && showForcedZeroOverlay && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-rose-700 p-6 text-center text-white"
        >
          <div className="w-full max-w-xl rounded-2xl border-2 border-white/40 bg-rose-900/80 p-8 shadow-2xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white">
              <ShieldAlert className="h-9 w-9" aria-hidden="true" />
            </div>
            <p className="font-mono-num mt-5 text-5xl font-extrabold text-white sm:text-6xl">
              0 / {questions.length}
            </p>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">
              {lang === 'uz'
                ? 'TEST QOIDABUZARLIK SABABLI DARHOL TO‘XTATILDI!'
                : 'TEST IMMEDIATELY TERMINATED (SCORE: 0)'}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-rose-100">
              {lang === 'uz'
                ? `3 ta ogohlantirish ham sarflandi (boshqa oyna, sayt yoki desktopga o‘tildi). Ushbu test uchun natijangiz 0 / ${questions.length} (0%) qilib saqlandi.`
                : `All 3 warnings were used (you switched outside the test tab, window, or desktop). Your score was recorded as 0 / ${questions.length} (0%).`}
            </p>
            <button
              type="button"
              onClick={() => setShowForcedZeroOverlay(false)}
              className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-white px-6 text-base font-extrabold text-rose-900 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {lang === 'uz' ? 'Natijalarni ko‘rish' : 'View Results'}
            </button>
          </div>
        </div>
      )}

      {/* Confirm switching difficulty/variant mid-test: Cancel or Finish the test */}
      {started && !submitted && pendingSwitchAction && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="font-display text-lg font-extrabold text-slate-900">
              {lang === 'uz' ? 'Test hali yakunlanmadi' : 'Test still in progress'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {lang === 'uz'
                ? 'Hozir boshqa variant yoki darajaga o‘tsangiz, joriy test yakunlanadi va natijasi saqlanadi.'
                : 'Switching variants or difficulty now will finish and submit your current test.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingSwitchAction(null)}
                className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const act = pendingSwitchAction;
                  setPendingSwitchAction(null);
                  handleSubmit();
                  act();
                }}
                className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                Finish the test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ready-to-Start Screen OR Locked Assignment Gate OR Results View OR Active Workspace */}
      {!started ? (
        enforceAssignment && !assignmentsLoaded ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center sm:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-xl font-extrabold text-slate-900">
              {lang === 'uz'
                ? 'Biriktirilgan variantlar tekshirilmoqda...'
                : 'Checking assigned variants...'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              {lang === 'uz'
                ? 'Ustoz tomonidan biriktirilgan test varianti yuklanmoqda, biroz kuting.'
                : 'Please wait while we verify your assigned test variant.'}
            </p>
          </div>
        ) : enforceAssignment && assignedVariant === null ? (
          <div className="rounded-xl border-2 border-rose-200 bg-white p-8 text-center sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
              <Lock className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
              {assignedDifficulties.length === 0
                ? lang === 'uz'
                  ? `${pickText(subject.shortLabel, lang)}: Imtihon yopiq (Variant biriktirilmagan)`
                  : `${pickText(subject.shortLabel, lang)}: Exam Locked (No Variant Assigned)`
                : lang === 'uz'
                  ? `${getDifficultyLabel(difficulty, lang)} darajasi uchun imtihon varianti biriktirilmagan`
                  : `No exam variant assigned for ${getDifficultyLabel(difficulty, lang)}`}
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-slate-600">
              {assignedDifficulties.length === 0
                ? lang === 'uz'
                  ? `Ustozingiz sizga ${pickText(subject.shortLabel, lang)} Imtihon bo‘limida hali variant biriktirmagan. "Test" bo‘limida barcha 20 ta variant va mavzu testlarini erkin ishlashingiz mumkin.`
                  : `Your teacher has not assigned an exam variant in ${pickText(subject.shortLabel, lang)} yet. You can practice freely in the Test section.`
                : lang === 'uz'
                  ? `Sizga ${pickText(subject.shortLabel, lang)} fanidan "${getDifficultyLabel(difficulty, lang)}" darajasida variant biriktirilmagan. Faqat ustoz biriktirgan daraja va variantni ishlashingiz mumkin.`
                  : `You do not have an assigned variant for ${getDifficultyLabel(difficulty, lang)} in ${pickText(subject.shortLabel, lang)}.`}
            </p>

            {assignedDifficulties.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {lang === 'uz'
                    ? 'Sizga biriktirilgan daraja va variant:'
                    : 'Your assigned difficulty & variant:'}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
                  {assignedDifficulties.map((lvl) => {
                    const slot = subjectAssignments[lvl]!;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleSelectDifficulty(lvl)}
                        className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-bold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        <span>
                          {getDifficultyLabel(lvl, lang)} · {getVariantLabel(slot.variant, lang)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : enforceAssignment && activeAssignment !== null && effectiveUsed >= effectiveAllowed ? (
          <div className="rounded-xl border-2 border-indigo-200 bg-white p-8 text-center sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <KeyRound className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
              {lang === 'uz'
                ? `1-urinish yakunlangan — ${getVariantLabel(activeAssignment.variant, lang)} yopiq`
                : `Attempt Limit Reached — ${getVariantLabel(activeAssignment.variant, lang)} Locked`}
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-slate-600">
              {effectiveAllowed >= 2 && effectiveUsed >= effectiveAllowed
                ? lang === 'uz'
                  ? `Siz ushbu variant uchun barcha ${effectiveUsed}/${effectiveAllowed} ta urinishdan foydalandingiz. Yana ishlash uchun ustozdan yangi ruxsat/kod so‘rang.`
                  : `You have used all ${effectiveUsed}/${effectiveAllowed} attempts for this variant. Ask your teacher to issue a new code.`
                : lang === 'uz'
                  ? 'Biriktirilgan variantni faqat 1 marta ishlash mumkin. 2-marta urinish uchun ustozingizga borgan 6 xonali maxfiy kodni so‘rab shu yerga tering.'
                  : 'An assigned variant allows 1 attempt by default. To unlock a 2nd attempt, enter the 6-digit code sent to your teacher.'}
            </p>

            {(activeAssignment.retakeCodePending || effectiveAllowed < 2) && (
              <div className="mx-auto mt-6 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
                <label
                  htmlFor="retake-code-input-locked"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  {lang === 'uz'
                    ? 'Ustozga borgan 6 xonali kod'
                    : '6-Digit Teacher Unlock Code'}
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    id="retake-code-input-locked"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={retakeInput}
                    onChange={(e) => setRetakeInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="font-mono-num min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 text-center text-lg font-extrabold tracking-[0.25em] text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  />
                  <button
                    type="button"
                    disabled={retakeBusy || retakeInput.length !== 6}
                    onClick={() => void handleVerifyRetakeCode()}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-indigo-700 px-5 text-sm font-bold text-white transition-colors hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {retakeBusy
                      ? '...'
                      : lang === 'uz'
                        ? 'Ochish'
                        : 'Unlock'}
                  </button>
                </div>

                {retakeError && (
                  <p className="mt-2.5 text-xs font-semibold text-rose-700">{retakeError}</p>
                )}
                {retakeSuccess && (
                  <p className="mt-2.5 text-xs font-semibold text-emerald-700">{retakeSuccess}</p>
                )}

                <p className="mt-3 text-[11px] text-slate-500">
                  {activeAssignment.retakeCodePending
                    ? lang === 'uz'
                      ? 'Kod ustozning Bildirishnomalar paneliga yuborilgan.'
                      : 'The unlock code has been sent to your teacher’s Notification Center.'
                    : lang === 'uz'
                      ? 'Kod ustoz paneliga yuborilmoqda...'
                      : 'Sending unlock code to your teacher...'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center sm:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
              {isTopicDrillActive
                ? `${pickText(subject.shortLabel, lang)} · ${selectedTopic} · Variant ${topicVariant}`
                : `${pickText(subject.shortLabel, lang)} · ${isExamSection ? `${getDifficultyLabel(difficulty, lang)} · ` : ''}${getVariantLabel(variant, lang)}`}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              {warningsPaused
                ? lang === 'uz'
                  ? `Ushbu ${isTopicDrillActive ? 'mavzu testida' : 'variantda'} ${questions.length} ta savol mavjud (${Math.round(totalDurationSeconds / 60)} daqiqa · ${mode === 'practice' ? copy.modePractice : copy.modeExam}).`
                  : `This ${isTopicDrillActive ? 'topic drill' : 'variant'} contains ${questions.length} questions (${Math.round(totalDurationSeconds / 60)} min · ${mode === 'practice' ? copy.modePractice : copy.modeExam}).`
                : lang === 'uz'
                  ? `Ushbu imtihon variantida ${questions.length} ta savol mavjud (${Math.round(totalDurationSeconds / 60)} daqiqa · ${copy.modeExam}). Imtihon paytida veb-kamera va to‘liq ekran nazorati faol bo‘ladi — boshqa desktop yoki oynaga o‘tish darhol, yuzni burish/berkitish esa 3.5 soniyada ogohlantirish kamayishiga sabab bo‘ladi (jami 3 ta ogohlantirish; 3 tasi tugasa natija 0 bo‘ladi).`
                  : `This exam variant contains ${questions.length} questions (${Math.round(totalDurationSeconds / 60)} min · ${copy.modeExam}). Webcam and fullscreen proctoring are active — switching desktops or windows immediately deducts 1 warning (3 warnings max; exhausting all 3 gives 0).`}
            </p>

            {retakeSuccess && (
              <div className="mx-auto mt-4 max-w-md rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800">
                {retakeSuccess}
              </div>
            )}
            {retakeError && (
              <div className="mx-auto mt-4 max-w-md rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-800">
                {retakeError}
              </div>
            )}

            {!warningsPaused && (
              <CameraProctor
                lang={lang}
                isActive={false}
                warningsLeft={warningsLeft}
                maxWarnings={MAX_WARNINGS}
                onViolation={triggerInstantPenalty}
                stream={cameraStream}
                cameraStatus={cameraStatus}
                cameraError={cameraError}
                onRequestCamera={requestCamera}
                variant="preview-card"
              />
            )}

            <button
              type="button"
              onClick={handleBeginTest}
              className="mt-6 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-teal-700 px-8 text-base font-bold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>
                {warningsPaused || cameraStatus === 'active'
                  ? 'Start Test'
                  : lang === 'uz'
                    ? 'Kamera bilan boshlash'
                    : 'Start with Camera'}
              </span>
            </button>
          </div>
        )
      ) : submitted && resultsSummary ? (
        <div className="space-y-6">
          {forcedZero && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-5 text-rose-900"
            >
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" />
              <div>
                <h2 className="font-display text-base font-extrabold text-rose-900">
                  {lang === 'uz'
                    ? 'Test qoidabuzarlik sababli darhol to‘xtatildi (Natija: 0)'
                    : 'Test immediately terminated due to focus violations (Score: 0)'}
                </h2>
                <p className="mt-1 text-sm text-rose-800">
                  {lang === 'uz'
                    ? `3 ta ogohlantirish ham sarflandi (boshqa oyna, sayt yoki desktopga o‘tildi). Ushbu test uchun natijangiz 0 / ${questions.length} (0%) qilib saqlandi.`
                    : `All 3 warnings were used (you switched outside the test tab, window, or desktop). Your score for this test was recorded as 0 / ${questions.length} (0%).`}
                </p>
              </div>
            </div>
          )}

          {enforceAssignment && activeAssignment !== null && (
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-5 sm:p-6">
              {effectiveUsed < effectiveAllowed ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-extrabold text-slate-900">
                        {lang === 'uz'
                          ? '2-urinish ochildi!'
                          : '2nd Attempt Unlocked!'}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {retakeSuccess ||
                          (lang === 'uz'
                            ? `Urinish holati: ${effectiveUsed}/${effectiveAllowed}. Endi 2-marta testni boshlashingiz mumkin.`
                            : `Attempts: ${effectiveUsed}/${effectiveAllowed}. You can now start your 2nd attempt.`)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startSession(difficulty, activeAssignment.variant, [])}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-bold text-white transition-colors hover:bg-teal-800"
                  >
                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    <span>{lang === 'uz' ? '2-urinishni boshlash' : 'Start 2nd Attempt'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <KeyRound className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-extrabold text-slate-900">
                        {lang === 'uz'
                          ? '2-marta urinish uchun ustoz kodini kiriting'
                          : 'Enter Teacher Code for 2nd Attempt'}
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        {effectiveAllowed >= 2
                          ? lang === 'uz'
                            ? `Urinishlar tugadi (${effectiveUsed}/${effectiveAllowed}). Yana ishlash uchun ustozdan yangi kod so‘rang.`
                            : `All attempts used (${effectiveUsed}/${effectiveAllowed}). Ask your teacher for a new code.`
                          : lang === 'uz'
                            ? 'Ushbu variant 1 marta ishlandi. Qayta ishlash uchun ustozingizga borgan 6 xonali kodni tering.'
                            : 'This variant has been used once. Enter the 6-digit code sent to your teacher to unlock a 2nd attempt.'}
                      </p>
                      {retakeError && (
                        <p className="mt-1.5 text-xs font-semibold text-rose-700">{retakeError}</p>
                      )}
                    </div>
                  </div>

                  {(activeAssignment.retakeCodePending || effectiveAllowed < 2) && (
                    <div className="flex shrink-0 items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={retakeInput}
                        onChange={(e) =>
                          setRetakeInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
                        }
                        placeholder="000000"
                        className="font-mono-num min-h-[42px] w-36 rounded-lg border border-indigo-300 bg-white px-3 text-center text-base font-extrabold tracking-[0.2em] text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                      />
                      <button
                        type="button"
                        disabled={retakeBusy || retakeInput.length !== 6}
                        onClick={() => void handleVerifyRetakeCode()}
                        className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-indigo-700 px-4 text-sm font-bold text-white transition-colors hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {retakeBusy
                          ? '...'
                          : lang === 'uz'
                            ? 'Tasdiqlash'
                            : 'Unlock'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-slate-900">
                  {copy.resultTitle}
                </h2>
                <p className="mt-1 text-xs text-slate-500">{copy.gradingScaleNote}</p>
              </div>
              <div className="flex items-center gap-2.5">
                {resultsSummary.gradeInfo.grade === 5 && (
                  <button
                    type="button"
                    onClick={() => setShowCertificate(true)}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-bold text-white shadow-md transition-colors hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <Award className="h-4 w-4" aria-hidden="true" />
                    <span>{lang === 'uz' ? 'Sertifikatni Olish 🏆' : 'Get Certificate 🏆'}</span>
                  </button>
                )}
                {!enforceAssignment && (
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span>{copy.startOver}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">{copy.scoreLabel}</p>
                <p className="font-mono-num mt-1 text-3xl font-bold text-slate-900">
                  {resultsSummary.correct} / {questions.length}
                  {forcedZero && (
                    <span className="ml-2 font-sans text-lg font-extrabold text-rose-600">
                      Cheated
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">{copy.accuracyCol}</p>
                <p className="font-mono-num mt-1 text-3xl font-bold text-slate-900">
                  {resultsSummary.percentage}%
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">{copy.gradeLabel}</p>
                <p className="font-mono-num mt-1 text-3xl font-bold text-teal-700">
                  {resultsSummary.gradeInfo.grade}{' '}
                  <span className="font-body text-sm font-semibold text-slate-600">
                    ({pickText(resultsSummary.gradeInfo.label, lang)})
                  </span>
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">{copy.timeLabel}</p>
                <p className="font-mono-num mt-1 text-3xl font-bold text-slate-900">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>
            </div>

            {/* Topic Breakdown Table */}
            <div className="mt-6">
              <h3 className="font-display text-base font-bold text-slate-900">
                {copy.topicBreakdown}
              </h3>
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5">{copy.topicCol}</th>
                      <th className="px-4 py-2.5">{copy.correctCol}</th>
                      <th className="px-4 py-2.5">{copy.accuracyCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultsSummary.topicRows.map((row) => (
                      <tr key={row.topic}>
                        <td className="px-4 py-2.5 font-medium text-slate-800">{row.topic}</td>
                        <td className="font-mono-num px-4 py-2.5 text-slate-700">
                          {row.ok} / {row.total}
                        </td>
                        <td className="font-mono-num px-4 py-2.5 font-semibold text-slate-900">
                          {row.pct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Question-by-Question Review */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {copy.answerReview}
              </h3>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setReviewFilter('all')}
                  className={`min-h-[34px] rounded-md px-3 text-xs font-semibold ${
                    reviewFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'uz'
                    ? `Barcha ${questions.length} savol`
                    : `All ${questions.length} questions`}
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('wrong')}
                  className={`min-h-[34px] rounded-md px-3 text-xs font-semibold ${
                    reviewFilter === 'wrong'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {copy.filterWrong}
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {questions.map((q, idx) => {
                const selectedDisp = answers[idx];
                const isOk = isChoiceCorrect(q, selectedDisp);
                if (reviewFilter === 'wrong' && isOk) return null;

                const opts = getLocalizedOptions(q.source.opts, lang);
                const correctDisp = getCorrectDisplayIndex(q);
                const selectedText =
                  selectedDisp !== undefined
                    ? `${OPTION_LETTERS[selectedDisp]}. ${opts[q.optionOrder[selectedDisp]]}`
                    : copy.notSelected;
                const correctText = `${OPTION_LETTERS[correctDisp]}. ${opts[q.optionOrder[correctDisp]]}`;

                return (
                  <article
                    key={q.source.id}
                    className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-slate-500">
                        {idx + 1}. {q.source.topic}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isOk ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isOk ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            <span>{copy.correctBadge}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" aria-hidden="true" />
                            <span>
                              {selectedDisp === undefined
                                ? copy.unansweredBadge
                                : copy.incorrectBadge}
                            </span>
                          </>
                        )}
                      </span>
                    </div>

                    {q.source.context && (
                      <div className="mt-2.5 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 border-l-4 border-l-teal-700 bg-white px-3.5 py-2.5 text-xs leading-relaxed text-slate-700">
                        {getLocalizedField(q.source.context, lang)}
                      </div>
                    )}

                    <p className="mt-2 whitespace-pre-line font-display text-base font-semibold text-slate-900">
                      {getLocalizedField(q.source.q, lang)}
                    </p>

                    {subject.id === 'math' && (
                      <MathShapeDiagram
                        questionId={q.source.id}
                        diagram={q.source.diagram}
                        lang={lang}
                        compact
                      />
                    )}

                    <div className="mt-2.5 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <p className="text-slate-700">
                        <span className="font-semibold text-slate-900">{copy.yourAnswer}: </span>
                        <span className={isOk ? 'text-emerald-700' : 'text-rose-700'}>
                          {selectedText}
                        </span>
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold text-slate-900">{copy.correctAnswer}: </span>
                        <span className="font-medium text-emerald-700">{correctText}</span>
                      </p>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      <span className="font-semibold text-slate-700">{copy.explanation}: </span>
                      <FormattedMathText text={getLocalizedField(q.source.explain, lang)} />
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Active 25-Question Workspace */
        <div className="space-y-5">
          {/* 1..25 Question Navigator Strip & Progress */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                {lang === 'uz' ? 'Javob berilgan:' : 'Answered:'}{' '}
                <strong className="font-mono-num text-slate-900">
                  {Object.keys(answers).length} / {questions.length}
                </strong>
              </span>
              <span className="hidden font-mono-num text-[11px] text-slate-400 sm:inline">
                {lang === 'uz' ? 'Tezkor tugmalar: A–D / 1–4 · ← →' : 'Shortcuts: A–D / 1–4 · ← →'}
              </span>
            </div>
            <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-teal-600 transition-all duration-200"
                style={{
                  width: `${Math.round((Object.keys(answers).length / Math.max(1, questions.length)) * 100)}%`,
                }}
              />
            </div>
            <div
              className={`grid grid-cols-5 gap-1.5 sm:grid-cols-10 ${
                questions.length <= 10 ? 'md:grid-cols-10' : 'md:grid-cols-[repeat(25,minmax(0,1fr))]'
              }`}
            >
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const sel = answers[idx];
                const isAnswered = sel !== undefined;
                const isPracticeCorrect =
                  mode === 'practice' && isAnswered && isChoiceCorrect(q, sel);
                const isPracticeWrong =
                  mode === 'practice' && isAnswered && !isChoiceCorrect(q, sel);

                let styleClass =
                  'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
                if (isCurrent) {
                  styleClass = 'border-slate-900 bg-slate-900 text-white';
                } else if (isPracticeCorrect) {
                  styleClass = 'border-emerald-300 bg-emerald-50 text-emerald-800';
                } else if (isPracticeWrong) {
                  styleClass = 'border-rose-300 bg-rose-50 text-rose-800';
                } else if (isAnswered) {
                  styleClass = 'border-slate-400 bg-slate-100 text-slate-900';
                }

                return (
                  <button
                    key={q.source.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`${copy.questionOf} ${idx + 1}`}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`font-mono-num flex h-9 items-center justify-center rounded-md border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${styleClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Card */}
          {activeQuestion && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500">
                <span>
                  {activeQuestion.source.topic} ·{' '}
                  <span
                    className={`font-semibold ${
                      activeQuestion.source.difficulty === 'easy'
                        ? 'text-emerald-700'
                        : activeQuestion.source.difficulty === 'medium'
                          ? 'text-amber-700'
                          : 'text-rose-700'
                    }`}
                  >
                    {getDifficultyLabel(activeQuestion.source.difficulty, lang)}
                  </span>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCalculatorOpen((open) => !open)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                      calculatorOpen
                        ? 'border-teal-700 bg-teal-50 text-teal-800'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Calculator className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                    <span>{lang === 'uz' ? 'Kalkulyator' : 'Calculator'}</span>
                  </button>
                  <span className="font-mono-num">
                    {copy.questionOf} {currentIndex + 1} / {questions.length}
                  </span>
                </div>
              </div>

              {activeQuestion.source.context && (
                <div className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 border-l-4 border-l-teal-700 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-800 sm:text-[15px]">
                  {getLocalizedField(activeQuestion.source.context, lang)}
                </div>
              )}

              <h2 className="mt-3 whitespace-pre-line font-display text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                {getLocalizedField(activeQuestion.source.q, lang)}
              </h2>

              {subject.id === 'math' && (
                <MathShapeDiagram
                  questionId={activeQuestion.source.id}
                  diagram={activeQuestion.source.diagram}
                  lang={lang}
                />
              )}

              <div className="mt-6 space-y-3">
                {activeQuestion.optionOrder.map((origIdx, dispIdx) => {
                  const opts = getLocalizedOptions(activeQuestion.source.opts, lang);
                  const selectedDisp = answers[currentIndex];
                  const isSelected = selectedDisp === dispIdx;
                  const showInstantFeedback =
                    mode === 'practice' && selectedDisp !== undefined;
                  const correctDisp = getCorrectDisplayIndex(activeQuestion);
                  const isCorrectOption = dispIdx === correctDisp;

                  let optStyle =
                    'border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50';
                  let stateTag: 'correct' | 'wrong' | null = null;

                  if (showInstantFeedback) {
                    if (isCorrectOption) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                      stateTag = 'correct';
                    } else if (isSelected) {
                      optStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-semibold';
                      stateTag = 'wrong';
                    } else {
                      optStyle = 'border-slate-200 bg-white text-slate-500';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-slate-900 bg-slate-100 text-slate-900 font-semibold';
                  }

                  return (
                    <button
                      key={`${activeQuestion.source.id}-${origIdx}`}
                      type="button"
                      disabled={showInstantFeedback}
                      onClick={() => handleSelectOption(dispIdx)}
                      className={`flex min-h-[52px] w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 disabled:cursor-default ${optStyle}`}
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="font-mono-num text-sm font-bold text-slate-500">
                          {OPTION_LETTERS[dispIdx]}.
                        </span>
                        <span>{opts[origIdx]}</span>
                      </span>

                      {stateTag === 'correct' && (
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          <span>{copy.correctBadge}</span>
                        </span>
                      )}
                      {stateTag === 'wrong' && (
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-rose-700">
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                          <span>{copy.incorrectBadge}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Panel in Practice Mode */}
              {mode === 'practice' && answers[currentIndex] !== undefined && (
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                    {isChoiceCorrect(activeQuestion, answers[currentIndex]) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                        <span className="text-emerald-800">{copy.correctBadge}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-rose-700" aria-hidden="true" />
                        <span className="text-rose-800">{copy.incorrectBadge}</span>
                      </>
                    )}
                    <span className="text-slate-400">·</span>
                    <span>{copy.explanation}</span>
                  </p>
                  <p className="mt-1.5 text-slate-700">
                    <FormattedMathText text={getLocalizedField(activeQuestion.source.explain, lang)} />
                  </p>
                </div>
              )}

              {/* Bottom Navigation & Submit Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span>{copy.previous}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2.5">
                  {currentIndex < questions.length - 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIndex((i) => Math.min(Math.max(0, questions.length - 1), i + 1))
                      }
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                    >
                      <span>{copy.next}</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                  >
                    {copy.finishExam}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Floating Corner Camera Proctor (active during test, movable to any corner) */}
      {started && !submitted && !warningsPaused && (
        <Suspense fallback={null}>
          <CameraProctor
            lang={lang}
            isActive={true}
            warningsLeft={warningsLeft}
            maxWarnings={MAX_WARNINGS}
            onViolation={triggerInstantPenalty}
            stream={cameraStream}
            cameraStatus={cameraStatus}
            cameraError={cameraError}
            onRequestCamera={requestCamera}
            variant="floating"
          />
        </Suspense>
      )}

      {/* In-App Scientific Calculator */}
      {calculatorOpen && (
        <Suspense fallback={null}>
          <ScientificCalculator
            lang={lang}
            open={calculatorOpen}
            onClose={() => setCalculatorOpen(false)}
            secretMathActive={isMathActiveQuiz}
            secretMathAnswer={secretMathAnswer}
            secretRemaining={secretRemaining}
            secretMaxUses={MAX_SECRET_USES}
            questionKey={isMathActiveQuiz ? activeQuestionId : null}
            onSecretCodeUsed={handleSecretCodeUsed}
          />
        </Suspense>
      )}

      {showCertificate && resultsSummary && (
        <Suspense fallback={null}>
          <CertificateModal
            lang={lang}
            studentName={userProfile?.displayName || 'Student'}
            subject={subject}
            score={resultsSummary.correct}
            total={questions.length}
            grade={resultsSummary.gradeInfo.grade}
            dateStr={new Date().toLocaleDateString()}
            onClose={() => setShowCertificate(false)}
          />
        </Suspense>
      )}
    </section>
  );
}
