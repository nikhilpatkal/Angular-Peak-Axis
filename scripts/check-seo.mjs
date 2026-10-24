import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { COURSES } from '../src/app/courses.ts';

const root = 'dist/peak-axis/browser';
const site = JSON.parse(await readFile('site.config.json', 'utf8'));
const origin = new URL(site.url).origin;
assert.equal(origin, 'https://peakaxisglobal.in', 'The production origin must be the preferred .in domain');

const readPage = path => readFile(`${root}/${path}index.html`, 'utf8');
const parseSchemas = html => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1].replaceAll('&quot;', '"')));
const canonicalFrom = html => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const titleFrom = html => html.match(/<title>([^<]+)<\/title>/)?.[1];

const home = await readPage('');
assert.equal((home.match(/<h1\b/g) || []).length, 1, 'Homepage must have one primary heading');
assert.match(home, /<main\b/, 'A main landmark must be present');
for (const id of ['home', 'about', 'training', 'services', 'opportunities', 'registration', 'contact']) {
  assert.match(home, new RegExp(`id="${id}"`), `${id} must exist in the prerendered homepage`);
}
assert.equal(canonicalFrom(home), `${origin}/`);
assert.match(home, /name="description" content="[^"]{80,200}"/);
assert.match(home, /property="og:image" content="https:\/\/peakaxisglobal\.in\/images\/social-cover\.webp"/);
assert.match(home, /name="twitter:image"/);
assert.doesNotMatch(home, /peakaxisglobal\.com|cdn\.tailwindcss\.com|fonts\.googleapis\.com|images\.unsplash\.com/);
assert.doesNotMatch(home, /100% Placement|Verified Reviews|500\+ Google|Urgently Hiring/);
assert.doesNotMatch(home, /<meta[^>]+noindex/i, 'Homepage must remain indexable');
assert.match(home, /fetchpriority="high"/);
assert.match(home, /hero-student-cutout-640\.webp 640w/);

const homeSchemas = parseSchemas(home);
assert.equal(homeSchemas.length, 1, 'Homepage must contain one JSON-LD graph');
const homeGraph = homeSchemas[0]['@graph'];
assert.equal(homeSchemas[0]['@context'], 'https://schema.org');
assert.equal(homeGraph.find(item => item['@type'] === 'ItemList').itemListElement.length, COURSES.length);
assert.ok(homeGraph.some(item => item['@type'] === 'EducationalOrganization'));
assert.ok(homeGraph.some(item => item['@type'] === 'WebPage'));

const pageTitles = new Set([titleFrom(home)]);
const pageCanonicals = new Set([canonicalFrom(home)]);
for (const course of COURSES) {
  const html = await readPage(`courses/${course.id}/`);
  const expectedUrl = `${origin}/courses/${course.id}/`;
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${course.id} must have one h1`);
  assert.ok(html.includes(course.shortName), `${course.id} must include its visible course name`);
  assert.equal(canonicalFrom(html), expectedUrl, `${course.id} canonical is incorrect`);
  assert.ok(!pageTitles.has(titleFrom(html)), `${course.id} title must be unique`);
  assert.ok(!pageCanonicals.has(canonicalFrom(html)), `${course.id} canonical must be unique`);
  pageTitles.add(titleFrom(html));
  pageCanonicals.add(canonicalFrom(html));
  assert.ok(html.includes(`property="og:url" content="${expectedUrl}"`));
  assert.doesNotMatch(html, /<meta[^>]+noindex/i, `${course.id} must remain indexable`);
  assert.doesNotMatch(html, /peakaxisglobal\.com/);
  const graphs = parseSchemas(html);
  assert.equal(graphs.length, 1, `${course.id} must contain one JSON-LD graph`);
  assert.ok(graphs[0]['@graph'].some(item => item['@type'] === 'Course'));
  assert.ok(graphs[0]['@graph'].some(item => item['@type'] === 'BreadcrumbList'));
}

for (const match of home.matchAll(/<img\b[^>]*>/g)) {
  assert.match(match[0], /\balt="[^"]*"/);
  assert.match(match[0], /\bwidth="\d+"/);
  assert.match(match[0], /\bheight="\d+"/);
  const source = match[0].match(/src="([^"]+)"/)?.[1];
  if (source?.startsWith('/')) assert.ok((await stat(root + source)).size > 0, `Missing image: ${source}`);
}
for (const href of [...home.matchAll(/href="#([^"]+)"/g)].map(match => match[1])) {
  assert.ok(home.includes(`id="${href}"`), `Broken homepage anchor: #${href}`);
}

const sitemap = await readFile(`${root}/sitemap.xml`, 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(sitemapUrls, [`${origin}/`, ...COURSES.map(course => `${origin}/courses/${course.id}/`)]);
assert.ok((await readFile(`${root}/robots.txt`, 'utf8')).includes(`Sitemap: ${origin}/sitemap.xml`));
assert.ok((await stat(`${root}/404.html`)).size > 0);
assert.ok((await stat(`${root}/_redirects`)).size > 0);
for (const file of ['social-cover.webp', 'hero-student-cutout-640.webp', 'hero-student-cutout-1024.webp', 'hero-student-cutout-1448.webp', 'peak-axis-global-logo-434.webp']) {
  assert.ok((await stat(`${root}/images/${file}`)).size > 0, `Missing optimized image: ${file}`);
}
for (const course of COURSES) await stat(`${root}/programs/${course.id}.txt`);

const bundles = (await readdir(root)).filter(file => /\.(?:css|js)$/.test(file));
let raw = 0;
let gzip = 0;
for (const bundle of bundles) {
  const bytes = await readFile(`${root}/${bundle}`);
  raw += bytes.length;
  gzip += gzipSync(bytes).length;
}
const initial = new Set([...home.matchAll(/(?:src|href)="([^"/]+\.(?:js|css))"/g)].map(match => match[1]));
let initialRaw = 0;
let initialGzip = 0;
for (const file of initial) {
  const bytes = await readFile(`${root}/${file}`);
  initialRaw += bytes.length;
  initialGzip += gzipSync(bytes).length;
}
console.log(`SEO checks passed for the homepage and ${COURSES.length} prerendered course pages.`);
console.log(`Initial JS + CSS: ${(initialRaw / 1024).toFixed(1)} KiB raw / ${(initialGzip / 1024).toFixed(1)} KiB gzip.`);
console.log(`All production JS + CSS: ${(raw / 1024).toFixed(1)} KiB raw / ${(gzip / 1024).toFixed(1)} KiB gzip. Homepage HTML: ${(Buffer.byteLength(home) / 1024).toFixed(1)} KiB.`);
