import { AttemptRecord } from '../data/subjects';
import { UILanguage } from '../types/quiz';

export type StoreTier = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface StoreTitleItem {
  id: string;
  category: 'title';
  tier: StoreTier;
  price: number;
  label: { uz: string; en: string };
  description: { uz: string; en: string };
  textClass: string;
  accentColor: string;
}

export interface StoreFrameItem {
  id: string;
  category: 'frame';
  tier: StoreTier;
  price: number;
  label: { uz: string; en: string };
  description: { uz: string; en: string };
  ringClass: string;
  outerGlowClass: string;
  innerBgClass: string;
  hasCrown?: boolean;
  isAnimated?: boolean;
}

export interface UserCosmetics {
  uid: string;
  ownedTitles: string[];
  ownedFrames: string[];
  equippedTitle: string;
  equippedFrame: string;
  spentXp: number;
}

export const EMPTY_USER_COSMETICS: UserCosmetics = {
  uid: '',
  ownedTitles: [],
  ownedFrames: [],
  equippedTitle: '',
  equippedFrame: '',
  spentXp: 0,
};

export const STORE_TIER_META: Record<
  StoreTier,
  { labelUz: string; labelEn: string; textClass: string; accentClass: string }
> = {
  common: {
    labelUz: 'Oddiy · 1-daraja',
    labelEn: 'Common · Tier 1',
    textClass: 'text-emerald-700',
    accentClass: 'bg-emerald-600',
  },
  rare: {
    labelUz: 'Noyob · 2-daraja',
    labelEn: 'Rare · Tier 2',
    textClass: 'text-sky-700',
    accentClass: 'bg-sky-600',
  },
  epic: {
    labelUz: 'Epik · 3-daraja',
    labelEn: 'Epic · Tier 3',
    textClass: 'text-indigo-700',
    accentClass: 'bg-indigo-600',
  },
  legendary: {
    labelUz: 'Afsonaviy · 4-daraja',
    labelEn: 'Legendary · Tier 4',
    textClass: 'text-amber-700',
    accentClass: 'bg-amber-600',
  },
  mythic: {
    labelUz: 'Mifik · 5-daraja',
    labelEn: 'Mythic · Tier 5',
    textClass: 'text-rose-700',
    accentClass: 'bg-rose-600',
  },
};

