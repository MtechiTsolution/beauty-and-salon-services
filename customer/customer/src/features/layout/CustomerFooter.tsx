import { customerNavLinks } from '@/features/layout/customer-nav-links';
import { AppLogo } from '@mit-salon/shared/components/AppLogo';
import { APP_NAME } from '@mit-salon/shared/lib/constants';
import { Link } from 'react-router-dom';

const footerLinks = customerNavLinks.filter((l) => l.path !== '/landing');

export function CustomerFooter() {
  return (
    <footer className="customer-app-footer mt-auto border-t border-border/70">
      <div className="customer-container-wide py-10 md:py-12">
        <div className="flex flex-col items-center gap-8 text-center lg:items-start lg:text-left">
          <div className="max-w-xl">
            <AppLogo
              size="md"
              showText
              textClassName="font-heading text-2xl font-bold text-foreground"
              className="justify-center lg:justify-start"
            />
            <p className="footer-body-text mt-4 text-muted-foreground">
              Book appointments, manage visits, and stay connected with your salon — all in one place.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-start">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer-bottom-bar mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-center sm:flex-row lg:text-left">
          <p className="footer-copyright">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="footer-copyright text-muted-foreground">
            Premium salon booking & care
          </p>
        </div>
      </div>
    </footer>
  );
}
