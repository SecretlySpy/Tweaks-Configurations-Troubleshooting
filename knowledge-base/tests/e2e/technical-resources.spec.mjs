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
  blockDriver: 'guides/windows/block-specific-driver-installation/',
  powershellCmd: 'guides/windows/powershell-and-cmd-commands/',
  troubleshootingTweaks: 'guides/windows/troubleshooting-and-tweaks/',
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


test('Technical Resources branding and page anchors are consistent', async ({ page }) => {
  for (const target of [paths.home, paths.allGuides, paths.n8n]) {
    await page.goto(target);
    await expect(page.locator('.brand-copy strong')).toHaveText('Technical Resources');
    await expect(page).toHaveTitle(/Technical Resources/u);
    const duplicates = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicates, target).toEqual([]);
  }
});

test('Continue reveals the original n8n instructions and the source file is accessible as a link', async ({ page }) => {
  await page.goto(paths.n8n);
  await expect(page.locator('[data-reading-panel="full"]')).toBeHidden();
  await page.locator('.figma-next-step').click();
  await expect(page.locator('[data-reading-panel="full"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Source-derived instructions' })).toBeVisible();
  const originalLinks = page.locator('.source-original-link');
  expect(await originalLinks.count()).toBeGreaterThan(0);
  expect(await originalLinks.first().getAttribute('href')).toContain('https://github.com/SecretlySpy/Tweaks-Configurations-Troubleshooting/blob/main/');
});

test('Host check command copying excludes the visual shell caption', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text) => { window.__lastCopied = text; } },
    });
  });
  await page.goto(paths.n8n);
  await expect(page.locator('.figma-command-footer [data-copy-source]')).toBeVisible();
  await page.locator('.figma-command-footer [data-copy-source]').click();
  const copied = await page.evaluate(() => window.__lastCopied);
  expect(copied.split(String.fromCharCode(10))).toEqual(['wsl --status', 'wsl --list --verbose', 'docker version', 'docker compose version']);
  expect(copied).not.toContain('Windows PowerShell');
});

test('Save controls still toggle when localStorage rejects writes', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('storage disabled', 'QuotaExceededError'); };
  });
  await page.goto(paths.n8n);
  const button = page.locator('[data-bookmark-button]');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('Directory filters show only cards matching the selected operating system and category', async ({ page }) => {
  await page.goto(paths.allGuides);
  await page.locator('[data-directory-os]').selectOption('linux');
  await page.locator('[data-directory-category]').selectOption('application-setup');
  const matching = page.locator('[data-guide-card]:visible');
  expect(await matching.count()).toBeGreaterThan(0);
  for (const card of await matching.all()) {
    expect((await card.getAttribute('data-os')).split(',')).toContain('linux');
    expect((await card.getAttribute('data-category')).split(',')).toContain('application-setup');
  }
});

test('every original reference remains visible and clickable at each viewport', async ({ page }) => {
  await page.goto(paths.n8n);
  const links = page.locator('.figma-reference-row[href]');
  await expect(links).toHaveCount(8);
  await expect(links.last()).toBeVisible();
  await expect(links.first()).toHaveAttribute('href', /github/u);
  await expect(page.locator('.figma-command-footer [data-copy-source]')).toBeVisible();
  await expect(page.locator('.architecture-node').last()).toBeVisible();
});

test('restored images load with positive dimensions across remediated guides', async ({ page }) => {
  // Check driver blocking guide screenshots in full and guided panels
  await page.goto(paths.blockDriver);
  const fullDriverImages = page.locator('[data-reading-panel="full"] .guide-image');
  await expect(fullDriverImages).toHaveCount(6);
  for (const img of await fullDriverImages.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toBeVisible();
    const naturalWidth = await img.evaluate((el) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  }

  // Check troubleshooting compendium screenshots
  await page.goto(paths.troubleshootingTweaks);
  const fullCompImages = page.locator('[data-reading-panel="full"] .guide-image');
  await expect(fullCompImages).toHaveCount(2);
  for (const img of await fullCompImages.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toBeVisible();
    const naturalWidth = await img.evaluate((el) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  }

  // Check n8n diagrams
  await page.goto(paths.n8n);
  const n8nImages = page.locator('[data-reading-panel="guided"] .guide-image');
  await expect(n8nImages).toHaveCount(6);
  for (const img of await n8nImages.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toBeVisible();
    const naturalWidth = await img.evaluate((el) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  }
});

test('structured tables render with headers and rows without layout overflow', async ({ page }) => {
  await page.goto(paths.powershellCmd);
  const fullTables = page.locator('[data-reading-panel="full"] .guide-table');
  await expect(fullTables).toHaveCount(2);
  const guidedTables = page.locator('[data-reading-panel="guided"] .guide-table');
  await expect(guidedTables).toHaveCount(2);

  // Check no horizontal overflow
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  // Check compendium tables
  await page.goto(paths.troubleshootingTweaks);
  const compTables = page.locator('[data-reading-panel="full"] .guide-table');
  await expect(compTables).toHaveCount(2);
  await expect(compTables.first().getByRole('cell', { name: 'Cisco OpenDNS' })).toBeVisible();
  await expect(compTables.last().getByRole('cell', { name: 'powercfg -list' })).toBeVisible();
});

