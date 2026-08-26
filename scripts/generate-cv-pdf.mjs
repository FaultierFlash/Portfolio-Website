import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function isServerRunning(url) {
  try {
    const res = await fetch(url);
    return res.ok || res.status === 200 || res.status === 302;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 35000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (await isServerRunning(url)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

async function main() {
  console.log('🚀 Starting Build-Time Vector PDF Generation...');

  const host = process.env.HOST || '127.0.0.1';
  const port = process.env.PORT || 4321;
  const baseUrl = `http://${host}:${port}`;
  let serverProcess = null;
  let serverLogs = '';

  // 1. Check if Astro dev server is already running on port
  const running = await isServerRunning(`${baseUrl}/en/cv`);
  if (!running) {
    console.log(`📡 Starting local Astro dev server on ${baseUrl}...`);
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const args = ['astro', 'dev', '--host', host, '--port', String(port)];

    serverProcess = spawn(cmd, args, {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    serverProcess.stdout?.on('data', (data) => {
      const text = data.toString();
      serverLogs += text;
      if (process.env.DEBUG) process.stdout.write(`[astro] ${text}`);
    });

    serverProcess.stderr?.on('data', (data) => {
      const text = data.toString();
      serverLogs += text;
      process.stderr.write(`[astro-err] ${text}`);
    });

    serverProcess.on('error', (err) => {
      console.error('❌ Failed to spawn Astro server process:', err);
    });

    const isReady = await waitForServer(`${baseUrl}/en/cv`, 40000);
    if (!isReady) {
      if (serverProcess) serverProcess.kill();
      console.error('--- Astro Server Logs ---');
      console.error(serverLogs || '(No output recorded from server)');
      console.error('-------------------------');
      throw new Error(`Failed to connect to Astro server on ${baseUrl} within timeout.`);
    }
    console.log('✅ Astro server is ready!');
  } else {
    console.log(`✅ Detected running server on ${baseUrl}`);
  }

  // 2. Launch Puppeteer
  console.log('🌐 Launching Headless Chromium...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const publicDir = path.join(rootDir, 'public');
  const distClientDir = path.join(rootDir, 'dist', 'client');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const targets = [
    {
      url: `${baseUrl}/en/cv`,
      filename: 'Marlon_Hendrik_Mueller_CV.pdf',
      label: 'English CV',
    },
    {
      url: `${baseUrl}/de/cv`,
      filename: 'Marlon_Hendrik_Mueller_Lebenslauf.pdf',
      label: 'German Lebenslauf',
    },
  ];

  try {
    for (const target of targets) {
      console.log(`📄 Generating ${target.label} from ${target.url}...`);
      const page = await browser.newPage();

      await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait for fonts & DOM stability
      await page.evaluateHandle('document.fonts.ready');
      await new Promise((r) => setTimeout(r, 800));

      // Emulate print media for pure vector CSS output
      await page.emulateMediaType('print');

      const outPublicPath = path.join(publicDir, target.filename);
      await page.pdf({
        path: outPublicPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      });

      console.log(`✅ Saved: public/${target.filename}`);

      // If dist/client exists (e.g. if run post-build), copy to dist/client as well
      if (fs.existsSync(distClientDir)) {
        const outDistPath = path.join(distClientDir, target.filename);
        fs.copyFileSync(outPublicPath, outDistPath);
        console.log(`✅ Copied to: dist/client/${target.filename}`);
      }

      await page.close();
    }
  } finally {
    await browser.close();
    if (serverProcess) {
      console.log('🛑 Stopping temporary Astro server...');
      serverProcess.kill();
    }
  }

  console.log('🎉 Vector PDF generation complete!');
}

main().catch((err) => {
  console.error('❌ PDF Generation Error:', err);
  process.exit(1);
});
