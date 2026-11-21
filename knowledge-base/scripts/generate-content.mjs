import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import mammoth from 'mammoth';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { z } from 'zod';

import { extractAllGuideAssets } from './extract-guide-assets.mjs';
import { getGuideFidelityData } from './guide-fidelity-data.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const knowledgeBaseRoot = path.resolve(scriptDirectory, '..');
const repositoryRoot = path.resolve(knowledgeBaseRoot, '..');
const setupRoot = path.join(repositoryRoot, 'Setups');
const generatedDataRoot = path.join(knowledgeBaseRoot, 'src', 'data');
const publicDataRoot = path.join(knowledgeBaseRoot, 'public', 'data');
const contentMapPath = path.join(knowledgeBaseRoot, 'content-map.json');
const generatorVersion = 4;

const placementSchema = z.object({
  os: z.enum(['windows', 'linux', 'android']),
  category: z.enum(['tweaks', 'application-setup', 'troubleshooting']),
});

const guideSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9][a-z0-9/-]*$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  placements: z.array(placementSchema).min(1),
  compatibility: z.string().min(1),
  risk: z.enum(['low', 'medium', 'high', 'critical']),
  publicStatus: z.enum(['published', 'review-only', 'blocked']),
  sourcePaths: z.array(z.string().min(1)).min(1),
  annotations: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

const contentMapSchema = z.object({
  schemaVersion: z.literal(1),
  guides: z.array(guideSchema).min(1),
});

