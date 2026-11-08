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
  await expect(page.getByRole('link', { name: 'Peak Axis Global on Facebook' })).toHaveAttribute('href', 'https://www.facebook.com/share/1FNE2nMELe/');
  await expect(page.getByRole('link', { name: 'Peak Axis Global on Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/global_peak_axis_official?cplk=dWNzdDNvMWhtYjdj');
  await expect(page.getByRole('link', { name: 'Peak Axis Global on LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/company/company-peakaxisglobalofficial-/');
  await expect(page.getByRole('link', { name: 'Telegram', exact: true })).toHaveAttribute('href', 'https://t.me/peakaxisglobalofficialpage');
  await expect(page.getByRole('link', { name: 'YouTube', exact: true })).toHaveAttribute('href', 'https://youtube.com/@peakaxisglobalcareers?si=855c4HZZJT1mFYSw');
  const placementStories = page.getByRole('region', { name: 'Meet Our Recently Placed Students' });
  await expect(placementStories.getByRole('article')).toHaveCount(23);
  await expect(placementStories.getByRole('heading', { name: 'Tejas Gayke' })).toBeVisible();
  await expect(placementStories.getByText('Optum', { exact: true })).toBeVisible();
  const tejasCard = placementStories.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Tejas Gayke' }) });
  const storyButton = tejasCard.getByRole('button', { name: 'Read full success story from Tejas Gayke' });
  await storyButton.click();
  await expect(tejasCard.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  await expect(tejasCard).toContainText('start a career in Clinical Research.');
  await tejasCard.getByRole('button', { name: 'Show less from Tejas Gayke' }).click();
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

test('homepage counters, marquee and placement carousel animate after hydration', async ({ page }) => {
  await page.goto('/');

  const firstCounter = page.locator('.counter').first();
  await firstCounter.scrollIntoViewIfNeeded();
  await expect.poll(async () => (await firstCounter.textContent())?.trim()).toBe('1500');

  const marquee = page.locator('.animate-scroll-x').first();
  await expect.poll(() => marquee.evaluate(element => getComputedStyle(element).animationName)).not.toBe('none');

  const carousel = page.getByRole('region', { name: 'Student placement carousel' });
  await carousel.scrollIntoViewIfNeeded();
  const position = carousel.locator('.min-w-16');
  const initialPosition = (await position.textContent())?.trim();
  await expect.poll(async () => (await position.textContent())?.trim(), { timeout: 5000 }).not.toBe(initialPosition);

  await carousel.getByRole('button', { name: 'Show previous placed student' }).focus();
  const pausedPosition = (await position.textContent())?.trim();
  await page.waitForTimeout(3200);
  await expect(position).toHaveText(pausedPosition!);
});

test('course category filters update the responsive course grid', async ({ page }) => {
  await page.goto('/');
  const filters = page.getByRole('group', { name: 'Filter courses by category' });
  const businessFilter = filters.getByRole('button', { name: 'Business & Finance' });
  await businessFilter.click();
  await expect(businessFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Global Digital Marketing PG Program' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Global Forex & Stock Market Certification Program' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Global PG Diploma in Clinical Research (All-in-One)' })).toBeHidden();
  await expect(page.getByText('2 programs', { exact: true })).toBeVisible();

  await filters.getByRole('button', { name: 'All' }).click();
  await expect(page.getByRole('heading', { name: 'Global PG Diploma in Clinical Research (All-in-One)' })).toBeVisible();
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
  await expect(dialog).toContainText('Clinical Research (CR)');
  await expect(dialog).not.toContainText('Program fee');
  await expect(dialog).not.toContainText('₹');
  await expect(dialog.getByRole('link', { name: 'Enquire Now', exact: true })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Enquire Now / Get Course Syllabus' })).toHaveAttribute('href', '/?syllabus=clinical-research#registration');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Syllabus' }).nth(1).click();
  await expect(dialog).toContainText('MedDRA Coding');
  await expect(dialog).toContainText('Argus Safety Basics');
  await expect(dialog.getByRole('link', { name: 'Enquire Now / Get Course Syllabus' })).toHaveAttribute('href', '/?syllabus=pharmacovigilance#registration');
  await expect(dialog.getByRole('link', { name: 'Download course overview' })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Close course overview' }).click();
  await expect(dialog).toBeHidden();
});

test('course pages are prerendered with unique metadata, schema and visible modules', async ({ page }) => {
  const response = await page.goto('/courses/clinical-research/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Clinical Research Course in Pune | Peak Axis Global');
  await expect(page.getByRole('heading', { level: 1, name: 'Global PG Diploma in Clinical Research (All-in-One)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Modules covered' })).toBeVisible();
  for (const moduleName of [
    'Clinical Research (CR)',
    'Clinical Data Management (CDM)',
    'Pharmacovigilance (PV)',
    'Medical Writing (MW)',
    'Drug Regulatory Affairs (DRA)',
    'AI in Clinical Research (ACR)',
    'Personality Development (PD)'
  ]) {
    await expect(page.getByText(moduleName, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'Enquire Now / Get Course Syllabus' }).first()).toHaveAttribute('href', '/?syllabus=clinical-research#registration');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://peakaxisglobal.in/courses/clinical-research/');
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || '{}');
  expect(schema['@graph'].some((item: { '@type': string }) => item['@type'] === 'Course')).toBe(true);
  expect(schema['@graph'].some((item: { '@type': string }) => item['@type'] === 'BreadcrumbList')).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('learner support section shows the supplied named testimonials', async ({ page }) => {
  await page.goto('/');
  const testimonials = page.locator('app-testimonials');
  await expect(testimonials.getByRole('heading', { name: 'How We Support Learners' })).toBeVisible();
  await expect(testimonials.getByRole('heading', { name: 'Shradha Bankar' })).toBeVisible();
  await expect(testimonials.getByText('PeakAxis Global provided excellent guidance and support throughout my career preparation.')).toBeVisible();
  await expect(testimonials.getByRole('heading', { name: 'Tejas Gayke' })).toBeVisible();
  await expect(testimonials.getByText('PeakAxis Global has been a great support in my career journey.')).toBeVisible();
  await expect(testimonials.getByRole('heading', { name: 'Dr. Sanvedana Kambale' })).toBeVisible();
  await expect(testimonials.getByText('My experience with PeakAxis Global was very helpful and informative.')).toBeVisible();
});

test('syllabus request uses the main enquiry form and unlocks the selected download after save', async ({ page }) => {
  let submittedBody = '';
  await page.route('https://script.google.com/macros/s/**', async route => {
    submittedBody = route.request().postData() ?? '';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  await page.goto('/courses/pharmacovigilance/');
  await page.getByRole('link', { name: 'Enquire Now / Get Course Syllabus' }).first().click();
  await expect(page).toHaveURL(/\/\?syllabus=pharmacovigilance#registration$/);
  const form = page.locator('#registrationForm');
  await expect(page.getByLabel('Preferred job role or course *')).toHaveValue(
    'Syllabus request: Advanced Pharmacovigilance Global Certification Program'
  );
  await expect(page.getByRole('link', { name: 'Download Syllabus' })).toHaveCount(0);
  await page.getByLabel('Full name *').fill('Pharmacovigilance Candidate');
  await page.getByLabel('Email address *').fill('pv@example.com');
  await page.getByLabel('WhatsApp number *').fill('+91 94213 22719');
  await page.getByLabel('Current location *').fill('Mumbai');
  await page.getByLabel('Qualification & specialization *').fill('B.Pharm');
  await page.getByLabel('Updated resume *').setInputFiles({
    name: 'pv-resume.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test resume')
  });
  await form.getByRole('checkbox').check();
  await form.getByRole('button', { name: 'Submit Enquiry' }).click();

  await expect(page.getByRole('heading', { name: 'Enquiry submitted successfully' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download Syllabus' })).toHaveAttribute('href', '/programs/pharmacovigilance.txt');
  expect(submittedBody).toContain('Pharmacovigilance Candidate');
  expect(submittedBody).toContain('pv@example.com');
  expect(submittedBody).toContain('Syllabus request: Advanced Pharmacovigilance Global Certification Program');
  expect(submittedBody).toContain('Mumbai');
  expect(submittedBody).toContain('pv-resume.pdf');
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
  await page.getByLabel('WhatsApp number *').fill('+91 94213 22719');
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
  await page.getByLabel('WhatsApp number *').fill('+91 94213 22719');
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
