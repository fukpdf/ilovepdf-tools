# ILovePDF

A free, browser-based PDF tools website with 36+ tools, all processing 100% in the browser — no file uploads, no servers, complete privacy.

## Run & Operate

- `pnpm --filter @workspace/ilovepdf run dev` — run the frontend dev server (port from $PORT env)
- Restart workflow: `artifacts/ilovepdf: web`

## Stack

- **Frontend**: Vanilla JS ES Modules + Tailwind CSS CDN (NO React/framework)
- **Dev server**: Vite (serves static JS modules — no build plugins used)
- **PDF processing**: pdf-lib@1.17.1 (CDN, loaded dynamically)
- **PDF rendering**: pdfjs-dist@3.11.174 (CDN, loaded dynamically)
- **OCR**: Tesseract.js@5 (CDN, loaded dynamically)
- **Word docs**: mammoth@1.6.0 (CDN, loaded dynamically)
- **HTML→PDF**: html2pdf.js@0.10.1 (CDN, loaded dynamically)
- **Spreadsheets**: xlsx@0.18.5 (CDN, loaded dynamically)

## Where Things Live

```
artifacts/ilovepdf/
├── index.html                    ← Shell HTML with Tailwind CDN, global CSS vars, modals
├── src/
│   ├── core/
│   │   ├── App.js                ← App init, cookie consent, terms modal, scroll-to-top
│   │   └── Router.js             ← Hash-based router; lazy-loads all 36 tools + 7 legal pages
│   ├── components/
│   │   ├── Header.js             ← Sticky header with logo, search, donate button
│   │   └── Footer.js             ← 4-column footer with all links
│   ├── pages/
│   │   ├── HomePage.js           ← Hero + 36-tool grid + stats
│   │   ├── AboutPage.js
│   │   ├── PrivacyPage.js
│   │   ├── TermsPage.js
│   │   ├── DisclaimerPage.js
│   │   ├── CookiePage.js
│   │   ├── ContactPage.js
│   │   └── DonatePage.js
│   ├── tools/                    ← 36 tool files (one per tool)
│   ├── seo/SEO.js                ← Per-route meta tag + JSON-LD injection
│   ├── brand/OutputFilenameManager.js
│   └── utils/helpers.js          ← loadScript, generateFilename, trustBar, setupDropZone, etc.
```

## Architecture Decisions

- **Zero server uploads**: All CDN libraries are loaded dynamically via `loadScript()` only when needed. Files never leave the browser.
- **Hash-based routing**: `#merge-pdf`, `#split-pdf`, etc. Tool modules lazy-loaded on navigation.
- **Filename convention**: Output files named `originalname-ilovepdf.ext` (branding in filename).
- **Tailwind via CDN**: No build step needed for CSS. `tailwind.config` set inline in HTML for custom colors.
- **CDN library versions**: pdfjs-dist@3.11.174 (NOT 4.x — uses different module format); pdf-lib@1.17.1 exposes `window.PDFLib`.

## Tools (36)

PDF: merge, split, compress, rotate, crop, organize, edit, watermark, sign, add-page-numbers, redact, protect, unlock, repair, ocr, compare, scan, ai-summarize, translate
Convert: pdf-to-word, pdf-to-excel, pdf-to-jpg, word-to-pdf, jpg-to-pdf, html-to-pdf, pdf-to-ppt, excel-to-pdf, ppt-to-pdf
Image: background-remover, crop-image, resize-image, image-filters, compress-image
Utility: number-to-words, currency-converter, workflow-builder

## User Preferences

- All processing is browser-side; never add server upload logic
- CDN library versions must be pinned (see stack above)
- Tool output filenames always end in `-ilovepdf.ext`
- pdfjs-dist@3.11.174 sets `GlobalWorkerOptions.workerSrc = ''`

## Cloudflare Pages Deployment

The pnpm workspace uses Replit-specific overrides (linux-x64 platform exclusions) that cause `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` on Cloudflare. The fix is a standalone npm-based build path that completely bypasses the pnpm workspace.

### Cloudflare Pages settings

| Setting | Value |
|---|---|
| Root directory | `artifacts/ilovepdf` |
| Build command | `bash build-cloudflare.sh` |
| Build output directory | `dist` |
| Framework preset | None |

### How it works

- `build-cloudflare.sh` temporarily swaps `package.json` with `package.cloudflare.json` (just vite@5, no workspace refs)
- Runs `npm install` — bypasses pnpm entirely, no lockfile mismatch possible
- Runs `vite build --config vite.config.cloudflare.js` — no PORT/BASE_PATH required
- Output goes to `artifacts/ilovepdf/dist/` — Cloudflare serves this directly
- `public/_headers` and `public/_redirects` are copied to `dist/` automatically by Vite

### Files involved

- `vite.config.cloudflare.js` — build config without PORT/BASE_PATH requirements, base='/'
- `package.cloudflare.json` — standalone npm package with only vite@5.4.19
- `build-cloudflare.sh` — build script that swaps package.json and runs npm install + vite build
- `public/_headers` — Cloudflare caching + security headers
- `public/_redirects` — SPA catch-all (`/* → /index.html 200`)

## PWA / Offline Support

- `public/sw.js` — Service worker with app-shell offline cache
- `public/manifest.json` — Web app manifest (installable, shortcuts to 4 tools)
- `index.html` — Registers SW on load; auto-updates when new SW is available
- Strategy: Navigate = network-first + cache fallback; JS/CSS/assets = cache-first; CDN = network-only (always fresh)

## Gotchas

- DO NOT upgrade pdfjs-dist to 4.x — it uses `.mjs` modules and breaks dynamic script loading
- `window.PDFLib` (not `PDFLib`) when using pdf-lib from CDN UMD build
- `window['pdfjs-dist/build/pdf']` is the global key for pdfjs-dist@3.x CDN build
- Vite only serves files; all logic is vanilla ES modules — do not add React plugins
- Each tool class must export a named class with `render()` and `setupEvents()` methods
- Router uses `Object.values(mod)[0]` to get the class from any tool module
- Do NOT run `bash build-cloudflare.sh` locally in the ilovepdf dir without restoring package.json — the script auto-restores it but if interrupted, run: `cp package.json.workspace.bak package.json`
