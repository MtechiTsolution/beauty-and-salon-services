import {
  BRANCH_IMAGE_POOL,
  CATEGORY_IMAGE_POOL,
  FALLBACK_SALON_PHOTO,
  PACKAGE_IMAGE_POOL,
  SERVICE_IMAGE_POOL,
  STAFF_IMAGE_POOL,
  poolSize,
  uniqueSalonImage,
  type SalonImageKind,
} from './salon-image-pool';

export type EntityImageKind = SalonImageKind;

export function resolveEntityImage(options: {
  src?: string | null;
  kind: EntityImageKind;
  entityId?: string;
  entityName?: string;
  entityDescription?: string;
}): string {
  return resolveEntityImageAtOffset(options, 0);
}

export function resolveEntityImageAtOffset(
  options: {
    src?: string | null;
    kind: EntityImageKind;
    entityId?: string;
    entityName?: string;
    entityDescription?: string;
  },
  offset: number,
): string {
  if (offset === 0) {
    const trimmed = options.src?.trim();
    if (trimmed) return trimmed;
  }

  if (options.entityId) {
    return uniqueSalonImage(options.kind, options.entityId, offset);
  }

  const fallbackSeed = [options.entityName, options.entityDescription].filter(Boolean).join('|') || 'unknown';
  return uniqueSalonImage(options.kind, fallbackSeed, offset);
}

export function defaultEntityImage(kind: EntityImageKind): string {
  if (kind === 'branch') return BRANCH_IMAGE_POOL[0] ?? FALLBACK_SALON_PHOTO;
  if (kind === 'package') return PACKAGE_IMAGE_POOL[0] ?? FALLBACK_SALON_PHOTO;
  if (kind === 'staff') return STAFF_IMAGE_POOL[0] ?? FALLBACK_SALON_PHOTO;
  if (kind === 'category') return CATEGORY_IMAGE_POOL[0] ?? FALLBACK_SALON_PHOTO;
  return SERVICE_IMAGE_POOL[0] ?? FALLBACK_SALON_PHOTO;
}

export function entityImagePoolSize(kind: EntityImageKind): number {
  return poolSize(kind);
}
