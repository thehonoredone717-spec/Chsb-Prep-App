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
    price: 1200,
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
    price: 2500,
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
    price: 4500,
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
    price: 7500,
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
    price: 11000,
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
    price: 16000,
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
    price: 22000,
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
    price: 30000,
    label: { uz: 'ChSB Afsonasi', en: 'ChSB Mythic Legend' },
    description: {
      uz: 'Platformadagi eng noyob va qimmat mifik titul — haqiqiy rekordchilar uchun.',
      en: 'The rarest Mythic prestige title in the entire Grade 7 ChSB arena.',
    },
    textClass: 'store-mythic-text font-extrabold',
    accentColor: '#9f1239',
  },
  {
    id: 'title_math_wizard',
    category: 'title',
    tier: 'epic',
    price: 9000,
    label: { uz: 'Matematika Afsungari', en: 'Math Wizard' },
    description: {
      uz: 'Algebra va Geometriya masalalarini chaqmoqdek yechuvchi bilimdon.',
      en: 'Master of algebra and geometric problem solving.',
    },
    textClass: 'text-teal-800 font-extrabold',
    accentColor: '#0f766e',
  },
  {
    id: 'title_history_historian',
    category: 'title',
    tier: 'epic',
    price: 9500,
    label: { uz: 'Tarix Bilimdoni', en: 'Master Historian' },
    description: {
      uz: 'Buyuk sarkardalar va jahon tarixi sanalarini mukammal biluvchi.',
      en: 'Expert in world history and historical epochs.',
    },
    textClass: 'text-amber-800 font-extrabold',
    accentColor: '#b45309',
  },
  {
    id: 'title_science_chemist',
    category: 'title',
    tier: 'epic',
    price: 10000,
    label: { uz: 'Science Laboranti', en: 'Science Expert' },
    description: {
      uz: 'Fizika, Biologiya va Tabiiy fanlar laboratoriya ustasi.',
      en: 'Master of physics, biology, and natural sciences.',
    },
    textClass: 'text-emerald-800 font-extrabold',
    accentColor: '#047857',
  },
  {
    id: 'title_computing_coder',
    category: 'title',
    tier: 'legendary',
    price: 18000,
    label: { uz: 'Informatika Daho', en: 'Computing Pro' },
    description: {
      uz: 'Algoritmlar va Python dasturlash tili mutaxassisi.',
      en: 'Expert programmer and algorithmic problem solver.',
    },
    textClass: 'text-cyan-800 font-extrabold',
    accentColor: '#0891b2',
  },
  {
    id: 'title_english_polyglot',
    category: 'title',
    tier: 'legendary',
    price: 19000,
    label: { uz: 'Ingliz tili Poliglot', en: 'English Polyglot' },
    description: {
      uz: 'Grammatika va lug‘at boyligi bo‘yicha eng yuqori natijali o‘quvchi.',
      en: 'Mastery of English grammar, vocabulary, and reading comprehension.',
    },
    textClass: 'text-indigo-800 font-extrabold',
    accentColor: '#4f46e5',
  },
  {
    id: 'title_uzbek_poet',
    category: 'title',
    tier: 'mythic',
    price: 35000,
    label: { uz: 'Ona Tili Adibi', en: 'Uzbek Literature Laureate' },
    description: {
      uz: 'Ona tili va mumtoz adabiyotimiz bilimdoni, eng oliy adabiy unvon.',
      en: 'Supreme laureate in Uzbek language and classical literature.',
    },
    textClass: 'store-mythic-text font-extrabold',
    accentColor: '#be123c',
  },
  {
    id: 'title_supreme_archmage',
    category: 'title',
    tier: 'mythic',
    price: 50000,
    label: { uz: 'Oliy Bilim Sirlari Hukmdori', en: 'Supreme Archmage of Knowledge' },
    description: {
      uz: 'Barcha 6 ta fanni mukammal egallagan yakkayu yagona oliy unvon.',
      en: 'The ultimate transcendent title for absolute mastery across all subjects.',
    },
    textClass: 'store-mythic-text font-extrabold animate-pulse',
    accentColor: '#881337',
  },
  {
    id: 'title_galaxy_sage',
    category: 'title',
    tier: 'mythic',
    price: 75000,
    label: { uz: 'Koinot Dahosi', en: 'Galaxy Sage' },
    description: {
      uz: 'ChSB platformasining barcha chempionlaridan ustun turuvchi koinot darajasidagi daho.',
      en: 'Intergalactic tier intelligence title for the apex scholar.',
    },
    textClass: 'store-mythic-text font-extrabold',
    accentColor: '#4c0519',
  },
  {
    id: 'title_physics_master',
    category: 'title',
    tier: 'epic',
    price: 10500,
    label: { uz: 'Fizika Ustasi', en: 'Physics Master' },
    description: {
      uz: 'Mexnika, elektr va issiqlik qonunlarini mukammal egallagan o‘quvchi.',
      en: 'Master of mechanics, electricity, and thermodynamics.',
    },
    textClass: 'text-teal-900 font-extrabold',
    accentColor: '#0f766e',
  },
  {
    id: 'title_biology_expert',
    category: 'title',
    tier: 'epic',
    price: 11000,
    label: { uz: 'Biologiya Eksperti', en: 'Biology Expert' },
    description: {
      uz: 'Tirik organizmlar olami va tabiat sirlari bilimdoni.',
      en: 'Expert in living systems, botany, and zoology.',
    },
    textClass: 'text-emerald-900 font-extrabold',
    accentColor: '#047857',
  },
  {
    id: 'title_geography_explorer',
    category: 'title',
    tier: 'rare',
    price: 6000,
    label: { uz: 'Geografiya Izlanuvchisi', en: 'Geography Explorer' },
    description: {
      uz: 'Materiklar, okeanlar va xarita sirlarini mukammal biluvchi.',
      en: 'Cartography and earth sciences explorer.',
    },
    textClass: 'text-sky-900 font-extrabold',
    accentColor: '#0369a1',
  },
  {
    id: 'title_literature_critic',
    category: 'title',
    tier: 'legendary',
    price: 21000,
    label: { uz: 'Adabiyot Tanqidchisi', en: 'Literature Critic' },
    description: {
      uz: 'Mumtoz va zamonaviy o‘zbek adabiyoti bilimdoni.',
      en: 'Expert analyst of classical and contemporary literature.',
    },
    textClass: 'text-rose-900 font-extrabold',
    accentColor: '#be123c',
  },
  {
    id: 'title_algebra_king',
    category: 'title',
    tier: 'legendary',
    price: 23000,
    label: { uz: 'Algebra Qiroli', en: 'Algebra King' },
    description: {
      uz: 'Tenglamalar va funksiyalar olamining hukmdori.',
      en: 'Supreme monarch of equations and algebraic formulas.',
    },
    textClass: 'text-indigo-900 font-extrabold',
    accentColor: '#4338ca',
  },
  {
    id: 'title_geometry_lord',
    category: 'title',
    tier: 'mythic',
    price: 45000,
    label: { uz: 'Geometriya Hukmdori', en: 'Geometry Lord' },
    description: {
      uz: 'Fazoviy shakllar va teoremalar dahosi.',
      en: 'Mythic master of spatial figures and geometric theorems.',
    },
    textClass: 'store-mythic-text font-extrabold',
    accentColor: '#881337',
  },
  {
    id: 'title_quantum_physicist',
    category: 'title',
    tier: 'legendary',
    price: 32000,
    label: { uz: 'Kvant Fizigi', en: 'Quantum Physicist' },
    description: {
      uz: 'Kvant mexanikasi va atom energiyasi tadqiqotchisi.',
      en: 'Master of quantum mechanics and subatomic physics.',
    },
    textClass: 'text-teal-900 font-extrabold',
    accentColor: '#0f766e',
  },
  {
    id: 'title_galactic_historian',
    category: 'title',
    tier: 'legendary',
    price: 33000,
    label: { uz: 'Galaktik Tarixchi', en: 'Galactic Historian' },
    description: {
      uz: 'Insoniyat tarixi va jahon sivilizatsiyalari bilimdoni.',
      en: 'Expert in global civilizations and historical epics.',
    },
    textClass: 'text-amber-900 font-extrabold',
    accentColor: '#b45309',
  },
  {
    id: 'title_ai_architect',
    category: 'title',
    tier: 'mythic',
    price: 55000,
    label: { uz: 'Sun’iy Intellekt Arxitektori', en: 'AI Architect' },
    description: {
      uz: 'Informatika va neyrotarmoqlar olamining oliy mutaxassisi.',
      en: 'Apex computing and algorithmic intelligence expert.',
    },
    textClass: 'store-mythic-text font-extrabold',
    accentColor: '#0891b2',
  },
  {
    id: 'title_linguistics_guru',
    category: 'title',
    tier: 'legendary',
    price: 34000,
    label: { uz: 'Lingvistika Guru', en: 'Linguistics Guru' },
    description: {
      uz: 'Ona tili va ingliz tili grammatikasining mukammal ustasi.',
      en: 'Supreme expert in language grammar and comparative literature.',
    },
    textClass: 'text-indigo-900 font-extrabold',
    accentColor: '#4f46e5',
  },
  {
    id: 'title_stellar_mathematician',
    category: 'title',
    tier: 'mythic',
    price: 60000,
    label: { uz: 'Yulduzli Matematik', en: 'Stellar Mathematician' },
    description: {
      uz: 'Matematik tahlil va kosmik hisob-kitoblar dahosi.',
      en: 'Mythic calculus and transcendental math master.',
    },
    textClass: 'store-mythic-text font-extrabold animate-pulse',
    accentColor: '#1d4ed8',
  },
  {
    id: 'title_eco_champion',
    category: 'title',
    tier: 'epic',
    price: 16000,
    label: { uz: 'Ekologiya Chempioni', en: 'Eco Champion' },
    description: {
      uz: 'Tabiiy fanlar va biosfera qonuniyatlari bilimdoni.',
      en: 'Master of environmental science and ecology.',
    },
    textClass: 'text-emerald-900 font-extrabold',
    accentColor: '#047857',
  },
  {
    id: 'title_supreme_scholar',
    category: 'title',
    tier: 'mythic',
    price: 70000,
    label: { uz: 'Oliy Akademik Hukmron', en: 'Supreme Academic Sovereign' },
    description: {
      uz: 'Barcha fanlar bo‘yicha eng yuksak ilmiy unvon.',
      en: 'The sovereign crown of academic excellence across all disciplines.',
    },
    textClass: 'store-mythic-text font-extrabold',
    accentColor: '#881337',
  },
  {
    id: 'title_cosmic_oracle',
    category: 'title',
    tier: 'mythic',
    price: 85000,
    label: { uz: 'Kosmik Orakul', en: 'Cosmic Oracle' },
    description: {
      uz: 'Koinot sirlarini ochuvchi afsonaviy donishmand.',
      en: 'Transcendent oracle of universal knowledge.',
    },
    textClass: 'store-mythic-text font-extrabold animate-pulse',
    accentColor: '#4c0519',
  },
  {
    id: 'title_eternal_sage',
    category: 'title',
    tier: 'mythic',
    price: 100000,
    label: { uz: 'Abadiy Alloma', en: 'Eternal Sage' },
    description: {
      uz: 'ChSB platformasining barcha zamonlardagi eng ulug‘ allomasi.',
      en: 'The eternal timeless sage of academic mastery.',
    },
    textClass: 'store-mythic-text font-extrabold animate-pulse',
    accentColor: '#701a75',
  },
  {
    id: 'title_apex_legend',
    category: 'title',
    tier: 'mythic',
    price: 125000,
    label: { uz: 'Cho‘qqi Afsonasi', en: 'Apex Legend' },
    description: {
      uz: 'Platformaning mutlaq cho‘qqisini zabt etgan yagona afsona.',
      en: 'The absolute apex legend at the summit of human achievement.',
    },
    textClass: 'store-mythic-text font-extrabold animate-bounce',
    accentColor: '#881337',
  },
];

