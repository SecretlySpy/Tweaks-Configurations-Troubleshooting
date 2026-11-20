# FIELDNOTES knowledge base

FIELDNOTES is the static, searchable web edition of this repository's operating-system setup, tuning, and troubleshooting material. It preserves source provenance while keeping unsafe or unresolved operational content behind explicit review boundaries.

## Current baseline

- Astro 7 and Starlight generate a static site under the GitHub Pages base path `/Tweaks-Configurations-Troubleshooting/`.
- The migration inventory covers 79 discovered files: 44 primary sources are mapped to 25 canonical guides, and 35 secondary configuration sources remain in review.
- Public output contains extracted text and traceability metadata, not raw `.bat`, `.cmd`, `.ps1`, `.reg`, or `.pow` files.
- Bookmarks and guided-reading progress stay in browser-local storage; there is no account, database, analytics service, or server API.
- The local automated baseline is green: 11 unit tests, 24 three-viewport browser tests, 42 static pages, 25 guide-level reference audits, and a 202-file artifact boundary scan.
- Publication, Figma parity approval, and legacy-file relocation are not complete and remain separately gated.

## Local commands

Run these commands from this directory with Node.js 22.23.4 or newer. Node.js 24 is the prepared CI version.

```powershell
npm ci
npm run dev
npm run check
npm run test:unit
npm run build
npm run references:check-live
npm run test:e2e
```

The Playwright browser is project-local and ignored by Git. Install it when a clean checkout does not already have it:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = '.playwright-browsers'
npx playwright install chromium
```

Do not execute migrated operating-system commands as part of website QA.

## Project map

| Path | Purpose |
| --- | --- |
| `content-map.json` | Canonical guide definitions and source-to-route mapping |
| `reference-audit.json` | Per-guide supplementary-reference status, scope, authority, and relationship |
| `scripts/generate-content.mjs` | TXT/script/registry/DOCX/PDF extraction and generated search data |
| `scripts/verify-*.mjs` | Coverage, references, source hashes, publication boundaries, local links/assets, and artifact-sensitive-data checks |
| `src/data/` | Generated guide, source-inventory, and coverage records |
| `src/pages/` | Static routes for collections, categories, guides, saved items, and 404 |
| `tests/` | Unit, security-boundary, local-state, accessibility, and browser-flow checks |
| `Project Guidelines/` | Scope, architecture, verification, decisions, setup, and handover records |

Start with [AI Documentation Notes](Project%20Guidelines/AI%20Documentation%20Notes.md) for the authoritative record map.
