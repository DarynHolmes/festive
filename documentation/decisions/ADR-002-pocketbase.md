# ADR-002: PocketBase as Backend

**Status:** Accepted
**Date:** 2026-02-14

## Context

The production stack at UGLE uses Laravel. This prototype needs a backend that:
- Provides authentication with role-based access (Lodge Secretary, Member)
- Supports real-time data sync via WebSockets
- Offers a REST API for CRUD operations
- Can be stood up quickly without backend development overhead
- Runs locally for development and in CI for testing

Alternatives considered: Firebase, Supabase, mock API (json-server), custom Express.

## Decision

**PocketBase v0.36, hosted on PocketHost for staging/production, running locally for development.**

### Why PocketBase

- **Single binary** — no Docker, no database setup. Download, run, done. Lowers the barrier for reviewers to run the prototype
- **Built-in realtime** — SSE-based subscriptions out of the box, directly maps to the WebSocket requirement in the overview
- **Auth + RBAC** — built-in authentication with collection-level rules. Lodge Secretary and Member roles map cleanly to PocketBase's auth model
- **REST + SDK** — JavaScript SDK with TypeScript support; API structure is predictable and well-documented
- **PocketHost hosting** — managed hosting available, no infrastructure to maintain for staging/CI

### Why not the alternatives

- **Firebase** — overkill for a prototype
- **Supabase** — strong option but heavier setup
- **Mock API** — doesn't demonstrate real data sync, auth flows, or conflict scenarios
- **Custom Express** — building a backend isn't the point; the prototype should demonstrate front-end capability

### Relationship to Laravel

PocketBase plays the role Laravel would in production. The front-end is built with a repository-light pattern that decouples PocketBase data structures from the Vue application. Swapping PocketBase for a Laravel API would require changes only in the service/repository layer, not in components or stores.

## Consequences

- PocketBase is not Laravel — schema differences, query patterns, and auth flows won't translate 1:1
- The repository-light pattern adds a thin abstraction layer, but keeps the prototype honest about decoupling
- PocketBase v0.36 is pre-1.0; API changes between versions are possible (pinned version mitigates this)
