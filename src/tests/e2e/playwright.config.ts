/**
 * @module playwright.config
 * @description Playwright E2E test configuration for instack.
 * Defines desktop and mobile projects with failure capture settings.
 *
 * @agent @WATCHDOG — DevOps/SRE
 * @sprint S08_INTEGRATION_BETA
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  baseURL: process.env.BASE_URL || 'http://localhost:5173',
  timeout: 30_000,
  retries: 1,
  reporter: [
    ['html', { outputFolder: '../../test-results/e2e-report' }],
    ['list'],
  ],
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        viewport: { width: 1280, height: 720 },
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    },
    {
      name: 'mobile',
      use: {
        viewport: { width: 375, height: 812 },
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
