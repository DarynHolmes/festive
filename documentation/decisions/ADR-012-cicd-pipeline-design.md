# ADR-012: CI/CD Pipeline Design

**Status:** Accepted

**Date:** 2026-02-16

## Context

Sprint 4 introduced GitHub Actions CI. The pipeline needs to run lint, unit tests, build, and Playwright E2E tests on every push to `main` and all PRs. Results should be visible to the interview panel without digging into workflow logs.

Several design decisions emerged from debugging four failed CI runs before reaching green.

## Decisions

### 1. Build-then-serve for E2E tests

**Problem:** Vite's dev server returns HTTP 200 (the HTML shell) before JavaScript bundles finish compiling. On CI hardware, Playwright sees the 200 response and thinks the app is ready, but Vue never mounts — tests time out against a blank page.

**Decision:** Build first (`pnpm build`), then serve static files with `http-server` for E2E tests. The built output is fully compiled — no race between Playwright and Vite's HMR pipeline.

**Config:** `playwright.config.ts` detects `process.env.CI` and uses `http-server dist/spa -p 9000` instead of `pnpm dev`.

### 2. Explicit environment variables on build step

**Problem:** `.env.*` files are gitignored (they contain the PocketBase URL for different environments). CI has no env files, so `import.meta.env.VITE_POCKETBASE_URL` is `undefined` at build time. The app loads but PocketBase calls fail silently.

**Decision:** Set `VITE_POCKETBASE_URL` explicitly on the Build step in the workflow YAML. For CI E2E tests, this points to `http://localhost:8090` — it doesn't matter that no server is running there because all API calls are mocked via Playwright routes.

### 3. Mock PocketBase realtime in E2E setup

**Problem:** Without a PocketBase server in CI, the SSE subscription fails immediately. The connection monitor transitions to `'offline'`, and tests expecting the `'connected'` state fail.

**Decision:** Mock the PocketBase realtime SSE endpoint (`/api/realtime`) in test setup via `mockRealtimeConnection()` in `e2e/helpers/mock-routes.ts`. This returns a valid SSE stream that keeps the connection monitor in `'connected'` state. For offline tests, `page.unroute('**/api/realtime')` is called before `context.setOffline(true)` — Playwright routes bypass browser offline simulation, so the SSE mock must be removed first.

### 4. Test dashboard on GitHub Pages

**Problem:** CI results buried in workflow logs are not visible to the interview panel.

**Decision:** Generate a self-contained HTML dashboard (`dashboard/index.html`) from CI step outcomes, vitest JSON reports, and ESLint JSON output. Deploy to GitHub Pages alongside the Playwright HTML report. A Node script (`.github/scripts/ci-report.mjs`) generates both the GitHub Actions Job Summary and the HTML dashboard from the same parsed data.

**Layout:** Single-column stacked cards (Build → Lint → E2E → Unit) with progressive disclosure — collapsible test-by-file breakdowns and lint rule details.

## Pipeline Structure

```
Install → Lint → Lint JSON → Unit tests → Build → Install Playwright → E2E → Generate report → Deploy dashboard
```

All steps run in a single job to avoid artifact-passing overhead. Steps use `if: ${{ !cancelled() }}` where appropriate so the report captures partial results even when earlier steps fail.

## Consequences

- E2E tests are deterministic — no dependency on Vite compilation timing or external PocketBase server
- Environment variable handling is explicit in the workflow, not hidden in env files
- Test dashboard provides 1-click visibility into quality metrics from the README
- The Node-based report script is maintainable (template literals + JSON parsing) vs the original bash heredoc approach
- Playwright trace artifacts are uploaded on every run for debugging (14-day retention)
