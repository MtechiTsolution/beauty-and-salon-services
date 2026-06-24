import { customerNavLinks } from '@/features/layout/customer-nav-links';
import {
  CUSTOMER_HOME_PATH,
  handleCustomerHomeClick,
} from '@/features/layout/customer-home-nav';
import { AppLogo } from '@mit-salon/shared/components/AppLogo';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import type { MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';

const footerLinks = customerNavLinks.filter((l) => l.path !== '/landing');

export function CustomerFooter() {
  const location = useLocation();

  const onHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    handleCustomerHomeClick(event, location.pathname);
  };

  return (
    <footer className="customer-app-footer mt-auto">
      <div className="customer-container-wide flex flex-col items-center gap-8 py-10 text-center md:py-12 lg:hidden">
          <div className="max-w-xl">
            <Link to={CUSTOMER_HOME_PATH} onClick={onHomeClick} className="inline-flex justify-center">
              <AppLogo
                size="md"
                showText
                textClassName="font-heading text-2xl font-bold text-foreground"
                className="justify-center"
              />
            </Link>
            <p className="footer-body-text mt-4 text-muted-foreground">
              Book appointments, manage visits, and stay connected with your salon — all in one place.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-bottom-bar flex w-full flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-center">
            <p className="footer-copyright">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p className="footer-copyright text-muted-foreground">
              Premium salon booking & care
            </p>
          </div>
        </div>

      <div className="customer-app-footer-desktop hidden lg:block">
        {/* Desktop — full-width panel */}
        <div className="customer-app-footer-panel">
          <div className="customer-app-footer-panel-accent" aria-hidden />

          <div className="customer-app-footer-panel-body">
            <div className="customer-app-footer-panel-main">
              <div className="customer-app-footer-panel-brand">
                <Link to={CUSTOMER_HOME_PATH} onClick={onHomeClick} className="inline-flex">
                  <AppLogo
                    size="md"
                    showText
                    textClassName="font-heading text-xl font-bold text-foreground"
                  />
                </Link>
                <p className="customer-app-footer-panel-tagline text-sm leading-relaxed text-muted-foreground">
                  Your salon companion — book, manage visits, and stay connected.
                </p>
              </div>

              <nav aria-label="Footer navigation" className="customer-app-footer-panel-nav">
                <ul className="customer-app-footer-pills">
                  {footerLinks.map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} className="customer-app-footer-pill">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="customer-app-footer-panel-meta footer-bottom-bar">
              <p className="footer-copyright">
                © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
              </p>
              <p className="footer-copyright text-muted-foreground">
                Premium salon booking & care
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