const textExtensions = new Set(['.txt', '.bat', '.cmd', '.ps1', '.reg', '.ini', '.conf', '.csv', '.json']);
const binaryExtensions = new Set(['.pow', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.adg', '.rupset', '.joboptions', '.cfg']);
const primarySourcePrefixes = [
  'Setups/OS Environment/',
  'Setups/Programming Related/',
];

function toRepositoryPath(absolutePath) {
  return path.relative(repositoryRoot, absolutePath).split(path.sep).join('/');
}

function resolveSourcePath(repositoryPath) {
  const absolutePath = path.resolve(repositoryRoot, repositoryPath);
  const relativePath = path.relative(setupRoot, absolutePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Source path escapes the approved Setups directory: ${repositoryPath}`);
  }
  return absolutePath;
}

async function walkFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(entryPath));
    if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function gitOutput(args) {
  try {
    return execFileSync('git', args, {
      cwd: repositoryRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function decodeTextBuffer(buffer) {
  const startsWithUtf16LeBom = buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe;
  const startsWithUtf16BeBom = buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff;
  const sampledBytes = buffer.subarray(0, Math.min(buffer.length, 512));
  const nullByteRatio = sampledBytes.length === 0
    ? 0
    : sampledBytes.filter((byte) => byte === 0).length / sampledBytes.length;

  if (startsWithUtf16LeBom || nullByteRatio > 0.2) {
    return new TextDecoder('utf-16le').decode(startsWithUtf16LeBom ? buffer.subarray(2) : buffer);
  }
  if (startsWithUtf16BeBom) {
    return new TextDecoder('utf-16be').decode(buffer.subarray(2));
  }

  const utf8 = new TextDecoder('utf-8').decode(buffer);
  const replacementRatio = utf8.length === 0
    ? 0
    : [...utf8].filter((character) => character === '\uFFFD').length / utf8.length;
  return replacementRatio > 0.01 ? new TextDecoder('windows-1252').decode(buffer) : utf8;
}

async function extractPdf(buffer) {
  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    useWorkerFetch: false,
  });
  const document = await loadingTask.promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const textContent = await page.getTextContent();
    // Preserve visual line breaks and spacing instead of flattening every PDF page
    // into a single run-on line. PDF glyph positions remain best-effort; the original
    // source document is linked from its article for tables and image verification.
    const lines = [];
    let currentLine = null;
    const flushLine = () => {
      if (currentLine) lines.push(currentLine.text.replace(/[ \t]+$/u, ''));
      currentLine = null;
    };
    for (const item of textContent.items) {
      if (!('str' in item)) continue;
      const value = item.str;
      const x = Number(item.transform?.[4] ?? 0);
      const y = Number(item.transform?.[5] ?? 0);
      const height = Math.max(1, Number(item.height || 0));
      const width = Number(item.width || 0);
      if (currentLine && (
        Math.abs(y - currentLine.y) > Math.max(2, height * 0.4)
        || x < currentLine.right - height
      )) flushLine();
      if (!currentLine) currentLine = { text: '', y, right: x };
      const gap = x - currentLine.right;
      if (currentLine.text && gap > Math.max(1, height * 0.2)
        && !currentLine.text.endsWith(' ') && !value.startsWith(' ')) {
        currentLine.text += gap > height * 2 ? '  ' : ' ';
      }
      currentLine.text += value;
      currentLine.right = Math.max(currentLine.right, x + width);
      if (item.hasEOL) flushLine();
    }
    flushLine();
    const pageText = lines.join('\n').trim();
    pages.push(`Page ${pageNumber}\n${pageText}`);
    page.cleanup();
  }
  await loadingTask.destroy();
  return {
    text: pages.join('\n\n'),
    pageCount: pages.length,
    warnings: ['PDF text is reconstructed from glyph positions; verify diagrams, tables, screenshots, and exact formatting against the linked original.'],
  };
}

async function extractDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
    pageCount: null,
    warnings: result.messages.map((message) => message.message),
  };
}

async function extractSource(repositoryPath, buffer, includeOperationalContent) {
  const extension = path.extname(repositoryPath).toLowerCase();
  if (!includeOperationalContent) {
    return { status: 'withheld', text: '', pageCount: null, warnings: [] };
  }
  try {
    if (textExtensions.has(extension)) {
      return { status: 'extracted', text: decodeTextBuffer(buffer), pageCount: null, warnings: [] };
    }
    if (extension === '.pdf') {
      const result = await extractPdf(buffer);
      return { status: result.text.trim() ? 'extracted' : 'empty', ...result };
    }
    if (extension === '.docx') {
      const result = await extractDocx(buffer);
      return { status: result.text.trim() ? 'extracted' : 'empty', ...result };
    }
    if (binaryExtensions.has(extension)) {
      return { status: 'binary-asset', text: '', pageCount: null, warnings: [] };
    }
    return { status: 'unsupported', text: '', pageCount: null, warnings: [] };
  } catch (error) {
    return {
      status: 'failed',
      text: '',
      pageCount: null,
      warnings: [error instanceof Error ? error.message : String(error)],
    };
  }
}

function extractUrls(text) {
  const matches = text.match(/https?:\/\/[^\s<>()"']+/gu) ?? [];
  return [...new Set(matches
    .map((url) => url.replace(/[.,;:!?]+$/u, ''))
    .filter((url) => {
      try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol) && Boolean(parsedUrl.hostname);
      } catch {
        return false;
      }
    }))];
}

function chunkGuidedSteps(documents) {
  const sections = [];
  for (const document of documents) {
    if (!document.sourceText) continue;
    // A section is a reading checkpoint, never a generated or rewritten command.
    // PDFs retain their source page boundaries; text sources retain paragraph order.
    const parts = document.format === 'pdf'
      ? document.sourceText.split(/(?=^Page \d+\n)/gmu).filter(Boolean)
      : document.sourceText.split(/\r?\n\s*\r?\n/gu).filter(Boolean);
    const chunkSize = document.format === 'pdf' ? 1 : Math.max(1, Math.ceil(parts.length / 12));
    for (let index = 0; index < parts.length; index += chunkSize) {
      const partNumber = Math.floor(index / chunkSize) + 1;
      const content = parts.slice(index, index + chunkSize).join('\n\n');
      sections.push({
        id: `${document.sha256.slice(0, 8)}-${partNumber}`,
        title: `${document.filename} · ${document.format === 'pdf' ? 'page' : 'section'} ${partNumber}`,
        sourcePath: document.path,
        content,
      });
    }
  }
  // Do not silently truncate multi-document guides after the first 24 sections.
  return sections;
}

async function main() {
  const contentMapSource = await fs.readFile(contentMapPath, 'utf8');
  const mapJson = JSON.parse(contentMapSource);
  const contentMap = contentMapSchema.parse(mapJson);
  const repositoryRevision = gitOutput(['rev-parse', 'HEAD']) || 'unavailable';
  const revisionTimestamp = gitOutput(['show', '-s', '--format=%cI', 'HEAD']) || null;
  const discoveredFiles = await walkFiles(setupRoot);
  const discoveredPaths = discoveredFiles.map(toRepositoryPath);
  const guideIdsBySource = new Map();

  for (const guide of contentMap.guides) {
    for (const sourcePath of guide.sourcePaths) {
      const current = guideIdsBySource.get(sourcePath) ?? [];
      current.push(guide.id);
      guideIdsBySource.set(sourcePath, current);
    }
  }

  const extractionCache = new Map();
  const inventory = [];
  for (const repositoryPath of discoveredPaths) {
    const absolutePath = resolveSourcePath(repositoryPath);
    const buffer = await fs.readFile(absolutePath);
    const stats = await fs.stat(absolutePath);
    const tracked = Boolean(gitOutput(['ls-files', '--error-unmatch', '--', repositoryPath]));
    const sourceRevision = tracked
      ? gitOutput(['log', '-1', '--format=%H', '--', repositoryPath]) || repositoryRevision
      : null;
    const scope = primarySourcePrefixes.some((prefix) => repositoryPath.startsWith(prefix))
      ? 'primary'
      : 'secondary-review';
    inventory.push({
      sourceId: sha256(Buffer.from(repositoryPath)).slice(0, 16),
      path: repositoryPath,
      filename: path.basename(repositoryPath),
      extension: path.extname(repositoryPath).toLowerCase(),
      bytes: stats.size,
      sha256: sha256(buffer),
      tracked,
      gitRevision: sourceRevision,
      scope,
      guideIds: guideIdsBySource.get(repositoryPath) ?? [],
      migrationStatus: guideIdsBySource.has(repositoryPath) ? 'mapped' : 'secondary-review',
    });
    extractionCache.set(repositoryPath, { buffer });
  }

  const inventoryByPath = new Map(inventory.map((source) => [source.path, source]));
  const inputFingerprint = sha256(Buffer.from([
    String(generatorVersion),
    sha256(Buffer.from(contentMapSource)),
    ...inventory.map((source) => `${source.path}:${source.sha256}`),
  ].join('\n')));
  const generatedGuidePath = path.join(generatedDataRoot, 'guides.generated.json');
  const publicSearchPath = path.join(publicDataRoot, 'search-index.json');
  if (!process.argv.includes('--force')) {
    try {
      const cachedOutput = JSON.parse(await fs.readFile(generatedGuidePath, 'utf8'));
      await fs.access(publicSearchPath);
      if (cachedOutput.inputFingerprint === inputFingerprint) {
        process.stdout.write(
          `Content inputs unchanged; reused ${cachedOutput.coverage.guideCount} generated guides `
          + `from ${cachedOutput.coverage.discoveredSourceCount} inventoried sources.\n`,
        );
        return;
      }
    } catch {
      // A missing or incompatible cache is expected on the first generation pass.
    }
  }
  await extractAllGuideAssets();
  const guides = [];
  for (const guide of contentMap.guides) {
    const includeOperationalContent = guide.publicStatus === 'published';
    const documents = [];
    for (const [index, sourcePath] of guide.sourcePaths.entries()) {
      const inventoryEntry = inventoryByPath.get(sourcePath);
      if (!inventoryEntry) throw new Error(`Mapped source does not exist: ${sourcePath}`);
      const cached = extractionCache.get(sourcePath);
      const extraction = await extractSource(sourcePath, cached.buffer, includeOperationalContent);
      documents.push({
        path: sourcePath,
        filename: inventoryEntry.filename,
        format: inventoryEntry.extension.slice(1) || 'unknown',
        bytes: inventoryEntry.bytes,
        sha256: inventoryEntry.sha256,
        tracked: inventoryEntry.tracked,
        gitRevision: inventoryEntry.gitRevision,
        canonicalRole: index === 0 ? 'primary' : 'companion',
        extractionStatus: extraction.status,
        extractionWarnings: extraction.warnings,
        pageCount: extraction.pageCount,
        sourceText: extraction.text,
        originalReferences: extractUrls(extraction.text).map((url) => ({
          title: url,
          url,
          relationship: 'source-authored',
          verificationStatus: 'preserved-unverified',
        })),
      });
    }
    const readingVersion = sha256(Buffer.from(documents.map((document) => document.sha256).join(':'))).slice(0, 16);
    const guideText = documents.map((document) => document.sourceText).filter(Boolean).join('\n\n');
    const fidelity = includeOperationalContent ? getGuideFidelityData(guide.id) : { media: [], tables: [] };
    let guidedSteps = [];
    if (includeOperationalContent) {
      if (fidelity.guidedSteps && fidelity.guidedSteps.length > 0) {
        guidedSteps.push(...fidelity.guidedSteps);
        const coveredPaths = new Set(guidedSteps.map((s) => s.sourcePath));
        for (const doc of documents) {
          if (!doc.sourceText || coveredPaths.has(doc.path)) continue;
          guidedSteps.push(...chunkGuidedSteps([doc]));
        }
      } else {
        guidedSteps = chunkGuidedSteps(documents);
      }
    }

    guides.push({
      ...guide,
      readingVersion,
      sourceDocuments: documents,
      media: fidelity.media ?? [],
      tables: fidelity.tables ?? [],
      guidedSteps,
      originalReferences: [...new Map(
        documents.flatMap((document) => document.originalReferences).map((reference) => [reference.url, reference]),
      ).values()],
      searchText: [guide.title, guide.summary, guide.compatibility, ...guide.keywords, guideText].join('\n'),
    });
  }

  const mappedPrimary = inventory.filter((source) => source.scope === 'primary' && source.guideIds.length > 0).length;
  const primaryCount = inventory.filter((source) => source.scope === 'primary').length;
  const coverage = {
    discoveredSourceCount: inventory.length,
    primarySourceCount: primaryCount,
    mappedPrimarySourceCount: mappedPrimary,
    secondaryReviewSourceCount: inventory.filter((source) => source.scope === 'secondary-review').length,
    guideCount: guides.length,
    publishedGuideCount: guides.filter((guide) => guide.publicStatus === 'published').length,
    reviewOnlyGuideCount: guides.filter((guide) => guide.publicStatus === 'review-only').length,
    blockedGuideCount: guides.filter((guide) => guide.publicStatus === 'blocked').length,
    primaryCoveragePercent: primaryCount === 0 ? 0 : Number(((mappedPrimary / primaryCount) * 100).toFixed(2)),
  };

  const output = {
    schemaVersion: 1,
    generatorVersion,
    inputFingerprint,
    generatedAt: revisionTimestamp,
    repositoryRevision,
    coverage,
    guides,
  };
  const publicSearchIndex = guides.map((guide) => ({
    id: guide.id,
    slug: guide.slug,
    title: guide.title,
    summary: guide.summary,
    placements: guide.placements,
    compatibility: guide.compatibility,
    risk: guide.risk,
    publicStatus: guide.publicStatus,
    keywords: guide.keywords,
    readingVersion: guide.readingVersion,
    searchText: guide.publicStatus === 'published'
      ? guide.searchText
      : [guide.title, guide.summary, ...guide.keywords].join('\n'),
  }));

  await fs.mkdir(generatedDataRoot, { recursive: true });
  await fs.mkdir(publicDataRoot, { recursive: true });
  await Promise.all([
    fs.writeFile(generatedGuidePath, `${JSON.stringify(output, null, 2)}\n`),
    fs.writeFile(path.join(generatedDataRoot, 'source-inventory.generated.json'), `${JSON.stringify(inventory, null, 2)}\n`),
    fs.writeFile(path.join(generatedDataRoot, 'coverage.generated.json'), `${JSON.stringify(coverage, null, 2)}\n`),
    fs.writeFile(publicSearchPath, `${JSON.stringify(publicSearchIndex)}\n`),
  ]);

  process.stdout.write(
    `Generated ${guides.length} guides from ${inventory.length} inventoried sources `
    + `(${coverage.primaryCoveragePercent}% primary mapping coverage).\n`,
  );
}

await main();

