import { APP_NAME } from '@/shared/lib/constants';
import { Link } from 'react-router-dom';

export function CustomerFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-heading text-lg font-bold">{APP_NAME}</h3>
          <p className="text-sm text-muted-foreground mt-2">Premium salon experience across multiple locations.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Quick links</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/services">Services</Link>
            <Link to="/branches">Branches</Link>
            <Link to="/book">Book appointment</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <p className="text-sm text-muted-foreground">hello@mitsalon.com</p>
          <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
