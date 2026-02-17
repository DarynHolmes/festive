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

## Sprint 3 — Offline Mutation Queuing & Local Persistence

**Epic:** "As a Lodge Secretary, I want my dining status changes to be queued locally when I lose connectivity and automatically synchronized when I return online, so that I can continue managing the Festive Board without fear of data loss in historic buildings with thick stone walls."

### 01 — IndexedDB Persistence Service

- **Service:** `mutation-queue.ts` — pure TypeScript module wrapping IndexedDB via `idb` (~1.2KB gzipped)
- **Functions:** `enqueueMutation` (with collapse by memberId), `getAllMutations`, `removeMutation`, `getQueuedMemberIds`, `clearQueue`
- **Collapse logic:** IndexedDB index on `memberId` — toggling the same member 3 times offline stores only the final state
- **Unit tests:** Co-located `mutation-queue.test.ts` using `fake-indexeddb` polyfill

### 02 — Mutation Queue Store & Orchestration

- **Store:** `useMutationQueueStore` — Pinia store exposing `queuedMemberIds` (Set), `syncingMemberIds` (Set), `queuedMutations` (full array for overlay)
- **Composable:** `useMutationQueue` — called once from MainLayout; watches `connectionStatus`, replays queue sequentially on reconnect
- **Retry:** Exponential backoff (1s → 2s → 4s, max 3 attempts) for server errors; stops immediately if connectivity drops
- **Toast:** `Notify.create()` summary after successful sync ("Synced N changes to the Festive Board")

### 03 — Offline Interception & UI Wiring

- **Mutation:** `useDiningMutation` intercepts when offline — enqueues to IndexedDB and returns synthetic success so optimistic update lifecycle proceeds normally
- **Three-state icon:** `DiningTable.vue` shows schedule (clock, queued), sync (spinner, syncing), or spacer (idle) per row with `aria-label`
- **Overlay:** `DiningPage.vue` overlays queued mutations on top of server data after refresh so UI reflects user's intended state
- **Realtime filtering:** `MainLayout.vue` skips cache invalidation for member IDs in the mutation queue (prevents server's stale state overwriting user's intent)

### 04 — Accessibility & Connection Status

- **Announcements:** `aria-live="assertive"` region announces "Connection lost. Changes will be saved locally" / "Connection restored. Syncing changes"
- **Connection badge:** White toolbar with status badge (wifi/sync/wifi_off icons), `role="status"`, `aria-live="polite"`
- **WCAG contrast fix:** Toolbar changed from blue to white to resolve colour contrast failures on status badges; staleness banner text changed from white to dark

### 05 — E2E Tests & Manual Testing

- **E2E:** 7 Playwright tests — connectivity badges, sync icon lifecycle, offline queued icon, axe-core accessibility scans (offline + queued states)
- **Manual test guide:** `documentation/manual-testing/offline-mutation-queuing.md` — 8 test cases covering reconnect → queue flush → sync flow, persistence across refresh, mid-sync disconnection (scenarios that require a real PocketBase server)

### 06 — UX Polish

- **Status button colours:** "Not Dining" changed from red to `blue-grey-6`, "Undecided" darkened to `grey-7` — both now pass WCAG AA contrast (4.5:1+) with white text
- **Status button icons:** `check_circle` (Dining), `cancel` (Not Dining), `help_outline` (Undecided) with left-aligned layout and fixed 160px width
- **Row background tinting:** Subtle status-coloured wash per row (green/blue-grey/grey at 4–6% opacity) for at-a-glance status identification
- **Active row highlight:** 2px primary outline on the row when its status menu is open, tracked via `@before-show`/`@before-hide` events
- **Touch-friendly status menu:** 48px item height, `sm` icons, `text-body1` labels — exceeds 44px minimum touch target
- **Summary chips:** Upgraded from `q-badge` to `q-chip` with `size="md"`, matching icons and colours from status buttons
- **Table density:** Removed `dense` prop for better readability across age range
- **Status column sorting:** Sortable by dining status
- **Summary chips row layout:** Chips display horizontally on all screen sizes (removed mobile stacking)
- **Responsive lodge grid:** `IndexPage.vue` uses CSS Grid (`auto-fill, minmax(340px, 1fr)`) — lodge cards tile into columns on wider screens instead of stretching full-width

### 07 — Seed Data Expansion

- Seed script (`scripts/seed.js`) expanded from 1 lodge to 4 lodges across different provinces (Metropolitan, West Yorkshire, Hampshire and Isle of Wight, East Lancashire) with 7–15 members each and realistic random dining status distribution

### Supporting Deliverables

- Development journal updated with Sprint 3 entries — planning, implementation, defects found during manual testing, E2E test pragmatism decisions, UX polish session
- ADR-009 (Code Quality Metrics) — ESLint + TypeScript strict mode as lightweight quality gates

## Sprint 4 — Interview Readiness

**Epic:** Prepare the prototype for presentation to the UGLE interview panel.

### 01 — Live Deployment

- Secretary app deployed to Vercel at `https://festive-board-manager.vercel.app/`
- PocketBase production instance on PocketHost with seeded 4-lodge dataset
- Hash-based routing — no server rewrite rules needed

### 02 — GitHub Actions CI

- `.github/workflows/ci.yml` — lint, unit tests, build, Playwright E2E on every push to `main` and all PRs
- All 14 E2E tests green after resolving: dev server timing (switched to build + http-server), missing env vars, SSE mock for CI

### 03 — Histoire Component Showcase

- Histoire configured with Quasar + Vue 3 integration (manual plugin wiring, SCSS variable injection, SSR guard)
- 2 stories (LodgeCard, DiningTable) with 7 variants showcasing component states
- Deployed to Vercel as a separate project (`festive-board-histoire`)

### 05 — Manual Test Review

- Manual test documentation split into `documentation/manual-testing/offline-queue-sync.md` and `accessibility.md`

## Sprint 5 — Test Dashboard & Quality Visibility

**Epic:** Make CI test results visible to anyone reviewing the repository, and ensure all documentation accurately reflects the current codebase.

### 01 — Surface Test Results

- **CI report script:** `.github/scripts/ci-report.mjs` — Node script generating both a GitHub Actions Job Summary (markdown) and a self-contained HTML dashboard from parsed vitest, Playwright, and ESLint JSON outputs
- **Test dashboard:** Deployed to GitHub Pages via `peaceiris/actions-gh-pages@v4` at `https://darynholmes.github.io/festive/`; updates automatically on every push to main
- **Dashboard design:** Single-column stacked layout with status cards for Build, Lint, E2E, and Unit checks; progressive disclosure via collapsible detail sections (unit test breakdowns by file, lint rule-by-rule warnings)
- **Playwright report:** Deployed alongside dashboard at `./playwright-report/`
- **README badges:** Test Results badge and dashboard link added to README

### 02 — Review Documentation

- Systematic review of architecture docs, component design, ADRs, diagrams, manual testing guides, TLDR, README, and supporting docs against the current codebase
- ADR "revisit" clauses checked — no trigger conditions met
- Stale content updated; documentation accuracy verified across all files
