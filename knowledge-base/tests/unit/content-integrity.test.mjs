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
        assert.ok(document.sourceText.startsWith('Page 1' + String.fromCharCode(10)), document.path);
        assert.ok(document.sourceText.split(String.fromCharCode(10)).length > document.pageCount, document.path);
      }
    }
  }
});

test('guides with extracted media have all referenced image assets present on disk', async () => {
  const guidesWithMedia = guideData.guides.filter((guide) => guide.media && guide.media.length > 0);
  assert.ok(guidesWithMedia.length >= 3, 'Expected at least 3 guides with extracted media assets');

  for (const guide of guidesWithMedia) {
    for (const media of guide.media) {
      assert.ok(media.id && media.filename && media.src && media.alt && media.caption, `Media missing required fields in ${guide.id}`);
      const assetDiskPath = path.join(knowledgeBaseRoot, 'public', ...media.src.split('/').filter(Boolean));
      const stats = await fs.stat(assetDiskPath);
      assert.ok(stats.isFile(), `Asset not found on disk: ${assetDiskPath}`);
      assert.ok(stats.size > 500, `Asset file is unexpectedly small: ${assetDiskPath}`);
    }
  }
});

test('guides with structured tables retain column headers and non-empty rows', () => {
  const guidesWithTables = guideData.guides.filter((guide) => guide.tables && guide.tables.length > 0);
  assert.ok(guidesWithTables.length >= 4, 'Expected at least 4 guides with structured tables');

  for (const guide of guidesWithTables) {
    for (const table of guide.tables) {
      assert.ok(table.id && table.title, `Table missing id/title in ${guide.id}`);
      assert.ok(table.headers.length >= 2, `Table headers missing in ${guide.id}/${table.id}`);
      assert.ok(table.rows.length >= 1, `Table rows empty in ${guide.id}/${table.id}`);
      for (const row of table.rows) {
        assert.equal(row.length, table.headers.length, `Row column count mismatch in ${guide.id}/${table.id}`);
      }
    }
  }
});

test('key guides have their verified media and table fidelity quotas', () => {
  const driverGuide = guideData.guides.find((g) => g.id === 'windows-block-driver-installation');
  assert.equal(driverGuide.media.length, 6, 'Driver blocking guide must have 6 screenshots');

  const compendium = guideData.guides.find((g) => g.id === 'windows-troubleshooting-compendium');
  assert.equal(compendium.media.length, 2, 'Compendium must have 2 screenshots');
  assert.equal(compendium.tables.length, 2, 'Compendium must have 2 tables (DNS + Admin/Powercfg)');

  const n8n = guideData.guides.find((g) => g.id === 'n8n-local-docker-compose');
  assert.equal(n8n.media.length, 6, 'n8n guide must have 6 diagrams/visuals');
  assert.equal(n8n.tables.length, 2, 'n8n guide must have 2 tables (Quick reference + Port options)');
  assert.equal(n8n.guidedSteps.length, 10, 'n8n guide must cover all 10 reference sections');

  const psCmd = guideData.guides.find((g) => g.id === 'windows-powershell-cmd');
  assert.equal(psCmd.tables.length, 2, 'PowerShell guide must have 2 tables');
});

