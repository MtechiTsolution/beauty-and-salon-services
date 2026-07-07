import { useAuth } from '@/features/auth/context/AuthContext';
import { ServiceReviewDialog } from '@/features/reviews/components/ServiceReviewDialog';
import { bookingsApi, reviewsApi } from '@mit-salon/shared/api';
import { StarRating } from '@mit-salon/shared/components/StarRating';
import { Button } from '@mit-salon/shared/components/ui/button';
import {
  canReviewService,
  hasReviewForService,
  serviceRatingSummary,
  serviceReviewUnavailableMessage,
} from '@mit-salon/shared/lib/service-reviews';
import type { Review, Service } from '@mit-salon/shared/types';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

type ServiceCardReviewsProps = {
  service: Service;
  reviews: Review[];
  className?: string;
};

export function ServiceCardReviews({ service, reviews, className }: ServiceCardReviewsProps) {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: myBookings = [] } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: () => bookingsApi.filter({ customer_email: user!.email }),
    enabled: !!user?.email,
  });

  const { data: customerReviews = [] } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: () => reviewsApi.list({ customer_email: user!.email }),
    enabled: !!user?.email,
  });

  const summary = useMemo(() => serviceRatingSummary(reviews, service.id), [reviews, service.id]);

  const canReview = useMemo(() => {
    if (!user?.email) return false;
    return canReviewService(myBookings, customerReviews, service.id, user.email);
  }, [user?.email, myBookings, customerReviews, service.id]);

  const alreadyReviewed = useMemo(() => {
    if (!user?.email) return false;
    return hasReviewForService(customerReviews, user.email, service.id);
  }, [user?.email, customerReviews, service.id]);

  const unavailableMessage = useMemo(() => {
    if (!user?.email || alreadyReviewed) return null;
    return serviceReviewUnavailableMessage(myBookings, customerReviews, service.id, user.email);
  }, [user?.email, alreadyReviewed, myBookings, customerReviews, service.id]);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {summary.count > 0 ? (
          <>
            <StarRating value={summary.average} size="sm" />
            <span className="font-medium text-foreground">{summary.average.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({summary.count} review{summary.count === 1 ? '' : 's'})
            </span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Star className="h-4 w-4" />
            No reviews yet
          </span>
        )}
      </div>

      {user?.email ? (
        <div className="mt-3">
          {canReview ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-full rounded-full text-sm"
              onClick={() => setDialogOpen(true)}
            >
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Leave a review
            </Button>
          ) : alreadyReviewed ? (
            <p className="text-center text-xs text-muted-foreground">You reviewed this service</p>
          ) : unavailableMessage ? (
            <p className="text-center text-xs leading-relaxed text-muted-foreground">{unavailableMessage}</p>
          ) : null}
        </div>
      ) : null}

      {dialogOpen ? (
        <ServiceReviewDialog service={service} open={dialogOpen} onOpenChange={setDialogOpen} />
      ) : null}
    </div>
  );
}
