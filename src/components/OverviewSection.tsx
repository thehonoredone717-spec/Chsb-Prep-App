import {
  ArrowRight,
  Ban,
  BookOpen,
  Calculator,
  Code2,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
} from 'lucide-react';
import { AttemptRecord, SUBJECTS, UI_COPY, pickText } from '../data/subjects';
import { QuizSectionKind, SubjectId, UILanguage } from '../types/quiz';
import { SUBJECT_THEMES } from '../utils/subjectTheme';

interface OverviewSectionProps {
  lang: UILanguage;
  activeSubjectId: SubjectId;
  history: AttemptRecord[];
  prohibitedSubjects?: ReadonlySet<SubjectId>;
  onStartSubjectQuiz: (id: SubjectId, kind?: QuizSectionKind) => void;
  onOpenSubjectGuide: (id: SubjectId) => void;
}

const SUBJECT_ICONS: Record<SubjectId, typeof Calculator> = {
  math: Calculator,
  history: Landmark,
  science: FlaskConical,
  computing: Code2,
  english: Globe2,
  uzbek: Languages,
};

export function OverviewSection({
  lang,
  activeSubjectId,
  history,
  prohibitedSubjects,
  onStartSubjectQuiz,
  onOpenSubjectGuide,
}: OverviewSectionProps) {
  const copy = UI_COPY[lang];

  return (
    <section className="space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          {copy.questionsPerTest} · {copy.variantsCount} · {copy.totalBank}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {copy.heroTitle}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
          {copy.heroSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS.map((subject) => {
          const Icon = SUBJECT_ICONS[subject.id];
          const theme = SUBJECT_THEMES[subject.id];
          const subjectAttempts = history.filter((h) => h.subjectId === subject.id);
          const bestAttempt = subjectAttempts.reduce<AttemptRecord | null>(
            (best, cur) => (!best || cur.percentage > best.percentage ? cur : best),
            null
          );
          const isCurrent = subject.id === activeSubjectId;
          const isProhibited = Boolean(prohibitedSubjects?.has(subject.id));
          const progressPct = bestAttempt ? bestAttempt.percentage : 0;

          return (
            <article
              key={subject.id}
              className={`flex flex-col justify-between rounded-xl border bg-white p-6 transition-all duration-200 ${
                isProhibited
                  ? 'border-rose-300 bg-rose-50/30'
                  : isCurrent
                    ? `border-slate-300 ring-1 ring-teal-700/25`
                    : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isProhibited
                        ? 'bg-rose-100 text-rose-700'
                        : `${theme.iconBg} ${theme.iconText}`
                    }`}
                  >
                    {isProhibited ? (
                      <Ban className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </div>
                  <span
                    className={`font-mono-num text-xs ${
                      isProhibited ? 'font-semibold text-rose-700' : 'font-medium text-slate-500'
                    }`}
                  >
                    {isProhibited
                      ? lang === 'uz'
                        ? 'Taqiqlangan (Prohibited)'
                        : 'Prohibited'
                      : `${subject.questions.length} ${lang === 'uz' ? 'savol' : 'questions'} · 20 ${lang === 'uz' ? 'Test' : 'Test'} + 20 ${lang === 'uz' ? 'Imtihon' : 'Exam'}`}
                  </span>
                </div>

                <h2 className="mt-4 font-display text-xl font-bold text-slate-900">
                  {pickText(subject.title, lang)}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {pickText(subject.subtitle, lang)}
                </p>

                <p className="mt-4 text-xs font-medium text-slate-500">
                  {pickText(subject.questionLangNote, lang)} · {subject.topics.length}{' '}
                  {lang === 'uz' ? 'mavzu (3 variantdan)' : 'topics (3 variants each)'}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{copy.bestScore}:</span>
                  {bestAttempt ? (
                    <span className="font-mono-num font-semibold text-slate-900">
                      {bestAttempt.score}/{bestAttempt.total} ({bestAttempt.percentage}%) ·{' '}
                      {lang === 'uz' ? 'Baho' : 'Grade'} {bestAttempt.grade}
                    </span>
                  ) : (
                    <span>{copy.notAttempted}</span>
                  )}
                </div>

                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isProhibited ? 'bg-rose-400' : theme.barFill
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {isProhibited ? (
                    <button
                      type="button"
                      onClick={() => onStartSubjectQuiz(subject.id, 'exam')}
                      className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2"
                    >
                      <span>{lang === 'uz' ? 'Yopiq (Prohibited)' : 'Prohibited'}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onStartSubjectQuiz(subject.id, 'test')}
                        className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                      >
                        <span>{copy.navTest}</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onStartSubjectQuiz(subject.id, 'exam')}
                        className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                      >
                        <span>{copy.navExam}</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenSubjectGuide(subject.id)}
                    aria-label={`${pickText(subject.shortLabel, lang)} — ${copy.openGuide}`}
                    title={copy.openGuide}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                  >
                    <BookOpen className={`h-4 w-4 ${theme.accentText}`} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
