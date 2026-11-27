export type SubjectId =
  | 'math'
  | 'history'
  | 'science'
  | 'computing'
  | 'english'
  | 'uzbek';

export type UILanguage = 'uz' | 'en';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type QuizSectionKind = 'test' | 'exam';

export interface BilingualText {
  uz: string;
  en: string;
}

export type MathDiagramSpec =
  | { kind: 'circle'; mode: 'r' | 'd'; valueLabel: string }
  | { kind: 'semicircle'; mode: 'r' | 'd'; valueLabel: string }
  | { kind: 'sector'; r: number; angle: number }
  | { kind: 'rect'; w: number; h: number; unit?: string; diagonal?: string }
  | { kind: 'lshape'; outerW: number; outerH: number; cutW: number; cutH: number }
  | { kind: 'rect_tri'; w: number; hRect: number; hTri: number }
  | { kind: 'rect_minus_semi'; w: number; h: number; d: number }
  | { kind: 'stadium'; straight: number; d: number }
  | { kind: 'square_minus_circle'; s: number }
  | { kind: 'tri_plus_semi'; base: number; h: number }
  | { kind: 'cube'; sLabel: string }
  | { kind: 'cuboid'; l: number; w: number; h: number; diagonal?: boolean; sliced?: boolean }
  | { kind: 'tri_prism'; b: number; h: number; len: number; slant?: number }
  | { kind: 'cylinder'; r: number; h: number; openTop?: boolean; unknownH?: boolean }
  | { kind: 'trap_prism'; a: number; b: number; h: number; len: number }
  | { kind: 'pyramid'; base: number; slant: number }
  | { kind: 'prism_sym'; sides: 5 | 6 | 8 }
  | { kind: 'right_tri'; a: string; b: string; c: string; showCheck?: boolean }
  | { kind: 'ladder'; wall: string; base: string; len: string }
  | { kind: 'chord'; chordLen: number; dist: number }
  | { kind: 'equilateral'; s: number }
  | { kind: 'coords'; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'rhombus'; d1: number; d2: number };

export interface QuestionItem {
  id: string;
  topic: string;
  difficulty: DifficultyLevel;
  context?: string | BilingualText;
  q: string | BilingualText;
  opts: string[] | { uz: string[]; en: string[] };
  answer: number;
  explain: string | BilingualText;
  diagram?: MathDiagramSpec;
}

export interface StudyGuideItem {
  title: string;
  points: string[];
}

export interface SubjectConfig {
  id: SubjectId;
  title: BilingualText;
  shortLabel: BilingualText;
  subtitle: BilingualText;
  questionLangNote: BilingualText;
  topics: string[];
  studyGuide: StudyGuideItem[];
  testQuestions: QuestionItem[];
  examQuestions: QuestionItem[];
  questions: QuestionItem[];
}

export interface ActiveQuizQuestion {
  source: QuestionItem;
  optionOrder: number[]; // maps displayed index 0..3 -> original index 0..3
}

export type VariantSelection = number | 'random';

export type QuizMode = 'practice' | 'exam';

export interface TopicDrillRequest {
  subjectId: SubjectId;
  topic: string;
  variant: number;
  nonce: number;
}
