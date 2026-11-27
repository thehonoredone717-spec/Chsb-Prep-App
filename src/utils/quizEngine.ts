import {
  ActiveQuizQuestion,
  BilingualText,
  DifficultyLevel,
  QuestionItem,
  QuizSectionKind,
  SubjectConfig,
  SubjectId,
  UILanguage,
  VariantSelection,
} from '../types/quiz';

export const QUESTIONS_PER_TEST = 25;
export const QUESTIONS_PER_TOPIC_VARIANT = 10;
export const VARIANTS_PER_SECTION = 20;
export const TOPIC_VARIANTS_COUNT = 3;
export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['easy', 'medium', 'hard'];

export function getVariantCountForSubject(_subjectId: SubjectId): number {
  return VARIANTS_PER_SECTION;
}

export function getVariantChoices(subjectId: SubjectId): VariantSelection[] {
  const count = getVariantCountForSubject(subjectId);
  const nums: VariantSelection[] = [];
  for (let i = 1; i <= count; i++) {
    nums.push(i);
  }
  nums.push('random');
  return nums;
}

export function getTopicVariantCount(subject: SubjectConfig, topic: string): number {
  const count = subject.testQuestions.filter((q) => q.topic === topic).length;
  if (count >= 30) return 3;
  if (count >= 20) return 2;
  return 1;
}

export function getDifficultyLabel(difficulty: DifficultyLevel, lang: UILanguage): string {
  if (difficulty === 'easy') return lang === 'uz' ? 'Oson' : 'Easy';
  if (difficulty === 'medium') return lang === 'uz' ? "O'rta" : 'Medium';
  return lang === 'uz' ? 'Qiyin' : 'Hard';
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getNextVariant(
  current: VariantSelection,
  subjectId: SubjectId = 'math'
): VariantSelection {
  const maxVariant = getVariantCountForSubject(subjectId);
  if (typeof current === 'number') {
    if (current < maxVariant) return current + 1;
    return 'random';
  }
  return 1;
}

export function getVariantLabel(variant: VariantSelection, lang: UILanguage): string {
  if (variant === 'random') {
    return lang === 'uz' ? 'Tasodifiy 25' : 'Random 25';
  }
  return `Variant ${variant}`;
}

/**
 * Interleaves questions deterministically round-robin by topic and difficulty
 * so every consecutive 25-question variant slice covers all topics and tiers evenly
 * while keeping all 20 variants completely disjoint (zero overlap).
 */
export function interleaveByTopicAndDifficulty(items: QuestionItem[]): QuestionItem[] {
  const byTopic = new Map<string, QuestionItem[]>();
  for (const item of items) {
    const list = byTopic.get(item.topic) ?? [];
    list.push(item);
    byTopic.set(item.topic, list);
  }

  // Within each topic, interleave easy -> medium -> hard so slices balance difficulty too
  const queues: QuestionItem[][] = Array.from(byTopic.values()).map((topicItems) => {
    const easy = topicItems.filter((q) => q.difficulty === 'easy');
    const med = topicItems.filter((q) => q.difficulty === 'medium');
    const hard = topicItems.filter((q) => q.difficulty === 'hard');
    const mixed: QuestionItem[] = [];
    const maxLen = Math.max(easy.length, med.length, hard.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < easy.length) mixed.push(easy[i]);
      if (i < med.length) mixed.push(med[i]);
      if (i < hard.length) mixed.push(hard[i]);
    }
    return mixed;
  });

  const out: QuestionItem[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const q of queues) {
      const next = q.shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }
  return out;
}

/**
 * Builds a 25-question session strictly from either subject.testQuestions ('test')
 * or subject.examQuestions ('exam').
 * Because each bank contains >= 500 unique questions (20 * 25), Variants 1..20 partition
 * the interleaved bank into 20 strictly non-overlapping 25-question sets.
 */
