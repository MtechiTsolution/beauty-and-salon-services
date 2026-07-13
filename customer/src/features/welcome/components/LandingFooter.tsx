import { useAuth } from '@/features/auth/context/AuthContext';
import {
  CUSTOMER_HOME_PATH,
  handleCustomerHomeClick,
} from '@/features/layout/customer-home-nav';
import { AppLogo } from '@mit-salon/shared/components/AppLogo';
import { APP_NAME, SALON_SUPPORT } from '@mit-salon/shared/lib/constants';
import { landingFeatures } from '@/features/welcome/lib/landing-content';
import { Clock, Mail, Phone } from 'lucide-react';
import type { MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';

const footerAnchors = [
  { label: 'Features', href: '/landing#features' },
  { label: 'Services', href: '/landing#services' },
  { label: 'Packages', href: '/landing#packages' },
  { label: 'Locations', href: '/landing#locations' },
  { label: 'Reviews', href: '/landing#reviews' },
];

const supportHourLines = SALON_SUPPORT.hours.split(' · ');

export function LandingFooter() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const onHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    handleCustomerHomeClick(event, location.pathname);
  };

  return (
    <footer className="landing-footer border-t border-border/70">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 max-md:px-4 max-md:py-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-14 max-md:gap-8">
          <div className="text-center lg:col-span-4 lg:text-left max-md:text-left">
            <Link
              to={CUSTOMER_HOME_PATH}
              onClick={onHomeClick}
              className="inline-flex justify-center lg:justify-start max-md:justify-start"
            >
              <AppLogo
                size="md"
                showText
                textClassName="font-heading text-2xl font-bold text-foreground max-md:text-xl"
                className="justify-center lg:justify-start max-md:justify-start"
              />
            </Link>
            <p className="footer-body-text mx-auto mt-5 max-w-sm text-muted-foreground lg:mx-0 max-md:mx-0 max-md:mt-3 max-md:text-sm max-md:leading-relaxed">
              {APP_NAME} is your complete salon companion — discover locations, book appointments, chat with
              reception, and manage every visit with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:col-span-5 max-md:grid-cols-2 max-md:gap-6 max-md:gap-y-6">
            <div className="text-center sm:text-left max-md:text-left">
              <p className="footer-section-title max-md:text-base">Explore</p>
              <ul className="mt-5 space-y-3 max-md:mt-2.5 max-md:space-y-1.5">
                {footerAnchors.map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className="footer-link max-md:text-sm">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left max-md:text-left">
              <p className="footer-section-title max-md:text-base">Platform</p>
              <ul className="mt-5 space-y-3 max-md:mt-2.5 max-md:space-y-1.5">
                {landingFeatures.slice(0, 5).map((f) => (
                  <li key={f.title}>
                    <Link
                      to={isAuthenticated ? f.path : '/register'}
                      className="footer-link max-md:text-sm"
                    >
                      {f.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center lg:col-span-3 lg:text-left max-md:text-left max-md:rounded-xl max-md:border max-md:border-border/60 max-md:bg-card/40 max-md:p-4 max-md:shadow-sm">
            <p className="footer-section-title max-md:text-base">Contact</p>
            <ul className="footer-contact-list mt-5 space-y-4 max-md:mt-3 max-md:space-y-3">
              <li>
                <a
                  href={`tel:${SALON_SUPPORT.phone.replace(/\D/g, '')}`}
                  className="footer-contact-item footer-link"
                >
                  <span className="footer-contact-icon" aria-hidden>
                    <Phone className="h-4 w-4 text-primary" />
                  </span>
                  <span className="footer-contact-text">{SALON_SUPPORT.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SALON_SUPPORT.email}`}
                  className="footer-contact-item footer-link"
                >
                  <span className="footer-contact-icon" aria-hidden>
                    <Mail className="h-4 w-4 text-primary" />
                  </span>
                  <span className="footer-contact-text break-all sm:break-normal">{SALON_SUPPORT.email}</span>
                </a>
              </li>
              <li className="footer-contact-item footer-contact-item--static footer-body-text text-muted-foreground">
                <span className="footer-contact-icon max-md:flex" aria-hidden>
                  <Clock className="h-4 w-4 text-primary" />
                </span>
                <span className="footer-contact-text max-md:hidden">{SALON_SUPPORT.hours}</span>
                <span className="footer-contact-text footer-contact-hours-lines hidden max-md:block">
                  {supportHourLines.map((line) => (
                    <span key={line} className="footer-contact-hours-line">
                      {line}
                    </span>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom footer-bottom-bar mt-12 flex flex-col items-center justify-between gap-5 pt-8 text-center sm:flex-row lg:text-left max-md:mt-8 max-md:gap-4 max-md:pt-6">
          <p className="footer-copyright max-md:text-xs max-md:text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-end max-md:grid max-md:w-full max-md:grid-cols-3 max-md:gap-2 max-md:gap-x-2">
            <Link to="/privacy" className="footer-link footer-mobile-action max-md:text-center max-md:text-sm">
              Privacy Policy
            </Link>
            <Link to="/refund" className="footer-link footer-mobile-action max-md:text-center max-md:text-sm">
              Refund Policy
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/book" className="footer-link footer-mobile-action max-md:text-center max-md:text-sm">
                  Book
                </Link>
                <Link to="/explore" className="footer-link footer-mobile-action max-md:text-center max-md:text-sm">
                  Explore
                </Link>
                <Link to="/contact" className="footer-link footer-mobile-action max-md:text-center max-md:text-sm">
                  Contact
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="footer-link footer-mobile-action max-md:text-center max-md:text-sm">
                  Sign in
                </Link>
                <Link to="/book" className="footer-link footer-mobile-action max-md:text-center max-md:text-sm">
                  Book now
                </Link>
                <Link to="/register" className="footer-link footer-mobile-action max-md:text-center max-md:text-sm">
                  Register
                </Link>
                <Link to="/register-salon" className="footer-link footer-mobile-action max-md:text-center max-md:text-sm">
                  List your salon
                </Link>
                <Link to="/contact" className="footer-link footer-mobile-action max-md:text-center max-md:text-sm">
                  Contact
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
