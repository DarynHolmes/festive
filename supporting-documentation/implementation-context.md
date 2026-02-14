# Implementation Context

Current state of the codebase for alignment with requirements. Updated as sprints complete.

**Last updated:** Sprint 1 (Real-time Attendance Toggling) complete.

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
| `useDiningMutation(lodgeId)` | Toggles dining status with optimistic updates and rollback | — |
| `useRealtimeSync()` | Subscribes to a PocketBase collection's realtime events; invalidates query cache on change | — |

## Realtime Subscriptions (MainLayout)

- `lodges` → invalidates `['lodges']` cache
- `dining_records` → invalidates `['dining_records']` and `['dining-dashboard']` caches

## Store

```ts
// src/stores/lodge-store.ts — useLodgeStore
currentLodge: Lodge | null
isRealtimeConnected: boolean
hasLodge: computed
lodgeName: computed
```

## Component Inventory

| Component | Type | Props / Notes |
|---|---|---|
| `MainLayout.vue` | Layout | Realtime subscriptions, Live/Offline badge |
| `IndexPage.vue` | Container (page) | Uses `useLodgesQuery`, links to dining page |
| `DiningPage.vue` | Container (page) | Uses `useDiningDashboardQuery` + `useDiningMutation`, shows count summary |
| `DiningTable.vue` | Presentational | `rows: DiningTableRow[]`, `loading?`, emits `toggle-status` |
| `LodgeCard.vue` | Presentational | `name`, `province`, `meetingLocation?`, actions slot |
| `ErrorNotFound.vue` | Page | — |

## Mappers (pure functions)

| Function | Purpose |
|---|---|
| `toLodge(record)` | LodgeRecord → Lodge |
| `toMember(record)` | MemberRecord → Member |
| `toDiningEntry(record)` | DiningRecord → DiningEntry |
| `mergeMembersWithDining(members, dining)` | Merges members + dining entries into `DiningTableRow[]`, excludes resigned members |

## Patterns Established

- **Container/presentational:** Pages fetch data, components receive props
- **Mapper layer:** Pure functions decouple PocketBase records from domain types
- **Async state:** pinia-colada `useQuery` in composables, destructure `{ data, error, isPending }`
- **Mutations:** pinia-colada `useMutation` with optimistic updates (`onMutate` → `onSuccess` → `onError` rollback)
- **Realtime:** Event-based cache invalidation (not direct data writes)
- **Loading UI:** `q-skeleton` for layout-preserving loading; `q-spinner-dots` for simple loading
- **Error UI:** `q-banner type="negative"` with `role="alert"`
- **Validation:** Zod at system boundary for outbound payloads

## Seed Data

Script at `scripts/seed.js` — creates 1 lodge, 10 members, 9 dining records. Run with `node scripts/seed.js` (requires PocketBase running with open create rules).
