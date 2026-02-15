import { test, expect } from './fixtures';
import { LODGE_ID, MOCK_DINING_RESPONSE } from './helpers/mock-data';
import { mockDiningRoutes } from './helpers/mock-routes';

/**
 * Offline E2E tests.
 *
 * These tests mock API routes (no PocketBase server) and use Playwright's
 * context.setOffline() to simulate connectivity changes. Because there is
 * no real PocketBase SSE connection, we cannot reliably test the full
 * reconnect → queue-flush → sync flow in E2E (the connection monitor polls
 * pb.realtime.isConnected which never stabilises without a server).
 * That flow is verified manually and covered by unit tests on the
 * mutation-queue service.
 */
test.describe('Offline Awareness', () => {
  test.beforeEach(async ({ page }) => {
    await mockDiningRoutes(page);
  });

  test('connectivity badge shows "Connected" when online', async ({ page }) => {
    await page.goto(`/#/dining/${LODGE_ID}`);

    const badge = page.getByRole('status', { name: /connection status/i });
    await expect(badge).toContainText('Connected');
  });

  test('connectivity badge changes to "Offline" when browser goes offline', async ({
    page,
    context,
  }) => {
    await page.goto(`/#/dining/${LODGE_ID}`);
    await expect(
      page.getByRole('status', { name: /connection status/i }),
    ).toContainText('Connected');

    await context.setOffline(true);

    // Wait for debounce (2s) plus buffer
    const badge = page.getByRole('status', { name: /connection status/i });
    await expect(badge).toContainText('Offline', { timeout: 5000 });
  });

  test('connectivity badge has correct aria attributes', async ({ page }) => {
    await page.goto(`/#/dining/${LODGE_ID}`);

    const badge = page.getByRole('status', { name: /connection status/i });
    await expect(badge).toHaveAttribute('aria-live', 'polite');
    await expect(badge).toHaveAttribute(
      'aria-label',
      /Connection status: Connected/,
    );
  });

  test('pending sync icon appears during in-flight mutation', async ({ page }) => {
    let resolveUpdate: () => void;
    const updatePromise = new Promise<void>((resolve) => {
      resolveUpdate = resolve;
    });

    await page.route(
      '**/api/collections/dining_records/records/din_002**',
      async (route) => {
        if (route.request().method() === 'PATCH') {
          await updatePromise;
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ...MOCK_DINING_RESPONSE.items[1],
              status: 'dining',
            }),
          });
        }
        return route.continue();
      },
    );

    await page.goto(`/#/dining/${LODGE_ID}`);
    await expect(page.getByText('Festive Board Dining')).toBeVisible();

    const pembertonRow = page.getByRole('row').filter({ hasText: 'Pemberton' });
    await pembertonRow.getByRole('button', { name: /tap to change/i }).click();
    await page.locator('.q-menu').getByText('Dining', { exact: true }).click();

    // Pending sync icon should appear
    const syncIcon = pembertonRow.getByLabel('Syncing changes');
    await expect(syncIcon).toBeVisible();

    // Resolve mutation
    resolveUpdate!();

    // Icon should disappear
    await expect(syncIcon).not.toBeVisible({ timeout: 5000 });
  });

  test('last synced timestamp is displayed', async ({ page }) => {
    await page.goto(`/#/dining/${LODGE_ID}`);
    await expect(page.getByText('Festive Board Dining')).toBeVisible();

    // Should show a timestamp status element
    const timestamp = page.getByText(/Last updated:|Not yet synced/);
    await expect(timestamp).toBeVisible();
  });

  test('offline view is accessible', async ({
    page,
    context,
    makeAxeBuilder,
  }) => {
    await page.goto(`/#/dining/${LODGE_ID}`);
    await expect(page.getByText('Festive Board Dining')).toBeVisible();

    await context.setOffline(true);
    await page.waitForTimeout(3000);

    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('Offline Mutation Queuing', () => {
  test.beforeEach(async ({ page }) => {
    await mockDiningRoutes(page);
  });

  test('queued state is accessible', async ({
    page,
    context,
    makeAxeBuilder,
  }) => {
    await page.goto(`/#/dining/${LODGE_ID}`);
    await expect(page.getByText('Festive Board Dining')).toBeVisible();

    // Go offline and queue a mutation
    await context.setOffline(true);
    await expect(
      page.getByRole('status', { name: /connection status/i }),
    ).toContainText('Offline', { timeout: 5000 });

    const pembertonRow = page.getByRole('row').filter({ hasText: 'Pemberton' });
    await pembertonRow.getByRole('button', { name: /tap to change/i }).click();
    await page.locator('.q-menu').getByText('Dining', { exact: true }).click();

    // Verify aria-label on clock icon
    const queuedIcon = pembertonRow.getByLabel('Queued for sync');
    await expect(queuedIcon).toBeVisible();

    // Run axe-core with queued state active
    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
});
