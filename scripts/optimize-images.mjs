import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({
  channel: process.platform === 'win32' ? 'msedge' : undefined,
  headless: true
});
const page = await browser.newPage();

async function createWebp(source, target, width, height, quality) {
  const sourceBytes = await readFile(source);
  const sourceUrl = `data:image/png;base64,${sourceBytes.toString('base64')}`;
  const encoded = await page.evaluate(async ({ sourceUrl, width, height, quality }) => {
    const image = new Image();
    image.src = sourceUrl;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Canvas 2D is unavailable');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('WebP encoding failed')), 'image/webp', quality));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  }, { sourceUrl, width, height, quality });
  await writeFile(target, Buffer.from(encoded, 'base64'));
  console.log(`Created ${target}`);
}

try {
  for (const width of [640, 1024, 1448]) {
    await createWebp(
      `public/images/hero-student-cutout-${width}.png`,
      `public/images/hero-student-cutout-${width}.webp`,
      width,
      Math.round(width * 0.75),
      0.84
    );
  }
  await createWebp(
    'public/images/peak-axis-global-logo-yellow-axis-v3.png',
    'public/images/peak-axis-global-logo-434.webp',
    434,
    145,
    0.9
  );
} finally {
  await browser.close();
}
