# Festive Board Manager

A real-time dining attendance tracker for Lodge meetings, built as a prototype for [UGLE](https://www.ugle.org.uk/).

Lodge Secretaries need accurate, live dining numbers to manage catering and reduce financial waste. This application replaces paper-based counting with a digital system that works even in historic buildings with poor connectivity.

## Tech Stack

Vue 3 (Composition API) · Quasar · TypeScript · Pinia · PocketBase · Playwright · PWA

## Local Development

### Prerequisites

- Node.js 20+ with pnpm
- PocketBase binary (included at `pocketbase_0.36.3/`)

### Start PocketBase

```bash
cd pocketbase_0.36.3
./pocketbase serve
```

PocketBase starts on `http://127.0.0.1:8090`. Admin UI: `http://127.0.0.1:8090/_/`.

On first run, create an admin account when prompted. Migrations in `pb_migrations/` run automatically, creating the `lodges` and `dining_records` collections.

### Seed Data

With PocketBase running, seed a test lodge, members, and dining records:

```bash
cd clients/secretary-app
node scripts/seed.js
```

### Start the Secretary App

```bash
cd clients/secretary-app
pnpm install
pnpm dev
```

The app reads `VITE_POCKETBASE_URL` from `.env.development` (defaults to `http://127.0.0.1:8090`).

## AI Collaboration

This prototype is built by a three-person team: Daryn (developer), Gem (Gemini Gem — product owner), and Ada (Claude Code — implementation partner). We don't hide that AI was used. [Ada's Development Journal](supporting-documentation/development-journal.md) — written by the AI itself — records how the collaboration works: who found what, who fixed what, and the decisions that shaped the code.

## Documentation

| Doc | Summary |
|-----|---------|
| [Overview](documentation/01_overview.md) | Problem frame, success criteria, strategic roadmap |
| [Architecture](documentation/02_architecture.md) | System context, client layers, data flow, data model, deployment |
| [Component Design](documentation/03_component_design.md) | Container pages, presentational components — pattern with concrete example |
| [Accessibility](documentation/04_accessibility.md) | WCAG 2.2 AA strategy, elderly-friendly design, automated enforcement |

### Architecture Decision Records

| ADR | Decision |
|-----|----------|
| [001 — Vue SPA](documentation/decisions/ADR-001-vue-spa.md) | Vue 3 Composition API + Vite SPA over Nuxt/SSR |
| [002 — PocketBase](documentation/decisions/ADR-002-pocketbase.md) | PocketBase as backend, relationship to Laravel |
| [003 — Offline-First](documentation/decisions/ADR-003-offline-first.md) | PWA with offline queue, optimistic updates, conflict resolution |
| [004 — Quasar](documentation/decisions/ADR-004-quasar.md) | Quasar over Vuetify/PrimeVue/headless UI |
| [005 — Async State](documentation/decisions/ADR-005-async-state.md) | Pinia Colada first, Vue Query as fallback |
| [006 — Test Mocking](documentation/decisions/ADR-006-test-mocking-strategy.md) | Playwright built-in mocks over Mock Service Worker |
| [007 — Histoire](documentation/decisions/ADR-007-histoire.md) | Histoire over Storybook for component showcase |
| [008 — Page Helpers](documentation/decisions/ADR-008-page-object-model.md) | Lightweight page helpers over full Page Object Model |

### Requirements

| Doc | Sprint | Status |
|-----|--------|--------|
| [Epic: Admin SPA Foundation](documentation/requirements/done/sprint-0/00_epic_setup.md) | Sprint 0 | Done |
| [Project Scaffolding](documentation/requirements/done/sprint-0/01_project_scaffolding.md) | Sprint 0 | Done |
| [State & PocketBase](documentation/requirements/done/sprint-0/02_state_and_pocketbase.md) | Sprint 0 | Done |
| [Testing & Quality](documentation/requirements/done/sprint-0/03_testing_and_quality.md) | Sprint 0 | Done |
| [Members Collection](documentation/requirements/done/sprint-1/00_members_collection.md) | Sprint 1 | Done |
| [Real-time Attendance Toggling](documentation/requirements/done/sprint-1/01_realtime-attendance-toggling.md) | Sprint 1 | Done |
| [Connectivity Resilience](documentation/requirements/todo/connectivity_resilience.md) | Todo |  |
