import { BarChart3, ClipboardCheck, FileCheck2, Layers, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { UI_COPY } from '../data/subjects';
import { UILanguage } from '../types/quiz';
import { AppView } from './TopBar';

interface MobileBottomNavProps {
  lang: UILanguage;
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  isQuizRunning?: boolean;
}

export function MobileBottomNav({
  lang,
  activeView,
  onSelectView,
  isQuizRunning = false,
}: MobileBottomNavProps) {
  if (isQuizRunning) return null;

  const copy = UI_COPY[lang];

  const items = [
    { id: 'dashboard' as AppView, label: copy.navHome, icon: LayoutDashboard },
    { id: 'subjects' as AppView, label: copy.navSubjects, icon: Layers },
    { id: 'test' as AppView, label: copy.navTest, icon: ClipboardCheck },
    { id: 'exam' as AppView, label: copy.navExam, icon: FileCheck2 },
    { id: 'store' as AppView, label: copy.navStore, icon: ShoppingBag },
    { id: 'results' as AppView, label: copy.navResults, icon: BarChart3 },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 px-1.5 py-1.5 backdrop-blur-md lg:hidden shadow-lg"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectView(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center justify-center py-1 text-center transition-colors focus-visible:outline-none ${
              isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} aria-hidden="true" />
            <span className="mt-1 text-[10px] leading-tight truncate max-w-[62px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