export const STORE_FRAMES: StoreFrameItem[] = [
  {
    id: 'frame_mint',
    category: 'frame',
    tier: 'common',
    price: 1800,
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
    price: 3500,
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
    price: 5500,
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
    price: 8000,
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
    price: 12000,
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
    price: 17000,
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
    price: 24000,
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
    price: 35000,
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
  {
    id: 'frame_math_nexus',
    category: 'frame',
    tier: 'epic',
    price: 13000,
    label: { uz: 'Matematik Halqa', en: 'Math Nexus Ring' },
    description: {
      uz: 'Matematik formulalar va geometrik simmetriya naqshli ramka.',
      en: 'Mathematical symmetry and geometric precision frame.',
    },
    ringClass: 'bg-gradient-to-tr from-teal-600 via-emerald-600 to-cyan-700',
    outerGlowClass: 'shadow-md shadow-teal-500/30',
    innerBgClass: 'bg-slate-900 text-teal-200',
    isAnimated: true,
  },
  {
    id: 'frame_history_crown',
    category: 'frame',
    tier: 'legendary',
    price: 20000,
    label: { uz: 'Tarixiy Hukmdor', en: 'Imperial History Crown' },
    description: {
      uz: 'Qadimiy imperiyalar va tarixiy toj naqshli afsonaviy ramka.',
      en: 'Legendary frame styled with ancient royal insignia.',
    },
    ringClass: 'bg-gradient-to-tr from-amber-700 via-yellow-600 to-orange-800',
    outerGlowClass: 'shadow-lg shadow-amber-600/35',
    innerBgClass: 'bg-amber-950 text-amber-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_science_atom',
    category: 'frame',
    tier: 'legendary',
    price: 22000,
    label: { uz: 'Atom Kvant Ramkasi', en: 'Quantum Atom Frame' },
    description: {
      uz: 'Kvant fizikasi va kimyoviy elementlar energiyasini taratuvchi ramka.',
      en: 'Quantum energy ring pulsing with scientific radiance.',
    },
    ringClass: 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-blue-600',
    outerGlowClass: 'shadow-lg shadow-emerald-500/35',
    innerBgClass: 'bg-slate-950 text-emerald-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_uzbek_silk',
    category: 'frame',
    tier: 'mythic',
    price: 40000,
    label: { uz: 'atlas Ipak Nuri', en: 'Atlas Silk Radiance' },
    description: {
      uz: 'Milliy adras va atlas naqshlarining mifik jilosiga ega oliy ramka.',
      en: 'Mythic silk radiance frame celebrating traditional heritage.',
    },
    ringClass: 'store-mythic-ring',
    outerGlowClass: 'shadow-xl shadow-rose-600/50',
    innerBgClass: 'bg-slate-950 text-rose-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_transcendent_singularity',
    category: 'frame',
    tier: 'mythic',
    price: 60000,
    label: { uz: 'Transsendent Singulyarlik', en: 'Transcendent Singularity' },
    description: {
      uz: 'Fazoviy energiya va yulduzlar nuri bilan o‘ralgan eng oliy mifik ramka.',
      en: 'The transcendent apex frame swirling with cosmic starlight and singularity energy.',
    },
    ringClass: 'store-mythic-ring animate-spin',
    outerGlowClass: 'shadow-2xl shadow-indigo-600/70',
    innerBgClass: 'bg-slate-950 text-indigo-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_eternal_omnipotence',
    category: 'frame',
    tier: 'mythic',
    price: 90000,
    label: { uz: 'Abadiy Mutlaq Hukmronlik', en: 'Eternal Omnipotence' },
    description: {
      uz: 'Platformadagi eng qimmat va muhtasham ilohiy ramka.',
      en: 'The absolute pinnacle reward frame for legendary ChSB emperors.',
    },
    ringClass: 'store-mythic-ring',
    outerGlowClass: 'shadow-2xl shadow-amber-500/80',
    innerBgClass: 'bg-slate-950 text-amber-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_emerald_matrix',
    category: 'frame',
    tier: 'epic',
    price: 14000,
    label: { uz: 'Zumrad Matritsa', en: 'Emerald Matrix Frame' },
    description: {
      uz: 'Yashil va zumrad rangli aylanuvchi energiya halqasi.',
      en: 'Emerald and teal glowing matrix ring.',
    },
    ringClass: 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-700',
    outerGlowClass: 'shadow-md shadow-emerald-500/35',
    innerBgClass: 'bg-slate-900 text-emerald-200',
    isAnimated: true,
  },
  {
    id: 'frame_obsidian_gold',
    category: 'frame',
    tier: 'legendary',
    price: 25000,
    label: { uz: 'Qora Obsidian va Oltin', en: 'Obsidian Gold Frame' },
    description: {
      uz: 'Qora obsidian toshi va sof oltin hoshiyali afsonaviy ramka.',
      en: 'Dark obsidian stone framed with brushed 24k gold.',
    },
    ringClass: 'bg-gradient-to-tr from-stone-900 via-amber-500 to-stone-950',
    outerGlowClass: 'shadow-lg shadow-amber-500/40',
    innerBgClass: 'bg-stone-950 text-amber-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_royal_sapphire',
    category: 'frame',
    tier: 'legendary',
    price: 28000,
    label: { uz: 'Qirol Safiri', en: 'Royal Sapphire Crown' },
    description: {
      uz: 'Shohona safir toshlari va qirollik tojiga ega ramka.',
      en: 'Royal blue sapphire gem embedded frame with crown.',
    },
    ringClass: 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-blue-900',
    outerGlowClass: 'shadow-lg shadow-blue-600/40',
    innerBgClass: 'bg-slate-950 text-blue-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_cyber_neon',
    category: 'frame',
    tier: 'epic',
    price: 15000,
    label: { uz: 'Kiber Neon', en: 'Cyber Neon Glow' },
    description: {
      uz: 'Neon rangli yorqin kiber halqa.',
      en: 'High-voltage cyberpunk neon glowing ring.',
    },
    ringClass: 'bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-teal-500',
    outerGlowClass: 'shadow-md shadow-cyan-500/40',
    innerBgClass: 'bg-slate-950 text-cyan-200',
    isAnimated: true,
  },
  {
    id: 'frame_solar_flame',
    category: 'frame',
    tier: 'mythic',
    price: 50000,
    label: { uz: 'Quyosh Alangasi', en: 'Solar Flame Apex' },
    description: {
      uz: 'Quyosh energetikasi va otashin jiloga ega mifik ramka.',
      en: 'Blazing solar corona flame ring for elite scholars.',
    },
    ringClass: 'store-mythic-ring',
    outerGlowClass: 'shadow-2xl shadow-orange-500/70',
    innerBgClass: 'bg-slate-950 text-orange-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_galaxy_nebula',
    category: 'frame',
    tier: 'mythic',
    price: 70000,
    label: { uz: 'Galaktika Tumanligi', en: 'Galaxy Nebula Ring' },
    description: {
      uz: 'Koinot tumanliklari va yulduzlar tizimi tasvirlangan mifik ramka.',
      en: 'Cosmic nebula swirl ring capturing deep space wonder.',
    },
    ringClass: 'store-mythic-ring animate-pulse',
    outerGlowClass: 'shadow-2xl shadow-purple-600/80',
    innerBgClass: 'bg-slate-950 text-purple-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_plasma_vortex',
    category: 'frame',
    tier: 'mythic',
    price: 80000,
    label: { uz: 'Plazma Vorteksi', en: 'Plasma Vortex Apex' },
    description: {
      uz: 'Yuqori energiyali plazma oqimlari bilan o‘ralgan mifik ramka.',
      en: 'High-energy swirling plasma vortex ring.',
    },
    ringClass: 'store-mythic-ring animate-spin',
    outerGlowClass: 'shadow-2xl shadow-rose-500/80',
    innerBgClass: 'bg-slate-950 text-rose-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_hyper_nova',
    category: 'frame',
    tier: 'mythic',
    price: 95000,
    label: { uz: 'Gipernova Portlashi', en: 'Hypernova Burst' },
    description: {
      uz: 'Yulduz portlashi energiyasini taratuvchi oliy darajadagi ramka.',
      en: 'Stellar hypernova explosion radiant ring.',
    },
    ringClass: 'store-mythic-ring animate-pulse',
    outerGlowClass: 'shadow-2xl shadow-amber-500/90',
    innerBgClass: 'bg-slate-950 text-amber-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_crystal_prism',
    category: 'frame',
    tier: 'legendary',
    price: 38000,
    label: { uz: 'Kristalli Prizma', en: 'Crystal Prism Ring' },
    description: {
      uz: 'Nur taratuvchi kristalli prizmatik afsonaviy ramka.',
      en: 'Crystalline light refracting legendary border.',
    },
    ringClass: 'bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500',
    outerGlowClass: 'shadow-xl shadow-cyan-500/50',
    innerBgClass: 'bg-slate-950 text-cyan-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_neon_matrix',
    category: 'frame',
    tier: 'epic',
    price: 18000,
    label: { uz: 'Neon Kiber Matritsa', en: 'Neon Cyber Matrix' },
    description: {
      uz: 'Kibernerik neon nurli zamonaviy epik ramka.',
      en: 'Cybernetic neon grid glowing frame.',
    },
    ringClass: 'bg-gradient-to-tr from-teal-400 via-emerald-500 to-cyan-600',
    outerGlowClass: 'shadow-md shadow-teal-500/40',
    innerBgClass: 'bg-slate-950 text-teal-200',
    isAnimated: true,
  },
  {
    id: 'frame_royal_diamond',
    category: 'frame',
    tier: 'mythic',
    price: 110000,
    label: { uz: 'Qirollik Olmosi', en: 'Royal Diamond Apex' },
    description: {
      uz: 'Eng sof olmoslar bilan bezatilgan shohona mifik ramka.',
      en: 'Pristine diamond encrusted royal mythic frame.',
    },
    ringClass: 'store-mythic-ring',
    outerGlowClass: 'shadow-2xl shadow-blue-400/90',
    innerBgClass: 'bg-slate-950 text-blue-100',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_starlight_halo',
    category: 'frame',
    tier: 'legendary',
    price: 42000,
    label: { uz: 'Yulduz nuri Halqasi', en: 'Starlight Halo' },
    description: {
      uz: 'O‘n minglab yulduzlar nuri yog‘dusidan yasalgan afsonaviy ramka.',
      en: 'Radiant starlight aura glowing border.',
    },
    ringClass: 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-indigo-600',
    outerGlowClass: 'shadow-xl shadow-amber-400/60',
    innerBgClass: 'bg-slate-950 text-amber-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_nebula_core',
    category: 'frame',
    tier: 'mythic',
    price: 120000,
    label: { uz: 'Tumanlik Markazi', en: 'Nebula Core Singularity' },
    description: {
      uz: 'Koinot tumanligining markaziy o‘chog‘idan ilhomlangan mifik ramka.',
      en: 'Deep space nebula core energy ring.',
    },
    ringClass: 'store-mythic-ring animate-spin',
    outerGlowClass: 'shadow-2xl shadow-fuchsia-600/90',
    innerBgClass: 'bg-slate-950 text-fuchsia-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_solar_crown',
    category: 'frame',
    tier: 'legendary',
    price: 45000,
    label: { uz: 'Quyosh Toji Ramkasi', en: 'Solar Crown Frame' },
    description: {
      uz: 'Quyosh toj qatlami nurlari bilan jilolanuvchi afsonaviy ramka.',
      en: 'Solar corona crown radiant ring.',
    },
    ringClass: 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400',
    outerGlowClass: 'shadow-xl shadow-orange-500/60',
    innerBgClass: 'bg-slate-950 text-amber-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_chronos_ring',
    category: 'frame',
    tier: 'mythic',
    price: 135000,
    label: { uz: 'Xronos Vaqt Halqasi', en: 'Chronos Time Ring' },
    description: {
      uz: 'Vaqt va makon oqimini boshqaruvchi eng oliy mifik ramka.',
      en: 'Mythic temporal time-bending eternity ring.',
    },
    ringClass: 'store-mythic-ring animate-pulse',
    outerGlowClass: 'shadow-2xl shadow-cyan-500/90',
    innerBgClass: 'bg-slate-950 text-cyan-200',
    hasCrown: true,
    isAnimated: true,
  },
  {
    id: 'frame_infinity_singularity',
    category: 'frame',
    tier: 'mythic',
    price: 150000,
    label: { uz: 'Cheksizlik Singulyarligi', en: 'Infinity Singularity' },
    description: {
      uz: 'Platformaning eng so‘nggi va eng qudratli abadiy mifik ramkasi.',
      en: 'The absolute final infinity pinnacle frame of the platform.',
    },
    ringClass: 'store-mythic-ring animate-spin',
    outerGlowClass: 'shadow-2xl shadow-amber-500/95',
    innerBgClass: 'bg-slate-950 text-amber-100',
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
