export function computeRemainingReceivable(
  total: number,
  paidAmount: number,
): number {
  return Math.max(0, total - paidAmount);
}

export function sumReceivables(
  invoices: { total: number; paidAmount: number }[],
): number {
  return invoices.reduce(
    (sum, inv) => sum + computeRemainingReceivable(inv.total, inv.paidAmount),
    0,
  );
}
