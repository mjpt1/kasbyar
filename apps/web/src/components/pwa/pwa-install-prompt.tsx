'use client';

import { Download, Share, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DISMISS_KEY = 'kesbyar-pwa-install-dismissed';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia('(display-mode: standalone)').matches;
  const ios =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_MS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore quota / private mode
  }
}

async function maybeNotifyInstall() {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (isStandalone() || wasDismissedRecently()) return;

  try {
    const reg = await navigator.serviceWorker?.ready;
    const options: NotificationOptions = {
      body: 'وب‌اپ کسب‌یار را روی دستگاه خود نصب کنید تا سریع‌تر و آفلاین‌تر کار کنید.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      tag: 'kesbyar-install',
      dir: 'rtl',
      lang: 'fa',
      data: { url: '/' },
    };
    if (reg?.showNotification) {
      await reg.showNotification('نصب کسب‌یار', options);
    } else {
      new Notification('نصب کسب‌یار', options);
    }
  } catch {
    // Notifications may be blocked
  }
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installing, setInstalling] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const shownRef = useRef(false);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const reveal = (opts?: { ios?: boolean }) => {
      if (shownRef.current || isStandalone() || wasDismissedRecently()) return;
      shownRef.current = true;
      if (opts?.ios) setShowIosGuide(true);
      setVisible(true);
      void maybeNotifyInstall();
    };

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      const bip = event as BeforeInstallPromptEvent;
      deferredRef.current = bip;
      setDeferred(bip);
      reveal();
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
      deferredRef.current = null;
      markDismissed();
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    const timer = window.setTimeout(() => {
      if (deferredRef.current) {
        reveal();
        return;
      }
      if (isIosDevice()) {
        reveal({ ios: true });
        return;
      }
      // Soft reminder for browsers that support install but fired late / silently
      reveal();
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  const dismiss = useCallback(() => {
    markDismissed();
    setVisible(false);
  }, []);

  const install = useCallback(async () => {
    const promptEvent = deferredRef.current ?? deferred;
    if (!promptEvent) {
      setShowIosGuide(true);
      return;
    }
    setInstalling(true);
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setVisible(false);
        markDismissed();
      }
      deferredRef.current = null;
      setDeferred(null);
    } finally {
      setInstalling(false);
    }
  }, [deferred]);

  const requestNotifAndInstall = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') await maybeNotifyInstall();
      } catch {
        // ignore
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      await maybeNotifyInstall();
    }
    await install();
  }, [install]);

  if (!visible || isStandalone()) return null;

  const canNativeInstall = Boolean(deferred);

  return (
    <div
      role="dialog"
      aria-label="پیشنهاد نصب وب‌اپ"
      className={cn(
        'fixed inset-x-3 z-[60] mx-auto max-w-md rounded-2xl border bg-card/95 p-4 shadow-xl backdrop-blur-md',
        'bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-6 sm:end-6',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-96.png" alt="" width={48} height={48} className="h-12 w-12" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-bold">کسب‌یار را نصب کنید</p>
          <p className="text-xs leading-6 text-muted-foreground">
            وب‌اپ کاملاً رسپانسیو است و روی موبایل یا کامپیوتر مثل یک اپ واقعی کار می‌کند.
          </p>
          {showIosGuide || (!canNativeInstall && isIosDevice()) ? (
            <p className="flex items-start gap-1.5 pt-1 text-[11px] leading-5 text-muted-foreground">
              <Share className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              در سافاری دکمه Share را بزنید، سپس «Add to Home Screen» / «افزودن به صفحهٔ اصلی» را انتخاب کنید.
            </p>
          ) : null}
          {!canNativeInstall && !isIosDevice() ? (
            <p className="pt-1 text-[11px] leading-5 text-muted-foreground">
              در کروم/اج: منوی مرورگر ← «Install app» / «نصب برنامه»
            </p>
          ) : null}
        </div>
        <Button type="button" variant="ghost" size="icon" className="shrink-0" aria-label="بستن" onClick={dismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
          بعداً
        </Button>
        {canNativeInstall ? (
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            disabled={installing}
            onClick={() => void requestNotifAndInstall()}
          >
            <Download className="h-4 w-4" />
            نصب وب‌اپ
          </Button>
        ) : (
          <Button type="button" size="sm" variant="secondary" onClick={() => setShowIosGuide(true)}>
            راهنمای نصب
          </Button>
        )}
      </div>
    </div>
  );
}
