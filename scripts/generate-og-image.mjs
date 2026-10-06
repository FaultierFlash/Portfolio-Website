import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 630px;
      background: #090d16;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 72px 80px;
      position: relative;
      overflow: hidden;
    }
    /* Ambient glow elements */
    .glow-orange {
      position: absolute;
      width: 550px;
      height: 550px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 125, 26, 0.22) 0%, rgba(255, 125, 26, 0) 70%);
      top: -120px;
      right: -80px;
      pointer-events: none;
    }
    .glow-blue {
      position: absolute;
      width: 450px;
      height: 450px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 70%);
      bottom: -100px;
      left: -80px;
      pointer-events: none;
    }
    .grid-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    .top-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      border-radius: 9999px;
      background: rgba(255, 125, 26, 0.12);
      border: 1px solid rgba(255, 125, 26, 0.35);
      color: #FF7D1A;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      width: fit-content;
      z-index: 10;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #FF7D1A;
      box-shadow: 0 0 10px #FF7D1A;
    }
    .main-content {
      z-index: 10;
      margin-top: 10px;
    }
    h1 {
      font-size: 68px;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1.05;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 26px;
      font-weight: 600;
      color: #94a3b8;
      line-height: 1.35;
      max-width: 860px;
    }
    .subtitle span.accent {
      color: #f1f5f9;
      font-weight: 700;
    }
    .footer-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 24px;
    }
    .tags {
      display: flex;
      gap: 12px;
    }
    .tag {
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #cbd5e1;
    }
    .url {
      font-size: 18px;
      font-weight: 800;
      color: #FF7D1A;
      letter-spacing: 0.02em;
    }
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

async function generate() {
  console.log('Generating OG Image...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pngPath = path.join(rootDir, 'public', 'og-image.png');
  const jpgPath = path.join(rootDir, 'public', 'og-image.jpg');

  await page.screenshot({ path: pngPath, type: 'png' });
  await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 90 });

  await browser.close();
  console.log('Successfully generated public/og-image.png and public/og-image.jpg');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
