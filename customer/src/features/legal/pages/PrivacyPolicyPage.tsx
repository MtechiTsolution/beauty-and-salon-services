import { contactPathForBranch, useBookingBranch } from '@/features/booking/context/BookingBranchContext';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import { FileText } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Information we collect',
    body: [
      'When you create an account or book an appointment, we collect details you provide such as your name, email address, phone number, and booking preferences.',
      'We may also store messages you send through in-app chat, appointment notes, and basic usage information needed to operate the booking platform (for example, confirmation status and visit history).',
    ],
  },
  {
    title: '2. How we use your information',
    body: [
      'Your information is used to schedule and manage appointments, send booking confirmations and status updates, process payments or refunds when applicable, and provide customer support.',
      'We may also use your contact details to send service-related notices (for example, appointment reminders or important changes to a booking). Marketing messages are only sent where allowed and can be declined where the product supports that.',
    ],
  },
  {
    title: '3. Sharing of information',
    body: [
      'Booking details are shared with the salon location you select so they can prepare for and fulfill your appointment.',
      'We do not sell your personal information. Limited data may be processed by trusted service providers (such as hosting, email delivery, or payment partners) only as needed to run the platform.',
    ],
  },
  {
    title: '4. Data retention & security',
    body: [
      'We keep account and booking records for as long as needed to provide the service, meet legal obligations, and resolve disputes.',
      'We take reasonable technical and organizational measures to protect your information. No method of transmission or storage is completely secure, so please use a strong password and keep your login details private.',
    ],
  },
  {
    title: '5. Your choices & rights',
    body: [
      'You can review and update profile details from your account settings. You may also contact the salon or platform support to request help with access, correction, or account-related questions.',
      'If you delete your account or ask us to remove data, we will process the request subject to any records we must retain for bookings, payments, or legal compliance.',
    ],
  },
  {
    title: '6. Updates to this policy',
    body: [
      'We may update this Privacy Policy from time to time. The version published on this page is the current policy. Continued use of the booking service after an update means you accept the revised terms.',
    ],
  },
] as const;

export default function PrivacyPolicyPage() {
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
            <FileText className="h-4 w-4" /> Legal
          </span>
          <h1 className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            How {salonName} and {APP_NAME} collect, use, and protect your information when you book and
            manage appointments.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="customer-container-wide max-w-3xl py-10 md:py-14">
        <article className="space-y-8 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p className="rounded-xl border border-border/70 bg-card/50 px-4 py-3 text-foreground/90">
            This policy explains what personal information is collected through the {APP_NAME} customer
            booking experience and how it is used for appointments at {salonName}.
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
              For privacy questions about a specific appointment or salon location, contact that salon
              directly. For platform account questions, use the contact options in the app.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={contactPathForBranch(branchId)}
                className="font-medium text-primary hover:underline"
              >
                Contact {bookingBranch?.name || 'support'}
              </Link>
              <Link to={`/refund${branchQuery}`} className="font-medium text-primary hover:underline">
                View refund policy
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