export const STORE_TITLES: StoreTitleItem[] = [
  {
    id: 'title_scholar',
    category: 'title',
    tier: 'common',
    price: 400,
    label: { uz: '7-Sinf Bilimdoni', en: 'Grade 7 Scholar' },
    description: {
      uz: 'Ilk yutuqlarga erishgan o‘quvchilar uchun asosiy faxriy titul.',
      en: 'Classic academic title for students beginning their ChSB journey.',
    },
    textClass: 'text-teal-700 font-bold',
    accentColor: '#0f766e',
  },
  {
    id: 'title_blitz_runner',
    category: 'title',
    tier: 'rare',
    price: 800,
    label: { uz: 'Tezkor Zehn', en: 'Blitz Sprinter' },
    description: {
      uz: '60 soniyalik tezkor savol-javob ustasi.',
      en: 'Awarded to sharp thinkers who conquer rapid-fire Blitz rounds.',
    },
    textClass: 'text-emerald-700 font-bold',
    accentColor: '#047857',
  },
  {
    id: 'title_polymath',
    category: 'title',
    tier: 'rare',
    price: 1500,
    label: { uz: 'Fan Ustasi', en: 'Subject Polymath' },
    description: {
      uz: 'Matematika, Science va Informatika bo‘yicha kuchli tayyorgarlik belgisi.',
      en: 'Marks balanced mastery across STEM and humanities subjects.',
    },
    textClass: 'text-sky-700 font-extrabold',
    accentColor: '#0369a1',
  },
  {
    id: 'title_strategist',
    category: 'title',
    tier: 'epic',
    price: 2400,
    label: { uz: 'ChSB Strategi', en: 'ChSB Strategist' },
    description: {
      uz: 'Har bir imtihon variantiga puxta reja bilan kiruvchi bilimdon.',
      en: 'For disciplined learners who approach every ChSB variant strategically.',
    },
    textClass: 'text-indigo-700 font-extrabold',
    accentColor: '#4338ca',
  },
  {
    id: 'title_olympian',
    category: 'title',
    tier: 'epic',
    price: 3500,
    label: { uz: 'Olimpiada Chempioni', en: 'Olympiad Champion' },
    description: {
      uz: 'Yuqori ball va tezkor fikrlash bilan ajralib turadigan yetakchi.',
      en: 'High-tier distinction for consistent top-percentile exam scores.',
    },
    textClass: 'text-amber-700 font-extrabold',
    accentColor: '#b45309',
  },
  {
    id: 'title_prodigy',
    category: 'title',
    tier: 'legendary',
    price: 4800,
    label: { uz: 'Akademik Vunderkind', en: 'Academic Prodigy' },
    description: {
      uz: 'Oltin darajadagi elita o‘quvchi tituli.',
      en: 'Prestigious gold-tier academic title reserved for standout scholars.',
    },
    textClass: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent font-extrabold',
    accentColor: '#d97706',
  },
  {
    id: 'title_grand_sage',
    category: 'title',
    tier: 'legendary',
    price: 6300,
    label: { uz: 'Buyuk Alloma', en: 'Grand Sage' },
    description: {
      uz: 'Barcha fanlardan 5 baho sari intiluvchi ustozona maqom.',
      en: 'Royal crimson-gold title symbolizing elite command of Grade 7 subjects.',
    },
    textClass: 'bg-gradient-to-r from-rose-700 via-amber-600 to-rose-700 bg-clip-text text-transparent font-extrabold',
    accentColor: '#be123c',
  },
  {
    id: 'title_mythic_legend',
    category: 'title',
    tier: 'mythic',
    price: 8000,
    label: { uz: 'ChSB Afsonasi', en: 'ChSB Mythic Legend' },
    description: {
      uz: 'Platformadagi eng noyob va qimmat mifik titul — haqiqiy rekordchilar uchun.',
      en: 'The rarest Mythic prestige title in the entire Grade 7 ChSB arena.',
    },
    textClass: 'store-mythic-text font-extrabold',
    accentColor: '#9f1239',
  },
];

