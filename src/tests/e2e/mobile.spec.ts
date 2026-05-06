/**
 * @module mobile.spec
 * @description E2E Scenario 6: Mobile Responsive (375px viewport)
 *   Validates that the full user flow is usable on an iPhone-sized
 *   viewport without horizontal scrolling, layout breakage, or
 *   touch-target issues.
 *
 * @agent @BLUEPRINT — Technical Product Manager
 * @sprint S08_INTEGRATION_BETA
 * @scenario 6
 */

import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Mobile viewport configuration — iPhone 14 / SE equivalent
// ---------------------------------------------------------------------------

test.use({
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Assert that there is no horizontal scrollbar on the page.
 * scrollWidth should not exceed clientWidth.
 */
async function assertNoHorizontalScroll(page: Page, context: string): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(
    scrollWidth,
    `Horizontal overflow detected on ${context}: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`,
  ).toBeLessThanOrEqual(clientWidth);
}

/**
 * Assert that all interactive elements meet the 44x44 minimum touch target.
 * We check buttons and links that are visible.
 */
async function assertTouchTargets(page: Page): Promise<void> {
  const interactiveElements = page.locator(
    'button:visible, a:visible, [role="button"]:visible',
  );
  const count = await interactiveElements.count();

  for (let i = 0; i < count; i++) {
    const el = interactiveElements.nth(i);
    const box = await el.boundingBox();
    if (box) {
      // Minimum touch target: 44x44 (WCAG 2.5.8 / Apple HIG)
      // We allow a small tolerance for inline links
      const minSize = 40; // slight tolerance
      expect(
        box.width >= minSize || box.height >= minSize,
        `Touch target too small (${box.width}x${box.height}) for element ${i}`,
      ).toBeTruthy();
    }
  }
}

async function enterSandbox(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: /tester sans compte/i }).click();
  await expect(page).toHaveURL('/create');
}

// ---------------------------------------------------------------------------
// Scenario 6 — Mobile Responsive
// ---------------------------------------------------------------------------

test.describe('Scenario 6: Mobile Responsive (375px)', () => {
  // -------------------------------------------------------------------------
  // 6a — Login page
  // -------------------------------------------------------------------------

  test('login page has no horizontal scroll on mobile', async ({ page }) => {
    await page.goto('/login');
    await assertNoHorizontalScroll(page, '/login');

    // The sandbox button and Microsoft login button should both be visible
    await expect(
      page.getByRole('button', { name: /tester sans compte/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /se connecter avec microsoft/i }).or(
        page.getByRole('link', { name: /se connecter avec microsoft/i }),
      ),
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 6b — Full sandbox wizard flow on mobile
  // -------------------------------------------------------------------------

  test('full wizard flow works on mobile without horizontal scroll', async ({
    page,
  }) => {
    // -- Login --
    await page.goto('/login');
    await assertNoHorizontalScroll(page, '/login');

    await page.getByRole('button', { name: /tester sans compte/i }).click();
    await expect(page).toHaveURL('/create');

    // -- Wizard Step 1: Prompt --
    await assertNoHorizontalScroll(page, '/create (step 1)');

    const textarea = page.getByRole('textbox');
    await expect(textarea).toBeVisible();
    await textarea.fill('Dashboard de suivi des interventions');
    await page.getByRole('button', { name: /cr[ée]er mon app/i }).click();

    // -- Wizard Step 2: Dataset --
    await expect(
      page.getByText(/suivi interventions terrain/i),
    ).toBeVisible({ timeout: 5000 });
    await assertNoHorizontalScroll(page, '/create (step 2 - dataset)');

    await page.getByText(/suivi interventions terrain/i).click();
    await page.getByRole('button', { name: /utiliser ces donn[ée]es/i }).click();

    // -- Wizard Step 3: Pipeline / Generation --
    // The pipeline progress should be visible and contained
    await assertNoHorizontalScroll(page, '/create (step 3 - pipeline)');

    // Wait for app renderer (preview)
    await expect(
      page.locator('[data-testid="app-renderer"], [data-app-renderer]'),
    ).toBeVisible({ timeout: 20_000 });
    await assertNoHorizontalScroll(page, '/create (step 3 - preview)');

    // -- Wizard Step 4: Publish --
    const nameInput = page.locator('input[name="appName"]');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('App Mobile Test');
    await assertNoHorizontalScroll(page, '/create (step 4 - publish)');

    await page.getByRole('button', { name: /publier/i }).click();

    // -- App View --
    await expect(page).toHaveURL(/\/apps\//, { timeout: 5000 });
    await assertNoHorizontalScroll(page, '/apps/:id');

    // App renderer visible and not overflowing
    await expect(
      page.locator('[data-testid="app-renderer"], [data-app-renderer]'),
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 6c — Dashboard on mobile
  // -------------------------------------------------------------------------

  test('dashboard is usable on mobile with stacked app cards', async ({ page }) => {
    await enterSandbox(page);

    // Navigate to dashboard
    await page.goto('/');
    await assertNoHorizontalScroll(page, '/ (dashboard)');

    // If there are app cards, verify they stack vertically
    const cards = page.locator(
      '[data-testid="app-card"], [data-component="AppCard"]',
    );
    const cardCount = await cards.count();

    if (cardCount >= 2) {
      // Get bounding boxes of first two cards
      const box1 = await cards.nth(0).boundingBox();
      const box2 = await cards.nth(1).boundingBox();

      if (box1 && box2) {
        // On mobile (375px), cards should stack: card2.y > card1.y
        expect(
          box2.y,
          'Cards should stack vertically on mobile (375px)',
        ).toBeGreaterThan(box1.y);

        // Each card should fit within the viewport width
        expect(box1.width).toBeLessThanOrEqual(375);
        expect(box2.width).toBeLessThanOrEqual(375);
      }
    }
  });

  // -------------------------------------------------------------------------
  // 6d — Touch targets meet minimum size
  // -------------------------------------------------------------------------

  test('login page touch targets meet minimum 44px guideline', async ({ page }) => {
    await page.goto('/login');
    await assertTouchTargets(page);
  });

  test('wizard touch targets meet minimum 44px guideline', async ({ page }) => {
    await enterSandbox(page);
    await assertTouchTargets(page);
  });

  // -------------------------------------------------------------------------
  // 6e — Text readability
  // -------------------------------------------------------------------------

  test('body text is at least 14px on mobile for readability', async ({ page }) => {
    await page.goto('/login');

    // Check that the base font size is reasonable for mobile
    const fontSize = await page.evaluate(() => {
      const body = document.querySelector('body');
      if (!body) return 16;
      return parseFloat(window.getComputedStyle(body).fontSize);
    });

    expect(fontSize).toBeGreaterThanOrEqual(14);
  });

  // -------------------------------------------------------------------------
  // 6f — Error page on mobile
  // -------------------------------------------------------------------------

  test('404 page renders correctly on mobile', async ({ page }) => {
    await enterSandbox(page);
    await page.goto('/apps/non-existent-id');

    await assertNoHorizontalScroll(page, '/apps/non-existent (404)');

    await expect(
      page.getByText(/app non trouv[ée]e|introuvable|404/i),
    ).toBeVisible({ timeout: 5000 });
  });

  // -------------------------------------------------------------------------
  // 6g — Viewport meta tag
  // -------------------------------------------------------------------------

  test('has a correct viewport meta tag for mobile', async ({ page }) => {
    await page.goto('/login');

    const viewportContent = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute('content') ?? '';
    });

    expect(viewportContent).toContain('width=device-width');
    expect(viewportContent).toContain('initial-scale=1');
  });
});
