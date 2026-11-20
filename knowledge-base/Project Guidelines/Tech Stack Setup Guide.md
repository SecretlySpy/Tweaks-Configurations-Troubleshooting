# Technical Resources tech stack setup guide

This guide documents the local Windows/PowerShell path actually used on 2026-11-19. Linux/macOS setup and a clean GitHub-hosted runner remain **UNVERIFIED** until executed.

## Prerequisites

- Node.js `>=22.23.4`; Node.js 24 is the prepared CI version.
- npm with lockfile support; the verified local environment used npm 11.13.0.
- Git for tracked-source revision metadata.
- Network access for the initial package and Playwright browser install.

Do not run this project from a copy that omits the repository's `Setups/` source tree; content generation resolves sources from the repository root.

## Clean install

From the repository root:

```powershell
Set-Location -LiteralPath '.\knowledge-base'
npm ci --no-audit --no-fund
$env:PLAYWRIGHT_BROWSERS_PATH = '.playwright-browsers'
npx playwright install chromium
```

The browser download stays under `knowledge-base/.playwright-browsers/` and is ignored by Git. Do not replace project variables with `$HOME`, `$home`, or `$CODEX_HOME` in automation.

## Develop locally

```powershell
npm run dev
```

The command regenerates source-derived data before starting Astro. Use the URL printed by Astro. The production configuration includes the repository base path, so do not assume root-hosted links are representative of GitHub Pages.

## Generate and inspect migration data

```powershell
npm run content:generate
Get-Content -LiteralPath '.\src\data\coverage.generated.json'
```

Expected baseline:

- 79 discovered sources.
- 44 primary sources, all mapped.
- 35 secondary sources held for review.
- 25 guides: 20 published, two review-only, three blocked.

The generator caches unchanged inputs. Edit source files or `content-map.json`, never the generated JSON, when a migration record must change.

## Run verification gates

```powershell
npm run test:unit
npm run check
npm run build
npm run references:check-live
npm run test:e2e
```

Or run the combined sequence:

```powershell
npm test
```

The verified local baseline is:

- Unit: 11/11 passed.
- Astro check: 0 errors, 0 warnings, 0 hints across 29 files.
- Build: 42 static HTML pages and 42 Pagefind-indexed pages.
- Content/reference verify: 25 guides, 79 sources, 25 reference dispositions, 22 supplementary entries, and 42 built HTML pages.
- Artifact verify: 202 files with no broken local target, prohibited source asset, malformed/executable URL, or high-confidence secret signature.
- Live reference check: 20 unique reviewed HTTPS destinations resolved on 2026-11-19.
- Browser matrix: 24/24 passed across desktop, tablet, and mobile Chromium.
- Dependency audit: zero known vulnerabilities in complete and production-only scopes on 2026-11-19.

`npm test` intentionally excludes `references:check-live` because deterministic builds must not fail when an external documentation provider or network is temporarily unavailable. Run the live check during a dated reference review.

## Preview the production build

```powershell
npm run build
npm run preview -- --host 127.0.0.1 --port 4321
```

Representative route prefix:

```text
http://127.0.0.1:4321/Tweaks-Configurations-Troubleshooting/
```

Check the root plus direct collection, category, guide, saved, search, and unknown routes. Confirm both navigation clicks and a fresh direct request work under the subpath.

## Common failure paths

| Symptom | Check | Safe response |
| --- | --- | --- |
| Source file not found | Run from `knowledge-base/` inside the full repository; inspect the exact `content-map.json` path. | Correct the map/source path; do not fabricate generated content. |
| PDF warning during extraction | Confirm the process completes and extraction status/hash are present. | Compare the generated transcription with the original; keep manual fidelity UNVERIFIED until checked. |
| Guide missing from output | Check status, source extraction, canonical slug, and generated guide record. | Fix the authority file and regenerate; do not edit `dist`. |
| Preview returns Technical Resources 404 | Compare Playwright/base URL with Astro `base`; leading-slash test routes escape a subpath base URL. | Keep the trailing-slash base URL and navigate with relative test routes; rerun the complete matrix. |
| Search index unavailable | Check `public/data/search-index.json`, built assets, and base-prefixed fetch URL. | Preserve the static directory and show the failure/empty state. |
| Bookmark/progress does not persist | Inspect browser storage access and `technical resources:reading-state:v1`. | Reading must remain usable; do not add remote storage as an implicit fix. |
| Figma tools fail | Confirm connector authentication. | Reauthenticate; record parity as blocked rather than inferred. |

## Publication preparation

The Pages workflow is prepared at `.github/workflows/technical-resources-pages.yml` relative to the repository root. It is not a deployment instruction or authorization by itself.

Before any push:

1. Run all gates and update `Verification and Evaluation.md` with exact results.
2. Scan `dist`, the exact staged file set, staged diff, and outgoing history without printing detected sensitive values.
3. Confirm the untracked `Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf` has not been overwritten, moved, or implicitly staged.
4. Obtain explicit publication authorization and verify repository Pages settings.
5. After deployment, test the public base path and deep links and record the release/rollback revision.
