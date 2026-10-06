import type { APIRoute } from 'astro';
import { sanityClient } from '../lib/sanity';

export const prerender = false; // Run dynamically on request

export const GET: APIRoute = async () => {
  const domain = 'https://marlonmueller.eu';
  const todayIso = new Date().toISOString().split('T')[0];

  // Check if notes section is enabled in Sanity
  let showNotes = false;
  try {
    const notesSettings = await sanityClient.fetch(`*[_type == "notesSettings"][0]{ enabled }`);
    showNotes = notesSettings?.enabled === true;
  } catch (e) {
    showNotes = false;
  }

  // 1. Static paths for both locales
  const staticPaths = [
    '',
    '/library',
    '/cv',
    ...(showNotes ? ['/notes'] : []),
    '/contact',
    '/projects',
    '/impressum',
    '/privacy-policy',
    '/terms-of-service',
  ];

  interface SitemapEntry {
    loc: string;
    lastmod: string;
    enUrl: string;
    deUrl: string;
    priority: string;
  }

  const entries: SitemapEntry[] = [];

  // Generate static URLs with bidirectional hreflang and lastmod
  staticPaths.forEach((path) => {
    const enUrl = path === '' ? `${domain}/en/` : `${domain}/en${path}`;
    const deUrl = path === '' ? `${domain}/de/` : `${domain}/de${path}`;
    const isHome = path === '';

    entries.push({
      loc: enUrl,
      lastmod: todayIso,
      enUrl,
      deUrl,
      priority: isHome ? '1.0' : '0.7',
    });

    entries.push({
      loc: deUrl,
      lastmod: todayIso,
      enUrl,
      deUrl,
      priority: isHome ? '1.0' : '0.7',
    });
  });

  // 2. Dynamic paths for projects fetched from Sanity
  try {
    const projects = await sanityClient.fetch(
      `*[_type == "project"] {
        "slug": slug.current,
        languages,
        _updatedAt
      }`
    );

    projects.forEach((project: any) => {
      if (project.slug) {
        const langs = project.languages || ['en', 'de'];
        const projectDate = project._updatedAt
          ? new Date(project._updatedAt).toISOString().split('T')[0]
          : todayIso;

        const enUrl = `${domain}/en/projects/${project.slug}`;
        const deUrl = `${domain}/de/projects/${project.slug}`;

        if (langs.includes('en')) {
          entries.push({
            loc: enUrl,
            lastmod: projectDate,
            enUrl,
            deUrl,
            priority: '0.8',
          });
        }
        if (langs.includes('de')) {
          entries.push({
            loc: deUrl,
            lastmod: projectDate,
            enUrl,
            deUrl,
            priority: '0.8',
          });
        }
      }
    });
  } catch (error) {
    console.error('Error fetching projects for sitemap:', error);
  }

  // 3. Construct XML response with XHTML namespace for hreflang alternates
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${e.enUrl}" />
    <xhtml:link rel="alternate" hreflang="de" href="${e.deUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${e.enUrl}" />
    <priority>${e.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
