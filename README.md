# Peak Axis Global — Angular static website

The supplied `index.html` has been converted into an Angular 22 application. The original file is retained as a reference; the application source is in `src/`. The layout, branding, courses, services, testimonials and job cards have been preserved.

## Run locally

Use Node.js 22.22.3 or newer in the Node 22 series, Node 24.15+ or Node 26+.

```sh
npm ci
npm start
```

Open `http://localhost:4200`. On Windows systems where PowerShell blocks `npm.ps1`, use `npm.cmd` instead of `npm`.

## Build and verify

```sh
npm run build
npm run check:seo
npm run test:e2e
npm run preview
```

The production preview is at `http://127.0.0.1:4173`. Browser tests use the installed Microsoft Edge on Windows. On other systems, install Playwright Chromium with `npx playwright install chromium`. Set `PLAYWRIGHT_CHANNEL=chromium` to use Playwright's Chromium on Windows as well.

Deploy **only `dist/peak-axis/browser/`** to any static host. Angular prerenders the complete page at build time using `outputMode: "static"`; production hosting needs no Node.js application, API or database. Unknown paths should return HTTP 404 instead of being rewritten to the homepage. Set the host's document root to the browser output directory.

`public/_headers` provides caching rules for hosts that support this format, including Netlify and Cloudflare Pages. On other hosts, configure equivalent rules: cache fingerprinted JavaScript/CSS for one year, images/fonts for one week, and revalidate HTML. Enable Brotli or gzip and redirect HTTP and alternative domain variants to the chosen HTTPS canonical domain.

## Content and contact details

- `site.config.json`: domain, title, description, email, phone, WhatsApp, address and social URLs. The domain and contact details from the supplied file are retained as requested. WhatsApp links consistently use the displayed number.
- `src/app/components/`: standalone page sections. Edit their HTML to update visible content.
- `src/app/courses.ts`: course overview topics and descriptions used by dialogs, downloads and structured data. Update this alongside the visible course cards when changing a course.
- `src/styles.css` and `tailwind.config.cjs`: local fonts, accessibility styles and the existing navy/gold design.
- `public/images/`, `public/fonts/`, `public/icons.svg`: local assets. Images use WebP, intrinsic dimensions, lazy loading below the hero and a responsive high-priority hero image. Two broken URLs from the supplied file were replaced.

`npm start` and `npm run build` regenerate `src/index.html`, `public/robots.txt`, `public/sitemap.xml` and downloadable course overviews from the configuration. Edit the configuration rather than the generated files. `node scripts/prepare-assets.mjs` can restore the supplied assets from installed font/icon packages and the source image URLs; ordinary builds use the checked-in assets and do not download fonts or images. Font and icon licenses are included in `public/licenses/`.

## Static enquiry behavior

The original registration UI simulated payment, registration IDs and email delivery. The Angular version validates the enquiry fields and prepares a `mailto:` draft containing those details. The visitor opens the draft, attaches a resume in their email application and sends it. Syllabus buttons open keyboard-accessible dialogs with real, downloadable **text course overviews** based on the supplied course topics.

The static site processes no payments, stores no candidate data, uploads no resumes and sends no automated emails. Policy and unavailable resource links open contact email; replace them with real document URLs when supplied. Fees, job availability, testimonials, review claims and social profiles retain the supplied content and should be reviewed when publishing updates.

## Performance and SEO

- Complete prerendered HTML, including headings, courses, job cards and final counters, is readable without JavaScript.
- Zoneless Angular, `OnPush` components and hydration keep interactions small and reuse the prerendered document. Display-only sections use `hydrate never`, so their component JavaScript is not downloaded on the production page. Interactive sections hydrate normally. When adding Angular interactions to a static section, remove its `hydrate never` boundary in `app.component.ts`.
- Tailwind is compiled and purged during the build. There are no runtime Tailwind, Google Fonts, Font Awesome CDN or image-host requests.
- Production builds minify code, inline critical CSS, fingerprint bundles and enforce size budgets.
- Canonical URL, descriptive title/description, Open Graph and Twitter metadata, a local social image, Organization/WebSite/WebPage/Course JSON-LD, `robots.txt` and a one-page sitemap are generated together.
- Sections have semantic headings, navigation and form labels; a skip link, visible keyboard focus, native dialog focus handling and reduced-motion styles are included. No scroll animation hides content.

`check:seo` inspects the actual production HTML, schema, local assets and anchors. The six browser tests cover JavaScript-disabled rendering, hydration and resource errors, the job filter, course dialogs/downloads, enquiry validation and mobile navigation. Screenshots are saved to `test-results/`.

For launch, submit `/sitemap.xml` to Google Search Console and validate the deployed canonical URL and structured data. These improvements make the content easier to crawl; search ranking also depends on content quality, local business information and external signals.

References: [Angular static output](https://angular.dev/guide/ssr#generate-a-fully-static-application), [Angular hydration](https://angular.dev/guide/hydration), [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
