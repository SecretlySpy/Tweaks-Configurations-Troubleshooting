import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const knowledgeBaseRoot = path.resolve(scriptDirectory, '..');
const dataRoot = path.join(knowledgeBaseRoot, 'src', 'data');
const distRoot = path.join(knowledgeBaseRoot, 'dist');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function walkFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(entryPath));
    if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

const guideData = JSON.parse(await fs.readFile(path.join(dataRoot, 'guides.generated.json'), 'utf8'));
const inventory = JSON.parse(await fs.readFile(path.join(dataRoot, 'source-inventory.generated.json'), 'utf8'));
const guideIds = guideData.guides.map((guide) => guide.id);
const guideSlugs = guideData.guides.map((guide) => guide.slug);

assert(new Set(guideIds).size === guideIds.length, 'Guide IDs must be unique.');
assert(new Set(guideSlugs).size === guideSlugs.length, 'Guide slugs must be unique.');
assert(guideData.coverage.primaryCoveragePercent === 100, 'Every primary source must map to at least one guide.');
assert(inventory.every((source) => /^[a-f0-9]{64}$/u.test(source.sha256)), 'Every source must have a SHA-256 digest.');

for (const guide of guideData.guides) {
  assert(guide.sourceDocuments.length > 0, `${guide.id} must have at least one source document.`);
  if (guide.publicStatus === 'published') {
    const readableDocument = guide.sourceDocuments.some((document) => document.extractionStatus === 'extracted');
    assert(readableDocument, `${guide.id} has no successfully extracted source content.`);
  } else {
    const leakedText = guide.sourceDocuments.some((document) => document.sourceText.length > 0);
    assert(!leakedText, `${guide.id} must not expose operational source text while ${guide.publicStatus}.`);
  }
}

const builtFiles = await walkFiles(distRoot);
const htmlFiles = builtFiles.filter((file) => file.endsWith('.html'));
assert(htmlFiles.length >= guideData.guides.length, 'The production build is missing expected HTML routes.');
assert(!builtFiles.some((file) => /\.(?:bat|cmd|ps1|reg|pow)$/iu.test(file)), 'Executable or registry source files must not enter the public artifact.');

process.stdout.write(
  `Verified ${guideData.guides.length} guides, ${inventory.length} sources, and ${htmlFiles.length} built HTML pages.\n`,
);

