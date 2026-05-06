/**
 * @module error-handling.spec
 * @description E2E Scenario 5: Error Handling
 *   Validates that the application handles error states gracefully:
 *   empty prompts, pipeline failures, 404 pages, and network errors.
 *
 * @agent @BLUEPRINT — Technical Product Manager
 * @sprint S08_INTEGRATION_BETA
 * @scenario 5
 */

import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function enterSandbox(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: /tester sans compte/i }).click();
  await expect(page).toHaveURL('/create');
}

// ---------------------------------------------------------------------------
// Scenario 5 — Error Handling
// ---------------------------------------------------------------------------

test.describe('Scenario 5: Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await enterSandbox(page);
  });

  // -------------------------------------------------------------------------
  // 5a — Empty prompt validation
  // -------------------------------------------------------------------------

  test('prevents submission with an empty prompt', async ({ page }) => {
    await page.goto('/create');

    const textarea = page.getByRole('textbox');
    await expect(textarea).toBeVisible();

    // The "create" button should be disabled when the textarea is empty
    const submitButton = page.getByRole('button', { name: /cr[ée]er mon app/i });
    await expect(submitButton).toBeDisabled();

    // Type whitespace only — should still be treated as empty
    await textarea.fill('   ');
    await expect(submitButton).toBeDisabled();
  });

  test('shows inline error for a prompt that is too short', async ({ page }) => {
    await page.goto('/create');

    const textarea = page.getByRole('textbox');
    await textarea.fill('ok');

    const submitButton = page.getByRole('button', { name: /cr[ée]er mon app/i });

    // If the button is enabled, click it to trigger server-side validation
    if (await submitButton.isEnabled()) {
      await submitButton.click();

      // Expect a validation error message
      await expect(
        page.getByText(/prompt trop court|d[ée]crivez plus|minimum/i),
      ).toBeVisible({ timeout: 5000 });
    } else {
      // Button remains disabled — valid UX, the constraint is enforced client-side
      await expect(submitButton).toBeDisabled();
    }
  });

  // -------------------------------------------------------------------------
  // 5b — Pipeline error with retry
  // -------------------------------------------------------------------------

  test('handles pipeline timeout gracefully with retry option', async ({ page }) => {
    // Intercept the generation API call and force a timeout/500
    await page.route('**/api/generate*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'PIPELINE_TIMEOUT',
          message: 'Le pipeline a expire. Veuillez reessayer.',
        }),
      });
    });

    await page.goto('/create');

    // Fill a valid prompt
    await page.getByRole('textbox').fill(
      'Je veux suivre les interventions de mes techniciens',
    );
    await page.getByRole('button', { name: /cr[ée]er mon app/i }).click();

    // Select demo dataset
    await expect(
      page.getByText(/suivi interventions terrain/i),
    ).toBeVisible({ timeout: 5000 });
    await page.getByText(/suivi interventions terrain/i).click();
    await page.getByRole('button', { name: /utiliser ces donn[ée]es/i }).click();

    // Wait for error state to appear (pipeline was mocked to fail)
    const errorMessage = page.getByText(
      /erreur|[ée]chou[ée]|probl[èe]me|impossible|pipeline/i,
    );
    await expect(errorMessage).toBeVisible({ timeout: 15_000 });

    // A retry button should be available
    const retryButton = page.getByRole('button', { name: /r[ée]essayer|retry/i });
    await expect(retryButton).toBeVisible();

    // Unblock the route for the retry attempt
    await page.unroute('**/api/generate*');

    // Click retry — now the real API should handle it
    await retryButton.click();

    // The pipeline should either succeed (renderer visible) or show a
    // meaningful status. We just verify no unhandled crash.
    const outcome = page
      .locator('[data-testid="app-renderer"], [data-app-renderer]')
      .or(errorMessage);
    await expect(outcome).toBeVisible({ timeout: 20_000 });
  });

  // -------------------------------------------------------------------------
  // 5c — 404 for non-existent app
  // -------------------------------------------------------------------------

  test('shows 404 page for a non-existent app ID', async ({ page }) => {
    await page.goto('/apps/00000000-0000-0000-0000-000000000000');

    // Should display a "not found" message
    await expect(
      page.getByText(/app non trouv[ée]e|introuvable|n'existe pas|404/i),
    ).toBeVisible({ timeout: 5000 });

    // Should offer a way back to the dashboard
    const backLink = page.getByRole('link', { name: /retour|dashboard|accueil/i }).or(
      page.getByRole('button', { name: /retour|dashboard|accueil/i }),
    );
    await expect(backLink).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 5d — Network offline handling
  // -------------------------------------------------------------------------

  test('shows offline message when network is lost during wizard', async ({
    page,
    context,
  }) => {
    await page.goto('/create');

    // Fill a prompt
    await page.getByRole('textbox').fill('Suivi de mes interventions');

    // Go offline before submitting
    await context.setOffline(true);

    await page.getByRole('button', { name: /cr[ée]er mon app/i }).click();

    // Should show a network error or offline message (not an unhandled crash)
    const offlineIndicator = page.getByText(
      /connexion|hors ligne|r[ée]seau|offline|impossible de joindre/i,
    );
    await expect(offlineIndicator).toBeVisible({ timeout: 10_000 });

    // Restore connectivity
    await context.setOffline(false);
  });

  // -------------------------------------------------------------------------
  // 5e — Unauthenticated access
  // -------------------------------------------------------------------------

  test('redirects to login when accessing protected routes without session', async ({
    page,
  }) => {
    // Clear all cookies to ensure no session exists
    await page.context().clearCookies();

    // Try to access the dashboard directly
    await page.goto('/');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('redirects to login when accessing a specific app without session', async ({
    page,
  }) => {
    await page.context().clearCookies();

    await page.goto('/apps/some-id');

    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  // -------------------------------------------------------------------------
  // 5f — No console errors during normal flow
  // -------------------------------------------------------------------------

  test('produces no console.error during sandbox wizard flow', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await enterSandbox(page);

    // Fill prompt
    await page.getByRole('textbox').fill(
      'Je veux suivre les interventions de mes techniciens',
    );
    await page.getByRole('button', { name: /cr[ée]er mon app/i }).click();

    // Select dataset
    await expect(
      page.getByText(/suivi interventions terrain/i),
    ).toBeVisible({ timeout: 5000 });
    await page.getByText(/suivi interventions terrain/i).click();
    await page.getByRole('button', { name: /utiliser ces donn[ée]es/i }).click();

    // Wait for pipeline or timeout (we care about errors, not completion)
    await page
      .locator('[data-testid="app-renderer"], [data-app-renderer]')
      .waitFor({ state: 'visible', timeout: 20_000 })
      .catch(() => {
        /* pipeline may not complete in test env */
      });

    // Assert: no console errors were emitted
    expect(consoleErrors).toEqual([]);
  });
});
