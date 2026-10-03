import { test, expect } from '@playwright/test';

test('prerendered content is readable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Build Your Career in Pune');
  await expect(page.getByRole('heading', { name: 'Premium Certification Programs' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pharmacovigilance Trainee' })).toBeVisible();
  await expect(page.locator('.counter').first()).toHaveText('1000');
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
  await page.getByRole('heading', { name: 'What Our Students Say' }).scrollIntoViewIfNeeded();
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

test('job filter switches between fresher and experienced roles', async ({ page }) => {
  await page.goto('/');
  const filter = page.getByRole('combobox', { name: 'Filter job openings by experience' });
  await filter.selectOption('fresher');
  await expect(page.getByRole('heading', { name: 'Pharmacovigilance Trainee' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Clinical Data Manager (CDM)' })).toBeHidden();
  await filter.selectOption('experienced');
  await expect(page.getByRole('heading', { name: 'Pharmacovigilance Trainee' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Clinical Data Manager (CDM)' })).toBeVisible();
  await filter.selectOption('all');
  await expect(page.getByRole('heading', { name: 'Pharmacovigilance Trainee' })).toBeVisible();
});

test('course dialog supports downloads, Escape and focus restoration', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Syllabus' }).first();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Course overview' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Clinical Trial Management (CTM)');
  const downloadEvent = page.waitForEvent('download');
  await dialog.getByRole('link', { name: 'Download course overview' }).click();
  expect((await downloadEvent).suggestedFilename()).toBe('clinical-research.txt');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Syllabus' }).nth(1).click();
  await expect(dialog).toContainText('MedDRA Coding & Argus Safety');
  await dialog.getByRole('button', { name: 'Close course overview' }).click();
  await expect(dialog).toBeHidden();
});

test('enquiry validates required fields and prepares the actual email draft', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Prepare Email Enquiry' }).click();
  await expect(page.getByRole('link', { name: 'Open email draft' })).toBeHidden();
  await page.getByLabel('Full name *').fill('Test Candidate');
  await page.getByLabel('Email address *').fill('candidate@example.com');
  await page.getByLabel('WhatsApp number *').fill('+91 9876543210');
  await page.getByLabel('Current location *').fill('Pune');
  await page.getByLabel('Qualification & specialization *').fill('B.Pharm');
  await page.getByLabel('Preferred job role or course *').fill('Clinical Research');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Prepare Email Enquiry' }).click();
  const draft = page.getByRole('link', { name: 'Open email draft' });
  await expect(draft).toBeVisible();
  const href = await draft.getAttribute('href');
  expect(href).toContain('mailto:info@peakaxisglobal.com');
  expect(decodeURIComponent(href!)).toContain('Full name: Test Candidate');
  expect(decodeURIComponent(href!)).toContain('Preferred role or course: Clinical Research');
  await expect(page.getByText('Registration Successful!')).toHaveCount(0);
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
