'use client';

import { useEffect } from 'react';

import { PwaInstallPrompt } from '@/components/pwa/pwa-install-prompt';

const IS_DEV = process.env.NODE_ENV === 'development';

async function unregisterAllServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((reg) => reg.unregister()));
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Dev: never keep a SW — it caches HTML and leaves login/register unstyled after rebuilds.
    if (IS_DEV) {
      void unregisterAllServiceWorkers();
      return;
    }

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
      {!IS_DEV ? <PwaInstallPrompt /> : null}
    </>
  );
}
