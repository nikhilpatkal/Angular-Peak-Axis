import { test, expect } from '@playwright/test';

test('prerendered content is readable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Transform Your Career');
  await expect(page.getByRole('heading', { name: 'Premium Certification Programs' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pharmacovigilance Trainee' })).toBeVisible();
  await expect(page.getByText('1500', { exact: true }).first()).toBeVisible();
  await context.close();
});

test('production hydrates without errors, loads local assets and has no broken anchors', async ({ page }) => {
  const errors: string[] = [];
  const failed: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
  await page.goto('/');
  // Exercise lazy images before checking resource errors and capturing the full page.
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.getByRole('heading', { name: 'How We Support Learners' }).scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(href => !document.getElementById(href!.slice(1))));
  expect(brokenAnchors).toEqual([]);
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Dismiss announcement' })).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss announcement' }).click();
  await expect(page.locator('#announcement-bar')).toBeHidden();
});

test('career-path filter switches between entry-level and experienced examples', async ({ page }) => {
  await page.goto('/');
  const filter = page.getByRole('combobox', { name: 'Filter career paths by experience' });
  await filter.selectOption('fresher');
  await expect(page.getByRole('heading', { name: 'Pharmacovigilance Trainee' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Clinical Data Manager' })).toBeHidden();
  await filter.selectOption('experienced');
  await expect(page.getByRole('heading', { name: 'Pharmacovigilance Trainee' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Clinical Data Manager' })).toBeVisible();
  await filter.selectOption('all');
  await expect(page.getByRole('heading', { name: 'Pharmacovigilance Trainee' })).toBeVisible();
});

test('homepage counters, marquee and career carousel animate after hydration', async ({ page }) => {
  await page.goto('/');

  const firstCounter = page.locator('.counter').first();
  await firstCounter.scrollIntoViewIfNeeded();
  await expect.poll(async () => (await firstCounter.textContent())?.trim()).toBe('1500');

  const marquee = page.locator('.animate-scroll-x').first();
  await expect.poll(() => marquee.evaluate(element => getComputedStyle(element).animationName)).not.toBe('none');

  const carousel = page.getByRole('region', { name: 'Career pathway carousel' });
  await carousel.scrollIntoViewIfNeeded();
  const position = carousel.locator('.min-w-16');
  const initialPosition = (await position.textContent())?.trim();
  await expect.poll(async () => (await position.textContent())?.trim(), { timeout: 5000 }).not.toBe(initialPosition);
});

test('course category filters update the responsive course grid', async ({ page }) => {
  await page.goto('/');
  const filters = page.getByRole('group', { name: 'Filter courses by category' });
  const businessFilter = filters.getByRole('button', { name: 'Business & Finance' });
  await businessFilter.click();
  await expect(businessFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Global Digital Marketing PG Program' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Global Forex & Stock Market Certification Program' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Global PG Diploma in Clinical Research' })).toBeHidden();
  await expect(page.getByText('2 programs', { exact: true })).toBeVisible();

  await filters.getByRole('button', { name: 'All' }).click();
  await expect(page.getByRole('heading', { name: 'Global PG Diploma in Clinical Research' })).toBeVisible();
  await expect(page.getByText('10 programs', { exact: true })).toBeVisible();
  const courseRail = page.getByLabel('Certification programs; swipe or use the arrow buttons to view more');
  await page.getByRole('button', { name: 'Show more courses' }).click();
  await expect.poll(() => courseRail.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
});

test('course dialog supports downloads, Escape and focus restoration', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Syllabus' }).first();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Course overview' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Clinical Trial Management (CTM)');
  await expect(dialog).not.toContainText('Program fee');
  await expect(dialog).not.toContainText('₹');
  await expect(dialog.getByRole('link', { name: 'Enquire Now' })).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await dialog.getByRole('link', { name: 'Download course overview' }).click();
  expect((await downloadEvent).suggestedFilename()).toBe('clinical-research.txt');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Syllabus' }).nth(1).click();
  await expect(dialog).toContainText('MedDRA Coding');
  await expect(dialog).toContainText('Argus Safety Basics');
  await dialog.getByRole('button', { name: 'Close course overview' }).click();
  await expect(dialog).toBeHidden();
});

test('course pages are prerendered with unique metadata, schema and visible modules', async ({ page }) => {
  const response = await page.goto('/courses/clinical-research/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Clinical Research Course in Pune | Peak Axis Global');
  await expect(page.getByRole('heading', { level: 1, name: 'Global PG Diploma in Clinical Research' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Modules covered' })).toBeVisible();
  await expect(page.getByText('Clinical Trial Management (CTM)', { exact: true })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://peakaxisglobal.in/courses/clinical-research/');
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || '{}');
  expect(schema['@graph'].some((item: { '@type': string }) => item['@type'] === 'Course')).toBe(true);
  expect(schema['@graph'].some((item: { '@type': string }) => item['@type'] === 'BreadcrumbList')).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('unknown routes return a genuine 404 instead of the Angular homepage', async ({ request }) => {
  const response = await request.get('/this-page-does-not-exist');
  expect(response.status()).toBe(404);
  expect(await response.text()).not.toContain('Transform Your Career');
});

test('enquiry validates required fields and submits them to the configured endpoint', async ({ page }) => {
  let submittedBody = '';
  await page.route('https://script.google.com/macros/s/**', async route => {
    submittedBody = route.request().postData() ?? '';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Submit Enquiry' }).click();
  await expect(page.getByText('Enquiry submitted successfully')).toBeHidden();
  await page.getByLabel('Full name *').fill('Test Candidate');
  await page.getByLabel('Email address *').fill('candidate@example.com');
  await page.getByLabel('WhatsApp number *').fill('+91 93567 75017');
  await page.getByLabel('Current location *').fill('Pune');
  await page.getByLabel('Qualification & specialization *').fill('B.Pharm');
  await page.getByLabel('Preferred job role or course *').fill('Clinical Research');
  await page.getByLabel('Updated resume *').setInputFiles({
    name: 'test-resume.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test resume')
  });
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit Enquiry' }).click();
  await expect(page.getByText('Enquiry submitted successfully')).toBeVisible();
  expect(submittedBody).toContain('Test Candidate');
  expect(submittedBody).toContain('candidate@example.com');
  expect(submittedBody).toContain('Clinical Research');
  expect(submittedBody).toContain('test-resume.pdf');
  expect(submittedBody).toContain('JVBERi0xLjQgdGVzdCByZXN1bWU=');
});

test('enquiry rejects resumes larger than 3 MB before contacting the service', async ({ page }) => {
  let requestCount = 0;
  await page.route('https://script.google.com/macros/s/**', async route => {
    requestCount += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  await page.goto('/');
  await page.getByLabel('Full name *').fill('Test Candidate');
  await page.getByLabel('Email address *').fill('candidate@example.com');
  await page.getByLabel('WhatsApp number *').fill('+91 93567 75017');
  await page.getByLabel('Current location *').fill('Pune');
  await page.getByLabel('Qualification & specialization *').fill('B.Pharm');
  await page.getByLabel('Preferred job role or course *').fill('Clinical Research');
  await page.getByLabel('Updated resume *').setInputFiles({
    name: 'too-large.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.alloc((3 * 1024 * 1024) + 1)
  });
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit Enquiry' }).click();

  await expect(page.getByText('Resume must not be larger than 3 MB.')).toBeVisible();
  expect(requestCount).toBe(0);
});

test('mobile navigation opens, closes on selection and stays within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Toggle navigation' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#mobile-menu').getByRole('link', { name: 'About Us' }).click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(page.url()).toContain('#about');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});
