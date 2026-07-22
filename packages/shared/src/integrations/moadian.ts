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
