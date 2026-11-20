// Import the promise-based file API to load the reviewed reference ledger.
import { readFile } from 'node:fs/promises';
// Import path resolution so npm can launch this check consistently on every OS.
import { resolve } from 'node:path';

// Resolve the package root from the caller's current working directory.
const packageRoot = resolve(process.cwd());
// Parse the reference ledger that deterministic builds validate separately.
const audit = JSON.parse(await readFile(resolve(packageRoot, 'reference-audit.json'), 'utf8'));
// Deduplicate shared references while retaining titles for actionable failures.
const references = [...new Map(
  audit.guides.flatMap((guide) => guide.references).map((reference) => [reference.url, reference]),
).values()];
// Copy the work list because each bounded worker removes one URL at a time.
const pending = [...references];
// Accumulate only public URL/status diagnostics; response bodies are never logged.
const failures = [];

// Check one reference with a timeout and one retry for transient network errors.
async function checkReference(reference) {
  // Retrying once avoids treating a brief connection reset as durable evidence.
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    // Abort slow endpoints so the maintenance check has a bounded runtime.
    const controller = new AbortController();
    // Keep each attempt below twenty seconds.
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      // Use a normal GET because several documentation hosts reject or mishandle HEAD.
      const response = await fetch(reference.url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'Technical Resources-reference-audit/0.1' },
      });
      // Stop downloading once status and final destination establish resolution.
      await response.body?.cancel();
      // Treat only successful and redirect-resolved responses as live evidence.
      if (response.status >= 200 && response.status < 400) return;
      // Preserve the final status without printing page content.
      if (attempt === 2) failures.push({ title: reference.title, url: reference.url, result: `HTTP ${response.status}` });
    } catch (error) {
      // Record a bounded error class only after the retry is exhausted.
      if (attempt === 2) failures.push({
        title: reference.title,
        url: reference.url,
        result: error instanceof Error ? error.name : 'NetworkError',
      });
    } finally {
      // Always release the timeout after an attempt completes.
      clearTimeout(timeout);
    }
  }
}

// Run a small worker pool to avoid flooding documentation providers.
async function worker() {
  // Continue until the shared work list is empty.
  while (pending.length > 0) {
    // JavaScript executes this synchronous removal atomically between awaits.
    const reference = pending.shift();
    // Guard the final empty read for type and runtime safety.
    if (reference) await checkReference(reference);
  }
}

// Resolve the live URLs with at most four concurrent requests.
await Promise.all(Array.from({ length: Math.min(4, references.length) }, () => worker()));
// Fail with public, non-sensitive diagnostics when a reviewed destination no longer resolves.
if (failures.length > 0) {
  for (const failure of failures) console.error(`${failure.result}: ${failure.title} (${failure.url})`);
  process.exitCode = 1;
} else {
  // Emit concise evidence suitable for a dated maintenance record.
  console.log(`Live reference check passed: ${references.length} unique HTTPS destinations resolved.`);
}
