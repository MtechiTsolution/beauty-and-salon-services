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
      <div className="customer-page flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading booking…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="customer-page">
        <div className="customer-container-wide py-16 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">Booking not found.</p>
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link to="/my-bookings">All my bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-page">
      <div className="customer-container-wide py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-6 gap-2 rounded-full"
          >
            <Link to="/my-bookings">
              <ArrowLeft className="h-4 w-4" />
              All bookings
            </Link>
          </Button>

          <div className="mb-6 text-center">
            <h1 className="font-heading text-3xl font-bold md:text-4xl">Booking details</h1>
            <p className="mt-2 text-muted-foreground">Your appointment confirmation and status</p>
          </div>

          <BookingCard
            booking={booking!}
            review={review}
            showReviewButton={showReviewButton}
            onReview={() => setReviewBooking(booking!)}
            onCancel={() => setCancelOpen(true)}
            isCancelling={cancelBooking.isPending}
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
