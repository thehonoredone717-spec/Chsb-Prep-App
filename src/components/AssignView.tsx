import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { AlertCircle, CheckCircle2, KeyRound, RefreshCw, ShieldCheck, UserX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SUBJECTS, pickText } from '../data/subjects';
import {
  COMPUTING_TEACHER_EMAIL,
  ENGLISH_TEACHER_EMAIL,
  HISTORY_TEACHER_EMAIL,
  MATH_TEACHER_EMAIL,
  OWNER_EMAIL,
  SCIENCE_TEACHER_EMAIL,
  STUDENT_EMAIL,
  UserProfile,
  db,
  sanitizeDisplayName,
} from '../firebase';
import { DifficultyLevel, SubjectId, UILanguage } from '../types/quiz';
import { getDifficultyLabel, getVariantLabel } from '../utils/quizEngine';
import { TeacherScope } from './TopBar';

interface StudentAssignmentRecord {
  id: string;
  studentUid: string;
  subjectId: SubjectId;
  difficulty: DifficultyLevel;
  variant: number;
  attemptsAllowed: number;
  attemptsUsed: number;
  retakeCodePending: boolean;
  assignedByUid: string;
  assignedByName: string;
}

interface RetakeCodeRecord {
  id: string;
  assignmentId: string;
  studentUid: string;
  studentName: string;
  subjectId: SubjectId;
  difficulty: DifficultyLevel;
  variant: number;
  code: string;
  status: 'pending' | 'used';
}

interface AssignViewProps {
  lang: UILanguage;
  userProfile: UserProfile;
  teacherScope?: TeacherScope;
}

function generateSixDigitCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return String(num);
}

