/** رکوردهای فعال (غیر بایگانی‌شده) */
export const ACTIVE_RECORD_FILTER = { deletedAt: null } as const;

export type TenantEntity =
  | 'customer'
  | 'lead'
  | 'invoice'
  | 'product'
  | 'service'
  | 'pipelineStage'
  | 'practitioner'
  | 'task'
  | 'payment'
  | 'file';
