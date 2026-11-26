import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { UILanguage } from '../types/quiz';

interface OfflineIndicatorProps {
  lang: UILanguage;
}

export function OfflineIndicator({ lang }: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-amber-400 bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>
        {lang === 'uz'
          ? 'Oflayn rejim — keshlangan testlar faol'
          : 'Offline Mode — Cached content active'}
      </span>
    </div>
  );
}
