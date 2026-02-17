# Testing Strategy

**Philosophy:** Pragmatic test automation — meaningful tests, not coverage for coverage's sake.

Write code that is easier to test (pure functions, container/presentational split). Don't add tests because we can.

---

## Test Layers

```
┌─────────────────────────────────────────────────┐
│  Manual Testing                                  │
│  Screen reader, keyboard, zoom, offline queue    │
├─────────────────────────────────────────────────┤
│  E2E Tests (Playwright)                          │
│  User flows, accessibility audits, offline state │
├─────────────────────────────────────────────────┤
│  Unit Tests (Vitest)                             │
│  Pure functions, data mappers, schemas, services │
└─────────────────────────────────────────────────┘
```

Each layer tests what it's best at. No layer tries to do everything.

---

## Unit Tests — Vitest

**4 test files**, co-located with the code they test.

| File | Tests | What it validates |
|------|-------|-------------------|
| `mappers.test.ts` | PocketBase → domain transformations | `toLodge`, `toDiningEntry`, `toDiningTableRow`, `mergeMembersWithDining` — field mapping, resigned member filtering |
| `member-entry.test.ts` | Zod schema validation | Valid/invalid dining status values, boundary cases |
| `mutation-queue.test.ts` | IndexedDB queue operations | Enqueue, dequeue, collapse-by-memberId, clear — uses `fake-indexeddb` polyfill |
| `time.test.ts` | Time formatting utility | `formatTimeAgo` — seconds, minutes, hours, boundary values |

**Why these tests exist:** Each covers a pure function or isolated service with non-trivial logic. Mappers filter resigned members and reshape nested data. The mutation queue has collapse logic that could silently break. The schema validates system-boundary input. The time utility has edge cases around singular/plural formatting.

**What we don't unit test:** Vue components, composables that depend on Pinia/Colada, store methods. These are better covered by E2E tests where the full reactive pipeline is running.

---

## E2E Tests — Playwright

**14 tests** across 4 spec files, run in CI on every push.

| File | Tests | Scope |
|------|-------|-------|
| `smoke.spec.ts` | 3 | App shell loads, lodge cards render, navigation to dining page |
| `dining.spec.ts` | 4 | Dining table renders, status toggle, optimistic update, accessibility audit |
| `offline.spec.ts` | 4 | Offline badge, queue icon, sync icon during mutation, accessibility audits for offline/queued states |
| `accessibility.spec.ts` | 3 | Index page axe-core audit, dining page audit, focus management |

**Mocking strategy:** All PocketBase API routes are mocked via Playwright's `page.route()` ([ADR-006](decisions/ADR-006-playwright-mocks.md)). Realtime SSE is mocked with `mockRealtimeConnection()` to keep the connection monitor in `'connected'` state. No MSW — Playwright's native mocking is sufficient for E2E scope.

**axe-core integration:** Custom `makeAxeBuilder()` fixture injects axe-core with WCAG 2.2 AA tags. 4 tests run accessibility audits — any violation fails the build.

**What E2E doesn't cover:** The full offline → reconnect → queue flush → sync flow. The reconnect signal depends on PocketBase SDK internals that are non-deterministic without a real server. This is covered by manual testing instead ([offline-queue-sync.md](manual-testing/offline-queue-sync.md)).

---

## Manual Testing

**2 guides** for scenarios that automation can't reliably cover.

| Guide | Scenarios |
|-------|-----------|
| [Offline queue sync](manual-testing/offline-queue-sync.md) | 5 test cases: single toggle sync, batch sync, collapse logic, persistence across refresh, mid-sync disconnection |
| [Accessibility](manual-testing/accessibility.md) | Screen reader announcements, keyboard navigation, 200% zoom, touch target verification |

These require a running PocketBase instance and human judgement (e.g. "is the screen reader announcement clear?").

---

## CI Pipeline

All tests run in a single GitHub Actions job on every push to `main` and all PRs.

```
Lint → Unit tests → Build → E2E tests → Report
```

- **Build-then-serve:** E2E tests run against a built SPA served by `http-server`, not Vite's dev server ([ADR-012](decisions/ADR-012-cicd-pipeline-design.md))
- **Reports:** Vitest JSON + ESLint JSON + Playwright HTML report feed into a [test dashboard](https://darynholmes.github.io/festive/) on GitHub Pages
- **Artifacts:** Playwright trace reports uploaded on every run (14-day retention) for debugging failures

---

## Quality Characteristics

Tests follow these principles (from CLAUDE.md):

- **Independent** — no test depends on another; run in any order
- **Deterministic** — same result every time; no flaky tests
- **Fast** — immediate feedback for rapid development
- **Single responsibility** — one behaviour per test
- **Semantic locators** — `getByRole`, `getByText` — no CSS selectors in E2E tests ([ADR-008](decisions/ADR-008-page-object-model.md))
