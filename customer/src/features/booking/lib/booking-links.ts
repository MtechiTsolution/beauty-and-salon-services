/** Deep links into the customer booking flow. */
export function bookBranchUrl(branchId: string): string {
  return `/book?branch=${encodeURIComponent(branchId)}`;
}

export function bookServiceUrl(serviceId: string, branchId?: string | null): string {
  const params = new URLSearchParams({ service: serviceId });
  if (branchId?.trim()) params.set('branch', branchId.trim());
  return `/book?${params.toString()}`;
}
