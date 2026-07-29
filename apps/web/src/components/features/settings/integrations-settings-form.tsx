'use client';

import type { MembershipRole } from '@prisma/client';
import {
  CreditCard,
  FileCheck2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Settings2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { canManageSettings } from '@/lib/permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type IntegrationsView = {
  payment: {
    preferredProvider: 'manual' | 'zarinpal' | 'idpay';
    sandbox: boolean;
    zarinpalMerchantIdMasked: string | null;
    zarinpalConfigured: boolean;
    idpayApiKeyMasked: string | null;
    idpayConfigured: boolean;
    status: 'active' | 'needs_setup' | 'manual';
    statusLabelFa: string;
  };
  sms: {
    apiKeyMasked: string | null;
    configured: boolean;
    sender: string | null;
    webhookUrl: string;
    status: 'active' | 'needs_setup';
    statusLabelFa: string;
  };
  moadian: {
    intermediaryUrl: string | null;
    apiKeyMasked: string | null;
    configured: boolean;
    taxMemoryId: string | null;
    status: 'active' | 'export_only';
    statusLabelFa: string;
    noticeFa: string;
  };
  whatsapp: {
    phoneNumberId: string | null;
    accessTokenMasked: string | null;
    configured: boolean;
    webhookUrl: string;
    status: 'active' | 'needs_setup';
    statusLabelFa: string;
  };
  email: {
    fromEmail: string | null;
    apiKeyMasked: string | null;
    configured: boolean;
    webhookUrl: string;
    status: 'active' | 'needs_setup';
    statusLabelFa: string;
  };
  voip: {
    webhookSecretMasked: string | null;
    configured: boolean;
    webhookUrl: string;
    status: 'active' | 'needs_setup';
    statusLabelFa: string;
  };
  telegram: {
    botUsername: string | null;
    botTokenMasked: string | null;
    configured: boolean;
    webhookUrl: string;
    status: 'active' | 'needs_setup';
    statusLabelFa: string;
  };
  instagram: {
    pageId: string | null;
    accessTokenMasked: string | null;
    appSecretMasked: string | null;
    configured: boolean;
    webhookUrl: string;
    status: 'active' | 'needs_setup' | 'preview';
    statusLabelFa: string;
    noticeFa: string;
  };
};

interface IntegrationsSettingsFormProps {
  role: MembershipRole;
}

function statusBadgeVariant(
  status: string,
): 'success' | 'warning' | 'secondary' | 'outline' {
  if (status === 'active') return 'success';
  if (status === 'needs_setup' || status === 'export_only') return 'warning';
  return 'secondary';
}

function MaskedSecretRow({
  masked,
  onChange,
}: {
  masked: string;
  onChange: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border/80 bg-muted/30 px-3 py-2">
      <span dir="ltr" className="font-mono text-sm text-muted-foreground">
        {masked}
      </span>
      <Button type="button" variant="outline" size="sm" onClick={onChange}>
        تغییر کلید
      </Button>
    </div>
  );
}

