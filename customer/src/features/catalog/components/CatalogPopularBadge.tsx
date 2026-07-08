import { useFeaturedCatalog } from '@/features/catalog/context/FeaturedCatalogContext';
import { cn } from '@mit-salon/shared/lib/utils';
import { Crown, Sparkles } from 'lucide-react';

type CatalogPopularBadgeProps = {
  entityType: 'service' | 'package' | 'branch';
  entityId: string;
  /** From API `is_featured` — used immediately without waiting for featured-ids fetch. */
  isFeatured?: boolean;
  variant?: 'overlay' | 'chip';
  className?: string;
};

export function CatalogPopularBadge({
  entityType,
  entityId,
  isFeatured,
  variant = 'overlay',
  className,
}: CatalogPopularBadgeProps) {
  const { isFeaturedService, isFeaturedPackage, isFeaturedBranch } = useFeaturedCatalog();
  const fromContext =
    entityType === 'service'
      ? isFeaturedService(entityId)
      : entityType === 'package'
        ? isFeaturedPackage(entityId)
        : isFeaturedBranch(entityId);
  const show = isFeatured === true || (isFeatured !== false && fromContext);

  if (!show) return null;

  const Icon = variant === 'chip' ? Sparkles : Crown;
  const label = entityType === 'branch' ? 'Featured salon' : 'Featured';

  return (
    <span
      className={cn(
        'customer-featured-badge',
        variant === 'overlay' && 'customer-featured-badge--overlay',
        variant === 'chip' && 'customer-featured-badge--chip',
        className,
      )}
      title={
        entityType === 'branch'
          ? 'Featured salon — hand-picked by our team'
          : 'Featured by MIT Salon — hand-picked by our team'
      }
    >
      <Icon className="customer-featured-badge__icon" aria-hidden />
      <span className="customer-featured-badge__label">{label}</span>
    </span>
  );
}
