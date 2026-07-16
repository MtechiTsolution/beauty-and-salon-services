import { BookingCard } from '@/features/my-bookings/components/BookingCard';
import { CancelBookingConfirmDialog } from '@/features/my-bookings/components/CancelBookingConfirmDialog';
import { BookingReviewDialog } from '@/features/my-bookings/components/BookingReviewDialog';
import { useAuth } from '@/features/auth/context/AuthContext';
import { bookingsApi, reviewsApi } from '@mit-salon/shared/api';
import { Button } from '@mit-salon/shared/components/ui/button';
import {
  canReviewBooking,
  getReviewForBooking,
  hasCustomerReviewedBooking,
} from '@mit-salon/shared/lib/booking-reviews';
import { invalidateAllCatalogQueries } from '@mit-salon/shared/lib/catalog-query-keys';
import type { Booking } from '@mit-salon/shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking-detail', bookingId],
    queryFn: () => bookingsApi.get(bookingId!),
    enabled: !!bookingId,
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: () => reviewsApi.list({ customer_email: user!.email }),
    enabled: !!user?.email,
  });

  const cancelBooking = useMutation({
    mutationFn: () => bookingsApi.cancelAsCustomer(booking!.id, user!.email),
    onSuccess: async (updated) => {
      setCancelOpen(false);
      await invalidateAllCatalogQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['booking-detail', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings', user?.email] });
      if (updated.payment_status === 'refunded') {
        toast.success('Booking cancelled — your payment will be refunded');
      } else {
        toast.success('Booking cancelled');
      }
    },
    onError: (err: Error) => toast.error(err.message || 'Could not cancel booking'),
  });

  const review = useMemo(
    () => (booking ? getReviewForBooking(myReviews, booking) : undefined),
    [myReviews, booking],
  );

  const showReviewButton =
    !!booking && canReviewBooking(booking) && !hasCustomerReviewedBooking(myReviews, booking);

  const notFound =
    !isLoading && (isError || !booking || booking.customer_email.toLowerCase() !== user?.email.toLowerCase());

  if (isLoading) {
    return (
      <div className="customer-page flex items-center justify-center py-16">
        <p className="text-muted-foreground">Loading booking…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="customer-page">
        <div className="customer-container-wide py-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-base text-muted-foreground">Booking not found.</p>
          <Button asChild variant="outline" className="mt-5 rounded-full">
            <Link to="/my-bookings">All my bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-page customer-booking-detail-page">
      <div className="customer-container-wide customer-booking-detail-shell">
        <div className="customer-booking-detail-inner">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-3 h-8 gap-1.5 rounded-full px-2.5 text-xs"
          >
            <Link to="/my-bookings">
              <ArrowLeft className="h-3.5 w-3.5" />
              All bookings
            </Link>
          </Button>

          <div className="customer-booking-detail-heading mb-3">
            <h1 className="font-heading text-xl font-bold tracking-tight md:text-2xl">
              Booking details
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
              Appointment confirmation and status
            </p>
          </div>

          <BookingCard
            booking={booking!}
            review={review}
            showReviewButton={showReviewButton}
            onReview={() => setReviewBooking(booking!)}
            onCancel={() => setCancelOpen(true)}
            isCancelling={cancelBooking.isPending}
            dense
          />
        </div>
      </div>

      {reviewBooking && (
        <BookingReviewDialog
          booking={reviewBooking}
          open={!!reviewBooking}
          onOpenChange={(open) => {
            if (!open) {
              setReviewBooking(null);
              queryClient.invalidateQueries({ queryKey: ['booking-detail', bookingId] });
            }
          }}
        />
      )}

      <CancelBookingConfirmDialog
        booking={booking ?? null}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => cancelBooking.mutate()}
        isCancelling={cancelBooking.isPending}
      />
    </div>
  );
}
