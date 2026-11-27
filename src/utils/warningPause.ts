import { useEffect, useState } from 'react';

// Temporary 5-minute pause for warning banner and proctoring warnings (until 2026-11-27T07:41:15Z)
export const WARNINGS_PAUSED_UNTIL_MS = Date.parse('2026-11-27T07:41:15.000Z');

export function areWarningsPaused(now = Date.now()): boolean {
  return now < WARNINGS_PAUSED_UNTIL_MS;
}

export function useWarningsPaused(): boolean {
  const [paused, setPaused] = useState<boolean>(() => areWarningsPaused());

  useEffect(() => {
    const remainingMs = WARNINGS_PAUSED_UNTIL_MS - Date.now();
    if (remainingMs <= 0) {
      setPaused(false);
      return;
    }
    setPaused(true);
    const timer = window.setTimeout(() => {
      setPaused(false);
    }, remainingMs);
    return () => window.clearTimeout(timer);
  }, []);

  return paused;
}
