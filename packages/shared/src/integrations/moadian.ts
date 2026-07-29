/**
 * Moadian (سامانه مؤدیان) payload shape — offline-ready MVP.
 * Live tax API requires fiscal memory cert; this package only models structure.
 */

export type MoadianIntegrationMode = 'export' | 'intermediary' | 'unconfigured';

export interface MoadianHeader {
  /** Invoice datetime ISO */
  indatim: string;
  /** Invoice type: 1=sale */
  inty: number;
  /** Pattern: 1=sale */
  inp: number;
  /** Subject: 1=original */
  inso: number;
  /** Seller TIN (economic / national) */
  tins: string;
  /** Settlement method: 1=cash */
  setm: number;
  /** Buyer TIN optional */
  tinb?: string;
  /** Fiscal memory id placeholder */
  taxid?: string;
}

export interface MoadianBodyLine {
  sstid: string;
  sstt: string;
  am: number;
  fee: number;
  prdis: number;
  dis: number;
  adis: number;
  vra: number;
  vam: number;
  tsstam: number;
}

export interface MoadianPayload {
  header: MoadianHeader;
  body: MoadianBodyLine[];
}

export interface MoadianReadinessItem {
  id: string;
  labelFa: string;
  ok: boolean;
  hintFa?: string;
}

export interface MoadianReadinessResult {
  ready: boolean;
  mode: MoadianIntegrationMode;
  items: MoadianReadinessItem[];
  missingCount: number;
}

export const MOADIAN_STATUS_LABELS: Record<string, string> = {
  NONE: 'بدون وضعیت',
  DRAFT: 'پیش‌نویس مؤدیان',
  READY: 'آماده ارسال',
  SUBMITTED: 'ارسال‌شده / بارگذاری‌شده',
  ACCEPTED: 'پذیرفته‌شده',
  REJECTED: 'ردشده',
};

/** Escapes text for XML attribute/text nodes. */
function xmlEscape(value: string | number | undefined | null): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Offline XML export for intermediary / TPS software.
 * Direct Tax API signing still requires fiscal memory certificate (operator-only).
 */
export function buildMoadianXml(payload: MoadianPayload): string {
  const h = payload.header;
  const lines = payload.body
    .map(
      (line) => `    <BodyLine>
      <sstid>${xmlEscape(line.sstid)}</sstid>
      <sstt>${xmlEscape(line.sstt)}</sstt>
      <am>${xmlEscape(line.am)}</am>
      <fee>${xmlEscape(line.fee)}</fee>
      <prdis>${xmlEscape(line.prdis)}</prdis>
      <dis>${xmlEscape(line.dis)}</dis>
      <adis>${xmlEscape(line.adis)}</adis>
      <vra>${xmlEscape(line.vra)}</vra>
      <vam>${xmlEscape(line.vam)}</vam>
      <tsstam>${xmlEscape(line.tsstam)}</tsstam>
    </BodyLine>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<MoadianInvoice>
  <Header>
    <indatim>${xmlEscape(h.indatim)}</indatim>
    <inty>${xmlEscape(h.inty)}</inty>
    <inp>${xmlEscape(h.inp)}</inp>
    <inso>${xmlEscape(h.inso)}</inso>
    <tins>${xmlEscape(h.tins)}</tins>
    <setm>${xmlEscape(h.setm)}</setm>
    ${h.tinb ? `<tinb>${xmlEscape(h.tinb)}</tinb>` : ''}
    ${h.taxid ? `<taxid>${xmlEscape(h.taxid)}</taxid>` : ''}
  </Header>
  <Body>
${lines}
  </Body>
</MoadianInvoice>
`;
}
