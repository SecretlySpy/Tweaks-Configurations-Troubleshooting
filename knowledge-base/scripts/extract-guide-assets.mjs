import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import mammoth from 'mammoth';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const knowledgeBaseRoot = path.resolve(scriptDirectory, '..');
const repositoryRoot = path.resolve(knowledgeBaseRoot, '..');
const publicAssetsRoot = path.join(knowledgeBaseRoot, 'public', 'assets', 'guides');

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) crc = (crc >>> 1) ^ 0xEDB88320;
      else crc = crc >>> 1;
      byte >>>= 1;
    }
  }
  return (crc ^ (-1)) >>> 0;
}

function chunk(type, chunkData) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(chunkData.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), chunkData]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(width, height, data, kind) {
  const isRgb = kind === 2;
  const isRgba = kind === 3;
  const channels = isRgb ? 3 : isRgba ? 4 : 1;
  const rowBytes = width * channels;

  const uncompressed = Buffer.alloc(height * (rowBytes + 1));
  for (let y = 0; y < height; y++) {
    uncompressed[y * (rowBytes + 1)] = 0;
    data.copy(uncompressed, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes);
  }
  const idatData = zlib.deflateSync(uncompressed);

  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = isRgba ? 6 : isRgb ? 2 : 0;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    header,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function extractDocxImages(relPath, targetDir, nameMap) {
  const fullPath = path.join(repositoryRoot, relPath);
  const buf = await fs.promises.readFile(fullPath);
  await fs.promises.mkdir(targetDir, { recursive: true });
  let imgIndex = 0;
  const savedImages = [];
  await mammoth.convertToHtml({ buffer: buf }, {
    convertImage: mammoth.images.imgElement(async (image) => {
      const imgBuf = await image.read();
      const filename = nameMap[imgIndex] ?? `image-${imgIndex + 1}.png`;
      const outPath = path.join(targetDir, filename);
      await fs.promises.writeFile(outPath, imgBuf);
      savedImages.push({ index: imgIndex, filename, size: imgBuf.length });
      imgIndex++;
      return { src: '' };
    }),
  });
  return savedImages;
}

async function extractPdfImages(relPath, targetDir, nameMap) {
  const fullPath = path.join(repositoryRoot, relPath);
  const buf = await fs.promises.readFile(fullPath);
  await fs.promises.mkdir(targetDir, { recursive: true });
  const loadingTask = getDocument({ data: new Uint8Array(buf), isEvalSupported: false, useWorkerFetch: false });
  const doc = await loadingTask.promise;
  let imgIndex = 0;
  const savedImages = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const opList = await page.getOperatorList();
    for (let i = 0; i < opList.fnArray.length; i++) {
      if (opList.fnArray[i] === 85) {
        const name = opList.argsArray[i][0];
        if (typeof name !== 'string') continue;
        const obj = await new Promise((resolve) => {
          const timer = setTimeout(() => resolve(null), 1500);
          if (name.startsWith('g_')) {
            page.commonObjs.get(name, (retrieved) => {
              clearTimeout(timer);
              resolve(retrieved);
            });
          } else {
            page.objs.get(name, (retrieved) => {
              clearTimeout(timer);
              resolve(retrieved);
            });
          }
        });
        if (obj && obj.data && obj.width > 30 && obj.height > 30) {
          const pngBuf = createPng(obj.width, obj.height, Buffer.from(obj.data), obj.kind);
          const filename = nameMap[imgIndex] ?? `image-p${p}-${imgIndex + 1}.png`;
          const outPath = path.join(targetDir, filename);
          await fs.promises.writeFile(outPath, pngBuf);
          savedImages.push({
            page: p,
            index: imgIndex,
            filename,
            width: obj.width,
            height: obj.height,
            size: pngBuf.length,
          });
          imgIndex++;
        }
      }
    }
  }
  await loadingTask.destroy();
  return savedImages;
}

export async function extractAllGuideAssets() {
  const results = {};

  // 1. Driver blocking guide (6 images)
  const driverNames = [
    '01-device-manager-hardware-ids.png',
    '02-group-policy-device-installation-restrictions.png',
    '03-prevent-installation-policy.png',
    '04-show-hardware-ids-dialog.png',
    '05-device-manager-blocked-status.png',
    '06-windows-unable-to-install-notification.png',
  ];
  const driverDir = path.join(publicAssetsRoot, 'windows-block-driver-installation');
  results['windows-block-driver-installation'] = await extractPdfImages(
    'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Stop Windows from installing drivers for specific devices.pdf',
    driverDir,
    driverNames,
  );

  // 2. Windows troubleshooting compendium (2 images)
  const compendiumNames = [
    '01-chromium-blank-white-screen.png',
    '02-shortcut-disable-gpu-target.png',
  ];
  const compendiumDir = path.join(publicAssetsRoot, 'windows-troubleshooting-compendium');
  results['windows-troubleshooting-compendium'] = await extractDocxImages(
    'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Troubleshooting and Tweak Guides for Windows.docx',
    compendiumDir,
    compendiumNames,
  );

  // 3. n8n local docker compose (6 images)
  const n8nNames = [
    '01-n8n-stack-overview.png',
    '02-architecture-and-checks.png',
    '03-sandbox-runner-security.png',
    '04-container-topology.png',
    '05-runner-architecture.png',
    '06-port-configuration.png',
  ];
  const n8nDir = path.join(publicAssetsRoot, 'n8n-local-docker-compose');
  results['n8n-local-docker-compose'] = await extractPdfImages(
    'Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf',
    n8nDir,
    n8nNames,
  );

  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const extracted = await extractAllGuideAssets();
  for (const [guideId, images] of Object.entries(extracted)) {
    console.log(`Extracted ${images.length} images for ${guideId}`);
    for (const img of images) {
      console.log(`  - ${img.filename} (${img.width ?? ''}x${img.height ?? ''} ${img.size} bytes)`);
    }
  }
}
