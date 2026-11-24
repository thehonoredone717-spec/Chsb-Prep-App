import { Download, GraduationCap, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { UI_COPY } from '../data/subjects';
import { UserProfile } from '../firebase';
import { UILanguage } from '../types/quiz';

export type AppView = 'subjects' | 'quiz' | 'guide' | 'results';

interface TopBarProps {
  lang: UILanguage;
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onDownloadHtml: () => void;
  downloadNotice: boolean;
  userProfile: UserProfile;
  isTeacher: boolean;
  onSignOut: () => void;
}

export function TopBar({
  lang,
  activeView,
  onSelectView,
  onDownloadHtml,
  downloadNotice,
  userProfile,
  isTeacher,
  onSignOut,
}: TopBarProps) {
  const copy = UI_COPY[lang];

  const navItems: { id: AppView; label: string }[] = [
    { id: 'subjects', label: copy.navSubjects },
    { id: 'quiz', label: copy.navTest },
    { id: 'guide', label: copy.navGuide },
    { id: 'results', label: copy.navResults },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6">
        <button
          type="button"
          onClick={() => onSelectView('subjects')}
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-left font-display text-lg font-bold tracking-tight text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
        >
          <GraduationCap className="h-5 w-5 text-teal-700" aria-hidden="true" />
          <span>{copy.brand}</span>
        </button>

        <nav aria-label="Primary" className="flex items-center gap-5 overflow-x-auto sm:gap-6">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative shrink-0 whitespace-nowrap py-1 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'text-teal-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[19px] h-0.5 bg-teal-700"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 md:flex">
            {isTeacher ? (
              <ShieldCheck className="h-4 w-4 text-teal-700" aria-hidden="true" />
            ) : (
              <UserIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
            )}
            <span className="max-w-[130px] truncate text-xs font-semibold text-slate-800">
              {userProfile.displayName}
            </span>
            <span className="text-[11px] font-medium text-teal-700">
              {isTeacher ? copy.teacherBadge : `@${userProfile.username}`}
            </span>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            title={copy.signOut}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{copy.signOut}</span>
          </button>

          <button
            type="button"
            onClick={onDownloadHtml}
            className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden lg:inline">
              {downloadNotice ? copy.htmlDownloaded : copy.downloadHtml}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
