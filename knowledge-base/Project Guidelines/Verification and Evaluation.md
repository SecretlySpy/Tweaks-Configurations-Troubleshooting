# FIELDNOTES verification and evaluation

Status date: 2026-11-19. Evidence labels are `PASS`, `FAIL`, `BLOCKED`, `UNVERIFIED`, or `N/A`.

## Executed evidence

| Area | Command or observation | Result | Status |
| --- | --- | --- | --- |
| Combined deterministic gate | `npm test` | Unit, Astro check, production build/verifiers, and all 24 browser cases completed in one final successful run. | PASS |
| Astro/type/static analysis | `npm run check` | 29 files checked; 0 errors, 0 warnings, 0 hints. | PASS |
| Unit and boundary tests | `npm run test:unit` | 11 of 11 passed: coverage, hashes, extraction/publication boundary, cross-listing, storage failures/versioning, HTML-injection boundary, and public search boundary. | PASS |
| Production build | `npm run build` | 42 static HTML pages generated; Pagefind indexed 42 pages; sitemap emitted. | PASS |
| Content/reference/artifact verification | Invoked by `npm run build` | 25 guides, 79 sources, 25 reference dispositions/22 entries, 42 HTML pages, and 202 artifacts verified; no broken local target, prohibited source asset, malformed/executable URL, or high-confidence credential signature. | PASS |
| Live supplementary references | `npm run references:check-live` | 20 unique reviewed HTTPS destinations resolved without logging response content. | PASS on 2026-11-19 |
| Browser matrix | `npm run test:e2e` | 24 of 24 passed at 1440 × 900, 900 × 1100, and 390 × 844 after repairing the harness base-path root cause. | PASS |
| Responsive screenshot review | Six generated home/article captures | Homepage and n8n article inspected at desktop, tablet, and mobile widths; no visible clipping, page overflow, or unusable control was observed. This is not Figma parity evidence. | PASS for local visual sanity |
| Dependency advisory audit | `npm audit --json`; `npm audit --omit=dev --json` | 0 known vulnerabilities at info, low, moderate, high, or critical severity in both scopes. | PASS on 2026-11-19 |
| Figma comparison | Connector session/identity attempt | Connector required reauthentication; frames could not be inspected. | BLOCKED |
| Deployed GitHub Pages | Not executed | No live URL, workflow run, deep-link smoke test, or rollback exercise observed. | UNVERIFIED |
| Native/device command behavior | Intentionally not executed | Website QA does not run OS modifications. | N/A |

The earlier empty-`i18n` notice was resolved by explicitly registering the collection with an empty English override. Final check/build output contains no Starlight collection warning.

## Acceptance matrix

| Requirement | Positive case | Negative/failure case | Current evidence |
| --- | --- | --- | --- |
| Inventory coverage | All 44 primary sources map to one or more guide definitions. | Missing/duplicate IDs, slugs, paths, or hashes fail checks. | PASS for primary accounting; secondary sources remain review-only by design. |
| Source fidelity | TXT/script/registry/DOCX/PDF text, paths, hashes, revisions, pages, and references are recorded. | Extraction failure is visible and a published guide requires readable content. | Automated integrity PASS; manual binary comparison UNVERIFIED. |
| Classification | Windows/Linux/Android and category routes reflect source content; n8n cross-lists Windows/Linux. | Misplaced Windows registry guide is not left classified as Android. | PASS by manifest/unit inspection. |
| Content safety | Compatibility, risk, annotations, provenance, and no-execution warning remain visible. | Review-only/blocked instructions do not appear in articles or public search. | PASS by unit/build checks. |
| Navigation/routes | Root, collections, categories, directory, saved, article, and 404 build under the repository base. | Direct deep links and wrong routes behave predictably. | PASS in build, artifact-link scan, and 24-case preview matrix. |
| Search | Known title and full-text terms return guides; empty query/result states work. | Missing/unavailable index remains usable and explanatory. | PASS, including intercepted index outage with metadata-search fallback. |
| Article reader | Full and guided modes, exact copy, provenance, related links, and status notices work. | Clipboard denial selects text; non-operational content remains withheld. | PASS, including manual-selection fallback and supplementary reference rendering. |
| Local state | Bookmark/progress survives refresh. | Corrupt JSON, old schema, denied reads/writes, quota errors, and source-version changes recover safely. | PASS in the 11-test unit suite and browser refresh/persistence flow. |
| Responsive UI | No viewport overflow at desktop/tablet/mobile; drawer works on mobile. | Long paths, commands, titles, and tables stay bounded; Escape closes drawer. | PASS at three reference widths; six screenshots inspected. Browser 200% zoom remains UNVERIFIED. |
| Accessibility | Semantic structure, labels, focus, reduced motion, keyboard operation, and useful states. | No serious/critical automated axe findings on representative pages. | PASS for automated axe, reduced motion, mobile focus loop/return, and keyboard search; screen-reader/manual 200% zoom remain UNVERIFIED. |
| Security/privacy | Escaped source text, allow-listed publication, no raw executables, no automatic execution, local-only state. | Hostile HTML/script text, secret-bearing exports, and blocked operations cannot leak into public output. | PASS for unit boundary, 202-file artifact scan, and zero-vulnerability dependency audit. |
| Deployment | Clean locked install builds and Pages workflow publishes the reviewed artifact. | Base-path/deep-link and rollback scenarios pass on the public URL. | Workflow prepared only; live state UNVERIFIED. |

## Required release checks still open

1. Manually compare representative PDF/DOCX extractions with the originals, especially commands, punctuation, tables, page order, and images. The Adobe connector also required reauthentication, so this remains UNVERIFIED.
2. Complete manual 200% zoom, focus-obscuration, contrast review, and at least one screen-reader pass; automated axe/keyboard evidence is not a substitute.
3. Reauthenticate Figma and compare actual approved frames with the six local captures at the reference widths.
4. Before push, inspect the exact staged files, staged diff, and outgoing history without printing sensitive values; the current artifact scan is not an outgoing-history scan.
5. After explicit publication approval, observe the GitHub Actions run and perform public deep-link, search, saved-state, 404, and rollback smoke tests.

## Evidence discipline

- A static build is not a browser, device, deployment, or source-command acceptance test.
- Automated axe results do not replace manual keyboard, zoom, contrast, or assistive-technology checks.
- Extracted text plus matching SHA-256 does not prove visual or semantic fidelity to a binary document.
- A prepared workflow does not prove repository Pages settings, protected environments, permissions, DNS, or public availability.
- No source procedure is considered operationally verified unless tested in an authorized isolated target environment; no such tests were run here.
