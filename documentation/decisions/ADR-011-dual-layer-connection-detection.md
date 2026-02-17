# ADR-011: Dual-Layer Connection Detection

**Status:** Accepted

**Date:** 2026-02-16

## Context

The offline mutation queue ([ADR-010](ADR-010-offline-queue-architecture.md)) needs a reliable signal for when connectivity recovers — `processQueue()` fires on the transition to `'connected'`. An incorrect or missed signal means the queue never flushes, or flushes while still offline (causing errors).

PocketBase provides SSE-level lifecycle events (`onDisconnect`, `PB_CONNECT`). The browser provides `online`/`offline` events. Neither is sufficient alone.

## Decision

**Use two independent detection layers driving a three-state model: `connected` → `reconnecting` → `offline`.**

### Layer 1: PocketBase SSE events (authoritative)

- `pb.realtime.onDisconnect` — fires when the SSE stream drops. Transitions to `'reconnecting'` with a 2-second debounce.
- `PB_CONNECT` subscription — fires when the SDK re-establishes the SSE stream. Transitions to `'connected'`.

**Limitation:** The SDK uses internal exponential backoff for reconnection. If the browser is offline long enough, the SDK exhausts its retry attempts and stops trying. When the network returns, `PB_CONNECT` never fires because the SDK has given up.

### Layer 2: Browser online/offline events (fallback)

- `window` `offline` event — transitions to `'reconnecting'` (then `'offline'` after debounce).
- `window` `online` event — starts a reconnect poll that checks `pb.realtime.isConnected` every 2 seconds until the SSE stream recovers, or gives up after 30 seconds.

**Why a poll instead of trusting `online` directly:** The `online` event means "the browser has *some* network connection" — not that PocketBase is reachable. The poll confirms the SSE stream is actually back before transitioning to `'connected'`.

### Three-state model

| State | Meaning | UI |
|-------|---------|---|
| `connected` | SSE stream active, API reachable | Green badge |
| `reconnecting` | Connection lost, attempting recovery | Amber badge, "Reconnecting..." |
| `offline` | Recovery failed or prolonged disconnect | Red badge, staleness warning after 5 min |

### Debounce

A 2-second delay before transitioning from `'reconnecting'` to `'offline'` absorbs transient network blips. Without this, brief Wi-Fi handoffs or mobile signal fluctuations would flash the offline badge unnecessarily.

## Alternatives Considered

- **PocketBase SSE only** — fails after prolonged offline (SDK exhausts reconnect backoff). This was the original implementation; the reconnection bug was discovered during Sprint 2 manual testing.
- **Browser events only** — too coarse. `navigator.onLine` can be `true` when the SSE stream is down (e.g. PocketBase server restart, firewall issue). Would cause premature queue flush attempts.
- **Periodic health check polling** — reliable but wasteful. Every 5-second poll to `/api/health` burns bandwidth and battery on mobile devices at lodge meetings.

## Consequences

- Two detection layers add ~60 lines of code in `useConnectionMonitor` — justified by reliability
- The composable is called once in `MainLayout`; components read `connectionStatus` from the store
- The 30-second poll deadline prevents indefinite polling if PocketBase is unreachable (e.g. server down, not just a network issue)
- Future: if PocketBase SDK improves its reconnection handling, the browser event layer could be simplified but not removed (it still provides faster initial detection)
