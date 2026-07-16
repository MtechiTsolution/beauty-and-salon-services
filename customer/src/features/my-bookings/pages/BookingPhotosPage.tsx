import { useAuth } from '@/features/auth/context/AuthContext';
import { bookingsApi } from '@mit-salon/shared/api';
import { BookingPhotosPanel } from '@mit-salon/shared/components/BookingPhotosPanel';
import { Button } from '@mit-salon/shared/components/ui/button';
import {
  bookingPhotosUnavailableMessage,
  canUploadBookingPhotos,
} from '@mit-salon/shared/lib/booking-photos';
import type { Booking } from '@mit-salon/shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Images } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function BookingPhotosPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking-detail', bookingId],
    queryFn: () => bookingsApi.get(bookingId!),
    enabled: !!bookingId,
  });

  const notFound =
    !isLoading &&
    (isError || !booking || booking.customer_email.toLowerCase() !== user?.email.toLowerCase());

  if (isLoading) {
    return (
      <div className="customer-page flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading photos…</p>
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

  const canEdit = canUploadBookingPhotos(booking!);
  const unavailableMessage = bookingPhotosUnavailableMessage(booking!);
  const hasPhotos = (booking!.photos?.length ?? 0) > 0;

  return (
    <div className="customer-page">
      <div className="customer-container-wide py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <Button asChild variant="ghost" size="sm" className="mb-6 gap-2 rounded-full">
            <Link to="/my-bookings">
              <ArrowLeft className="h-4 w-4" />
              All bookings
            </Link>
          </Button>

          <div className="mb-6 flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Images className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="font-heading text-2xl font-bold md:text-3xl">Before & after photos</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{booking!.service_title}</span>
                <span className="mx-1.5 text-border">·</span>
                {booking!.date}
                <span className="mx-1.5 text-border">·</span>
                {booking!.branch_name}
              </p>
            </div>
          </div>

          {canEdit || hasPhotos ? (
            <BookingPhotosPanel
              booking={booking!}
              onChanged={(photos) => {
                queryClient.setQueryData(['booking-detail', bookingId], (prev: Booking | undefined) =>
                  prev ? { ...prev, photos } : prev,
                );
                void queryClient.invalidateQueries({ queryKey: ['my-bookings', user?.email] });
              }}
            />
          ) : (
            <div className="rounded-xl border border-border/60 bg-muted/20 px-5 py-10 text-center">
              <Images className="mx-auto h-10 w-10 text-muted-foreground/70" aria-hidden />
              <p className="mt-3 text-sm font-medium text-foreground">No photos for this visit</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {unavailableMessage ??
                  'Photos can be added after a completed, paid appointment.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
