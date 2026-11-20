# FIELDNOTES decisions and handover

Status date: 2026-11-19  
Working branch: `feat/fieldnotes-knowledge-base`  
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
| ADR-009 | Preserve the user-owned untracked n8n PDF in place. | It is source input without a Git revision and must not be overwritten, moved, or implicitly published. | Any tracking/relocation needs exact-path approval and disclosure review. |
| ADR-010 | Record Figma fidelity as blocked rather than infer parity. | The connector required reauthentication, so live frame evidence was unavailable. | Resume with the connector and actual browser captures; do not treat the handover description as a visual pass. |

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

- The final combined `npm test` gate completed successfully from unit tests through the 24-case browser matrix.
- 79 discovered sources are inventoried: 44 primary and 35 secondary-review.
- All 44 primary sources map to 25 canonical guides: 20 published, two review-only, and three blocked.
- `npm run check` completed with zero issues across 29 files.
- `npm run test:unit` passed all 11 tests.
- `npm run build` produced and verified 42 static HTML pages; Pagefind indexed 42 pages.
- Reference coverage is explicit for all 25 guides: 22 supplementary entries point to 20 unique live HTTPS destinations checked on 2026-11-19.
- The 202-file build artifact passed internal-link/asset, prohibited-source, malformed URL, and high-confidence secret-signature checks.
- `npm audit` reported zero known vulnerabilities in all-dependency and production-only scopes.
- The final Playwright matrix passed 24/24 at desktop, tablet, and mobile widths. It covers full-text and degraded search, local state, exact copy and clipboard denial, 404/empty states, mobile search/drawer focus, axe, and reduced motion.
- Six local homepage/article screenshots were inspected for responsive sanity. Live Figma comparison remains blocked, so they are not parity evidence.

## Open work, in order

1. Perform manual representative PDF/DOCX fidelity, screen-reader, 200% zoom, contrast, and focus-obscuration review.
2. Reauthenticate Figma and complete reference-frame comparisons.
3. Inspect the exact staged set, diff, and outgoing history without printing sensitive values.
4. Ask for publication authorization; enable/verify Pages and observe the workflow.
5. Smoke-test the deployed URL and record rollback evidence.
6. Only then prepare an exact legacy relocation proposal for separate approval.

## Protected gates and blockers

- **Figma:** connector reauthentication required; visual parity is UNVERIFIED.
- **Publication:** workflow is local only; no push or deployed-site evidence exists.
- **Legacy files:** no move/delete is authorized. The untracked n8n PDF remains at `Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf`.
- **Sensitive material:** Kaspersky exports and original Xiaomi router captures require specific review; original screenshots are not public assets.
- **Operational source behavior:** OS commands were not executed; compatibility/effect claims remain source-derived or review annotations.

## Resume instructions

From `knowledge-base/`, install from the lockfile, regenerate, and run the gates in `Tech Stack Setup Guide.md`. Do not diagnose website behavior by running any migrated `.bat`, `.cmd`, `.ps1`, `.reg`, `.pow`, ADB, root, or shell procedure. If generated data changes unexpectedly, compare source hashes, Git revisions, and `content-map.json` before modifying output files.
