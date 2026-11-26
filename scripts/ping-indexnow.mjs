// scripts/ping-indexnow.mjs
// Fetches all URLs from the live sitemap and submits them to IndexNow (Bing, Yandex, Naver, Seznam).
const HOST = 'marlonmueller.eu';
const INDEXNOW_KEY = '7a9f3e2c8b414d6ea5c0f1b92e8d4c37';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

async function main() {
  console.log(`Fetching sitemap from ${SITEMAP_URL}...`);
  const sitemapRes = await fetch(SITEMAP_URL, {
    headers: { 'User-Agent': 'marlonmueller-indexnow-submitter/1.0' },
  });

  if (!sitemapRes.ok) {
    throw new Error(`Failed to fetch sitemap: HTTP ${sitemapRes.status} ${sitemapRes.statusText}`);
  }

  const xml = await sitemapRes.text();
  const matches = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g));
  const urlList = matches
    .map((m) => m[1]?.trim())
    .filter((u) => typeof u === 'string' && u.startsWith(`https://${HOST}/`));

  if (urlList.length === 0) {
    throw new Error('No URLs found in sitemap.xml');
  }

  console.log(`Submitting ${urlList.length} URLs to IndexNow...`);
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`IndexNow submission failed: HTTP ${res.status} ${res.statusText}\n${body}`);
  }

  console.log(`IndexNow accepted (${res.status} ${res.statusText}). Submitted URLs:`);
  urlList.forEach((u) => console.log(`  - ${u}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
