import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll window to top on route (and query) changes so legal/support pages open at the header. */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);

  return null;
}
