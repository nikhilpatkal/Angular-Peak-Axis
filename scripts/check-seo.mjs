import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const root = 'dist/peak-axis/browser';
const html = await readFile(`${root}/index.html`, 'utf8');
const site = JSON.parse(await readFile('site.config.json', 'utf8'));
const canonical = `${new URL(site.url).origin}/`;
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'The page must have one primary heading');
assert.match(html, /<main\b/, 'A main landmark must be present');
for (const id of ['home', 'about', 'training', 'services', 'opportunities', 'registration', 'contact', 'clinical-research', 'pharmacovigilance', 'medical-coding']) {
  assert.match(html, new RegExp(`id="${id}"`), `${id} must exist in the prerendered document`);
}
assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
assert.match(html, /name="description" content="[^"]{80,200}"/);
assert.match(html, /property="og:image" content="https:[^"]+social-cover\.webp"/);
assert.match(html, /name="twitter:image"/);
assert.doesNotMatch(html, /cdn\.tailwindcss\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|images\.unsplash\.com|upload\.wikimedia\.org/);
assert.doesNotMatch(html, /\bon(?:click|submit|change)=/);
assert.doesNotMatch(html, /Payment of|Payment.*confirmed|Registration Successful|href="#"/);
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema['@context'], 'https://schema.org');
assert.equal(schema['@graph'].find(item => item['@type'] === 'ItemList').itemListElement.length, 3);
assert.ok(schema['@graph'].some(item => item['@type'] === 'WebPage'));
for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  assert.match(match[0], /\balt="[^"]+"/);
  assert.match(match[0], /\bwidth="\d+"/);
  assert.match(match[0], /\bheight="\d+"/);
  const src = match[0].match(/src="([^"]+)"/)[1];
  assert.ok(src.startsWith('/images/'));
  assert.ok((await stat(root + src)).size > 0);
}
assert.match(html, /fetchpriority="high"/);
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(html.includes(`id="${match[1]}"`), `Broken anchor: #${match[1]}`);
}
assert.ok((await readFile(`${root}/sitemap.xml`, 'utf8')).includes(`<loc>${canonical}</loc>`));
assert.ok((await readFile(`${root}/robots.txt`, 'utf8')).includes(`Sitemap: ${new URL(site.url).origin}/sitemap.xml`));
for (const file of ['social-cover.webp', 'hero-640.webp', 'hero-1600.webp', 'services-background.webp']) await stat(`${root}/images/${file}`);
for (const name of ['clinical-research', 'pharmacovigilance', 'medical-coding']) await stat(`${root}/programs/${name}.txt`);
const bundles = (await readdir(root)).filter(file => /\.(?:css|js)$/.test(file));
let raw = 0, gzip = 0;
for (const bundle of bundles) {
  const bytes = await readFile(`${root}/${bundle}`);
  raw += bytes.length; gzip += gzipSync(bytes).length;
}
const initial = new Set([...html.matchAll(/(?:src|href)="([^"/]+\.(?:js|css))"/g)].map(match => match[1]));
let initialRaw = 0, initialGzip = 0;
for (const file of initial) {
  const bytes = await readFile(`${root}/${file}`);
  initialRaw += bytes.length; initialGzip += gzipSync(bytes).length;
}
console.log(`SEO checks passed: prerendered content, metadata, structured data, anchors, images and crawl files.`);
console.log(`Initial JS + CSS: ${(initialRaw / 1024).toFixed(1)} KiB raw / ${(initialGzip / 1024).toFixed(1)} KiB gzip.`);
console.log(`All production JS + CSS: ${(raw / 1024).toFixed(1)} KiB raw / ${(gzip / 1024).toFixed(1)} KiB gzip. HTML: ${(Buffer.byteLength(html) / 1024).toFixed(1)} KiB.`);
