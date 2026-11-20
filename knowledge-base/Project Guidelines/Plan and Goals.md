# Technical Resources plan and goals

Status date: 2026-11-20
Delivery state: Figma-aligned local implementation and automated verification complete; manual fidelity/accessibility approval and protected release gates remain open.

## Outcome

Deliver a static GitHub Pages knowledge base that makes the repository's setup, tuning, and troubleshooting material easier to find and safer to review without losing exact source text, provenance, risk context, or recovery relationships.

## Users and core journeys

1. A reader chooses Windows, Linux, or Android and narrows the collection by application setup, tweaks, or troubleshooting.
2. A reader searches titles, summaries, keywords, and extracted source text.
3. A reader reviews compatibility and risk warnings before copying an exact source transcription.
4. A returning reader saves a guide or resumes browser-local guided-reading progress.
5. A maintainer regenerates content, verifies coverage and public-output boundaries, then produces a reproducible static artifact.

## Requirements

| ID | Requirement | Current implementation |
| --- | --- | --- |
| FR-01 | Provide a responsive, accessible landing page and OS collections. | Custom Astro pages for overview, OS, category, all guides, saved guides, article, and 404 routes. |
| FR-02 | Preserve one canonical route per guide and allow cross-listing. | `content-map.json` owns canonical slugs and placements; n8n is cross-listed for Windows and Linux. |
| FR-03 | Account for every primary source. | 44 of 44 primary sources map to a canonical guide; 100% primary accounting. |
| FR-04 | Keep secondary configuration exports out of automatic publication. | 35 secondary sources are inventoried with `secondary-review` disposition. |
| FR-05 | Preserve exact text, line breaks, source paths, hashes, and revisions. | Build-time extraction and SHA-256 provenance ledger per guide. |
| FR-06 | Distinguish source material from Technical Resources annotations. | Article sections label source-preserved text, compatibility, warnings, and migration exceptions. |
| FR-07 | Withhold unsafe unresolved operational procedures. | Two review-only and three blocked guides omit reusable operational source text. |
| FR-08 | Support full-text discovery and useful empty/error states. | On-demand JSON directory search plus Starlight/Pagefind build indexing. |
| FR-09 | Support exact copying with a denial fallback. | Clipboard action falls back to selected source text when direct write fails. |
| FR-10 | Store bookmarks and progress without an account. | Versioned browser-local schema; corrupt, denied, and changed-reading-version cases are covered by unit tests. |
| FR-11 | Work at desktop, tablet, and mobile widths with reduced motion. | Figma-aligned responsive CSS plus a 27/27 passing Playwright matrix at 1440 × 900, 900 × 1100, and 390 × 844. |
| FR-12 | Produce a static artifact for the repository's GitHub Pages subpath. | Astro `site`, `base`, trailing-slash settings, `.nojekyll`, and one Astro-native workflow that tests and uploads only `dist`. |
| NFR-01 | Never execute migrated OS-modification content during web generation or QA. | Extractors read files; the application provides no execution endpoint. |
| NFR-02 | Publish no raw executable, registry, or power-plan source assets. | Artifact verification rejects `.bat`, `.cmd`, `.ps1`, `.reg`, and `.pow` output. |
| NFR-03 | Remain usable without JavaScript for core reading and navigation. | Static HTML contains navigation, article text, warnings, and provenance; enhancement scripts add search/state/copy behavior. |
| NFR-04 | Keep build and source decisions reproducible and reviewable. | Pinned dependency versions, lockfile, generated manifests, tests, and these handover records. |

## Scope boundaries

Included:

- The 44 primary source files under `Setups/OS Environment/` and `Setups/Programming Related/`.
- Inventory-only accounting for 35 sources under `Setups/Softwares_Apps_Extensions Configurations/`.
- Local implementation, static generation, browser-local state, search, accessibility automation, and deployment preparation.

Excluded or separately gated:

