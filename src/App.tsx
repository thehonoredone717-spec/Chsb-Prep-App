import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AuthGate } from './components/AuthGate';
import { AssignView } from './components/AssignView';
import { DashboardSection } from './components/DashboardSection';
import { AppNotification } from './components/NotificationBell';
import { OverviewSection } from './components/OverviewSection';
import { PermissionView } from './components/PermissionView';
import { PreviewView } from './components/PreviewView';
import { QuizSection } from './components/QuizSection';
import { ResultsHistoryView } from './components/ResultsHistoryView';
import { SideMenu } from './components/SideMenu';
import { StudyGuidePanel } from './components/StudyGuidePanel';
import { SubjectBar } from './components/SubjectBar';
import { AppView, TeacherScope, TopBar } from './components/TopBar';
import {
  AttemptRecord,
  SUBJECTS,
  SUBJECT_MAP,
  SubjectPermission,
  pickText,
} from './data/subjects';
import {
  COMPUTING_TEACHER_EMAIL,
  ENGLISH_TEACHER_EMAIL,
  MATH_TEACHER_EMAIL,
  OWNER_EMAIL,
  OperationType,
  SCIENCE_TEACHER_EMAIL,
  STUDENT_EMAIL,
  UserProfile,
  VARIANT_MAX_LEN,
  auth,
  db,
  deriveUsernameFromUser,
  handleFirestoreError,
  isAppOwner,
  isComputingTeacher,
  isEnglishTeacher,
  isMathTeacher,
  isScienceTeacher,
  isTeacherAdmin,
  sanitizeDisplayName,
} from './firebase';
import { DifficultyLevel, SubjectId, UILanguage } from './types/quiz';
import { downloadStandaloneHtml } from './utils/exportHtml';
import { getDifficultyLabel, getVariantLabel } from './utils/quizEngine';
import {
  exitAppFullscreen,
  isFullscreenActive,
  requestAppFullscreen,
} from './utils/fullscreen';

const LANG_STORAGE_KEY = 'g7_chsb_lang_v1';

function loadLang(): UILanguage {
  try {
    const raw = window.localStorage.getItem(LANG_STORAGE_KEY);
    return raw === 'en' ? 'en' : 'uz';
  } catch {
    return 'uz';
  }
}

