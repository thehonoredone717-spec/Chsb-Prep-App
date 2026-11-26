import { SubjectId } from '../types/quiz';

export interface SubjectAccentTheme {
  iconBg: string;
  iconText: string;
  barFill: string;
  accentText: string;
  activeTabBg: string;
  subtleBorder: string;
}

export const SUBJECT_THEMES: Record<SubjectId, SubjectAccentTheme> = {
  math: {
    iconBg: 'bg-teal-50',
    iconText: 'text-teal-700',
    barFill: 'bg-teal-600',
    accentText: 'text-teal-700',
    activeTabBg: 'bg-teal-700',
    subtleBorder: 'border-teal-200',
  },
  science: {
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-700',
    barFill: 'bg-emerald-600',
    accentText: 'text-emerald-700',
    activeTabBg: 'bg-emerald-700',
    subtleBorder: 'border-emerald-200',
  },
  computing: {
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-700',
    barFill: 'bg-indigo-600',
    accentText: 'text-indigo-700',
    activeTabBg: 'bg-indigo-700',
    subtleBorder: 'border-indigo-200',
  },
  history: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-700',
    barFill: 'bg-amber-500',
    accentText: 'text-amber-700',
    activeTabBg: 'bg-amber-700',
    subtleBorder: 'border-amber-200',
  },
  english: {
    iconBg: 'bg-sky-50',
    iconText: 'text-sky-700',
    barFill: 'bg-sky-600',
    accentText: 'text-sky-700',
    activeTabBg: 'bg-sky-700',
    subtleBorder: 'border-sky-200',
  },
  uzbek: {
    iconBg: 'bg-violet-50',
    iconText: 'text-violet-700',
    barFill: 'bg-violet-600',
    accentText: 'text-violet-700',
    activeTabBg: 'bg-violet-700',
    subtleBorder: 'border-violet-200',
  },
};
