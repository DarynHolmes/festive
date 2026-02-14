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
