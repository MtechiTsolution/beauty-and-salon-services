import { BookingCard } from '@/features/my-bookings/components/BookingCard';
import { CancelBookingConfirmDialog } from '@/features/my-bookings/components/CancelBookingConfirmDialog';
import { BookingReviewDialog } from '@/features/my-bookings/components/BookingReviewDialog';
import { CustomerViewToggle } from '@/features/shared/CustomerViewToggle';
import { useCustomerViewMode } from '@/features/shared/useCustomerViewMode';
import { useAuth } from '@/features/auth/context/AuthContext';
import { bookingsApi, reviewsApi } from '@mit-salon/shared/api';
import { BookingDateRangeFilter } from '@mit-salon/shared/components/BookingDateRangeFilter';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { canReviewBooking, hasReviewForBooking } from '@mit-salon/shared/lib/booking-reviews';
import {
  filterBookingsByDateRange,
  hasActiveBookingDateRange,
  isBookingDateRangeValid,
  type BookingDateRange,
} from '@mit-salon/shared/lib/booking-date-filter';
import { invalidateAllCatalogQueries } from '@mit-salon/shared/lib/catalog-query-keys';
import type { Booking } from '@mit-salon/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarDays, FilterX, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [view, setView] = useCustomerViewMode('my-bookings', 'grid');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedDateRange, setAppliedDateRange] = useState<BookingDateRange>({});

  const { data: bookings = [] } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: () => bookingsApi.filter({ customer_email: user!.email }),
    enabled: !!user?.email,
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: () => reviewsApi.list({ customer_email: user!.email }),
    enabled: !!user?.email,
  });

  const cancelBooking = useMutation({
    mutationFn: (booking: Booking) => bookingsApi.cancelAsCustomer(booking.id, user!.email),
    onSuccess: async (updated) => {
      setCancelTarget(null);
      await invalidateAllCatalogQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['my-bookings', user?.email] });
      if (updated.payment_status === 'refunded') {
        toast.success('Booking cancelled — your payment will be refunded');
      } else {
        toast.success('Booking cancelled');
      }
    },
    onError: (err: Error) => toast.error(err.message || 'Could not cancel booking'),
  });

  const reviewByBookingId = useMemo(() => {
    const map = new Map<string, (typeof myReviews)[0]>();
    for (const r of myReviews) {
      if (r.booking_id) map.set(r.booking_id, r);
    }
    return map;
  }, [myReviews]);

  const pendingReviewBookings = useMemo(
    () => bookings.filter((b) => canReviewBooking(b) && !hasReviewForBooking(myReviews, b.id)),
    [bookings, myReviews],
  );

  const filteredBookings = useMemo(
    () => filterBookingsByDateRange(bookings, appliedDateRange),
    [bookings, appliedDateRange],
  );

  const dateFilterActive = hasActiveBookingDateRange(appliedDateRange);

  const applyDateFilter = () => {
    if (!dateFrom && !dateTo) {
      setAppliedDateRange({});
      return;
    }
    if (!isBookingDateRangeValid(dateFrom, dateTo)) {
      toast.error('Start date must be on or before end date');
      return;
    }
    setAppliedDateRange({
      from: dateFrom || undefined,
      to: dateTo || undefined,
    });
  };

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
    setAppliedDateRange({});
  };

  return (
    <div className="customer-page">
      <div className="customer-container-wide py-12 md:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold md:text-4xl">My bookings</h1>
            <p className="mt-2 text-muted-foreground">
              Manage appointments, chat with your salon, and leave reviews for completed visits with confirmed payment.
            </p>
          </div>
          {bookings.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {dateFilterActive
                  ? `${filteredBookings.length} of ${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`
                  : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`}
              </span>
              <CustomerViewToggle view={view} onViewChange={setView} />
            </div>
          )}
        </div>

        {bookings.length > 0 && (
          <BookingDateRangeFilter
            className="mt-6"
            variant="customer"
            idPrefix="my-bookings-date"
            from={dateFrom}
            to={dateTo}
            onFromChange={setDateFrom}
            onToChange={setDateTo}
            onApply={applyDateFilter}
            onClear={clearDateFilter}
            showClear={dateFilterActive}
          />
        )}

        {pendingReviewBookings.length > 0 && (
          <Card className="mt-6 border-primary/30 bg-primary/5 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                </div>
                <div>
                  <p className="font-semibold">
                    {pendingReviewBookings.length} visit{pendingReviewBookings.length !== 1 ? 's' : ''} ready to review
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completed and paid — tap <strong>Leave review</strong> on the booking below.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                className="shrink-0 rounded-full"
                onClick={() => setReviewBooking(pendingReviewBookings[0])}
              >
                Review latest visit
              </Button>
            </CardContent>
          </Card>
        )}

        {bookings.length === 0 ? (
          <Card className="mt-10 border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">No bookings yet.</p>
              <Button asChild className="mt-6 rounded-full" size="lg">
                <Link to="/book">Book your first visit</Link>
              </Button>
            </CardContent>
          </Card>
        ) : filteredBookings.length === 0 ? (
          <Card className="mt-10 border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <FilterX className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">No bookings in this date range.</p>
              <Button type="button" variant="outline" className="mt-6 rounded-full" onClick={clearDateFilter}>
                Clear date filter
              </Button>
            </CardContent>
          </Card>
        ) : view === 'grid' ? (
          <div className="customer-bookings-grid mt-8">
            {filteredBookings.map((b) => {
              const review = reviewByBookingId.get(b.id);
              const showReviewButton =
                canReviewBooking(b) && !hasReviewForBooking(myReviews, b.id);
              return (
                <BookingCard
                  key={b.id}
                  booking={b}
                  review={review}
                  showReviewButton={showReviewButton}
                  onReview={() => setReviewBooking(b)}
                  onCancel={() => setCancelTarget(b)}
                  isCancelling={cancelBooking.isPending && cancelBooking.variables?.id === b.id}
                  compact
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {filteredBookings.map((b) => {
              const review = reviewByBookingId.get(b.id);
              const showReviewButton =
                canReviewBooking(b) && !hasReviewForBooking(myReviews, b.id);
              return (
                <BookingCard
                  key={b.id}
                  booking={b}
                  review={review}
                  showReviewButton={showReviewButton}
                  onReview={() => setReviewBooking(b)}
                  onCancel={() => setCancelTarget(b)}
                  isCancelling={cancelBooking.isPending && cancelBooking.variables?.id === b.id}
                />
              );
            })}
          </div>
        )}
      </div>

      {reviewBooking && (
        <BookingReviewDialog
          booking={reviewBooking}
          open={!!reviewBooking}
          onOpenChange={(open) => !open && setReviewBooking(null)}
        />
      )}

      <CancelBookingConfirmDialog
        booking={cancelTarget}
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        onConfirm={() => cancelTarget && cancelBooking.mutate(cancelTarget)}
        isCancelling={cancelBooking.isPending}
      />
    </div>
  );
}
