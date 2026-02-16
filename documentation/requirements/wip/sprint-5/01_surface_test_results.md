# Surface Test Results

## User Story

As a member of the interview panel reviewing this prototype,
I want to see the results of the latest automated test run on main at a glance,
so that I can evaluate the current quality and test coverage without running anything locally.

## Context

The CI pipeline (`.github/workflows/ci.yml`) already runs lint, unit tests, build, and E2E tests on every push to main. Playwright reports are uploaded as artifacts but expire after 14 days and require navigating into the Actions UI to download. This story is about making results visible and accessible with minimal friction.

The repository is public (or will be), so test results can also be public — this opens up options like GitHub Pages for hosting reports.

## Acceptance Criteria

- [ ] Test results are available in a format that's easy to read (HTML, markdown, or plain text)
- [ ] Results are accessible to anyone with GitHub access to the repository — no extra tools or accounts needed
- [ ] Results update automatically on every push to main — no manual developer step
- [ ] The latest results are reachable within 1-2 clicks from the repository root (e.g. a badge, a link in the README, or a published GitHub Pages report)
- [ ] Failed builds still surface useful information — at minimum, which step failed and why
- [ ] Results cover all automated checks: lint, unit tests, and E2E tests

## Out of Scope

- Hosting test results outside of GitHub (no external dashboards)
- Historical trend reporting — latest run only
- Notifications or alerts on failure

