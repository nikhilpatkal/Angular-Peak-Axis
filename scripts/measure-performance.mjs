import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { COURSES } from '../src/app/courses.ts';

const preview = spawn(process.execPath, ['scripts/preview.mjs'], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'inherit'] });
let browser;

try {
  await Promise.race([
    new Promise((resolve, reject) => {
      preview.stdout.setEncoding('utf8');
      preview.stdout.on('data', chunk => { if (chunk.includes('http://127.0.0.1:4173')) resolve(); });
      preview.once('error', reject);
      preview.once('exit', code => reject(new Error(`Preview exited before measurement (${code ?? 'unknown'}).`)));
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out starting the production preview.')), 15000))
  ]);

  browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true });
  const paths = ['/', ...COURSES.map(course => `/courses/${course.id}/`)];
  const results = [];

  for (const path of paths) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__peakAxisLab = { lcp: 0, cls: 0, tbt: 0 };
      try {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          if (entries.length) window.__peakAxisLab.lcp = entries.at(-1).startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__peakAxisLab.cls += entry.value;
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) window.__peakAxisLab.tbt += Math.max(0, entry.duration - 50);
        }).observe({ type: 'longtask', buffered: true });
      } catch { /* Older browsers may not expose every observer type. */ }
    });
    await page.goto(`http://127.0.0.1:4173${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      return {
        lcpMs: Math.round(window.__peakAxisLab.lcp),
        cls: Number(window.__peakAxisLab.cls.toFixed(4)),
        tbtMs: Math.round(window.__peakAxisLab.tbt),
        domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
        loadMs: Math.round(navigation.loadEventEnd),
        transferredBytes: Math.round(navigation.transferSize + resources.reduce((sum, entry) => sum + entry.transferSize, 0))
      };
    });
    results.push({ path, ...metrics });
    await context.close();
  }

  await mkdir('reports', { recursive: true });
  await writeFile('reports/performance-lab.json', `${JSON.stringify({
    measuredAt: new Date().toISOString(),
    environment: 'Local production preview, headless mobile viewport (390x844), unthrottled',
    note: 'These are repeatable local lab indicators, not Lighthouse scores or real-user Core Web Vitals/INP.',
    results
  }, null, 2)}\n`);
  console.table(results.map(result => ({
    Path: result.path,
    'LCP ms': result.lcpMs,
    CLS: result.cls,
    'TBT ms': result.tbtMs,
    'Transferred KiB': (result.transferredBytes / 1024).toFixed(1)
  })));
  console.log('Saved reports/performance-lab.json');
} finally {
  if (browser) await browser.close();
  preview.kill();
  await Promise.race([once(preview, 'exit'), new Promise(resolve => setTimeout(resolve, 3000))]);
}
