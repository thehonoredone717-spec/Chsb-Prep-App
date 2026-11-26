import {
  AlertTriangle,
  Award,
  Bell,
  BookCheck,
  CheckCheck,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { UILanguage } from '../types/quiz';

export interface AppNotification {
  id: string;
  kind: 'assignment' | 'prohibition' | 'warning' | 'result' | 'retake';
  title: string;
  description: string;
  timestampMs: number;
  timeLabel?: string;
  onClick?: () => void;
}

interface NotificationBellProps {
  lang: UILanguage;
  notifications: AppNotification[];
  readIds: Set<string>;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

function formatRelativeTime(timestampMs: number, lang: UILanguage): string {
  if (!timestampMs) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
  if (diffSec < 60) return lang === 'uz' ? 'Hozirgina' : 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return lang === 'uz' ? `${diffMin} daq oldin` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return lang === 'uz' ? `${diffHr} soat oldin` : `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return lang === 'uz' ? `${diffDay} kun oldin` : `${diffDay}d ago`;
  return new Date(timestampMs).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function NotificationBell({
  lang,
  notifications,
  readIds,
  onMarkRead,
  onMarkAllRead,
}: NotificationBellProps) {
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.reduce(
    (count, item) => (readIds.has(item.id) ? count : count + 1),
    0
  );

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const uz = lang === 'uz';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={uz ? 'Bildirishnomalar' : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={uz ? 'Bildirishnomalar' : 'Notifications'}
        className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
          open
            ? 'border-teal-700 bg-teal-50 text-teal-800'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} ${uz ? 'o‘qilmagan' : 'unread'}`}
            className="font-mono-num absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white shadow-xs ring-2 ring-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={uz ? 'Bildirishnomalar ro‘yxati' : 'Notifications panel'}
          className="fixed left-4 right-4 top-[72px] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-teal-700" aria-hidden="true" />
              <h2 className="font-display text-sm font-extrabold text-slate-900">
                {uz ? 'Bildirishnomalar' : 'Notifications'}
              </h2>
              {unreadCount > 0 && (
                <span className="font-mono-num rounded-md bg-rose-100 px-1.5 py-0.5 text-[11px] font-bold text-rose-700">
                  {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{uz ? 'Hammasini o‘qish' : 'Mark all read'}</span>
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  {uz ? 'Hozircha bildirishnomalar yo‘q' : 'No notifications yet'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {uz
                    ? 'Yangi variant biriktirilganda yoki fan holati o‘zgarganda shu yerda ko‘rinadi.'
                    : 'New variant assignments and subject alerts will appear here.'}
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !readIds.has(item.id);
                const timeStr = item.timeLabel || formatRelativeTime(item.timestampMs, lang);

                const iconConfig =
                  item.kind === 'assignment'
                    ? {
                        Icon: BookCheck,
                        bg: 'bg-teal-50 text-teal-700',
                      }
                    : item.kind === 'retake'
                      ? {
                          Icon: KeyRound,
                          bg: 'bg-indigo-50 text-indigo-700',
                        }
                    : item.kind === 'prohibition'
                      ? {
                          Icon: ShieldAlert,
                          bg: 'bg-amber-50 text-amber-700',
                        }
                      : item.kind === 'warning'
                        ? {
                            Icon: AlertTriangle,
                            bg: 'bg-rose-50 text-rose-700',
                          }
                        : {
                            Icon: Award,
                            bg: 'bg-emerald-50 text-emerald-700',
                          };

                const { Icon } = iconConfig;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onMarkRead(item.id);
                      if (item.onClick) {
                        setOpen(false);
                        item.onClick();
                      }
                    }}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none ${
                      isUnread ? 'bg-teal-50/35' : 'bg-white'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconConfig.bg}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-xs leading-snug ${
                            isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                          }`}
                        >
                          {item.title}
                        </p>
                        {isUnread && (
                          <span
                            className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-600"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                      {timeStr && (
                        <p className="mt-1 text-[11px] font-medium text-slate-400">{timeStr}</p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
