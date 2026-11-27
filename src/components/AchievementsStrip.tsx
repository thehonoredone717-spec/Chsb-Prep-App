import {
  Award,
  CheckCircle2,
  Compass,
  Crown,
  Flame,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { AttemptRecord, SUBJECTS, pickText } from '../data/subjects';
import { QuizSectionKind, SubjectId, UILanguage } from '../types/quiz';

interface AchievementsStripProps {
  lang: UILanguage;
  history: AttemptRecord[];
  blitzBest: number;
  prohibitedSubjects: ReadonlySet<SubjectId>;
  onOpenSubjectGuide: (id: SubjectId) => void;
  onStartSubjectQuiz: (id: SubjectId, kind?: QuizSectionKind) => void;
}

interface RankTier {
  level: number;
  minXp: number;
  titleUz: string;
  titleEn: string;
}

const RANK_TIERS: RankTier[] = [
  { level: 1, minXp: 0, titleUz: 'Boshlang‘ich', titleEn: 'Apprentice' },
  { level: 2, minXp: 150, titleUz: 'Izlanuvchi', titleEn: 'Explorer' },
  { level: 3, minXp: 450, titleUz: 'Bilimdon', titleEn: 'Scholar' },
  { level: 4, minXp: 900, titleUz: 'Akademik', titleEn: 'Master' },
  { level: 5, minXp: 1600, titleUz: 'Olimpiadachi', titleEn: 'Grandmaster' },
];

export function AchievementsStrip({
  lang,
  history,
  blitzBest,
  prohibitedSubjects,
  onOpenSubjectGuide,
  onStartSubjectQuiz,
}: AchievementsStripProps) {
  const uz = lang === 'uz';
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);

  // Real XP computed from actual completed attempts + blitz personal best
  const totalXp =
    history.reduce((sum, item) => {
      if (item.cheated) return sum;
      return sum + item.score * 6 + (item.grade === 5 ? 40 : item.grade === 4 ? 15 : 0);
    }, 0) + blitzBest;

  let currentTier = RANK_TIERS[0];
  let nextTier: RankTier | null = RANK_TIERS[1];
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (totalXp >= RANK_TIERS[i].minXp) {
      currentTier = RANK_TIERS[i];
      nextTier = RANK_TIERS[i + 1] ?? null;
    }
  }

  const tierProgressPct = nextTier
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((totalXp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)) * 100
          )
        )
      )
    : 100;

  const uniqueTestedSubjects = new Set(
    history.filter((h) => !h.cheated).map((h) => h.subjectId)
  ).size;
  const cleanAttemptsCount = history.filter((h) => !h.cheated).length;
  const hasGradeFive = history.some((h) => !h.cheated && h.grade === 5);
  const hasPerfectScore = history.some((h) => !h.cheated && h.percentage === 100);

  const badges = [
    {
      id: 'first-step',
      icon: Sparkles,
      unlocked: cleanAttemptsCount >= 1,
      title: uz ? 'Ilk Qadam' : 'First Step',
      req: uz ? 'Kamida 1 ta testni yakunlang' : 'Complete at least 1 test',
    },
    {
      id: 'grade-five',
      icon: Award,
      unlocked: hasGradeFive,
      title: uz ? 'A’lochi (5 Baho)' : 'Grade 5 Club',
      req: uz ? 'Biror fandan 86%+ natija oling' : 'Score 86%+ on any subject',
    },
    {
      id: 'perfect-100',
      icon: Crown,
      unlocked: hasPerfectScore,
      title: uz ? 'Mukammal 100%' : 'Perfectionist',
      req: uz ? '25/25 (100%) natija qayd eting' : 'Score 25/25 (100%) on a test',
    },
    {
      id: 'all-rounder',
      icon: Compass,
      unlocked: uniqueTestedSubjects >= 3,
      title: uz ? 'Ko‘p Qirrali' : 'All-Rounder',
      req: uz ? 'Kamida 3 ta turli fandan test topshiring' : 'Take tests in 3+ subjects',
    },
    {
      id: 'blitz-master',
      icon: Zap,
      unlocked: blitzBest >= 50,
      title: uz ? 'Tezkor Zehn' : 'Blitz Master',
      req: uz ? '60s Blitz o‘yinida 50+ ball to‘plang' : 'Reach 50+ pts in 60s Blitz',
    },
    {
      id: 'clean-record',
      icon: ShieldCheck,
      unlocked: cleanAttemptsCount >= 3,
      title: uz ? 'Halol Bilimdon' : 'Clean Streak',
      req: uz ? '3 ta testni qoidabuzarliksiz yakunlang' : 'Finish 3 clean proctored tests',
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  // Smart recommendation based on real attempt history
  const openSubjects = SUBJECTS.filter((s) => !prohibitedSubjects.has(s.id));
  const recommendedSubject = (() => {
    if (openSubjects.length === 0) return SUBJECTS[0];
    const untested = openSubjects.find(
      (s) => !history.some((h) => h.subjectId === s.id && !h.cheated)
    );
    if (untested) return untested;

    let lowestSub = openSubjects[0];
    let lowestBest = 101;
    for (const s of openSubjects) {
      const best = history
        .filter((h) => h.subjectId === s.id && !h.cheated)
        .reduce((m, cur) => Math.max(m, cur.percentage), 0);
      if (best < lowestBest) {
        lowestBest = best;
        lowestSub = s;
      }
    }
    return lowestSub;
  })();

  const recBest = history
    .filter((h) => h.subjectId === recommendedSubject.id && !h.cheated)
    .reduce((m, cur) => Math.max(m, cur.percentage), -1);

  const selectedTip = badges.find((b) => b.id === selectedTipId);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Rank & Unlockable Badges */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              {uz ? 'Daraja va Yutuqlar' : 'Academic Rank & Milestones'} ·{' '}
              <span className="font-mono-num">
                {unlockedCount}/{badges.length}
              </span>
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-slate-900">
              {uz ? `Daraja ${currentTier.level}: ${currentTier.titleUz}` : `Level ${currentTier.level}: ${currentTier.titleEn}`}
            </h2>
          </div>

          <div className="text-right">
            <p className="font-mono-num text-xl font-extrabold text-teal-700">{totalXp} XP</p>
            <p className="text-[11px] font-medium text-slate-500">
              {nextTier
                ? uz
                  ? `Keyingi daraja: ${nextTier.minXp} XP`
                  : `Next rank at ${nextTier.minXp} XP`
                : uz
                  ? 'Maksimal daraja zabt etildi!'
                  : 'Top rank reached!'}
            </p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-teal-600 transition-all duration-300"
            style={{ width: `${tierProgressPct}%` }}
          />
        </div>

        {/* 6 Milestone Tiles */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <button
                key={badge.id}
                type="button"
                onClick={() =>
                  setSelectedTipId((prev) => (prev === badge.id ? null : badge.id))
                }
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors ${
                  badge.unlocked
                    ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    badge.unlocked
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {badge.unlocked ? (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`truncate text-xs font-bold ${
                      badge.unlocked ? 'text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    {badge.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                    {badge.unlocked ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        {uz ? 'Ochilgan' : 'Unlocked'}
                      </span>
                    ) : (
                      badge.req
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {selectedTip && (
          <p className="mt-3 text-xs font-medium text-slate-600">
            <strong>{selectedTip.title}:</strong> {selectedTip.req}
          </p>
        )}
      </div>

      {/* Smart Next-Step Recommendation */}
      <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 lg:col-span-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <Target className="h-4 w-4" aria-hidden="true" />
            <span>{uz ? 'Aqlli Tavsiya' : 'Smart Next Step'}</span>
          </div>
          <h3 className="mt-2 font-display text-lg font-bold text-slate-900">
            {pickText(recommendedSubject.title, lang)}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
            {recBest < 0
              ? uz
                ? 'Siz hali bu fandan test topshirmagansiz. Avval interaktiv kartochkalar yoki 25 talik mashqdan boshlang.'
                : 'You have not tested this subject yet. Start with interactive flashcards or a 25-question drill.'
              : uz
                ? `Hozirgi eng yaxshi natijangiz ${recBest}%. Natijani 86%+ (5 baho) ga olib chiqish uchun ayni vaqt.`
                : `Your current best score is ${recBest}%. A quick revision will help boost it into Grade 5 (86%+).`}
          </p>
        </div>

        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
          {blitzBest > 0 && (
            <p className="mb-2 flex items-center justify-between text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium">
                <Flame className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                {uz ? 'Blitz Rekordingiz:' : 'Your Blitz Record:'}
              </span>
              <strong className="font-mono-num text-slate-900">{blitzBest} pts</strong>
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenSubjectGuide(recommendedSubject.id)}
              className="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {uz ? 'Kartochkalar / Qo‘llanma' : 'Flashcards / Guide'}
            </button>
            {!prohibitedSubjects.has(recommendedSubject.id) && (
              <button
                type="button"
                onClick={() => onStartSubjectQuiz(recommendedSubject.id, 'test')}
                className="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-lg bg-teal-700 px-3 text-xs font-semibold text-white transition-colors hover:bg-teal-800"
              >
                {uz ? 'Testni boshlash →' : 'Start Test →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
