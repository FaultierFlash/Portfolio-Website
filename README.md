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
| `npm run build` | Generate `/en/cv` and `/de/cv` PDFs and build site to `./dist/` |
| `npm run preview` | Preview `./dist/` build locally |
| `npm run generate:pdf` | Export CV PDFs to `public/` using Puppeteer |
| `npm run lint` | Run ESLint across project source files |
| `npm run typecheck` | Run `astro check` and `tsc --noEmit` |

## Sanity Studio

The Sanity Studio workspace lives in `personal-website/`:

```sh
npm run build --prefix personal-website
```

This builds the embedded studio into `public/studio/`.

## Project Structure

- `src/pages/` — Bilingual (`/en/`, `/de/`) routes, API endpoints, dynamic `sitemap.xml.ts`, and `404.astro`
- `src/components/` — Reusable UI components (`HomePage.astro`, interactive timeline, `BookArchive.astro`, `LabNotebook.astro`, `TerminalContactForm.astro`, `CvDocument.astro`, `HomeSpinWheel.astro`, canvas backgrounds)
- `src/lib/` — Sanity queries (`sanity.ts`), Resend email templates (`email.ts`), JWT/HTML helpers (`jwt.ts`, `html.ts`)
- `src/i18n/` — Localization JSON dictionaries and helpers
- `personal-website/` — Sanity Studio v3 schemas and configuration
- `scripts/` — PDF/OG generators and Sanity sync/upload utilities
