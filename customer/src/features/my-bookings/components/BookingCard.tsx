import { BookingStatusHighlights } from '@/features/my-bookings/components/BookingStatusHighlights';
import { StarRating } from '@mit-salon/shared/components/StarRating';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { canCustomerCancelBooking } from '@mit-salon/shared/lib/booking-customer';
import { formatBookingAppointmentTime } from '@mit-salon/shared/lib/booking-slots';
import { reviewUnavailableMessage } from '@mit-salon/shared/lib/booking-reviews';
import type { Booking, Review } from '@mit-salon/shared/types';
import { cn } from '@mit-salon/shared/lib/utils';
import { CalendarDays, Clock, MapPin, MessageCircle, Star, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type BookingCardProps = {
  booking: Booking;
  review?: Review;
  showReviewButton: boolean;
  onReview: () => void;
  onCancel?: () => void;
  isCancelling?: boolean;
  compact?: boolean;
};

export function BookingCard({
  booking: b,
  review,
  showReviewButton,
  onReview,
  onCancel,
  isCancelling,
  compact,
}: BookingCardProps) {
  const canCancel = canCustomerCancelBooking(b) && !!onCancel;
  const reviewHint = !showReviewButton && !review ? reviewUnavailableMessage(b) : null;

  return (
    <Card
      className={cn(
        'customer-booking-card customer-card-hover overflow-hidden border-0 shadow-md transition hover:shadow-lg',
        compact && 'h-full',
      )}
    >
      <CardContent
        className={cn(
          'flex h-full flex-col',
          compact ? 'p-5 md:p-5' : 'p-6',
        )}
      >
        <div
          className={cn(
            'booking-card-header flex items-start justify-between gap-3',
            compact && 'min-h-[5rem]',
          )}
        >
          <h3
            className={cn(
              'min-w-0 flex-1 font-heading font-semibold leading-snug',
              compact ? 'line-clamp-2 text-lg' : 'text-xl',
            )}
          >
            {b.service_title}
          </h3>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 self-start rounded-full whitespace-nowrap"
          >
            <Link to={`/messages/booking/${b.id}`}>
              <MessageCircle className="h-4 w-4" />
              Chat with salon
            </Link>
          </Button>
        </div>

        <div className={cn('flex flex-1 flex-col gap-4', compact ? 'mt-4' : 'mt-4')}>
          <BookingStatusHighlights bookingStatus={b.status} paymentStatus={b.payment_status} />

          <div className="booking-price-bar">
            <span className="text-sm font-medium text-muted-foreground">Total amount</span>
            <span className="font-heading text-xl font-bold text-primary md:text-2xl">
              ${b.final_price}
            </span>
          </div>

          <div className="space-y-1.5 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate font-medium text-foreground">{b.branch_name}</span>
            </p>
            <p className="pl-6 text-muted-foreground">{b.employee_name}</p>
            <p className="flex flex-wrap gap-4 pl-6">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CalendarDays className="h-4 w-4 text-primary" />
                {b.date}
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Clock className="h-4 w-4 text-primary" />
                {formatBookingAppointmentTime(b)}
              </span>
            </p>
          </div>

          <div className={cn(compact && 'booking-card-meta min-h-[2.75rem]')}>
            {review && (
              <div className="rounded-xl border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">Your review</p>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating value={review.rating} size="md" />
                  <span className="text-sm font-medium">{review.rating}/5</span>
                </div>
                {review.comment && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            )}

            {showReviewButton && (
              <Button
                type="button"
                size="sm"
                className="w-full gap-1.5 rounded-full sm:w-auto"
                onClick={onReview}
              >
                <Star className="h-4 w-4" />
                Leave review
              </Button>
            )}

            {reviewHint && (
              <p className="text-xs leading-relaxed text-muted-foreground">{reviewHint}</p>
            )}
          </div>
        </div>

        {canCancel && (
          <div className="mt-auto shrink-0 border-t border-border/60 pt-4">
            {(compact || b.payment_status === 'paid') && (
              <p
                className={cn(
                  'mb-3 text-center text-xs text-muted-foreground',
                  compact && 'min-h-[1.25rem]',
                )}
              >
                {b.payment_status === 'paid' ? 'Refund issued if you cancel' : compact ? '\u00a0' : null}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 w-full gap-2 rounded-xl border-destructive/40 text-base text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={isCancelling}
              onClick={onCancel}
            >
              <XCircle className="h-5 w-5" />
              {isCancelling ? 'Cancelling…' : 'Cancel booking'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
