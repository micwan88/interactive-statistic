---
requirement: requirement-1.md
date: 2026-06-06
---

# Plan 1 — Site scaffold + migrate 3 interactives

## Context / Findings
- Source files: `assets/jsx/{binomial-normal,clt,r-square}.jsx` — React + hooks + inline styles.
  - `binomial-normal.jsx` & `clt.jsx`: already dark theme, **text in Cantonese → translate to English**.
  - `r-square.jsx`: text already English, but **light theme → recolour to site dark palette**.
- Repo: `micwan88/interactive-statistic` → GitHub Pages base path `/interactive-statistic/`.
- **Blocker:** Node/npm not installed locally → cannot `npm install`/build/verify locally. CI (GitHub Actions) will build. Files will be authored correct; local verification not possible.

## Key decisions
- **Stack:** Vite + React + Tailwind CSS v3 (per CLAUDE.md).
- **Routing:** Single-page app with `react-router-dom` **HashRouter** (robust on GitHub Pages — no 404 on deep links/refresh). `index.html` is the single Vite entry that boots React; the *landing content* is the `/` route (`src/pages/Home.jsx`). This is the SPA interpretation of "index.html ← landing page".
- **Centralised, configurable styling** (CLAUDE.md §3):
  - `src/style/theme.js` — single source of truth: colour palette + font tokens (JS object, consumed by chart SVG/inline styles).
  - `tailwind.config.js` — extends `colors`/`fontFamily` from the same tokens.
  - `src/style/index.css` — Tailwind directives + base body (dark bg) + CSS variables.
  - Fonts (Space Mono, JetBrains Mono, Nunito Sans) loaded once in `index.html`; drop Noto Sans TC (English-only now).
- **Consistent look/feel** (req 7): `src/components/PageLayout.jsx` shell — dark bg, max-width container, top bar with "← Back" link + title. All 3 interactive pages use it.
- **Language:** keep components as `.jsx` (minimal change from source); `vite.config.ts` per CLAUDE.md.

## Tasks
- [x] 1. Scaffold project: `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `.gitignore`
- [x] 2. Centralised style: `src/style/theme.js` + `src/style/index.css`; wire Tailwind to tokens
- [x] 3. `src/components/PageLayout.jsx` shared shell
- [x] 4. Migrate `binomial-normal.jsx` → `src/pages/BinomialNormal.jsx` (English, theme tokens, PageLayout)
- [x] 5. Migrate `clt.jsx` → `src/pages/CLT.jsx` (English, theme tokens, PageLayout)
- [x] 6. Migrate `r-square.jsx` → `src/pages/RSquared.jsx` (dark recolour, theme tokens, PageLayout)
- [x] 7. Landing page `src/pages/Home.jsx` — cards linking to the 3 interactives
- [x] 8. `.github/workflows/deploy.yml` — build + deploy to GitHub Pages on push to main
- [x] 9. Sanity: cross-check imports/routes/base path

## Review

### What was built
- Vite + React + Tailwind SPA with HashRouter. Routes: `/` (Home), `/binomial-normal`, `/clt`, `/r-squared` — match `demos.js` links.
- Centralised tokens in `src/style/theme.js` (palette + alpha + fonts), consumed by `tailwind.config.js` and every page's chart code. `src/style/index.css` sets the dark base.
- `PageLayout.jsx` gives all three demos the same background, container, "← All demos" nav and gradient header → consistent look/feel (req 7).
- All three demos migrated: binomial-normal & clt fully translated Cantonese→English; r-square recoloured from light to the dark palette. Each demo's old per-file colour object now derives from the shared theme; per-file font `<link>` removed (fonts loaded once in `index.html`).
- GitHub Actions deploys `dist/` to Pages on push to `main`. Vite `base` = `/interactive-statistic/`.

### Surgical-change notes
- Dropped the unused `p` prop on `CoinRow` and the unused `height`/`value` destructure leftover — only orphans created by the migration (stripping the per-page wrapper). No unrelated refactors.
- Kept inline-style chart code as-is (only colour literals swapped for theme tokens) — rewriting SVG to Tailwind would be over-engineering.

### Verification status — IMPORTANT
- **Could NOT build/run locally: Node & npm are not installed on this machine.** Verified by static inspection only: no leftover CJK text, imports/routes/paths consistent, no stray references to removed colour keys.
- `npm install` is used in CI (no committed `package-lock.json` since Node was unavailable to generate one).
- **To verify:** install Node 18+, then `npm install && npm run dev`. To deploy: push to `main` and set GitHub repo → Settings → Pages → Source = "GitHub Actions".
