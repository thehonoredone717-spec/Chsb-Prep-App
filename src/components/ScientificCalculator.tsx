import {
  Calculator,
  Copy,
  Delete,
  GripHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { UILanguage } from '../types/quiz';

interface ScientificCalculatorProps {
  lang: UILanguage;
  open: boolean;
  onClose: () => void;
  secretMathActive?: boolean;
  secretMathAnswer?: string | null;
  secretRemaining?: number;
  secretMaxUses?: number;
  questionKey?: string | null;
  onSecretCodeUsed?: () => void;
}

export function ScientificCalculator({
  lang,
  open,
  onClose,
  secretMathActive = false,
  secretMathAnswer = null,
  secretRemaining = 5,
  secretMaxUses = 5,
  questionKey = null,
  onSecretCodeUsed,
}: ScientificCalculatorProps) {
  const [expression, setExpression] = useState<string>('0');
  const [result, setResult] = useState<string>('');
  const [isRad, setIsRad] = useState<boolean>(false);
  const [revealedHint, setRevealedHint] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Clear revealed hint when question changes
  useEffect(() => {
    setRevealedHint(null);
  }, [questionKey]);

  // Reset position when reopened
  useEffect(() => {
    if (open) {
      setOffset({ x: 0, y: 0 });
    }
  }, [open]);

  // Handle escape to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleDragStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: offset.x,
      origY: offset.y,
    };

    const handleMove = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      const rect = panelRef.current?.getBoundingClientRect();
      const maxLeftShift = -(window.innerWidth - (rect?.width ?? 310) - 24);
      const maxTopShift = -(window.innerHeight - (rect?.height ?? 420) - 24);
      const nextX = Math.max(maxLeftShift, Math.min(8, dragRef.current.origX + dx));
      const nextY = Math.max(maxTopShift, Math.min(8, dragRef.current.origY + dy));
      setOffset({ x: nextX, y: nextY });
    };

    const handleUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  };

  if (!open) return null;

  const appendSymbol = (sym: string) => {
    setExpression((prev) => {
      if (prev === '0' || prev === 'Error') {
        return sym;
      }
      return prev + sym;
    });
  };

  const handleClear = () => {
    setExpression('0');
    setResult('');
  };

  const handleDelete = () => {
    setExpression((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const evaluateExpression = () => {
    // Secret code check
    const cleanExpr = expression.trim();
    if (
      (cleanExpr === '777' || cleanExpr === '007' || cleanExpr === '999') &&
      secretMathActive &&
      secretMathAnswer
    ) {
      if (secretRemaining > 0) {
        setRevealedHint(secretMathAnswer);
        onSecretCodeUsed?.();
        setResult('HINT REVEALED');
        return;
      }
    }

    try {
      // Safe mathematical parser
      let sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/\^/g, '**');

      // Replace functions: sin, cos, tan, log, ln, sqrt
      if (isRad) {
        sanitized = sanitized.replace(/sin\(([^)]+)\)/g, 'Math.sin($1)');
        sanitized = sanitized.replace(/cos\(([^)]+)\)/g, 'Math.cos($1)');
        sanitized = sanitized.replace(/tan\(([^)]+)\)/g, 'Math.tan($1)');
      } else {
        // Convert deg to rad for trig
        sanitized = sanitized.replace(/sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)');
        sanitized = sanitized.replace(/cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)');
        sanitized = sanitized.replace(/tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');
      }

      sanitized = sanitized.replace(/log\(([^)]+)\)/g, 'Math.log10($1)');
      sanitized = sanitized.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');
      sanitized = sanitized.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
      sanitized = sanitized.replace(/√([0-9.]+)/g, 'Math.sqrt($1)');

      // Disallow any malicious tokens
      if (/[a-zA-Z_$]/.test(sanitized.replace(/Math\.(PI|E|sin|cos|tan|log10|log|sqrt)/g, ''))) {
        throw new Error('Invalid syntax');
      }

      // eslint-disable-next-line no-new-func
      const calcResult = Function(`"use strict"; return (${sanitized});`)();
      if (typeof calcResult === 'number' && !Number.isNaN(calcResult)) {
        // Round cleanly to avoid 0.0000000000000002 errors
        const formatted =
          Math.abs(calcResult) < 1e-6 && calcResult !== 0
            ? calcResult.toExponential(4)
            : Number(calcResult.toFixed(8)).toString();
        setResult(formatted);
      } else {
        setResult('Error');
      }
    } catch {
      setResult('Error');
    }
  };

  const copyResult = () => {
    if (result && result !== 'Error') {
      void navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const uz = lang === 'uz';

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label={uz ? 'Ilmiy Kalkulyator' : 'Scientific Calculator'}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-[310px] flex-col rounded-2xl border border-slate-700 bg-slate-900/95 p-3.5 text-white shadow-2xl backdrop-blur-sm sm:max-w-[320px] sm:p-4"
    >
      {/* Draggable Header */}
      <div
        onPointerDown={handleDragStart}
        className="flex cursor-grab items-center justify-between border-b border-slate-800 pb-2.5 active:cursor-grabbing select-none touch-none"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
            <Calculator className="h-3.5 w-3.5" />
          </div>
          <h2 className="font-display text-xs font-bold tracking-tight text-white sm:text-sm">
            {uz ? 'Kalkulyator' : 'Calculator'}
          </h2>
          <GripHorizontal className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsRad((prev) => !prev)}
            className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-300 hover:text-white"
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={uz ? 'Yopish' : 'Close'}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="mt-2.5 flex flex-col justify-end rounded-xl border border-slate-800 bg-slate-950 p-2.5 shadow-inner">
        <div className="font-mono text-right text-[11px] text-slate-400 break-all select-all">
          {expression}
        </div>
        <div className="mt-0.5 flex items-center justify-between">
          <button
            type="button"
            onClick={copyResult}
            disabled={!result || result === 'Error'}
            className="rounded p-1 text-slate-500 hover:text-teal-400 disabled:opacity-20"
            title={uz ? 'Nusxalash' : 'Copy result'}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <div className="font-mono text-right text-xl font-bold tracking-tight text-teal-400">
            {copied ? (
              <span className="text-xs text-emerald-400">{uz ? 'Nusxalandi!' : 'Copied!'}</span>
            ) : (
              result || '0'
            )}
          </div>
        </div>
      </div>

      {/* Secret math hint banner if revealed */}
      {revealedHint && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-950/60 p-2 text-xs font-semibold text-amber-300 animate-pulse">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <p className="text-[11px] text-amber-200">
              {uz ? 'Sirli yordamchi:' : 'Secret helper:'}
            </p>
            <p className="text-sm font-bold text-white">{revealedHint}</p>
          </div>
        </div>
      )}

      {/* Keypad */}
      <div className="mt-2.5 grid grid-cols-4 gap-1.5">
          {/* Scientific row 1 */}
          <button
            type="button"
            onClick={() => appendSymbol('sin(')}
            className="rounded-lg bg-slate-800 p-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            sin
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('cos(')}
            className="rounded-lg bg-slate-800 p-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            cos
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('tan(')}
            className="rounded-lg bg-slate-800 p-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            tan
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('^')}
            className="rounded-lg bg-slate-800 p-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            xʸ
          </button>

          {/* Scientific row 2 */}
          <button
            type="button"
            onClick={() => appendSymbol('√(')}
            className="rounded-lg bg-slate-800 p-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            √
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('log(')}
            className="rounded-lg bg-slate-800 p-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            log
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('(')}
            className="rounded-lg bg-slate-800 p-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            (
          </button>
          <button
            type="button"
            onClick={() => appendSymbol(')')}
            className="rounded-lg bg-slate-800 p-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            )
          </button>

          {/* Standard row 1 */}
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg bg-rose-900/60 p-2.5 text-xs font-extrabold text-rose-300 hover:bg-rose-800"
          >
            AC
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center rounded-lg bg-slate-800 p-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            <Delete className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('%')}
            className="rounded-lg bg-slate-800 p-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            %
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('÷')}
            className="rounded-lg bg-teal-800/80 p-2.5 text-base font-extrabold text-teal-200 hover:bg-teal-700"
          >
            ÷
          </button>

          {/* Standard row 2: 7, 8, 9, * */}
          <button
            type="button"
            onClick={() => appendSymbol('7')}
            className="rounded-lg bg-slate-800/90 p-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('8')}
            className="rounded-lg bg-slate-800/90 p-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('9')}
            className="rounded-lg bg-slate-800/90 p-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('×')}
            className="rounded-lg bg-teal-800/80 p-2.5 text-base font-extrabold text-teal-200 hover:bg-teal-700"
          >
            ×
          </button>

          {/* Standard row 3: 4, 5, 6, - */}
          <button
            type="button"
            onClick={() => appendSymbol('4')}
            className="rounded-lg bg-slate-800/90 p-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('5')}
            className="rounded-lg bg-slate-800/90 p-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('6')}
            className="rounded-lg bg-slate-800/90 p-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('-')}
            className="rounded-lg bg-teal-800/80 p-2.5 text-base font-extrabold text-teal-200 hover:bg-teal-700"
          >
            −
          </button>

          {/* Standard row 4: 1, 2, 3, + */}
          <button
            type="button"
            onClick={() => appendSymbol('1')}
            className="rounded-lg bg-slate-800/90 p-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('2')}
            className="rounded-lg bg-slate-800/90 p-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('3')}
            className="rounded-lg bg-slate-800/90 p-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('+')}
            className="rounded-lg bg-teal-800/80 p-2.5 text-base font-extrabold text-teal-200 hover:bg-teal-700"
          >
            +
          </button>

          {/* Standard row 5: 0, ., π, = */}
          <button
            type="button"
            onClick={() => appendSymbol('0')}
            className="rounded-lg bg-slate-800/90 p-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('.')}
            className="rounded-lg bg-slate-800/90 p-2.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            .
          </button>
          <button
            type="button"
            onClick={() => appendSymbol('π')}
            className="rounded-lg bg-slate-800 p-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            π
          </button>
          <button
            type="button"
            onClick={evaluateExpression}
            className="rounded-lg bg-teal-600 p-2.5 text-base font-extrabold text-white shadow-md hover:bg-teal-500"
          >
            =
          </button>
        </div>
    </div>
  );
}
