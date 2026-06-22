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
  'mt-auto h-10 w-full rounded-full text-sm font-semibold shadow-sm sm:h-11 sm:text-base';

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
          'relative shrink-0 overflow-hidden',
          compact ? 'aspect-[4/3] min-h-[14rem] sm:min-h-[16rem]' : 'aspect-[5/3]',
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
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="customer-package-price-badge">${pkg.price.toFixed(0)}</span>
          {pkg.total_sessions > 1 ? (
            <span className="customer-package-savings-badge">{perSession}/session</span>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h3 className="font-heading text-lg font-semibold tracking-tight text-white drop-shadow-sm sm:text-xl">
            {pkg.name}
          </h3>
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col', compact ? 'p-4' : 'p-5 sm:p-6')}>
        <div className="flex flex-wrap gap-2">
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

        <p className="mt-3 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground">
          {pkg.description?.trim() || '\u00A0'}
        </p>

        <p className="mt-2 flex min-h-[1.25rem] items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {locationLabel ? (
            <>
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              {locationLabel}
            </>
          ) : (
            '\u00A0'
          )}
        </p>

        {showBookButton &&
          (bookHref ? (
            <Button asChild className={bookButtonClass}>
              <Link to={bookHref}>Book package</Link>
            </Button>
          ) : (
            <Button type="button" className={bookButtonClass} onClick={onBook}>
              Book package
            </Button>
          ))}
      </div>
    </Card>
  );
}
