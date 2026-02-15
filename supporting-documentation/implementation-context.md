# Implementation Context

Current state of the codebase for alignment with requirements. Updated as sprints complete.

**Last updated:** Sprint 3 (Offline Mutation Queuing & Local Persistence) complete.

## PocketBase Collections

### `lodges` (id: `pbc_3403674053`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | text (auto, 15 chars) | yes | Primary key |
| `name` | text | yes | |
| `province` | text | yes | |
| `meeting_location` | text | no | |
| `created` | autodate | — | Set on create |
| `updated` | autodate | — | Set on create + update |

**Rules:** `listRule: ""` (public read), all others `null` (admin only).

### `members` (id: `pbc_3572739349`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | text (auto, 15 chars) | yes | Primary key |
| `lodge_id` | relation → `lodges` | yes | Single select, no cascade delete |
| `first_name` | text | yes | |
| `last_name` | text | yes | |
| `rank` | select | yes | Values: `Bro`, `W Bro`, `VW Bro`, `RW Bro` |
| `status` | select | yes | Values: `active`, `honorary`, `resigned` |
| `created` | autodate | — | Set on create |
| `updated` | autodate | — | Set on create + update |

**Rules:** `listRule: ""` (authenticated read), all others `null` (admin only).

### `dining_records` (id: `pbc_2053535107`)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | text (auto, 15 chars) | yes | Primary key |
| `lodge_id` | relation → `lodges` | yes | Single select, no cascade delete |
| `member_id` | relation → `members` | yes | Single select, no cascade delete |
| `meeting_date` | date | yes | |
| `status` | select | yes | Values: `dining`, `not_dining`, `undecided` |
| `updated_by` | text | no | |
| `created` | autodate | — | Set on create |
| `updated` | autodate | — | Set on create + update |

**Rules:** `listRule`, `viewRule`, `updateRule`, `createRule` set to `""` (open for dining dashboard). No indexes defined yet.

## TypeScript Types

### PocketBase record shapes (what the API returns)

```ts
// src/services/types.ts
interface LodgeRecord extends RecordModel { name, province, meeting_location }
interface MemberRecord extends RecordModel { lodge_id, first_name, last_name, rank, status }
interface DiningRecord extends RecordModel { lodge_id, member_id, meeting_date, status, updated_by }
```

### Domain types (what the app consumes)

```ts
// src/services/types.ts
type DiningStatus = 'dining' | 'not_dining' | 'undecided'
interface Lodge { id, name, province, meetingLocation }
interface Member { id, lodgeId, firstName, lastName, rank, status }
interface DiningEntry { id, lodgeId, memberId, meetingDate, status, updatedBy }
interface DiningTableRow { memberId, diningRecordId, rank, firstName, lastName, status }
```

### Validation schema (outbound payloads)

```ts
// src/schemas/member-entry.ts
const diningStatus = z.enum(['dining', 'not_dining', 'undecided']);
const memberEntrySchema = z.object({ memberId: z.string().min(1), status: diningStatus });
type MemberEntry = z.infer<typeof memberEntrySchema>;
```

## Routing

```ts
// src/router/routes.ts (hash-based history mode)
'/'                       → MainLayout > IndexPage (Lodge Dashboard)
'/dining/:lodgeId'        → MainLayout > DiningPage (named: 'dining')
'/:catchAll(.*)*'         → ErrorNotFound (404)
```

## Composables

| Composable | Purpose | Query key |
|---|---|---|
| `useLodgesQuery()` | Fetches all lodges via pinia-colada `useQuery` | `['lodges']` |
| `useDiningDashboardQuery(lodgeId)` | Fetches members + dining records, merges into `DiningTableRow[]` | `['dining-dashboard', lodgeId]` |
| `useDiningMutation(lodgeId)` | Toggles dining status with optimistic updates, rollback, targeted cache patch on success; exposes `pendingMemberIds`; **offline interception** — enqueues to IndexedDB when offline and returns synthetic success | — |
| `useRealtimeSync()` | Subscribes to a PocketBase collection's realtime events; invalidates query cache on change; updates `lastSyncedAt` on each event | — |
| `useConnectionMonitor()` | Dual-layer connection detection (PocketBase SSE lifecycle + browser online/offline events); manages tri-state `connectionStatus` with 2s disconnect debounce and reconnect polling fallback | — |
| `useMutationQueue()` | Called once from MainLayout. On mount: reads IndexedDB, populates store. On reconnect: processes queue sequentially with exponential backoff retry (1s → 2s → 4s). Shows toast on completion. | — |

## Realtime Subscriptions (MainLayout)

- `lodges` → invalidates `['lodges']` cache
- `dining_records` → invalidates `['dining_records']` and `['dining-dashboard']` caches; **skips invalidation** for member IDs in the mutation queue (prevents server's stale state overwriting user's intent)

## Stores

```ts
// src/stores/lodge-store.ts — useLodgeStore
currentLodge: Lodge | null
connectionStatus: 'connected' | 'reconnecting' | 'offline'
lastSyncedAt: Date | null
isRealtimeConnected: computed (connectionStatus === 'connected') // backward compat
hasLodge: computed
lodgeName: computed
```

