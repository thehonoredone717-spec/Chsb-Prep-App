import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async (reg) => {
        // 1. Periodic Background Sync
        if ('periodicSync' in reg) {
          try {
            const permissions = navigator.permissions as unknown as {
              query?: (desc: { name: string }) => Promise<{ state: string }>;
            };
            if (permissions?.query) {
              const status = await permissions.query({ name: 'periodic-background-sync' });
              if (status.state === 'granted') {
                const syncReg = reg as unknown as {
                  periodicSync: {
                    register: (tag: string, options: { minInterval: number }) => Promise<void>;
                  };
                };
                await syncReg.periodicSync.register('chsb-periodic-sync', {
                  minInterval: 24 * 60 * 60 * 1000,
                });
              }
            }
          } catch {
            // Ignore in unsupported environments
          }
        }

        // 2. Background Sync
        if ('sync' in reg) {
          try {
            const syncReg = reg as unknown as {
              sync: {
                register: (tag: string) => Promise<void>;
              };
            };
            await syncReg.sync.register('background-sync');
          } catch {
            // Ignore in unsupported environments
          }
        }
      })
      .catch((err) => {
        console.warn('SW registration skipped:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
