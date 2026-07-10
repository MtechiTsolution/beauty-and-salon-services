import { StarRating } from '@mit-salon/shared/components/StarRating';
import {
  formatBranchRatingSummary,
  type BranchReviewStats,
} from '@mit-salon/shared/lib/salon-review-stats';
import { cn } from '@mit-salon/shared/lib/utils';
import { Star } from 'lucide-react';

type BookingOfferingRatingProps = {
  stats: BranchReviewStats | null | undefined;
  className?: string;
  /** Show star icons + numeric average (default). When false, text summary only. */
  showStars?: boolean;
  /** Prefix e.g. "This service" for prefilled salon step */
  prefix?: string;
};

export function BookingOfferingRating({
  stats,
  className,
  showStars = true,
  prefix,
}: BookingOfferingRatingProps) {
  const label = formatBranchRatingSummary(stats);
  if (!label) return null;

  return (
    <p
      className={cn(
        'customer-booking-offering-rating flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-foreground',
        className,
      )}
    >
      {prefix ? <span className="text-muted-foreground">{prefix}</span> : null}
      {showStars ? (
        <>
          <StarRating value={stats!.averageRating} size="sm" />
          <span>{stats!.averageRating.toFixed(1)}</span>
          <span className="font-normal text-muted-foreground">
            ({stats!.reviewCount} review{stats!.reviewCount === 1 ? '' : 's'})
          </span>
        </>
      ) : (
        <>
          <Star className="h-4 w-4 shrink-0 fill-accent text-accent" aria-hidden />
          <span>{label}</span>
        </>
      )}
    </p>
  );
}
