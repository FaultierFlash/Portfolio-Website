import type { APIRoute } from 'astro';
import { sanityClient } from '../lib/sanity';

export const prerender = false; // Run dynamically on request

export const GET: APIRoute = async () => {
  const domain = 'https://marlonmueller.eu';

  // Check if notes section is enabled in Sanity
  let showNotes = false;
  try {
    const notesSettings = await sanityClient.fetch(`*[_type == "notesSettings"][0]{ enabled }`);
    showNotes = notesSettings?.enabled === true;
  } catch (e) {
    showNotes = false;
  }

  // 1. Static paths for both locales
  const locales = ['en', 'de'];
  const staticPaths = [
    '',
    '/library',
    ...(showNotes ? ['/notes'] : []),
    '/contact',
    '/projects',
    '/impressum',
    '/privacy-policy',
    '/terms-of-service',
  ];

  const urls: string[] = [];

  // Generate static URLs
  locales.forEach((locale) => {
    staticPaths.forEach((path) => {
      const formattedPath = path === '' ? `/${locale}/` : `/${locale}${path}`;
      urls.push(`${domain}${formattedPath}`);
    });
  });

  // 2. Dynamic paths for projects fetched from Sanity
  try {
    const projects = await sanityClient.fetch(
      `*[_type == "project"] {
        "slug": slug.current,
        languages
      }`
    );

    projects.forEach((project: any) => {
      if (project.slug) {
        // Fallback to both locales if languages is not explicitly defined on the document
        const langs = project.languages || ['en', 'de']; 
        langs.forEach((lang: string) => {
          if (locales.includes(lang)) {
            urls.push(`${domain}/${lang}/projects/${project.slug}`);
          }
        });
      }
    });
  } catch (error) {
    console.error('Error fetching projects for sitemap:', error);
  }

  // 3. Construct XML response
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url.endsWith('/en/') || url.endsWith('/de/') ? '1.0' : '0.7'}</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400', // Cache 1 hour in browser, 24 hours on CDN
    },
  });
};
