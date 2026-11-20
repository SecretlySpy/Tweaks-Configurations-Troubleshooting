# FIELDNOTES decisions and handover

Status date: 2026-11-20
Working branch: `main`
External side effects: no commit, push, Pages deployment, or legacy relocation performed.

## Decision log

| ID | Decision | Rationale | Consequence / reversal |
| --- | --- | --- | --- |
| ADR-001 | Use Astro 7 with Starlight in a self-contained `knowledge-base/` package. | Produces a static, accessible, Pages-compatible site while retaining Starlight search/document capabilities. | Can be replaced, but generated content contracts and routes should remain stable. |
| ADR-002 | Treat original files plus `content-map.json` as the migration authority. | Repository summaries contain known mismatches; direct provenance is auditable. | Update guide definitions and regenerate rather than editing generated JSON. |
| ADR-003 | Use one canonical guide with multiple placements instead of duplicated articles. | Prevents drift while supporting cross-platform discovery, especially n8n and the software compendium. | Placement changes do not change the canonical article ID/slug. |
| ADR-004 | Publish extracted text, not raw OS-modification artifacts. | Reduces accidental execution/download risk and permits safety annotations/provenance. | Original files remain in the repository and are never modified by the build. |
| ADR-005 | Withhold operational text for `review-only` and `blocked` guides. | Tool-X and license/credential-abuse material require stronger review or should not be operationalized. | Status can change only after scoped safety/legal/reference review and new tests. |
| ADR-006 | Inventory secondary configuration exports without publishing them. | Some are large, binary, machine-specific, credential-like, or visually sensitive. | Review/redact individual sources before adding any derivative to a guide. |
| ADR-007 | Store reading state locally with a versioned schema. | Meets static/privacy constraints without introducing accounts or backend data. | Cross-device sync would require a new architecture, privacy analysis, and user authorization. |
| ADR-008 | Prepare GitHub Pages Actions, but keep publication separate. | The requested destination is Pages, while push/deploy and repository settings are protected external actions. | Run only after exact staged/outgoing review and explicit authorization. |
| ADR-009 | Preserve the n8n PDF in place and record its actual tracked provenance. | It is canonical source input and the generator now records its Git-backed revision instead of labeling it untracked. | Relocation or raw public-asset publication still requires separate review and approval. |
| ADR-010 | Implement from live Figma frame evidence without claiming pixel perfection. | The authenticated connector exposed the named desktop/tablet/mobile home, collection, and n8n article frames, enabling measured implementation and local comparison. | Record the inspected node IDs and captures; keep human/device/deployed approval explicitly unverified. |
| ADR-011 | Use one Astro-native Pages workflow and opt out of Jekyll. | The legacy Jekyll job parsed `.astro` frontmatter as YAML, while the old static job uploaded the repository rather than verified output. | Run `npm test`, require `.nojekyll`, upload only `dist`, and keep the remote Pages source/deployment gate separate. |

## Current implementation map

| Area | Authoritative path |
| --- | --- |
| Dependency/runtime contract | `package.json`, `package-lock.json`, `tsconfig.json` |
| Static site/base configuration | `astro.config.mjs` |
| Canonical migration map | `content-map.json` |
| Extraction and generation | `scripts/generate-content.mjs` |
| Build verification | `scripts/verify-content.mjs` |
| Generated migration evidence | `src/data/*.generated.json`, `public/data/search-index.json` |
| Navigation and UI | `src/components/`, `src/layouts/`, `src/pages/`, `src/styles/global.css` |
| Local state | `src/lib/local-state.mjs` |
| Unit/browser evaluation | `tests/unit/`, `tests/e2e/`, `playwright.config.mjs` |
| Deployment preparation | `../../.github/workflows/fieldnotes-pages.yml` |
| Project records | `Project Guidelines/` |

## Verified progress

- The final post-design `npm test` gate passed from all 11 unit tests through Astro diagnostics, production build/verifiers, and the 27-case browser matrix.
- 79 discovered sources are inventoried: 44 primary and 35 secondary-review.
- All 44 primary sources map to 25 canonical guides: 20 published, two review-only, and three blocked.
- `npm run check` completed with zero issues across 30 files.
- `npm run test:unit` passed all 11 tests.
- `npm run build` produced and verified 42 static HTML pages; Pagefind indexed 42 pages.
- Reference coverage is explicit for all 25 guides: 22 supplementary entries point to 20 unique live HTTPS destinations checked on 2026-11-19.
- The 203-file build artifact passed internal-link/asset, prohibited-source, malformed URL, and high-confidence secret-signature checks.
- `npm audit` reported zero known vulnerabilities in all-dependency and production-only scopes.
- The final Playwright matrix passed 27/27 at desktop, tablet, and mobile widths after repairing bookmark visibility and scrollable-code-region accessibility.
- Nine local homepage/Windows collection/n8n article screenshots were inspected across desktop, tablet, and mobile. They were compared with live Figma nodes `15:26`, `25:75`, `16:38`, `16:158`, `58:297`, `59:310`, and `28:197`; final human/device/deployed approval remains unverified.
- The single Pages workflow passed local YAML/build checks, requires `.nojekyll`, and uploads only `knowledge-base/dist`; no remote run was observed.

## Open work, in order

1. Perform manual representative PDF/DOCX fidelity, screen-reader, 200% zoom, contrast, and focus-obscuration review.
2. Complete final human Figma/zoom/device review.
3. Inspect the exact staged set, diff, and outgoing history without printing sensitive values.
4. Ensure Pages uses GitHub Actions, ask for publication authorization, and observe the workflow.
5. Smoke-test the deployed URL and record rollback evidence.
6. Only then prepare an exact legacy relocation proposal for separate approval.

## Protected gates and blockers

- **Figma:** named frames were inspected and implemented locally; pixel-perfect human approval, physical-device/browser review, and deployed parity are UNVERIFIED.
- **Publication:** the Astro-native workflow is local only; Pages source configuration, push, remote run, and deployed-site evidence remain UNVERIFIED.
- **Legacy files:** no move/delete is authorized. The tracked n8n PDF remains at `Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf`.
- **Sensitive material:** Kaspersky exports and original Xiaomi router captures require specific review; original screenshots are not public assets.
- **Operational source behavior:** OS commands were not executed; compatibility/effect claims remain source-derived or review annotations.

## Resume instructions

From `knowledge-base/`, install from the lockfile, regenerate, and run the gates in `Tech Stack Setup Guide.md`. Do not diagnose website behavior by running any migrated `.bat`, `.cmd`, `.ps1`, `.reg`, `.pow`, ADB, root, or shell procedure. If generated data changes unexpectedly, compare source hashes, Git revisions, and `content-map.json` before modifying output files.
