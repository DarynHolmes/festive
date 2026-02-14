# Festive Board Manager

A real-time dining attendance tracker for Lodge meetings, built as a prototype for [UGLE](https://www.ugle.org.uk/).

Lodge Secretaries need accurate, live dining numbers to manage catering and reduce financial waste. This application replaces paper-based counting with a digital system that works even in historic buildings with poor connectivity.

## Tech Stack

Vue 3 (Composition API) · Quasar · TypeScript · Pinia · PocketBase · Playwright · PWA

## Documentation

| Doc | Summary |
|-----|---------|
| [Overview](documentation/01_overview.md) | Problem frame, success criteria, strategic roadmap |
| [Architecture](documentation/02_architecture.md) | System context, client layers, data flow, data model, deployment |
| [Component Design](documentation/03_component_design.md) | Thick-page / slim-component pattern with concrete example |
| [Accessibility](documentation/04_accessibility.md) | WCAG 2.2 AA strategy, elderly-friendly design, automated enforcement |

### Architecture Decision Records

| ADR | Decision |
|-----|----------|
| [001 — Vue SPA](documentation/decisions/ADR-001-vue-spa.md) | Vue 3 Composition API + Vite SPA over Nuxt/SSR |
| [002 — PocketBase](documentation/decisions/ADR-002-pocketbase.md) | PocketBase as backend, relationship to Laravel |
| [003 — Offline-First](documentation/decisions/ADR-003-offline-first.md) | PWA with offline queue, optimistic updates, conflict resolution |
| [004 — Quasar](documentation/decisions/ADR-004-quasar.md) | Quasar over Vuetify/PrimeVue/headless UI |
| [005 — Async State](documentation/decisions/ADR-005-async-state.md) | Pinia Colada first, Vue Query as fallback |

### Requirements

| Doc | Sprint |
|-----|--------|
| [Epic: Admin SPA Foundation](documentation/requirements/sprint-0/00_epic_setup.md) | Sprint 0 |
| [Project Scaffolding](documentation/requirements/sprint-0/01_project_scaffolding.md) | Sprint 0 |
| [State & PocketBase](documentation/requirements/sprint-0/02_state_and_pocketbase.md) | Sprint 0 |
| [Testing & Quality](documentation/requirements/sprint-0/03_testing_and_quality.md) | Sprint 0 |
| [Connectivity Resilience](documentation/requirements/deferred/connectivity_resilience.md) | Deferred |
