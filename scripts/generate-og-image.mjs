import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SANITY_PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || 'k4t36b6u';
const SANITY_DATASET = process.env.PUBLIC_SANITY_DATASET || 'production';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

const ACCENT_PALETTE = {
  primary: { main: '#FF7D1A', glow: 'rgba(255, 125, 26, 0.24)' },
  blue:    { main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.24)' },
  green:   { main: '#22c55e', glow: 'rgba(34, 197, 94, 0.24)' },
  purple:  { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.24)' },
  rose:    { main: '#f43f5e', glow: 'rgba(244, 63, 94, 0.24)' },
  gray:    { main: '#94a3b8', glow: 'rgba(148, 163, 184, 0.22)' },
};

const defaultOgHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px; height: 630px; background: #090d16;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #f8fafc; display: flex; flex-direction: column; justify-content: space-between;
      padding: 72px 80px; position: relative; overflow: hidden;
    }
    .glow-orange { position: absolute; width: 550px; height: 550px; border-radius: 50%; background: radial-gradient(circle, rgba(255, 125, 26, 0.22) 0%, rgba(255, 125, 26, 0) 70%); top: -120px; right: -80px; }
    .glow-blue { position: absolute; width: 450px; height: 450px; border-radius: 50%; background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 70%); bottom: -100px; left: -80px; }
    .grid-lines { position: absolute; inset: 0; background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; }
    .top-badge { display: inline-flex; align-items: center; gap: 10px; padding: 8px 18px; border-radius: 9999px; background: rgba(255,125,26,0.12); border: 1px solid rgba(255,125,26,0.35); color: #FF7D1A; font-size: 15px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; width: fit-content; z-index: 10; }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #FF7D1A; box-shadow: 0 0 10px #FF7D1A; }
    .main-content { z-index: 10; margin-top: 10px; }
    h1 { font-size: 68px; font-weight: 900; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 16px; background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { font-size: 26px; font-weight: 600; color: #94a3b8; line-height: 1.35; max-width: 860px; }
    .subtitle span.accent { color: #f1f5f9; font-weight: 700; }
    .footer-bar { display: flex; align-items: center; justify-content: space-between; z-index: 10; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; }
    .tags { display: flex; gap: 12px; }
    .tag { padding: 6px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; font-weight: 600; color: #cbd5e1; }
    .url { font-size: 18px; font-weight: 800; color: #FF7D1A; letter-spacing: 0.02em; }
  </style>
</head>
<body>
  <div class="grid-lines"></div>
  <div class="glow-orange"></div>
  <div class="glow-blue"></div>
  <div>
    <div class="top-badge">
      <span class="pulse-dot"></span>
      Technical University of Munich (TUM)
    </div>
  </div>
  <div class="main-content">
    <h1>Marlon Müller</h1>
    <p class="subtitle">
      <span class="accent">Engineering Science</span> student at TUM &amp; Co-Founder of <span class="accent">Odonatum</span> — bio-inspired dragonfly UAV robotics.
    </p>
  </div>
  <div class="footer-bar">
    <div class="tags">
      <span class="tag">Engineering Science</span>
      <span class="tag">Odonatum e.V.</span>
      <span class="tag">Think.Make.Start</span>
      <span class="tag">Studienstiftung</span>
    </div>
    <div class="url">marlonmueller.eu</div>
  </div>
</body>
</html>`;

function buildProjectOgHtml(project) {
  const accent = ACCENT_PALETTE[project.accentColor] || ACCENT_PALETTE.primary;
  const safeTitle = escapeHtml(project.title || 'Project');
  const rawDesc = String(project.description || '').trim();
  const clippedDesc = rawDesc.length > 165 ? `${rawDesc.slice(0, 165).replace(/\s+\S*$/, '')}…` : rawDesc;
  const safeDesc = escapeHtml(clippedDesc);
  const tags = Array.isArray(project.tags) ? project.tags.slice(0, 4) : [];
  const metrics = Array.isArray(project.metrics)
    ? project.metrics.filter((m) => m?.value).slice(0, 3)
    : [];
  const bgImgUrl = project.imageUrl ? escapeHtml(project.imageUrl) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px; height: 630px; background: #020617; color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 64px 74px; position: relative; overflow: hidden;
    }
    .grid-lines {
      position: absolute; inset: 0;
      background-image: linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .accent-rail {
      position: absolute; left: 0; top: 0; bottom: 0; width: 8px;
      background: ${accent.main};
    }
    .glow {
      position: absolute; width: 580px; height: 580px; border-radius: 50%;
      background: radial-gradient(circle, ${accent.glow} 0%, rgba(2,6,23,0) 70%);
      top: -160px; right: -100px; pointer-events: none;
    }
    .hero-bg {
      position: absolute; right: 0; top: 0; bottom: 0; width: 48%;
      background-size: cover; background-position: center;
      opacity: 0.28;
      -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 60%, black 100%);
      mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 60%, black 100%);
    }
    .header-row {
      display: flex; align-items: center; justify-content: space-between; z-index: 10;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 7px 16px; border-radius: 9999px;
      border: 1px solid ${accent.main}; color: ${accent.main};
      background: rgba(15, 23, 42, 0.7);
      font-size: 13px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
    }
    .author { font-size: 15px; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; }
    .body { z-index: 10; max-width: 780px; }
    h1 {
      font-size: 62px; font-weight: 900; letter-spacing: -0.03em; line-height: 1.06; margin-bottom: 18px;
      color: #ffffff;
    }
    .desc { font-size: 23px; font-weight: 500; color: #cbd5e1; line-height: 1.4; }
    .metrics { display: flex; gap: 16px; margin-top: 24px; flex-wrap: wrap; }
    .metric {
      padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12);
      background: rgba(15,23,42,0.75);
    }
    .metric-val { font-size: 18px; font-weight: 800; color: #ffffff; }
    .metric-lbl { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
    .footer-bar {
      display: flex; align-items: center; justify-content: space-between;
      z-index: 10; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 22px;
    }
    .tags { display: flex; gap: 10px; flex-wrap: wrap; }
    .tag {
      padding: 6px 13px; border-radius: 9999px; font-size: 13px; font-weight: 700;
      color: #e2e8f0; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    }
    .url { font-size: 18px; font-weight: 800; color: ${accent.main}; letter-spacing: 0.03em; }
  </style>
</head>
<body>
  <div class="accent-rail"></div>
  <div class="grid-lines"></div>
  <div class="glow"></div>
  ${bgImgUrl ? `<div class="hero-bg" style="background-image: url('${bgImgUrl}');"></div>` : ''}
  <div class="header-row">
    <div class="badge">Project Case Study</div>
    <div class="author">Marlon Müller · TUM</div>
  </div>
  <div class="body">
    <h1>${safeTitle}</h1>
    ${safeDesc ? `<p class="desc">${safeDesc}</p>` : ''}
    ${metrics.length > 0 ? `<div class="metrics">${metrics.map((m) => `<div class="metric"><div class="metric-val">${escapeHtml(m.value)}${m.unit ? ` ${escapeHtml(m.unit)}` : ''}</div>${m.label ? `<div class="metric-lbl">${escapeHtml(m.label)}</div>` : ''}</div>`).join('')}</div>` : ''}
  </div>
  <div class="footer-bar">
    <div class="tags">${tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}</div>
    <div class="url">marlonmueller.eu</div>
  </div>
</body>
</html>`;
}

async function fetchSanityProjects() {
  const groq = encodeURIComponent(
    `*[_type == "project" && defined(slug.current)] | order(order asc) {
      "slug": slug.current,
      title,
      "description": coalesce(description.en, description.de, ""),
      accentColor,
      tags,
      metrics[]{ "label": coalesce(label.en, label.de, ""), value, unit },
      "imageUrl": mainImage.asset->url
    }`
  );
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-03-12/data/query/${SANITY_DATASET}?query=${groq}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity query failed: HTTP ${res.status}`);
  const payload = await res.json();
  return Array.isArray(payload?.result) ? payload.result : [];
}

async function generate() {
  console.log('Generating OG Images...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

    // 1. Site-wide default OG card
    await page.setContent(defaultOgHtml, { waitUntil: 'networkidle0' });
    const jpgPath = path.join(rootDir, 'public', 'og-image.jpg');
    await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 90 });
    console.log('Generated public/og-image.jpg');

    // 2. Per-project branded OG cards
    let projects = [];
    try {
      projects = await fetchSanityProjects();
    } catch (err) {
      console.warn('Skipping per-project OG cards (Sanity unreachable):', err?.message || err);
    }

    if (projects.length > 0) {
      const ogDir = path.join(rootDir, 'public', 'og');
      fs.mkdirSync(ogDir, { recursive: true });
      for (const proj of projects) {
        if (!proj?.slug || !/^[a-zA-Z0-9_-]+$/.test(proj.slug)) continue;
        const projWithThumb = {
          ...proj,
          imageUrl: proj.imageUrl ? `${proj.imageUrl}?w=900&auto=format&q=80` : '',
        };
        await page.setContent(buildProjectOgHtml(projWithThumb), { waitUntil: 'networkidle0' }).catch(async () => {
          await page.setContent(buildProjectOgHtml({ ...projWithThumb, imageUrl: '' }), { waitUntil: 'load' });
        });
        const outPath = path.join(ogDir, `${proj.slug}.jpg`);
        await page.screenshot({ path: outPath, type: 'jpeg', quality: 88 });
        console.log(`Generated public/og/${proj.slug}.jpg`);
      }
    }
  } finally {
    await browser.close();
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
