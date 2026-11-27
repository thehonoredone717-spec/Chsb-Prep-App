import {
  Coins,
  GraduationCap,
  LogOut,
  Maximize2,
  Menu,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { UI_COPY } from '../data/subjects';
import { UserProfile } from '../firebase';
import { UILanguage } from '../types/quiz';
import { AppNotification, NotificationBell } from './NotificationBell';
import { UserAvatarFrame, UserTitleLabel } from './UserAvatarFrame';

export type AppView = 'dashboard' | 'subjects' | 'test' | 'exam' | 'guide' | 'results' | 'store' | 'permission' | 'assign' | 'preview';
export type TeacherScope = 'none' | 'computing' | 'math' | 'science' | 'english' | 'history' | 'uzbek' | 'all';

interface TopBarProps {
  lang: UILanguage;
  onSelectView: (view: AppView) => void;
  userProfile: UserProfile;
  teacherScope: TeacherScope;
  onSignOut: () => void;
  isFullscreen: boolean;
  isQuizRunning?: boolean;
  onToggleFullscreen: () => void;
  desktopMenuOpen: boolean;
  onToggleDesktopMenu: () => void;
  onOpenMobileMenu: () => void;
  notifications: AppNotification[];
  readNotificationIds: Set<string>;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  availableXp?: number;
  equippedTitle?: string;
  equippedFrame?: string;
}

export function TopBar({
  lang,
  onSelectView,
  userProfile,
  teacherScope,
  onSignOut,
  isFullscreen,
  isQuizRunning = false,
  onToggleFullscreen,
  desktopMenuOpen,
  onToggleDesktopMenu,
  onOpenMobileMenu,
  notifications,
  readNotificationIds,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  availableXp = 0,
  equippedTitle = '',
  equippedFrame = '',
}: TopBarProps) {
  const copy = UI_COPY[lang];
  const isAnyTeacher = teacherScope !== 'none';

  const badgeText =
    teacherScope === 'all'
      ? copy.ownerBadge
      : teacherScope === 'computing'
        ? copy.computingTeacherBadge
        : teacherScope === 'math'
          ? copy.mathTeacherBadge
          : teacherScope === 'science'
            ? copy.scienceTeacherBadge
            : teacherScope === 'english'
              ? copy.englishTeacherBadge
              : teacherScope === 'history'
                ? copy.historyTeacherBadge
                : teacherScope === 'uzbek'
                  ? copy.uzbekTeacherBadge
                  : `@${userProfile.username}`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label={lang === 'uz' ? 'Menyuni ochish' : 'Open menu'}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onToggleDesktopMenu}
            title={
              desktopMenuOpen
                ? lang === 'uz'
                  ? 'Menyuni yopish'
                  : 'Close menu'
                : lang === 'uz'
                  ? 'Menyuni ochish'
                  : 'Open menu'
            }
            aria-label={
              desktopMenuOpen
                ? lang === 'uz'
                  ? 'Menyuni yopish'
                  : 'Close menu'
                : lang === 'uz'
                  ? 'Menyuni ochish'
                  : 'Open menu'
            }
            aria-expanded={desktopMenuOpen}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 lg:inline-flex"
          >
            {desktopMenuOpen ? (
              <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectView('dashboard')}
            className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-left font-display text-lg font-bold tracking-tight text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white shadow-xs ring-1 ring-teal-800">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </div>
            <span>{copy.brand}</span>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onSelectView('store')}
            title={lang === 'uz' ? "XP Do'konini ochish" : 'Open XP Store'}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 text-xs font-extrabold text-amber-800 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <Coins className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
            <span className="font-mono-num">{availableXp} XP</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('store')}
            title={lang === 'uz' ? 'Profil bezaklari (Store)' : 'Customize profile in Store'}
            className="hidden items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 sm:flex"
          >
            <UserAvatarFrame
              name={userProfile.displayName}
              isTeacher={isAnyTeacher}
              frameId={equippedFrame}
              size="xs"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="max-w-[130px] truncate text-xs font-semibold text-slate-800">
                  {userProfile.displayName}
                </span>
                <span className="text-[11px] font-medium text-teal-700">{badgeText}</span>
              </div>
              {equippedTitle && (
                <UserTitleLabel titleId={equippedTitle} lang={lang} className="text-[11px]" />
              )}
            </div>
          </button>

          <button
            type="button"
            disabled={isQuizRunning && isFullscreen}
            onClick={onToggleFullscreen}
            title={
              isQuizRunning && isFullscreen
                ? lang === 'uz'
                  ? "Test paytida to'liq ekrandan chiqish taqiqlanadi"
                  : 'Cannot exit fullscreen during an active test'
                : isFullscreen
                  ? lang === 'uz'
                    ? "To'liq ekrandan chiqish"
                    : 'Exit fullscreen'
                  : lang === 'uz'
                    ? "To'liq ekran"
                    : 'Fullscreen'
            }
            aria-label={
              isFullscreen
                ? lang === 'uz'
                  ? "To'liq ekrandan chiqish"
                  : 'Exit fullscreen'
                : lang === 'uz'
                  ? "To'liq ekran"
                  : 'Fullscreen'
            }
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <NotificationBell
            lang={lang}
            notifications={notifications}
            readIds={readNotificationIds}
            onMarkRead={onMarkNotificationRead}
            onMarkAllRead={onMarkAllNotificationsRead}
          />

          <button
            type="button"
            onClick={onSignOut}
            title={copy.signOut}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{copy.signOut}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
