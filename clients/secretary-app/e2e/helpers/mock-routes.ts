import type { Page } from '@playwright/test';
import {
  MOCK_LODGES_RESPONSE,
  MOCK_MEMBERS_RESPONSE,
  MOCK_DINING_RESPONSE,
} from './mock-data';

export async function mockLodgeRoutes(page: Page) {
  await page.route('**/api/collections/lodges/records**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_LODGES_RESPONSE),
    }),
  );
}

export async function mockDiningRoutes(page: Page) {
  await page.route('**/api/collections/members/records**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_MEMBERS_RESPONSE),
    }),
  );

  await page.route('**/api/collections/dining_records/records**', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DINING_RESPONSE),
      });
    }
    return route.continue();
  });
}
