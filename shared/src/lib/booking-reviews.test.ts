import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canReviewBooking,
  getReviewForBooking,
  hasCustomerReviewedBooking,
  isAppointmentTimeReached,
  isBookingConfirmedForReview,
  isPaymentConfirmedForReview,
  reviewUnavailableMessage,
} from './booking-reviews';
import type { Booking, Review } from '../types';

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'b1',
    date: '2026-06-19',
    time_slot: '10:00',
    duration_minutes: 60,
    status: 'confirmed',
    payment_status: 'paid',
    customer_email: 'guest@example.com',
    customer_name: 'Guest',
    branch_id: 'br1',
    branch_name: 'Salon',
    employee_id: 'e1',
    employee_name: 'Stylist',
    service_id: 's1',
    service_title: 'Cut',
    final_price: 50,
    created_at: '2026-06-01T00:00:00.000Z',
    updated_at: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('booking-reviews', () => {
  const afterVisit = new Date(2026, 5, 19, 12, 0);
  const beforeVisit = new Date(2026, 5, 19, 10, 30);

  it('isBookingConfirmedForReview accepts confirmed and completed only', () => {
    assert.equal(isBookingConfirmedForReview('confirmed'), true);
    assert.equal(isBookingConfirmedForReview('completed'), true);
    assert.equal(isBookingConfirmedForReview('pending'), false);
    assert.equal(isBookingConfirmedForReview('cancelled'), false);
  });

  it('isPaymentConfirmedForReview requires paid', () => {
    assert.equal(isPaymentConfirmedForReview('paid'), true);
    assert.equal(isPaymentConfirmedForReview('unpaid'), false);
  });

  it('canReviewBooking requires confirmed/completed, paid, and finished visit', () => {
    assert.equal(
      canReviewBooking(
        booking({ status: 'confirmed', payment_status: 'paid' }),
        afterVisit,
      ),
      true,
    );
    assert.equal(
      canReviewBooking(
        booking({ status: 'completed', payment_status: 'paid' }),
        afterVisit,
      ),
      true,
    );
    assert.equal(
      canReviewBooking(
        booking({ status: 'confirmed', payment_status: 'unpaid' }),
        afterVisit,
      ),
      false,
    );
    assert.equal(
      canReviewBooking(
        booking({ status: 'pending', payment_status: 'paid' }),
        afterVisit,
      ),
      false,
    );
    assert.equal(
      canReviewBooking(
        booking({ status: 'confirmed', payment_status: 'paid' }),
        beforeVisit,
      ),
      false,
    );
  });

  it('isAppointmentTimeReached after visit window', () => {
    assert.equal(isAppointmentTimeReached(booking(), beforeVisit), false);
    assert.equal(isAppointmentTimeReached(booking(), afterVisit), true);
  });

  it('hasCustomerReviewedBooking matches booking_id or same service review', () => {
    const b = booking({ id: 'b1', service_id: 's1', customer_email: 'guest@example.com' });
    const byBooking: Review = {
      id: 'r1',
      booking_id: 'b1',
      service_id: 's1',
      customer_email: 'guest@example.com',
      customer_name: 'Guest',
      rating: 5,
      status: 'approved',
      created_at: '2026-06-01T00:00:00.000Z',
      updated_at: '2026-06-01T00:00:00.000Z',
    };
    const byService: Review = {
      ...byBooking,
      id: 'r2',
      booking_id: undefined,
    };

    assert.equal(hasCustomerReviewedBooking([byBooking], b), true);
    assert.equal(hasCustomerReviewedBooking([byService], b), true);
    assert.equal(getReviewForBooking([byService], b)?.id, 'r2');
    assert.equal(hasCustomerReviewedBooking([], b), false);
  });

  it('reviewUnavailableMessage explains missing requirements', () => {
    assert.match(
      reviewUnavailableMessage(booking({ status: 'pending' }), afterVisit) ?? '',
      /confirmed/i,
    );
    assert.match(
      reviewUnavailableMessage(booking({ payment_status: 'unpaid' }), afterVisit) ?? '',
      /payment/i,
    );
    assert.match(
      reviewUnavailableMessage(booking(), beforeVisit) ?? '',
      /complete/i,
    );
    assert.equal(reviewUnavailableMessage(booking(), afterVisit), null);
  });
});
