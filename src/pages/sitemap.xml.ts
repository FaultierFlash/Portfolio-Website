import type { APIRoute } from 'astro';
import { sanityClient } from '../lib/sanity';
import { escapeHtml } from '../lib/html';

export const prerender = false; // Run dynamically on request

function toIsoDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().split('T')[0];
}

export const GET: APIRoute = async () => {
  const domain = 'https://marlonmueller.eu';

  let showNotes = false;
  let homeLastmod: string | undefined;
  let cvLastmod: string | undefined;
  let libraryLastmod: string | undefined;
  let notesLastmod: string | undefined;
  let projectsLastmod: string | undefined;
  let projects: Array<{ slug?: string; languages?: string[]; _updatedAt?: string }> = [];

  try {
    const data = await sanityClient.fetch(`{
      "notesSettings": *[_type == "notesSettings"][0]{ enabled, _updatedAt },
      "latestNote": *[_type == "labEntry" && status == "published"] | order(_updatedAt desc)[0]{ _updatedAt },
      "homePage": *[_type == "homePage"][0]{ _updatedAt },
      "cvSettings": *[_type == "cvSettings"][0]{ _updatedAt },
      "librarySettings": *[_type == "librarySettings"][0]{ _updatedAt },
      "latestBook": *[_type == "book"] | order(_updatedAt desc)[0]{ _updatedAt },
      "projects": *[_type == "project"] {
        "slug": slug.current,
        languages,
        _updatedAt
      }
    }`);

    showNotes = data?.notesSettings?.enabled === true;
    homeLastmod = toIsoDate(data?.homePage?._updatedAt);
    cvLastmod = toIsoDate(data?.cvSettings?._updatedAt);
    libraryLastmod = toIsoDate(data?.latestBook?._updatedAt || data?.librarySettings?._updatedAt);
    notesLastmod = toIsoDate(data?.latestNote?._updatedAt || data?.notesSettings?._updatedAt);
    projects = Array.isArray(data?.projects) ? data.projects : [];

    const projectDates = projects
      .map((p) => (p._updatedAt ? new Date(p._updatedAt).getTime() : 0))
      .filter((ts) => ts > 0);
    if (projectDates.length > 0) {
      projectsLastmod = new Date(Math.max(...projectDates)).toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Error fetching sitemap data from Sanity:', error);
  }

  // 1. Primary content routes for both locales (legal pages omitted so snippets focus on core work)
  const staticPaths: Array<{ path: string; priority: string; lastmod?: string }> = [
    { path: '', priority: '1.0', lastmod: homeLastmod },
    { path: '/projects', priority: '0.8', lastmod: projectsLastmod },
    { path: '/cv', priority: '0.8', lastmod: cvLastmod },
    { path: '/library', priority: '0.7', lastmod: libraryLastmod },
    ...(showNotes ? [{ path: '/notes', priority: '0.7', lastmod: notesLastmod }] : []),
    { path: '/contact', priority: '0.6' },
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

  staticPaths.forEach(({ path, priority, lastmod }) => {
    const enUrl = path === '' ? `${domain}/en/` : `${domain}/en${path}`;
    const deUrl = path === '' ? `${domain}/de/` : `${domain}/de${path}`;

    entries.push({
      loc: enUrl,
      lastmod,
      enUrl,
      deUrl,
      xDefaultUrl: enUrl,
      priority,
    });

    entries.push({
      loc: deUrl,
      lastmod,
      enUrl,
      deUrl,
      xDefaultUrl: enUrl,
      priority,
    });
  });

  // 2. Dynamic project pages (only emit locales explicitly present in project.languages, matching [slug].astro)
  projects.forEach((project) => {
    if (!project.slug || !Array.isArray(project.languages) || project.languages.length === 0) {
      return;
    }

    const encodedSlug = encodeURIComponent(project.slug);
    const langs = project.languages;
    const projectDate = toIsoDate(project._updatedAt);

    const hasEn = langs.includes('en');
    const hasDe = langs.includes('de');
    const enUrl = hasEn ? `${domain}/en/projects/${encodedSlug}` : undefined;
    const deUrl = hasDe ? `${domain}/de/projects/${encodedSlug}` : undefined;
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
  });

  // 3. Construct XML response with XHTML namespace for hreflang alternates
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map((e) => {
    const links: string[] = [];
    if (e.enUrl) links.push(`    <xhtml:link rel="alternate" hreflang="en" href="${escapeHtml(e.enUrl)}" />`);
    if (e.deUrl) links.push(`    <xhtml:link rel="alternate" hreflang="de" href="${escapeHtml(e.deUrl)}" />`);
    links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(e.xDefaultUrl)}" />`);
    return `  <url>
    <loc>${escapeHtml(e.loc)}</loc>${e.lastmod ? `\n    <lastmod>${escapeHtml(e.lastmod)}</lastmod>` : ''}
${links.join('\n')}
    <priority>${escapeHtml(e.priority)}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Netlify-CDN-Cache-Control': 'public, durable, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
