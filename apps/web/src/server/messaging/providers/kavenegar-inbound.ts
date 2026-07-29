export type KavenegarInboundSms = {
  externalId: string;
  fromPhone: string;
  content: string;
  sentAt: Date;
};

export function parseKavenegarInboundWebhook(body: unknown): KavenegarInboundSms[] {
  if (!body) return [];

  const record = normalizeRecord(body);
  if (!record) return [];

  const entries = Array.isArray(record.entries)
    ? record.entries
    : Array.isArray((record.return as { entries?: unknown[] } | undefined)?.entries)
      ? (record.return as { entries: unknown[] }).entries
      : [record];

  const results: KavenegarInboundSms[] = [];

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const row = entry as Record<string, unknown>;
    const message = String(row.message ?? row.text ?? '').trim();
    const sender = String(row.sender ?? row.from ?? row.mobile ?? '').trim();
    const messageId = String(row.messageid ?? row.messageId ?? row.id ?? `${sender}-${Date.now()}`);
    if (!message || !sender) continue;

    results.push({
      externalId: messageId,
      fromPhone: normalizeInboundPhone(sender),
      content: message,
      sentAt: parseDate(row.date ?? row.createdAt),
    });
  }

  return results;
}

function normalizeRecord(body: unknown): Record<string, unknown> | null {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      const params = new URLSearchParams(body);
      return Object.fromEntries(params.entries());
    }
  }
  if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }
  return null;
}

function normalizeInboundPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('98') && digits.length === 12) return digits;
  if (digits.startsWith('9') && digits.length === 10) return `98${digits}`;
  if (digits.startsWith('09') && digits.length === 11) return `98${digits.slice(1)}`;
  return digits;
}

function parseDate(value: unknown): Date {
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}
