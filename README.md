# Portfolio Website — Marlon Müller

Personal portfolio website built with **Astro**, **Tailwind CSS v4**, **Sanity CMS**, and deployed on **Netlify**.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) (`@astrojs/netlify` SSR adapter + ClientRouter view transitions)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `@tailwindcss/typography`)
- **CMS:** Sanity (`personal-website/` studio built into `public/studio`)
- **Email & Verification:** Resend + JWT double-opt-in flow (`/api/contact/initiate` -> `/api/contact/verify`)
- **PDF & OG Generation:** Puppeteer (`scripts/generate-cv-pdf.mjs`, `scripts/generate-og-image.mjs`)

## Local Development

1. Copy `.env.example` to `.env` and fill in your Sanity, Resend, and `JWT_SECRET` values.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the Astro dev server:
   ```sh
   npm run dev
   ```
4. Build for production (generates CV PDFs first, then runs `astro build`):
   ```sh
   npm run build
   ```

## Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start local Astro dev server (`localhost:4321`) |
| `npm run build` | Build Sanity Studio, export CV PDFs & OG images, and build Astro to `./dist/` |
| `npm run preview` | Preview `./dist/` build locally |
| `npm run generate:pdf` | Export CV PDFs to `public/` using Puppeteer |
| `npm run generate:og` | Generate default + per-project 1200x630 OG images under `public/og/` |
| `npm run lint` | Run ESLint across project source files |
| `npm run lint --prefix personal-website` | Run ESLint across Sanity Studio schemas and config |
| `npm run typecheck` | Run `astro check` and `tsc --noEmit` |

## Analytics (Umami Cloud Hobby — $0/mo)

- Optional cookieless, GDPR-friendly analytics via `PUBLIC_UMAMI_WEBSITE_ID`.
- Set `PUBLIC_UMAMI_WEBSITE_ID` in **Netlify Environment Variables -> Production scope only** so `localhost`, `*.netlify.app` previews/branch deploys, and development builds never load or log hits.
- Privacy Policy note (add to Sanity Legal Page EN/DE when enabling):
  - **EN:** *This site uses cookieless, anonymized Umami Cloud analytics strictly to measure aggregated page views without personal data or cross-site tracking.*
  - **DE:** *Diese Website nutzt die cookiefreie, anonymisierte Analyse von Umami Cloud ausschließlich zur statistischen Reichweitenmessung ohne personenbezogene Daten oder Tracking über Websitegrenzen hinweg.*

## Sanity Studio & Smart Build Hook

The Sanity Studio workspace lives in `personal-website/`:

```sh
npm run build --prefix personal-website
```

This builds the embedded studio into `public/studio/`.

- **Smart Netlify Build Hook (`$0/mo`):** Configure a Netlify Build Hook triggered by a Sanity GROQ webhook filtered to `_type in ["cvSettings", "project"]` so CV PDFs and per-project Open Graph images regenerate automatically when CV or project records change, without wasting build minutes on routine edits.

## Lab Notebook Simulation Playgrounds

- Entries in `labEntry` support `interactivePlayground` (`airflow` | `solar` | `topography`) and optional JSON `initialParams`.
- Recommended deep-link slugs for subtle corner links from interactive site backgrounds (shown only when `notesSettings.enabled === true`): `sim-airflow`, `sim-solar`, `sim-topography`.
- The Solar System playground exposes pluggable orbital integrators (**Symplectic Verlet**, **Explicit Euler**, **RK4**) for stability and energy-drift comparison.

## Project Structure

- `src/pages/` — Bilingual (`/en/`, `/de/`) routes, API endpoints, dynamic `sitemap.xml.ts`, and `404.astro`
- `src/components/` — Reusable UI components (`HomePage.astro`, interactive timeline, `BookArchive.astro`, `LabNotebook.astro`, `TerminalContactForm.astro`, `CvDocument.astro`, `HomeSpinWheel.astro`, canvas backgrounds)
- `src/lib/` — Sanity queries (`sanity.ts`), Resend email templates (`email.ts`), JWT/HTML helpers (`jwt.ts`, `html.ts`)
- `src/i18n/` — Localization JSON dictionaries and helpers
- `personal-website/` — Sanity Studio v3 schemas and configuration
- `scripts/` — PDF/OG generators and Sanity sync/upload utilities