```ts
// src/stores/mutation-queue-store.ts — useMutationQueueStore
queuedMemberIds: Set<string>        // members with queued offline mutations
syncingMemberIds: Set<string>       // members currently being synced
queuedMutations: QueuedMutation[]   // full array for overlay on server data
// Methods: setQueuedState, addSyncing, removeSyncing, removeQueued, refreshStore, clear
```

## Component Inventory

| Component | Type | Props / Notes |
|---|---|---|
| `MainLayout.vue` | Layout | Realtime subscriptions, connection monitor, mutation queue init, realtime event filtering for queued members, white toolbar with tri-state connectivity badge (wifi/sync/wifi_off icons), `aria-live="assertive"` announcements, staleness `QBanner` after 5 min offline |
| `IndexPage.vue` | Container (page) | Uses `useLodgesQuery`, links to dining page; responsive CSS Grid layout (`auto-fill, minmax(340px, 1fr)`) |
| `DiningPage.vue` | Container (page) | Uses `useDiningDashboardQuery` + `useDiningMutation` + `useMutationQueueStore`, overlays queued mutations on server data, count summary with `q-chip` (size md, matching status icons/colours), "Last updated: X ago" caption (60s refresh) |
| `DiningTable.vue` | Presentational | `rows`, `loading?`, `pendingMemberIds`, `queuedMemberIds`, `syncingMemberIds`, emits `toggle-status`; custom `#body` slot for row tinting (status-coloured background wash) and active row highlight (primary outline when menu open); status buttons with icons (`check_circle`/`cancel`/`help_outline`), fixed 160px width, left-aligned content; touch-friendly status menu (48px items); sortable columns (rank, name, status); three-state per-row sync icon (schedule=queued, sync=syncing, spacer=idle) |
| `LodgeCard.vue` | Presentational | `name`, `province`, `meetingLocation?`, actions slot |
| `ErrorNotFound.vue` | Page | — |

## Mappers (pure functions)

| Function | Purpose |
|---|---|
| `toLodge(record)` | LodgeRecord → Lodge |
| `toMember(record)` | MemberRecord → Member |
| `toDiningEntry(record)` | DiningRecord → DiningEntry |
| `mergeMembersWithDining(members, dining)` | Merges members + dining entries into `DiningTableRow[]`, excludes resigned members |

## Services

| Module | Location | Purpose |
|---|---|---|
| Mutation queue | `src/services/mutation-queue.ts` | IndexedDB persistence via `idb`. Functions: `enqueueMutation` (collapse by memberId), `getAllMutations`, `removeMutation`, `getQueuedMemberIds`, `clearQueue`. Co-located unit tests. |

## Utilities

| Function | Location | Purpose |
|---|---|---|
| `formatTimeAgo(date)` | `src/utils/time.ts` | Pure function returning "just now", "2 minutes ago", etc. Co-located unit tests. |

## Patterns Established

- **Container/presentational:** Pages fetch data, components receive props
- **Mapper layer:** Pure functions decouple PocketBase records from domain types
- **Async state:** pinia-colada `useQuery` in composables, destructure `{ data, error, isPending }`
- **Mutations:** pinia-colada `useMutation` with optimistic updates (`onMutate` → targeted cache patch in `onSuccess` → `onError` rollback → `onSettled` cleanup); `pendingMemberIds` tracked for per-row sync indicators; offline interception enqueues to IndexedDB
- **Offline queue:** Three-layer architecture — IndexedDB service (pure I/O), Pinia store (reactive bridge), composable (orchestration). Collapse by memberId. Sequential replay on reconnect with exponential backoff. Toast on completion.
- **Realtime:** Event-based cache invalidation (not direct data writes); `onSuccess` uses targeted `setQueryData` instead of `invalidateQueries` to avoid racing with realtime events; events for queued member IDs are filtered out during sync
- **Connection monitoring:** Dual-layer detection — PocketBase SSE lifecycle (`onDisconnect`, `PB_CONNECT`) for server health + browser `online`/`offline` for network layer; 2s disconnect debounce; reconnect polling fallback
- **Loading UI:** `q-skeleton` for layout-preserving loading; `q-spinner-dots` for simple loading
- **Error UI:** `q-banner type="negative"` with `role="alert"`
- **Staleness UI:** `q-banner` with `cloud_off` icon after 5 min offline, `role="alert"`
- **Validation:** Zod at system boundary for outbound payloads

## E2E Helpers

| Helper | Location | Purpose |
|---|---|---|
| `mockLodgeRoutes(page)` | `e2e/helpers/mock-routes.ts` | Mocks lodges API endpoint |
| `mockDiningRoutes(page)` | `e2e/helpers/mock-routes.ts` | Mocks members + dining_records API endpoints |
| Mock data constants | `e2e/helpers/mock-data.ts` | `MOCK_LODGES_RESPONSE`, `MOCK_MEMBERS_RESPONSE`, `MOCK_DINING_RESPONSE` |

## Seed Data

Script at `scripts/seed.js` — creates 4 lodges (Harmony, Fortitude, Prudence, Cornerstone) across different provinces, with 7–15 members each and realistic random dining status distribution. Run with `node scripts/seed.js` (requires PocketBase running with open create/delete rules). Clear existing data before re-running to avoid duplicates.
