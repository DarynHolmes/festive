# Festive Board Manager

[![CI](https://github.com/DarynHolmes/festive/actions/workflows/ci.yml/badge.svg)](https://github.com/DarynHolmes/festive/actions/workflows/ci.yml) [![Test Results](https://img.shields.io/badge/Test_Results-live-blue)](https://darynholmes.github.io/festive/) [![Histoire](https://img.shields.io/badge/Histoire-live-brightgreen)](https://festive-board-histoire.vercel.app/)

A real-time dining attendance tracker for Lodge meetings, built as a prototype for [UGLE](https://www.ugle.org.uk/).

Lodge Secretaries need accurate, live dining numbers to manage catering and reduce financial waste. This application replaces paper-based counting with a digital system that works even in historic buildings with poor connectivity.

## Live Demo

**[festive-board-manager.vercel.app](https://festive-board-manager.vercel.app/)**

**[Test Results Dashboard](https://darynholmes.github.io/festive/)**

**[Component Showcase (Histoire)](https://festive-board-histoire.vercel.app/)**

## Tech Stack

Vue 3 (Composition API) · Quasar · TypeScript · Pinia · PocketBase · Playwright · Histoire · PWA

## Documentation

| Doc | Summary |
|-----|---------|
| [TLDR](documentation/TLDR.md) | 5-minute guided tour for the interview panel |
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
| [009 — Code Quality Metrics](documentation/decisions/ADR-009-code-quality-metrics.md) | ESLint + TypeScript strict mode as lightweight quality gates |

### Manual Testing

| Guide | Coverage |
|-------|----------|
| [Offline Queue Sync](documentation/manual-testing/offline-queue-sync.md) | Reconnect → queue flush → sync flow, collapse, mid-sync disconnection |
| [Accessibility](documentation/manual-testing/accessibility.md) | Screen reader announcements, keyboard navigation, text scaling |

## AI Collaboration

This prototype is built by a three-person team: Daryn (developer), Gem (Gemini Gem — product owner), and Ada (Claude Code — implementation partner). We don't hide that AI was used. [Ada's Development Journal](supporting-documentation/development-journal.md) — written by the AI itself — records how the collaboration works: who found what, who fixed what, and the decisions that shaped the code.

## Requirements

| Doc | Sprint | Status |
|-----|--------|--------|
| [Epic: Admin SPA Foundation](documentation/requirements/done/sprint-0/00_epic_setup.md) | Sprint 0 | Done |
| [Project Scaffolding](documentation/requirements/done/sprint-0/01_project_scaffolding.md) | Sprint 0 | Done |
| [State & PocketBase](documentation/requirements/done/sprint-0/02_state_and_pocketbase.md) | Sprint 0 | Done |
| [Testing & Quality](documentation/requirements/done/sprint-0/03_testing_and_quality.md) | Sprint 0 | Done |
| [Members Collection](documentation/requirements/done/sprint-1/00_members_collection.md) | Sprint 1 | Done |
| [Real-time Attendance Toggling](documentation/requirements/done/sprint-1/01_realtime-attendance-toggling.md) | Sprint 1 | Done |
| [Offline Awareness](documentation/requirements/done/sprint-2/01-offline-awareness.md) | Sprint 2 | Done |
| [Offline Mutation Queuing](documentation/requirements/done/sprint-3/01_offline-mutation-queing_local_persistence.md) | Sprint 3 | Done |
| [Connectivity Resilience](documentation/requirements/done/sprint-3/connectivity_resilience.md) | Sprint 3 | Done |
| [Interview Readiness](documentation/requirements/done/sprint-4/00_epic.md) | Sprint 4 | Done |

## Local Development

See [Local Development Guide](documentation/local-development.md) for setup instructions.