- Executing or validating the effect of source commands on Windows, Linux, Android, firmware, or hardware.
- Publishing raw scripts/configuration exports or unredacted router screenshots.
- Accounts, cloud sync, databases, comments, analytics, or a server API.
- Pixel-perfect human Figma approval, physical-device/browser review, and deployed-site parity.
- Git commit, push, GitHub Pages enablement/deployment, or production smoke testing.
- Moving or deleting legacy source files, including the tracked n8n PDF.

## Assumptions

| ID | Assumption | Reason | Impact if wrong | Status |
| --- | --- | --- | --- | --- |
| A-01 | The public repository URL will remain `SecretlySpy/Tweaks-Configurations-Troubleshooting`. | It defines the Astro `site` and `base`. | Generated URLs and deep links require configuration changes. | Assumed |
| A-02 | GitHub Pages will deploy from GitHub Actions on `main`. | The prepared workflow follows the repository-action model. | Publication workflow and branch trigger must change. | Assumed; protected gate |
| A-03 | Original files remain the authority for commands and values. | Summary documents contain known overstatements or mismatches. | Migration fidelity could be evaluated against the wrong record. | Verified by source audit |
| A-04 | Browser-local state is acceptable and intentionally device-specific. | The requested static architecture has no identity/backend layer. | Cross-device bookmarks/progress would need a new privacy and backend design. | Assumed |
| A-05 | The tracked n8n PDF remains canonical source input in its current path. | Generated provenance now records its repository revision. | Relocation or raw asset publication could break provenance or expand disclosure. | Verified and preserved |

## Milestones and acceptance

| Milestone | Definition of done | State |
| --- | --- | --- |
| M1 — inventory | Source counts reconcile; every primary source has a guide or exception; sensitive items are identified. | Complete locally |
| M2 — application | Static routes, responsive UI, source reader, search, local state, safety annotations, and provenance are implemented. | Complete locally |
| M3 — verification | Type/static, unit, build, artifact, responsive browser, accessibility, link, and security checks pass with recorded evidence. | Automated local gate complete; manual binary fidelity, screen-reader, and 200% zoom review remain open |
| M4 — design review | Live implementation is compared with the named Figma frames at reference viewports. | Figma-aligned implementation and local comparison complete; final human/device/deployed approval UNVERIFIED |
| M5 — publication | Exact staged/outgoing files pass sensitive-data review; Pages source is GitHub Actions; the single workflow deploys; deep links and production flows pass. | Workflow repaired locally; repository setting, push, remote run, and deployment not executed |
| M6 — consolidation | Migration mapping, public deployment, dependencies, links, and rollback are verified before any legacy relocation. | Protected gate; not started |

## Delivery risks

| ID | Risk | Likelihood | Impact | Early signal | Mitigation | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | High-risk or licensing-circumvention instructions become reusable public content. | Med | High | Review-only/blocked text appears in generated data or `dist`. | Withhold source text by status and test the public boundary. | Maintainer | Mitigated locally |
| R-02 | Binary extraction changes commands, ordering, or formatting. | Med | High | Extracted output differs from page/image inspection. | Keep hashes and extraction status; require manual source fidelity review before claiming content acceptance. | Maintainer | Open |
| R-03 | GitHub Pages base-path handling breaks routes or assets. | Med | High | Local preview returns 404 under the repository subpath. | Use relative Playwright routes beneath the exact base path and verify local targets/deep links. | Maintainer | Mitigated locally; deployed state unverified |
| R-04 | Configuration exports or screenshots expose credentials or identifiers. | Med | High | Secret scan or visual review flags values. | Keep secondary sources out of the public artifact; reject prohibited assets and high-confidence signatures; create only reviewed/redacted derivatives. | Maintainer/security reviewer | Public artifact mitigated; source review remains open |
| R-05 | Visual implementation drifts from Figma. | Med | Med | Reference-frame comparison shows spacing, type, state, or breakpoint differences. | Keep node IDs and local captures in the evidence record; repeat exact-size human and deployed comparisons before claiming parity. | Design reviewer | Mitigated locally; final approval open |
| R-06 | Legacy relocation loses dependencies or recoverability. | Low before approval | High | A source is moved before deployed-route and hash verification. | Require explicit target mapping, backup/rollback, and separate approval after publication. | Repository owner | Gated |