export const STORE_FRAMES: StoreFrameItem[] = [
  {
    id: 'frame_mint',
    category: 'frame',
    tier: 'common',
    price: 600,
    label: { uz: 'Zumrad Halqa', en: 'Emerald Ring' },
    description: {
      uz: 'Toza zumrad rangli qo‘sh hoshiyali profil ramkasi.',
      en: 'Crisp emerald double-bevel border around your profile emblem.',
    },
    ringClass: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    outerGlowClass: 'ring-1 ring-emerald-200',
    innerBgClass: 'bg-emerald-50 text-emerald-800',
  },
  {
    id: 'frame_cobalt',
    category: 'frame',
    tier: 'rare',
    price: 1100,
    label: { uz: 'Kobalt Qalqon', en: 'Cobalt Shield' },
    description: {
      uz: 'Chuqur ko‘k gradient va yorqin kumush hoshiyali ramka.',
      en: 'Deep cobalt-sapphire metallic rim with sharp contrast framing.',
    },
    ringClass: 'bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700',
    outerGlowClass: 'shadow-sm shadow-blue-500/25',
    innerBgClass: 'bg-sky-50 text-sky-900',
  },
  {
    id: 'frame_amethyst',
    category: 'frame',
    tier: 'rare',
    price: 1800,
    label: { uz: 'Ametist Prizma', en: 'Amethyst Prism' },
    description: {
      uz: 'Binafsha-indigo prizmatik nurli nafis profil ramkasi.',
      en: 'Violet-indigo prismatic border with subtle crystalline depth.',
    },
    ringClass: 'bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500',
    outerGlowClass: 'shadow-sm shadow-violet-500/30',
    innerBgClass: 'bg-violet-50 text-violet-900',
  },
  {
    id: 'frame_cyber_hex',
    category: 'frame',
    tier: 'epic',
    price: 2700,
    label: { uz: 'Raqamli Matritsa', en: 'Digital Matrix' },
    description: {
      uz: 'Aylanuvchi texnologik halqaga ega Informatika uslubidagi epik ramka.',
      en: 'Precision tech-halo frame with continuous rotational accent.',
    },
    ringClass: 'bg-gradient-to-tr from-teal-400 via-cyan-500 to-slate-800',
    outerGlowClass: 'shadow-md shadow-teal-500/30',
    innerBgClass: 'bg-slate-900 text-teal-300',
    isAnimated: true,
  },
  {
    id: 'frame_ruby_flame',
    category: 'frame',
    tier: 'epic',
    price: 3800,
    label: { uz: 'Yoqut Alanga', en: 'Ruby Flame' },
    description: {
      uz: 'Qizil yoqut va olovli qahrabo rangli epik profil ramkasi.',
      en: 'Blazing crimson-amber gradient ring built for competitive scorers.',
    },
    ringClass: 'bg-gradient-to-tr from-rose-600 via-red-500 to-amber-400',
    outerGlowClass: 'shadow-md shadow-rose-500/35',
    innerBgClass: 'bg-rose-950 text-amber-200',
    isAnimated: true,
  },
  {
    id: 'frame_solar_gold',
    category: 'frame',
    tier: 'legendary',
    price: 5200,
    label: { uz: 'Oltin Toj Ramka', en: 'Golden Crown Frame' },
    description: {
      uz: 'Yuqori qismida oltin toj nishoniga ega afsonaviy ramka.',
      en: 'Brushed 24k gold alloy border crowned with a scholar emblem.',
    },
    ringClass: 'bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-500',
    outerGlowClass: 'shadow-md shadow-amber-500/40',
    innerBgClass: 'bg-amber-950 text-amber-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_astral_aurora',
    category: 'frame',
    tier: 'legendary',
    price: 6800,
    label: { uz: 'Yulduzli Aurora', en: 'Astral Aurora' },
    description: {
      uz: 'Tungi osmon va qutb yog‘dusi ranglarida tovlanuvchi ramka.',
      en: 'Celestial aurora conic ring radiating cool emerald-indigo light.',
    },
    ringClass: 'bg-gradient-to-tr from-emerald-400 via-sky-500 to-indigo-600',
    outerGlowClass: 'shadow-lg shadow-sky-500/35',
    innerBgClass: 'bg-slate-950 text-sky-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_mythic_phoenix',
    category: 'frame',
    tier: 'mythic',
    price: 10000,
    label: { uz: 'Mifik Imperator', en: 'Mythic Emperor' },
    description: {
      uz: 'Eng oliy mifik daraja — oltin toj va jonli prizmatik halqali imperator ramkasi.',
      en: 'Supreme Mythic frame combining animated prismatic light and royal crown.',
    },
    ringClass: 'store-mythic-ring',
    outerGlowClass: 'shadow-lg shadow-rose-500/40',
    innerBgClass: 'bg-slate-950 text-amber-200',
    hasCrown: true,
    isAnimated: true,
  },
];

export const STORE_TITLE_MAP: Record<string, StoreTitleItem> = Object.fromEntries(
  STORE_TITLES.map((item) => [item.id, item])
);

export const STORE_FRAME_MAP: Record<string, StoreFrameItem> = Object.fromEntries(
  STORE_FRAMES.map((item) => [item.id, item])
);

export function computeEarnedXp(history: AttemptRecord[], blitzBest: number): number {
  const attemptXp = history.reduce((sum, item) => {
    if (item.cheated) return sum;
    return sum + item.score * 6 + (item.grade === 5 ? 40 : item.grade === 4 ? 15 : 0);
  }, 0);
  return attemptXp + Math.max(0, blitzBest);
}

export function readLocalBlitzBest(uid: string): number {
  if (!uid || typeof window === 'undefined') return 0;
  try {
    const saved = window.localStorage.getItem(`g7_chsb_blitz_best_${uid}`);
    return saved ? Math.max(0, Number(saved) || 0) : 0;
  } catch {
    return 0;
  }
}

export function getStoreTierLabel(tier: StoreTier, lang: UILanguage): string {
  const meta = STORE_TIER_META[tier];
  return lang === 'uz' ? meta.labelUz : meta.labelEn;
}