export default function App() {
  const [lang, setLang] = useState<UILanguage>(() => loadLang());
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>('math');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const [downloadNotice, setDownloadNotice] = useState<boolean>(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);
  const [isQuizRunning, setIsQuizRunning] = useState<boolean>(false);
  const [pendingNavAction, setPendingNavAction] = useState<(() => void) | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => isFullscreenActive());
  const [subjectPermissions, setSubjectPermissions] = useState<
    Partial<Record<SubjectId, SubjectPermission>>
  >({});
  const [savingPermissionId, setSavingPermissionId] = useState<SubjectId | null>(null);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [liveAssignments, setLiveAssignments] = useState<
    Array<{
      id: string;
      studentUid: string;
      subjectId: SubjectId;
      difficulty: DifficultyLevel;
      variant: number;
      assignedByName: string;
      updatedAtMs: number;
    }>
  >([]);
  const [liveRetakeCodes, setLiveRetakeCodes] = useState<
    Array<{
      id: string;
      assignmentId: string;
      studentUid: string;
      studentName: string;
      subjectId: SubjectId;
      difficulty: DifficultyLevel;
      variant: number;
      code: string;
      status: 'pending' | 'used';
      updatedAtMs: number;
    }>
  >([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => new Set());

  const pendingSignupRef = useRef<{ username: string; displayName: string } | null>(null);
  const finishQuizRef = useRef<(() => void) | null>(null);
  const hasManualSubjectSelectionRef = useRef<boolean>(false);

  if (fatalError) {
    throw fatalError;
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }, [lang]);

  // Keep fullscreen state synced and block right-click context menu (fullscreen starts when quiz Start is clicked)
  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(isFullscreenActive());
    };

    const handleBlockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    document.addEventListener('contextmenu', handleBlockContextMenu, { capture: true });

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
      document.removeEventListener('contextmenu', handleBlockContextMenu, { capture: true });
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (isFullscreenActive()) {
      if (isQuizRunning) {
        void requestAppFullscreen(true);
        return;
      }
      void exitAppFullscreen();
    } else {
      void requestAppFullscreen(isQuizRunning);
    }
  };

  // Monitor Firebase Auth and synchronize /users/{uid}
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (!user) {
        setUserProfile(null);
        setUsersList([]);
        setHistory([]);
        setSubjectPermissions({});
        setLiveAssignments([]);
        setLiveRetakeCodes([]);
        setReadNotificationIds(new Set());
        setActiveView('dashboard');
        setAuthReady(true);
        return;
      }

      setAuthReady(false);
      const userDocPath = `users/${user.uid}`;
      const userDocRef = doc(db, 'users', user.uid);

      void (async () => {
        try {
          const snap = await getDoc(userDocRef);
          const isOwner = isAppOwner(user);
          const isSubjectTeacher =
            isComputingTeacher(user) ||
            isMathTeacher(user) ||
            isScienceTeacher(user) ||
            isEnglishTeacher(user);

          const expectedRole: 'student' | 'teacher' | 'owner' = isOwner
            ? 'owner'
            : isSubjectTeacher
              ? 'teacher'
              : 'student';

          if (!snap.exists()) {
            const pending = pendingSignupRef.current;
            pendingSignupRef.current = null;
            const username = deriveUsernameFromUser(user, pending?.username);
            const displayName = sanitizeDisplayName(
              pending?.displayName ?? user.displayName,
              username
            );
            const role = expectedRole;
            const email = user.email?.toLowerCase() || '';

            try {
              await setDoc(userDocRef, {
                uid: user.uid,
                username,
                displayName,
                role,
                ...(email ? { email } : {}),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (writeErr) {
              handleFirestoreError(writeErr, OperationType.CREATE, userDocPath);
            }

            setUserProfile({ uid: user.uid, username, displayName, email, role });
          } else {
            const data = snap.data() as Partial<UserProfile>;
            const email = user.email?.toLowerCase() || data.email || '';
            const profile: UserProfile = {
              uid: user.uid,
              username: deriveUsernameFromUser(user, data.username),
              displayName: sanitizeDisplayName(data.displayName, data.username || 'Student'),
              email,
              role: expectedRole,
            };

            if (data.role !== expectedRole || (email && !data.email)) {
              try {
                await updateDoc(userDocRef, {
                  role: expectedRole,
                  ...(email ? { email } : {}),
                  updatedAt: serverTimestamp(),
                });
              } catch (updErr) {
                console.warn('Could not sync user role to Firestore:', updErr);
              }
            }

            setUserProfile(profile);
          }
          setAuthReady(true);
        } catch (err) {
          if (err instanceof Error && err.message.startsWith('{')) {
            setFatalError(err);
          } else {
            try {
              handleFirestoreError(err, OperationType.GET, userDocPath);
            } catch (wrapped) {
              setFatalError(wrapped as Error);
            }
          }
          setAuthReady(true);
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  const isFullAdmin = isTeacherAdmin(authUser);
  const isCompTeacher = isComputingTeacher(authUser);
  const isMathTch = isMathTeacher(authUser);
  const isScienceTch = isScienceTeacher(authUser);
  const isEnglishTch = isEnglishTeacher(authUser);
  const teacherScope: TeacherScope = isFullAdmin
    ? 'all'
    : isCompTeacher
      ? 'computing'
      : isMathTch
        ? 'math'
        : isScienceTch
          ? 'science'
          : isEnglishTch
            ? 'english'
            : 'none';

  // Subscribe to attempts only when auth and userProfile are ready
  useEffect(() => {
    if (!authReady || !authUser || !userProfile) return;

    const attemptsCollection = collection(db, 'attempts');
    const attemptsQuery = isFullAdmin
      ? query(attemptsCollection, orderBy('createdAt', 'desc'))
      : isCompTeacher
        ? query(attemptsCollection, where('subjectId', '==', 'computing'))
        : isMathTch
          ? query(attemptsCollection, where('subjectId', '==', 'math'))
          : isScienceTch
            ? query(attemptsCollection, where('subjectId', '==', 'science'))
            : isEnglishTch
              ? query(attemptsCollection, where('subjectId', '==', 'english'))
              : query(attemptsCollection, where('userId', '==', authUser.uid));

    const unsubscribeAttempts = onSnapshot(
      attemptsQuery,
      (snapshot) => {
        const rows: AttemptRecord[] = snapshot.docs.map((d) => {
          const raw = d.data() as Partial<AttemptRecord>;
          return {
            id: raw.id || d.id,
            userId: raw.userId,
            username: raw.username,
            studentName: raw.studentName,
            subjectId: (raw.subjectId as SubjectId) || 'math',
            difficulty: raw.difficulty,
            variant: raw.variant || '1-variant',
            mode: raw.mode === 'exam' ? 'exam' : 'practice',
            score: typeof raw.score === 'number' ? raw.score : 0,
            total: typeof raw.total === 'number' ? raw.total : 25,
            percentage: typeof raw.percentage === 'number' ? raw.percentage : 0,
            grade: (raw.grade as 2 | 3 | 4 | 5) || 3,
            elapsedSeconds: typeof raw.elapsedSeconds === 'number' ? raw.elapsedSeconds : 0,
            completedAt: raw.completedAt || new Date().toISOString(),
            cheated: raw.cheated === true,
          };
        });

        rows.sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        setHistory(rows);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'attempts');
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      }
    );

    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const profiles: UserProfile[] = snapshot.docs.map((d) => {
          const raw = d.data() as Partial<UserProfile>;
          const email = (raw.email || '').toLowerCase();
          const username = (raw.username || d.id).toLowerCase();
          const isUserOwner = email === OWNER_EMAIL || username === 'thehonoredone';
          const isUserSubjectTeacher =
            email === COMPUTING_TEACHER_EMAIL ||
            email === MATH_TEACHER_EMAIL ||
            email === SCIENCE_TEACHER_EMAIL ||
            email === ENGLISH_TEACHER_EMAIL;

          const isIbrohim =
            email === 'ibrohimbekxujanazarov@gmail.com' ||
            username.includes('ibrohim') ||
            (raw.displayName && raw.displayName.toLowerCase().includes('ibrohim'));

          let role: 'owner' | 'teacher' | 'student' = 'student';
          if (isUserOwner) {
            role = 'owner';
          } else if (isUserSubjectTeacher) {
            role = 'teacher';
          } else {
            role = 'student';
          }

          const userEmail = raw.email || (isIbrohim ? 'ibrohimbekxujanazarov@gmail.com' : undefined);

          // If current admin sees an outdated role, heal it in Firestore
          if (isFullAdmin && raw.role !== role && !isUserOwner && !isUserSubjectTeacher) {
            void updateDoc(doc(db, 'users', d.id), {
              role: 'student',
              ...(userEmail ? { email: userEmail } : {}),
              updatedAt: serverTimestamp(),
            }).catch(() => {});
          }

          return {
            uid: raw.uid || d.id,
            username: raw.username || d.id,
            displayName: raw.displayName || (isIbrohim ? 'Ibrohimbek Xujanazarov' : raw.username || 'Student'),
            email: userEmail,
            role,
          };
        });

        // Ensure ibrohimbek is present in usersList so they are never missing from students
        const hasIbrohim = profiles.some(
          (u) =>
            u.email === 'ibrohimbekxujanazarov@gmail.com' ||
            u.username.toLowerCase().includes('ibrohim')
        );
        if (!hasIbrohim) {
          profiles.push({
            uid: 'student_ibrohimbek_profile',
            username: 'ibrohimbekxujanazarov',
            displayName: 'Ibrohimbek Xujanazarov',
            email: 'ibrohimbekxujanazarov@gmail.com',
            role: 'student',
          });
        }

        setUsersList(profiles);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'users');
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      }
    );

    const permissionUnsubs = SUBJECTS.map((subject) =>
      onSnapshot(
        doc(db, 'subjectPermissions', subject.id),
        (snap) => {
          setSubjectPermissions((prev) => {
            if (!snap.exists()) {
              if (!(subject.id in prev)) return prev;
              const next = { ...prev };
              delete next[subject.id];
              return next;
            }
            const raw = snap.data() as Omit<Partial<SubjectPermission>, 'updatedAt'> & {
              updatedAt?: string | { toMillis?: () => number };
            };
            const updatedAtStr =
              typeof raw.updatedAt === 'string'
                ? raw.updatedAt
                : typeof raw.updatedAt?.toMillis === 'function'
                  ? String(raw.updatedAt.toMillis())
                  : undefined;
            return {
              ...prev,
              [subject.id]: {
                subjectId: subject.id,
                prohibited: raw.prohibited === true,
                updatedByUid: raw.updatedByUid,
                updatedByName: raw.updatedByName,
                updatedAt: updatedAtStr,
              },
            };
          });
        },
        (err) => {
          try {
            handleFirestoreError(err, OperationType.GET, `subjectPermissions/${subject.id}`);
          } catch (wrapped) {
            setFatalError(wrapped as Error);
          }
        }
      )
    );

    const isIbrohimUser =
      userProfile.email?.toLowerCase() === STUDENT_EMAIL ||
      userProfile.username.toLowerCase().includes('ibrohim');
    const assignmentsQuery =
      teacherScope === 'none'
        ? query(
            collection(db, 'studentAssignments'),
            where(
              'studentUid',
              'in',
              isIbrohimUser ? [userProfile.uid, 'student_ibrohimbek_profile'] : [userProfile.uid]
            )
          )
        : teacherScope === 'all'
          ? collection(db, 'studentAssignments')
          : query(collection(db, 'studentAssignments'), where('subjectId', '==', teacherScope));

    const unsubscribeAssignments = onSnapshot(
      assignmentsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const raw = d.data() as {
            id?: string;
            studentUid?: string;
            subjectId?: SubjectId;
            difficulty?: DifficultyLevel;
            variant?: number;
            assignedByName?: string;
            updatedAt?: { toMillis?: () => number };
          };
          const updatedAtMs =
            typeof raw.updatedAt?.toMillis === 'function' ? raw.updatedAt.toMillis() : 0;
          return {
            id: raw.id || d.id,
            studentUid: raw.studentUid || '',
            subjectId: raw.subjectId || 'math',
            difficulty: raw.difficulty || 'easy',
            variant: typeof raw.variant === 'number' ? raw.variant : 1,
            assignedByName: raw.assignedByName || 'Teacher',
            updatedAtMs,
          };
        });
        setLiveAssignments(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'studentAssignments');
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      }
    );

    let unsubscribeRetakeCodes: (() => void) | null = null;
    if (teacherScope !== 'none') {
      const retakeQuery =
        teacherScope === 'all'
          ? collection(db, 'retakeCodes')
          : query(collection(db, 'retakeCodes'), where('subjectId', '==', teacherScope));

      unsubscribeRetakeCodes = onSnapshot(
        retakeQuery,
        (snapshot) => {
          const list = snapshot.docs.map((d) => {
            const raw = d.data() as {
              id?: string;
              assignmentId?: string;
              studentUid?: string;
              studentName?: string;
              subjectId?: SubjectId;
              difficulty?: DifficultyLevel;
              variant?: number;
              code?: string;
              status?: 'pending' | 'used';
              updatedAt?: { toMillis?: () => number };
            };
            const updatedAtMs =
              typeof raw.updatedAt?.toMillis === 'function' ? raw.updatedAt.toMillis() : 0;
            return {
              id: raw.id || d.id,
              assignmentId: raw.assignmentId || d.id,
              studentUid: raw.studentUid || '',
              studentName: raw.studentName || 'Student',
              subjectId: raw.subjectId || 'math',
              difficulty: raw.difficulty || 'easy',
              variant: typeof raw.variant === 'number' ? raw.variant : 1,
              code: raw.code || '',
              status: (raw.status === 'used' ? 'used' : 'pending') as 'pending' | 'used',
              updatedAtMs,
            };
          });
          setLiveRetakeCodes(list);
        },
        (err) => {
          try {
            handleFirestoreError(err, OperationType.LIST, 'retakeCodes');
          } catch (wrapped) {
            setFatalError(wrapped as Error);
          }
        }
      );
    } else {
      setLiveRetakeCodes([]);
    }

    return () => {
      unsubscribeAttempts();
      unsubscribeUsers();
      permissionUnsubs.forEach((unsub) => unsub());
      unsubscribeAssignments();
      unsubscribeRetakeCodes?.();
    };
  }, [
    authReady,
    authUser,
    userProfile,
    isFullAdmin,
    isCompTeacher,
    isMathTch,
    isScienceTch,
    isEnglishTch,
    teacherScope,
  ]);

  useEffect(() => {
    if (!userProfile?.uid) return;
    try {
      const raw = window.localStorage.getItem(`g7_chsb_read_notifs_${userProfile.uid}`);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setReadNotificationIds(new Set(parsed.filter((v): v is string => typeof v === 'string')));
          return;
        }
      }
    } catch {
      // Ignore storage errors
    }
    setReadNotificationIds(new Set());
  }, [userProfile?.uid]);

  const persistReadNotificationIds = (nextSet: Set<string>) => {
    if (!userProfile?.uid) return;
    try {
      window.localStorage.setItem(
        `g7_chsb_read_notifs_${userProfile.uid}`,
        JSON.stringify(Array.from(nextSet).slice(-200))
      );
    } catch {
      // Ignore storage errors
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setReadNotificationIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistReadNotificationIds(next);
      return next;
    });
  };

  const notifications = useMemo<AppNotification[]>(() => {
    if (!userProfile) return [];
    const items: AppNotification[] = [];
    const uz = lang === 'uz';

    // 0. Pending 2nd-attempt unlock codes for teachers/owner
    if (teacherScope !== 'none') {
      liveRetakeCodes.forEach((rc) => {
        if (rc.status !== 'pending' || !rc.code) return;
        const sub = SUBJECT_MAP[rc.subjectId];
        const subLabel = sub ? pickText(sub.shortLabel, lang) : rc.subjectId;
        const diffLabel = getDifficultyLabel(rc.difficulty, lang);
        const varLabel = getVariantLabel(rc.variant, lang);
        const st = usersList.find((u) => u.uid === rc.studentUid);
        const studentLabel = st ? st.displayName : rc.studentName || rc.studentUid;

        items.push({
          id: `retake:${rc.id}:${rc.code}:${rc.updatedAtMs}`,
          kind: 'retake',
          title: uz
            ? `🔑 ${studentLabel} — 2-urinish kodi: ${rc.code}`
            : `🔑 ${studentLabel} — 2nd attempt code: ${rc.code}`,
          description: uz
            ? `${subLabel} (${diffLabel} · ${varLabel}) uchun qayta ishlash kodi. O‘quvchi 2-marta ishlashi uchun ushbu kodni bering.`
            : `Unlock code for ${subLabel} (${diffLabel} · ${varLabel}). Share this code with the student for a 2nd attempt.`,
          timestampMs: rc.updatedAtMs,
          onClick: () => {
            requestSectionLeave(() => setActiveView('assign'));
          },
        });
      });
    }

    // 1. Live variant assignments
    liveAssignments.forEach((asg) => {
      const sub = SUBJECT_MAP[asg.subjectId];
      const subLabel = sub ? pickText(sub.shortLabel, lang) : asg.subjectId;
      const diffLabel = getDifficultyLabel(asg.difficulty, lang);
      const varLabel = getVariantLabel(asg.variant, lang);

      if (teacherScope === 'none') {
        items.push({
          id: `assign:${asg.id}:v${asg.variant}:${asg.updatedAtMs}`,
          kind: 'assignment',
          title: uz
            ? `${subLabel}: ${varLabel} biriktirildi`
            : `${subLabel}: ${varLabel} assigned`,
          description: uz
            ? `${diffLabel} daraja · ${asg.assignedByName} tomonidan biriktirildi. Testni boshlash uchun bosing.`
            : `${diffLabel} tier · Assigned by ${asg.assignedByName}. Click to open quiz.`,
          timestampMs: asg.updatedAtMs,
          onClick: () => {
            requestSectionLeave(() => {
              hasManualSubjectSelectionRef.current = true;
              setActiveSubjectId(asg.subjectId);
              setActiveView('quiz');
            });
          },
        });
      } else {
        const st = usersList.find((u) => u.uid === asg.studentUid);
        const studentLabel = st
          ? st.displayName
          : asg.studentUid === 'student_ibrohimbek_profile'
            ? 'Ibrohimbek Xujanazarov'
            : asg.studentUid;
        items.push({
          id: `assign:${asg.id}:v${asg.variant}:${asg.updatedAtMs}`,
          kind: 'assignment',
          title: uz
            ? `${studentLabel} — ${subLabel} (${varLabel})`
            : `${studentLabel} — ${subLabel} (${varLabel})`,
          description: uz
            ? `${diffLabel} daraja · ${asg.assignedByName} tomonidan biriktirilgan`
            : `${diffLabel} tier · Assigned by ${asg.assignedByName}`,
          timestampMs: asg.updatedAtMs,
          onClick: () => {
            requestSectionLeave(() => setActiveView('assign'));
          },
        });
      }
    });

    // 2. Subject prohibitions
    SUBJECTS.forEach((sub) => {
      const perm = subjectPermissions[sub.id];
      if (!perm?.prohibited) return;
      const subLabel = pickText(sub.shortLabel, lang);
      const ts = perm.updatedAt ? Number(perm.updatedAt) || 0 : 0;
      items.push({
        id: `prohibit:${sub.id}:${perm.updatedAt ?? 'on'}`,
        kind: 'prohibition',
        title: uz ? `${subLabel} testlari yopilgan` : `${subLabel} quizzes locked`,
        description: uz
          ? `${perm.updatedByName ? `${perm.updatedByName} tomonidan ` : ''}hozircha ushbu fandan testlar to‘xtatilgan.`
          : `Tests for this subject are currently prohibited${perm.updatedByName ? ` by ${perm.updatedByName}` : ''}.`,
        timestampMs: ts,
        onClick: () => {
          requestSectionLeave(() => {
            hasManualSubjectSelectionRef.current = true;
            setActiveSubjectId(sub.id);
            setActiveView(teacherScope === 'none' ? 'guide' : 'permission');
          });
        },
      });
    });

    // 3. Recent attempts & proctoring alerts
    const recentHistory = history.slice(0, 15);
    recentHistory.forEach((att) => {
      const sub = SUBJECT_MAP[att.subjectId];
      const subLabel = sub ? pickText(sub.shortLabel, lang) : att.subjectId;
      const ts = new Date(att.completedAt).getTime() || 0;
      const studentProfile = att.userId
        ? usersList.find((u) => u.uid === att.userId)
        : undefined;
      const studentLabel =
        att.studentName ||
        studentProfile?.displayName ||
        att.username ||
        studentProfile?.username ||
        (uz ? 'O‘quvchi' : 'Student');
      const diffLabel = att.difficulty ? getDifficultyLabel(att.difficulty, lang) : '';

      if (att.cheated) {
        items.push({
          id: `cheated:${att.id}`,
          kind: 'warning',
          title:
            teacherScope === 'none'
              ? uz
                ? `${subLabel}: Proktoring ogohlantirishi (0 ball)`
                : `${subLabel}: Proctoring violation (0 score)`
              : uz
                ? `${studentLabel} — ${subLabel} qoidabuzarlik (0 ball)`
                : `${studentLabel} — ${subLabel} flagged (0 score)`,
          description: uz
            ? `${diffLabel ? `${diffLabel} · ` : ''}${att.variant} · Barcha 3 ta ogohlantirish tugagani uchun test 0 ball bilan yakunlandi.`
            : `${diffLabel ? `${diffLabel} · ` : ''}${att.variant} · Test ended with 0 due to 3 proctoring warnings.`,
          timestampMs: ts,
          onClick: () => requestSectionLeave(() => setActiveView('results')),
        });
      } else if (teacherScope === 'none') {
        items.push({
          id: `attempt:${att.id}`,
          kind: 'result',
          title: uz
            ? `${subLabel} natijasi: ${att.score}/${att.total} (${att.percentage}%)`
            : `${subLabel} result: ${att.score}/${att.total} (${att.percentage}%)`,
          description: uz
            ? `${diffLabel ? `${diffLabel} · ` : ''}${att.variant} · Baho: ${att.grade}`
            : `${diffLabel ? `${diffLabel} · ` : ''}${att.variant} · Grade: ${att.grade}`,
          timestampMs: ts,
          onClick: () => requestSectionLeave(() => setActiveView('results')),
        });
      } else {
        items.push({
          id: `attempt:${att.id}`,
          kind: 'result',
          title: uz
            ? `${studentLabel} — ${subLabel}: ${att.score}/${att.total} (${att.percentage}%)`
            : `${studentLabel} — ${subLabel}: ${att.score}/${att.total} (${att.percentage}%)`,
          description: uz
            ? `${diffLabel ? `${diffLabel} · ` : ''}${att.variant} · Baho: ${att.grade} · ${att.mode === 'exam' ? 'Imtihon' : 'Mashq'}`
            : `${diffLabel ? `${diffLabel} · ` : ''}${att.variant} · Grade: ${att.grade} · ${att.mode === 'exam' ? 'Exam' : 'Practice'}`,
          timestampMs: ts,
          onClick: () => requestSectionLeave(() => setActiveView('results')),
        });
      }
    });

    items.sort((a, b) => b.timestampMs - a.timestampMs);
    return items.slice(0, 30);
  }, [userProfile, lang, liveRetakeCodes, liveAssignments, subjectPermissions, history, teacherScope, usersList]);

  const handleMarkAllNotificationsRead = () => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      persistReadNotificationIds(next);
      return next;
    });
  };

  const prohibitedSubjects = useMemo(() => {
    const set = new Set<SubjectId>();
    SUBJECTS.forEach((s) => {
      if (subjectPermissions[s.id]?.prohibited) {
        set.add(s.id);
      }
    });
    return set;
  }, [subjectPermissions]);

  useEffect(() => {
    if (
      !hasManualSubjectSelectionRef.current &&
      prohibitedSubjects.has(activeSubjectId)
    ) {
      const firstOpen = SUBJECTS.find((s) => !prohibitedSubjects.has(s.id));
      if (firstOpen) {
        setActiveSubjectId(firstOpen.id);
      }
    }
  }, [prohibitedSubjects, activeSubjectId]);

  const activeSubject = SUBJECT_MAP[activeSubjectId];
  const isCurrentSubjectProhibited =
    prohibitedSubjects.has(activeSubjectId) &&
    activeView === 'quiz';

  const requestSectionLeave = (action: () => void) => {
    if (activeView === 'quiz' && isQuizRunning && !prohibitedSubjects.has(activeSubjectId)) {
      setPendingNavAction(() => action);
      return;
    }
    action();
  };

  const handleSelectView = (view: AppView) => {
    if ((view === 'permission' || view === 'assign' || view === 'preview') && teacherScope === 'none') return;
    if (view === activeView) return;
    requestSectionLeave(() => setActiveView(view));
  };

  const handleSelectSubjectFromBar = (id: SubjectId) => {
    if (id === activeSubjectId && activeView === 'quiz') return;
    requestSectionLeave(() => {
      hasManualSubjectSelectionRef.current = true;
      setActiveSubjectId(id);
      if (
        activeView === 'dashboard' ||
        activeView === 'subjects' ||
        activeView === 'results' ||
        activeView === 'permission'
      ) {
        setActiveView('quiz');
      }
    });
  };

  const handleStartSubjectQuiz = (id: SubjectId) => {
    hasManualSubjectSelectionRef.current = true;
    setActiveSubjectId(id);
    setActiveView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubjectGuide = (id: SubjectId) => {
    hasManualSubjectSelectionRef.current = true;
    setActiveSubjectId(id);
    setActiveView('guide');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetSubjectProhibited = (subjectId: SubjectId, prohibited: boolean) => {
    if (!authUser || !userProfile || teacherScope === 'none') return;
    if (!isFullAdmin && teacherScope !== subjectId) return;

    const path = `subjectPermissions/${subjectId}`;
    setSavingPermissionId(subjectId);
    void (async () => {
      try {
        await setDoc(doc(db, 'subjectPermissions', subjectId), {
          subjectId,
          prohibited,
          updatedByUid: authUser.uid,
          updatedByName: sanitizeDisplayName(userProfile.displayName, userProfile.username),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, path);
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      } finally {
        setSavingPermissionId(null);
      }
    })();
  };

  const handleRecordAttempt = (record: AttemptRecord) => {
    if (!authUser || !userProfile) return;

    const safeId = record.id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
    const attemptPath = `attempts/${safeId}`;
    const payload = {
      id: safeId,
      userId: authUser.uid,
      username: userProfile.username,
      studentName: userProfile.displayName,
      subjectId: record.subjectId,
      difficulty: record.difficulty ?? 'easy',
      variant: record.variant.slice(0, VARIANT_MAX_LEN),
      mode: record.mode,
      score: Math.max(0, Math.min(25, Math.round(record.score))),
      total: 25,
      percentage: Math.max(0, Math.min(100, Math.round(record.percentage))),
      grade: record.grade,
      elapsedSeconds: Math.max(0, Math.min(86400, Math.round(record.elapsedSeconds))),
      completedAt: record.completedAt.slice(0, 40),
      cheated: Boolean(record.cheated),
      createdAt: serverTimestamp(),
    };

    void (async () => {
      try {
        await setDoc(doc(db, 'attempts', safeId), payload);
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.CREATE, attemptPath);
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      }
    })();
  };

  const handleDeleteAttempt = (attemptId: string) => {
    if (!isFullAdmin) return;
    const attemptPath = `attempts/${attemptId}`;
    void (async () => {
      try {
        await deleteDoc(doc(db, 'attempts', attemptId));
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, attemptPath);
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      }
    })();
  };

  const handleClearAllAttempts = () => {
    if (!isFullAdmin || history.length === 0) return;
    void (async () => {
      try {
        for (let i = 0; i < history.length; i += 450) {
          const chunk = history.slice(i, i + 450);
          const batch = writeBatch(db);
          chunk.forEach((item) => {
            batch.delete(doc(db, 'attempts', item.id));
          });
          await batch.commit();
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, 'attempts');
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      }
    })();
  };

  const handleSignOut = () => {
    void signOut(auth);
  };

  const handleDownloadHtml = () => {
    if (!isFullAdmin) return;
    downloadStandaloneHtml();
    setDownloadNotice(true);
    window.setTimeout(() => setDownloadNotice(false), 3000);
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-sm font-semibold text-slate-600">
        {lang === 'uz' ? 'Yuklanmoqda...' : 'Loading...'}
      </div>
    );
  }

  if (!authUser || !userProfile) {
    return (
      <AuthGate
        lang={lang}
        onChangeLang={setLang}
        onPrepareSignup={(username, displayName) => {
          pendingSignupRef.current = { username, displayName };
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900">
      <div
        role="alert"
        className="border-b border-rose-800 bg-rose-700 px-4 py-2 text-white sm:px-6"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-center text-xs font-semibold leading-snug sm:text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-100" aria-hidden="true" />
          <span>
            {lang === 'uz'
              ? 'OGOHLANTIRISH: Test paytida veb-kamera nazorati faol — boshqa tarafga burilib qarash, yuzni berkitish, boshqa oyna/desktopga 3 soniyadan ortiq o‘tish, skrinshot olish va Win / Win+G bosish taqiqlanadi (3 ta ogohlantirish tugasa, natija darhol 0 bo‘ladi).'
              : 'WARNING: Real-time webcam proctoring is active — looking away/turning your head, obscuring face, leaving to another tab/window for over 3s, taking screenshots, or pressing Win / Win+G is prohibited (3 warnings = immediate 0 score).'}
          </span>
        </div>
      </div>

      <TopBar
        lang={lang}
        onSelectView={handleSelectView}
        onDownloadHtml={handleDownloadHtml}
        downloadNotice={downloadNotice}
        userProfile={userProfile}
        teacherScope={teacherScope}
        onSignOut={handleSignOut}
        isFullscreen={isFullscreen}
        isQuizRunning={isQuizRunning}
        onToggleFullscreen={handleToggleFullscreen}
        desktopMenuOpen={desktopMenuOpen}
        onToggleDesktopMenu={() => setDesktopMenuOpen((prev) => !prev)}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        notifications={notifications}
        readNotificationIds={readNotificationIds}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      />

      <div className="flex flex-1">
        <SideMenu
          lang={lang}
          activeView={activeView}
          teacherScope={teacherScope}
          userProfile={userProfile}
          desktopOpen={desktopMenuOpen}
          mobileOpen={mobileMenuOpen}
          onCloseDesktop={() => setDesktopMenuOpen(false)}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onSelectView={handleSelectView}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <SubjectBar
            lang={lang}
            onChangeLang={setLang}
            activeSubjectId={activeSubjectId}
            onSelectSubject={handleSelectSubjectFromBar}
            prohibitedSubjects={prohibitedSubjects}
          />

      {isCurrentSubjectProhibited && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-rose-700 p-6 text-center text-white"
        >
          <div className="w-full max-w-2xl rounded-2xl border-2 border-white/40 bg-rose-900/90 p-8 shadow-2xl sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-white">
              <ShieldAlert className="h-11 w-11" aria-hidden="true" />
            </div>

            <h2 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              {lang === 'uz'
                ? `${pickText(activeSubject.shortLabel, lang).toUpperCase()} TESTLARI HOZIRCHA TAQIQLANGAN!`
                : `${pickText(activeSubject.shortLabel, lang).toUpperCase()} QUIZZES ARE PROHIBITED!`}
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-rose-100 sm:text-lg">
              {lang === 'uz'
                ? `Hozircha ${pickText(activeSubject.shortLabel, lang)} fani bo‘yicha testlar o‘qituvchi/admin tomonidan yopilgan. Qo‘llanmani o‘qishda davom etishingiz yoki boshqa ochiq fanlarni tanlashingiz mumkin.`
                : `Quizzes for ${pickText(activeSubject.shortLabel, lang)} are currently prohibited by the teacher/admin. You can still open the study guide or choose another available subject.`}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('guide')}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-6 text-base font-extrabold text-rose-900 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {lang === 'uz' ? 'Qo‘llanmani ochish' : 'Open Study Guide'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const firstOpen = SUBJECTS.find((s) => !prohibitedSubjects.has(s.id));
                  if (firstOpen) {
                    setActiveSubjectId(firstOpen.id);
                  }
                  setActiveView('subjects');
                }}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-white/50 bg-rose-800/70 px-6 text-base font-bold text-white transition-colors hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {lang === 'uz' ? 'Fanlar bo‘limiga qaytish' : 'Back to Subjects'}
              </button>
              <button
                type="button"
                onClick={() => setActiveView('results')}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-white/50 bg-rose-800/70 px-6 text-base font-bold text-white transition-colors hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {lang === 'uz' ? 'Natijalar' : 'Results'}
              </button>
              {teacherScope !== 'none' && (
                <button
                  type="button"
                  onClick={() => setActiveView('permission')}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-white/50 bg-rose-950/70 px-6 text-base font-bold text-white transition-colors hover:bg-rose-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Permission
                </button>
              )}
            </div>

            {SUBJECTS.some((s) => !prohibitedSubjects.has(s.id)) && (
              <div className="mt-6 border-t border-white/20 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-200">
                  {lang === 'uz' ? 'Ochiq fanlardan birini tanlang:' : 'Choose an available subject:'}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {SUBJECTS.filter((s) => !prohibitedSubjects.has(s.id)).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        hasManualSubjectSelectionRef.current = true;
                        setActiveSubjectId(s.id);
                      }}
                      className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-white/30 bg-rose-950/60 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-rose-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {pickText(s.shortLabel, lang)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {pendingNavAction && (
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
                ? 'Hozir boshqa bo‘limga o‘tsangiz, joriy test yakunlanadi va natijasi saqlanadi.'
                : 'Leaving to another section now will finish and submit your current test.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingNavAction(null)}
                className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const proceed = pendingNavAction;
                  setPendingNavAction(null);
                  finishQuizRef.current?.();
                  setIsQuizRunning(false);
                  proceed();
                }}
                className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                Finish the test
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {activeView === 'dashboard' && (
          <DashboardSection
            lang={lang}
            userProfile={userProfile}
            teacherScope={teacherScope}
            history={history}
            prohibitedSubjects={prohibitedSubjects}
            onNavigate={handleSelectView}
            onStartSubjectQuiz={handleStartSubjectQuiz}
            onOpenSubjectGuide={handleOpenSubjectGuide}
          />
        )}

        {activeView === 'subjects' && (
          <OverviewSection
            lang={lang}
            activeSubjectId={activeSubjectId}
            history={history}
            prohibitedSubjects={prohibitedSubjects}
            onStartSubjectQuiz={handleStartSubjectQuiz}
            onOpenSubjectGuide={handleOpenSubjectGuide}
          />
        )}

        {activeView === 'quiz' && !prohibitedSubjects.has(activeSubjectId) && (
          <QuizSection
            subject={activeSubject}
            lang={lang}
            userProfile={userProfile}
            history={history}
            onOpenGuide={() => requestSectionLeave(() => setActiveView('guide'))}
            onRecordAttempt={handleRecordAttempt}
            onRunningStateChange={setIsQuizRunning}
            registerFinishQuiz={(fn) => {
              finishQuizRef.current = fn;
            }}
          />
        )}

        {activeView === 'preview' && teacherScope !== 'none' && (
          <PreviewView lang={lang} teacherScope={teacherScope} />
        )}

        {activeView === 'assign' && teacherScope !== 'none' && (
          <AssignView lang={lang} userProfile={userProfile} teacherScope={teacherScope} />
        )}

        {activeView === 'guide' && (
          <StudyGuidePanel
            subject={activeSubject}
            lang={lang}
            isProhibited={prohibitedSubjects.has(activeSubjectId)}
            onStartQuiz={() => setActiveView('quiz')}
          />
        )}

        {activeView === 'results' && (
          <ResultsHistoryView
            lang={lang}
            history={history}
            teacherScope={teacherScope}
            usersList={usersList}
            onDeleteAttempt={handleDeleteAttempt}
            onClearAllAttempts={handleClearAllAttempts}
            onOpenSubjectQuiz={handleStartSubjectQuiz}
          />
        )}

        {activeView === 'permission' && teacherScope !== 'none' && (
          <PermissionView
            lang={lang}
            teacherScope={teacherScope}
            permissions={subjectPermissions}
            savingSubjectId={savingPermissionId}
            onSetSubjectProhibited={handleSetSubjectProhibited}
          />
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60 py-4 text-center text-xs font-medium text-slate-500">
        Developer: <span className="font-semibold text-slate-700">Ibrohimbek Xujanazarov</span>
      </footer>
        </div>
      </div>
    </div>
  );
}
