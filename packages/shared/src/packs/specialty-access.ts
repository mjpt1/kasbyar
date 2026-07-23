/** Whether the org may open `/v/[specialtyId]` — exact specialty match only (no pack-wide browsing). */
export function canAccessSpecialtyDashboard(
  orgIndustrySpecialty: string | null | undefined,
  specialtyId: string,
): boolean {
  const chosen = orgIndustrySpecialty?.trim();
  return Boolean(chosen) && chosen === specialtyId;
}
