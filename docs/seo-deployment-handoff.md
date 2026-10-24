# SEO deployment and account handoff

## Deploy and verify on Cloudflare Pages

1. Run `npm.cmd ci`, `npm.cmd run build`, `npm.cmd run check:seo`, and `npm.cmd run test:e2e` with a supported Node version.
2. Set the Pages output directory to `dist/peak-axis/browser`.
3. Deploy that directory. Do not add a blanket rewrite of unknown paths to `/index.html`; `404.html` is intended to return real 404 responses.
4. Open `/robots.txt`, `/sitemap.xml`, one `/courses/.../` URL, one missing asset URL, and one nonexistent page. Confirm the first three return 200 and the last two return 404.
5. Inspect response headers. Hashed JS/CSS should be immutable for one year; HTML, `robots.txt`, and `sitemap.xml` should revalidate; mutable images/fonts should use the shorter cache policy from `_headers`.
6. Confirm Cloudflare serves Brotli or gzip. Source `_headers` shows repository intent, not whether account-level rules override it.

## Canonical hostname redirect

The preferred origin is `https://peakaxisglobal.in`. `_redirects` handles `/index.html`, but hostname normalization belongs in Cloudflare because it must inspect the host.

If `www.peakaxisglobal.in` is attached to the same Cloudflare account:

1. Open **Rules > Redirect Rules > Single Redirects** for the zone.
2. Create a rule matching hostname `www.peakaxisglobal.in`.
3. Use a dynamic destination combining `https://peakaxisglobal.in` with the original request path.
4. Select **301** and enable **preserve query string**.
5. Test a nested URL with a query string and confirm it reaches the same path/query on the apex host in one hop.

Do not redirect `peakaxisglobal.com` unless ownership and the migration intent are confirmed. If it is controlled, create the same one-hop 301 from both `.com` host variants to the `.in` apex while preserving path and query.

## Google Search Console

1. Add and verify a **Domain property** for `peakaxisglobal.in` using Google's DNS TXT record.
2. Submit `https://peakaxisglobal.in/sitemap.xml` under **Sitemaps**.
3. Inspect the homepage and representative course pages with **URL inspection**, then request indexing after deployment.
4. Compare **Google-selected canonical** with the declared `.in` URL. Investigate any `.com`, `www`, or preview-domain selection.
5. Monitor **Page indexing** and **Core Web Vitals** after Google collects field data. Lighthouse is a lab test and does not establish real-user INP.

## Owner content required

- An approved privacy policy covering enquiry details, resumes, Google Sheets/Drive storage, access, retention, deletion requests, and contact information.
- Approved terms and refund policy.
- Evidence and permission before republishing placement outcomes, employer names, named testimonials, review totals, ratings, student or partner counts, salaries, accreditation, or guarantees.
- Confirmation that contact details, address, social accounts, WhatsApp links, and course descriptions are current.

## Rollback

Cloudflare Pages retains prior deployments. If post-release validation fails, open the project deployment history and promote the last known-good deployment. Reproduce the issue locally against `dist/peak-axis/browser`, fix it, rerun all checks, and deploy a new version instead of editing generated dashboard files.
