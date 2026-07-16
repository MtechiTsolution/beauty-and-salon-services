import type { Booking, BookingPhoto, BookingPhotoKind } from '../types';

export const MAX_BOOKING_PHOTOS_PER_KIND = 8;

/** Photos may be uploaded only once the visit is completed and paid. */
export function canUploadBookingPhotos(booking: Pick<Booking, 'status' | 'payment_status'>): boolean {
  return booking.status === 'completed' && booking.payment_status === 'paid';
}

export function bookingPhotosUnavailableMessage(
  booking: Pick<Booking, 'status' | 'payment_status'>,
): string | null {
  if (canUploadBookingPhotos(booking)) return null;
  if (booking.status === 'cancelled' || booking.status === 'no_show') return null;
  if (booking.status !== 'completed') {
    return 'Photos unlock after the visit is marked completed';
  }
  if (booking.payment_status !== 'paid') {
    return 'Photos unlock once payment is marked paid';
  }
  return null;
}

export function photosByKind(
  photos: BookingPhoto[] | undefined,
  kind: BookingPhotoKind,
): BookingPhoto[] {
  return (photos ?? []).filter((p) => p.kind === kind);
}

export function canAddMorePhotos(
  photos: BookingPhoto[] | undefined,
  kind: BookingPhotoKind,
): boolean {
  return photosByKind(photos, kind).length < MAX_BOOKING_PHOTOS_PER_KIND;
}
