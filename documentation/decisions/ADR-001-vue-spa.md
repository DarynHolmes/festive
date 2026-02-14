# ADR-001: Vue 3 SPA with Composition API

**Status:** Accepted
**Date:** 2026-02-14

## Context

The UGLE job spec requires Vue and TypeScript. Two framework-level decisions needed resolving:

1. **Composition API vs Options API** — Vue 3 supports both
2. **SPA (Vite) vs SSR (Nuxt)** — fundamentally different architectures

The application is a real-time admin dashboard with WebSocket subscriptions, offline support, and no public-facing content requiring SEO.

## Decision

**Vue 3 Composition API as a single-page application, built with Vite. No Nuxt.**

### Why Composition API

- Better TypeScript inference — composables return typed values without `this` ambiguity
- Composable functions (`use*`) enable logic reuse across components without mixins
- Aligns with Vue ecosystem direction; Options API is maintained but not where investment is going
- Cleaner separation: a `useDiningSync()` composable can encapsulate PocketBase subscription + Pinia state + offline queue without polluting component options

### Why SPA over Nuxt/SSR

- **No SEO requirement** — this is an authenticated admin tool, not a content site
- **Realtime-first** — WebSocket subscriptions and service workers are simpler without SSR hydration concerns
- **Quasar conflict** — Quasar has its own CLI/build system optimised for Vite SPAs; layering Nuxt adds integration tax for zero benefit
- **Offline PWA** — service worker caching strategy is cleaner in a pure SPA; Nuxt's hybrid rendering model complicates the offline story

## Consequences

- No server-side rendering; initial load relies on client-side JavaScript
- File-based routing not available out of the box (use `vue-router` with explicit route definitions)
- Future participant-facing app could reconsider if SEO becomes relevant — but that's a separate deployment decision
