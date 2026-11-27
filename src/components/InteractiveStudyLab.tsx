import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FlaskConical,
  FlipHorizontal,
  RotateCcw,
  Shuffle,
  Triangle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DifficultyLevel, SubjectConfig, UILanguage } from '../types/quiz';
import {
  getDifficultyLabel,
  getLocalizedField,
  getLocalizedOptions,
  shuffleArray,
} from '../utils/quizEngine';
import { playSound } from '../utils/sound';
import { FormattedMathText } from './FormattedMathText';
import { MathShapeDiagram } from './MathShapeDiagram';

interface InteractiveFlashcardsProps {
  subject: SubjectConfig;
  lang: UILanguage;
}

export function InteractiveFlashcards({ subject, lang }: InteractiveFlashcardsProps) {
  const uz = lang === 'uz';
  const [diffFilter, setDiffFilter] = useState<'all' | DifficultyLevel>('all');
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => new Set());

  const deck = useMemo(() => {
    const base =
      diffFilter === 'all'
        ? subject.testQuestions
        : subject.testQuestions.filter((q) => q.difficulty === diffFilter);
    return shuffleSeed === 0 ? base : shuffleArray(base);
  }, [subject.testQuestions, diffFilter, shuffleSeed]);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [subject.id, diffFilter, shuffleSeed]);

  const currentCard = deck[index];
  const masteredCount = deck.filter((q) => masteredIds.has(q.id)).length;
  const progressPct = deck.length > 0 ? Math.round(((index + 1) / deck.length) * 100) : 0;

  if (!currentCard) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        {uz ? 'Bu daraja uchun kartochkalar topilmadi.' : 'No flashcards available for this filter.'}
      </div>
    );
  }

  const opts = getLocalizedOptions(currentCard.opts, lang);
  const correctAnswerText = opts[currentCard.answer] ?? '';
  const isMastered = masteredIds.has(currentCard.id);

  const handleToggleMastered = (known: boolean) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (known) {
        next.add(currentCard.id);
      } else {
        next.delete(currentCard.id);
      }
      return next;
    });
    playSound(known ? 'success' : 'click');
    setFlipped(false);
    setIndex((prev) => (prev + 1 < deck.length ? prev + 1 : 0));
  };

  return (
    <div className="space-y-5">
      {/* Controls & Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
            {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDiffFilter(level)}
                className={`min-h-[34px] rounded-md px-3 text-xs font-semibold transition-colors ${
                  diffFilter === level
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {level === 'all' ? (uz ? 'Barchasi' : 'All') : getDifficultyLabel(level, lang)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setShuffleSeed((s) => s + 1);
              playSound('click');
            }}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Shuffle className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
            <span>{uz ? 'Aralashtirish' : 'Shuffle'}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span>
            {uz ? 'O‘zlashtirildi' : 'Mastered'}:{' '}
            <strong className="font-mono-num text-emerald-700">
              {masteredCount} / {deck.length}
            </strong>
          </span>
          <span className="font-mono-num font-semibold text-slate-800">
            {index + 1} / {deck.length}
          </span>
        </div>
      </div>

      {/* Progress Hairline */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-teal-600 transition-all duration-200"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Flip Card Area */}
      <div className="perspective-1000">
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setFlipped((f) => !f);
            playSound('click');
          }}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setFlipped((f) => !f);
              playSound('click');
            } else if (e.key === 'ArrowRight') {
              setFlipped(false);
              setIndex((i) => Math.min(deck.length - 1, i + 1));
            } else if (e.key === 'ArrowLeft') {
              setFlipped(false);
              setIndex((i) => Math.max(0, i - 1));
            }
          }}
          className={`preserve-3d relative min-h-[320px] w-full cursor-pointer transition-transform duration-500 focus-visible:outline-none ${
            flipped ? 'rotate-y-180' : ''
          }`}
          aria-label={uz ? 'Kartochkani aylantirish' : 'Flip flashcard'}
        >
          {/* Front Side (Question) */}
          <div className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-semibold text-teal-700">
                {currentCard.topic} · {getDifficultyLabel(currentCard.difficulty, lang)}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-400">
                <FlipHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{uz ? 'Javobni ko‘rish uchun bosing' : 'Click to flip'}</span>
              </span>
            </div>

            <div className="my-auto py-4">
              {currentCard.context && (
                <p className="mb-3 max-h-24 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs leading-relaxed text-slate-600">
                  {getLocalizedField(currentCard.context, lang)}
                </p>
              )}
              <h3 className="whitespace-pre-line font-display text-lg font-bold leading-snug text-slate-900 sm:text-2xl">
                {getLocalizedField(currentCard.q, lang)}
              </h3>
              {subject.id === 'math' && currentCard.diagram && (
                <div className="mt-3">
                  <MathShapeDiagram
                    questionId={currentCard.id}
                    diagram={currentCard.diagram}
                    lang={lang}
                    compact
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>
                {isMastered ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {uz ? 'O‘zlashtirilgan' : 'Mastered'}
                  </span>
                ) : (
                  <span>{uz ? 'O‘zingizni tekshirib ko‘ring' : 'Test your recall'}</span>
                )}
              </span>
              <span className="font-mono-num text-slate-400">#{currentCard.id}</span>
            </div>
          </div>

          {/* Back Side (Answer + Explanation) */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between rounded-xl border border-teal-300 bg-slate-50 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-teal-700">
                {uz ? 'To‘g‘ri javob va izoh' : 'Answer & Explanation'}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                <FlipHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{uz ? 'Savolga qaytish' : 'Flip back'}</span>
              </span>
            </div>

            <div className="my-auto space-y-4 py-4">
              <div className="rounded-lg border border-emerald-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                  {uz ? 'Javob' : 'Correct Answer'}
                </p>
                <p className="mt-1 font-display text-lg font-bold text-slate-900 sm:text-xl">
                  {correctAnswerText}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700">
                <p className="mb-1 text-xs font-semibold text-slate-500">
                  {uz ? 'Qisqa tushuntirish' : 'Explanation'}
                </p>
                <FormattedMathText text={getLocalizedField(currentCard.explain, lang)} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200/80 pt-3">
              <span className="text-xs text-slate-500">
                {uz ? 'Pastdagi tugmalar bilan belgilang' : 'Rate your recall below'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => {
              setFlipped(false);
              setIndex((i) => Math.max(0, i - 1));
            }}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>{uz ? 'Oldingi' : 'Prev'}</span>
          </button>
          <button
            type="button"
            disabled={index >= deck.length - 1}
            onClick={() => {
              setFlipped(false);
              setIndex((i) => Math.min(deck.length - 1, i + 1));
            }}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>{uz ? 'Keyingi' : 'Next'}</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleToggleMastered(false)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{uz ? 'Qayta ko‘rish' : 'Review Again'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleMastered(true)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{uz ? 'Bilaman' : 'Got It'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface SubjectInteractiveLabProps {
  subjectId: 'math' | 'science' | 'computing';
  lang: UILanguage;
}

export function SubjectInteractiveLab({ subjectId, lang }: SubjectInteractiveLabProps) {
  if (subjectId === 'math') return <MathGeometryLab lang={lang} />;
  if (subjectId === 'science') return <SciencePhysicsLab lang={lang} />;
  return <ComputingBinaryLogicLab lang={lang} />;
}

function MathGeometryLab({ lang }: { lang: UILanguage }) {
  const uz = lang === 'uz';
  const [tool, setTool] = useState<'pythagoras' | 'sector' | 'cylinder'>('pythagoras');

  // Pythagoras state
  const [sideA, setSideA] = useState(6);
  const [sideB, setSideB] = useState(8);
  const hyp = Math.sqrt(sideA * sideA + sideB * sideB);
  const isTriple = Number.isInteger(Number(hyp.toFixed(6)));

  // Circle & Sector state
  const [radius, setRadius] = useState(7);
  const [angle, setAngle] = useState(90);
  const pi = 3.14;
  const fullArea = pi * radius * radius;
  const sectorArea = (angle / 360) * fullArea;
  const arcLength = (angle / 360) * (2 * pi * radius);

  // Cylinder state
  const [cylR, setCylR] = useState(4);
  const [cylH, setCylH] = useState(8);
  const cylVol = pi * cylR * cylR * cylH;
  const cylSurface = 2 * pi * cylR * (cylR + cylH);

  // SVG coordinate math for Pythagoras
  const maxTriDim = Math.max(sideA, sideB, 1);
  const triScale = 160 / maxTriDim;
  const svgW = sideB * triScale;
  const svgH = sideA * triScale;
  const startX = 45;
  const baseY = 205;

  // SVG coordinate math for Sector
  const cx = 140;
  const cy = 125;
  const rPx = 45 + radius * 4.5;
  const rad = ((angle - 90) * Math.PI) / 180;
  const endX = cx + rPx * Math.cos(rad);
  const endY = cy + rPx * Math.sin(rad);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Triangle className="h-4 w-4 text-teal-700" aria-hidden="true" />
          <h2 className="font-display text-base font-bold text-slate-900">
            {uz ? 'Geometriya va Formula Laboratoriyasi' : 'Interactive Geometry & Formula Lab'}
          </h2>
        </div>

        <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setTool('pythagoras')}
            className={`min-h-[34px] rounded-md px-3 text-xs font-semibold transition-colors ${
              tool === 'pythagoras' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {uz ? 'Pifagor teoremasi' : 'Pythagoras'}
          </button>
          <button
            type="button"
            onClick={() => setTool('sector')}
            className={`min-h-[34px] rounded-md px-3 text-xs font-semibold transition-colors ${
              tool === 'sector' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {uz ? 'Aylana va Sektor' : 'Circle Sector'}
          </button>
          <button
            type="button"
            onClick={() => setTool('cylinder')}
            className={`min-h-[34px] rounded-md px-3 text-xs font-semibold transition-colors ${
              tool === 'cylinder' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {uz ? 'Silindr hajmi' : 'Cylinder Volume'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Interactive Canvas */}
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          {tool === 'pythagoras' && (
            <svg viewBox="0 0 280 240" className="h-64 w-full max-w-[320px]">
              <polygon
                points={`${startX},${baseY} ${startX + svgW},${baseY} ${startX},${baseY - svgH}`}
                fill="#f0fdfa"
                stroke="#0f766e"
                strokeWidth="2.5"
              />
              <polyline
                points={`${startX},${baseY - 14} ${startX + 14},${baseY - 14} ${startX + 14},${baseY}`}
                fill="none"
                stroke="#0f766e"
                strokeWidth="1.5"
              />
              <text
                x={startX - 18}
                y={baseY - svgH / 2}
                className="fill-slate-800 text-xs font-bold"
                textAnchor="middle"
              >
                a={sideA}
              </text>
              <text
                x={startX + svgW / 2}
                y={baseY + 20}
                className="fill-slate-800 text-xs font-bold"
                textAnchor="middle"
              >
                b={sideB}
              </text>
              <text
                x={startX + svgW / 2 + 14}
                y={baseY - svgH / 2 - 8}
                className="fill-teal-700 text-xs font-extrabold"
                textAnchor="middle"
              >
                c={isTriple ? hyp : hyp.toFixed(2)}
              </text>
            </svg>
          )}

          {tool === 'sector' && (
            <svg viewBox="0 0 280 250" className="h-64 w-full max-w-[320px]">
              <circle
                cx={cx}
                cy={cy}
                r={rPx}
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              {angle === 360 ? (
                <circle cx={cx} cy={cy} r={rPx} fill="#ccfbf1" stroke="#0f766e" strokeWidth="2.5" />
              ) : (
                <path
                  d={`M ${cx} ${cy} L ${cx} ${cy - rPx} A ${rPx} ${rPx} 0 ${largeArc} 1 ${endX} ${endY} Z`}
                  fill="#ccfbf1"
                  stroke="#0f766e"
                  strokeWidth="2.5"
                />
              )}
              <circle cx={cx} cy={cy} r="3.5" fill="#0f766e" />
              <text x={cx + 12} y={cy - rPx / 2} className="fill-slate-800 text-xs font-bold">
                r = {radius}
              </text>
              <text
                x={cx}
                y={236}
                className="fill-teal-800 text-xs font-bold"
                textAnchor="middle"
              >
                θ = {angle}°
              </text>
            </svg>
          )}

          {tool === 'cylinder' && (
            <svg viewBox="0 0 280 250" className="h-64 w-full max-w-[320px]">
              {(() => {
                const rx = 28 + cylR * 5;
                const hPx = 40 + cylH * 9;
                const topY = 125 - hPx / 2;
                const botY = 125 + hPx / 2;
                return (
                  <g>
                    <path
                      d={`M ${140 - rx} ${topY} L ${140 - rx} ${botY} A ${rx} 14 0 0 0 ${140 + rx} ${botY} L ${140 + rx} ${topY} Z`}
                      fill="#f0fdfa"
                      stroke="#0f766e"
                      strokeWidth="2.2"
                    />
                    <ellipse
                      cx={140}
                      cy={topY}
                      rx={rx}
                      ry={14}
                      fill="#ccfbf1"
                      stroke="#0f766e"
                      strokeWidth="2.2"
                    />
                    <line
                      x1={140}
                      y1={topY}
                      x2={140 + rx}
                      y2={topY}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                    <text x={140 + rx / 2} y={topY - 6} className="fill-slate-900 text-[11px] font-bold" textAnchor="middle">
                      r={cylR}
                    </text>
                    <text x={140 + rx + 14} y={128} className="fill-teal-800 text-xs font-bold">
                      h={cylH}
                    </text>
                  </g>
                );
              })()}
            </svg>
          )}
        </div>

        {/* Sliders & Live Readouts */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          {tool === 'pythagoras' && (
            <>
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>{uz ? 'Katet a' : 'Leg a'}</span>
                    <span className="font-mono-num text-teal-700">{sideA} cm</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={16}
                    value={sideA}
                    onChange={(e) => setSideA(Number(e.target.value))}
                    className="mt-1.5 w-full accent-teal-700"
                  />
                </label>

                <label className="block text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>{uz ? 'Katet b' : 'Leg b'}</span>
                    <span className="font-mono-num text-teal-700">{sideB} cm</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={16}
                    value={sideB}
                    onChange={(e) => setSideB(Number(e.target.value))}
                    className="mt-1.5 w-full accent-teal-700"
                  />
                </label>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                <p className="font-mono-num rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  c² = {sideA}² + {sideB}² = {sideA * sideA} + {sideB * sideB} ={' '}
                  <strong>{sideA * sideA + sideB * sideB}</strong>
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{uz ? 'Gipotenuza (c):' : 'Hypotenuse (c):'}</span>
                  <span className="font-mono-num text-lg font-extrabold text-teal-700">
                    {isTriple ? hyp : hyp.toFixed(2)} cm
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{uz ? 'Yuzi (S = ½·a·b):' : 'Area (A = ½·a·b):'}</span>
                  <span className="font-mono-num font-bold text-slate-900">
                    {((sideA * sideB) / 2).toFixed(1)} cm²
                  </span>
                </div>
                {isTriple && (
                  <p className="text-xs font-bold text-emerald-700">
                    ✓ {uz ? `Pifagor uchligi (${sideA}, ${sideB}, ${hyp})!` : `Exact Pythagorean triple (${sideA}, ${sideB}, ${hyp})!`}
                  </p>
                )}
              </div>
            </>
          )}

          {tool === 'sector' && (
            <>
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>{uz ? 'Radius (r)' : 'Radius (r)'}</span>
                    <span className="font-mono-num text-teal-700">{radius} cm</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={14}
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="mt-1.5 w-full accent-teal-700"
                  />
                </label>

                <label className="block text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>{uz ? 'Markaziy burchak (θ)' : 'Central Angle (θ)'}</span>
                    <span className="font-mono-num text-teal-700">{angle}°</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={360}
                    step={15}
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="mt-1.5 w-full accent-teal-700"
                  />
                </label>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                <p className="font-mono-num rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  S = ({angle}°/360°) × 3.14 × {radius}²
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{uz ? 'Sektor yuzi:' : 'Sector Area:'}</span>
                  <span className="font-mono-num text-lg font-extrabold text-teal-700">
                    {sectorArea.toFixed(2)} cm²
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{uz ? 'Yoy uzunligi (L):' : 'Arc Length (L):'}</span>
                  <span className="font-mono-num font-bold text-slate-900">
                    {arcLength.toFixed(2)} cm
                  </span>
                </div>
              </div>
            </>
          )}

          {tool === 'cylinder' && (
            <>
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>{uz ? 'Radius (r)' : 'Radius (r)'}</span>
                    <span className="font-mono-num text-teal-700">{cylR} cm</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={cylR}
                    onChange={(e) => setCylR(Number(e.target.value))}
                    className="mt-1.5 w-full accent-teal-700"
                  />
                </label>

                <label className="block text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>{uz ? 'Balandlik (h)' : 'Height (h)'}</span>
                    <span className="font-mono-num text-teal-700">{cylH} cm</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={14}
                    value={cylH}
                    onChange={(e) => setCylH(Number(e.target.value))}
                    className="mt-1.5 w-full accent-teal-700"
                  />
                </label>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                <p className="font-mono-num rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  V = 3.14 × {cylR}² × {cylH}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{uz ? 'Hajm (V):' : 'Volume (V):'}</span>
                  <span className="font-mono-num text-lg font-extrabold text-teal-700">
                    {cylVol.toFixed(1)} cm³
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{uz ? 'To‘la sirt (TSA):' : 'Total Surface Area:'}</span>
                  <span className="font-mono-num font-bold text-slate-900">
                    {cylSurface.toFixed(1)} cm²
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SciencePhysicsLab({ lang }: { lang: UILanguage }) {
  const uz = lang === 'uz';
  const [mass, setMass] = useState(120); // g
  const [volume, setVolume] = useState(150); // cm3
  const density = mass / volume;
  const floats = density <= 1.0;

  const PRESETS = [
    { name: uz ? 'Yog‘och' : 'Wood', m: 65, v: 100 },
    { name: uz ? 'Muz' : 'Ice', m: 92, v: 100 },
    { name: uz ? 'Alyuminiy' : 'Aluminum', m: 270, v: 100 },
    { name: uz ? 'Temir' : 'Iron', m: 390, v: 50 },
  ];

  // Calculate visual submerge depth inside water beaker
  const waterTopY = 85;
  const beakerBottomY = 205;
  const blockTopY = floats
    ? waterTopY - 22 + Math.min(density, 1) * 32
    : beakerBottomY - 46;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          <h2 className="font-display text-base font-bold text-slate-900">
            {uz ? 'Zichlik va Suzish Laboratoriyasi (ρ = m / V)' : 'Density & Buoyancy Lab (ρ = m / V)'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setMass(p.m);
                setVolume(p.v);
              }}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <svg viewBox="0 0 260 240" className="h-64 w-full max-w-[300px]">
            {/* Water inside Beaker */}
            <rect x="65" y={waterTopY} width="130" height={beakerBottomY - waterTopY} fill="#e0f2fe" />
            {/* Block */}
            <rect
              x="106"
              y={blockTopY}
              width="48"
              height="44"
              rx="6"
              fill={floats ? '#10b981' : '#475569'}
              stroke="#0f172a"
              strokeWidth="2"
              className="transition-all duration-300"
            />
            <text
              x="130"
              y={blockTopY + 26}
              textAnchor="middle"
              className="fill-white text-[11px] font-bold"
            >
              {density.toFixed(2)}
            </text>
            {/* Beaker Outline */}
            <polyline
              points={`65,45 65,${beakerBottomY} 195,${beakerBottomY} 195,45`}
              fill="none"
              stroke="#334155"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text x="130" y="226" textAnchor="middle" className="fill-slate-600 text-xs font-semibold">
              {uz ? 'Suv zichligi: 1.00 g/cm³' : 'Water Density: 1.00 g/cm³'}
            </text>
          </svg>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <label className="block text-xs font-semibold text-slate-700">
            <div className="flex justify-between">
              <span>{uz ? 'Massa (m)' : 'Mass (m)'}</span>
              <span className="font-mono-num text-emerald-700">{mass} g</span>
            </div>
            <input
              type="range"
              min={20}
              max={450}
              step={5}
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              className="mt-1.5 w-full accent-emerald-700"
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            <div className="flex justify-between">
              <span>{uz ? 'Hajm (V)' : 'Volume (V)'}</span>
              <span className="font-mono-num text-emerald-700">{volume} cm³</span>
            </div>
            <input
              type="range"
              min={40}
              max={250}
              step={5}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="mt-1.5 w-full accent-emerald-700"
            />
          </label>

          <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
            <p className="font-mono-num rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
              ρ = m / V = {mass} / {volume}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">{uz ? 'Zichlik (ρ):' : 'Density (ρ):'}</span>
              <span className="font-mono-num text-lg font-extrabold text-emerald-700">
                {density.toFixed(2)} g/cm³
              </span>
            </div>
            <p className={`text-xs font-bold ${floats ? 'text-emerald-700' : 'text-slate-700'}`}>
              {floats
                ? uz
                  ? '✓ Suvda suzadi (ρ ≤ 1.00 g/cm³)'
                  : '✓ Floats in water (ρ ≤ 1.00 g/cm³)'
                : uz
                  ? '↓ Suvga cho‘kadi (ρ > 1.00 g/cm³)'
                  : '↓ Sinks in water (ρ > 1.00 g/cm³)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComputingBinaryLogicLab({ lang }: { lang: UILanguage }) {
  const uz = lang === 'uz';
  const [bits, setBits] = useState<number[]>([0, 1, 0, 0, 0, 0, 0, 1]); // 65 = 'A'
  const [gate, setGate] = useState<'AND' | 'OR' | 'XOR' | 'NAND'>('AND');
  const [inA, setInA] = useState<0 | 1>(1);
  const [inB, setInB] = useState<0 | 1>(0);

  const weights = [128, 64, 32, 16, 8, 4, 2, 1];
  const decimal = bits.reduce((acc, bit, idx) => acc + bit * weights[idx], 0);
  const hex = decimal.toString(16).toUpperCase().padStart(2, '0');
  const ascii = decimal >= 32 && decimal <= 126 ? String.fromCharCode(decimal) : '—';

  const gateOutput: 0 | 1 =
    gate === 'AND'
      ? inA && inB
        ? 1
        : 0
      : gate === 'OR'
        ? inA || inB
          ? 1
          : 0
        : gate === 'XOR'
          ? inA !== inB
            ? 1
            : 0
          : !(inA && inB)
            ? 1
            : 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* 8-Bit Binary Converter */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-700" aria-hidden="true" />
            <h2 className="font-display text-base font-bold text-slate-900">
              {uz ? '8-Bit Ikkilik Sanoq (Binary ↔ Decimal)' : '8-Bit Binary Converter'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setBits([0, 0, 0, 0, 0, 0, 0, 0])}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            {uz ? 'Nolga tushirish' : 'Reset'}
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-600">
          {uz
            ? 'Bitlarni 0 yoki 1 ga o‘zgartirish uchun ustiga bosing:'
            : 'Click any bit below to toggle between 0 and 1:'}
        </p>

        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {bits.map((b, idx) => (
            <button
              key={weights[idx]}
              type="button"
              onClick={() => {
                setBits((prev) => prev.map((v, i) => (i === idx ? (v === 1 ? 0 : 1) : v)));
                playSound('click');
              }}
              className={`flex flex-col items-center rounded-lg border py-2.5 transition-colors ${
                b === 1
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono-num text-[10px] font-semibold text-slate-400">
                {weights[idx]}
              </span>
              <span className="font-mono-num mt-1 text-xl font-extrabold">{b}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500">Decimal (10)</p>
            <p className="font-mono-num mt-0.5 text-xl font-extrabold text-indigo-700">{decimal}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500">Hex (16)</p>
            <p className="font-mono-num mt-0.5 text-xl font-extrabold text-slate-900">0x{hex}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500">ASCII</p>
            <p className="font-mono-num mt-0.5 text-xl font-extrabold text-slate-900">{ascii}</p>
          </div>
        </div>
      </div>

      {/* Logic Gates Explorer */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-display text-base font-bold text-slate-900">
            {uz ? 'Mantiqiy Elementlar' : 'Logic Gates'}
          </h2>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
            {(['AND', 'OR', 'XOR', 'NAND'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGate(g)}
                className={`rounded-md px-2 py-1 text-[11px] font-bold transition-colors ${
                  gate === g ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setInA((v) => (v === 1 ? 0 : 1));
                playSound('click');
              }}
              className={`flex w-20 items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold ${
                inA === 1
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <span>A</span>
              <span className="font-mono-num text-sm">{inA}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInB((v) => (v === 1 ? 0 : 1));
                playSound('click');
              }}
              className={`flex w-20 items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold ${
                inB === 1
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <span>B</span>
              <span className="font-mono-num text-sm">{inB}</span>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="rounded-xl border-2 border-indigo-600 bg-indigo-50 px-5 py-4 text-center font-display text-sm font-extrabold text-indigo-900">
              {gate}
            </div>
          </div>

          <div
            className={`flex h-16 w-20 flex-col items-center justify-center rounded-xl border-2 font-mono-num ${
              gateOutput === 1
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase">OUT</span>
            <span className="text-xl font-extrabold">{gateOutput}</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {gate === 'AND' &&
            (uz
              ? 'AND: faqat A=1 va B=1 bo‘lganda natija 1 chiqadi.'
              : 'AND: outputs 1 only when both A and B are 1.')}
          {gate === 'OR' &&
            (uz
              ? 'OR: kamida bitta kirish 1 bo‘lsa natija 1 chiqadi.'
              : 'OR: outputs 1 when at least one input is 1.')}
          {gate === 'XOR' &&
            (uz
              ? 'XOR: A va B turlicha bo‘lganda natija 1 chiqadi.'
              : 'XOR: outputs 1 when A and B are different.')}
          {gate === 'NAND' &&
            (uz
              ? 'NAND: AND ning teskarisi (ikkalasi 1 bo‘lsa 0).'
              : 'NAND: inverse of AND (outputs 0 only when both are 1).')}
        </p>
      </div>
    </div>
  );
}
