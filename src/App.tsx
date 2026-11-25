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
import { useEffect, useRef, useState } from 'react';
import { AuthGate } from './components/AuthGate';
import { OverviewSection } from './components/OverviewSection';
import { QuizSection } from './components/QuizSection';
import { ResultsHistoryView } from './components/ResultsHistoryView';
import { StudyGuidePanel } from './components/StudyGuidePanel';
import { SubjectBar } from './components/SubjectBar';
import { AppView, TeacherScope, TopBar } from './components/TopBar';
import { AttemptRecord, SUBJECT_MAP } from './data/subjects';
import {
  OperationType,
  UserProfile,
  VARIANT_MAX_LEN,
  auth,
  db,
  deriveUsernameFromUser,
  handleFirestoreError,
  isComputingTeacher,
  isTeacherAdmin,
  sanitizeDisplayName,
} from './firebase';
import { SubjectId, UILanguage } from './types/quiz';
import { downloadStandaloneHtml } from './utils/exportHtml';

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
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>('math');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const [downloadNotice, setDownloadNotice] = useState<boolean>(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const pendingSignupRef = useRef<{ username: string; displayName: string } | null>(null);

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
          const teacher = isTeacherAdmin(user) || isComputingTeacher(user);

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
  const teacherScope: TeacherScope = isFullAdmin
    ? 'all'
    : isCompTeacher
      ? 'computing'
      : 'none';

  // Subscribe to attempts only when auth and userProfile are ready
  useEffect(() => {
    if (!authReady || !authUser || !userProfile) return;

    const attemptsCollection = collection(db, 'attempts');
    const attemptsQuery = isFullAdmin
      ? query(attemptsCollection, orderBy('createdAt', 'desc'))
      : isCompTeacher
        ? query(attemptsCollection, where('subjectId', '==', 'computing'))
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
  }, [authReady, authUser, userProfile, isFullAdmin, isCompTeacher]);

  const activeSubject = SUBJECT_MAP[activeSubjectId];

  const handleSelectSubjectFromBar = (id: SubjectId) => {
    setActiveSubjectId(id);
    if (activeView === 'subjects' || activeView === 'results') {
      setActiveView('quiz');
    }
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
        onSelectView={setActiveView}
        onDownloadHtml={handleDownloadHtml}
        downloadNotice={downloadNotice}
        userProfile={userProfile}
        teacherScope={teacherScope}
        onSignOut={handleSignOut}
      />

      <SubjectBar
        lang={lang}
        onChangeLang={setLang}
        activeSubjectId={activeSubjectId}
        onSelectSubject={handleSelectSubjectFromBar}
      />

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

        {activeView === 'quiz' && (
          <QuizSection
            subject={activeSubject}
            lang={lang}
            onOpenGuide={() => setActiveView('guide')}
            onRecordAttempt={handleRecordAttempt}
          />
        )}

        {activeView === 'guide' && (
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
