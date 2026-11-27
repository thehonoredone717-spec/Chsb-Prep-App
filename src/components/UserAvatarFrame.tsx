import { Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { UILanguage } from '../types/quiz';
import { STORE_FRAME_MAP, STORE_TITLE_MAP } from '../utils/xpAndStore';

interface UserAvatarFrameProps {
  name: string;
  isTeacher?: boolean;
  frameId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<
  NonNullable<UserAvatarFrameProps['size']>,
  { outer: string; padding: string; text: string; icon: string; crown: string }
> = {
  xs: {
    outer: 'h-7 w-7',
    padding: 'p-[2px]',
    text: 'text-[10px]',
    icon: 'h-3.5 w-3.5',
    crown: '-top-2 h-3 w-3',
  },
  sm: {
    outer: 'h-9 w-9',
    padding: 'p-[2.5px]',
    text: 'text-xs',
    icon: 'h-4 w-4',
    crown: '-top-2.5 h-3.5 w-3.5',
  },
  md: {
    outer: 'h-11 w-11',
    padding: 'p-[3px]',
    text: 'text-sm',
    icon: 'h-5 w-5',
    crown: '-top-2.5 h-4 w-4',
  },
  lg: {
    outer: 'h-14 w-14',
    padding: 'p-[3.5px]',
    text: 'text-lg',
    icon: 'h-6 w-6',
    crown: '-top-3 h-4.5 w-4.5',
  },
  xl: {
    outer: 'h-20 w-20',
    padding: 'p-[4px]',
    text: 'text-2xl',
    icon: 'h-8 w-8',
    crown: '-top-3.5 h-5.5 w-5.5',
  },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function UserAvatarFrame({
  name,
  isTeacher = false,
  frameId,
  size = 'sm',
  className = '',
}: UserAvatarFrameProps) {
  const frame = frameId ? STORE_FRAME_MAP[frameId] : undefined;
  const dims = SIZE_CLASSES[size];
  const initials = getInitials(name);

  if (!frame) {
    return (
      <div
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-display font-bold text-slate-700 ${dims.outer} ${dims.text} ${className}`}
      >
        {isTeacher ? (
          <ShieldCheck className={`${dims.icon} text-teal-700`} aria-hidden="true" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center ${dims.outer} ${className}`}>
      {frame.hasCrown && (
        <Crown
          className={`pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 fill-amber-400 text-amber-500 drop-shadow-xs ${dims.crown}`}
          aria-hidden="true"
        />
      )}

      <div
        className={`relative flex h-full w-full items-center justify-center rounded-full ${dims.padding} ${frame.outerGlowClass}`}
      >
        {/* Ring layer (rotates smoothly for animated epic/legendary/mythic frames) */}
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-full ${frame.ringClass} ${
            frame.isAnimated ? 'store-frame-spin' : ''
          }`}
        />

        {/* Inner avatar disc */}
        <span
          className={`relative z-10 flex h-full w-full items-center justify-center rounded-full font-display font-extrabold tracking-tight ${frame.innerBgClass} ${dims.text}`}
        >
          {isTeacher ? (
            <ShieldCheck className={dims.icon} aria-hidden="true" />
          ) : (
            <span>{initials}</span>
          )}
        </span>
      </div>
    </div>
  );
}

interface UserTitleLabelProps {
  titleId?: string;
  lang: UILanguage;
  className?: string;
}

export function UserTitleLabel({ titleId, lang, className = '' }: UserTitleLabelProps) {
  const item = titleId ? STORE_TITLE_MAP[titleId] : undefined;
  if (!item) return null;

  const label = lang === 'uz' ? item.label.uz : item.label.en;
  const showSparkle = item.tier === 'legendary' || item.tier === 'mythic';

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap text-xs tracking-tight ${item.textClass} ${className}`}
    >
      {showSparkle && (
        <Sparkles className="h-3 w-3 shrink-0 text-amber-500" aria-hidden="true" />
      )}
      <span>{label}</span>
    </span>
  );
}
