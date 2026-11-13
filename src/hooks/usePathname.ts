import { useEffect, useState } from 'react';

export function usePathname(): string {
  const [pathname, setPathname] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.pathname,
  );

  useEffect(() => {
    const update = () => setPathname(window.location.pathname);

    // Keep the pathname in sync with client-side navigations, browser
    // back/forward traversals, and hash links.
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', update);
    };
  }, []);

  return pathname;
}
