import { BookingStatusHighlights } from '@/features/my-bookings/components/BookingStatusHighlights';
import { StarRating } from '@mit-salon/shared/components/StarRating';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { useFormatMoney } from '@mit-salon/shared/hooks/useCurrency';
import { canCustomerCancelBooking } from '@mit-salon/shared/lib/booking-customer';
import { formatBookingAppointmentTime } from '@mit-salon/shared/lib/booking-slots';
import { reviewUnavailableMessage } from '@mit-salon/shared/lib/booking-reviews';
import { PAYMENT_METHODS } from '@mit-salon/shared/lib/constants';
import type { Booking, BookingStatus, Review } from '@mit-salon/shared/types';
import { cn } from '@mit-salon/shared/lib/utils';
import { format } from 'date-fns';
import {
  CalendarDays,
  Clock,
  CreditCard,
  Images,
  MapPin,
  MessageCircle,
  Star,
  User,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type BookingCardProps = {
  booking: Booking;
  review?: Review;
  showReviewButton: boolean;
  onReview: () => void;
  onCancel?: () => void;
  isCancelling?: boolean;
  /** Equal-height grid card on My Bookings */
  compact?: boolean;
  /** Single booking detail page — compact layout without grid stretch rules */
  dense?: boolean;
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
    eyebrow: 'Cancelled',
    cardClass: 'customer-booking-card--cancelled',
    accentClass: 'customer-booking-card-accent--cancelled',
  },
  no_show: {
    eyebrow: 'Missed visit',
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

/** Photos live on a separate page; these statuses share the same card chrome + Photos CTA. */
function canOpenBookingPhotosPage(status: BookingStatus): boolean {
  return status === 'completed' || status === 'cancelled' || status === 'no_show';
}

export function BookingCard({
  booking: b,
  review,
  showReviewButton,
  onReview,
  onCancel,
  isCancelling,
  compact,
  dense,
}: BookingCardProps) {
  const formatMoney = useFormatMoney();
  const canCancel = canCustomerCancelBooking(b) && !!onCancel;
  const reviewHint = !showReviewButton && !review ? reviewUnavailableMessage(b) : null;
  const stateUi = BOOKING_STATE_UI[b.status];
  const useCompactChrome = Boolean(compact || dense);
  const dateLabel = formatBookingDateLabel(b.date, useCompactChrome);
  const timeLabel = formatBookingAppointmentTime(b);
  const paymentLabel = paymentMethodLabel(b.payment_method);
  const showPhotosLink = canOpenBookingPhotosPage(b.status);
  const hasFooterContent = canCancel || showReviewButton || !!review || !!reviewHint;
  const isTerminal = b.status === 'cancelled' || b.status === 'no_show';
  const showFooter = hasFooterContent || isTerminal;
  const priceLabel = formatMoney(b.final_price, { maximumFractionDigits: 0 });
  const photosHref = `/my-bookings/${b.id}/photos`;

  const footer = (
    <>
      {canCancel && (
        <>
          {b.payment_status === 'paid' && (
            <p className="mb-2 text-center text-xs text-muted-foreground">
              Refund issued if you cancel
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-full gap-1.5 rounded-full border-destructive/30 text-sm font-semibold text-destructive hover:bg-destructive/8 hover:text-destructive"
            disabled={isCancelling}
            onClick={onCancel}
          >
            <XCircle className="h-4 w-4" />
            {isCancelling ? 'Cancelling…' : 'Cancel booking'}
          </Button>
        </>
      )}

      {!canCancel && review && (
        <div className="customer-booking-card-review">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Your review
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <StarRating value={review.rating} size="sm" />
            <span className="text-xs font-semibold text-foreground">{review.rating}/5</span>
          </div>
          {review.comment ? (
            <p
              className={cn(
                'mt-1.5 text-sm leading-relaxed text-muted-foreground',
                useCompactChrome ? 'line-clamp-2' : 'line-clamp-3',
              )}
            >
              {review.comment}
            </p>
          ) : null}
        </div>
      )}

      {!canCancel && !review && showReviewButton && (
        <Button
          type="button"
          size="sm"
          className="h-9 w-full gap-1.5 rounded-full text-sm"
          onClick={onReview}
        >
          <Star className="h-3.5 w-3.5" />
          Leave review
        </Button>
      )}

      {!canCancel && !review && !showReviewButton && reviewHint && (
        <p className="customer-booking-card-hint text-xs leading-relaxed text-muted-foreground">
          {reviewHint}
        </p>
      )}

      {!canCancel && !review && !showReviewButton && !reviewHint && isTerminal && (
        <p className="customer-booking-card-state-note text-xs leading-relaxed text-muted-foreground">
          {b.status === 'cancelled'
            ? b.cancellation_reason?.trim()
              ? b.cancellation_reason.trim()
              : 'This appointment was cancelled and is no longer active.'
            : 'This visit was marked as a no-show.'}
        </p>
      )}
    </>
  );

  const actionButtons = (
    <div
      className={cn(
        'customer-booking-card-actions flex shrink-0',
        useCompactChrome
          ? 'flex-col items-stretch gap-1.5'
          : 'flex-wrap items-center justify-end gap-1.5',
      )}
    >
      {showPhotosLink ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className={cn(
            'customer-booking-card-photos-btn gap-1.5 rounded-full border-border/80 bg-background text-xs font-semibold shadow-sm hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
            useCompactChrome && 'h-8 min-w-[5.75rem] justify-center px-2.5',
          )}
        >
          <a href={photosHref} target="_blank" rel="noopener noreferrer">
            <Images className="h-3.5 w-3.5" />
            Photos
          </a>
        </Button>
      ) : compact ? (
        <span className="h-8 w-full" aria-hidden />
      ) : null}
      <Button
        asChild
        variant="outline"
        size="sm"
        className={cn(
          'customer-booking-card-chat gap-1.5 rounded-full border-border/80 bg-background text-xs font-semibold shadow-sm hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
          useCompactChrome && 'h-8 min-w-[5.75rem] justify-center px-2.5',
        )}
      >
        <Link to={`/messages/booking/${b.id}`}>
          <MessageCircle className="h-3.5 w-3.5" />
          {useCompactChrome ? 'Chat' : 'Chat with salon'}
        </Link>
      </Button>
    </div>
  );

  return (
    <Card
      className={cn(
        'customer-booking-card overflow-hidden border shadow-sm transition hover:shadow-md',
        stateUi.cardClass,
        compact && 'customer-booking-card--grid',
        dense && 'customer-booking-card--dense',
      )}
    >
      <div className={cn('customer-booking-card-accent', stateUi.accentClass)} aria-hidden />
      <CardContent
        className={cn(
          'flex flex-col',
          compact && 'h-full flex-1 gap-3 p-4',
          dense && 'gap-2.5 p-3.5 sm:p-4',
          !useCompactChrome && 'gap-4 p-5 sm:p-6',
        )}
      >
        <header className="customer-booking-card-header min-w-0">
          {useCompactChrome ? (
            <>
              <div className="customer-booking-card-meta flex items-center justify-between gap-2">
                <p className="customer-booking-card-eyebrow">{stateUi.eyebrow}</p>
                <p className="shrink-0 tabular-nums text-sm font-semibold text-muted-foreground">
                  {priceLabel}
                </p>
              </div>
              <div className="customer-booking-card-title-row mt-1 flex items-start justify-between gap-3">
                <h3 className="customer-booking-card-title min-w-0 flex-1 line-clamp-2 text-[0.9375rem] font-semibold leading-snug tracking-tight text-foreground">
                  {b.service_title}
                </h3>
                {actionButtons}
              </div>
            </>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="customer-booking-card-eyebrow">{stateUi.eyebrow}</p>
                <h3 className="mt-1 min-w-0 line-clamp-2 font-heading text-xl font-semibold leading-snug tracking-tight text-foreground md:text-2xl">
                  {b.service_title}
                </h3>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <p className="tabular-nums font-heading text-lg font-semibold text-foreground">
                  {priceLabel}
                </p>
                {actionButtons}
              </div>
            </div>
          )}
        </header>

        <div className={cn(compact && 'customer-booking-card-status')}>
          <BookingStatusHighlights
            bookingStatus={b.status}
            paymentStatus={b.payment_status}
            compact={useCompactChrome}
          />
        </div>

        <div
          className={cn(
            'customer-booking-card-details',
            useCompactChrome ? 'customer-booking-card-details--grid' : null,
          )}
        >
          {useCompactChrome ? (
            <>
              <div className="customer-booking-card-detail-compact">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="line-clamp-1">{b.branch_name}</span>
              </div>
              <div className="customer-booking-card-detail-compact">
                <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="truncate">{b.employee_name}</span>
              </div>
              <div className="customer-booking-card-detail-compact">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span>{dateLabel}</span>
              </div>
              <div className="customer-booking-card-detail-compact">
                <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span>{timeLabel}</span>
              </div>
              {dense && paymentLabel ? (
                <div className="customer-booking-card-detail-compact col-span-2">
                  <CreditCard className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="truncate">{paymentLabel}</span>
                </div>
              ) : null}
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
                  <span className="customer-booking-card-detail-label">
                    <CreditCard className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Paid via
                  </span>
                  <span className="customer-booking-card-detail-value">{paymentLabel}</span>
                </div>
              ) : null}
            </>
          )}
        </div>

        {showFooter ? (
          <div
            className={cn(
              'customer-booking-card-footer',
              compact && 'mt-auto border-t border-border/40 pt-3',
              dense && 'border-t border-border/40 pt-2.5',
              !useCompactChrome && 'border-t border-border/50 pt-4',
            )}
          >
            {footer}
          </div>
        ) : compact ? (
          <div className="mt-auto" aria-hidden />
        ) : null}
      </CardContent>
    </Card>
  );
}
