import { Lock } from 'lucide-react';
import { useState } from 'react';
import { SUBJECTS, pickText } from '../data/subjects';
import { DifficultyLevel, SubjectId, UILanguage } from '../types/quiz';
import { buildVariantQuestions, getDifficultyLabel, getLocalizedOptions, getVariantLabel } from '../utils/quizEngine';
import { FormattedMathText } from './FormattedMathText';
import { MathShapeDiagram } from './MathShapeDiagram';
import { TeacherScope } from './TopBar';

interface PreviewViewProps {
  lang: UILanguage;
  teacherScope: TeacherScope;
}

export function PreviewView({ lang, teacherScope }: PreviewViewProps) {
  const uz = lang === 'uz';
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('math');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [variantNum, setVariantNum] = useState<number>(1);

  if (teacherScope === 'none') {
    return (
      <section className="rounded-xl border border-rose-200 bg-white p-8 text-center shadow-xs sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
          <Lock className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-xl font-extrabold text-slate-900">
          {uz ? 'Ruxsat berilmagan' : 'Access Restricted'}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          {uz
            ? 'Savollarni oldindan ko‘rish (Preview Questions) bo‘limidan faqat ustozlar foydalanishi mumkin.'
            : 'Preview Questions is restricted to teachers only.'}
        </p>
      </section>
    );
  }

  const subject = SUBJECTS.find((s) => s.id === selectedSubjectId) || SUBJECTS[0];
  const maxVariants = subject.id === 'math' ? 20 : 5;

  const activeQuestions = buildVariantQuestions(subject, difficulty, variantNum);

  return (
    <section className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {uz ? 'Preview Questions — Savollarni oldindan ko‘rish' : 'Preview Questions'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {uz
            ? 'Ustozlar barcha fanlar, darajalar va variantlardagi savollarni, to‘g‘ri javoblarni hamda chizmalarni to‘liq ko‘rib chiqishi mumkin.'
            : 'Teachers can inspect all questions, correct answers, and diagrams across any subject, difficulty, and variant.'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">{uz ? 'Fan:' : 'Subject:'}</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value as SubjectId)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800"
          >
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {pickText(s.title, lang)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">{uz ? 'Daraja:' : 'Difficulty:'}</span>
          {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                difficulty === d ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {getDifficultyLabel(d, lang)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">{uz ? 'Variant:' : 'Variant:'}</span>
          <select
            value={variantNum}
            onChange={(e) => setVariantNum(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800"
          >
            {Array.from({ length: maxVariants }, (_, i) => i + 1).map((v) => (
              <option key={v} value={v}>
                {getVariantLabel(v, lang)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {activeQuestions.map((item, idx) => {
          const q = item.source;
          const opts = getLocalizedOptions(q.opts, lang);
          const correctIdx = q.answer;

          return (
            <div key={q.id || idx} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-semibold text-slate-500">
                <span>
                  #{idx + 1} · {q.topic}
                </span>
                <span className="rounded bg-teal-50 px-2 py-0.5 font-mono text-teal-800">
                  ID: {q.id}
                </span>
              </div>

              <div className="mt-4 text-base font-bold text-slate-900">
                <FormattedMathText text={typeof q.q === 'string' ? q.q : q.q[lang]} />
              </div>

              {q.diagram && (
                <div className="mt-4 flex justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <MathShapeDiagram diagram={q.diagram} questionId={q.id} lang={lang} />
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {opts.map((optText, optIdx) => {
                  const isCorrect = optIdx === correctIdx;
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium ${
                        isCorrect
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-slate-50/70 text-slate-700'
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold shadow-xs">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">
                        <FormattedMathText text={optText} />
                      </span>
                      {isCorrect && (
                        <span className="text-xs font-bold text-emerald-700 uppercase">
                          {uz ? "To'g'ri javob" : 'Correct'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explain && (
                <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50/60 p-3.5 text-xs text-teal-900">
                  <span className="font-bold">{uz ? 'Izoh: ' : 'Explanation: '}</span>
                  <FormattedMathText text={typeof q.explain === 'string' ? q.explain : q.explain[lang]} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
