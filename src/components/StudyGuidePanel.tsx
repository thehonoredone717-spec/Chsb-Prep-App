import {
  ArrowRight,
  Ban,
  BookOpen,
  BookOpenCheck,
  Check,
  Copy,
  FlaskConical,
  FlipHorizontal,
  Printer,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { UI_COPY, pickText } from '../data/subjects';
import { QuizSectionKind, SubjectConfig, UILanguage } from '../types/quiz';
import { getTopicVariantCount } from '../utils/quizEngine';
import { SUBJECT_THEMES } from '../utils/subjectTheme';
import { FormattedMathText } from './FormattedMathText';
import { InteractiveFlashcards, SubjectInteractiveLab } from './InteractiveStudyLab';

interface StudyGuidePanelProps {
  subject: SubjectConfig;
  lang: UILanguage;
  isProhibited?: boolean;
  onStartQuiz: (kind?: QuizSectionKind) => void;
  onStartTopicVariant?: (topic: string, variant: number) => void;
}

type GuideTab = 'guide' | 'flashcards' | 'lab';

export function StudyGuidePanel({
  subject,
  lang,
  isProhibited = false,
  onStartQuiz,
  onStartTopicVariant,
}: StudyGuidePanelProps) {
  const copy = UI_COPY[lang];
  const uz = lang === 'uz';
  const theme = SUBJECT_THEMES[subject.id];
  const hasInteractiveLab =
    subject.id === 'math' || subject.id === 'science' || subject.id === 'computing';

  const [activeTab, setActiveTab] = useState<GuideTab>('guide');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedPoint, setCopiedPoint] = useState<string | null>(null);

  useEffect(() => {
    if (!hasInteractiveLab && activeTab === 'lab') {
      setActiveTab('guide');
    }
  }, [hasInteractiveLab, activeTab]);

  const handleCopy = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedPoint(text);
    setTimeout(() => {
      setCopiedPoint((curr) => (curr === text ? null : curr));
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter study guide and topics by search query
  const filteredStudyGuide = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return subject.studyGuide;

    return subject.studyGuide
      .map((section) => {
        const matchesTitle = section.title.toLowerCase().includes(q);
        const matchingPoints = section.points.filter((pt) =>
          pt.toLowerCase().includes(q)
        );

        if (matchesTitle || matchingPoints.length > 0) {
          return {
            title: section.title,
            points: matchesTitle ? section.points : matchingPoints,
          };
        }
        return null;
      })
      .filter((s): s is { title: string; points: string[] } => s !== null);
  }, [subject.studyGuide, searchQuery]);

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return subject.topics;
    return subject.topics.filter((t) => t.toLowerCase().includes(q));
  }, [subject.topics, searchQuery]);

  return (
    <section className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 print:pb-2">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${theme.accentText}`}>
            {pickText(subject.shortLabel, lang)} · {subject.topics.length}{' '}
            {uz ? 'mavzu' : 'topics'} · {subject.testQuestions.length} Test + {subject.examQuestions.length}{' '}
            {uz ? 'Imtihon savoli' : 'Exam Qs'}
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {copy.studyGuideTitle}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            {pickText(subject.title, lang)} — {pickText(subject.subtitle, lang)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          {activeTab === 'guide' && (
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              title={uz ? 'Qo‘llanmani chop etish' : 'Print Study Guide'}
            >
              <Printer className="h-4 w-4 text-slate-600" />
              <span>{uz ? 'Chop etish' : 'Print'}</span>
            </button>
          )}

          {isProhibited ? (
            <button
              type="button"
              disabled
              className="inline-flex min-h-[42px] shrink-0 cursor-not-allowed items-center gap-2 rounded-lg bg-rose-700/90 px-4 text-sm font-semibold text-white opacity-90"
            >
              <Ban className="h-4 w-4" aria-hidden="true" />
              <span>{uz ? 'Test yopiq (Prohibited)' : 'Test Prohibited'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onStartQuiz('test')}
                className="inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
              >
                <span>{copy.startTest} (20 v.)</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onStartQuiz('exam')}
                className="inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <span>{copy.startExam} (20 v.)</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs: Study Guide · Interactive Flashcards · STEM Lab */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div
          role="tablist"
          aria-label={uz ? 'Qo‘llanma rejimlari' : 'Study modes'}
          className="inline-flex rounded-xl border border-slate-200 bg-white p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'guide'}
            onClick={() => setActiveTab('guide')}
            className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors sm:text-sm ${
              activeTab === 'guide'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>{uz ? 'Qo‘llanma va Formulalar' : 'Study Guide'}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'flashcards'}
            onClick={() => setActiveTab('flashcards')}
            className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors sm:text-sm ${
              activeTab === 'flashcards'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlipHorizontal className="h-4 w-4" aria-hidden="true" />
            <span>
              {uz ? 'Interaktiv Kartochkalar' : 'Flashcards'} ({subject.testQuestions.length})
            </span>
          </button>

          {hasInteractiveLab && (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'lab'}
              onClick={() => setActiveTab('lab')}
              className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors sm:text-sm ${
                activeTab === 'lab'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FlaskConical className="h-4 w-4" aria-hidden="true" />
              <span>{uz ? 'Interaktiv Laboratoriya' : 'Interactive Lab'}</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'flashcards' ? (
        <InteractiveFlashcards subject={subject} lang={lang} />
      ) : activeTab === 'lab' && hasInteractiveLab ? (
        <SubjectInteractiveLab
          subjectId={subject.id as 'math' | 'science' | 'computing'}
          lang={lang}
        />
      ) : (
        <>
          {/* Interactive Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 print:hidden">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  uz
                    ? 'Mavzular, formulalar yoki Cambridge kodlarini qidirish (masalan, 9Ni.02, pifagor, standard form)...'
                    : 'Search topics, formulas, or Cambridge syllabus codes (e.g. 9Ni.02, Pythagoras, standard form)...'
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-8 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-teal-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {searchQuery && (
              <span className="text-xs font-semibold text-slate-500">
                {filteredStudyGuide.length} {uz ? 'ta bo‘lim mos keldi' : 'matching sections'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Topics List on Left */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-4">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                <BookOpenCheck className={`h-4 w-4 ${theme.accentText}`} aria-hidden="true" />
                <span>{copy.topicsCovered}</span>
              </h2>
              <ol className="mt-4 space-y-2.5 text-sm text-slate-700">
                {filteredTopics.map((topic, idx) => {
                  const tVariants = getTopicVariantCount(subject, topic);
                  return (
                    <li
                      key={topic}
                      className="flex flex-col gap-1.5 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`font-mono-num mt-0.5 text-xs font-semibold ${theme.accentText}`}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="font-medium text-slate-800">{topic}</span>
                      </div>
                      {onStartTopicVariant && (
                        <div className="flex flex-wrap items-center gap-1.5 pl-6 print:hidden">
                          {Array.from({ length: tVariants }, (_, i) => i + 1).map((v) => (
                            <button
                              key={v}
                              type="button"
                              disabled={isProhibited}
                              onClick={() => onStartTopicVariant(topic, v)}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800 transition-colors hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              V{v} (10)
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
                {filteredTopics.length === 0 && (
                  <li className="py-3 text-center text-xs text-slate-500">
                    {uz ? 'Mavzu topilmadi' : 'No matching topics'}
                  </li>
                )}
              </ol>
            </div>

            {/* Detailed Study Guide Cards on Right */}
            <div className="space-y-4 lg:col-span-8">
              {filteredStudyGuide.map((section, sIdx) => (
                <article
                  key={section.title}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <h3 className="font-display text-base font-bold text-slate-900 sm:text-lg">
                      {section.title}
                    </h3>
                    <span className="font-mono-num text-xs font-medium text-slate-400">
                      {String(sIdx + 1).padStart(2, '0')} · {section.points.length}{' '}
                      {uz ? 'qoida' : 'rules'}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-700">
                    {section.points.map((point) => {
                      const isCopied = copiedPoint === point;
                      return (
                        <li
                          key={point}
                          className="group relative flex items-start justify-between gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50/80"
                        >
                          <div className="flex flex-1 items-start gap-2.5">
                            <span
                              aria-hidden="true"
                              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${theme.barFill}`}
                            />
                            <span className="leading-relaxed">
                              <FormattedMathText text={point} />
                            </span>
                          </div>

                          {/* Quick Copy Formula Button */}
                          <button
                            type="button"
                            onClick={() => handleCopy(point)}
                            className={`shrink-0 rounded-md p-1 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 print:hidden ${
                              isCopied
                                ? 'bg-emerald-50 text-emerald-600 opacity-100'
                                : 'text-slate-400 opacity-0 hover:bg-slate-200/60 hover:text-slate-700 group-hover:opacity-100'
                            }`}
                            title={uz ? 'Nusxa olish' : 'Copy rule/formula'}
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              ))}

              {filteredStudyGuide.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  {uz
                    ? 'Qidiruv bo‘yicha hech qanday ma’lumot topilmadi. Boshqa so‘z bilan qidiring.'
                    : 'No study guide entries matched your query.'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
