import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AttemptRecord, UI_COPY, pickText } from '../data/subjects';
import { FormattedMathText } from './FormattedMathText';
import {
  ActiveQuizQuestion,
  DifficultyLevel,
  QuizMode,
  SubjectConfig,
  UILanguage,
  VariantSelection,
} from '../types/quiz';
import {
  DIFFICULTY_LEVELS,
  QUESTIONS_PER_TEST,
  buildVariantQuestions,
  formatTime,
  getCorrectDisplayIndex,
  getDifficultyLabel,
  getLocalizedField,
  getLocalizedOptions,
  getNextVariant,
  getVariantLabel,
  gradeOf,
  isChoiceCorrect,
} from '../utils/quizEngine';

interface QuizSectionProps {
  subject: SubjectConfig;
  lang: UILanguage;
  onOpenGuide: () => void;
  onRecordAttempt: (record: AttemptRecord) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;
const VARIANT_CHOICES: VariantSelection[] = [1, 2, 3, 4, 5, 'random'];

export function QuizSection({
  subject,
  lang,
  onOpenGuide,
  onRecordAttempt,
}: QuizSectionProps) {
  const copy = UI_COPY[lang];

  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [variant, setVariant] = useState<VariantSelection>(1);
  const [mode, setMode] = useState<QuizMode>('practice');
  const [questions, setQuestions] = useState<ActiveQuizQuestion[]>(() =>
    buildVariantQuestions(subject, 'easy', 1)
  );
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong'>('all');
  const [rotationCount, setRotationCount] = useState<number>(0);

  // Reset to Variant 1 of current difficulty whenever user switches to a different subject section
  useEffect(() => {
    const fresh = buildVariantQuestions(subject, difficulty, 1);
    setVariant(1);
    setQuestions(fresh);
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    setElapsedSeconds(0);
    setReviewFilter('all');
    setRotationCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  // Live exam timer
  useEffect(() => {
    if (submitted) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [submitted, subject.id, difficulty, variant, rotationCount]);

  const startSession = (
    nextDiff: DifficultyLevel,
    nextVar: VariantSelection,
    prevIds: string[]
  ) => {
    const nextQuestions = buildVariantQuestions(subject, nextDiff, nextVar, prevIds);
    setDifficulty(nextDiff);
    setVariant(nextVar);
    setQuestions(nextQuestions);
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    setElapsedSeconds(0);
    setReviewFilter('all');
    setRotationCount((c) => c + 1);
  };

  // Mandatory requirement: Every time "Start over" is clicked, questions swap/shuffle
  const handleStartOver = () => {
    const nextVar = getNextVariant(variant);
    const prevIds = questions.map((q) => q.source.id);
    startSession(difficulty, nextVar, prevIds);
  };

  const handleSelectDifficulty = (chosenDifficulty: DifficultyLevel) => {
    const prevIds = questions.map((q) => q.source.id);
    startSession(chosenDifficulty, 1, prevIds);
  };

  const handleSelectVariant = (chosenVariant: VariantSelection) => {
    const prevIds = questions.map((q) => q.source.id);
    startSession(difficulty, chosenVariant, prevIds);
  };

  const handleSelectOption = (displayIdx: number) => {
    if (submitted) return;
    if (mode === 'practice' && answers[currentIndex] !== undefined) return;
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: displayIdx,
    }));
  };

  const handleSubmit = () => {
    if (submitted) return;
    let correct = 0;
    questions.forEach((q, idx) => {
      if (isChoiceCorrect(q, answers[idx])) {
        correct += 1;
      }
    });
    const pct = Math.round((correct / QUESTIONS_PER_TEST) * 100);
    const { grade } = gradeOf(pct);

    onRecordAttempt({
      id: `${subject.id}-${Date.now()}`,
      subjectId: subject.id,
      difficulty,
      variant: getVariantLabel(variant, lang),
      mode,
      score: correct,
      total: QUESTIONS_PER_TEST,
      percentage: pct,
      grade,
      elapsedSeconds,
      completedAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  const answeredCount = Object.keys(answers).length;
  const activeQuestion = questions[currentIndex];

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

    const percentage = Math.round((correct / QUESTIONS_PER_TEST) * 100);
    const gradeInfo = gradeOf(percentage);
    const topicRows = Array.from(topicMap.entries()).map(([topic, stat]) => ({
      topic,
      ok: stat.ok,
      total: stat.total,
      pct: Math.round((stat.ok / stat.total) * 100),
    }));

    return { correct, percentage, gradeInfo, topicRows };
  }, [submitted, questions, answers]);

  return (
    <section className="space-y-5">
      {/* Subject Header & Variant / Mode Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
              {pickText(subject.title, lang)}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {pickText(subject.subtitle, lang)} · {pickText(subject.questionLangNote, lang)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <BookOpen className="h-4 w-4 text-teal-700" aria-hidden="true" />
              <span>{copy.navGuide}</span>
            </button>

            <button
              type="button"
              onClick={handleStartOver}
              title={copy.startOverHint}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>{copy.startOver}</span>
            </button>
          </div>
        </div>

        {/* Difficulty Tier + Quiz Mode Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {copy.difficultyLabel}:
            </span>
            <div
              role="group"
              aria-label={copy.difficultyLabel}
              className="inline-flex rounded-lg bg-slate-100 p-0.5"
            >
              {DIFFICULTY_LEVELS.map((lvl) => {
                const active = difficulty === lvl;
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
                    className={`min-h-[36px] rounded-md px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 sm:text-sm ${
                      active ? activeColor : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {getDifficultyLabel(lvl, lang)}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            role="group"
            aria-label={lang === 'uz' ? 'Test rejimi' : 'Quiz Mode'}
            className="inline-flex rounded-lg bg-slate-100 p-0.5"
          >
            <button
              type="button"
              onClick={() => setMode('practice')}
              className={`min-h-[36px] rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                mode === 'practice'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {copy.modePractice}
            </button>
            <button
              type="button"
              onClick={() => setMode('exam')}
              className={`min-h-[36px] rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                mode === 'exam'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {copy.modeExam}
            </button>
          </div>
        </div>

        {/* 5 Variants per Difficulty + Random 25 */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div
            role="group"
            aria-label={lang === 'uz' ? 'Variant tanlash' : 'Select Variant'}
            className="flex flex-wrap items-center gap-1.5"
          >
            {VARIANT_CHOICES.map((v) => {
              const active = variant === v;
              return (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => handleSelectVariant(v)}
                  className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 sm:text-sm ${
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
        </div>

        <div className="font-mono-num mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500">
          <span>
            {getDifficultyLabel(difficulty, lang)} · {getVariantLabel(variant, lang)} ·{' '}
            {QUESTIONS_PER_TEST} {lang === 'uz' ? 'savol' : 'questions'} · {copy.answeredCount}:{' '}
            {answeredCount}/{QUESTIONS_PER_TEST}
          </span>
          <span>
            {copy.timeLabel}: {formatTime(elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* Results View */}
      {submitted && resultsSummary ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-slate-900">
                  {copy.resultTitle}
                </h2>
                <p className="mt-1 text-xs text-slate-500">{copy.gradingScaleNote}</p>
              </div>
              <button
                type="button"
                onClick={handleStartOver}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>{copy.startOver}</span>
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">{copy.scoreLabel}</p>
                <p className="font-mono-num mt-1 text-3xl font-bold text-slate-900">
                  {resultsSummary.correct} / {QUESTIONS_PER_TEST}
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
                  {copy.filterAll}
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

                    <p className="mt-2 font-display text-base font-semibold text-slate-900">
                      {getLocalizedField(q.source.q, lang)}
                    </p>

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
          {/* 1..25 Question Navigator Strip */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 md:grid-cols-[repeat(25,minmax(0,1fr))]">
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
                <span className="font-mono-num">
                  {copy.questionOf} {currentIndex + 1} / {QUESTIONS_PER_TEST}
                </span>
              </div>

              <h2 className="mt-3 font-display text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                {getLocalizedField(activeQuestion.source.q, lang)}
              </h2>

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
                  {currentIndex < QUESTIONS_PER_TEST - 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIndex((i) => Math.min(QUESTIONS_PER_TEST - 1, i + 1))
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
    </section>
  );
}
