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
import { ShieldAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AuthGate } from './components/AuthGate';
import { OverviewSection } from './components/OverviewSection';
import { QuizSection } from './components/QuizSection';
import { ResultsHistoryView } from './components/ResultsHistoryView';
import { StudyGuidePanel } from './components/StudyGuidePanel';
import { SubjectBar } from './components/SubjectBar';
import { AppView, TeacherScope, TopBar } from './components/TopBar';
import {
  AttemptRecord,
  PROHIBITED_SUBJECTS,
  SUBJECTS,
  SUBJECT_MAP,
  pickText,
} from './data/subjects';
import {
  OperationType,
  UserProfile,
  VARIANT_MAX_LEN,
  auth,
  db,
  deriveUsernameFromUser,
  handleFirestoreError,
  isComputingTeacher,
  isMathTeacher,
  isTeacherAdmin,
  sanitizeDisplayName,
} from './firebase';
import { SubjectId, UILanguage } from './types/quiz';
import { downloadStandaloneHtml } from './utils/exportHtml';
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
  const [activeView, setActiveView] = useState<AppView>('quiz');
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>('history');
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

  const pendingSignupRef = useRef<{ username: string; displayName: string } | null>(null);
  const finishQuizRef = useRef<(() => void) | null>(null);
  const hasAttemptedFirstFullscreenRef = useRef<boolean>(false);

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

  // Enter fullscreen automatically on site visit (plus on first interaction if blocked before gesture)
  useEffect(() => {
    const syncFullscreen = () => {
      const active = isFullscreenActive();
      setIsFullscreen(active);
      if (active) {
        hasAttemptedFirstFullscreenRef.current = true;
      }
    };

    void requestAppFullscreen().then((entered) => {
      if (entered) {
        hasAttemptedFirstFullscreenRef.current = true;
        setIsFullscreen(true);
      }
    });

    const handleFirstGesture = () => {
      if (hasAttemptedFirstFullscreenRef.current || isFullscreenActive()) {
        hasAttemptedFirstFullscreenRef.current = true;
        return;
      }
      hasAttemptedFirstFullscreenRef.current = true;
      void requestAppFullscreen().then((entered) => {
        if (entered) setIsFullscreen(true);
      });
    };

    const handleBlockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    document.addEventListener('contextmenu', handleBlockContextMenu, { capture: true });
    window.addEventListener('click', handleFirstGesture, { capture: true });
    window.addEventListener('keydown', handleFirstGesture, { capture: true });

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
      document.removeEventListener('contextmenu', handleBlockContextMenu, { capture: true });
      window.removeEventListener('click', handleFirstGesture, { capture: true });
      window.removeEventListener('keydown', handleFirstGesture, { capture: true });
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
      hasAttemptedFirstFullscreenRef.current = true;
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
        setAuthReady(true);
        return;
      }

      setAuthReady(false);
      const userDocPath = `users/${user.uid}`;
      const userDocRef = doc(db, 'users', user.uid);

      void (async () => {
        try {
          const snap = await getDoc(userDocRef);
          const teacher =
            isTeacherAdmin(user) || isComputingTeacher(user) || isMathTeacher(user);

          if (!snap.exists()) {
            const pending = pendingSignupRef.current;
            pendingSignupRef.current = null;
            const username = deriveUsernameFromUser(user, pending?.username);
            const displayName = sanitizeDisplayName(
              pending?.displayName ?? user.displayName,
              username
            );
            const role: 'student' | 'teacher' = teacher ? 'teacher' : 'student';

            try {
              await setDoc(userDocRef, {
                uid: user.uid,
                username,
                displayName,
                role,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (writeErr) {
              handleFirestoreError(writeErr, OperationType.CREATE, userDocPath);
            }

            setUserProfile({ uid: user.uid, username, displayName, role });
          } else {
            const data = snap.data() as Partial<UserProfile>;
            const profile: UserProfile = {
              uid: user.uid,
              username: deriveUsernameFromUser(user, data.username),
              displayName: sanitizeDisplayName(data.displayName, data.username || 'Student'),
              role: teacher ? 'teacher' : data.role === 'teacher' ? 'teacher' : 'student',
            };

            if (teacher && data.role !== 'teacher') {
              try {
                await updateDoc(userDocRef, {
                  role: 'teacher',
                  updatedAt: serverTimestamp(),
                });
              } catch (updErr) {
                handleFirestoreError(updErr, OperationType.UPDATE, userDocPath);
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
  const teacherScope: TeacherScope = isFullAdmin
    ? 'all'
    : isCompTeacher
      ? 'computing'
      : isMathTch
        ? 'math'
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

    let unsubscribeUsers = () => {};
    if (isFullAdmin) {
      unsubscribeUsers = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const profiles: UserProfile[] = snapshot.docs.map((d) => {
            const raw = d.data() as Partial<UserProfile>;
            return {
              uid: raw.uid || d.id,
              username: raw.username || d.id,
              displayName: raw.displayName || raw.username || 'Student',
              role: raw.role === 'teacher' ? 'teacher' : 'student',
            };
          });
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
    }

    return () => {
      unsubscribeAttempts();
      unsubscribeUsers();
    };
  }, [authReady, authUser, userProfile, isFullAdmin, isCompTeacher, isMathTch]);

  const activeSubject = SUBJECT_MAP[activeSubjectId];

  const requestSectionLeave = (action: () => void) => {
    if (activeView === 'quiz' && isQuizRunning) {
      setPendingNavAction(() => action);
      return;
    }
    action();
  };

  const handleSelectView = (view: AppView) => {
    if (view === activeView) return;
    requestSectionLeave(() => setActiveView(view));
  };

  const handleSelectSubjectFromBar = (id: SubjectId) => {
    if (id === activeSubjectId && activeView === 'quiz') return;
    requestSectionLeave(() => {
      setActiveSubjectId(id);
      if (activeView === 'subjects' || activeView === 'results') {
        setActiveView('quiz');
      }
    });
  };

  const handleStartSubjectQuiz = (id: SubjectId) => {
    setActiveSubjectId(id);
    setActiveView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubjectGuide = (id: SubjectId) => {
    setActiveSubjectId(id);
    setActiveView('guide');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecordAttempt = (record: AttemptRecord) => {
    if (!authUser || !userProfile) return;
    if (PROHIBITED_SUBJECTS.has(record.subjectId)) return;

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <TopBar
        lang={lang}
        activeView={activeView}
        onSelectView={handleSelectView}
        onDownloadHtml={handleDownloadHtml}
        downloadNotice={downloadNotice}
        userProfile={userProfile}
        teacherScope={teacherScope}
        onSignOut={handleSignOut}
        isFullscreen={isFullscreen}
        isQuizRunning={isQuizRunning}
        onToggleFullscreen={handleToggleFullscreen}
      />

      <SubjectBar
        lang={lang}
        onChangeLang={setLang}
        activeSubjectId={activeSubjectId}
        onSelectSubject={handleSelectSubjectFromBar}
      />

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

      {PROHIBITED_SUBJECTS.has(activeSubjectId) &&
        (activeView === 'quiz' || activeView === 'guide') && (
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
                  ? 'MATEMATIKA BO‘LIMI HOZIRCHA TAQIQLANGAN!'
                  : 'MATH SECTION IS CURRENTLY PROHIBITED!'}
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-rose-100 sm:text-lg">
                {lang === 'uz'
                  ? 'Hozircha Matematika bo‘limi, uning testlari va qo‘llanmasi vaqtincha yopiq. Iltimos, boshqa fanlarni tanlang.'
                  : 'The Math section, its quizzes, and its study guide are temporarily prohibited for now. Please choose another subject.'}
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubjectId('history');
                    setActiveView('subjects');
                  }}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-6 text-base font-extrabold text-rose-900 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
              </div>

              <div className="mt-6 border-t border-white/20 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-200">
                  {lang === 'uz' ? 'Ochiq fanlardan birini tanlang:' : 'Choose an available subject:'}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {SUBJECTS.filter((s) => !PROHIBITED_SUBJECTS.has(s.id)).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveSubjectId(s.id)}
                      className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-white/30 bg-rose-950/60 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-rose-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {pickText(s.shortLabel, lang)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {activeView === 'subjects' && (
          <OverviewSection
            lang={lang}
            activeSubjectId={activeSubjectId}
            history={history}
            onStartSubjectQuiz={handleStartSubjectQuiz}
            onOpenSubjectGuide={handleOpenSubjectGuide}
          />
        )}

        {activeView === 'quiz' && !PROHIBITED_SUBJECTS.has(activeSubjectId) && (
          <QuizSection
            subject={activeSubject}
            lang={lang}
            onOpenGuide={() => requestSectionLeave(() => setActiveView('guide'))}
            onRecordAttempt={handleRecordAttempt}
            onRunningStateChange={setIsQuizRunning}
            registerFinishQuiz={(fn) => {
              finishQuizRef.current = fn;
            }}
          />
        )}

        {activeView === 'guide' && !PROHIBITED_SUBJECTS.has(activeSubjectId) && (
          <StudyGuidePanel
            subject={activeSubject}
            lang={lang}
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
      </main>
    </div>
  );
}
