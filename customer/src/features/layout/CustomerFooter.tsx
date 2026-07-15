import {
  contactPathForBranch,
  useBookingBranch,
} from '@/features/booking/context/BookingBranchContext';
import { LandingFooter } from '@/features/welcome/components/LandingFooter';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Link, useMatch } from 'react-router-dom';

function bookingLegalLinks(branchId: string) {
  const q = `?branch=${encodeURIComponent(branchId)}`;
  return [
    { label: 'Privacy', path: `/privacy${q}` },
    { label: 'Refunds', path: `/refund${q}` },
    { label: 'Contact', path: contactPathForBranch(branchId) },
  ];
}

/** Full-bleed selected-salon footer for the booking flow. */
export function BookingSalonFooter() {
  const { bookingBranch } = useBookingBranch();
  if (!bookingBranch) return null;

  const addressLine = [bookingBranch.address, bookingBranch.city]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
  const hours =
    bookingBranch.opening_time || bookingBranch.closing_time
      ? `${bookingBranch.opening_time ?? '09:00'} – ${bookingBranch.closing_time ?? '19:00'}`
      : null;
  const links = bookingLegalLinks(bookingBranch.id);
  const phoneHref = bookingBranch.phone
    ? `tel:${bookingBranch.phone.replace(/[^\d+]/g, '')}`
    : undefined;

  return (
    <footer className="booking-salon-footer">
      <div className="booking-salon-footer__rail" aria-hidden />

      <div className="booking-salon-footer__body">
        <div className="booking-salon-footer__head">
          <div className="booking-salon-footer__identity">
            <div className="booking-salon-footer__avatar">
              <CoverImage
                src={bookingBranch.image_url}
                alt={bookingBranch.name}
                kind="branch"
                entityId={bookingBranch.id}
                entityName={bookingBranch.name}
                entityDescription={branchImageHints({
                  name: bookingBranch.name,
                  address: bookingBranch.address ?? '',
                  city: bookingBranch.city ?? '',
                  description: '',
                })}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="booking-salon-footer__titles">
              <p className="booking-salon-footer__kicker">Booking location</p>
              <h2 className="booking-salon-footer__title font-heading">{bookingBranch.name}</h2>
            </div>
          </div>

          <Link
            to={`/salons/${encodeURIComponent(bookingBranch.id)}`}
            className="booking-salon-footer__cta"
          >
            Open salon page
          </Link>
        </div>

        <div className="booking-salon-footer__facts">
          <ul className="booking-salon-footer__facts-left" aria-label="Contact">
            {bookingBranch.email ? (
              <li>
                <Mail aria-hidden className="booking-salon-footer__fact-icon" />
                <a href={`mailto:${bookingBranch.email}`}>{bookingBranch.email}</a>
              </li>
            ) : null}
            {bookingBranch.phone ? (
              <li>
                <Phone aria-hidden className="booking-salon-footer__fact-icon" />
                <a href={phoneHref}>{bookingBranch.phone}</a>
              </li>
            ) : null}
          </ul>

          <ul className="booking-salon-footer__facts-right" aria-label="Location and hours">
            {addressLine ? (
              <li>
                <MapPin aria-hidden className="booking-salon-footer__fact-icon" />
                <span>{addressLine}</span>
              </li>
            ) : null}
            {hours ? (
              <li>
                <Clock aria-hidden className="booking-salon-footer__fact-icon" />
                <span>{hours}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="booking-salon-footer__foot">
        <span>© {new Date().getFullYear()} {APP_NAME}</span>
        <nav aria-label="Policies">
          {links.map((link) => (
            <Link key={link.path} to={link.path}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

/**
 * Site footer:
 * - Book page: handled inside BookAppointmentPage (salon strip + actions at page bottom).
 * - Every other section: show the general MIT Salon footer.
 */
export function CustomerFooter() {
  const isBookPage = Boolean(useMatch('/book'));

  if (isBookPage) {
    return null;
  }

  return <LandingFooter />;
}
