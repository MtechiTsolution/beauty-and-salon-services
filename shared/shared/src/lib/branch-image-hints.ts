import type { Branch } from '../types';

/** Combine branch fields so image resolver can distinguish locations. */
export function branchImageHints(branch: Pick<Branch, 'name' | 'address' | 'city' | 'description'>): string {
  return [branch.name, branch.address, branch.city, branch.description].filter(Boolean).join(' ');
}