export function buildVariantQuestions(
  subject: SubjectConfig,
  sectionKind: QuizSectionKind,
  variant: VariantSelection,
  previousIds: string[] = []
): ActiveQuizQuestion[] {
  const rawPool =
    sectionKind === 'exam' ? subject.examQuestions : subject.testQuestions;
  const orderedPool = interleaveByTopicAndDifficulty(rawPool);

  let chosen: QuestionItem[] = [];

  if (typeof variant === 'number' && orderedPool.length >= VARIANTS_PER_SECTION * QUESTIONS_PER_TEST) {
    const safeVariant = Math.max(1, Math.min(VARIANTS_PER_SECTION, variant));
    const start = (safeVariant - 1) * QUESTIONS_PER_TEST;
    chosen = orderedPool.slice(start, start + QUESTIONS_PER_TEST);
  } else {
    const prevSet = new Set(previousIds);
    const freshPool = orderedPool.filter((q) => !prevSet.has(q.id));
    const candidatePool = freshPool.length >= QUESTIONS_PER_TEST ? freshPool : orderedPool;

    const byTopic = new Map<string, QuestionItem[]>();
    for (const q of shuffleArray(candidatePool)) {
      const list = byTopic.get(q.topic) ?? [];
      list.push(q);
      byTopic.set(q.topic, list);
    }

    const picked: QuestionItem[] = [];
    const pickedIds = new Set<string>();
    const topicQueues = shuffleArray(Array.from(byTopic.values()));

    let addedInRound = true;
    while (picked.length < QUESTIONS_PER_TEST && addedInRound) {
      addedInRound = false;
      for (const queue of topicQueues) {
        if (picked.length >= QUESTIONS_PER_TEST) break;
        const nextItem = queue.shift();
        if (nextItem && !pickedIds.has(nextItem.id)) {
          picked.push(nextItem);
          pickedIds.add(nextItem.id);
          addedInRound = true;
        }
      }
    }

    if (picked.length < QUESTIONS_PER_TEST) {
      for (const q of shuffleArray(orderedPool)) {
        if (picked.length >= QUESTIONS_PER_TEST) break;
        if (!pickedIds.has(q.id)) {
          picked.push(q);
          pickedIds.add(q.id);
        }
      }
    }

    chosen = picked;
  }

  return shuffleArray(chosen).map((q) => ({
    source: q,
    optionOrder: shuffleArray([0, 1, 2, 3]),
  }));
}

/**
 * Builds a 10-question topic-specific variant (Variant 1, 2, or 3) strictly from
 * subject.testQuestions so every topic has 3 completely disjoint practice variants
 * and never overlaps with subject.examQuestions.
 */
export function buildTopicVariantQuestions(
  subject: SubjectConfig,
  topic: string,
  topicVariant: number
): ActiveQuizQuestion[] {
  const topicPool = subject.testQuestions.filter((q) => q.topic === topic);
  const easy = topicPool.filter((q) => q.difficulty === 'easy');
  const med = topicPool.filter((q) => q.difficulty === 'medium');
  const hard = topicPool.filter((q) => q.difficulty === 'hard');
  const mixed: QuestionItem[] = [];
  const maxLen = Math.max(easy.length, med.length, hard.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < easy.length) mixed.push(easy[i]);
    if (i < med.length) mixed.push(med[i]);
    if (i < hard.length) mixed.push(hard[i]);
  }

  const maxV = getTopicVariantCount(subject, topic);
  const safeV = Math.max(1, Math.min(maxV, topicVariant));
  const start = (safeV - 1) * QUESTIONS_PER_TOPIC_VARIANT;
  const chosen = mixed.slice(start, start + QUESTIONS_PER_TOPIC_VARIANT);

  return shuffleArray(chosen).map((q) => ({
    source: q,
    optionOrder: shuffleArray([0, 1, 2, 3]),
  }));
}

export function getLocalizedField(
  val: string | BilingualText,
  lang: UILanguage
): string {
  if (typeof val === 'string') return val;
  return lang === 'uz' ? val.uz : val.en;
}

export function getLocalizedOptions(
  opts: string[] | { uz: string[]; en: string[] },
  lang: UILanguage
): string[] {
  if (Array.isArray(opts)) return opts;
  return lang === 'uz' ? opts.uz : opts.en;
}

export function isChoiceCorrect(
  question: ActiveQuizQuestion,
  selectedDisplayIndex: number | undefined
): boolean {
  if (selectedDisplayIndex === undefined) return false;
  const originalIdx = question.optionOrder[selectedDisplayIndex];
  return originalIdx === question.source.answer;
}

export function getCorrectDisplayIndex(question: ActiveQuizQuestion): number {
  return question.optionOrder.indexOf(question.source.answer);
}

export function gradeOf(pct: number): {
  grade: 3 | 4 | 5;
  label: BilingualText;
} {
  if (pct >= 86) {
    return { grade: 5, label: { uz: "A'lo", en: 'Excellent' } };
  }
  if (pct >= 65) {
    return { grade: 4, label: { uz: 'Yaxshi', en: 'Good' } };
  }
  return { grade: 3, label: { uz: 'Qoniqarsiz', en: 'Unsatisfactory' } };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
