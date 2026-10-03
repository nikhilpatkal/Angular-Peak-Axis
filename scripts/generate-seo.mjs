import { readFile, writeFile, mkdir } from 'node:fs/promises';

const site = JSON.parse(await readFile('site.config.json', 'utf8'));
const base = new URL(site.url);
if (base.protocol !== 'https:' || base.pathname !== '/' || base.search || base.hash) {
  throw new Error('site.config.json url must be an HTTPS domain without a path, query or fragment');
}
const canonical = `${base.origin}/`;
const image = `${base.origin}/images/social-cover.webp`;
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
// Read course data from a single source shared with the course overview dialog.
const { COURSES } = await import('../src/app/courses.ts');
const organizationId = `${canonical}#organization`;
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['EducationalOrganization', 'EmploymentAgency'], '@id': organizationId,
      name: site.name, url: canonical, description: site.description,
      email: site.email, telephone: site.phone,
      address: { '@type': 'PostalAddress', ...site.address },
      contactPoint: { '@type': 'ContactPoint', telephone: site.phone, email: site.email, contactType: 'customer service', availableLanguage: ['English'] },
      sameAs: Object.values(site.social)
    },
    { '@type': 'WebSite', '@id': `${canonical}#website`, name: site.shortName, url: canonical, publisher: { '@id': organizationId }, inLanguage: 'en-IN' },
    {
      '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: site.title,
      description: site.description, isPartOf: { '@id': `${canonical}#website` },
      about: { '@id': organizationId }, inLanguage: 'en-IN'
    },
    {
      '@type': 'ItemList', name: 'Training programs at Peak Axis Global',
      itemListElement: COURSES.map((course, index) => ({
        '@type': 'ListItem', position: index + 1,
        item: { '@type': 'Course', '@id': `${canonical}#${course.id}`, name: course.name, description: course.description, url: `${canonical}#${course.id}`, provider: { '@id': organizationId } }
      }))
    }
  ]
};
await mkdir('src', { recursive: true });
await mkdir('public/programs', { recursive: true });
await writeFile('src/index.html', `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <title>${escape(site.title)}</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(site.description)}">
  <meta name="author" content="${escape(site.name)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#0a2540">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/poppins-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin>
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_IN">
  <meta property="og:site_name" content="${escape(site.shortName)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${escape(site.title)}">
  <meta property="og:description" content="${escape(site.description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Students and professionals collaborating">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escape(site.title)}">
  <meta name="twitter:description" content="${escape(site.description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="Students and professionals collaborating">
  <script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>
</head>
<body>
  <app-root></app-root>
</body>
</html>
`);
await writeFile('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${base.origin}/sitemap.xml\n`);
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(canonical)}</loc></url></urlset>\n`);
for (const course of COURSES) {
  await writeFile(`public/programs/${course.id}.txt`, `${site.shortName}\n${course.name} — Course overview\nDuration: ${course.duration}\n\n${course.topics.map(topic => `• ${topic}`).join('\n')}\n\nThis overview covers the topics listed on our website. Contact our team for the detailed syllabus, current fees and intake dates.\nEmail: ${site.email}\nPhone: ${site.phone}\nWebsite: ${canonical}\n`);
}
console.log('Generated SEO metadata, structured data, robots.txt, sitemap.xml and course overviews.');
