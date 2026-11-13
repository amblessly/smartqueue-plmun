import { defineMiddleware } from 'astro:middleware';

/**
 * Queue ticket links are generated at runtime, so the static build only ships
 * the `/queue/ticket/shell` page. In development, rewrite any ticket URL to
 * that shell; the page reads the ticket id from `window.location.pathname`.
 *
 * For production, the equivalent rewrite lives in `public/_redirects`
 * (Cloudflare Pages / Netlify) and `vercel.json`.
 */
export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;
  if (pathname.startsWith('/queue/ticket/') && pathname !== '/queue/ticket/shell') {
    return context.rewrite('/queue/ticket/shell');
  }
  return next();
});
