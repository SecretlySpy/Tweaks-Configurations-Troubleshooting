import { defineConfig } from '@playwright/test';

const repositoryBase = '/Tweaks-Configurations-Troubleshooting';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    // Keep the trailing slash so relative test routes resolve beneath the
    // repository subpath instead of resetting to the preview server root.
    baseURL: `http://127.0.0.1:4321${repositoryBase}/`,
    colorScheme: 'dark',
    locale: 'en-GB',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    url: `http://127.0.0.1:4321${repositoryBase}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'tablet-chromium',
      use: { viewport: { width: 900, height: 1100 } },
    },
    {
      name: 'mobile-chromium',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});

