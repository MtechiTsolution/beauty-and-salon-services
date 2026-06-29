import { BookingStatusHighlights } from '@/features/my-bookings/components/BookingStatusHighlights';
import { StarRating } from '@mit-salon/shared/components/StarRating';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { canCustomerCancelBooking } from '@mit-salon/shared/lib/booking-customer';
import { formatBookingAppointmentTime } from '@mit-salon/shared/lib/booking-slots';
import { reviewUnavailableMessage } from '@mit-salon/shared/lib/booking-reviews';
import { PAYMENT_METHODS } from '@mit-salon/shared/lib/constants';
import type { Booking, BookingStatus, Review } from '@mit-salon/shared/types';
import { cn } from '@mit-salon/shared/lib/utils';
import { format } from 'date-fns';
import { CalendarDays, Clock, MapPin, MessageCircle, Star, User, XCircle } from 'lucide-react';
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

const BOOKING_STATE_UI: Record<
  BookingStatus,
  { eyebrow: string; cardClass: string; accentClass: string }
> = {
  pending: {
    eyebrow: 'Awaiting approval',
    cardClass: 'customer-booking-card--pending',
    accentClass: 'customer-booking-card-accent--pending',
  },
  confirmed: {
    eyebrow: 'Upcoming visit',
    cardClass: 'customer-booking-card--confirmed',
    accentClass: 'customer-booking-card-accent--confirmed',
  },
  completed: {
    eyebrow: 'Completed visit',
    cardClass: 'customer-booking-card--completed',
    accentClass: 'customer-booking-card-accent--completed',
  },
  cancelled: {
    eyebrow: 'Cancelled appointment',
    cardClass: 'customer-booking-card--cancelled',
    accentClass: 'customer-booking-card-accent--cancelled',
  },
  no_show: {
    eyebrow: 'Missed appointment',
    cardClass: 'customer-booking-card--no-show',
    accentClass: 'customer-booking-card-accent--no-show',
  },
};

function formatBookingDateLabel(date: string, short = false): string {
  if (!date) return '—';
  try {
    return format(new Date(`${date}T12:00:00`), short ? 'MMM d, yyyy' : 'EEE, MMM d, yyyy');
  } catch {
    return date;
  }
}

