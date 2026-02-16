# Task 1: CI Test Dashboard & GitHub Pages Deploy

## Summary

Add two CI steps to generate a self-contained HTML test dashboard and deploy it to GitHub Pages alongside the existing Playwright report. The dashboard aggregates results from all checks (lint, unit tests, build, E2E) into a single page.

## Work

### Add "Generate test dashboard" step (`.github/workflows/ci.yml`)

Insert after the existing "Job summary" step (line 173), before "Upload Playwright report" (line 175).

**Condition:** `if: ${{ !cancelled() }}` — generates even on failure.

**Env vars:** Same as Job Summary step — `LINT_OUTCOME`, `UNIT_OUTCOME`, `BUILD_OUTCOME`, `E2E_OUTCOME` from step outcomes, plus GitHub context vars (`GITHUB_SHA`, `GITHUB_RUN_ID`, `GITHUB_REPOSITORY`, `GITHUB_SERVER_URL`, `GITHUB_REF_NAME`).

**Script logic:**

1. `mkdir -p dashboard`
2. Compute overall status from step outcomes
3. Parse existing JSON outputs (with existence checks):
   - `test-results/unit.json` → `numPassedTests`, `numFailedTests`, `numTotalTests`
   - `test-results/e2e.json` → `stats.expected`, `stats.unexpected`, `stats.flaky`, `stats.duration`
   - `lint-output.txt` → last 30 lines for failure details
4. Build failure detail fragments (lint errors, failed unit test names, E2E pointer)
5. Write `dashboard/index.html` via heredoc with variable interpolation

**Dashboard HTML design:**

- Self-contained — inline CSS, no external dependencies
- System font stack, max-width 700px centered
- Four check cards in CSS grid (2-col desktop, 1-col mobile via `@media (max-width: 600px)`)
- Green (#2e7d32) / red (#c62828) / grey (#757575) status colours — >4.5:1 contrast on white
- Semantic HTML (`<main>`, `<header>`, `<section>`, `<details>/<summary>`)
- Content:
  - Overall pass/fail status banner
  - Card per check: icon + status + detail (test counts, duration)
  - E2E card links to `./playwright-report/index.html`
  - Metadata: branch, commit SHA (linked to GitHub), timestamp, link to Actions run
  - Collapsible Failure Details section when any check fails
- HTML-escapes lint output and test names (`&`, `<`, `>`)

### Add "Prepare GitHub Pages deploy" step

Insert after dashboard generation, before the deploy step.

```yaml
- name: Prepare GitHub Pages deploy
  if: github.event_name == 'push' && github.ref == 'refs/heads/main' && !cancelled()
  run: |
    mkdir -p gh-pages-deploy
    cp dashboard/index.html gh-pages-deploy/
    if [ -d playwright-report ]; then
      cp -r playwright-report gh-pages-deploy/playwright-report
    fi
```

### Update existing deploy step

- Rename: "Deploy Playwright report to GitHub Pages" → "Deploy test dashboard to GitHub Pages"
- Change `publish_dir`: `clients/secretary-app/playwright-report` → `clients/secretary-app/gh-pages-deploy`

## Files

| File | Action |
|------|--------|
| `.github/workflows/ci.yml` | Modify — add 2 steps, update deploy step |

## Verification

- [ ] Push to main triggers dashboard generation (check Actions log)
- [ ] `https://darynholmes.github.io/festive/` loads the dashboard
- [ ] Dashboard shows correct status for all 4 checks
- [ ] Playwright report accessible at `https://darynholmes.github.io/festive/playwright-report/index.html`
- [ ] Metadata (commit, branch, timestamp, Actions link) is correct
- [ ] Dashboard is readable at 200% browser zoom
- [ ] Dashboard renders correctly when a check fails (failure details section appears)