export function AssignView({ lang, userProfile, teacherScope = 'all' }: AssignViewProps) {
  const uz = lang === 'uz';

  const allowedSubjects = useMemo(() => {
    if (teacherScope === 'all' || teacherScope === 'none') return SUBJECTS;
    return SUBJECTS.filter((s) => s.id === teacherScope);
  }, [teacherScope]);

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignmentRecord[]>([]);
  const [retakeCodes, setRetakeCodes] = useState<RetakeCodeRecord[]>([]);
  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>(
    () => allowedSubjects[0]?.id ?? 'math'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [variantNum, setVariantNum] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (allowedSubjects.length > 0 && !allowedSubjects.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(allowedSubjects[0].id);
    }
  }, [allowedSubjects, selectedSubjectId]);

  useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list = snap.docs.map((d) => {
          const raw = d.data() as Partial<UserProfile>;
          const email = (raw.email || '').toLowerCase();
          const username = (raw.username || d.id).toLowerCase();
          const isUserOwner = email === OWNER_EMAIL || username === 'thehonoredone';
          const isUserSubjectTeacher =
            email === COMPUTING_TEACHER_EMAIL ||
            email === MATH_TEACHER_EMAIL ||
            email === SCIENCE_TEACHER_EMAIL ||
            email === ENGLISH_TEACHER_EMAIL ||
            email === HISTORY_TEACHER_EMAIL;

          const isIbrohim =
            email === STUDENT_EMAIL ||
            username.includes('ibrohim') ||
            Boolean(raw.displayName && raw.displayName.toLowerCase().includes('ibrohim'));

          let role: 'owner' | 'teacher' | 'student' = 'student';
          if (isUserOwner) {
            role = 'owner';
          } else if (isUserSubjectTeacher) {
            role = 'teacher';
          } else {
            role = 'student';
          }

          const userEmail = raw.email || (isIbrohim ? STUDENT_EMAIL : undefined);

          return {
            uid: raw.uid || d.id,
            username: raw.username || d.id,
            displayName:
              raw.displayName || (isIbrohim ? 'Ibrohimbek Xujanazarov' : raw.username || 'Student'),
            email: userEmail,
            role,
          };
        });

        // Guarantee ibrohimbekxujanazarov@gmail.com is present in students list
        const hasIbrohim = list.some(
          (u) =>
            u.email?.toLowerCase() === STUDENT_EMAIL ||
            u.username.toLowerCase().includes('ibrohim')
        );
        if (!hasIbrohim) {
          list.push({
            uid: 'student_ibrohimbek_profile',
            username: 'ibrohimbekxujanazarov',
            displayName: 'Ibrohimbek Xujanazarov',
            email: STUDENT_EMAIL,
            role: 'student',
          });
        }

        const students = list
          .filter((u) => u.role === 'student')
          .sort((a, b) => a.displayName.localeCompare(b.displayName));

        setUsersList(students);
        setSelectedStudentUid((prev) => {
          if (prev && students.some((s) => s.uid === prev)) return prev;
          return students[0]?.uid ?? '';
        });
      },
      (err) => {
        console.error('Failed to load users list:', err);
      }
    );

    const unsubAssignments = onSnapshot(
      collection(db, 'studentAssignments'),
      (snap) => {
        const list = snap.docs.map((d) => {
          const raw = d.data() as Partial<StudentAssignmentRecord>;
          return {
            id: raw.id || d.id,
            studentUid: raw.studentUid || '',
            subjectId: (raw.subjectId as SubjectId) || 'math',
            difficulty: raw.difficulty || 'easy',
            variant: raw.variant || 1,
            attemptsAllowed: typeof raw.attemptsAllowed === 'number' ? raw.attemptsAllowed : 1,
            attemptsUsed: typeof raw.attemptsUsed === 'number' ? raw.attemptsUsed : 0,
            retakeCodePending: raw.retakeCodePending === true,
            assignedByUid: raw.assignedByUid || '',
            assignedByName: raw.assignedByName || '',
          };
        });
        setAssignments(list);
      },
      (err) => {
        console.error('Failed to load assignments:', err);
      }
    );

    const retakeQuery =
      teacherScope === 'all' || teacherScope === 'none'
        ? collection(db, 'retakeCodes')
        : query(collection(db, 'retakeCodes'), where('subjectId', '==', teacherScope));

    const unsubRetakeCodes = onSnapshot(
      retakeQuery,
      (snap) => {
        const list = snap.docs.map((d) => {
          const raw = d.data() as Partial<RetakeCodeRecord>;
          return {
            id: raw.id || d.id,
            assignmentId: raw.assignmentId || d.id,
            studentUid: raw.studentUid || '',
            studentName: raw.studentName || 'Student',
            subjectId: (raw.subjectId as SubjectId) || 'math',
            difficulty: raw.difficulty || 'easy',
            variant: typeof raw.variant === 'number' ? raw.variant : 1,
            code: raw.code || '',
            status: (raw.status === 'used' ? 'used' : 'pending') as 'pending' | 'used',
          };
        });
        setRetakeCodes(list);
      },
      (err) => {
        console.error('Failed to load retake codes:', err);
      }
    );

    return () => {
      unsubUsers();
      unsubAssignments();
      unsubRetakeCodes();
    };
  }, [teacherScope]);

  const maxVariants = selectedSubjectId === 'math' ? 20 : 5;

  const handleSubjectChange = (nextSubjectId: SubjectId) => {
    setSelectedSubjectId(nextSubjectId);
    const nextMax = nextSubjectId === 'math' ? 20 : 5;
    if (variantNum > nextMax) {
      setVariantNum(nextMax);
    }
  };

  const handleAssign = () => {
    if (!selectedStudentUid) return;
    const clampedVariant = Math.max(1, Math.min(maxVariants, Number(variantNum) || 1));
    const assignmentId = `${selectedStudentUid}_${selectedSubjectId}_${difficulty}`;
    setSaving(true);
    setFeedback(null);

    void (async () => {
      try {
        await setDoc(doc(db, 'studentAssignments', assignmentId), {
          id: assignmentId,
          studentUid: selectedStudentUid,
          subjectId: selectedSubjectId,
          difficulty,
          variant: clampedVariant,
          attemptsAllowed: 1,
          attemptsUsed: 0,
          retakeCodePending: false,
          assignedByUid: userProfile.uid,
          assignedByName: sanitizeDisplayName(userProfile.displayName, userProfile.username),
          updatedAt: serverTimestamp(),
        });
        void deleteDoc(doc(db, 'retakeCodes', assignmentId)).catch(() => {});
        const student = usersList.find((u) => u.uid === selectedStudentUid);
        setFeedback({
          type: 'success',
          text: uz
            ? `${student ? student.displayName : 'O‘quvchi'} uchun ${getVariantLabel(clampedVariant, lang)} (1 marta urinish) muvaffaqiyatli biriktirildi.`
            : `Assigned ${getVariantLabel(clampedVariant, lang)} (1 attempt) to ${student ? student.displayName : 'student'}.`,
        });
      } catch (err) {
        console.error('Failed to assign variant:', err);
        setFeedback({
          type: 'error',
          text: uz
            ? 'Variantni biriktirishda xatolik yuz berdi. Ruxsatlarni tekshiring.'
            : 'Failed to assign variant. Please check permissions.',
        });
      } finally {
        setSaving(false);
      }
    })();
  };

  const handleIssueRetakeCode = (asg: StudentAssignmentRecord) => {
    setFeedback(null);
    const newCode = generateSixDigitCode();
    const st = usersList.find((u) => u.uid === asg.studentUid);
    const studentName = sanitizeDisplayName(
      st?.displayName ||
        (asg.studentUid === 'student_ibrohimbek_profile' ? 'Ibrohimbek Xujanazarov' : 'Student'),
      'Student'
    );
    const existingCode = retakeCodes.find((rc) => rc.id === asg.id);

    void (async () => {
      try {
        const batch = writeBatch(db);
        const codeRef = doc(db, 'retakeCodes', asg.id);
        if (existingCode) {
          batch.update(codeRef, {
            code: newCode,
            status: 'pending',
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.set(codeRef, {
            id: asg.id,
            assignmentId: asg.id,
            studentUid: asg.studentUid,
            studentName,
            subjectId: asg.subjectId,
            difficulty: asg.difficulty,
            variant: asg.variant,
            code: newCode,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        batch.update(doc(db, 'studentAssignments', asg.id), {
          retakeCodePending: true,
          assignedByUid: userProfile.uid,
          assignedByName: sanitizeDisplayName(userProfile.displayName, userProfile.username),
          updatedAt: serverTimestamp(),
        });

        await batch.commit();
        setFeedback({
          type: 'success',
          text: uz
            ? `${studentName} uchun 2-urinish kodi yaratildi: ${newCode}`
            : `Generated 2nd-attempt unlock code for ${studentName}: ${newCode}`,
        });
      } catch (err) {
        console.error('Failed to issue retake code:', err);
        setFeedback({
          type: 'error',
          text: uz
            ? 'Qayta ishlash kodini yaratishda xatolik yuz berdi.'
            : 'Failed to generate retake code.',
        });
      }
    })();
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    setFeedback(null);
    void (async () => {
      try {
        await deleteDoc(doc(db, 'studentAssignments', assignmentId));
        void deleteDoc(doc(db, 'retakeCodes', assignmentId)).catch(() => {});
        setFeedback({
          type: 'success',
          text: uz ? 'Biriktirish o‘chirildi.' : 'Assignment removed.',
        });
      } catch (err) {
        console.error('Failed to remove assignment:', err);
        setFeedback({
          type: 'error',
          text: uz
            ? 'Biriktirishni o‘chirishda xatolik yuz berdi.'
            : 'Failed to remove assignment.',
        });
      }
    })();
  };

  const visibleAssignments = useMemo(() => {
    if (teacherScope === 'all' || teacherScope === 'none') return assignments;
    return assignments.filter((a) => a.subjectId === teacherScope);
  }, [assignments, teacherScope]);

  return (
    <section className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {uz ? 'Assign Variant — O‘quvchiga variant biriktirish' : 'Assign Variant to Student'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {uz
            ? 'Har bir o‘quvchiga har bir fan va daraja uchun aniq bir variant biriktiring. O‘quvchi faqat o‘ziga biriktirilgan variantga kira oladi.'
            : 'Assign a specific test variant to each student per subject and difficulty tier. Students can only take their assigned variant.'}
        </p>
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-sm font-semibold ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Assignment Builder Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="font-display text-base font-bold text-slate-900">
          {uz ? 'Yangi biriktirish qo‘shish' : 'Create / Update Assignment'}
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {uz ? 'O‘quvchi' : 'Student'}
            </label>
            <select
              value={selectedStudentUid}
              onChange={(e) => setSelectedStudentUid(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
            >
              {usersList.length === 0 ? (
                <option value="">{uz ? 'O‘quvchilar topilmadi' : 'No students found'}</option>
              ) : (
                usersList.map((st) => (
                  <option key={st.uid} value={st.uid}>
                    {st.displayName} ({st.email || `@${st.username}`})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {uz ? 'Fan' : 'Subject'}
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value as SubjectId)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
            >
              {allowedSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {pickText(s.title, lang)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {uz ? 'Daraja' : 'Difficulty'}
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
            >
              <option value="easy">{uz ? 'Oson (Easy)' : 'Easy'}</option>
              <option value="medium">{uz ? 'O‘rta (Medium)' : 'Medium'}</option>
              <option value="hard">{uz ? 'Qiyin (Hard)' : 'Hard'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              {uz ? 'Variant raqami' : 'Variant Number'}
            </label>
            <select
              value={variantNum}
              onChange={(e) => setVariantNum(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
            >
              {Array.from({ length: maxVariants }, (_, i) => i + 1).map((v) => (
                <option key={v} value={v}>
                  {getVariantLabel(v, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={saving || !selectedStudentUid}
            onClick={handleAssign}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-teal-700 px-6 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>{uz ? 'Variantni biriktirish' : 'Assign Variant'}</span>
          </button>
        </div>
      </div>

      {/* Existing Assignments Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="font-display text-base font-bold text-slate-900">
          {uz ? 'Biriktirilgan variantlar ro‘yxati' : 'Current Active Assignments'}
        </h2>

        {visibleAssignments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            {uz ? 'Hali hech qanday variant biriktirilmagan.' : 'No active student assignments found.'}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-700">
                <tr>
                  <th className="px-4 py-3">{uz ? 'O‘quvchi' : 'Student'}</th>
                  <th className="px-4 py-3">{uz ? 'Fan' : 'Subject'}</th>
                  <th className="px-4 py-3">{uz ? 'Daraja' : 'Difficulty'}</th>
                  <th className="px-4 py-3">{uz ? 'Variant' : 'Variant'}</th>
                  <th className="px-4 py-3">{uz ? 'Urinish / 2-kod' : 'Attempts / Code'}</th>
                  <th className="px-4 py-3">{uz ? 'Biriktirgan' : 'Assigned By'}</th>
                  <th className="px-4 py-3 text-right">{uz ? 'Amal' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleAssignments.map((asg) => {
                  const st = usersList.find((u) => u.uid === asg.studentUid);
                  const sub = SUBJECTS.find((s) => s.id === asg.subjectId);
                  const rc = retakeCodes.find((item) => item.id === asg.id);
                  const studentLabel = st
                    ? `${st.displayName} (${st.email || `@${st.username}`})`
                    : asg.studentUid === 'student_ibrohimbek_profile'
                      ? `Ibrohimbek Xujanazarov (${STUDENT_EMAIL})`
                      : asg.studentUid.slice(0, 10);

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">{studentLabel}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {sub ? pickText(sub.shortLabel, lang) : asg.subjectId}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {getDifficultyLabel(asg.difficulty, lang)}
                      </td>
                      <td className="px-4 py-3 font-bold text-teal-700">
                        {getVariantLabel(asg.variant, lang)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono-num rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                            {asg.attemptsUsed}/{asg.attemptsAllowed}
                          </span>
                          {rc?.status === 'pending' && rc.code ? (
                            <span className="font-mono-num inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-xs font-extrabold text-indigo-800 ring-1 ring-indigo-200">
                              <KeyRound className="h-3 w-3" aria-hidden="true" />
                              <span>{rc.code}</span>
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleIssueRetakeCode(asg)}
                            title={
                              uz
                                ? '2-urinish uchun yangi 6 xonali kod yaratish'
                                : 'Generate fresh 6-digit retake code'
                            }
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            <RefreshCw className="h-3 w-3" aria-hidden="true" />
                            <span>{rc?.status === 'pending' ? (uz ? 'Yangilash' : 'Rotate') : (uz ? 'Kod berish' : 'Issue Code')}</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{asg.assignedByName}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignment(asg.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100"
                        >
                          <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{uz ? 'O‘chirish' : 'Remove'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
