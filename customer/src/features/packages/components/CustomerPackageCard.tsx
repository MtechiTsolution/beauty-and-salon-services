import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card } from '@mit-salon/shared/components/ui/card';
import { cn } from '@mit-salon/shared/lib/utils';
import type { Package } from '@mit-salon/shared/types';
import { CalendarDays, Layers, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

type CustomerPackageCardProps = {
  pkg: Package;
  locationLabel?: string | null;
  showBookButton?: boolean;
  bookHref?: string;
  onBook?: () => void;
  compact?: boolean;
  className?: string;
};

function pricePerSession(pkg: Package): string {
  if (!pkg.total_sessions) return '—';
  return `$${(pkg.price / pkg.total_sessions).toFixed(0)}`;
}

const bookButtonClass =
  'mt-auto h-9 w-full rounded-full text-sm font-semibold shadow-sm sm:h-10';

export function CustomerPackageCard({
  pkg,
  locationLabel,
  showBookButton = true,
  bookHref,
  onBook,
  compact = false,
  className,
}: CustomerPackageCardProps) {
  const perSession = pricePerSession(pkg);

  return (
    <Card
      className={cn(
        'customer-package-card group flex h-full flex-col overflow-hidden border-border/70 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className,
      )}
    >
      <div
        className={cn(
          'customer-package-card__media relative shrink-0 overflow-hidden',
          compact ? 'aspect-[5/3] min-h-[10.5rem] sm:min-h-[11.5rem]' : 'aspect-[5/3]',
        )}
      >
        <CoverImage
          src={pkg.image_url}
          alt={pkg.name}
          kind="package"
          entityId={pkg.id}
          entityName={pkg.name}
          entityDescription={pkg.description}
          loading={compact ? 'eager' : 'lazy'}
          fetchPriority={compact ? 'high' : 'auto'}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent sm:from-black/75 sm:via-black/20" />
        <div className="customer-package-card__badges absolute left-3 top-3 flex flex-wrap items-center gap-1.5 sm:left-4 sm:top-4 sm:gap-2">
          <span className="customer-package-price-badge">${pkg.price.toFixed(0)}</span>
          {pkg.total_sessions > 1 ? (
            <span className="customer-package-savings-badge">{perSession}/session</span>
          ) : null}
        </div>
        <div className="customer-package-card__title-wrap absolute inset-x-0 bottom-0 p-2.5 sm:p-4">
          <h3 className="customer-package-card__title font-heading text-base font-semibold tracking-tight text-white drop-shadow-sm sm:text-lg">
            {pkg.name}
          </h3>
        </div>
      </div>

      <div
        className={cn(
          'customer-package-card__body flex flex-1 flex-col',
          compact ? 'p-3.5 sm:p-4' : 'p-5 sm:p-6',
        )}
      >
        <div className="customer-package-chips flex gap-1.5 sm:flex-wrap sm:gap-2">
          <span className="customer-package-chip">
            <Layers className="h-3.5 w-3.5" />
            {pkg.total_sessions} session{pkg.total_sessions === 1 ? '' : 's'}
          </span>
          <span className="customer-package-chip">
            <CalendarDays className="h-3.5 w-3.5" />
            {pkg.validity_days} days
          </span>
          <span className="customer-package-chip customer-package-chip--accent">
            <Sparkles className="h-3.5 w-3.5" />
            Bundle
          </span>
        </div>

        <p className="customer-package-card__desc mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {pkg.description?.trim() || '\u00A0'}
        </p>

        {locationLabel ? (
          <p className="customer-package-card__location mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="min-w-0 truncate">{locationLabel}</span>
          </p>
        ) : (
          <p className="customer-package-card__location mt-2 min-h-[1.25rem] sm:min-h-[1.25rem]" aria-hidden>
            {'\u00A0'}
          </p>
        )}

        {showBookButton &&
          (bookHref ? (
            <Button asChild className={cn(bookButtonClass, 'customer-package-card__cta')}>
              <Link to={bookHref}>Book package</Link>
            </Button>
          ) : (
            <Button type="button" className={cn(bookButtonClass, 'customer-package-card__cta')} onClick={onBook}>
              Book package
            </Button>
          ))}
      </div>
    </Card>
  );
}
