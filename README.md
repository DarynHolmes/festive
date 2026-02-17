# Festive Board Manager

[![CI](https://github.com/DarynHolmes/festive/actions/workflows/ci.yml/badge.svg)](https://github.com/DarynHolmes/festive/actions/workflows/ci.yml) [![Test Results](https://img.shields.io/badge/Test_Results-live-blue)](https://darynholmes.github.io/festive/) [![Histoire](https://img.shields.io/badge/Histoire-live-brightgreen)](https://festive-board-histoire.vercel.app/)

A real-time dining attendance tracker for Lodge meetings, built as a prototype for [UGLE](https://www.ugle.org.uk/).

Lodge Secretaries need accurate, live dining numbers to manage catering and reduce financial waste. This application replaces paper-based counting with a digital system that works even in historic buildings with poor connectivity.

## Live Demo

**[Prototype Presentation (Loom)](https://www.loom.com/share/13af203296344b3596a55d2e55f50884)**

**[festive-board-manager.vercel.app](https://festive-board-manager.vercel.app/)**

**[Test Results Dashboard](https://darynholmes.github.io/festive/)**

**[Component Showcase (Histoire)](https://festive-board-histoire.vercel.app/)**

## What's Been Built

- **Real-time dining dashboard** — toggle member dining status with optimistic updates, cross-device sync via PocketBase realtime subscriptions
- **Offline mutation queuing** — changes made without connectivity are persisted in IndexedDB, survive page refreshes, and automatically sync on reconnect with exponential backoff
- **Connectivity awareness** — dual-layer detection (SSE + browser events), tri-state badge, staleness warnings, `aria-live` announcements
- **Elderly-friendly UI** — touch-friendly menus (48px targets), status-coloured row tinting, WCAG 2.2 AA contrast, calm non-judgmental colour palette
- **CI & quality visibility** — GitHub Actions pipeline (lint, unit, build, E2E) with an auto-generated [test dashboard](https://darynholmes.github.io/festive/) deployed to GitHub Pages
- **Component showcase** — [Histoire](https://festive-board-histoire.vercel.app/) with interactive component variants

## Deliberate Descoping

| What | Why |
|------|-----|
| Authentication & RBAC | PocketBase supports it, implementing login flows would consume time better spent on architecture depth |
| Member-facing app | Deferred to focus on the Secretary SPA and go deep on one |
| Conflict resolution UI | The offline queue prevents most conflicts, a resolution UI adds complexity without proportional value at prototype stage |
| Server-side rendering | A SPA is simpler, PWA-friendly, and needs no server config — right trade-off for a prototype |

## Tech Stack → Job Spec

| Job Spec Requirement | Prototype Implementation |
|---------------------|--------------------------|
| Vue, TypeScript | Vue 3 Composition API, strict TypeScript throughout |
| Utility-based CSS frameworks | Quasar's utility classes + SCSS |
| Component design and state management | Container/presentational pattern; Pinia + Pinia Colada |
| Modular, reusable components for SPA and PWA | Histoire component showcase; PWA via vite-plugin-pwa |
| Automated Playwright test suites | 16 E2E tests + axe-core accessibility audits in CI |
| Integrate with backend APIs | PocketBase REST + realtime SSE (repository-light pattern) |
| Performance, accessibility, responsiveness | WCAG 2.2 AA, connectivity-resilient, optimistic updates |
| GitHub branches, merges, pull requests | GitHub Actions CI on push and PRs |
| Cross-browser and legacy compatibility | Chrome 80+ support for aging Lodge laptops |

## AI Collaboration

AI was used throughout this prototype. The [Development Journal](supporting-documentation/development-journal.md) records how the collaboration worked in practice.

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
| [003 — Connectivity-Resilient PWA](documentation/decisions/ADR-003-connectivity-resilient-pwa.md) | Online-first with offline fallback, mutation queue, optimistic updates |
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

## Local Development

See [Local Development Guide](documentation/local-development.md) for setup instructions.

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
| [Surface Test Results](documentation/requirements/done/sprint-5/01_surface_test_results.md) | Sprint 5 | Done |
| [Review Documentation](documentation/requirements/done/sprint-5/02_review_documentation.md) | Sprint 5 | Done |

## Delivery Context

This was a time-boxed prototype. I prioritised architectural clarity, core behaviour, and delivery of the primary user flows over exhaustive refinement of every implementation detail.

In a production environment, I would conduct deeper review passes focused on edge cases, defensive programming, performance optimisation, and operational robustness.

AI tools were used to accelerate delivery, but all architectural decisions and final implementations were reviewed and owned by me.

