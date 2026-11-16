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
  } catch {
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
    lastmod?: string;
    enUrl?: string;
    deUrl?: string;
    xDefaultUrl: string;
    priority: string;
  }

  const entries: SitemapEntry[] = [];

  // Generate static URLs with bidirectional hreflang
  staticPaths.forEach((path) => {
    const enUrl = path === '' ? `${domain}/en/` : `${domain}/en${path}`;
    const deUrl = path === '' ? `${domain}/de/` : `${domain}/de${path}`;
    const isHome = path === '';

    entries.push({
      loc: enUrl,
      enUrl,
      deUrl,
      xDefaultUrl: enUrl,
      priority: isHome ? '1.0' : '0.7',
    });

    entries.push({
      loc: deUrl,
      enUrl,
      deUrl,
      xDefaultUrl: enUrl,
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
        const langs: string[] = Array.isArray(project.languages) && project.languages.length > 0
          ? project.languages
          : ['en', 'de'];
        const projectDate = project._updatedAt
          ? new Date(project._updatedAt).toISOString().split('T')[0]
          : undefined;

        const hasEn = langs.includes('en');
        const hasDe = langs.includes('de');
        const enUrl = hasEn ? `${domain}/en/projects/${project.slug}` : undefined;
        const deUrl = hasDe ? `${domain}/de/projects/${project.slug}` : undefined;
        const xDefaultUrl = enUrl || deUrl;

        if (!xDefaultUrl) return;

        if (enUrl) {
          entries.push({
            loc: enUrl,
            lastmod: projectDate,
            enUrl,
            deUrl,
            xDefaultUrl,
            priority: '0.8',
          });
        }
        if (deUrl) {
          entries.push({
            loc: deUrl,
            lastmod: projectDate,
            enUrl,
            deUrl,
            xDefaultUrl,
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
  .map((e) => {
    const links: string[] = [];
    if (e.enUrl) links.push(`    <xhtml:link rel="alternate" hreflang="en" href="${e.enUrl}" />`);
    if (e.deUrl) links.push(`    <xhtml:link rel="alternate" hreflang="de" href="${e.deUrl}" />`);
    links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${e.xDefaultUrl}" />`);
    return `  <url>
    <loc>${e.loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}
${links.join('\n')}
    <priority>${e.priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
