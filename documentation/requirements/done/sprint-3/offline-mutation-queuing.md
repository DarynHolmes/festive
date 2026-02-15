# Offline Mutation Queuing

> **Resolved in Sprint 3.** See `documentation/requirements/wip/sprint-3/01_offline-mutation-queing_local_persistence.md` and `supporting-documentation/done-features.md` (Sprint 3, sections 01–05). Conflict resolution (beyond last-write-wins) remains open — see `connectivity_resilience.md`.

## Gap (historical)

Sprint 2's "Offline Awareness" spec (01-offline-awareness.md, AC 5) requires:

> While offline, status toggles must show a "pending" or "syncing" icon on the row until the server acknowledges the change.

The current implementation shows a syncing icon for in-flight mutations, but mutations fire immediately over HTTP. When offline, the request fails, `onError` rolls back the optimistic update, and the pending icon disappears. The user sees their change snap back — the opposite of the intended behaviour.

## What's Needed

Mutations made while offline should be **queued locally** and replayed when connectivity returns. The syncing icon should persist on queued rows until the server acknowledges each change.

## Considerations

- **Queue storage:** in-memory (lost on refresh) vs IndexedDB/localStorage (survives refresh). PWA mode would favour persistent storage.
- **Conflict resolution:** if another user changes the same record while this user is offline, the queued mutation may conflict. Needs a strategy (last-write-wins, user prompt, etc.).
- **Ordering:** multiple toggles on the same row while offline should collapse to the final state, not replay each intermediate toggle.
- **Scope:** this pattern should be generic enough to reuse beyond dining status (see `connectivity_resilience.md` technical notes).

## Depends On

- Offline Awareness (sprint 2, done) — connection status detection, pending icon infrastructure
- PWA mode — for persistent offline storage and service worker caching
