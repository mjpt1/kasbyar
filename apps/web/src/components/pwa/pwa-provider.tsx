'use client';

import { useEffect } from 'react';

import { PwaInstallPrompt } from '@/components/pwa/pwa-install-prompt';

export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage('SKIP_WAITING');
            }
          });
        });
      } catch {
        // SW registration can fail on insecure origins outside localhost
      }
    };

    void register();
  }, []);

  return (
    <>
      {children}
      <PwaInstallPrompt />
    </>
  );
}
