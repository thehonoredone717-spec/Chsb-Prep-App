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
  Trophy,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { AttemptRecord, SUBJECTS, pickText } from '../data/subjects';
import { QuizSectionKind, SubjectId, UILanguage } from '../types/quiz';
import { computeEarnedXp } from '../utils/xpAndStore';

interface AchievementsStripProps {
  lang: UILanguage;
  history: AttemptRecord[];
  blitzBest: number;
  availableXp?: number;
  prohibitedSubjects: ReadonlySet<SubjectId>;
  onOpenSubjectGuide: (id: SubjectId) => void;
  onStartSubjectQuiz: (id: SubjectId, kind?: QuizSectionKind) => void;
  onOpenStore?: () => void;
}

interface RankTier {
  level: number;
  minXp: number;
  titleUz: string;
  titleEn: string;
}

const RANK_TIERS: RankTier[] = [
  { level: 1, minXp: 0, titleUz: 'Boshlang‘ich', titleEn: 'Apprentice' },
  { level: 2, minXp: 500, titleUz: 'Izlanuvchi', titleEn: 'Explorer' },
  { level: 3, minXp: 1500, titleUz: 'Bilimdon', titleEn: 'Scholar' },
  { level: 4, minXp: 3500, titleUz: 'Akademik', titleEn: 'Master' },
  { level: 5, minXp: 6500, titleUz: 'Olimpiadachi', titleEn: 'Grandmaster' },
  { level: 6, minXp: 11000, titleUz: 'Elita Ziyoli', titleEn: 'Elite Sage' },
  { level: 7, minXp: 17000, titleUz: 'Buyuk Strateg', titleEn: 'Grand Strategist' },
  { level: 8, minXp: 25000, titleUz: 'Akademik Vunderkind', titleEn: 'Prodigy Scholar' },
  { level: 9, minXp: 35000, titleUz: 'Afsonaviy Alloma', titleEn: 'Legendary Sage' },
  { level: 10, minXp: 48000, titleUz: 'ChSB G‘olibi', titleEn: 'ChSB Champion' },
  { level: 11, minXp: 63000, titleUz: 'Ziyo Ustasi', titleEn: 'Master of Wisdom' },
  { level: 12, minXp: 80000, titleUz: 'Ilmiy Daho', titleEn: 'Scientific Genius' },
  { level: 13, minXp: 100000, titleUz: 'Oliy Darajadagi Hukmdor', titleEn: 'Supreme Ruler' },
  { level: 14, minXp: 125000, titleUz: 'Koinot Bilimdoni', titleEn: 'Cosmic Polymath' },
  { level: 15, minXp: 160000, titleUz: 'ChSB Afsonaviy Imperatori', titleEn: 'Mythic ChSB Emperor' },
];

