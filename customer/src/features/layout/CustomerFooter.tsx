import {
  contactPathForBranch,
  useBookingBranch,
} from '@/features/booking/context/BookingBranchContext';
import { LandingFooter } from '@/features/welcome/components/LandingFooter';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, useMatch } from 'react-router-dom';

function bookingLegalLinks(branchId: string) {
  const q = `?branch=${encodeURIComponent(branchId)}`;
  return [
    { label: 'Privacy Policy', path: `/privacy${q}` },
    { label: 'Refund Policy', path: `/refund${q}` },
    { label: 'Contact salon', path: contactPathForBranch(branchId) },
  ];
}

function SalonContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="booking-salon-footer__icon" aria-hidden>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="booking-salon-footer__row-label">{label}</span>
        <span className="booking-salon-footer__row-value">{value}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="booking-salon-footer__row booking-salon-footer__row--link">
        {inner}
      </a>
    );
  }

  return <div className="booking-salon-footer__row">{inner}</div>;
}

/** Salon-only footer while booking a specific salon. */
function BookingSalonFooter() {
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
    <footer className="booking-salon-footer mt-auto">
      <div className="booking-salon-footer__shell">
        <div className="customer-container-wide">
          <div className="booking-salon-footer__card">
            <div className="booking-salon-footer__accent" aria-hidden />

            <div className="booking-salon-footer__inner">
              <header className="booking-salon-footer__header">
                <div>
                  <p className="booking-salon-footer__eyebrow">Selected for booking</p>
                  <h2 className="booking-salon-footer__title">{bookingBranch.name}</h2>
                </div>
                <p className="booking-salon-footer__lede">
                  Contact this location for directions, timing, or booking questions.
                </p>
              </header>

              <div className="booking-salon-footer__grid">
                <section className="booking-salon-footer__section" aria-label="Salon contact">
                  <h3 className="booking-salon-footer__section-title">Location details</h3>
                  <div className="booking-salon-footer__contacts">
                    {addressLine ? (
                      <SalonContactRow icon={MapPin} label="Address" value={addressLine} />
                    ) : null}
                    {bookingBranch.phone ? (
                      <SalonContactRow
                        icon={Phone}
                        label="Phone"
                        value={bookingBranch.phone}
                        href={phoneHref}
                      />
                    ) : null}
                    {bookingBranch.email ? (
                      <SalonContactRow
                        icon={Mail}
                        label="Email"
                        value={bookingBranch.email}
                        href={`mailto:${bookingBranch.email}`}
                      />
                    ) : null}
                    {hours ? (
                      <SalonContactRow icon={Clock} label="Hours" value={hours} />
                    ) : null}
                  </div>
                </section>

                <section className="booking-salon-footer__section" aria-label="Policies">
                  <h3 className="booking-salon-footer__section-title">Policies & support</h3>
                  <nav>
                    <ul className="booking-salon-footer__policy-list">
                      {links.map((link) => (
                        <li key={link.path}>
                          <Link to={link.path} className="booking-salon-footer__policy-link">
                            <span>{link.label}</span>
                            <span className="booking-salon-footer__policy-arrow" aria-hidden>
                              →
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </section>
              </div>

              <div className="booking-salon-footer__bottom">
                <p className="footer-copyright">
                  © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                </p>
                <p className="booking-salon-footer__bottom-note">
                  Booking at <strong>{bookingBranch.name}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Site footer:
 * - Book page: hide the general footer; show salon details only after a salon is selected.
 * - Every other section: show the general MIT Salon footer.
 */
export function CustomerFooter() {
  const isBookPage = Boolean(useMatch('/book'));
  const { bookingBranch } = useBookingBranch();

  if (isBookPage) {
    return bookingBranch ? <BookingSalonFooter /> : null;
  }

  return <LandingFooter />;
}
