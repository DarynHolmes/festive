import type { Page } from '@playwright/test';
import {
  MOCK_LODGES_RESPONSE,
  MOCK_MEMBERS_RESPONSE,
  MOCK_DINING_RESPONSE,
} from './mock-data';

/**
 * Mock the PocketBase realtime SSE endpoint so the connection monitor
 * sees a "connected" state. Without this, tests that assert on the
 * connectivity badge fail in environments without a live PocketBase
 * (e.g. CI). The `retry:50` keeps the EventSource reconnect loop tight
 * so the badge stays "Connected" between cycles.
 */
export async function mockRealtimeConnection(page: Page) {
  await page.route('**/api/realtime', (route) => {
    if (route.request().headers()['accept']?.includes('text/event-stream')) {
      return route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: 'retry:50\nid:mock-client\nevent:PB_CONNECT\ndata:{"clientId":"mock-client"}\n\n',
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    });
  });
}

export async function mockLodgeRoutes(page: Page) {
  await mockRealtimeConnection(page);
  await page.route('**/api/collections/lodges/records**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_LODGES_RESPONSE),
    }),
  );
}

export async function mockDiningRoutes(page: Page) {
  await mockRealtimeConnection(page);
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
