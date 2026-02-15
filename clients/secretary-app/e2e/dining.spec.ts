import { test, expect } from './fixtures';
import { LODGE_ID, MOCK_DINING_RESPONSE } from './helpers/mock-data';
import { mockDiningRoutes } from './helpers/mock-routes';

test.describe('Dining Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockDiningRoutes(page);
  });

  test('renders members with their dining statuses', async ({ page }) => {
    await page.goto(`/#/dining/${LODGE_ID}`);

    await expect(page.getByText('Festive Board Dining')).toBeVisible();
    await expect(page.getByText('Whitfield, James')).toBeVisible();
    await expect(page.getByText('Pemberton, Richard')).toBeVisible();
    await expect(page.getByText('Sinclair, George')).toBeVisible();

    await expect(page.getByText('1 dining')).toBeVisible();
    await expect(page.getByText('1 not dining')).toBeVisible();
    await expect(page.getByText('1 undecided')).toBeVisible();
  });

  test('optimistic update reflects immediately on toggle', async ({ page }) => {
    let updateResolve: () => void;
    const updatePromise = new Promise<void>((resolve) => {
      updateResolve = resolve;
    });

    await page.route(
      '**/api/collections/dining_records/records/din_002**',
      async (route) => {
        if (route.request().method() === 'PATCH') {
          // Hold the response to verify optimistic state
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
    await expect(page.getByText('1 dining')).toBeVisible();

    // Open the status menu for Pemberton (currently not_dining) and select "Dining"
    const pembertonRow = page.getByRole('row').filter({ hasText: 'Pemberton' });
    await pembertonRow.getByRole('button', { name: /tap to change/i }).click();
    await page.locator('.q-menu').getByText('Dining', { exact: true }).click();

    // UI should update optimistically before server responds
    await expect(page.getByText('2 dining')).toBeVisible();
    await expect(page.getByText('0 not dining')).toBeVisible();

    // Release the server response
    updateResolve!();
  });

  test('rolls back on server error', async ({ page }) => {
    await page.route(
      '**/api/collections/dining_records/records/din_002**',
      (route) => {
        if (route.request().method() === 'PATCH') {
          return route.fulfill({ status: 500 });
        }
        return route.continue();
      },
    );

    await page.goto(`/#/dining/${LODGE_ID}`);
    await expect(page.getByText('1 not dining')).toBeVisible();

    const pembertonRow = page.getByRole('row').filter({ hasText: 'Pemberton' });
    await pembertonRow.getByRole('button', { name: /tap to change/i }).click();
    await page.locator('.q-menu').getByText('Dining', { exact: true }).click();

    // After server error, should roll back to original state
    await expect(page.getByText('1 not dining')).toBeVisible({ timeout: 5000 });
  });

  test('dining dashboard is accessible', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto(`/#/dining/${LODGE_ID}`);
    await expect(page.getByText('Festive Board Dining')).toBeVisible();

    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
});
