import { MonitorSmartphone, Smartphone, X } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { UILanguage } from '../types/quiz';

interface PWAInstallButtonProps {
  lang: UILanguage;
}

export function PWAInstallButton({ lang }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = () => {
    if (isInstallable) {
      void install();
      return;
    }
    setShowGuide(true);
  };

  const uz = lang === 'uz';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title={uz ? 'Windows / Android ilova sifatida o‘rnatish' : 'Install as Windows / Android App'}
        className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-teal-200 bg-teal-50 px-3 text-xs font-bold text-teal-800 transition-colors hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 sm:text-sm"
      >
        <MonitorSmartphone className="h-4 w-4 text-teal-700" aria-hidden="true" />
        <span className="hidden md:inline">{uz ? 'Ilovani o‘rnatish' : 'Install App'}</span>
      </button>

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Smartphone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-display text-base font-extrabold text-slate-900">
                    {uz ? 'Windows va Androidga o‘rnatish' : 'Install on Windows & Android'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {uz
                      ? 'Ilovani mustaqil oyna sifatida o‘rnating'
                      : 'Install as a standalone desktop or mobile app'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label={uz ? 'Yopish' : 'Close'}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-700">
              {isIOS ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <p className="font-bold text-slate-900">iPhone / iPad (Safari):</p>
                  <p className="mt-1">
                    {uz
                      ? '1. Safari pastki panelidan Ulashish (Share) tugmasini bosing. 2. "Add to Home Screen" ni tanlang.'
                      : '1. Tap the Share button in Safari. 2. Scroll down and tap "Add to Home Screen".'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="font-bold text-slate-900">Windows (Chrome / Edge):</p>
                    <p className="mt-1">
                      {uz
                        ? 'Ilovaning umumiy havolasini (Shared URL) yangi oynada oching, manzil satridagi O‘rnatish belgisini (yoki ⋯ → Ilovalar → Ushbu saytni ilova sifatida o‘rnatish) bosing.'
                        : 'Open the Shared App URL in Chrome or Microsoft Edge, then click the Install icon in the address bar (or ⋯ → Apps → Install this site as an app) to create a desktop app.'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="font-bold text-slate-900">Android (Chrome):</p>
                    <p className="mt-1">
                      {uz
                        ? 'Shared App havolasini Chrome orqali oching → ⋮ menyuni bosing → "Ilovani o‘rnatish" (Install app) ni tanlang.'
                        : 'Open the Shared App URL in Chrome → tap ⋮ menu → tap "Install app" to add it like a native Android app.'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 inline-flex min-h-[42px] w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              {uz ? 'Tushunarli' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
