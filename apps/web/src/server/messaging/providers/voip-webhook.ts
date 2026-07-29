export type VoipCallDirection = 'inbound' | 'outbound';

export type VoipCallStatus =
  | 'completed'
  | 'missed'
  | 'busy'
  | 'failed'
  | 'no_answer'
  | 'answered'
  | 'ringing';

export type VoipCallEvent = {
  externalId: string;
  direction: VoipCallDirection;
  status: VoipCallStatus;
  fromPhone: string;
  toPhone: string;
  durationSeconds: number;
  agentExtension: string | null;
  recordingUrl: string | null;
  sentAt: Date;
};

const TERMINAL_STATUSES = new Set<VoipCallStatus>([
  'completed',
  'missed',
  'busy',
  'failed',
  'no_answer',
  'answered',
]);

export function parseVoipWebhook(body: unknown): VoipCallEvent[] {
  if (!body) return [];

  const record = normalizeRecord(body);
  if (!record) return [];

  const entries = Array.isArray(record.events)
    ? record.events
    : Array.isArray(record.calls)
      ? record.calls
      : Array.isArray(record.entries)
        ? record.entries
        : [record];

  const results: VoipCallEvent[] = [];

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const row = entry as Record<string, unknown>;
    const status = normalizeStatus(row.status ?? row.callStatus ?? row.state);
    if (!status || !TERMINAL_STATUSES.has(status)) continue;

    const fromPhone = normalizeCallPhone(
      String(row.from ?? row.caller ?? row.src ?? row.source ?? ''),
    );
    const toPhone = normalizeCallPhone(
      String(row.to ?? row.callee ?? row.dst ?? row.destination ?? ''),
    );
    const externalId = String(
      row.callId ?? row.call_id ?? row.id ?? row.uniqueid ?? row.messageid ?? '',
    ).trim();
    if (!externalId || (!fromPhone && !toPhone)) continue;

    const direction = normalizeDirection(row.direction ?? row.type, fromPhone, toPhone);
    const counterparty = direction === 'inbound' ? fromPhone : toPhone || fromPhone;

    results.push({
      externalId,
      direction,
      status,
      fromPhone: fromPhone || counterparty,
      toPhone: toPhone || counterparty,
      durationSeconds: parseDuration(row.duration ?? row.durationSeconds ?? row.talk_time),
      agentExtension: String(row.extension ?? row.agent ?? row.user ?? '').trim() || null,
      recordingUrl: String(row.recordingUrl ?? row.recording ?? row.record_url ?? '').trim() || null,
      sentAt: parseDate(row.timestamp ?? row.date ?? row.startedAt ?? row.created_at),
    });
  }

  return results;
}

export function formatCallSummary(event: VoipCallEvent): string {
  const directionLabel = event.direction === 'inbound' ? 'ورودی' : 'خروجی';
  const statusLabels: Record<VoipCallStatus, string> = {
    completed: 'پاسخ داده شد',
    answered: 'پاسخ داده شد',
    missed: 'بدون پاسخ',
    busy: 'مشغول',
    failed: 'ناموفق',
    no_answer: 'بدون پاسخ',
    ringing: 'در حال زنگ',
  };
  const statusLabel = statusLabels[event.status] ?? event.status;
  const duration =
    event.durationSeconds > 0
      ? ` — ${Math.max(1, Math.round(event.durationSeconds / 60))} دقیقه`
      : '';
  return `تماس ${directionLabel}${duration} — ${statusLabel}`;
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

function normalizeStatus(value: unknown): VoipCallStatus | null {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (!raw) return 'completed';
  if (['complete', 'completed', 'success', 'answered', 'hangup'].includes(raw)) return 'completed';
  if (raw === 'answered') return 'answered';
  if (['missed', 'no_answer', 'noanswer', 'unanswered'].includes(raw)) return 'missed';
  if (['busy', 'rejected'].includes(raw)) return 'busy';
  if (['failed', 'fail', 'error'].includes(raw)) return 'failed';
  if (['ring', 'ringing'].includes(raw)) return 'ringing';
  return null;
}

function normalizeDirection(
  value: unknown,
  fromPhone: string,
  toPhone: string,
): VoipCallDirection {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  if (['inbound', 'incoming', 'in'].includes(raw)) return 'inbound';
  if (['outbound', 'outgoing', 'out'].includes(raw)) return 'outbound';
  return fromPhone && !toPhone ? 'inbound' : 'outbound';
}

function normalizeCallPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('98') && digits.length === 12) return digits;
  if (digits.startsWith('9') && digits.length === 10) return `98${digits}`;
  if (digits.startsWith('09') && digits.length === 11) return `98${digits.slice(1)}`;
  return digits;
}

function parseDuration(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num);
}

function parseDate(value: unknown): Date {
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}
