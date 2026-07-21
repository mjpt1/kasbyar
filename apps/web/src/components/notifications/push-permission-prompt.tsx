'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

const DISMISS_KEY = 'kesbyar.push.prompt.dismissed';

export function PushPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return;

    const t = window.setTimeout(() => setVisible(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  async function enable() {
    setBusy(true);
    setMessage(null);
    try {
      const vapidRes = await fetch('/api/push/subscribe');
      const vapidJson = await vapidRes.json();
      if (!vapidJson?.success || !vapidJson.data?.configured || !vapidJson.data.publicKey) {
        setMessage('اعلان مرورگر روی سرور فعال نیست؛ اعلان‌های داخل اپ همچنان کار می‌کنند.');
        localStorage.setItem(DISMISS_KEY, '1');
        setVisible(false);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        localStorage.setItem(DISMISS_KEY, '1');
        setVisible(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidJson.data.publicKey),
      });
      const json = sub.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        }),
      });
      localStorage.setItem(DISMISS_KEY, '1');
      setVisible(false);
    } catch {
      setMessage('فعال‌سازی اعلان مرورگر انجام نشد.');
    } finally {
      setBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-xl border bg-background p-4 shadow-lg sm:inset-x-auto sm:end-4 sm:start-auto">
      <p className="text-sm font-medium">اعلان‌های مرورگر</p>
      <p className="mt-1 text-xs text-muted-foreground">
        اگر بخواهید، رویدادهای مهم مثل مطالبات معوق یا پیشنهاد اتاق فرمان را روی دسکتاپ هم می‌بینید.
      </p>
      {message ? <p className="mt-2 text-xs text-amber-700">{message}</p> : null}
      <div className="mt-3 flex gap-2">
        <Button type="button" size="sm" disabled={busy} onClick={() => void enable()}>
          فعال کردن
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, '1');
            setVisible(false);
          }}
        >
          بعداً
        </Button>
      </div>
    </div>
  );
}
