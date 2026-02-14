# ADR-008: Lightweight Page Helpers over Full Page Object Model

**Status:** Accepted

**Date:** 2026-02-14

## Context

As E2E tests grow beyond smoke tests and accessibility checks, we need a strategy for organising page interactions. The Playwright docs recommend the [Page Object Model](https://playwright.dev/docs/pom) (POM) — classes that encapsulate locators and actions for each page. Two approaches are on the table:

- **Full POM** — one class per page/view, wrapping every locator and action behind methods (`loginPage.enterUsername('admin')`, `dashboardPage.toggleAttendance(row)`)
- **Lightweight page helpers** — small, focused functions or fixture extensions that encapsulate repeated patterns without the class ceremony

Our test surface is currently small (2 spec files, single-page app) but is about to grow — Sprint 1 introduces a high-density attendance dashboard with optimistic updates, realtime sync, and slow-network scenarios. More views and flows will follow.

### Arguments for full POM

- **Centralised selectors** — when a component's markup changes, you update one class instead of many test files
- **Readable tests** — method names like `attendancePage.toggleMember('Smith')` read like user intent
- **Industry standard** — familiar to anyone who has written Selenium/Cypress/Playwright tests before

### Arguments against full POM (for this project)

- **Class overhead for a small surface** — our app has a handful of views. One class per page adds indirection without enough duplication to justify it. We would be writing boilerplate for organisational purity rather than practical need
- **We already have Playwright fixtures** — [fixtures.ts](../../clients/secretary-app/e2e/fixtures.ts) extends `test` with custom capabilities (e.g. `makeAxeBuilder`). This is Playwright's own composition mechanism and it scales well without class hierarchies
- **Container/presentational architecture reduces selector churn** — our components are small, prop-driven, and use semantic HTML and ARIA attributes. Selectors like `getByRole('switch')` and `getByText('Lodge of Harmony')` are stable by design. The main benefit of POM (centralising fragile selectors) is less compelling when selectors are inherently stable
- **Test readability through domain helpers** — rather than `attendancePage.toggleMember(...)`, a function like `toggleDiningStatus(page, memberName)` is equally readable, lighter, and composable across tests without class instantiation
- **YAGNI risk** — building a POM layer now for 2-3 pages adds structure we don't yet need. If the app grows significantly, we can introduce page objects later — moving from functions to classes is a straightforward refactor

## Decision

**Use lightweight page helpers (functions and fixtures) instead of class-based Page Object Models.**

Specifically:

1. **Fixture extensions** for cross-cutting concerns — continue extending `test` via `test.extend<T>()` for capabilities like accessibility auditing, mock setup, or authenticated sessions
2. **Domain helper functions** for repeated interactions — e.g. `mockLodgesApi(page, data)`, `toggleDiningStatus(page, memberName)`. Co-locate these in `e2e/helpers/` when they're shared, or keep them in the spec file when they're not
3. **Semantic locators over abstracted selectors** — prefer `page.getByRole()`, `page.getByText()`, and `page.getByTestId()` directly in tests. These are stable, readable, and don't benefit from an additional layer of indirection
4. **Revisit if the app surface exceeds ~8 distinct views** — at that scale, the centralisation benefits of POM may outweigh the overhead

## Consequences

- E2E helpers live as exported functions in `e2e/helpers/`, not as classes in `e2e/pages/`
- Tests remain concise — helper functions and fixtures eliminate duplication without the ceremony of constructing page objects
- New team members familiar with POM will find a lighter structure, but the pattern is simple enough to onboard quickly
- If the app grows to many views with complex, multi-step flows (e.g. a full member registration wizard), we should revisit this decision — POM becomes more valuable when there are many pages sharing similar interaction patterns
- Mock data setup (already using inline fixtures) should migrate toward shared helpers as the test suite grows, regardless of this decision
