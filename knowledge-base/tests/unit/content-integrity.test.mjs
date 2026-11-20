import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const knowledgeBaseRoot = path.resolve(testDirectory, '..', '..');
const repositoryRoot = path.resolve(knowledgeBaseRoot, '..');
const guideData = JSON.parse(await fs.readFile(path.join(knowledgeBaseRoot, 'src/data/guides.generated.json'), 'utf8'));
const inventory = JSON.parse(await fs.readFile(path.join(knowledgeBaseRoot, 'src/data/source-inventory.generated.json'), 'utf8'));

test('every primary source is mapped and every guide identity is unique', () => {
  assert.equal(guideData.coverage.primaryCoveragePercent, 100);
  assert.equal(guideData.coverage.primarySourceCount, 44);
  assert.equal(guideData.coverage.discoveredSourceCount, 79);
  assert.equal(new Set(guideData.guides.map((guide) => guide.id)).size, guideData.guides.length);
  assert.equal(new Set(guideData.guides.map((guide) => guide.slug)).size, guideData.guides.length);
});

test('recorded SHA-256 values still match every inventoried source file', async () => {
  for (const source of inventory) {
    const buffer = await fs.readFile(path.join(repositoryRoot, ...source.path.split('/')));
    const digest = createHash('sha256').update(buffer).digest('hex');
    assert.equal(digest, source.sha256, source.path);
  }
});

test('blocked and review-only guides never contain operational source text', () => {
  for (const guide of guideData.guides.filter((candidate) => candidate.publicStatus !== 'published')) {
    assert.ok(guide.sourceDocuments.every((document) => document.sourceText === ''), guide.id);
    assert.equal(guide.guidedSteps.length, 0, guide.id);
  }
});

test('published guides have at least one readable source transcription', () => {
  for (const guide of guideData.guides.filter((candidate) => candidate.publicStatus === 'published')) {
    assert.ok(
      guide.sourceDocuments.some((document) => document.extractionStatus === 'extracted' && document.sourceText.length > 0),
      guide.id,
    );
  }
});

test('the n8n guide remains one canonical article cross-listed for Windows and Linux', () => {
  const n8nGuide = guideData.guides.find((guide) => guide.id === 'n8n-local-docker-compose');
  assert.ok(n8nGuide);
  assert.deepEqual(
    n8nGuide.placements.map((placement) => `${placement.os}:${placement.category}`).sort(),
    ['linux:application-setup', 'windows:application-setup'],
  );
  assert.match(n8nGuide.compatibility, /Windows host.+WSL 2/u);
});


test('generated PDF pages retain line breaks and reading sections do not omit source files', () => {
  for (const guide of guideData.guides.filter((item) => item.publicStatus === 'published')) {
    const sectionPaths = new Set(guide.guidedSteps.map((section) => section.sourcePath));
    for (const document of guide.sourceDocuments) {
      if (!document.sourceText) continue;
      assert.ok(sectionPaths.has(document.path), document.path);
      if (document.format === 'pdf' && document.pageCount) {
        assert.match(document.sourceText, /^Page 1\\n/u, document.path);
        assert.ok(document.sourceText.split('\\n').length > document.pageCount, document.path);
      }
    }
  }
});
