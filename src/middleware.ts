// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;
  const method = request.method.toUpperCase();

  const netlifyContext =
    typeof process !== 'undefined' ? process.env.CONTEXT : undefined;
  const isNonProdHost =
    url.hostname.endsWith('.netlify.app') ||
    (netlifyContext !== undefined && netlifyContext !== 'production');

  const attachNoIndex = (res: Response): Response => {
    if (isNonProdHost) {
      res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    return res;
  };

  if (method === 'GET' || method === 'HEAD') {
    const { pathname, search } = url;

    const isBypassed =
      pathname.startsWith('/api/') ||
      pathname.startsWith('/studio') ||
      pathname.startsWith('/_astro/') ||
      pathname.startsWith('/.netlify/');

    if (!isBypassed) {
      if (pathname === '/en' || pathname === '/de') {
        return attachNoIndex(context.redirect(`${pathname}/${search}`, 301));
      }

      const hasFileExtension = /\/[^/]+\.[a-zA-Z0-9]{1,8}$/.test(pathname);
      if (
        pathname.length > 4 &&
        (pathname.startsWith('/en/') || pathname.startsWith('/de/')) &&
        pathname.endsWith('/') &&
        !hasFileExtension
      ) {
        return attachNoIndex(context.redirect(`${pathname.slice(0, -1)}${search}`, 301));
      }
    }
  }

  const response = await next();
  return attachNoIndex(response);
});
