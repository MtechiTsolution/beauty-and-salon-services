import { useState } from 'react';
import {
  defaultEntityImage,
  entityImagePoolSize,
  resolveEntityImageAtOffset,
  type EntityImageKind,
} from '../lib/entity-image';
import { mobileImageUrl } from '../lib/salon-image-pool';
import { cn } from '../lib/utils';

type CoverImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  /** @deprecated Use `kind` — kept for backward compatibility */
  fallback?: 'service' | 'branch' | 'package' | 'staff' | 'category';
  kind?: EntityImageKind;
  entityId?: string;
  entityName?: string;
  entityDescription?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  decoding?: 'async' | 'sync' | 'auto';
};

function resolveKind(fallback: CoverImageProps['fallback'], kind?: EntityImageKind): EntityImageKind {
  if (kind) return kind;
  if (fallback === 'branch') return 'branch';
  if (fallback === 'package') return 'package';
  if (fallback === 'staff') return 'staff';
  if (fallback === 'category') return 'category';
  return 'service';
}

export function CoverImage({
  src,
  alt,
  className,
  fallback = 'service',
  kind,
  entityId,
  entityName,
  entityDescription,
  loading = 'lazy',
  fetchPriority = 'auto',
  decoding = 'async',
}: CoverImageProps) {
  const imageKind = resolveKind(fallback, kind);
  const [offset, setOffset] = useState(0);
  const resolved = resolveEntityImageAtOffset(
    {
      src,
      kind: imageKind,
      entityId,
      entityName,
      entityDescription,
    },
    offset,
  );
  const maxOffset = entityImagePoolSize(imageKind);
  const ultimateFallback = defaultEntityImage(imageKind);
  const displaySrc = loading === 'eager' && resolved.startsWith('http') ? mobileImageUrl(resolved) : resolved;
  const displayFallback =
    loading === 'eager' && ultimateFallback.startsWith('http') ? mobileImageUrl(ultimateFallback) : ultimateFallback;

  const objectClass =
    imageKind === 'branch' || imageKind === 'staff'
      ? 'object-cover object-center'
      : 'object-cover';

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={cn('block h-full w-full', objectClass, className)}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={decoding}
      sizes={loading === 'eager' ? '100vw' : undefined}
      onError={(e) => {
        const img = e.currentTarget;
        if (offset < maxOffset - 1) {
          setOffset((current) => current + 1);
          return;
        }
        if (img.src !== displayFallback) {
          img.src = displayFallback;
        }
      }}
    />
  );
}
