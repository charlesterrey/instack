/**
 * @module app-management.spec
 * @description E2E Scenarios 3 & 4: App Management + Free Plan Limits
 *   Validates CRUD operations on apps (create, list, rename, archive)
 *   and enforcement of the Free plan's app limit.
 *
 * @agent @BLUEPRINT — Technical Product Manager
 * @sprint S08_INTEGRATION_BETA
 * @scenarios 3, 4
 */

import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Enter sandbox mode and arrive at /create. */
async function enterSandbox(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: /tester sans compte/i }).click();
  await expect(page).toHaveURL('/create');
}

/**
 * Create a single app through the wizard using a given demo dataset.
 * Returns when the app page (/apps/:id) is loaded.
 */
async function createAppViaWizard(
  page: Page,
  opts: {
    prompt: string;
    datasetLabel: RegExp;
    appName: string;
  },
): Promise<void> {
  await page.goto('/create');

  // Step 1 — Prompt
  const textarea = page.getByRole('textbox');
  await expect(textarea).toBeVisible({ timeout: 5000 });
  await textarea.fill(opts.prompt);
  await page.getByRole('button', { name: /cr[ée]er mon app/i }).click();

  // Step 2 — Dataset selection
  await expect(page.getByText(opts.datasetLabel)).toBeVisible({ timeout: 5000 });
  await page.getByText(opts.datasetLabel).click();
  await page.getByRole('button', { name: /utiliser ces donn[ée]es/i }).click();

  // Step 3 — Wait for pipeline
  await expect(
    page.locator('[data-testid="app-renderer"], [data-app-renderer]'),
  ).toBeVisible({ timeout: 20_000 });

  // Step 4 — Publish
  const nameInput = page.locator('input[name="appName"]');
  await expect(nameInput).toBeVisible({ timeout: 5000 });
  await nameInput.fill(opts.appName);
  await page.getByRole('button', { name: /publier/i }).click();

  // Wait for navigation to app view
  await expect(page).toHaveURL(/\/apps\//, { timeout: 5000 });
}

// ---------------------------------------------------------------------------
// Scenario 3 — App Management (CRUD)
// ---------------------------------------------------------------------------

test.describe('Scenario 3: App Management', () => {
  test.beforeEach(async ({ page }) => {
    await enterSandbox(page);
  });

  test('creates 3 apps and lists them on the dashboard', async ({ page }) => {
    const apps = [
      {
        prompt: 'Suivi des interventions terrain',
        datasetLabel: /suivi interventions terrain/i,
        appName: 'App Interventions',
      },
      {
        prompt: 'Dashboard avancement projets',
        datasetLabel: /dashboard projet/i,
        appName: 'App Projets',
      },
      {
        prompt: 'Suivi de mes visites clients',
        datasetLabel: /visites clients/i,
        appName: 'App Visites',
      },
    ];

    for (const app of apps) {
      await createAppViaWizard(page, app);
    }

    // Navigate to dashboard
    await page.goto('/');

    // Verify all 3 app cards are visible
    const appCards = page.locator(
      '[data-testid="app-card"], [data-component="AppCard"]',
    );
    await expect(appCards).toHaveCount(3, { timeout: 5000 });

    // Verify each app name appears
    for (const app of apps) {
      await expect(page.getByText(app.appName)).toBeVisible();
    }
  });

  test('renames an app from the dashboard', async ({ page }) => {
    // Create one app first
    await createAppViaWizard(page, {
      prompt: 'Suivi interventions',
      datasetLabel: /suivi interventions terrain/i,
      appName: 'Ancien Nom',
    });

    await page.goto('/');

    // Open the app card's context menu (kebab/three-dot menu)
    const appCard = page.locator(
      '[data-testid="app-card"], [data-component="AppCard"]',
    ).first();
    await expect(appCard).toBeVisible();

    const menuButton = appCard.getByRole('button', { name: /menu|options|plus/i });
    await menuButton.click();

    // Click "Renommer"
    await page.getByRole('menuitem', { name: /renommer/i }).click();

    // Fill the rename dialog/inline input
    const renameInput = page.getByRole('textbox', { name: /nom/i });
    await expect(renameInput).toBeVisible();
    await renameInput.clear();
    await renameInput.fill('Nouveau Nom');

    // Confirm
    await page.getByRole('button', { name: /confirmer|enregistrer|valider/i }).click();

    // Verify the old name is gone and new name is shown
    await expect(page.getByText('Nouveau Nom')).toBeVisible();
    await expect(page.getByText('Ancien Nom')).not.toBeVisible();
  });

  test('archives an app and it disappears from the active list', async ({ page }) => {
    // Create one app
    await createAppViaWizard(page, {
      prompt: 'Suivi interventions',
      datasetLabel: /suivi interventions terrain/i,
      appName: 'App a Archiver',
    });

    await page.goto('/');

    // Verify the app is listed
    await expect(page.getByText('App a Archiver')).toBeVisible();

    // Open context menu on the app card
    const appCard = page.locator(
      '[data-testid="app-card"], [data-component="AppCard"]',
    ).filter({ hasText: 'App a Archiver' });
    const menuButton = appCard.getByRole('button', { name: /menu|options|plus/i });
    await menuButton.click();

    // Click "Archiver"
    await page.getByRole('menuitem', { name: /archiver/i }).click();

    // Confirm archival if a confirmation dialog appears
    const confirmButton = page.getByRole('button', { name: /confirmer|archiver/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // Verify the app no longer appears on the dashboard
    await expect(page.getByText('App a Archiver')).not.toBeVisible({ timeout: 5000 });
  });

  test('opens an app from the dashboard and renders it', async ({ page }) => {
    await createAppViaWizard(page, {
      prompt: 'Suivi interventions',
      datasetLabel: /suivi interventions terrain/i,
      appName: 'App Clickable',
    });

    await page.goto('/');

    // Click the app card to open it
    await page.getByText('App Clickable').click();

    // Should navigate to /apps/:id
    await expect(page).toHaveURL(/\/apps\//);

    // The app renderer should be visible with data
    await expect(
      page.locator('[data-testid="app-renderer"], [data-app-renderer]'),
    ).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Scenario 4 — Free Plan Limits
// ---------------------------------------------------------------------------

test.describe('Scenario 4: Free Plan Limits', () => {
  // This test is slow because it creates multiple apps sequentially.
  test.slow();

  test.beforeEach(async ({ page }) => {
    await enterSandbox(page);
  });

  test('shows upgrade message when exceeding the free plan app limit', async ({
    page,
  }) => {
    // The Free plan allows 3 apps (as defined in the billing/plan config).
    const datasets: Array<{
      prompt: string;
      datasetLabel: RegExp;
      appName: string;
    }> = [
      {
        prompt: 'Suivi interventions',
        datasetLabel: /suivi interventions terrain/i,
        appName: 'Free App 1',
      },
      {
        prompt: 'Suivi projets',
        datasetLabel: /dashboard projet/i,
        appName: 'Free App 2',
      },
      {
        prompt: 'Suivi visites',
        datasetLabel: /visites clients/i,
        appName: 'Free App 3',
      },
    ];

    // Create the maximum number of apps allowed
    for (const ds of datasets) {
      await createAppViaWizard(page, ds);
    }

    // Attempt to create one more app beyond the limit
    await page.goto('/create');

    // Expect one of two outcomes:
    // a) The wizard shows an upgrade/limit message immediately
    // b) The wizard starts but shows the limit message after prompt submission
    const upgradeMessage = page.getByText(
      /limite atteinte|upgrade|passer au plan|nombre maximum/i,
    );
    const promptTextarea = page.getByRole('textbox');

    // Check if the limit message appears right away
    const limitShownImmediately = await upgradeMessage
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!limitShownImmediately) {
      // If not, try submitting a prompt to trigger the limit check
      await promptTextarea.fill('Encore une app de suivi');
      await page.getByRole('button', { name: /cr[ée]er mon app/i }).click();

      // Now the limit/upgrade message should appear
      await expect(upgradeMessage).toBeVisible({ timeout: 5000 });
    }

    // The upgrade message should contain a link/button to upgrade
    await expect(
      page.getByRole('button', { name: /upgrade|passer au plan pro|voir les plans/i }).or(
        page.getByRole('link', { name: /upgrade|passer au plan pro|voir les plans/i }),
      ),
    ).toBeVisible();
  });
});
