# Done Features

## Sprint 0 — Foundation

**Epic:** "As a Lodge Secretary, I want a robust, type-safe foundation for the Admin SPA, so that I can manage Lodge data with zero latency and high reliability even in historic buildings with poor connectivity."

### 01 — Project Scaffolding

- Quasar 2 + Vue 3 SPA initialised with Vite and TypeScript (no `any` types)
- Responsive layout shell using `QLayout`, `QHeader`, `QDrawer`, `QPageContainer`
- Environment configuration (`.env.development`, `.env.staging`, `.env.production`) with `VITE_POCKETBASE_URL`
- Legacy browser support (Chrome 80+) for aging Lodge laptops
- Project structure conventions established: `pages/`, `components/`, `composables/`, `stores/`, `services/`, `schemas/`
- Container/presentational pattern implemented (`IndexPage.vue` → `LodgeCard.vue`)

### 02 — State Management & PocketBase

- Pinia store (`useLodgeStore`) with `currentLodge` and `isRealtimeConnected` state
- pinia-colada integration for async server state (`useLodgesQuery` composable)
- PocketBase client singleton reading from environment variables
- Realtime subscriptions via `useRealtimeSync()` composable (event-based cache invalidation)
- Type-safe service layer with mapper functions (`toLodge`, `toDiningEntry`)
- Repository-light pattern decoupling PocketBase record shapes from domain types

### 03 — Testing & Accessibility

- Playwright configured as E2E test runner
- axe-core accessibility audits automated (WCAG 2.2 AA), reusable via `makeAxeBuilder()` fixture
- Smoke test confirming layout renders and lodge data displays
- Zod validation schema for Member Entry (`memberId`, `diningStatus`)
- Unit tests for Zod schema and type mappers (vitest)
- API mocking via Playwright for backend-independent testing

### Supporting Deliverables

- Architecture Decision Records: ADR-001 (Vue SPA), ADR-002 (PocketBase), ADR-003 (Offline-first), ADR-004 (Quasar), ADR-005 (Async state), ADR-006 (Test mocking), ADR-007 (Histoire)
- Component design rationale document (`documentation/03_component_design.md`)
- Architecture overview (`documentation/02_architecture.md`)
- Accessibility strategy (`documentation/04_accessibility.md`)

## Sprint 1 — Real-time Attendance Toggling

**Epic:** "As a Lodge Secretary, I want to toggle each member's dining status in real time, so that the Festive Board count is always accurate and I can give the caterer a confident number."

### 00 — Members Collection

- PocketBase `members` collection with fields: `lodge_id` (relation → lodges), `first_name`, `last_name`, `rank` (select: Bro/W Bro/VW Bro/RW Bro), `status` (select: active/honorary/resigned)
- `dining_records.member_id` linked as a relation to `members`
- API rules configured for authenticated read access
- Seed data script (`scripts/seed.js`) creating 1 lodge, 10 members, 9 dining records via PocketBase REST API

### 01 — Dining Dashboard & Real-time Toggling

- **Types:** `MemberRecord`, `Member`, `DiningStatus`, `DiningTableRow` added to `src/services/types.ts`
- **Mappers:** `toMember()` and `mergeMembersWithDining()` pure functions in `src/services/mappers.ts`
- **Unit tests:** `mergeMembersWithDining` tested for record pairing, default-to-undecided, and resigned-member exclusion
- **Query composable:** `useDiningDashboardQuery` — parallel fetch of members + dining records, merged into `DiningTableRow[]`
- **Mutation composable:** `useDiningMutation` — optimistic updates with snapshot/rollback pattern via pinia-colada `useMutation`
- **Presentational component:** `DiningTable.vue` — QTable with QBtnToggle for status toggling (44px hit targets)
- **Container page:** `DiningPage.vue` — route param–driven, dining count summary badges with `aria-live="polite"`
- **Route:** `/dining/:lodgeId` (named: `dining`) under MainLayout
- **Navigation:** "Manage Dining" button on each LodgeCard via actions slot
- **Realtime sync:** Cross-tab/device sync via PocketBase WebSocket subscriptions (cache invalidation aligned with dashboard query keys)
- **E2E tests:** 4 Playwright tests — renders dashboard, optimistic success (delayed response), rollback on server error, accessibility audit
- **ADR:** ADR-008 (Page Object Model strategy for E2E tests)

## Sprint 2 — Offline Awareness & Connectivity Guardrails

**Epic:** "As a Lodge Secretary, I want to see a clear visual indicator of my connection status and the freshness of the data, so that I can confidently manage the Festive Board count even when the Lodge building's Wi-Fi is intermittent."

### 01 — Connection Monitoring

- **Composable:** `useConnectionMonitor()` — dual-layer connection detection (PocketBase SSE lifecycle + browser online/offline events) with 2s disconnect debounce and reconnect polling fallback
- **Store:** `useLodgeStore` extended with tri-state `connectionStatus` (`connected` | `reconnecting` | `offline`), `lastSyncedAt` timestamp, backward-compat `isRealtimeConnected` computed
- **Layout:** `MainLayout.vue` updated with tri-state connectivity badge (Connected/Reconnecting/Offline), `role="status"` + `aria-live="polite"`, staleness `QBanner` after 5 minutes offline
- **Realtime sync:** `useRealtimeSync` updated to track `lastSyncedAt` on each event; connection lifecycle calls removed (now owned by `useConnectionMonitor`)

### 02 — Pending Mutation Indicators

- **Mutation composable:** `useDiningMutation` extended with `pendingMemberIds` tracking (`onMutate` adds, `onSettled` removes)
- **Mutation strategy:** `onSuccess` replaced `invalidateQueries` with targeted cache patch (sets `diningRecordId` + `status` from server response), eliminating race condition with realtime event invalidation
- **Presentational component:** `DiningTable.vue` updated with per-row sync icon (always rendered with `visibility: hidden` when idle to prevent layout shift), `aria-hidden` toggled dynamically
- **Container page:** `DiningPage.vue` updated with "Last updated: X ago" caption (60s refresh interval), accessible count badges (`outline` variant with WCAG AA–compliant colours)

### 03 — Utilities & Testing

- **Utility:** `formatTimeAgo(date)` pure function in `src/utils/time.ts` with co-located unit tests (7 tests covering boundaries, singular/plural)
- **E2E tests:** 6 Playwright tests in `e2e/offline.spec.ts` — badge states, offline transition, aria attributes, pending sync icon lifecycle, last synced timestamp, offline accessibility audit
- **E2E helpers:** Shared `mockLodgeRoutes` and `mockDiningRoutes` in `e2e/helpers/mock-routes.ts`; `MOCK_LODGES_RESPONSE` added to `e2e/helpers/mock-data.ts`; all spec files refactored to use shared helpers per ADR-008
- **ADR-008 updated:** Added YAGNI clause for helper functions; updated examples to match actual helper names

### Supporting Deliverables

- Development journal (`supporting-documentation/development-journal.md`) — documents team roles, collaboration model, and Sprint 2 decision trail
- Pragmatism review (`documentation/requirements/todo/pragmatism-review.md`) — self-assessment of engineering pragmatism
- Offline mutation queuing gap documented (`documentation/requirements/todo/offline-mutation-queuing.md`) — deferred to future sprint
