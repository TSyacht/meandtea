import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable automatic browser scroll restoration for consistent behavior
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Force instant scroll to top on route change
    try {
      document.documentElement.scrollTop = 0;
      if (document.body) {
        document.body.scrollTop = 0;
      }
      window.scrollTo(0, 0);
      document.documentElement.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } catch (e) {
      // Fallback if browser doesn't support 'instant' value
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};
