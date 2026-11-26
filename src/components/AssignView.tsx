import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { Award, CheckCircle2, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SUBJECTS, pickText } from '../data/subjects';
import {
  COMPUTING_TEACHER_EMAIL,
  ENGLISH_TEACHER_EMAIL,
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

interface StudentAssignmentRecord {
  id: string;
  studentUid: string;
  subjectId: SubjectId;
  difficulty: DifficultyLevel;
  variant: number;
  assignedByUid: string;
  assignedByName: string;
}

interface AssignViewProps {
  lang: UILanguage;
  userProfile: UserProfile;
}

export function AssignView({ lang, userProfile }: AssignViewProps) {
  const uz = lang === 'uz';
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignmentRecord[]>([]);
  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('math');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [variantNum, setVariantNum] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const list = snap.docs.map((d) => {
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
          email === STUDENT_EMAIL ||
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

        const userEmail = raw.email || (isIbrohim ? STUDENT_EMAIL : undefined);

        return {
          uid: raw.uid || d.id,
          username: raw.username || d.id,
          displayName: raw.displayName || (isIbrohim ? 'Ibrohimbek Xujanazarov' : raw.username || 'Student'),
          email: userEmail,
          role,
        };
      });

      // Guarantee ibrohimbekxujanazarov@gmail.com is present in students list
      const hasIbrohim = list.some(
        (u) =>
          u.email === STUDENT_EMAIL ||
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

      const students = list.filter((u) => u.role === 'student');
      setUsersList(students);
      if (students.length > 0 && !selectedStudentUid) {
        setSelectedStudentUid(students[0].uid);
      }
    });

    const unsubAssignments = onSnapshot(collection(db, 'studentAssignments'), (snap) => {
      const list = snap.docs.map((d) => {
        const raw = d.data() as Partial<StudentAssignmentRecord>;
        return {
          id: raw.id || d.id,
          studentUid: raw.studentUid || '',
          subjectId: (raw.subjectId as SubjectId) || 'math',
          difficulty: raw.difficulty || 'easy',
          variant: raw.variant || 1,
          assignedByUid: raw.assignedByUid || '',
          assignedByName: raw.assignedByName || '',
        };
      });
      setAssignments(list);
    });

    return () => {
      unsubUsers();
      unsubAssignments();
    };
  }, [selectedStudentUid]);

  const maxVariants = selectedSubjectId === 'math' ? 20 : 5;

  const handleAssign = () => {
    if (!selectedStudentUid) return;
    const assignmentId = `${selectedStudentUid}_${selectedSubjectId}_${difficulty}`;
    setSaving(true);

    void (async () => {
      try {
        await setDoc(doc(db, 'studentAssignments', assignmentId), {
          id: assignmentId,
          studentUid: selectedStudentUid,
          subjectId: selectedSubjectId,
          difficulty,
          variant: Number(variantNum),
          assignedByUid: userProfile.uid,
          assignedByName: sanitizeDisplayName(userProfile.displayName, userProfile.username),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Failed to assign variant:', err);
      } finally {
        setSaving(false);
      }
    })();
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    void (async () => {
      try {
        await deleteDoc(doc(db, 'studentAssignments', assignmentId));
      } catch (err) {
        console.error('Failed to remove assignment:', err);
      }
    })();
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {uz ? 'Assign Variant — O‘quvchiga variant biriktirish' : 'Assign Variant to Student'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {uz
            ? 'Har bir o‘quvchiga har bir fan va daraja uchun aniq birvariant biriktiring. O‘quvchi faqat o‘ziga biriktirilgan variantga kira oladi.'
            : 'Assign a specific test variant to each student per subject and difficulty tier. Students can only take their assigned variant.'}
        </p>
      </div>

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
                    {st.displayName} (@{st.username})
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
              onChange={(e) => setSelectedSubjectId(e.target.value as SubjectId)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
            >
              {SUBJECTS.map((s) => (
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

        {assignments.length === 0 ? (
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
                  <th className="px-4 py-3">{uz ? 'Biriktirgan' : 'Assigned By'}</th>
                  <th className="px-4 py-3 text-right">{uz ? 'Amal' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((asg) => {
                  const st = usersList.find((u) => u.uid === asg.studentUid);
                  const sub = SUBJECTS.find((s) => s.id === asg.subjectId);
                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {st ? `${st.displayName} (@${st.username})` : asg.studentUid.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {sub ? pickText(sub.shortLabel, lang) : asg.subjectId}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {getDifficultyLabel(asg.difficulty, lang)}
                      </td>
                      <td className="px-4 py-3 font-bold text-teal-700">
                        {getVariantLabel(asg.variant, lang)}
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
