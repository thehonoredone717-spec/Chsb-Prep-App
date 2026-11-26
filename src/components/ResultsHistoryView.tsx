import {
  Award,
  BarChart3,
  Download,
  Printer,
  Sparkles,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AttemptRecord, SUBJECTS, SUBJECT_MAP, UI_COPY, pickText } from '../data/subjects';
import { UserProfile } from '../firebase';
import { SubjectId, UILanguage } from '../types/quiz';
import { formatTime, getDifficultyLabel } from '../utils/quizEngine';
import { CertificateModal } from './CertificateModal';
import { TeacherScope } from './TopBar';

interface ResultsHistoryViewProps {
  lang: UILanguage;
  history: AttemptRecord[];
  teacherScope: TeacherScope;
  usersList: UserProfile[];
  onDeleteAttempt: (attemptId: string) => void;
  onClearAllAttempts: () => void;
  onOpenSubjectQuiz: (id: SubjectId) => void;
}

export function ResultsHistoryView({
  lang,
  history,
  teacherScope,
  usersList,
  onDeleteAttempt,
  onClearAllAttempts,
  onOpenSubjectQuiz,
}: ResultsHistoryViewProps) {
  const copy = UI_COPY[lang];
  const isAnyTeacher = teacherScope !== 'none';
  const canManage = teacherScope === 'all';
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [selectedCertAttempt, setSelectedCertAttempt] = useState<AttemptRecord | null>(null);

  const uz = lang === 'uz';

  const studentOptions = useMemo(() => {
    const map = new Map<string, { userId: string; label: string }>();
    usersList.forEach((u) => {
      map.set(u.uid, { userId: u.uid, label: `${u.displayName} (@${u.username})` });
    });
    history.forEach((item) => {
      if (item.userId && !map.has(item.userId)) {
        map.set(item.userId, {
          userId: item.userId,
          label: `${item.studentName || item.username || item.userId} ${item.username ? `(@${item.username})` : ''}`.trim(),
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [history, usersList]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (teacherScope === 'computing' && item.subjectId !== 'computing') {
        return false;
      }
      if (teacherScope === 'math' && item.subjectId !== 'math') {
        return false;
      }
      if (teacherScope === 'science' && item.subjectId !== 'science') {
        return false;
      }
      if (teacherScope === 'english' && item.subjectId !== 'english') {
        return false;
      }
      if (isAnyTeacher && studentFilter !== 'all' && item.userId !== studentFilter) {
        return false;
      }
      if (
        teacherScope !== 'computing' &&
        teacherScope !== 'math' &&
        teacherScope !== 'science' &&
        teacherScope !== 'english' &&
        subjectFilter !== 'all' &&
        item.subjectId !== subjectFilter
      ) {
        return false;
      }
      return true;
    });
  }, [history, teacherScope, isAnyTeacher, studentFilter, subjectFilter]);

  const teacherStats = useMemo(() => {
    const total = filteredHistory.length;
    const uniqueStudents = new Set(
      filteredHistory.map((h) => h.userId || h.username || 'unknown')
    ).size;
    const avgPct =
      total > 0
        ? Math.round(
            filteredHistory.reduce((sum, item) => sum + item.percentage, 0) / total
          )
        : 0;
    const gradeFives = filteredHistory.filter((item) => item.grade === 5).length;
    const gradeFours = filteredHistory.filter((item) => item.grade === 4).length;
    const gradeThrees = filteredHistory.filter((item) => item.grade <= 3).length;

    const fivePct = total > 0 ? Math.round((gradeFives / total) * 100) : 0;
    const fourPct = total > 0 ? Math.round((gradeFours / total) * 100) : 0;
    const threePct = total > 0 ? Math.max(0, 100 - fivePct - fourPct) : 0;

    return { total, uniqueStudents, avgPct, gradeFives, gradeFours, gradeThrees, fivePct, fourPct, threePct };
  }, [filteredHistory]);

  // Top 3 Scholars / Leaderboard
  const topScholars = useMemo(() => {
    return [...filteredHistory]
      .filter((h) => !h.cheated)
      .sort((a, b) => b.percentage - a.percentage || a.elapsedSeconds - b.elapsedSeconds)
      .slice(0, 3);
  }, [filteredHistory]);

  const exportGradebookCsv = () => {
    if (filteredHistory.length === 0) return;
    const headers = [
      'No',
      uz ? "O'quvchi ismi" : 'Student Name',
      'Username',
      uz ? 'Fan' : 'Subject',
      uz ? 'Daraja' : 'Difficulty',
      'Variant',
      uz ? 'Rejim' : 'Mode',
      uz ? 'Ball' : 'Score',
      uz ? 'Jami' : 'Total',
      uz ? 'Foiz' : 'Percentage',
      uz ? 'Baho' : 'Grade',
      uz ? 'Vaqt (soniya)' : 'Time (sec)',
      uz ? 'Topshirilgan vaqt' : 'Completed Date',
      uz ? 'Qoidabuzarlik' : 'Cheated',
    ];

    const rows = filteredHistory.map((item, idx) => {
      const subject = SUBJECT_MAP[item.subjectId];
      const subjectName = subject ? pickText(subject.shortLabel, lang) : item.subjectId;
      return [
        idx + 1,
        `"${(item.studentName || item.username || 'Student').replace(/"/g, '""')}"`,
        `"${(item.username || '').replace(/"/g, '""')}"`,
        `"${subjectName.replace(/"/g, '""')}"`,
        `"${item.difficulty || ''}"`,
        `"${item.variant || ''}"`,
        item.mode,
        item.score,
        item.total,
        `${item.percentage}%`,
        item.grade,
        item.elapsedSeconds,
        `"${item.completedAt}"`,
        item.cheated ? 'YES' : 'NO',
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ChSB_Gradebook_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printGradebook = () => {
    window.print();
  };

  const headingTitle =
    teacherScope === 'all'
      ? copy.ownerResultsTitle
      : teacherScope === 'computing'
        ? copy.computingResultsTitle
        : teacherScope === 'math'
          ? copy.mathResultsTitle
          : teacherScope === 'science'
            ? copy.scienceResultsTitle
            : teacherScope === 'english'
              ? copy.englishResultsTitle
              : copy.historyTitle;

  return (
    <section className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {headingTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{copy.gradingScaleNote}</p>
          <p className="mt-0.5 text-xs text-slate-500">{copy.resultsSyncNote}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          {filteredHistory.length > 0 && (
            <>
              <button
                type="button"
                onClick={exportGradebookCsv}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                title={uz ? 'Excel / CSV formatida yuklab olish' : 'Export as CSV'}
              >
                <Download className="h-4 w-4 text-teal-700" />
                <span>{uz ? 'CSV / Excel Yuklash' : 'Export CSV'}</span>
              </button>

              <button
                type="button"
                onClick={printGradebook}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-teal-700 px-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                title={uz ? 'Qaydnomani chop etish' : 'Print Gradebook'}
              >
                <Printer className="h-4 w-4" />
                <span>{uz ? 'Qaydnomani chop etish' : 'Print Gradebook'}</span>
              </button>
            </>
          )}

          {canManage && history.length > 0 && (
            <button
              type="button"
              onClick={onClearAllAttempts}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>{copy.clearHistory}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="space-y-4">
        {isAnyTeacher && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-medium text-slate-500">{copy.totalAttempts}</p>
              <p className="font-mono-num mt-1 text-2xl font-bold text-slate-900">
                {teacherStats.total}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-medium text-slate-500">{copy.activeStudents}</p>
              <p className="font-mono-num mt-1 text-2xl font-bold text-slate-900">
                {teacherStats.uniqueStudents}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-medium text-slate-500">{copy.averagePct}</p>
              <p className="font-mono-num mt-1 text-2xl font-bold text-teal-700">
                {teacherStats.avgPct}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-medium text-slate-500">{copy.gradeFiveCount}</p>
              <p className="font-mono-num mt-1 text-2xl font-bold text-emerald-700">
                {teacherStats.gradeFives}
              </p>
            </div>
          </div>
        )}

        {/* Grade Distribution Bar & Top Scholars */}
        {teacherStats.total > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 print:hidden">
            {/* Grade Distribution Visualizer */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-teal-700" />
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    {uz ? 'Baholar Statistikasi (O‘zlashtirish tahlili)' : 'Grade Distribution Analytics'}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {teacherStats.total} {uz ? 'ta test' : 'submissions'}
                </span>
              </div>

              {/* Stacked Progress Bar */}
              <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  style={{ width: `${teacherStats.fivePct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`5 (A'lo): ${teacherStats.fivePct}%`}
                />
                <div
                  style={{ width: `${teacherStats.fourPct}%` }}
                  className="bg-teal-500 transition-all duration-500"
                  title={`4 (Yaxshi): ${teacherStats.fourPct}%`}
                />
                <div
                  style={{ width: `${teacherStats.threePct}%` }}
                  className="bg-amber-400 transition-all duration-500"
                  title={`3 (Qoniqarsiz): ${teacherStats.threePct}%`}
                />
              </div>

              {/* Legend with numbers */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-700">
                    5 (A'lo, 86–100%): <strong className="text-emerald-700">{teacherStats.gradeFives} ({teacherStats.fivePct}%)</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-teal-500" />
                  <span className="text-slate-700">
                    4 (Yaxshi, 65–85%): <strong className="text-teal-700">{teacherStats.gradeFours} ({teacherStats.fourPct}%)</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="text-slate-700">
                    3 (0–64%): <strong className="text-amber-700">{teacherStats.gradeThrees} ({teacherStats.threePct}%)</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Top Scholars / Honor Roll */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {uz ? 'Eng Yuqori Natijalar (Top Scholars)' : 'Honor Roll (Top Scholars)'}
                </h3>
              </div>

              <div className="mt-3 space-y-2">
                {topScholars.length === 0 ? (
                  <p className="text-xs text-slate-500">{uz ? 'Hali natijalar yo‘q' : 'No records yet'}</p>
                ) : (
                  topScholars.map((top, rankIdx) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const subject = SUBJECT_MAP[top.subjectId];
                    return (
                      <div
                        key={top.id}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{medals[rankIdx]}</span>
                          <div>
                            <p className="font-bold text-slate-900">
                              {top.studentName || top.username || 'Student'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {subject ? pickText(subject.shortLabel, lang) : top.subjectId} · {top.variant}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-teal-700">
                            {top.score}/{top.total} ({top.percentage}%)
                          </span>
                          <span className="ml-1.5 rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-800">
                            {top.grade}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          {isAnyTeacher && (
            <select
              aria-label={copy.studentCol}
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            >
              <option value="all">{copy.allStudents}</option>
              {studentOptions.map((opt) => (
                <option key={opt.userId} value={opt.userId}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {teacherScope !== 'computing' &&
            teacherScope !== 'math' &&
            teacherScope !== 'science' &&
            teacherScope !== 'english' && (
            <select
              aria-label={copy.subjectCol}
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            >
              <option value="all">{copy.allSubjects}</option>
              {SUBJECTS.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  {pickText(subj.shortLabel, lang)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Printable School Header when Printing */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-4 text-center">
        <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
          7-Sinf ChSB Imtihon Natijalari Rasmiy Qaydnomasi
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Sana: {new Date().toLocaleDateString()} · Jami urinishlar: {teacherStats.total} · O'rtacha o'zlashtirish: {teacherStats.avgPct}%
        </p>
      </div>

      {/* Results Table */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          {copy.historyEmpty}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">№</th>
                  {isAnyTeacher && <th className="px-4 py-3">{copy.studentCol}</th>}
                  <th className="px-4 py-3">{copy.subjectCol}</th>
                  <th className="px-4 py-3">{copy.variantCol}</th>
                  <th className="px-4 py-3">{copy.modeCol}</th>
                  <th className="px-4 py-3">{copy.scoreLabel}</th>
                  <th className="px-4 py-3">{copy.gradeLabel}</th>
                  <th className="px-4 py-3">{copy.timeLabel}</th>
                  <th className="px-4 py-3">{copy.dateCol}</th>
                  <th className="px-4 py-3 text-center print:hidden">Guvohnoma</th>
                  {canManage && <th className="px-4 py-3 text-right print:hidden" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item, idx) => {
                  const subject = SUBJECT_MAP[item.subjectId];
                  const dt = new Date(item.completedAt);
                  const dateLabel = Number.isNaN(dt.getTime())
                    ? item.completedAt
                    : `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`;
                  const diffText = item.difficulty
                    ? `${getDifficultyLabel(item.difficulty, lang)} · `
                    : '';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        {idx + 1}
                      </td>
                      {isAnyTeacher && (
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {item.studentName || item.username || 'Student'}
                          </div>
                          {item.username && (
                            <div className="text-xs text-slate-500">@{item.username}</div>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <button
                          type="button"
                          onClick={() => onOpenSubjectQuiz(item.subjectId)}
                          className="text-left hover:text-teal-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                        >
                          {subject ? pickText(subject.shortLabel, lang) : item.subjectId}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {diffText}
                        {item.variant}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.mode === 'practice'
                          ? lang === 'uz'
                            ? 'Mashq'
                            : 'Practice'
                          : lang === 'uz'
                            ? 'Imtihon'
                            : 'Exam'}
                      </td>
                      <td className="font-mono-num px-4 py-3 font-semibold text-slate-900">
                        <span>
                          {item.score}/{item.total} ({item.percentage}%)
                        </span>
                        {item.cheated && item.score === 0 && (
                          <span className="ml-2 font-sans font-extrabold text-rose-600">
                            Cheated
                          </span>
                        )}
                      </td>
                      <td className="font-mono-num px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                            item.grade === 5
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.grade === 4
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.grade} {item.grade === 5 ? "(A'lo)" : item.grade === 4 ? '(Yaxshi)' : ''}
                        </span>
                      </td>
                      <td className="font-mono-num px-4 py-3 text-slate-600">
                        {formatTime(item.elapsedSeconds)}
                      </td>
                      <td className="font-mono-num px-4 py-3 text-slate-500">
                        {dateLabel}
                      </td>
                      {/* Certificate Modal Trigger */}
                      <td className="px-4 py-3 text-center print:hidden">
                        <button
                          type="button"
                          onClick={() => setSelectedCertAttempt(item)}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                          title={uz ? 'Sertifikatni ko‘rish va chop etish' : 'View & Print Certificate'}
                        >
                          <Award className="h-3.5 w-3.5 text-amber-600" />
                          <span>{uz ? 'Guvohnoma' : 'Cert'}</span>
                        </button>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right print:hidden">
                          <button
                            type="button"
                            onClick={() => onDeleteAttempt(item.id)}
                            title={copy.deleteRecord}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Sign-off Area for Printout */}
      <div className="hidden print:block mt-12 pt-8 border-t border-slate-300 text-xs text-slate-700">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-bold">Fanni o‘qituvchi ustoz:</p>
            <p className="mt-8 border-b border-slate-400 mx-auto w-36"></p>
            <p className="text-[10px] text-slate-500 mt-1">(imzo va to‘liq ism)</p>
          </div>
          <div>
            <p className="font-bold">O‘quv ishlari bo‘yicha direktor o‘rinbosari:</p>
            <p className="mt-8 border-b border-slate-400 mx-auto w-36"></p>
            <p className="text-[10px] text-slate-500 mt-1">(imzo va muhr)</p>
          </div>
          <div>
            <p className="font-bold">Dastur muallifi:</p>
            <p className="mt-8 font-display font-semibold text-teal-800">Ibrohimbek Xujanazarov</p>
            <p className="text-[10px] text-slate-500 mt-1">Platform Creator</p>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCertAttempt && (
        <CertificateModal
          lang={lang}
          studentName={selectedCertAttempt.studentName || selectedCertAttempt.username || 'Student'}
          subject={SUBJECT_MAP[selectedCertAttempt.subjectId] || SUBJECTS[0]}
          score={selectedCertAttempt.score}
          total={selectedCertAttempt.total}
          grade={selectedCertAttempt.grade}
          dateStr={new Date(selectedCertAttempt.completedAt).toLocaleDateString()}
          onClose={() => setSelectedCertAttempt(null)}
        />
      )}
    </section>
  );
}
