import type { Branch } from '../types';

/** Sort salons by city, then address, then name — stable location-based ordering. */
export function sortBranchesByLocation(branches: Branch[]): Branch[] {
  return [...branches].sort((a, b) => {
    const cityA = (a.city ?? '').trim().toLowerCase();
    const cityB = (b.city ?? '').trim().toLowerCase();
    if (cityA !== cityB) {
      if (!cityA) return 1;
      if (!cityB) return -1;
      return cityA.localeCompare(cityB);
    }
    const addrA = (a.address ?? '').trim().toLowerCase();
    const addrB = (b.address ?? '').trim().toLowerCase();
    if (addrA !== addrB) return addrA.localeCompare(addrB);
    return a.name.localeCompare(b.name);
  });
}

/** Human-readable location label from sorted salon branches (city-first). */
export function formatBranchLocationsLabel(branches: Branch[], maxCities = 3): string | null {
  if (branches.length === 0) return null;
  const sorted = sortBranchesByLocation(branches);
  const cities = [...new Set(sorted.map((b) => b.city?.trim()).filter(Boolean))] as string[];
  if (cities.length === 0) {
    return sorted.length === 1 ? sorted[0].name : `Available at ${sorted.length} salons`;
  }
  const shown = cities.slice(0, maxCities);
  const remaining = cities.length - shown.length;
  const label = shown.join(' · ');
  return remaining > 0 ? `${label} +${remaining} more` : label;
}
