import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const knowledgeBaseRoot = path.resolve(testDirectory, '..', '..');

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

test('rendering code never injects migrated source as raw HTML', async () => {
  const sourceFiles = (await walkFiles(path.join(knowledgeBaseRoot, 'src')))
    .filter((file) => /\.(?:astro|ts|mjs)$/u.test(file));
  for (const sourceFile of sourceFiles) {
    const contents = await fs.readFile(sourceFile, 'utf8');
    assert.doesNotMatch(contents, /set:html|\.innerHTML\s*=/u, sourceFile);
  }
});

test('the public search index exposes no private sourceText field', async () => {
  const searchSource = await fs.readFile(path.join(knowledgeBaseRoot, 'public/data/search-index.json'), 'utf8');
  assert.doesNotMatch(searchSource, /"sourceText"/u);
  const entries = JSON.parse(searchSource);
  for (const entry of entries.filter((candidate) => candidate.publicStatus !== 'published')) {
    assert.ok(entry.searchText.length < 2000, entry.id);
  }
});

