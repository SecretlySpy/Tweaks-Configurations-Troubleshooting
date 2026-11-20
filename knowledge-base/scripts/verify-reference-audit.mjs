// Import strict assertions so every mismatch stops publication with a useful failure.
import assert from 'node:assert/strict';
// Import the promise-based file API to read the two machine-readable source-of-truth files.
import { readFile } from 'node:fs/promises';
// Import path resolution so the script works from the knowledge-base package root on every OS.
import { resolve } from 'node:path';

// Resolve the package root from npm's working directory.
const packageRoot = resolve(process.cwd());
// Parse the canonical guide map that controls generated FIELDNOTES routes.
const contentMap = JSON.parse(await readFile(resolve(packageRoot, 'content-map.json'), 'utf8'));
// Parse the independent reference audit that records current verification scope.
const referenceAudit = JSON.parse(await readFile(resolve(packageRoot, 'reference-audit.json'), 'utf8'));

// Declare every allowed audit state to prevent silent spelling drift in the ledger.
const allowedStatuses = new Set([
  'verified-primary',
  'partially-verified',
  'source-only-unverified',
  'non-operational-review',
  'non-operational-blocked',
]);

// Collect canonical guide identifiers while rejecting duplicates in the content map.
const canonicalIds = contentMap.guides.map((guide) => guide.id);
// Require one unique identifier per canonical guide.
assert.equal(new Set(canonicalIds).size, canonicalIds.length, 'content-map.json contains duplicate guide IDs.');

// Collect audited guide identifiers while rejecting duplicate dispositions.
const auditedIds = referenceAudit.guides.map((entry) => entry.guideId);
// Require one unique audit entry per guide.
assert.equal(new Set(auditedIds).size, auditedIds.length, 'reference-audit.json contains duplicate guide IDs.');
// Require the audit to cover exactly the canonical guide set, with no stale or missing records.
assert.deepEqual([...auditedIds].sort(), [...canonicalIds].sort(), 'Reference audit coverage does not match the canonical guide map.');

// Index canonical records so publication-state checks remain direct and deterministic.
const guidesById = new Map(contentMap.guides.map((guide) => [guide.id, guide]));

// Validate each disposition and its supporting primary references.
for (const entry of referenceAudit.guides) {
  // Look up the canonical publication state for the audited guide.
  const guide = guidesById.get(entry.guideId);
  // Reject unknown status strings before they can weaken the gate.
  assert.ok(allowedStatuses.has(entry.status), `${entry.guideId} has an unsupported reference-audit status.`);
  // Require an explicit scope statement so a URL is never mistaken for full runtime verification.
  assert.ok(typeof entry.scope === 'string' && entry.scope.trim().length >= 20, `${entry.guideId} needs a meaningful audit scope.`);
  // Require the references field even when the correct result is an empty list.
  assert.ok(Array.isArray(entry.references), `${entry.guideId} references must be an array.`);

  // A primary or partial verification claim must cite at least one current authority.
  if (entry.status === 'verified-primary' || entry.status === 'partially-verified') {
    assert.ok(entry.references.length > 0, `${entry.guideId} claims verification without a primary reference.`);
  }

  // Review-only guides must stay non-operational in the reference ledger.
  if (guide.publicStatus === 'review-only') {
    assert.equal(entry.status, 'non-operational-review', `${entry.guideId} must remain a non-operational review.`);
  }

  // Blocked guides must stay explicitly blocked rather than acquiring an operational-looking citation.
  if (guide.publicStatus === 'blocked') {
    assert.equal(entry.status, 'non-operational-blocked', `${entry.guideId} must remain non-operational and blocked.`);
  }

  // Validate reference metadata without making a network call during deterministic builds.
  for (const reference of entry.references) {
    // Require a useful human-facing title.
    assert.ok(typeof reference.title === 'string' && reference.title.trim(), `${entry.guideId} has a reference without a title.`);
    // Require HTTPS so the published ledger never points readers to an insecure transport.
    assert.match(reference.url, /^https:\/\//u, `${entry.guideId} has a non-HTTPS reference.`);
    // Require the authority owner to distinguish first-party evidence from incidental links.
    assert.ok(typeof reference.owner === 'string' && reference.owner.trim(), `${entry.guideId} has a reference without an owner.`);
    // Require a relationship note that bounds what the reference actually establishes.
    assert.ok(typeof reference.relation === 'string' && reference.relation.trim(), `${entry.guideId} has a reference without a relation.`);
  }
}

// Emit only aggregate evidence so the command remains concise in CI logs.
console.log(`Reference audit verified: ${auditedIds.length} canonical guides, ${referenceAudit.guides.reduce((total, entry) => total + entry.references.length, 0)} primary references.`);
