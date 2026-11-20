import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const paths = {
  // Relative URLs deliberately inherit Playwright's repository-subpath base.
  home: './',
  allGuides: 'all-guides/',
  saved: 'saved/',
  windows: 'windows/',
  n8n: 'guides/shared/n8n-local-docker-compose/',
  androidTroubleshooting: 'android/troubleshooting/',
};

test('homepage renders the approved information architecture without horizontal overflow', async ({ page }, testInfo) => {
  await page.goto(paths.home);
  const approvedHeading = testInfo.project.name === 'mobile-chromium'
    ? 'A clearer way to find the fix'
    : 'Your technical library, made easier to navigate';
  await expect(page.getByRole('heading', { level: 1 })).toContainText(approvedHeading);
  const osCards = page.locator('main .os-card');
  await expect(osCards).toHaveCount(3);
  await expect(osCards.filter({ hasText: 'Windows' })).toBeVisible();
  await expect(osCards.filter({ hasText: 'Linux' })).toBeVisible();
  await expect(osCards.filter({ hasText: 'Android' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: `test-results/home-${testInfo.project.name}.png`, fullPage: true });
});

test('full-text directory search handles matches and empty results', async ({ page }) => {
  await page.goto(`${paths.allGuides}?q=Docker%20Compose`);
  await expect(page.locator('[data-guide-card]:visible')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'n8n Local Docker Compose' })).toBeVisible();
  const search = page.locator('[data-directory-search]');
  await search.fill('definitely-not-a-real-technical-resource-query');
  await expect(page.getByRole('heading', { name: 'No matching technical resources' })).toBeVisible();
});

test('directory search degrades to metadata when the full-text index is unavailable', async ({ page }) => {
  await page.route('**/data/search-index.json', (route) => route.abort());
  await page.goto(paths.allGuides);
  const search = page.locator('[data-directory-search]');
  await search.fill('n8n');
  await expect(page.getByRole('link', { name: 'n8n Local Docker Compose' })).toBeVisible();
  await expect(page.locator('[data-directory-status]')).toContainText('Full-text index is unavailable');
});

test('bookmark, guided progress, refresh persistence, and source copy work locally', async ({ page, context }, testInfo) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4321' });
  await page.goto(paths.n8n);
  await page.screenshot({ path: `test-results/n8n-${testInfo.project.name}.png`, fullPage: false });
  const bookmark = page.locator('[data-bookmark-button]');
  await bookmark.click();
  await expect(bookmark).toHaveAttribute('aria-pressed', 'true');

  await page.locator('[data-mode="guided"]').click();
  const firstStep = page.locator('[data-step-checkbox]').first();
  await firstStep.check();
  await page.reload();
  await page.locator('[data-mode="guided"]').click();
  await expect(page.locator('[data-step-checkbox]').first()).toBeChecked();

  await page.locator('[data-mode="full"]').click();
  const sourceDocument = page.locator('details.source-document').first();
  if (await sourceDocument.getAttribute('open') === null) {
    await sourceDocument.locator('summary').click();
  }
  await sourceDocument.locator('[data-copy-source]').click();
  await expect(page.locator('[data-toast]')).toContainText('copied');

  await page.goto(paths.saved);
  await expect(page.getByRole('link', { name: 'n8n Local Docker Compose' })).toBeVisible();
});

test('clipboard denial selects source text for manual copying', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => { throw new DOMException('Denied for fallback test.', 'NotAllowedError'); },
      },
    });
  });
  await page.goto(paths.n8n);
  await page.locator('[data-mode="full"]').click();
  const sourceDocument = page.locator('details.source-document').first();
  if (await sourceDocument.getAttribute('open') === null) {
    await sourceDocument.locator('summary').click();
  }
  await sourceDocument.locator('[data-copy-source]').click();
  await expect(page.locator('[data-toast]')).toContainText('Clipboard access was denied');
  const selectedLength = await page.evaluate(() => window.getSelection()?.toString().length ?? 0);
  expect(selectedLength).toBeGreaterThan(0);
});

test('intentional empty states and mobile navigation remain usable', async ({ page }, testInfo) => {
  const missingResponse = await page.goto('missing-technical resource/');
  expect(missingResponse?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This technical resource is off the map.' })).toBeVisible();

  await page.goto(paths.androidTroubleshooting);
  await expect(page.getByRole('heading', { name: 'No source-backed guides yet' })).toBeVisible();

  if (testInfo.project.name === 'mobile-chromium') {
    await page.goto(paths.home);
    await expect(page.locator('.home-search')).toBeVisible();
    await expect(page.locator('[data-mobile-bottom-nav]').getByRole('link', { name: 'Search' })).toBeVisible();

    const menu = page.locator('[data-menu-toggle]');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    const sidebar = page.locator('[data-site-sidebar]');
    const sidebarLinks = sidebar.locator('a');
    await expect(sidebar).toHaveClass(/open/u);
    await expect(sidebarLinks.first()).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(sidebarLinks.last()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
  }
});

test('collection rows and tablet shell follow the approved responsive hierarchy', async ({ page }, testInfo) => {
  await page.goto(paths.windows);
  await expect(page.getByRole('heading', { level: 1, name: 'Windows' })).toBeVisible();
  await expect(page.locator('.category-card--numbered')).toHaveCount(3);
  await expect(page.locator('[data-guide-card]').first()).toHaveClass(/guide-card--row/u);

  if (testInfo.project.name === 'tablet-chromium') {
    await expect(page.locator('[data-site-sidebar]')).not.toBeInViewport();
    await expect(page.locator('[data-menu-toggle]')).toBeVisible();
  }

  await page.screenshot({ path: `test-results/windows-${testInfo.project.name}.png`, fullPage: true });
});

test('representative pages have no serious or critical automated accessibility violations', async ({ page }) => {
  for (const route of [paths.home, paths.allGuides, paths.n8n]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
    expect(blocking, `${route}: ${blocking.map((violation) => violation.id).join(', ')}`).toEqual([]);
  }
});

test('reduced-motion preference removes meaningful transition duration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(paths.home);
  const duration = await page.locator('.os-card').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  // Chromium may serialize 0.00001 seconds in scientific notation (1e-05s).
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.00001);
});

