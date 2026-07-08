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
      <div className="customer-service-card-media customer-explore-card__media relative aspect-[16/10] shrink-0 overflow-hidden">
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
      <CardContent className="customer-explore-card__body customer-branch-card-body p-6 text-left">
        <Link to={`/salons/${encodeURIComponent(salon.id)}`} className="group block">
          <div className="grid grid-cols-[1.125rem_minmax(0,1fr)] gap-x-2 gap-y-2">
            <h3 className="customer-explore-card__title col-start-2 font-heading text-xl font-semibold leading-snug transition group-hover:text-primary">
              {salon.name}
            </h3>
            <MapPin className="col-start-1 row-start-2 mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="customer-explore-card__address col-start-2 row-start-2 min-w-0 text-sm leading-relaxed text-muted-foreground">
              {salon.address}
              {salon.city ? `, ${salon.city}` : ''}
            </p>
          </div>
        </Link>
        <BranchNearYouLabel
          distanceKm={salon.distance_km}
          isNearest={isNearest}
          branch={salon}
          className="mt-3"
          variant="compact"
        />
        {ratingLabel ? (
          <p className="customer-salon-card__rating mt-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Star className="h-4 w-4 shrink-0 fill-accent text-accent" aria-hidden />
            {ratingLabel}
          </p>
        ) : null}
        {hours ? (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            {hours}
          </p>
        ) : null}
        <p className="customer-explore-card__description mt-3 line-clamp-2 text-sm text-muted-foreground">
          {salon.description?.trim() || 'View services, packages, and reviews for this salon.'}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="flex-1 rounded-full">
            <Link to={`/salons/${encodeURIComponent(salon.id)}`}>View profile</Link>
          </Button>
          <Button asChild className="flex-1 rounded-full">
            <Link to={bookBranchUrl(salon.id)}>Book here</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
