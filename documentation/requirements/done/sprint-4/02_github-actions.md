# GitHub Actions — CI Pipeline

## Goal

Automate lint and test runs on every push/PR, demonstrating enterprise CI practices.

## Tasks

- [ ] Create `.github/workflows/ci.yml`
- [ ] Run ESLint (`pnpm lint`)
- [ ] Run unit tests (`pnpm test:unit`)
- [ ] Run E2E tests (`pnpm test:e2e`) — Playwright against the built app with mocked API routes
- [ ] Add status badge to README

## Job Spec Alignment

- "Develop and maintain automated Playwright test suites"
- "Maintain development work within GitHub using branches, merges, and pull requests"

## Notes

- E2E tests use Playwright's built-in mocking — no live PocketBase needed in CI
- Consider caching `node_modules` and Playwright browsers for faster runs
- Single workflow with sequential jobs (lint → unit → e2e) keeps it simple
