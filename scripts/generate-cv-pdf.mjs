import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function checkUrl(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return res.ok || res.status === 200 || res.status === 302;
  } catch {
    return false;
  }
}

async function findWorkingBaseUrl(port) {
  if (await checkUrl(`http://127.0.0.1:${port}/en/cv`)) return `http://127.0.0.1:${port}`;
  if (await checkUrl(`http://localhost:${port}/en/cv`)) return `http://localhost:${port}`;
  return null;
}

async function waitForWorkingServer(port, timeoutMs = 35000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const working = await findWorkingBaseUrl(port);
    if (working) return working;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return null;
}

async function main() {
  console.log('🚀 Starting Build-Time Vector PDF Generation...');

  const host = process.env.HOST || '127.0.0.1';
  const port = process.env.PORT || 4321;
  let serverProcess = null;
  let serverLogs = '';

  // 1. Check if Astro dev server is already running on port
  let activeBaseUrl = await findWorkingBaseUrl(port);
  if (!activeBaseUrl) {
    console.log(`📡 Starting local Astro dev server on http://${host}:${port}...`);
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const args = ['astro', 'dev', '--host', host, '--port', String(port)];

    serverProcess = spawn(cmd, args, {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      detached: process.platform !== 'win32',
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

    activeBaseUrl = await waitForWorkingServer(port, 40000);
    if (!activeBaseUrl) {
      if (serverProcess) serverProcess.kill();
      console.error('--- Astro Server Logs ---');
      console.error(serverLogs || '(No output recorded from server)');
      console.error('-------------------------');
      throw new Error(`Failed to connect to Astro server on port ${port} within timeout.`);
    }
    console.log(`✅ Astro server is ready at ${activeBaseUrl}!`);
  } else {
    console.log(`✅ Detected running server on ${activeBaseUrl}`);
  }

  const baseUrl = activeBaseUrl;

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
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
    if (serverProcess) {
      console.log('🛑 Stopping temporary Astro server...');
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t']);
        } else {
          // Kill process group on Linux/macOS
          try {
            process.kill(-serverProcess.pid, 'SIGKILL');
          } catch {
            serverProcess.kill('SIGKILL');
          }
        }
      } catch (e) {
        console.warn('Warning when stopping Astro server:', e.message);
      }
    }
  }

  console.log('🎉 Vector PDF generation complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ PDF Generation Error:', err);
  process.exit(1);
});
