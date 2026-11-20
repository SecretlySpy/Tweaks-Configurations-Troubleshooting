// Import strict assertions for a clear missing-build precondition failure.
import assert from 'node:assert/strict';
// Import the promise-based filesystem API for bounded artifact inspection.
import { access, readFile, readdir } from 'node:fs/promises';
// Import path helpers for portable traversal and target resolution.
import { extname, relative, resolve, sep } from 'node:path';

// Keep the production GitHub Pages subpath explicit so local checks model deployed URLs.
const basePath = '/Tweaks-Configurations-Troubleshooting';
// Resolve the package and generated artifact roots from npm's working directory.
const packageRoot = resolve(process.cwd());
// Point every scan at the generated public artifact, never at arbitrary repository files.
const distRoot = resolve(packageRoot, 'dist');
// Fail clearly when someone runs the gate before building the site.
await access(distRoot).catch(() => assert.fail('dist/ is missing; run npm run build before artifact verification.'));

// Declare source formats that must never be copied into the public static artifact.
const prohibitedPublicExtensions = new Set(['.bat', '.cmd', '.doc', '.docx', '.pdf', '.pow', '.ps1', '.reg']);
// Restrict high-confidence secret scanning to generated text formats.
const scannableTextExtensions = new Set(['.css', '.html', '.js', '.json', '.map', '.svg', '.txt', '.xml']);
// Use only strong credential signatures to avoid treating ordinary guide prose as a secret.
const secretSignatures = [
  { id: 'private-key-material', pattern: /-----BEGIN (?:OPENSSH |RSA |EC |DSA )?PRIVATE KEY-----/u },
  { id: 'github-token', pattern: /(?:github_pat_[A-Za-z0-9_]{60,}|gh[pousr]_[A-Za-z0-9]{30,})/u },
  { id: 'aws-access-key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/u },
  { id: 'google-api-key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/u },
  { id: 'slack-token', pattern: /\bxox[baprs]-[0-9A-Za-z-]{20,}\b/u },
  { id: 'stripe-live-secret', pattern: /\bsk_live_[0-9A-Za-z]{20,}\b/u },
];

// Accumulate failures as path-and-rule metadata without ever printing a matching value.
const findings = [];

// Walk the bounded dist directory and return every generated file in deterministic order.
async function listFiles(directory) {
  // Read directory entries with type metadata to avoid extra stat calls.
  const entries = await readdir(directory, { withFileTypes: true });
  // Hold files discovered at this directory level and below.
  const files = [];
  // Traverse entries in lexical order so CI output stays stable.
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    // Resolve an absolute child path without shell interpolation.
    const childPath = resolve(directory, entry.name);
    // Recurse only into actual directories inside dist.
    if (entry.isDirectory()) {
      files.push(...await listFiles(childPath));
    // Include regular files and ignore unsupported filesystem entry types.
    } else if (entry.isFile()) {
      files.push(childPath);
    }
  }
  // Return the complete deterministic file list.
  return files;
}

// Convert an absolute dist path to a slash-separated report path.
function reportPath(absolutePath) {
  // Normalize Windows separators so output matches CI on Linux.
  return relative(distRoot, absolutePath).split(sep).join('/');
}

// Decode the small HTML entity set that can occur inside generated URL attributes.
function decodeAttribute(value) {
  // Decode named ampersand/quote entities and numeric apostrophes used by HTML serializers.
  return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
}

// Return true when a generated path exists as a file, an extensionless HTML file, or a directory index.
async function generatedTargetExists(relativeTarget) {
  // Remove a leading slash before resolving within the already bounded dist root.
  const cleanTarget = relativeTarget.replace(/^\/+/, '');
  // Build the supported static-target candidates in deployment lookup order.
  const candidates = cleanTarget === ''
    ? ['index.html']
    : cleanTarget.endsWith('/')
      ? [`${cleanTarget}index.html`]
      : extname(cleanTarget)
        ? [cleanTarget]
        : [cleanTarget, `${cleanTarget}.html`, `${cleanTarget}/index.html`];
  // Check each resolved candidate without throwing or mutating the artifact.
  for (const candidate of candidates) {
    // Reject traversal before resolving a candidate path.
    if (candidate.split('/').includes('..')) return false;
    // Resolve the candidate and ensure it remains inside the intended artifact root.
    const absoluteCandidate = resolve(distRoot, candidate);
    if (absoluteCandidate !== distRoot && !absoluteCandidate.startsWith(`${distRoot}${sep}`)) return false;
    // Return success as soon as one valid static target exists.
    try {
      await access(absoluteCandidate);
      return true;
    } catch {
      // Continue to the next supported static form when this candidate is absent.
    }
  }
  // Report failure only after exhausting valid static target forms.
  return false;
}

// Validate one local URL from generated HTML or CSS against the GitHub Pages base path.
async function checkLocalUrl(rawValue, sourceFile, sourceUrl) {
  // Decode HTML entities and remove harmless surrounding whitespace.
  const value = decodeAttribute(rawValue.trim());
  // Ignore empty anchors and protocols that do not resolve to generated files.
  if (!value || value.startsWith('#') || /^(?:data:|mailto:|tel:)/iu.test(value)) return;
  // Reject executable URL schemes even though Astro should have escaped source content.
  if (/^(?:javascript|vbscript):/iu.test(value)) {
    findings.push({ path: reportPath(sourceFile), rule: 'active-url-scheme' });
    return;
  }
  // Resolve relative URLs exactly as a browser would from the generated page or stylesheet.
  let resolvedUrl;
  // Convert malformed generated URLs into a bounded finding instead of crashing the verifier.
  try {
    resolvedUrl = new URL(value, sourceUrl);
  } catch {
    findings.push({ path: reportPath(sourceFile), rule: 'malformed-url' });
    return;
  }
  // Leave external HTTP(S) targets to the separately bounded reference-audit ledger.
  if (resolvedUrl.origin !== 'https://fieldnotes.invalid') return;
  // Require every root-local link to remain under the configured repository Pages subpath.
  if (resolvedUrl.pathname !== basePath && !resolvedUrl.pathname.startsWith(`${basePath}/`)) {
    findings.push({ path: reportPath(sourceFile), rule: 'outside-pages-base' });
    return;
  }
  // Decode the path after the known base so filesystem checks use its real generated name.
  const relativeTarget = decodeURIComponent(resolvedUrl.pathname.slice(basePath.length));
  // Report missing local targets without exposing query strings or content values.
  if (!await generatedTargetExists(relativeTarget)) {
    findings.push({ path: reportPath(sourceFile), rule: 'broken-local-target' });
  }
}

// Enumerate the generated artifact once for all boundary checks.
const files = await listFiles(distRoot);

// Inspect public file types and high-confidence secret signatures.
for (const file of files) {
  // Normalize the extension for case-insensitive policy checks.
  const extension = extname(file).toLowerCase();
  // Reject copied executable, registry, office, power-plan, and PDF source assets.
  if (prohibitedPublicExtensions.has(extension)) {
    findings.push({ path: reportPath(file), rule: 'prohibited-source-asset' });
  }
  // Skip binary and non-text assets during credential inspection.
  if (!scannableTextExtensions.has(extension)) continue;
  // Read the generated text without logging any content.
  const content = await readFile(file, 'utf8');
  // Record only the rule identifier and containing file for any strong secret signature.
  for (const signature of secretSignatures) {
    if (signature.pattern.test(content)) findings.push({ path: reportPath(file), rule: signature.id });
  }
}

// Validate navigational and asset references in every generated HTML page.
for (const file of files.filter((candidate) => extname(candidate).toLowerCase() === '.html')) {
  // Read the generated HTML as an opaque artifact.
  const html = await readFile(file, 'utf8');
  // Model the deployed route for this generated HTML file.
  const relativeHtml = reportPath(file);
  // Convert index files to their directory route while retaining non-index HTML names.
  const routePath = relativeHtml === 'index.html'
    ? '/'
    : relativeHtml.endsWith('/index.html')
      ? `/${relativeHtml.slice(0, -'index.html'.length)}`
      : `/${relativeHtml}`;
  // Build a synthetic same-origin URL with the real Pages base for browser-accurate resolution.
  const sourceUrl = new URL(`${basePath}${routePath}`, 'https://fieldnotes.invalid');
  // Extract generated href and src values; migrated source text is escaped and cannot match attributes.
  const attributePattern = /\b(?:href|src)\s*=\s*["']([^"']+)["']/giu;
  // Check every matched local target against the generated artifact.
  for (const match of html.matchAll(attributePattern)) {
    await checkLocalUrl(match[1], file, sourceUrl);
  }
}

// Validate CSS url() assets, including emitted font files, relative to each stylesheet.
for (const file of files.filter((candidate) => extname(candidate).toLowerCase() === '.css')) {
  // Read only emitted CSS files from dist.
  const css = await readFile(file, 'utf8');
  // Model the deployed stylesheet URL under the repository Pages base.
  const sourceUrl = new URL(`${basePath}/${reportPath(file)}`, 'https://fieldnotes.invalid');
  // Extract quoted and unquoted url() values without interpreting CSS as executable code.
  const cssUrlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/giu;
  // Check each emitted asset target using the same bounded resolver.
  for (const match of css.matchAll(cssUrlPattern)) {
    await checkLocalUrl(match[1], file, sourceUrl);
  }
}

// Print path-and-rule metadata only after all checks so no matching content can leak into logs.
if (findings.length > 0) {
  // Sort findings for deterministic, reviewable CI output.
  for (const finding of findings.sort((left, right) => `${left.path}:${left.rule}`.localeCompare(`${right.path}:${right.rule}`))) {
    console.error(`${finding.path}: ${finding.rule}`);
  }
  // Stop publication when any public-boundary or link-integrity finding remains.
  assert.fail(`Built artifact verification found ${findings.length} issue(s).`);
}

// Emit aggregate evidence without disclosing generated content or source values.
console.log(`Built artifact verified: ${files.length} files, no broken local targets, prohibited source assets, or high-confidence secret signatures.`);
