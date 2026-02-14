# ADR-005: Pinia Colada for Async State (Vue Query as Fallback)

**Status:** Accepted (provisional)

**Date:** 2026-02-14

## Context

The application needs a layer to manage server state — caching PocketBase responses, handling mutations with optimistic updates, and coordinating background refetches. Raw `fetch` calls in composables would work but mean reimplementing cache invalidation, deduplication, and retry logic from scratch.

Two options exist in the Vue ecosystem:

- **Vue Query (TanStack Query for Vue)** — mature, battle-tested, large community. Port of React Query
- **Pinia Colada** — newer, built by Eduardo San Martin (Pinia creator), designed to integrate natively with Pinia stores

## Decision

**Start with Pinia Colada. Fall back to Vue Query if it falls short.**

### Why Pinia Colada first

- **Pinia-native** — queries and mutations live inside the same reactive system as our global state. No bridging two state models (Pinia for local state + a separate query cache)
- **Simpler mental model** — one state layer (Pinia) instead of two. Composables like `useDiningSync()` can combine store state and server state without adapter patterns
- **Designed for Vue** — not a port from React. API conventions match Vue's Composition API idioms
- **Active development** — maintained by the Pinia author, who understands the Vue ecosystem deeply

### Why not commit fully to Pinia Colada

- **Young library** — less production mileage than Vue Query. Edge cases around SSE subscriptions, offline queue integration, or complex cache invalidation may surface
- **Smaller community** — fewer Stack Overflow answers, blog posts, and battle-tested patterns
- **API surface may change** — pre-1.0 libraries can introduce breaking changes

### Why Vue Query is a strong fallback

- **Proven at scale** — TanStack Query powers thousands of production apps (originally in React, Vue port is stable)
- **Rich feature set** — infinite queries, prefetching, placeholder data, structural sharing. Features we may not need now but wouldn't want to reimplement later
- **Large community** — well-documented, widely understood
- **Works with Pinia** — Vue Query doesn't replace Pinia for local state; they coexist. The migration cost is limited to swapping query/mutation hooks, not restructuring stores

## Fallback trigger

Switch to Vue Query if any of these occur:
- Pinia Colada cannot handle PocketBase realtime subscription integration cleanly
- Cache invalidation for optimistic updates proves unreliable
- A blocking bug with no workaround stalls development for more than a day

## Consequences

- Two developers on the project (human + AI) need to be honest about when "making it work" becomes "fighting the library"
- If we fall back, the migration is localised to composables and service layer — components remain untouched (they only see props)
- The container/presentational pattern (see [component design](../03_component_design.md)) insulates components from whichever async state layer we use

## Realtime + Query Cache Pattern

We follow the "event-based invalidation" pattern described in [Using WebSockets with React Query](https://tkdodo.eu/blog/using-web-sockets-with-react-query) by TkDodo (TanStack Query maintainer). The pattern is framework-agnostic and applies equally to Pinia Colada.

**Principle:** keep queries as the single source of truth for server state. WebSocket/SSE events don't write data into the cache directly — they invalidate the relevant query key, which triggers a refetch only if an active consumer exists.

**Why invalidation over direct cache updates:**

- Simpler — no manual cache shaping, no handling additions vs deletions vs updates differently
- Type-safe — the query function already knows how to fetch and map the data
- Efficient — invalidation is a no-op if no component is consuming that query key

**Implementation:** `useRealtimeSync` (composable) subscribes to PocketBase SSE events in `MainLayout`. On any event, the `onEvent` callback calls `queryCache.invalidateQueries({ key })`. Pinia Colada handles the rest.

**Future consideration:** for queries covered by realtime subscriptions, set `staleTime: Infinity` to avoid redundant refetches on window refocus or component remount. PocketBase will tell us when data changes — no need for time-based staleness.

## Implementation Findings (Sprint 0)

**Date:** 2026-02-14

### What worked

- **Boot file registration** — `app.use(PiniaColada)` in a Quasar boot file integrates cleanly. No conflicts with Pinia's own boot registration.
- **`useQuery` composable pattern** — wrapping `useQuery({ key, query })` in a custom composable (`useLodgesQuery`) matches Vue Composition API conventions. The returned `{ data, error, isPending }` destructuring is intuitive.
- **Cache invalidation from realtime events** — `useQueryCache().invalidateQueries({ key: ['lodges'] })` triggers automatic refetch when PocketBase realtime events arrive. This is the core integration point and it works cleanly.

### Limitations noted

- **Reactive/parameterised keys** — for queries like `['lodge', id]` where `id` changes, you need `defineQueryOptions` or pass a function to `useQuery`. Worth noting for future parameterised queries (Sprint 1).

### Fallback triggers

None of the three fallback triggers from the Decision section have been hit:

1. Realtime subscription integration — works cleanly via `invalidateQueries`
2. Cache invalidation — not yet tested with optimistic updates (Sprint 1)
3. No blocking bugs encountered

**Status: Pinia Colada retained.** Will re-evaluate in Sprint 1 when mutations and optimistic updates are introduced.
