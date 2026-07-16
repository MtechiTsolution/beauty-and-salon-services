import { BookingCard } from '@/features/my-bookings/components/BookingCard';
import { CancelBookingConfirmDialog } from '@/features/my-bookings/components/CancelBookingConfirmDialog';
import { BookingReviewDialog } from '@/features/my-bookings/components/BookingReviewDialog';
import { MyBookingsMobileDateFilter } from '@/features/my-bookings/components/MyBookingsDateFilter';
import { CustomerViewToggle } from '@/features/shared/CustomerViewToggle';
import { useCustomerViewMode } from '@/features/shared/useCustomerViewMode';
import { useMediaQuery } from '@/features/layout/useMediaQuery';
import { useAuth } from '@/features/auth/context/AuthContext';
import { bookingsApi, reviewsApi } from '@mit-salon/shared/api';
import { BookingDateRangeFilterPanel } from '@mit-salon/shared/components/BookingDateRangeFilterPanel';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import {
  canReviewBooking,
  getReviewForBooking,
  hasCustomerReviewedBooking,
} from '@mit-salon/shared/lib/booking-reviews';
import {
  detectBookingDateQuickPreset,
  filterBookingsByDateRange,
  getBookingDateQuickPresetRange,
  hasActiveBookingDateRange,
  isBookingDateRangeValid,
  type BookingDateQuickPreset,
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
  const isWebLayout = useMediaQuery('(min-width: 768px)');
  const useGridLayout = view === 'grid' || isWebLayout;
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedDateRange, setAppliedDateRange] = useState<BookingDateRange>({});
  const [activePreset, setActivePreset] = useState<BookingDateQuickPreset | 'custom' | null>(null);

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

  const pendingReviewBookings = useMemo(
    () => bookings.filter((b) => canReviewBooking(b) && !hasCustomerReviewedBooking(myReviews, b)),
    [bookings, myReviews],
  );

  const filteredBookings = useMemo(
    () => filterBookingsByDateRange(bookings, appliedDateRange),
    [bookings, appliedDateRange],
  );

  const dateFilterActive = hasActiveBookingDateRange(appliedDateRange);

  const selectQuickPreset = (preset: BookingDateQuickPreset) => {
    const range = getBookingDateQuickPresetRange(preset);
    setActivePreset(preset);
    setDateFrom(range.from ?? '');
    setDateTo(range.to ?? '');
    setAppliedDateRange(range);
  };

  const selectCustomPreset = () => {
    setActivePreset('custom');
  };

  const applyCustomDateFilter = () => {
    if (!dateFrom && !dateTo) {
      clearDateFilter();
      return;
    }
    if (!isBookingDateRangeValid(dateFrom, dateTo)) {
      toast.error('Start date must be on or before end date');
      return;
    }
    setActivePreset('custom');
    setAppliedDateRange({
      from: dateFrom || undefined,
      to: dateTo || undefined,
    });
  };

  const applyDateFilter = () => {
    if (!dateFrom && !dateTo) {
      clearDateFilter();
      return;
    }
    if (!isBookingDateRangeValid(dateFrom, dateTo)) {
      toast.error('Start date must be on or before end date');
      return;
    }
    setActivePreset(null);
    setAppliedDateRange({
      from: dateFrom || undefined,
      to: dateTo || undefined,
    });
  };

  const applyDatePreset = (range: BookingDateRange) => {
    setDateFrom(range.from ?? '');
    setDateTo(range.to ?? '');
    setActivePreset(detectBookingDateQuickPreset(range));
    setAppliedDateRange(range);
  };

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
    setAppliedDateRange({});
    setActivePreset(null);
  };

  return (
    <div className="customer-page">
      <div className="customer-container-wide py-12 md:py-16">
        <div className="customer-my-bookings-header flex items-center justify-between gap-3">
          <h1 className="font-heading min-w-0 shrink text-3xl font-bold md:text-4xl">My bookings</h1>
          {bookings.length > 0 && (
            <div className="customer-my-bookings-header__actions flex shrink-0 items-center gap-3">
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                {dateFilterActive
                  ? `${filteredBookings.length} of ${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`
                  : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`}
              </span>
              <CustomerViewToggle view={view} onViewChange={setView} className="md:hidden" />
              <div className="customer-my-bookings-header__filter lg:hidden">
                <MyBookingsMobileDateFilter
                  activePreset={activePreset ?? detectBookingDateQuickPreset(appliedDateRange)}
                  dateFilterActive={dateFilterActive}
                  from={dateFrom}
                  to={dateTo}
                  showClear={dateFilterActive}
                  onPresetSelect={selectQuickPreset}
                  onCustomSelect={selectCustomPreset}
                  onFromChange={setDateFrom}
                  onToChange={setDateTo}
                  onApplyCustom={applyCustomDateFilter}
                  onClear={clearDateFilter}
                />
              </div>
            </div>
          )}
        </div>

        {bookings.length > 0 && (
          <BookingDateRangeFilterPanel
            className="mt-6 hidden lg:block"
            variant="customer"
            idPrefix="my-bookings-date"
            label="Filter by appointment date"
            from={dateFrom}
            to={dateTo}
            appliedRange={appliedDateRange}
            onFromChange={setDateFrom}
            onToChange={setDateTo}
            onApplyCustom={applyDateFilter}
            onPresetApply={applyDatePreset}
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
                    Confirmed, paid visits that are complete — tap <strong>Leave review</strong> on the booking below.
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
              <p className="mt-4 text-lg text-muted-foreground">No appointments in this date range.</p>
              <Button type="button" variant="outline" className="mt-6 rounded-full" onClick={clearDateFilter}>
                Clear date filter
              </Button>
            </CardContent>
          </Card>
        ) : useGridLayout ? (
          <div className="customer-bookings-grid mt-8">
            {filteredBookings.map((b) => {
              const review = getReviewForBooking(myReviews, b);
              const showReviewButton =
                canReviewBooking(b) && !hasCustomerReviewedBooking(myReviews, b);
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
          <div className="mx-auto mt-6 max-w-md space-y-3">
            {filteredBookings.map((b) => {
              const review = getReviewForBooking(myReviews, b);
              const showReviewButton =
                canReviewBooking(b) && !hasCustomerReviewedBooking(myReviews, b);
              return (
                <BookingCard
                  key={b.id}
                  booking={b}
                  review={review}
                  showReviewButton={showReviewButton}
                  onReview={() => setReviewBooking(b)}
                  onCancel={() => setCancelTarget(b)}
                  isCancelling={cancelBooking.isPending && cancelBooking.variables?.id === b.id}
                  dense
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
