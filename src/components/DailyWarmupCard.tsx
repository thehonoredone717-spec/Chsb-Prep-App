import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SUBJECTS, SUBJECT_MAP, pickText } from '../data/subjects';
import { ActiveQuizQuestion, SubjectId, UILanguage } from '../types/quiz';
import {
  getCorrectDisplayIndex,
  getLocalizedField,
  getLocalizedOptions,
  isChoiceCorrect,
  shuffleArray,
} from '../utils/quizEngine';
import { playSound } from '../utils/sound';
import { FormattedMathText } from './FormattedMathText';

interface DailyWarmupCardProps {
  lang: UILanguage;
  userUid: string;
  prohibitedSubjects: ReadonlySet<SubjectId>;
  blitzBest: number;
  onBlitzBestChange: (newBest: number) => void;
  onOpenSubjectGuide: (id: SubjectId) => void;
}

const SPRINT_COUNT = 5;
const BLITZ_DURATION_SEC = 60;

export function DailyWarmupCard({
  lang,
  userUid,
  prohibitedSubjects,
  blitzBest,
  onBlitzBestChange,
  onOpenSubjectGuide,
}: DailyWarmupCardProps) {
  const uz = lang === 'uz';
  const openSubjects = useMemo(
    () => SUBJECTS.filter((s) => !prohibitedSubjects.has(s.id)),
    [prohibitedSubjects]
  );

  const [gameMode, setGameMode] = useState<'sprint' | 'blitz'>('blitz');
  const [selectedScope, setSelectedScope] = useState<'mix' | SubjectId>('mix');
  const [active, setActive] = useState(false);
  const [questions, setQuestions] = useState<Array<{ subjectId: SubjectId; q: ActiveQuizQuestion }>>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BLITZ_DURATION_SEC);
  const [finished, setFinished] = useState(false);

  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  // Countdown for 60s Blitz mode
  useEffect(() => {
    if (!active || finished || gameMode !== 'blitz') return;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFinished(true);
          playSound('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [active, finished, gameMode]);

  // Update Blitz Personal Best when finished or scoring
  useEffect(() => {
    if (gameMode === 'blitz' && score > blitzBest) {
      onBlitzBestChange(score);
      try {
        window.localStorage.setItem(`g7_chsb_blitz_best_${userUid}`, String(score));
      } catch {
        // Ignore storage errors
      }
    }
  }, [score, blitzBest, gameMode, userUid, onBlitzBestChange]);

  const startSession = (chosenMode: 'sprint' | 'blitz', scope: 'mix' | SubjectId = selectedScope) => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    const targetPool =
      scope === 'mix' || prohibitedSubjects.has(scope)
        ? openSubjects.flatMap((s) => s.testQuestions.map((q) => ({ subjectId: s.id, source: q })))
        : (SUBJECT_MAP[scope]?.testQuestions ?? []).map((q) => ({ subjectId: scope, source: q }));

    if (targetPool.length === 0) return;

    const count = chosenMode === 'blitz' ? Math.min(40, targetPool.length) : SPRINT_COUNT;
    const picked = shuffleArray(targetPool)
      .slice(0, count)
      .map((item) => ({
        subjectId: item.subjectId,
        q: {
          source: item.source,
          optionOrder: shuffleArray([0, 1, 2, 3]),
        },
      }));

    setGameMode(chosenMode);
    setQuestions(picked);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setCorrectCount(0);
    setAnsweredCount(0);
    setTimeLeft(BLITZ_DURATION_SEC);
    setFinished(false);
    setActive(true);
    playSound('click');
  };

  if (openSubjects.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <Flame className="h-4 w-4" aria-hidden="true" />
              <span>{uz ? 'Tezkor Mashq' : 'Quick Arena'}</span>
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-slate-900">
              {uz
                ? 'Testlar vaqtincha yopiq — Qo‘llanma kartochkalari ochiq'
                : 'Quizzes paused — Study Guide Flashcards remain open'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenSubjectGuide('math')}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>{uz ? 'Qo‘llanmani ochish' : 'Open Study Guide'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
              <Zap className="h-4 w-4" aria-hidden="true" />
              <span>
                {uz
                  ? 'Bilimlar Bellashuvi · Erkin o‘yin rejimi'
                  : 'Knowledge Arena · Free Practice Games'}
              </span>
              {blitzBest > 0 && (
                <span className="font-mono-num text-slate-600">
                  · {uz ? 'Rekord' : 'Best'}: {blitzBest} pts
                </span>
              )}
            </div>
            <h2 className="mt-1.5 font-display text-lg font-bold text-slate-900 sm:text-xl">
              {uz
                ? '60 soniyalik Blitz rekordini yangilang yoki 5 savollik Sprint o‘ynang'
                : 'Beat the 60-Second Blitz record or play a calm 5-Question Sprint'}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
              {uz
                ? 'Ketma-ket to‘g‘ri javoblar uchun Combo koeffitsienti (x2, x3) beriladi. Kamera talab qilinmaydi.'
                : 'Build combo multipliers (x2, x3) for streaks in 60s Blitz. Instant explanations, no camera needed.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label={uz ? 'Mashq fani' : 'Arena subject'}
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value as 'mix' | SubjectId)}
              className="min-h-[42px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 focus:border-teal-700 focus:outline-none"
            >
              <option value="mix">{uz ? 'Aralash (Barcha ochiq fanlar)' : 'Mixed (All open subjects)'}</option>
              {openSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {pickText(sub.shortLabel, lang)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => startSession('blitz', selectedScope)}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <Timer className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <span>{uz ? '60s Blitz O‘ynash' : 'Play 60s Blitz'}</span>
            </button>

            <button
              type="button"
              onClick={() => startSession('sprint', selectedScope)}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <Sparkles className="h-4 w-4 text-teal-700" aria-hidden="true" />
              <span>{uz ? '5-Savol Sprint' : '5-Question Sprint'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeItem = questions[currentIdx];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 text-amber-700">
            {gameMode === 'blitz' ? (
              <Zap className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Flame className="h-4 w-4" aria-hidden="true" />
            )}
            <span>
              {gameMode === 'blitz'
                ? uz
                  ? '60s Blitz Bellashuv'
                  : '60s Blitz Arena'
                : uz
                  ? '5-Savol Sprint'
                  : '5-Question Sprint'}
            </span>
          </span>
          {activeItem && !finished && (
            <span className="text-slate-500">
              · {pickText(SUBJECT_MAP[activeItem.subjectId].shortLabel, lang)}
            </span>
          )}
          {gameMode === 'blitz' && combo >= 2 && !finished && (
            <span className="font-mono-num font-extrabold text-emerald-700">
              · {combo}x Combo
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs">
          {gameMode === 'blitz' && !finished && (
            <>
              <span className="font-mono-num font-bold text-teal-700">
                {score} pts
              </span>
              <span
                className={`font-mono-num inline-flex items-center gap-1 font-extrabold ${
                  timeLeft <= 10 ? 'text-rose-700' : 'text-slate-800'
                }`}
              >
                <Timer className="h-3.5 w-3.5" aria-hidden="true" />
                {timeLeft}s
              </span>
            </>
          )}
          {gameMode === 'sprint' && !finished && (
            <span className="font-mono-num font-bold text-slate-700">
              {currentIdx + 1} / {questions.length}
            </span>
          )}
          <button
            type="button"
            onClick={() => setActive(false)}
            className="font-semibold text-slate-500 hover:text-slate-900"
          >
            {uz ? 'Yopish' : 'Close'}
          </button>
        </div>
      </div>

      {finished ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Trophy className="h-6 w-6" aria-hidden="true" />
          </div>
          {gameMode === 'blitz' ? (
            <>
              <p className="font-mono-num text-3xl font-extrabold text-teal-700">{score} pts</p>
              <p className="mt-1 font-display text-lg font-bold text-slate-900">
                {score >= blitzBest && score > 0
                  ? uz
                    ? 'Yangi shaxsiy rekord!'
                    : 'New Personal Best!'
                  : uz
                    ? 'Blitz yakunlandi!'
                    : 'Blitz Complete!'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {uz
                  ? `${answeredCount} savoldan ${correctCount} ta to‘g‘ri · Eng uzun seriya: ${bestCombo}x · Rekord: ${blitzBest} pts`
                  : `${correctCount} correct out of ${answeredCount} · Best streak: ${bestCombo}x · High score: ${blitzBest} pts`}
              </p>
            </>
          ) : (
            <>
              <p className="font-mono-num text-3xl font-extrabold text-teal-700">
                {correctCount} / {questions.length}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-slate-900">
                {correctCount >= 4
                  ? uz
                    ? 'Ajoyib tayyorgarlik!'
                    : 'Great warm-up!'
                  : uz
                    ? 'Yaxshi urinish — qo‘llanmani ham ko‘rib chiqing!'
                    : 'Good try — review the study guide too!'}
              </p>
            </>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => startSession(gameMode, selectedScope)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>{uz ? 'Qayta o‘ynash' : 'Play Again'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActive(false)}
              className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {uz ? 'Dashboardga qaytish' : 'Back'}
            </button>
          </div>
        </div>
      ) : activeItem ? (
        <div className="mt-4 space-y-4">
          <p className="whitespace-pre-line font-display text-base font-bold text-slate-900 sm:text-lg">
            {getLocalizedField(activeItem.q.source.q, lang)}
          </p>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {activeItem.q.optionOrder.map((origIdx, dispIdx) => {
              const opts = getLocalizedOptions(activeItem.q.source.opts, lang);
              const correctDisp = getCorrectDisplayIndex(activeItem.q);
              const isSelected = selectedOpt === dispIdx;
              const revealed = selectedOpt !== null;
              const isCorrectOpt = dispIdx === correctDisp;

              let btnClass =
                'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50';
              if (revealed) {
                if (isCorrectOpt) {
                  btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                } else if (isSelected) {
                  btnClass = 'border-rose-500 bg-rose-50 text-rose-950 font-semibold';
                } else {
                  btnClass = 'border-slate-200 bg-white text-slate-400';
                }
              }

              return (
                <button
                  key={`${activeItem.q.source.id}-${origIdx}`}
                  type="button"
                  disabled={revealed}
                  onClick={() => {
                    setSelectedOpt(dispIdx);
                    setAnsweredCount((a) => a + 1);
                    const ok = isChoiceCorrect(activeItem.q, dispIdx);
                    if (ok) {
                      const nextCombo = combo + 1;
                      const multiplier = nextCombo >= 5 ? 3 : nextCombo >= 3 ? 2 : 1;
                      setCombo(nextCombo);
                      setBestCombo((b) => Math.max(b, nextCombo));
                      setCorrectCount((c) => c + 1);
                      setScore((s) => s + 10 * multiplier);
                      playSound('success');
                    } else {
                      setCombo(0);
                      playSound('warning');
                    }

                    if (gameMode === 'blitz') {
                      advanceTimerRef.current = window.setTimeout(() => {
                        if (currentIdx + 1 >= questions.length) {
                          setFinished(true);
                          playSound('complete');
                        } else {
                          setCurrentIdx((i) => i + 1);
                          setSelectedOpt(null);
                        }
                      }, 550);
                    }
                  }}
                  className={`flex min-h-[44px] items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors ${btnClass}`}
                >
                  <span>{opts[origIdx]}</span>
                  {revealed && isCorrectOpt && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                  )}
                  {revealed && isSelected && !isCorrectOpt && (
                    <XCircle className="h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {gameMode === 'sprint' && selectedOpt !== null && (
            <div className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5 sm:flex-row sm:items-center">
              <p className="text-xs leading-relaxed text-slate-700">
                <FormattedMathText text={getLocalizedField(activeItem.q.source.explain, lang)} />
              </p>
              <button
                type="button"
                onClick={() => {
                  if (currentIdx + 1 >= questions.length) {
                    setFinished(true);
                    playSound('complete');
                  } else {
                    setCurrentIdx((i) => i + 1);
                    setSelectedOpt(null);
                  }
                }}
                className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-4 text-xs font-semibold text-white hover:bg-teal-800"
              >
                <span>
                  {currentIdx + 1 >= questions.length
                    ? uz
                      ? 'Natijani ko‘rish'
                      : 'Finish'
                    : uz
                      ? 'Keyingi savol'
                      : 'Next Question'}
                </span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
