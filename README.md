# Peak Axis Global — Angular static website

Peak Axis Global is an Angular 22 static site for `https://peakaxisglobal.in`. The homepage and ten course routes are prerendered for Cloudflare Pages, while Angular hydration provides the course filter, enquiry form, dialog, and mobile navigation.

## Run locally

Use Node.js 22.22.3 or newer in the Node 22 series, Node 24.15+ or Node 26+.

```sh
npm ci
npm start
```

Open `http://localhost:4200`. On Windows systems where PowerShell blocks `npm.ps1`, use `npm.cmd`.

## Build and verify

```sh
npm run build
npm run check:seo
npm run test:e2e
npm run measure:performance
npm run preview
```

The production preview is at `http://127.0.0.1:4173`. Browser tests use installed Microsoft Edge on Windows. On other systems, install Playwright Chromium and set `PLAYWRIGHT_CHANNEL=chromium` if needed.

Deploy **only `dist/peak-axis/browser/`**. Production hosting needs no Node.js server. The top-level `404.html` prevents unknown paths from being rewritten to the homepage. `public/_headers` caches fingerprinted JS/CSS for one year, mutable images/fonts for one week, and revalidates HTML and crawl files. `public/_redirects` permanently redirects `/index.html` to `/`; hostname redirects require Cloudflare account configuration.

See [`docs/seo-deployment-handoff.md`](docs/seo-deployment-handoff.md) for deployment, redirect, Search Console, and rollback instructions.

## Content and configuration

- `site.config.json`: canonical domain, contact details, address, social links, and enquiry endpoint.
- `src/app/courses.ts`: the ten program descriptions and modules used by cards, dialogs, course pages, downloads, sitemap, and schema.
- `src/app/pages/`: the homepage, course page, and client-side not-found view.
- `src/app/seo.ts`: canonical metadata and accurate EducationalOrganization, WebSite, WebPage, ItemList, Course, and BreadcrumbList JSON-LD.
- `src/app/components/`: visible page sections and interactions.
- `public/images/`, `public/fonts/`, `public/icons.svg`: local assets. The transparent hero uses responsive WebP sources with PNG fallbacks; the displayed logo is a resized WebP. Original source images remain available.

`npm start` and `npm run build` regenerate `src/index.html`, `public/robots.txt`, `public/sitemap.xml`, and downloadable course overviews. `npm run optimize:images` recreates the optimized hero and logo WebP files. `node scripts/prepare-assets.mjs` restores the local fonts/icons and any missing stock images.

## Enquiry behavior and privacy

The form validates candidate fields and PDF/DOC/DOCX resumes up to 3 MB, then submits to the configured Google Apps Script endpoint. The integration stores enquiry data in Google Sheets and resumes in a restricted Google Drive folder; see `docs/google-apps-script/`.

The site does not process payments. Approved privacy, terms, and refund-policy text is still required from the owner, so the footer offers explicit email requests until reviewed public policies are supplied. Do not publish placement guarantees, ratings, review totals, employer affiliations, salaries, testimonials, accreditation, or outcome figures without evidence and permission.

## Performance and SEO

- Eleven indexable routes are prerendered with visible content when JavaScript is disabled.
- Every page has a unique title, description, canonical URL, social metadata, and route-appropriate JSON-LD.
- `robots.txt` and `sitemap.xml` use only the canonical `.in` origin and list the homepage plus ten course pages.
- Zoneless Angular, `OnPush`, lazy route chunks, deferred display-only components, local fonts, purged Tailwind CSS, hashed production bundles, and size budgets keep runtime work bounded.
- The LCP hero is eager/high priority with accurate responsive candidates; below-the-fold raster images are lazy-loaded.
- Focus styles, landmarks, labels, dialog behavior, reduced-motion handling, intrinsic image dimensions, and a skip link support accessibility.

`check:seo` validates generated HTML for every indexable route, structured data, domain consistency, local assets, and crawl files. Playwright tests cover no-JavaScript content, hydration and resources, filters, course dialogs/pages, enquiry validation, mobile navigation, and genuine 404 handling.