export function AchievementsStrip({
  lang,
  history,
  blitzBest,
  availableXp,
  prohibitedSubjects,
  onOpenSubjectGuide,
  onStartSubjectQuiz,
  onOpenStore,
}: AchievementsStripProps) {
  const uz = lang === 'uz';
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);

  // Real XP computed from actual completed attempts + blitz personal best
  const totalXp = computeEarnedXp(history, blitzBest);

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
  const gradeFivesCount = history.filter((h) => !h.cheated && h.grade === 5).length;
  const perfectCount = history.filter((h) => !h.cheated && h.percentage === 100).length;
  const examAttemptsCount = history.filter((h) => !h.cheated && h.mode === 'exam').length;

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
      unlocked: gradeFivesCount >= 1,
      title: uz ? 'A’lochi (5 Baho)' : 'Grade 5 Club',
      req: uz ? 'Biror fandan 86%+ natija oling' : 'Score 86%+ on any subject',
    },
    {
      id: 'perfect-100',
      icon: Crown,
      unlocked: perfectCount >= 1,
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
      unlocked: cleanAttemptsCount >= 5,
      title: uz ? 'Halol Bilimdon' : 'Clean Streak',
      req: uz ? '5 ta testni qoidabuzarliksiz yakunlang' : 'Finish 5 clean proctored tests',
    },
    {
      id: 'exam-veteran',
      icon: Target,
      unlocked: examAttemptsCount >= 3,
      title: uz ? 'ChSB Imtihonchisi' : 'Exam Veteran',
      req: uz ? 'Kamida 3 ta rasmiy ChSB imtihonini topshiring' : 'Complete 3 official ChSB exams',
    },
    {
      id: 'five-star-general',
      icon: Award,
      unlocked: gradeFivesCount >= 5,
      title: uz ? 'Beshta A’lo' : 'Five 5s Master',
      req: uz ? '5 marta 5 (a’lo) baho qo‘lga kiriting' : 'Achieve Grade 5 five times',
    },
    {
      id: 'blitz-legend',
      icon: Flame,
      unlocked: blitzBest >= 100,
      title: uz ? 'Blitz Afsonasi' : 'Blitz Legend',
      req: uz ? '60s Blitzda 100+ ball to‘plang' : 'Score 100+ pts in 60s Blitz',
    },
    {
      id: 'polymath-pro',
      icon: Compass,
      unlocked: uniqueTestedSubjects >= 6,
      title: uz ? 'Barcha Fanlar Ustasi' : 'Ultimate Polymath',
      req: uz ? 'Barcha 6 ta fandan test topshiring' : 'Take tests in all 6 subjects',
    },
    {
      id: 'century-club',
      icon: Sparkles,
      unlocked: cleanAttemptsCount >= 10,
      title: uz ? '10+ Sinov G‘olibi' : '10 Tests Club',
      req: uz ? 'Jami 10 ta testni muvaffaqiyatli yakunlang' : 'Complete 10 successful test runs',
    },
    {
      id: 'mythic-scholar',
      icon: Crown,
      unlocked: totalXp >= 10000,
      title: uz ? 'Mifik Akademik' : 'Mythic Scholar',
      req: uz ? 'Umumiy 10,000+ XP to‘plang' : 'Accumulate 10,000+ total XP',
    },
    {
      id: 'blitz-god',
      icon: Zap,
      unlocked: blitzBest >= 150,
      title: uz ? 'Blitz Xudosi' : 'Blitz God',
      req: uz ? '60s Blitzda 150+ ball to‘plang' : 'Score 150+ pts in 60s Blitz',
    },
    {
      id: 'marathon-runner',
      icon: Trophy,
      unlocked: cleanAttemptsCount >= 20,
      title: uz ? 'Marafonchi Bilimdon' : 'Marathon Scholar',
      req: uz ? 'Jami 20 ta testni yakunlang' : 'Complete 20 test submissions',
    },
    {
      id: 'exam-ace',
      icon: ShieldCheck,
      unlocked: examAttemptsCount >= 8,
      title: uz ? 'Imtihon Afsonasi' : 'Exam Ace',
      req: uz ? '8 ta rasmiy ChSB imtihonini topshiring' : 'Complete 8 official ChSB exams',
    },
    {
      id: 'perfectionist-pro',
      icon: Crown,
      unlocked: perfectCount >= 3,
      title: uz ? '3x Mukammallik' : 'Triple Perfectionist',
      req: uz ? '3 marta 100% natija qayd eting' : 'Score 100% on 3 separate tests',
    },
    {
      id: 'badge-xp-25k',
      icon: Sparkles,
      unlocked: totalXp >= 25000,
      title: uz ? '25,000 XP Egasi' : '25K XP Achiever',
      req: uz ? 'Umumiy 25,000+ XP to‘plang' : 'Accumulate 25,000+ total XP',
    },
    {
      id: 'badge-xp-50k',
      icon: Trophy,
      unlocked: totalXp >= 50000,
      title: uz ? '50,000 XP Dahosi' : '50K XP Prodigy',
      req: uz ? 'Umumiy 50,000+ XP to‘plang' : 'Accumulate 50,000+ total XP',
    },
    {
      id: 'badge-xp-100k',
      icon: Crown,
      unlocked: totalXp >= 100000,
      title: uz ? '100,000 XP Hukmdori' : '100K XP Emperor',
      req: uz ? 'Umumiy 100,000+ XP to‘plang' : 'Accumulate 100,000+ total XP',
    },
    {
      id: 'badge-grades-10',
      icon: Award,
      unlocked: gradeFivesCount >= 10,
      title: uz ? '10 ta A’lo Baho' : '10 Grade 5s Club',
      req: uz ? '10 marta 5 (a’lo) baho oling' : 'Achieve Grade 5 ten times',
    },
    {
      id: 'badge-grades-20',
      icon: Award,
      unlocked: gradeFivesCount >= 20,
      title: uz ? '20 ta A’lo Baho' : '20 Grade 5s Elite',
      req: uz ? '20 marta 5 (a’ло) baho oling' : 'Achieve Grade 5 twenty times',
    },
    {
      id: 'badge-perfect-5',
      icon: Crown,
      unlocked: perfectCount >= 5,
      title: uz ? '5x Mukammallik' : 'Penta Perfectionist',
      req: uz ? '5 marta 100% natija qayd eting' : 'Score 100% on 5 tests',
    },
    {
      id: 'badge-blitz-200',
      icon: Zap,
      unlocked: blitzBest >= 200,
      title: uz ? 'Blitz Ustasi 200' : 'Blitz Master 200',
      req: uz ? '60s Blitzda 200+ ball to‘plang' : 'Score 200+ pts in 60s Blitz',
    },
    {
      id: 'badge-blitz-300',
      icon: Flame,
      unlocked: blitzBest >= 300,
      title: uz ? 'Blitz Daho 300' : 'Blitz Genius 300',
      req: uz ? '60s Blitzda 300+ ball to‘plang' : 'Score 300+ pts in 60s Blitz',
    },
    {
      id: 'badge-exams-15',
      icon: Target,
      unlocked: examAttemptsCount >= 15,
      title: uz ? 'Imtihon Qiroli' : 'Exam Monarch',
      req: uz ? '15 ta rasmiy ChSB imtihonini topshiring' : 'Complete 15 official ChSB exams',
    },
    {
      id: 'badge-tests-35',
      icon: ShieldCheck,
      unlocked: cleanAttemptsCount >= 35,
      title: uz ? 'Sinov Marafonchisi' : 'Test Marathoner',
      req: uz ? 'Jami 35 ta testni yakunlang' : 'Complete 35 test submissions',
    },
    {
      id: 'badge-tests-50',
      icon: Sparkles,
      unlocked: cleanAttemptsCount >= 50,
      title: uz ? '50 Test Afsonasi' : '50 Tests Legend',
      req: uz ? 'Jami 50 ta testni yakunlang' : 'Complete 50 test submissions',
    },
    {
      id: 'badge-grand-master',
      icon: Trophy,
      unlocked: currentTier.level >= 10,
      title: uz ? '10-Daraja Grandmaster' : 'Level 10 Grandmaster',
      req: uz ? '10-darajaga yoting' : 'Reach Rank Level 10',
    },
    {
      id: 'badge-mythic-emperor',
      icon: Crown,
      unlocked: currentTier.level >= 15,
      title: uz ? '15-Daraja Mifik Imperator' : 'Level 15 Mythic Emperor',
      req: uz ? '15-darajaga (eng yuqori) yeting' : 'Reach Max Rank Level 15',
    },
    {
      id: 'badge-xp-150k',
      icon: Sparkles,
      unlocked: totalXp >= 150000,
      title: uz ? '150,000 XP Afsonasi' : '150K XP Legend',
      req: uz ? 'Umumiy 150,000+ XP to‘plang' : 'Accumulate 150,000+ total XP',
    },
    {
      id: 'badge-xp-200k',
      icon: Trophy,
      unlocked: totalXp >= 200000,
      title: uz ? '200,000 XP Monarxi' : '200K XP Monarch',
      req: uz ? 'Umumiy 200,000+ XP to‘plang' : 'Accumulate 200,000+ total XP',
    },
    {
      id: 'badge-xp-300k',
      icon: Crown,
      unlocked: totalXp >= 300000,
      title: uz ? '300,000 XP Xudosi' : '300K XP Deity',
      req: uz ? 'Umumiy 300,000+ XP to‘plang' : 'Accumulate 300,000+ total XP',
    },
    {
      id: 'badge-grades-30',
      icon: Award,
      unlocked: gradeFivesCount >= 30,
      title: uz ? '30 ta A’lo Baho' : '30 Grade 5s Crown',
      req: uz ? '30 marta 5 (a’lo) baho oling' : 'Achieve Grade 5 thirty times',
    },
    {
      id: 'badge-grades-40',
      icon: Award,
      unlocked: gradeFivesCount >= 40,
      title: uz ? '40 ta A’lo Baho' : '40 Grade 5s Apex',
      req: uz ? '40 marta 5 (a’lo) baho oling' : 'Achieve Grade 5 forty times',
    },
    {
      id: 'badge-perfect-10',
      icon: Crown,
      unlocked: perfectCount >= 10,
      title: uz ? '10x Mukammallik' : 'Deca Perfectionist',
      req: uz ? '10 marta 100% natija qayd eting' : 'Score 100% on 10 tests',
    },
    {
      id: 'badge-perfect-15',
      icon: Crown,
      unlocked: perfectCount >= 15,
      title: uz ? '15x Mukammallik' : 'Master Perfectionist',
      req: uz ? '15 marta 100% natija qayd eting' : 'Score 100% on 15 tests',
    },
    {
      id: 'badge-blitz-400',
      icon: Zap,
      unlocked: blitzBest >= 400,
      title: uz ? 'Blitz Giganti 400' : 'Blitz Giant 400',
      req: uz ? '60s Blitzda 400+ ball to‘plang' : 'Score 400+ pts in 60s Blitz',
    },
    {
      id: 'badge-blitz-500',
      icon: Flame,
      unlocked: blitzBest >= 500,
      title: uz ? 'Blitz Afsonasi 500' : 'Blitz Titan 500',
      req: uz ? '60s Blitzda 500+ ball to‘plang' : 'Score 500+ pts in 60s Blitz',
    },
    {
      id: 'badge-exams-20',
      icon: Target,
      unlocked: examAttemptsCount >= 20,
      title: uz ? 'Imtihon Titani' : 'Exam Titan',
      req: uz ? '20 ta rasmiy ChSB imtihonini topshiring' : 'Complete 20 official ChSB exams',
    },
    {
      id: 'badge-tests-75',
      icon: ShieldCheck,
      unlocked: cleanAttemptsCount >= 75,
      title: uz ? '75 Sinov Ustasi' : '75 Tests Master',
      req: uz ? 'Jami 75 ta testni yakunlang' : 'Complete 75 test submissions',
    },
    {
      id: 'badge-tests-100',
      icon: Sparkles,
      unlocked: cleanAttemptsCount >= 100,
      title: uz ? '100 Sinov Dahosi' : '100 Tests Century',
      req: uz ? 'Jami 100 ta testni yakunlang' : 'Complete 100 test submissions',
    },
    {
      id: 'badge-tier-level-5',
      icon: Trophy,
      unlocked: currentTier.level >= 5,
      title: uz ? '5-Daraja Olimpiadachi' : 'Level 5 Grandmaster',
      req: uz ? '5-darajaga yeting' : 'Reach Rank Level 5',
    },
    {
      id: 'badge-tier-level-8',
      icon: Trophy,
      unlocked: currentTier.level >= 8,
      title: uz ? '8-Daraja Vunderkind' : 'Level 8 Prodigy',
      req: uz ? '8-darajaga yeting' : 'Reach Rank Level 8',
    },
    {
      id: 'badge-tier-level-12',
      icon: Crown,
      unlocked: currentTier.level >= 12,
      title: uz ? '12-Daraja Ilmiy Daho' : 'Level 12 Genius',
      req: uz ? '12-darajaga yeting' : 'Reach Rank Level 12',
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
            {onOpenStore && (
              <button
                type="button"
                onClick={onOpenStore}
                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                {uz
                  ? `XP Do‘koniga o‘tish (${availableXp ?? totalXp} XP) →`
                  : `Spend in Store (${availableXp ?? totalXp} XP) →`}
              </button>
            )}
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
