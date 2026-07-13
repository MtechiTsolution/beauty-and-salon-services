import { contactPathForBranch, useBookingBranch } from '@/features/booking/context/BookingBranchContext';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import { RotateCcw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Cancelling an appointment',
    body: [
      'You may cancel upcoming bookings from My bookings when the appointment is still eligible for cancellation.',
      'Please cancel as early as possible so the salon can offer the time slot to another guest. Same-day or late cancellations may not qualify for a refund, depending on the salon’s rules for that service or package.',
    ],
  },
  {
    title: '2. Rescheduling',
    body: [
      'Where available, you can request a new date or time for an existing booking through My bookings or by contacting the salon.',
      'Rescheduling is subject to staff availability and the salon’s cut-off time. A late reschedule may be treated the same as a late cancellation.',
    ],
  },
  {
    title: '3. No-shows',
    body: [
      'If you miss an appointment without cancelling in advance, the salon may mark the booking as a no-show.',
      'No-show visits generally do not qualify for a refund of prepaid amounts, deposits, or non-refundable offer pricing.',
    ],
  },
  {
    title: '4. Prepaid services, deposits & packages',
    body: [
      'If you paid in advance or used a deposit, refund eligibility follows the salon’s policy for the selected service or package.',
      'Package credits or promotional pricing may have separate terms shown at booking. Unused package visits are handled according to those terms and the salon’s package rules.',
    ],
  },
  {
    title: '5. How refunds are issued',
    body: [
      'Approved refunds are processed by the salon or platform payment flow used for the original payment.',
      'Refund timing depends on the payment method and provider. Once a refund is marked in the system, it may still take several business days to appear on your statement.',
    ],
  },
  {
    title: '6. How to request a review',
    body: [
      'If you believe a cancellation or payment should be refunded, contact the salon with your booking details as soon as possible and before the appointment time whenever you can.',
      'Include the booking date, service or package name, and the reason for your request so the salon can review it quickly.',
    ],
  },
] as const;

export default function RefundPolicyPage() {
  const [searchParams] = useSearchParams();
  const { bookingBranch } = useBookingBranch();
  const branchId = searchParams.get('branch')?.trim() || bookingBranch?.id || null;
  const salonName = bookingBranch?.name || APP_NAME;
  const lastUpdated = 'July 13, 2026';
  const branchQuery = branchId ? `?branch=${encodeURIComponent(branchId)}` : '';

  return (
    <div className="customer-page">
      <section className="border-b bg-card/60 backdrop-blur-sm">
        <div className="customer-container-wide py-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <RotateCcw className="h-4 w-4" /> Legal
          </span>
          <h1 className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            Refund Policy
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            Cancellation, rescheduling, and refund guidelines for appointments booked at {salonName}.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="customer-container-wide max-w-3xl py-10 md:py-14">
        <article className="space-y-8 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p className="rounded-xl border border-border/70 bg-card/50 px-4 py-3 text-foreground/90">
            This policy covers how cancellations and refunds work when you book through {APP_NAME}. Individual
            salons may apply stricter timing rules for certain services; those rules apply when shown at
            booking or confirmed by the salon.
          </p>

          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="font-heading text-lg font-semibold text-foreground md:text-xl">
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ))}

          <div className="space-y-3 border-t border-border/70 pt-8">
            <h2 className="font-heading text-lg font-semibold text-foreground md:text-xl">
              7. Contact
            </h2>
            <p>
              For refund questions about a specific booking, reach the salon you selected. For account or
              payment help on the platform, use the contact options in the app.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={contactPathForBranch(branchId)}
                className="font-medium text-primary hover:underline"
              >
                Contact {bookingBranch?.name || 'support'}
              </Link>
              <Link to={`/privacy${branchQuery}`} className="font-medium text-primary hover:underline">
                View privacy policy
              </Link>
              <Link to="/my-bookings" className="font-medium text-primary hover:underline">
                Go to my bookings
              </Link>
              <Link to="/book" className="font-medium text-primary hover:underline">
                Back to booking
              </Link>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
