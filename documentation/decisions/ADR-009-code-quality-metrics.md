# ADR-009: ESLint Complexity Rules over SonarQube

**Status:** Accepted

**Date:** 2026-02-15

## Context

Sprint-3 tech task: should we set up SonarQube (or SonarCloud) as a quality
yardstick before feature work begins?

The codebase has ~28 source files (TS + Vue). Quality infrastructure already
in place: ESLint 9 with TypeScript strict + Vue essential rules, Prettier,
Vitest unit tests (co-located), Playwright E2E with axe-core accessibility
checks.

## Decision

**Add ESLint complexity rules (`complexity`, `max-depth`, `max-params`) as
warnings. Do not introduce SonarQube or SonarCloud.**

### Why ESLint rules

- **Zero additional dependencies** — the tooling is already installed
- **Immediate feedback** — violations surface in the editor via
  `vite-plugin-checker` and at lint time; no separate analysis step
- **Proportionate** — a prototype does not need a metrics dashboard
  with historical trend tracking
- **CI-ready** — when GitHub Actions arrives, `pnpm lint` fails the build on
  errors and surfaces warnings

### Why not SonarQube/SonarCloud

- Requires CI/CD pipeline (not yet set up), account provisioning, and a token
  stored as a GitHub secret
- Dashboard value scales with team size and codebase age; a solo-developer
  prototype won't generate meaningful trends
- The analysis run adds 30-60s to every CI build for information already
  available in the editor
- Most SonarCloud features (security hotspots, PR decoration, branch analysis)
  are not relevant at this stage

### Thresholds

| Rule | Threshold | Rationale |
|------|-----------|-----------|
| `complexity` | warn at 10 | Industry standard; matches SonarQube's default cognitive complexity threshold |
| `max-depth` | warn at 3 | Prevents deeply nested conditionals, especially in composable callbacks |
| `max-params` | warn at 4 | Flags functions that should accept an options object instead |

All rules use `warn` rather than `error` — they are guardrails that guide
developer judgement, not gates that block. A function at complexity 11 might
be the right choice (e.g. a state machine).

### Revisit when

- The codebase grows beyond ~50 source files, or
- A second developer joins the project

At that point the GitHub Actions pipeline will already exist and SonarCloud
integration is straightforward.

## Consequences

- Complexity warnings appear inline during development; no separate dashboard
- Functions exceeding thresholds are flagged but not blocked, preserving
  developer judgement
- When GitHub Actions CI is added, lint warnings will be visible in the build
  log with no additional configuration
