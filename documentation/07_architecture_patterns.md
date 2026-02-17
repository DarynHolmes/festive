# Architecture Patterns

A quick-reference catalogue of the patterns used in the Secretary SPA. Each entry explains **what** the pattern does, **why** it was chosen, and **where** to find it.

For deeper coverage see [Architecture](02_architecture.md) and [Component Design](03_component_design.md).

---

## Data Layer

| Pattern | What / Why | Key Files |
|---------|-----------|-----------|
| **Repository-light** | Encapsulates PocketBase calls, returns domain types. Components never see raw records or the PB SDK. | `dining-repository.ts`, `lodge-repository.ts` |
| **Type stratification with mappers** | Two type families — `*Record` (mirrors backend schema) and domain types (what components consume) — bridged by pure mapper functions. Backend schema changes stay in the service layer. | `services/types.ts`, `mappers.ts`, `mappers.test.ts` |
| **Zod schema validation** | Validates outbound payloads at the API boundary before they leave the client. Types derived from schemas via `z.infer`. | `schemas/member-entry.ts` |

## Async State

| Pattern | What / Why | Key Files |
|---------|-----------|-----------|
| **Query composables** | Wraps Pinia Colada's `useQuery` in domain-specific `use*Query` functions. Returns `{ data, error, isPending }`. Caching, deduplication, and staleness handled automatically. [ADR-005](decisions/ADR-005-async-state.md) | `useDiningDashboardQuery.ts`, `useLodgesQuery.ts` |
| **Mutation composables with optimistic updates** | `useMutation` with four lifecycle hooks: `onMutate` (cache update + rollback context), `onSuccess` (patch with server response), `onError` (rollback), `onSettled` (cleanup). UI updates instantly; errors revert silently. | `useDiningMutation.ts` |
| **Event-based cache invalidation** | Realtime SSE events invalidate queries rather than updating cache directly — simpler, type-safe, no manual cache shaping. Locally-queued mutations are filtered out to prevent conflicts. | `useRealtimeSync.ts`, `MainLayout.vue` |

## Offline Resilience

| Pattern | What / Why | Key Files |
|---------|-----------|-----------|
| **Three-layer offline queue** | Service (IndexedDB I/O) → Store (reactive projection) → Composable (orchestration). Each layer is independently testable. [ADR-010](decisions/ADR-010-offline-queue-architecture.md) | `mutation-queue.ts`, `mutation-queue-store.ts`, `useMutationQueue.ts` |
| **Mutation collapse** | Repeated toggles for the same member while offline keep only the final state. Uses an IndexedDB index on `memberId` to replace in a single transaction. | `mutation-queue.ts` |

## UI & Rendering

| Pattern | What / Why | Key Files |
|---------|-----------|-----------|
| **Container / presentational** | Pages fetch data and orchestrate; components receive props and emit events. No store or service access in components. See [Component Design](03_component_design.md). | `DiningPage.vue` (container), `DiningTable.vue` (presentational) |
| **Accessible loading / error states** | `q-skeleton` with `role="status"` for loading; `q-banner` with `role="alert"` for errors; `aria-live="polite"` for dynamic content updates. | All pages |

## Testing

| Pattern | What / Why | Key Files |
|---------|-----------|-----------|
| **Fixture extensions** | `test.extend<T>()` injects cross-cutting concerns (axe-core accessibility audits) without class hierarchies. [ADR-008](decisions/ADR-008-page-object-model.md) | `e2e/fixtures.ts` |
| **Domain helper functions** | Lightweight functions for route mocking and test data — preferred over Page Object Model for the current surface area. [ADR-008](decisions/ADR-008-page-object-model.md) | `e2e/helpers/mock-routes.ts`, `e2e/helpers/mock-data.ts` |
