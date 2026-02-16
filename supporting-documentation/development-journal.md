# Ada's Development Journal

I'm Ada (Claude Code), the implementation partner on this project. This journal records how the three of us build this prototype — what each person contributes, and the decisions that shaped the code.

> Started from Sprint 2. Earlier sprints predate this journal.

## The Team

| Role | Who | Responsibility |
|------|-----|----------------|
| Developer & UX | Daryn Holmes | Architecture, UX direction, manual testing, quality oversight |
| Product Owner | Gem (Gemini Gem) | Requirements, acceptance criteria, domain language |
| Implementation Partner | Ada (Claude Code) | Code generation, test automation, research |

## How We Work

Gem defines the requirements — user stories, acceptance criteria, edge cases — in UGLE domain language. I propose implementation plans and write code. Daryn reviews plans before I write anything, tests every feature manually, and challenges decisions from both sides. The git history shows what was built. This journal captures what led to it.

### Sprint Flow

1. **Requirements** — Daryn gets the next set of requirements from Gem and prepares them in the `documentation/requirements/wip/` folder, organised by sprint.

2. **Story review & breakdown** — Ada and Daryn review the stories together. For larger features we break them into individually testable tasks within the story folder (Sprint 3's offline queuing feature had nine task files, for example). We challenge requirements early — gaps, prerequisites, and feasibility questions get raised before code starts.

3. **Feedback to Gem** — If review surfaces a gap or a new prerequisite, we take it back to Gem. This happened in Sprint 1: Ada flagged that the dining feature needed a proper members collection, which led to `00_members_collection.md` being added as a new requirement before Sprint 1 could proceed.

4. **Build** — Once the stories are agreed, Ada implements while Daryn oversees and QAs. Daryn tests each feature manually in the browser, which consistently surfaces issues that automated tests miss (reconnection bugs, visual regressions, race conditions). Fixes are iterative — Daryn finds, Ada diagnoses and patches, Daryn re-tests.

5. **End of sprint** — When Daryn calls the sprint done, we run through a checklist: consolidate journal entries, update the done-features and implementation-context docs, review ADRs and the todo backlog, and update the README. Importantly, we update the Gem definition (`supporting-documentation/gemini-gem.md`) so that Gem has full context on what was built and can issue the next set of requirements with accurate knowledge of the current state.

6. **Gem sync** — The updated Gem definition, done-features summary, and any new ADRs or architectural context feed back into Gem. This closes the loop — Gem's next sprint requirements are grounded in what actually exists, not what was originally planned.

---

## Sprint 2: Offline Awareness & Connectivity Guardrails

**Spec:** `documentation/requirements/wip/sprint-2/01-offline-awareness.md`

### Plan Review

I proposed an 11-step plan covering connection monitoring, staleness warnings, pending mutation indicators, and E2E tests. Daryn reviewed and approved.

One thing I flagged during planning: the spec mentions "WebSocket" but PocketBase uses SSE (Server-Sent Events). Not a functional issue, but worth noting for accuracy.

### Implementation & Testing

I implemented the plan. Daryn tested each feature manually in the browser — this surfaced several issues my automated tests missed:

**Reconnection bug** — Daryn toggled Chrome DevTools offline and back. The badge stuck at "Reconnecting." I diagnosed the cause: PocketBase SDK exhausts its reconnect backoff while offline, so `PB_CONNECT` never fires when the network returns. I added a reconnect polling fallback. Daryn verified the fix and asked me to add detailed comments explaining why both detection layers exist.

**Toggle alignment regression** — Daryn spotted that dining status toggles shifted left after I added the sync icon wrapper. I traced it to a missing `justify-center` class.

**PocketBase auto-cancellation race** — Daryn captured a `ClientResponseError` when toggling dining status. I identified PocketBase's request auto-cancellation as the cause and added `requestKey: null` as a workaround. (Later removed — see below.)

**Button jump on toggle** — Daryn reported buttons flickering and shifting on toggle. I traced it to the sync icon using `v-if`, which added/removed DOM elements inside a centred flex container. Switched to `visibility: hidden` to reserve space.

### Architectural Decisions

**Removing redundant invalidation** — Daryn questioned why we had both `invalidateQueries` in `onSuccess` and realtime event invalidation. Good question — they were racing each other. I replaced the broad `invalidateQueries` with a targeted cache patch, which fixed the root cause.

**Removing `requestKey: null`** — After the root cause was fixed, Daryn asked whether the workaround was still needed. The only remaining scenario was two simultaneous realtime events — theoretical. We removed it, applying the project's own YAGNI principle.

**E2E test hygiene** — Daryn checked whether our E2E tests respected ADR-008. I audited them and found duplicated mock setup across spec files and a CSS selector where a semantic locator should be. Daryn directed the cleanup and had me add a YAGNI clause to the ADR.

**Offline mutation queuing** — Daryn asked whether the spec covered offline mutation behaviour. It didn't — mutations fail and roll back when offline. Daryn directed me to document the gap in `documentation/requirements/todo/` rather than build it speculatively.

### Pre-existing Issues Discovered

Sprint 2 work uncovered two issues that predated the sprint:

- `QBtnToggle` renders `button` roles, not `radio` — my E2E tests were using the wrong role selector
- Quasar's `bg-positive` green (#21ba45) with white text fails WCAG AA contrast (2.56:1) — switched to `outline` variant with darker colours

---

## Sprint 3: Offline Mutation Queuing & Local Persistence

**Spec:** `documentation/requirements/wip/sprint-3/01_offline-mutation-queing_local_persistence.md`

### Planning

Gem wrote a detailed spec with edge cases (session expiry while offline, app closure with pending queue, conflict with realtime events). I explored the codebase across three parallel threads — offline/connectivity code, dining mutation flow, and project patterns/dependencies — then designed a plan. Daryn reviewed and requested the plan be broken into individually testable task files with verification steps. Nine task files created in `documentation/requirements/wip/sprint-3/tasks/`.

Key architectural decision during planning: where to put the queue state. I initially considered a composable with module-scoped refs, then provide/inject from MainLayout. Settled on a Pinia store (`useMutationQueueStore`) — it's the established pattern for global reactive state and avoids ceremony. Three-layer separation: IndexedDB service (pure I/O), Pinia store (reactive bridge), composable (orchestration).

### Implementation

**Task 1 — Dependencies:** Added `idb` (thin IndexedDB wrapper, ~1.2KB) and `fake-indexeddb` (test polyfill). Enabled Quasar's Notify plugin.

**Task 2 — IndexedDB service:** Built `mutation-queue.ts` with enqueue (with collapse), getAll, remove, getQueuedMemberIds, and clear. The collapse logic uses an IndexedDB index on `memberId` — if the same member is toggled three times offline, only the final state is kept. Clean to implement; `idb` wraps the verbose IndexedDB API well.

Unit tests initially timed out — `indexedDB.deleteDatabase()` blocked because the singleton connection was still open. Fixed by using `clearQueue()` in `beforeEach` instead, which is a legitimate production function. Daryn spotted the test helper (`_resetDbForTesting`) mixed into production code — removed it.

**Task 3 — Pinia store:** Thin reactive layer exposing `queuedMemberIds`, `syncingMemberIds`, and `queuedMutations`. Follows the `useLodgeStore` pattern exactly.

Daryn raised a good edge case during review: what happens if connection drops mid-sync, after a mutation moves from "queued" to "syncing" but before the API call completes? Answer: the mutation stays in IndexedDB (only removed on success), and `refreshQueuedIds()` in the outer `finally` re-syncs the store. Documented in task 4.

**Task 4 — Queue orchestration composable:** Built `useMutationQueue` with `processQueue`, `syncOne`, `retryWithBackoff`, and `replayMutation`. ESLint flagged `max-depth` (4 levels) in `processQueue` — extracted `syncOne` to handle per-mutation sync with its own try/catch/finally, keeping the main loop clean.

**Tasks 5–8 — Wiring the UI:** Offline interception in `useDiningMutation`, three-state icon in `DiningTable`, overlay in `DiningPage`, and MainLayout integration (queue init, realtime filtering, a11y announcements). These were straightforward to implement but Daryn's manual testing surfaced three defects:

**Defect 1 — Stale cache after sync:** After queue flushed, the toggle reverted to the old server state before settling on the correct value. Root cause: realtime events for queued members were correctly filtered during sync (to prevent the server's stale state from overwriting the user's intent), but no subsequent cache invalidation was triggered. Fix: explicit `queryCache.invalidateQueries` after `refreshStore()` in `processQueue`'s finally block.

**Defect 2 — Icon priority order:** Clock icon persisted during sync instead of switching to spinner. Root cause: the `v-if` chain checked `queuedMemberIds` before `syncingMemberIds`, and since `queuedMemberIds` wasn't cleared until `refreshStore()` at the end, it always won. Fix: reversed the check order — syncing first, queued second. Also added `removeQueued()` to the store, called immediately after each successful sync, so the clock doesn't reappear between sequential syncs.

**Defect 3 — Mid-sync offline error:** Going offline mid-sync triggered the error banner ("Failed to load dining data"). Root cause: the `queryCache.invalidateQueries` in the finally block ran unconditionally, triggering a refetch while offline. Fix: guard with `lodgeStore.connectionStatus === 'connected'`.

### E2E Tests & Their Limits

Wrote E2E tests for the offline queuing feature. Seven tests pass reliably — connectivity badges, sync icon during in-flight mutation, clock icon appearing when offline, and axe-core accessibility scans in both offline and queued states.

The full reconnect → queue-flush → sync flow proved unreliable in E2E. Root cause: `useConnectionMonitor` polls `pb.realtime.isConnected` to determine when the app has truly reconnected, but there's no PocketBase server in E2E tests (only mocked API routes). The PB SDK's SSE reconnection is non-deterministic without a server, so the status sometimes never transitions back to `'connected'`, and `processQueue` never fires. The test passed ~80% of the time — not acceptable. Tried several approaches (combined route handlers, increased timeouts, route priority fixes) but the fundamental issue is architectural: the reconnect signal depends on infrastructure we don't mock.

Pragmatic decision: dropped the flaky reconnect-sync test and wrote a manual test guide instead (`documentation/manual-testing/offline-mutation-queuing.md`) with 8 test cases covering the gaps. This is honest about what automation can and can't verify without a real backend.

### Code Review & Polish

After all tasks were complete, Daryn asked for a code review of the feature. Assessment: the three-layer architecture is sound and doesn't need structural refactoring. The function decomposition in `useMutationQueue.ts` (`syncOne`, `replayMutation`, `retryWithBackoff`) is already clean after the bug-fix extractions.

What I added: targeted comments explaining the *why* behind non-obvious ordering decisions — particularly the three constraints learned from defects (removeQueued before removeSyncing, per-mutation cache patching, guarded invalidation). Also added a lifecycle overview in the store's JSDoc.

One bonus find during the E2E work: the staleness banner (`bg-warning text-white`) had a contrast ratio of 1.69:1 — axe-core caught it. Changed to `text-dark` to meet WCAG AA (4.5:1). This was a Sprint 2 issue that slipped through because the banner only appears after 5 minutes offline.

### Observations on Codebase Maintainability

The five defects in this sprint all stemmed from the same root cause: reactive state transitions during sequential async processing. Each mutation passes through three states (queued → syncing → done), and the UI reads from multiple reactive sources simultaneously (store sets, query cache, computed overlays). When one source updated before another, the UI briefly showed incorrect state.

The code is now well-commented about *why* the ordering matters, which should help future developers. But the underlying complexity is real — this is the kind of feature where a change to the sync flow (e.g. parallel processing, batched API calls) would need careful thought about the icon/overlay lifecycle. The sequential approach keeps things simple at the cost of being slower for large queues.

### UX Polish

After the core feature was complete, Daryn reviewed the dining page visually and directed a series of UX improvements. Two changes in particular were Daryn's initiative:

**Interaction pattern overhaul** — Daryn replaced the `QBtnToggle` (three buttons always visible per row) with a single status button that opens a context menu on click. This significantly decluttered the table — each row now shows one button reflecting the current status, and the full option set only appears when the user interacts. Cleaner, calmer, and better suited to the elderly-friendly design goal.

**Colour philosophy** — Daryn reworked the status colours to be calm and non-judgmental. The original palette used red for "Not Dining," which implied something was wrong with choosing not to dine. Daryn chose blue-grey instead — a neutral tone that respects the member's choice. "Undecided" got a similarly neutral grey. The overall effect is a UI that informs without pressuring, which is exactly right for a Lodge Secretary tool where the goal is accurate data, not persuasion.

**Other changes (collaborative — Daryn identified issues, I proposed options, Daryn chose):**

- **Status column alignment** — header and buttons were misaligned. Fixed by setting column `align: 'center'` and removing a redundant header slot override.
- **WCAG contrast** — darkened both "Not Dining" (`blue-grey-6`) and "Undecided" (`grey-7`) to meet WCAG AA contrast (4.5:1+) with white text — the original lighter shades failed.
- **Status button icons** — added `check_circle`, `cancel`, `help_outline` icons to the buttons with `justify-content: flex-start` to left-align icons consistently across rows. All buttons set to fixed width (160px) for visual uniformity.
- **Row background tinting** — subtle status-coloured wash on each row (6% opacity green/blue-grey, 4% grey) for at-a-glance status identification without reading the button text.
- **Active row highlight** — 2px primary outline on the row when its status menu is open, so the user always knows which member they're changing. Uses `@before-show`/`@before-hide` events on the menu to track active state.
- **Touch-friendly status menu** — removed `dense` from the menu list, increased item height to 48px (exceeds 44px minimum), bumped icon to `sm` and text to `text-body1`.
- **Summary chips** — replaced `q-badge` with `q-chip` components using `size="md"` and matching icons/colours from the status buttons.
- **Table density** — removed `dense` prop from `q-table` for larger row height and better readability.
- **Status column sorting** — added `sortable: true` to the status column.

The DiningTable component went through several iterations but the final result is clean — the custom `#body` slot handles row tinting and status cell rendering, while the `statusConfig` record centralises all colour/icon/label mappings. Easy to modify if the status set changes.

One failed attempt: tried to increase the base font size to 16px (from Quasar's default 14px) via both `$typography-font-size` in Quasar variables and a `:deep(.q-table)` override — neither worked. Deferred for now; the removed `dense` mode already improved readability.

### Final Polish

**Responsive lodge grid** — Daryn noticed lodge cards stretched full-width on wider monitors. Added CSS Grid with `auto-fill` and `minmax(340px, 1fr)` to `IndexPage.vue` — cards now tile into 2–3 columns on desktop and stack on mobile. Removed `q-mb-md` from `LodgeCard` since grid gap handles spacing. Simple change, good visual improvement.

**Summary chips layout** — Daryn asked to keep the dining/not-dining/undecided chips on one row on mobile. Removed the `flex-direction: column` mobile override; `flex-wrap: wrap` handles edge cases if the screen is very narrow.

**Seed data expansion** — Expanded `scripts/seed.js` from 1 lodge to 4 lodges (Lodge of Harmony, Fortitude, Prudence, Cornerstone) across different provinces with 7–15 members each. Dining statuses now assigned with a realistic random distribution (~65% dining, ~20% not dining, ~15% undecided). Useful for testing the dashboard with multiple lodges and varied data volumes.

---

## Sprint 4: Interview Readiness

**Spec:** `documentation/requirements/wip/sprint-4/00_epic.md`

### Story 01 — Live Deployment

Deployed the Secretary app to Vercel at `https://festive-board-manager.vercel.app/`. Straightforward configuration:

- **Root directory:** `clients/secretary-app`, **build command:** `npx quasar build`, **output:** `dist/spa`
- **Environment:** `VITE_POCKETBASE_URL` pointed at the PocketHost production instance
- Hash-based routing worked out of the box — no Vercel rewrite rules needed

Before deploying, Daryn created the production PocketBase instance on PocketHost and applied the migrations. Seeded production with the 4-lodge dataset using the existing seed script pointed at the production URL.

**Git history reset** — Daryn decided to flatten the git history to a single commit before making the repo visible to the interview panel. Used an orphan branch to create a clean `main` with no development history.

**Smoke test passed:** Lodge dashboard loads, dining toggles work, realtime sync works across tabs, offline queue behaviour verified. One observation: the sync success toast fires on all open tabs (via realtime event propagation) — expected behaviour, just not previously noticed with single-tab testing.

### Story 02 — GitHub Actions CI

Created `.github/workflows/ci.yml` — lint, unit tests, build, Playwright E2E on every push to `main` and all PRs. Took four CI runs to get green. The debugging was instructive:

1. **Run 1–2:** All 14 E2E tests timed out. Initially suspected pnpm 10's `onlyBuiltDependencies` blocking esbuild — a red herring. The real issue: Vite's dev server returns HTTP 200 (HTML shell) before JS bundles compile. On CI hardware, Playwright thought the server was ready but Vue never mounted. **Fix:** Build first, serve static files with `http-server`.

2. **Run 3:** Still blank pages. Daryn installed the `gh` CLI (via Homebrew) and authenticated it so I could use it for CI debugging — checking workflow run logs and statuses directly from the terminal rather than asking Daryn to relay information from the GitHub UI. Practical time-saver Downloaded the Playwright trace artifact and inspected the screenshot — completely white. The network trace showed all assets loading with 200, but a console error revealed the cause: `VITE_POCKETBASE_URL is not defined`. The `.env.*` files are gitignored, so CI had no environment variables at all. Daryn flagged this possibility early — I should have listened. **Fix:** Set `VITE_POCKETBASE_URL` on the Build step.

3. **Run 4:** 10/14 passed. The remaining 4 failures: the connection badge showed "Offline" because there's no PocketBase server in CI, so the SSE subscription failed. **Fix:** Mocked the PocketBase realtime SSE endpoint in test setup (`mockRealtimeConnection`), with `page.unroute()` before `context.setOffline()` so the connection monitor correctly detects the drop.

Key lesson: trace artifacts are invaluable for CI debugging — the screenshot and console error in the trace pinpointed the env var issue instantly.



### Story 03 — Histoire Component Showcase

Set up Histoire for the Quasar + Vue 3 project. The install itself was straightforward (`histoire` + `@histoire/plugin-vue`), but integrating with Quasar required manual plumbing that Quasar's own CLI normally handles:

- **Vue plugin:** Histoire runs its own Vite instance, separate from Quasar's `@quasar/app-vite` pipeline. Had to add `@vitejs/plugin-vue` explicitly — Quasar bundles it internally but doesn't expose it for external tools.
- **SCSS variables:** Quasar auto-injects `$primary`, `$secondary` etc. into every SCSS file. Histoire doesn't get this. Configured `css.preprocessorOptions.scss` with `additionalData` and `loadPaths` to inject `quasar.variables.scss`.
- **SSR guard:** Histoire's story collection runs server-side (Node). Quasar's client-side install crashes in that context — guarded with `import.meta.env.SSR`.
- **Quasar as Vue plugin:** Used `app.use(Quasar, { config: {}, plugins: { Notify } })` in the setup file to register components and plugins manually.

Created stories for `LodgeCard` (3 variants: default, with meeting location, with actions slot) and `DiningTable` (4 variants: loading, empty, mixed statuses, sync badges). Mock data uses realistic UGLE names and ranks.

**Vercel deployment** — Deployed Histoire to Vercel as a second project (`festive-board-histoire`). Build succeeded on first attempt but served 404s. The Production Overrides showed the output directory was set to `clients/secretary-app` instead of `.histoire/dist`. After correcting the settings (root: `clients/secretary-app`, build: `pnpm story:build`, output: `.histoire/dist`) and redeploying, the component showcase went live.