function paymentMethodLabel(method?: string): string | null {
  if (!method) return null;
  return PAYMENT_METHODS.find((m) => m.id === method)?.label ?? method;
}

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
  const stateUi = BOOKING_STATE_UI[b.status];
  const dateLabel = formatBookingDateLabel(b.date, compact);
  const timeLabel = formatBookingAppointmentTime(b);
  const paymentLabel = paymentMethodLabel(b.payment_method);
  const hasFooterContent = canCancel || showReviewButton || !!review || !!reviewHint;
  const isTerminal = b.status === 'cancelled' || b.status === 'no_show';
  const showFooter = compact || hasFooterContent || isTerminal;

  const footer = (
    <>
      {canCancel && (
        <>
          {b.payment_status === 'paid' && (
            <p className="mb-3 text-center text-xs text-muted-foreground">Refund issued if you cancel</p>
          )}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 w-full gap-2 rounded-full border-destructive/35 text-sm font-semibold text-destructive hover:bg-destructive/8 hover:text-destructive sm:h-12 sm:text-base"
            disabled={isCancelling}
            onClick={onCancel}
          >
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            {isCancelling ? 'Cancelling…' : 'Cancel booking'}
          </Button>
        </>
      )}

      {!canCancel && review && (
        <div className="customer-booking-card-review rounded-xl border border-border/60 bg-muted/25 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your review</p>
          <div className="mt-1.5 flex items-center gap-2">
            <StarRating value={review.rating} size="md" />
            <span className="text-sm font-semibold">{review.rating}/5</span>
          </div>
          {review.comment && (
            <p
              className={cn(
                'mt-2 text-sm leading-relaxed text-muted-foreground',
                compact ? 'line-clamp-2' : 'line-clamp-3',
              )}
            >
              {review.comment}
            </p>
          )}
        </div>
      )}

      {!canCancel && !review && showReviewButton && (
        <Button type="button" size="lg" className="h-11 w-full gap-1.5 rounded-full sm:h-12" onClick={onReview}>
          <Star className="h-4 w-4" />
          Leave review
        </Button>
      )}

      {!canCancel && !review && !showReviewButton && reviewHint && (
        <p className="customer-booking-card-hint text-xs leading-relaxed text-muted-foreground">{reviewHint}</p>
      )}

      {!canCancel && !review && !showReviewButton && !reviewHint && isTerminal && (
        <p className="customer-booking-card-state-note text-center text-xs leading-relaxed text-muted-foreground">
          {b.status === 'cancelled'
            ? 'This appointment was cancelled and is no longer active.'
            : 'This visit was marked as a no-show.'}
        </p>
      )}
    </>
  );

  return (
    <Card
      className={cn(
        'customer-booking-card customer-card-hover overflow-hidden border shadow-sm transition hover:shadow-md',
        stateUi.cardClass,
        compact && 'customer-booking-card--grid h-full',
      )}
    >
      <div className={cn('customer-booking-card-accent', stateUi.accentClass)} aria-hidden />
      <CardContent className={cn('flex h-full flex-col', compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6')}>
        <div className={cn('customer-booking-card-top', compact && 'customer-booking-card-top--grid')}>
          <div className="customer-booking-card-top-main min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="customer-booking-card-eyebrow">{stateUi.eyebrow}</p>
              {compact ? (
                <p className="customer-booking-card-price-inline font-heading text-lg font-bold text-primary">
                  ${b.final_price.toFixed(0)}
                </p>
              ) : null}
            </div>
            <h3
              className={cn(
                'font-heading font-semibold leading-snug tracking-tight text-foreground',
                compact ? 'line-clamp-2 text-lg' : 'text-xl md:text-2xl',
              )}
            >
              {b.service_title}
            </h3>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn(
              'customer-booking-card-chat shrink-0 gap-1.5 rounded-full border-primary/20 bg-background/80 text-xs font-semibold sm:text-sm',
              compact && 'customer-booking-card-chat--grid w-full',
            )}
          >
            <Link to={`/messages/booking/${b.id}`}>
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:hidden">Chat</span>
              <span className="hidden sm:inline">Chat with salon</span>
            </Link>
          </Button>
        </div>

        <div className="customer-booking-card-status mt-3 sm:mt-4">
          <BookingStatusHighlights
            bookingStatus={b.status}
            paymentStatus={b.payment_status}
            compact={compact}
          />
        </div>

        <div
          className={cn(
            'customer-booking-card-main mt-3 flex flex-col gap-4 sm:mt-4',
            !compact && 'md:grid md:flex-1 md:grid-cols-[minmax(0,1fr)_11rem] md:items-start md:gap-5 lg:grid-cols-[minmax(0,1fr)_12.5rem]',
          )}
        >
          <div
            className={cn(
              'customer-booking-card-details',
              compact && 'customer-booking-card-details--grid',
            )}
          >
            {compact ? (
              <>
                <div className="customer-booking-card-detail-compact">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span className="line-clamp-2">{b.branch_name}</span>
                </div>
                <div className="customer-booking-card-detail-compact">
                  <User className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span className="truncate">{b.employee_name}</span>
                </div>
                <div className="customer-booking-card-detail-compact">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span>{dateLabel}</span>
                </div>
                <div className="customer-booking-card-detail-compact">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span>{timeLabel}</span>
                </div>
              </>
            ) : (
              <>
                <div className="customer-booking-card-detail-row">
                  <span className="customer-booking-card-detail-label">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Salon
                  </span>
                  <span className="customer-booking-card-detail-value">{b.branch_name}</span>
                </div>
                <div className="customer-booking-card-detail-row">
                  <span className="customer-booking-card-detail-label">
                    <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Stylist
                  </span>
                  <span className="customer-booking-card-detail-value">{b.employee_name}</span>
                </div>
                <div className="customer-booking-card-detail-row">
                  <span className="customer-booking-card-detail-label">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Date
                  </span>
                  <span className="customer-booking-card-detail-value">{dateLabel}</span>
                </div>
                <div className="customer-booking-card-detail-row">
                  <span className="customer-booking-card-detail-label">
                    <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Time
                  </span>
                  <span className="customer-booking-card-detail-value">{timeLabel}</span>
                </div>
                {paymentLabel ? (
                  <div className="customer-booking-card-detail-row">
                    <span className="customer-booking-card-detail-label">Paid via</span>
                    <span className="customer-booking-card-detail-value">{paymentLabel}</span>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {!compact ? (
            <div className="customer-booking-card-price">
              <p className="customer-booking-card-price-label">Total amount</p>
              <p className="customer-booking-card-price-value">${b.final_price.toFixed(2)}</p>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            'customer-booking-card-footer mt-auto',
            compact && 'customer-booking-card-footer--grid',
            !compact && showFooter && 'mt-5 border-t border-border/50 pt-4',
          )}
        >
          {showFooter ? footer : null}
        </div>
      </CardContent>
    </Card>
  );
}
