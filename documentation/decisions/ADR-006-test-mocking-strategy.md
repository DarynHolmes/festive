# ADR-006: Playwright Built-in Mocks over Mock Service Worker

**Status:** Accepted

**Date:** 2026-02-14

## Context

E2E and integration tests need to control API responses — deterministic data, error scenarios, and offline behaviour. Two approaches are available:

- **Playwright's built-in request interception** (`page.route()`) — intercepts at the network layer within the browser context Playwright already controls
- **Mock Service Worker (MSW)** — installs a Service Worker that intercepts `fetch`/XHR requests inside the browser, or uses a node-level interceptor for unit tests

Both produce deterministic tests. The question is which fits this project's constraints.

## Decision

**Use Playwright's built-in mocking (`page.route()`). Do not introduce MSW.**

### Why Playwright mocks

- **Zero additional dependencies** — `page.route()` ships with Playwright. No extra package to install, configure, or maintain
- **Single interception layer** — Playwright controls the browser process; its route interception happens outside the browser at the Chromium DevTools Protocol level. No Service Worker registration competing with our PWA's own Service Worker
- **PWA / offline conflict avoidance** — the app registers a real Service Worker for offline support (see [ADR-003](ADR-003-connectivity-resilient-pwa.md)). MSW also registers a Service Worker. Two workers intercepting requests in the same scope creates ordering and caching ambiguity that is painful to debug
- **Test-scoped by default** — each `page.route()` call is scoped to the test's browser context. No shared global state leaking between tests, supporting our requirement for independent, atomic tests
- **Straightforward PocketBase mocking** — intercept `/api/collections/*` and `/api/realtime` routes directly. Return fixture JSON. No handler abstraction layer needed
- **Realtime testability** — Playwright can intercept WebSocket connections via `page.routeWebSocket()`, allowing us to simulate PocketBase realtime events without a running server

### Where MSW would have an edge

- **Shared handlers across test types** — MSW lets you reuse the same mock handlers in unit tests (node), integration tests, and E2E tests. With Playwright mocks, route handlers are only available inside Playwright
- **Request validation** — MSW's handler model encourages asserting on request bodies and headers. With Playwright, you can still do this via `route.request()`, but MSW's API is more ergonomic for it
- **Component-level testing** — if we used Vitest for component tests that hit the network, MSW's node interceptor would be useful. But our architecture (container/presentational split) means presentational components receive props and don't make network calls. Containers are tested via Playwright

### Why the trade-offs are acceptable

- We have a single test runner (Playwright) — no need to share handlers with a second framework
- Presentational components are pure (props in, events out) and don't need network mocking
- PocketBase's API surface is small and consistent (`/api/collections/{name}/records`), so route patterns are simple to maintain
- Keeping the Service Worker scope clean for the real PWA worker avoids an entire class of hard-to-diagnose caching bugs

## Consequences

- All API mocking lives in Playwright test files or shared fixture utilities — not in a standalone mock server definition
- If we later add Vitest component tests that need network mocking, we would reconsider MSW for that layer only (node mode, no Service Worker conflict)
- Test helpers should abstract common PocketBase response shapes (e.g. `mockCollectionList()`, `mockRealtimeEvent()`) to avoid fixture duplication across tests
