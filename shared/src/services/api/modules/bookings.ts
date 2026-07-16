import { assertSlotNotInPast, assertStaffSlotAvailable } from '../../../lib/booking-slots';
import type { SalonScopeParams } from '../../../lib/salon-scope';
import { apiRequest } from '../client';
import { createRestCrudApi } from './rest-crud';
import type { Booking, BookingPhoto, BookingPhotoKind } from '../../../types';

export type CreateBookingPayload = Omit<Booking, 'id' | 'created_at' | 'updated_at'> & {
  booking_source?: 'phone' | 'walk_in';
};

const crud = createRestCrudApi<Booking>('bookings');

export const bookingsApi = {
  ...crud,
  async list(params?: SalonScopeParams): Promise<Booking[]> {
    return bookingsApi.filter(params ?? {});
  },
  async create(data: CreateBookingPayload): Promise<Booking> {
    assertSlotNotInPast(data.date, data.time_slot);

    const existing = await bookingsApi.filter({
      date: data.date,
      employee_id: data.employee_id,
    });

    assertStaffSlotAvailable(
      data.employee_id,
      data.date,
      data.time_slot,
      data.duration_minutes,
      existing,
    );

    return crud.create(data);
  },
  async filter(params: {
    customer_email?: string;
    date?: string;
    employee_id?: string;
    status?: string;
    branch_id?: string;
  }): Promise<Booking[]> {
    const q = new URLSearchParams();
    if (params.customer_email) q.set('customer_email', params.customer_email);
    if (params.date) q.set('date', params.date);
    if (params.employee_id) q.set('employee_id', params.employee_id);
    if (params.status) q.set('status', params.status);
    if (params.branch_id) q.set('branch_id', params.branch_id);
    const qs = q.toString();
    return apiRequest<Booking[]>(`/bookings${qs ? `?${qs}` : ''}`);
  },
  async cancelAsCustomer(id: string, customerEmail: string): Promise<Booking> {
    return apiRequest<Booking>(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled', customer_email: customerEmail }),
    });
  },
  async listPhotos(bookingId: string): Promise<BookingPhoto[]> {
    return apiRequest<BookingPhoto[]>(`/bookings/${bookingId}/photos`);
  },
  async addPhoto(
    bookingId: string,
    payload: { kind: BookingPhotoKind; url: string },
  ): Promise<BookingPhoto> {
    return apiRequest<BookingPhoto>(`/bookings/${bookingId}/photos`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async removePhoto(bookingId: string, photoId: string): Promise<void> {
    await apiRequest<void>(`/bookings/${bookingId}/photos/${photoId}`, {
      method: 'DELETE',
    });
  },
};