export function IntegrationsSettingsForm({ role }: IntegrationsSettingsFormProps) {
  const canEdit = canManageSettings(role);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<IntegrationsView | null>(null);

  const [provider, setProvider] = useState<'manual' | 'zarinpal' | 'idpay'>('manual');
  const [sandbox, setSandbox] = useState(true);
  const [zarinpalId, setZarinpalId] = useState('');
  const [idpayKey, setIdpayKey] = useState('');
  const [changeZarinpal, setChangeZarinpal] = useState(false);
  const [changeIdpay, setChangeIdpay] = useState(false);

  const [smsKey, setSmsKey] = useState('');
  const [smsSender, setSmsSender] = useState('');
  const [changeSms, setChangeSms] = useState(false);

  const [moadianUrl, setMoadianUrl] = useState('');
  const [moadianKey, setMoadianKey] = useState('');
  const [changeMoadianKey, setChangeMoadianKey] = useState(false);

  const [whatsappPhoneId, setWhatsappPhoneId] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');
  const [changeWhatsappToken, setChangeWhatsappToken] = useState(false);

  const [resendFromEmail, setResendFromEmail] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [changeResendKey, setChangeResendKey] = useState(false);

  const [voipWebhookSecret, setVoipWebhookSecret] = useState('');
  const [changeVoipSecret, setChangeVoipSecret] = useState(false);

  const [telegramUsername, setTelegramUsername] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [changeTelegramToken, setChangeTelegramToken] = useState(false);

  const [instagramPageId, setInstagramPageId] = useState('');
  const [instagramToken, setInstagramToken] = useState('');
  const [changeInstagramToken, setChangeInstagramToken] = useState(false);
  const [instagramAppSecret, setInstagramAppSecret] = useState('');
  const [changeInstagramAppSecret, setChangeInstagramAppSecret] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/integrations');
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error?.message ?? 'بارگذاری تنظیمات یکپارچه‌سازی ناموفق بود');
        return;
      }
      const v = data.data as IntegrationsView;
      setView(v);
      setProvider(v.payment.preferredProvider);
      setSandbox(v.payment.sandbox);
      setSmsSender(v.sms.sender ?? '');
      setMoadianUrl(v.moadian.intermediaryUrl ?? '');
      setChangeZarinpal(!v.payment.zarinpalConfigured);
      setChangeIdpay(!v.payment.idpayConfigured);
      setChangeSms(!v.sms.configured);
      setChangeMoadianKey(!v.moadian.apiKeyMasked);
      setWhatsappPhoneId(v.whatsapp.phoneNumberId ?? '');
      setChangeWhatsappToken(!v.whatsapp.accessTokenMasked);
      setResendFromEmail(v.email.fromEmail ?? '');
      setChangeResendKey(!v.email.apiKeyMasked);
      setChangeVoipSecret(!v.voip.webhookSecretMasked);
      setTelegramUsername(v.telegram.botUsername ?? '');
      setChangeTelegramToken(!v.telegram.botTokenMasked);
      setInstagramPageId(v.instagram.pageId ?? '');
      setChangeInstagramToken(!v.instagram.accessTokenMasked);
      setChangeInstagramAppSecret(!v.instagram.appSecretMasked);
      setZarinpalId('');
      setIdpayKey('');
      setSmsKey('');
      setMoadianKey('');
      setWhatsappToken('');
      setResendApiKey('');
      setVoipWebhookSecret('');
      setTelegramToken('');
      setInstagramToken('');
      setInstagramAppSecret('');
    } catch {
      toast.error('اتصال برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canEdit) {
      void load();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when role allows
  }, [canEdit]);

  if (!canEdit) {
    return null;
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        payment: {
          preferredProvider: provider,
          sandbox,
          ...(changeZarinpal && zarinpalId.trim()
            ? { zarinpalMerchantId: zarinpalId.trim() }
            : {}),
          ...(changeIdpay && idpayKey.trim() ? { idpayApiKey: idpayKey.trim() } : {}),
        },
        sms: {
          sender: smsSender.trim() || null,
          ...(changeSms && smsKey.trim() ? { apiKey: smsKey.trim() } : {}),
        },
        moadian: {
          intermediaryUrl: moadianUrl.trim() || null,
          ...(changeMoadianKey && moadianKey.trim() ? { apiKey: moadianKey.trim() } : {}),
        },
        whatsapp: {
          phoneNumberId: whatsappPhoneId.trim() || null,
          ...(changeWhatsappToken && whatsappToken.trim()
            ? { accessToken: whatsappToken.trim() }
            : {}),
        },
        email: {
          fromEmail: resendFromEmail.trim() || null,
          ...(changeResendKey && resendApiKey.trim() ? { apiKey: resendApiKey.trim() } : {}),
        },
        voip: {
          ...(changeVoipSecret && voipWebhookSecret.trim()
            ? { webhookSecret: voipWebhookSecret.trim() }
            : {}),
        },
        telegram: {
          botUsername: telegramUsername.trim() || null,
          ...(changeTelegramToken && telegramToken.trim()
            ? { botToken: telegramToken.trim() }
            : {}),
        },
        instagram: {
          pageId: instagramPageId.trim() || null,
          ...(changeInstagramToken && instagramToken.trim()
            ? { accessToken: instagramToken.trim() }
            : {}),
          ...(changeInstagramAppSecret && instagramAppSecret.trim()
            ? { appSecret: instagramAppSecret.trim() }
            : {}),
        },
      };

      const res = await fetch('/api/settings/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error?.message ?? 'ذخیره ناموفق بود');
        return;
      }
      toast.success('با موفقیت ذخیره شد');
      const v = data.data as IntegrationsView;
      setView(v);
      setChangeZarinpal(false);
      setChangeIdpay(false);
      setChangeSms(false);
      setChangeMoadianKey(false);
      setChangeWhatsappToken(false);
      setChangeResendKey(false);
      setChangeVoipSecret(false);
      setChangeTelegramToken(false);
      setChangeInstagramToken(false);
      setChangeInstagramAppSecret(false);
      setZarinpalId('');
      setIdpayKey('');
      setSmsKey('');
      setMoadianKey('');
      setWhatsappToken('');
      setResendApiKey('');
      setVoipWebhookSecret('');
      setTelegramToken('');
      setInstagramToken('');
      setInstagramAppSecret('');
    } catch {
      toast.error('اتصال برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-5 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
          <span role="status">در حال بارگذاری تنظیمات یکپارچه‌سازی…</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <Settings2 className="size-4 text-muted-foreground" aria-hidden />
            یکپارچه‌سازی‌های ایران
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            درگاه پرداخت، پیامک و واسط مؤدیان — کلیدها متعلق به همین کسب‌وکار است.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-sky-100/80 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                <CreditCard className="size-4" aria-hidden />
              </span>
              درگاه پرداخت
            </CardTitle>
            <CardDescription className="ms-10">
              زرین‌پال یا آیدی‌پی برای لینک پرداخت عمومی فاکتور.
            </CardDescription>
          </div>
          {view ? (
            <Badge variant={statusBadgeVariant(view.payment.status)} className="shrink-0">
              {view.payment.statusLabelFa}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pay-provider">ارائه‌دهنده</Label>
            <select
              id="pay-provider"
              className={cn(
                'flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              value={provider}
              onChange={(e) => setProvider(e.target.value as typeof provider)}
            >
              <option value="manual">پرداخت دستی (بدون درگاه آنلاین)</option>
              <option value="zarinpal">زرین‌پال</option>
              <option value="idpay">آیدی‌پی</option>
            </select>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="pay-sandbox"
              type="checkbox"
              checked={sandbox}
              onChange={(e) => setSandbox(e.target.checked)}
              className="size-4 cursor-pointer rounded border-input accent-primary"
            />
            <Label htmlFor="pay-sandbox" className="cursor-pointer font-normal">
              حالت آزمایشی (Sandbox)
            </Label>
          </div>

          {provider === 'manual' ? (
            <p className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
              با پرداخت دستی، لینک عمومی فاکتور ساخته می‌شود ولی پرداخت آنلاین غیرفعال است.
            </p>
          ) : null}

          {(provider === 'zarinpal' || view?.payment.zarinpalConfigured) && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="zarinpal-merchant">شناسه پذیرنده زرین‌پال</Label>
              {view?.payment.zarinpalConfigured && !changeZarinpal ? (
                <MaskedSecretRow
                  masked={view.payment.zarinpalMerchantIdMasked ?? '••••'}
                  onChange={() => setChangeZarinpal(true)}
                />
              ) : (
                <Input
                  id="zarinpal-merchant"
                  type="password"
                  autoComplete="off"
                  dir="ltr"
                  className="text-start"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={zarinpalId}
                  onChange={(e) => setZarinpalId(e.target.value)}
                  aria-describedby="zarinpal-hint"
                />
              )}
              {changeZarinpal || !view?.payment.zarinpalConfigured ? (
                <p id="zarinpal-hint" className="text-xs text-muted-foreground">
                  Merchant ID را از پنل زرین‌پال کپی کنید. خالی بگذارید تا کلید قبلی حفظ شود.
                </p>
              ) : null}
            </div>
          )}

          {(provider === 'idpay' || view?.payment.idpayConfigured) && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="idpay-key">کلید API آیدی‌پی</Label>
              {view?.payment.idpayConfigured && !changeIdpay ? (
                <MaskedSecretRow
                  masked={view.payment.idpayApiKeyMasked ?? '••••'}
                  onChange={() => setChangeIdpay(true)}
                />
              ) : (
                <Input
                  id="idpay-key"
                  type="password"
                  autoComplete="off"
                  dir="ltr"
                  className="text-start"
                  value={idpayKey}
                  onChange={(e) => setIdpayKey(e.target.value)}
                />
              )}
            </div>
          )}

          {provider !== 'manual' &&
          ((provider === 'zarinpal' && !view?.payment.zarinpalConfigured && !zarinpalId.trim()) ||
            (provider === 'idpay' && !view?.payment.idpayConfigured && !idpayKey.trim())) ? (
            <p className="text-xs text-amber-800 sm:col-span-2 dark:text-amber-200">
              برای فعال‌شدن پرداخت آنلاین، کلید ارائه‌دهنده را وارد و ذخیره کنید.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-rose-100/80 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                <MessageSquare className="size-4" aria-hidden />
              </span>
              پیامک (کاوه‌نگار)
            </CardTitle>
            <CardDescription className="ms-10">
              یادآوری سررسید و ارسال لینک پرداخت به مشتری.
            </CardDescription>
          </div>
          {view ? (
            <Badge variant={statusBadgeVariant(view.sms.status)} className="shrink-0">
              {view.sms.statusLabelFa}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sms-key">کلید API کاوه‌نگار</Label>
            {view?.sms.configured && !changeSms ? (
              <MaskedSecretRow
                masked={view.sms.apiKeyMasked ?? '••••'}
                onChange={() => setChangeSms(true)}
              />
            ) : (
              <Input
                id="sms-key"
                type="password"
                autoComplete="off"
                dir="ltr"
                className="text-start"
                value={smsKey}
                onChange={(e) => setSmsKey(e.target.value)}
              />
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sms-sender">فرستنده (اختیاری)</Label>
            <Input
              id="sms-sender"
              dir="ltr"
              className="text-start"
              placeholder="10008663"
              value={smsSender}
              onChange={(e) => setSmsSender(e.target.value)}
            />
          </div>
          {!view?.sms.configured ? (
            <p className="rounded-md border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 sm:col-span-2 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
              بدون کلید، پیامک واقعی ارسال نمی‌شود؛ لینک پرداخت همچنان ساخته می‌شود.
            </p>
          ) : null}
          {view?.sms.webhookUrl ? (
            <p className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
              Webhook دریافت پیامک (کاوه‌نگار):{' '}
              <span dir="ltr" className="font-mono break-all">
                {view.sms.webhookUrl}
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-green-100/80 text-green-800 dark:bg-green-950/40 dark:text-green-200">
                <MessageSquare className="size-4" aria-hidden />
              </span>
              واتساپ Business
            </CardTitle>
            <CardDescription className="ms-10">
              دریافت و ارسال پیام مشتری در CRM — Meta Cloud API.
            </CardDescription>
          </div>
          {view ? (
            <Badge variant={statusBadgeVariant(view.whatsapp.status)} className="shrink-0">
              {view.whatsapp.statusLabelFa}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="wa-phone-id">Phone Number ID</Label>
            <Input
              id="wa-phone-id"
              dir="ltr"
              className="text-start"
              placeholder="123456789012345"
              value={whatsappPhoneId}
              onChange={(e) => setWhatsappPhoneId(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="wa-token">Access Token</Label>
            {view?.whatsapp.accessTokenMasked && !changeWhatsappToken ? (
              <MaskedSecretRow
                masked={view.whatsapp.accessTokenMasked}
                onChange={() => setChangeWhatsappToken(true)}
              />
            ) : (
              <Input
                id="wa-token"
                type="password"
                autoComplete="off"
                dir="ltr"
                className="text-start"
                value={whatsappToken}
                onChange={(e) => setWhatsappToken(e.target.value)}
              />
            )}
          </div>
          {view?.whatsapp.webhookUrl ? (
            <p className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
              Webhook URL (در Meta Developer):{' '}
              <span dir="ltr" className="font-mono break-all">
                {view.whatsapp.webhookUrl}
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-sky-100/80 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                <Mail className="size-4" aria-hidden />
              </span>
              ایمیل (Resend)
            </CardTitle>
            <CardDescription className="ms-10">
              ارسال و دریافت ایمیل مشتری در CRM — Inbound webhook Resend.
            </CardDescription>
          </div>
          {view ? (
            <Badge variant={statusBadgeVariant(view.email.status)} className="shrink-0">
              {view.email.statusLabelFa}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 sm:col-span-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="resend-from">ایمیل فرستنده (From)</Label>
            <Input
              id="resend-from"
              type="email"
              dir="ltr"
              className="text-start"
              placeholder="noreply@yourdomain.com"
              value={resendFromEmail}
              onChange={(e) => setResendFromEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="resend-key">کلید API Resend</Label>
            {view?.email.apiKeyMasked && !changeResendKey ? (
              <MaskedSecretRow
                masked={view.email.apiKeyMasked}
                onChange={() => setChangeResendKey(true)}
              />
            ) : (
              <Input
                id="resend-key"
                type="password"
                autoComplete="off"
                dir="ltr"
                className="text-start"
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
              />
            )}
          </div>
          {view?.email.webhookUrl ? (
            <p className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
              Webhook دریافت ایمیل (Resend):{' '}
              <span dir="ltr" className="font-mono break-all">
                {view.email.webhookUrl}
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-violet-100/80 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200">
                <Phone className="size-4" aria-hidden />
              </span>
              تماس VoIP / PBX
            </CardTitle>
            <CardDescription className="ms-10">
              ثبت خودکار تماس‌های ورودی و خروجی از مرکز تماس — webhook عمومی.
            </CardDescription>
          </div>
          {view ? (
            <Badge variant={statusBadgeVariant(view.voip.status)} className="shrink-0">
              {view.voip.statusLabelFa}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 sm:col-span-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="voip-secret">کلید امنیتی Webhook (اختیاری)</Label>
            {view?.voip.webhookSecretMasked && !changeVoipSecret ? (
              <MaskedSecretRow
                masked={view.voip.webhookSecretMasked}
                onChange={() => setChangeVoipSecret(true)}
              />
            ) : (
              <Input
                id="voip-secret"
                type="password"
                autoComplete="off"
                dir="ltr"
                className="text-start"
                placeholder="secret-for-pbx-webhook"
                value={voipWebhookSecret}
                onChange={(e) => setVoipWebhookSecret(e.target.value)}
              />
            )}
          </div>
          {view?.voip.webhookUrl ? (
            <p className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
              Webhook رویداد تماس (PBX / VoIP):{' '}
              <span dir="ltr" className="font-mono break-all">
                {view.voip.webhookUrl}
              </span>
              <span className="mt-2 block">
                هدر اختیاری: <span dir="ltr" className="font-mono">X-Voip-Secret</span>
              </span>
            </p>
          ) : null}
          <p className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
            فرمت JSON نمونه:{' '}
            <span dir="ltr" className="font-mono break-all">
              {`{"callId":"123","direction":"inbound","status":"completed","from":"0912…","to":"021…","duration":120}`}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-sky-100/80 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                <MessageSquare className="size-4" aria-hidden />
              </span>
              تلگرام (ربات)
            </CardTitle>
            <CardDescription className="ms-10">
              دریافت و ارسال پیام از طریق Telegram Bot API — webhook per-org.
            </CardDescription>
          </div>
          {view ? (
            <Badge variant={statusBadgeVariant(view.telegram.status)} className="shrink-0">
              {view.telegram.statusLabelFa}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 sm:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="telegram-username">نام کاربری ربات (اختیاری)</Label>
            <Input
              id="telegram-username"
              dir="ltr"
              className="text-start"
              placeholder="@MyShopBot"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="telegram-token">توکن ربات</Label>
            {view?.telegram.botTokenMasked && !changeTelegramToken ? (
              <MaskedSecretRow
                masked={view.telegram.botTokenMasked}
                onChange={() => setChangeTelegramToken(true)}
              />
            ) : (
              <Input
                id="telegram-token"
                type="password"
                autoComplete="off"
                dir="ltr"
                className="text-start"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
              />
            )}
          </div>
          {view?.telegram.webhookUrl ? (
            <p className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
              Webhook تلگرام:{' '}
              <span dir="ltr" className="font-mono break-all">
                {view.telegram.webhookUrl}
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-pink-100/80 text-pink-800 dark:bg-pink-950/40 dark:text-pink-200">
                <MessageSquare className="size-4" aria-hidden />
              </span>
              اینستاگرام DM
            </CardTitle>
            <CardDescription className="ms-10">
              {view?.instagram.noticeFa ??
                'دریافت/ارسال DM با Graph API — برای production نیاز به Meta App Review است.'}
            </CardDescription>
          </div>
          {view ? (
            <Badge variant={statusBadgeVariant(view.instagram.status)} className="shrink-0">
              {view.instagram.statusLabelFa}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 sm:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="instagram-page">شناسه صفحه (Page ID)</Label>
            <Input
              id="instagram-page"
              dir="ltr"
              className="text-start"
              placeholder="17841400000000000"
              value={instagramPageId}
              onChange={(e) => setInstagramPageId(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="instagram-token">توکن دسترسی (Access Token)</Label>
            {view?.instagram.accessTokenMasked && !changeInstagramToken ? (
              <MaskedSecretRow
                masked={view.instagram.accessTokenMasked}
                onChange={() => setChangeInstagramToken(true)}
              />
            ) : (
              <Input
                id="instagram-token"
                type="password"
                autoComplete="off"
                dir="ltr"
                className="text-start"
                value={instagramToken}
                onChange={(e) => setInstagramToken(e.target.value)}
              />
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="instagram-app-secret">App Secret (امضای webhook)</Label>
            {view?.instagram.appSecretMasked && !changeInstagramAppSecret ? (
              <MaskedSecretRow
                masked={view.instagram.appSecretMasked}
                onChange={() => setChangeInstagramAppSecret(true)}
              />
            ) : (
              <Input
                id="instagram-app-secret"
                type="password"
                autoComplete="off"
                dir="ltr"
                className="text-start"
                value={instagramAppSecret}
                onChange={(e) => setInstagramAppSecret(e.target.value)}
              />
            )}
          </div>
          {view?.instagram.webhookUrl ? (
            <p className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
              Webhook اینستاگرام:{' '}
              <span dir="ltr" className="font-mono break-all">
                {view.instagram.webhookUrl}
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                <FileCheck2 className="size-4" aria-hidden />
              </span>
              مؤدیان (واسط)
            </CardTitle>
            <CardDescription className="ms-10">
              {view?.moadian.noticeFa ??
                'اتصال به واسط مؤدیان — نه اتصال مستقیم به سازمان امور مالیاتی.'}
            </CardDescription>
          </div>
          {view ? (
            <Badge variant={statusBadgeVariant(view.moadian.status)} className="shrink-0">
              {view.moadian.statusLabelFa}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {view?.moadian.taxMemoryId ? (
            <p className="text-xs text-muted-foreground sm:col-span-2">
              شناسه حافظه مالیاتی سازمان:{' '}
              <span dir="ltr" className="font-mono">
                {view.moadian.taxMemoryId}
              </span>{' '}
              (از بخش اطلاعات سازمان قابل ویرایش است)
            </p>
          ) : (
            <p className="rounded-md border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 sm:col-span-2 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
              شناسه حافظه مالیاتی هنوز ثبت نشده است. از «ویرایش اطلاعات سازمان» در بالای همین صفحه تکمیلش کنید.
            </p>
          )}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="moadian-url">آدرس URL واسط</Label>
            <Input
              id="moadian-url"
              dir="ltr"
              className="text-start"
              placeholder="https://…"
              value={moadianUrl}
              onChange={(e) => setMoadianUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="moadian-key">کلید API واسط</Label>
            {view?.moadian.apiKeyMasked && !changeMoadianKey ? (
              <MaskedSecretRow
                masked={view.moadian.apiKeyMasked}
                onChange={() => setChangeMoadianKey(true)}
              />
            ) : (
              <Input
                id="moadian-key"
                type="password"
                autoComplete="off"
                dir="ltr"
                className="text-start"
                value={moadianKey}
                onChange={(e) => setMoadianKey(e.target.value)}
              />
            )}
          </div>
          {!view?.moadian.configured ? (
            <p className="text-xs text-muted-foreground sm:col-span-2">
              بدون واسط، خروجی JSON و بارگذاری دستی در صفحه فاکتور در دسترس است.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving} className="min-h-10 min-w-[12rem]">
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
              در حال ذخیره…
            </>
          ) : (
            'ذخیره تنظیمات یکپارچه‌سازی'
          )}
        </Button>
      </div>
    </form>
  );
}
