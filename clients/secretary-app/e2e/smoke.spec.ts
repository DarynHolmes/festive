import { test, expect } from '@playwright/test';

const MOCK_LODGES_RESPONSE = {
  page: 1,
  perPage: 30,
  totalPages: 1,
  totalItems: 1,
  items: [
    {
      id: 'test_lodge_001',
      name: 'Lodge of Harmony No. 255',
      province: 'Metropolitan',
      meeting_location: 'Freemasons Hall, London',
      collectionId: 'pbc_3403674053',
      collectionName: 'lodges',
      created: '2026-01-01T00:00:00Z',
      updated: '2026-01-01T00:00:00Z',
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/collections/lodges/records**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_LODGES_RESPONSE),
    }),
  );
});

test('layout shell renders with app title', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('header');
  await expect(header).toContainText('Festive Board Manager');
});

test('lodge data renders on the page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Lodge of Harmony No. 255')).toBeVisible();
  await expect(page.getByText('Metropolitan')).toBeVisible();
});
