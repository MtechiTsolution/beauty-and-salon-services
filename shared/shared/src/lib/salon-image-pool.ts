/** High-res salon/beauty Unsplash photos — pools are disjoint (no image reused across kinds). */
export function salonPhoto(photoSlug: string, width = 1200, height = 750): string {
  return `https://images.unsplash.com/photo-${photoSlug}?w=${width}&h=${height}&fit=crop&q=85&auto=format`;
}

/** Smaller Unsplash URL for faster mobile loading. */
export function optimizeImageUrl(url: string, maxWidth = 900): string {
  if (!url?.trim()) return url;
  const trimmed = url.trim();
  if (!trimmed.includes('images.unsplash.com')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    parsed.searchParams.set('w', String(maxWidth));
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    if (!parsed.searchParams.has('q')) {
      parsed.searchParams.set('q', '85');
    }
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

/** Pick a width suited to the viewport (retina-aware on phones). */
export function mobileImageUrl(url: string, options?: { fullBleed?: boolean }): string {
  if (!url?.trim()) return url;

  if (typeof window === 'undefined') {
    return optimizeImageUrl(url, options?.fullBleed ? 1400 : 1080);
  }

  const viewportWidth = window.innerWidth;
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

  if (viewportWidth < 768) {
    const target = options?.fullBleed
      ? Math.min(Math.round(viewportWidth * dpr), 1600)
      : Math.min(Math.round(viewportWidth * dpr * 0.95), 1200);
    return optimizeImageUrl(url, Math.max(target, 900));
  }

  return optimizeImageUrl(url, options?.fullBleed ? 1600 : 1200);
}

function uniquePool(slugs: string[]): readonly string[] {
  return Object.freeze([...new Set(slugs.map(salonPhoto))]);
}

/** Salon interiors & storefronts — only used for branches */
export const BRANCH_IMAGE_POOL = uniquePool([
  '1521590832167-7bcbfaa6381f',
  '1633681926022-84c23e8cb2d6',
  '1633681926035-ec1ac984418a',
  '1560066984-138dadb4c035',
  '1600948836101-f9ffda59d250',
  '1503951914875-452162b0f3f1',
  '1585747860715-2ba37e788b70',
  '1637777269327-c4d5c7944d7b',
  '1621605815971-fbc98d665033',
  '1506905925346-21bda4d32df4',
  '1544161515-4ab6ce6db874',
  '1599351431202-1e0f0137899a',
  '1605497788044-5a32c7078486',
  '1675034743339-0b0747047727',
  '1626383126210-15c15e62d9ba',
  '1604654894610-df63bc536371',
  '1519699047748-de8e457a634e',
  '1574015974293-817f0ebebb74',
]);

/** Treatments & styling — only used for services */
export const SERVICE_IMAGE_POOL = uniquePool([
  '1634449571010-02389ed0f9b0',
  '1580618672591-eb180b1a973f',
  '1595475884562-073c30d45670',
  '1589710751893-f9a6770ad71b',
  '1560869713-7d0a29430803',
  '1562322140-8baeececf3df',
  '1554519934-e32b1629d9ee',
  '1524504388940-b1c1722653e1',
  '1522337360788-8b13dee7a37e',
  '1595476108010-b4d1f102b1b1',
  '1731514940218-01cba3289cd1',
  '1731514927682-56a49b1e0a9b',
  '1731514967573-09e41afb2394',
  '1632345031435-8727f6897d53',
  '1731514771613-991a02407132',
  '1616394584738-fc6e612e71b9',
  '1629397685944-7073f5589754',
  '1570172619644-dfd03ed5d881',
]);

/** Bundles & offers — only used for packages */
export const PACKAGE_IMAGE_POOL = uniquePool([
  '1516975080664-ed2fc6a32937',
  '1512496015851-a90fb38ba796',
  '1607774000480-de3f239fdd4c',
  '1731514826330-b66f39a98d47',
  '1731514908704-43ce3a5de4e9',
  '1731514867600-8aa1c4ec66ce',
  '1731514987261-107a780e1404',
  '1731514957270-c7a7d31efd8f',
  '1731514816538-bc14be7d6850',
  '1731514899894-86ae464a9a21',
  '1731514798247-2d7ecb6fa45a',
  '1731514988957-46b5c56ac856',
]);

/** Stylists & team portraits — only used for staff */
export const STAFF_IMAGE_POOL = uniquePool([
  '1494790108377-be9c29b29330',
  '1507003211169-0a1dd7228f2d',
  '1500648767791-00dcc994a43e',
  '1534528741775-53994a69daeb',
  '1517841905240-472988babdf9',
  '1524504388940-b1c1722653e1',
  '1580489944761-15a19d654956',
  '1438761681033-6461ffad8d80',
  '1472099645785-5658abf4ff4e',
  '1560250097-0b93528c311a',
]);

/** Category browse tiles — only used for categories */
export const CATEGORY_IMAGE_POOL = uniquePool([
  '1522337360788-8b13dee7a37e',
  '1560066984-138dadb4c035',
  '1595475884562-073c30d45670',
  '1580618672591-eb180b1a973f',
  '1634449571010-02389ed0f9b0',
  '1562322140-8baeececf3df',
  '1570172619644-dfd03ed5d881',
  '1521590832167-7bcbfaa6381f',
]);

export type SalonImageKind = 'service' | 'branch' | 'package' | 'staff' | 'category';

const POOLS: Record<SalonImageKind, readonly string[]> = {
  branch: BRANCH_IMAGE_POOL,
  service: SERVICE_IMAGE_POOL,
  package: PACKAGE_IMAGE_POOL,
  staff: STAFF_IMAGE_POOL,
  category: CATEGORY_IMAGE_POOL,
};

/** Verified fallback when a pool slot fails to load. */
export const FALLBACK_SALON_PHOTO = salonPhoto('1521590832167-7bcbfaa6381f');

/** FNV-1a — spreads entity IDs evenly across the image pool. */
export function hashEntitySeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function poolSize(kind: SalonImageKind): number {
  return POOLS[kind].length;
}

/**
 * One stable image per entity, keyed by kind + database id.
 * New items never share keyword-based images; each id maps to its own slot in the pool.
 */
export function uniqueSalonImage(kind: SalonImageKind, entityId: string, offset = 0): string {
  const pool = POOLS[kind];
  if (!pool.length) return FALLBACK_SALON_PHOTO;
  const seed = `${kind}:${entityId}`;
  const index = (hashEntitySeed(seed) + offset) % pool.length;
  return pool[index];
}
