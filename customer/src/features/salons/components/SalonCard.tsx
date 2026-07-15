import { bookBranchUrl } from '@/features/booking/lib/booking-links';
import { BranchNearYouLabel } from '@/features/location/components/BranchNearYouLabel';
import { CatalogPopularBadge } from '@/features/catalog/components/CatalogPopularBadge';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import type { BranchWithDistance } from '@mit-salon/shared/lib/branch-distance';
import { formatBranchRatingSummary, type BranchReviewStats } from '@mit-salon/shared/lib/salon-review-stats';
import { cn } from '@mit-salon/shared/lib/utils';
import { Clock, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatSalonHours } from '@/features/salons/lib/salon-profile';

type SalonCardProps = {
  salon: BranchWithDistance;
  isNearest?: boolean;
  reviewStats?: BranchReviewStats | null;
  className?: string;
};

export function SalonCard({ salon, isNearest = false, reviewStats = null, className }: SalonCardProps) {
  const hours = formatSalonHours(salon.opening_time, salon.closing_time);
  const ratingLabel = formatBranchRatingSummary(reviewStats);

  return (
    <Card className={cn('customer-explore-card customer-card-hover overflow-hidden border-0 shadow-md', className)}>
      <div className="customer-service-card-media customer-explore-card__media relative aspect-[2/1] shrink-0 overflow-hidden">
        <Link to={`/salons/${encodeURIComponent(salon.id)}`} className="block h-full">
          <CoverImage
            src={salon.image_url}
            alt={salon.name}
            kind="branch"
            entityId={salon.id}
            entityName={salon.name}
            entityDescription={branchImageHints(salon)}
            className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
          />
        </Link>
        <BranchNearYouLabel
          distanceKm={salon.distance_km}
          isNearest={isNearest}
          branch={salon}
          className="landing-showcase-card__nearby-badge"
        />
        {salon.is_featured ? (
          <CatalogPopularBadge
            entityType="branch"
            entityId={salon.id}
            isFeatured
            variant="overlay"
            className="landing-showcase-card__featured-badge"
          />
        ) : null}
      </div>
      <CardContent className="customer-explore-card__body customer-branch-card-body p-3.5 text-left md:p-4">
        <Link to={`/salons/${encodeURIComponent(salon.id)}`} className="group block">
          <div className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-1.5 gap-y-1">
            <h3 className="customer-explore-card__title col-start-2 font-heading text-base font-semibold leading-snug transition group-hover:text-primary md:text-[1.05rem]">
              {salon.name}
            </h3>
            <MapPin className="col-start-1 row-start-2 mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="customer-explore-card__address col-start-2 row-start-2 min-w-0 text-xs leading-snug text-muted-foreground md:text-[0.8125rem]">
              {salon.address}
              {salon.city ? `, ${salon.city}` : ''}
            </p>
          </div>
        </Link>
        {ratingLabel ? (
          <p className="customer-salon-card__rating mt-1.5 flex items-center gap-1 text-xs font-medium text-foreground md:text-sm">
            <Star className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" aria-hidden />
            {ratingLabel}
          </p>
        ) : null}
        {hours ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
            <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
            {hours}
          </p>
        ) : null}
        <p className="customer-explore-card__description mt-2 line-clamp-2 text-xs text-muted-foreground md:text-sm">
          {salon.description?.trim() || 'View services, packages, and reviews for this salon.'}
        </p>
        <div className="mt-3 flex flex-col gap-1.5 sm:flex-row">
          <Button asChild variant="outline" size="sm" className="h-8 flex-1 rounded-full text-xs">
            <Link to={`/salons/${encodeURIComponent(salon.id)}`}>View profile</Link>
          </Button>
          <Button asChild size="sm" className="h-8 flex-1 rounded-full text-xs">
            <Link to={bookBranchUrl(salon.id)}>Book here</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
