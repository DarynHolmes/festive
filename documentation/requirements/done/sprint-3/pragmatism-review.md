# Pragmatism Review

Does the project demonstrate pragmatic engineering rather than over-engineering?

## Evidence of Pragmatism

**Architecture choices show restraint:**

- Repository-light pattern decouples PocketBase without going full DDD
- Container/presentational split without a component library abstraction layer
- Pinia Colada for async state instead of building a custom caching layer
- Single layout, flat routes — no premature route nesting or guard infrastructure

**Testing is selective, not exhaustive:**

- Co-located unit tests only where there's logic worth testing (mappers, time formatting) — not blanket coverage
- E2E tests cover real user flows, not implementation details
- ADR-008 explicitly chose functions over POM, with a documented revisit threshold
- Helpers extracted when duplication appeared, not before

**Decisions are driven by real problems:**

- Mutation `onSuccess` originally used `invalidateQueries` (broad refetch) which raced with realtime event invalidations. Fixed with `requestKey: null` as a workaround, then removed both when we replaced the invalidation with a targeted cache patch — fixing the root cause rather than leaving a workaround in place
- Reconnect polling came from a real bug during manual testing, not speculative resilience
- Offline mutation queuing was flagged as a future requirement rather than built speculatively

## Watch Point

The `useConnectionMonitor` composable is the most complex piece — two detection layers, debouncing, polling. It's justified (each layer covers a real gap the other misses), but it's the one place where an interviewer might ask "was all this necessary?" The detailed JSDoc explaining *why* both layers exist is important there.
