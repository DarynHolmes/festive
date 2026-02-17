/**
 * Generates CI report outputs: GitHub Actions Job Summary + HTML dashboard.
 * Called from ci.yml after all checks have run.
 *
 * Required env vars:
 *   LINT_OUTCOME, UNIT_OUTCOME, BUILD_OUTCOME, E2E_OUTCOME  (step outcomes)
 *   GITHUB_STEP_SUMMARY  (set by GitHub Actions)
 *   RUN_URL, COMMIT_URL, COMMIT_SHA, BRANCH  (git metadata)
 *
 * Expects to run from clients/secretary-app/ (working directory set in ci.yml).
 */
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs'

const env = process.env

// =============================================================================
// Parse test results
// =============================================================================

const outcomes = {
  lint: env.LINT_OUTCOME,
  unit: env.UNIT_OUTCOME,
  build: env.BUILD_OUTCOME,
  e2e: env.E2E_OUTCOME,
}

const allPassed = Object.values(outcomes).every((o) => o === 'success')

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

function readText(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

const ran = (outcome) => outcome === 'success' || outcome === 'failure'

// --- Unit tests ---
const unitJson = ran(outcomes.unit) ? readJson('reports/unit.json') : null
const unit = unitJson
  ? { passed: unitJson.numPassedTests, failed: unitJson.numFailedTests, total: unitJson.numTotalTests }
  : null

// --- E2E tests ---
const e2eJson = ran(outcomes.e2e) ? readJson('test-results/e2e.json') : null
const e2e = e2eJson
  ? {
      expected: e2eJson.stats.expected,
      unexpected: e2eJson.stats.unexpected,
      flaky: e2eJson.stats.flaky,
      duration: (e2eJson.stats.duration / 1000).toFixed(1),
    }
  : null

// --- Lint ---
const lintOutput = readText('lint-output.txt')
const lintJson = readJson('reports/lint.json')
const lint = lintJson
  ? (() => {
      const files = lintJson.length
      let warnings = 0
      let errors = 0
      const byRule = {}
      for (const file of lintJson) {
        for (const msg of file.messages) {
          if (msg.severity === 1) warnings++
          if (msg.severity === 2) errors++
          const rule = msg.ruleId || 'unknown'
          if (!byRule[rule]) byRule[rule] = []
          byRule[rule].push({
            file: file.filePath.replace(/^.*secretary-app\//, ''),
            line: msg.line,
            message: msg.message,
          })
        }
      }
      return { files, warnings, errors, byRule }
    })()
  : null

// =============================================================================
// Shared helpers
// =============================================================================

function outcomeLabel(outcome) {
  if (outcome === 'success') return 'Passed'
  if (outcome === 'failure') return 'Failed'
  return 'Skipped'
}

function lintDetail() {
  if (!ran(outcomes.lint)) return 'Skipped'
  if (!lint) return outcomeLabel(outcomes.lint)
  const parts = [`${lint.files} files`]
  if (lint.errors > 0) parts.push(`${lint.errors} errors`)
  if (lint.warnings > 0) parts.push(`${lint.warnings} warnings`)
  if (lint.errors === 0 && lint.warnings === 0) parts.push('0 warnings')
  return parts.join(', ')
}

function unitDetail() {
  if (!ran(outcomes.unit)) return 'Skipped'
  if (!unit) return 'Failed (no report)'
  if (unit.failed === 0) return `${unit.passed} passed`
  return `${unit.passed} passed, ${unit.failed} failed of ${unit.total}`
}

function e2eDetail() {
  if (!ran(outcomes.e2e)) return 'Skipped'
  if (!e2e) return 'Failed (no report)'
  if (e2e.unexpected === 0) {
    const flaky = e2e.flaky > 0 ? ` (${e2e.flaky} flaky)` : ''
    return `${e2e.expected} passed${flaky} (${e2e.duration}s)`
  }
  const total = e2e.expected + e2e.unexpected + e2e.flaky
  return `${e2e.unexpected} failed, ${e2e.expected} passed of ${total} (${e2e.duration}s)`
}

const hasLintFailure = outcomes.lint === 'failure' && lintOutput
const hasUnitFailure = unit && unit.failed > 0
const hasE2eFailure = e2e && e2e.unexpected > 0
const hasAnyFailure = hasLintFailure || hasUnitFailure || hasE2eFailure

function failedUnitTests() {
  if (!unitJson) return []
  return unitJson.testResults.flatMap((file) =>
    file.assertionResults
      .filter((t) => t.status === 'failed')
      .map((t) => [...t.ancestorTitles, t.title].join(' > ')),
  )
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function lintBreakdown() {
  if (!lint || Object.keys(lint.byRule).length === 0) return []
  return Object.entries(lint.byRule).map(([rule, items]) => ({
    rule,
    items: items.map((i) => ({ file: i.file, line: i.line, message: i.message })),
  }))
}

function unitTestBreakdown() {
  if (!unitJson) return []
  return unitJson.testResults.map((file) => {
    const name = file.name.replace(/^.*secretary-app\//, '')
    const tests = file.assertionResults.map((t) => ({
      name: [...t.ancestorTitles, t.title].join(' > '),
      status: t.status,
    }))
    return { name, tests }
  })
}

// =============================================================================
// Job Summary (GitHub Actions markdown)
// =============================================================================

function generateSummary() {
  const icon = (outcome) => {
    if (outcome === 'success') return ':white_check_mark:'
    if (outcome === 'failure') return ':x:'
    return ':next_track_button:'
  }

  const unitIcon = hasUnitFailure ? ':x:' : icon(outcomes.unit)
  const e2eIcon = hasE2eFailure ? ':x:' : icon(outcomes.e2e)

  const lines = [
    '## CI Results',
    '',
    '| | Check | Result |',
    '|---|---|---|',
    `| ${icon(outcomes.build)} | Build | ${outcomeLabel(outcomes.build)} |`,
    `| ${icon(outcomes.lint)} | Lint | ${lintDetail()} |`,
    `| ${e2eIcon} | E2E Tests | ${e2eDetail()} |`,
    `| ${unitIcon} | Unit Tests | ${unitDetail()} |`,
  ]

  if (hasAnyFailure) {
    lines.push('', '### Failure Details', '')

    if (hasLintFailure) {
      const tail = lintOutput.split('\n').slice(-30).join('\n')
      lines.push('<details><summary>Lint errors</summary>', '', '```', tail, '```', '</details>', '')
    }

    if (hasUnitFailure) {
      const items = failedUnitTests().map((t) => `- ${t}`)
      lines.push('<details><summary>Failed unit tests</summary>', '', ...items, '</details>', '')
    }

    if (hasE2eFailure) {
      lines.push(
        '<details><summary>Failed E2E tests</summary>',
        '',
        'See the Playwright HTML report for full details including screenshots and traces.',
        '</details>',
        '',
      )
    }
  }

  appendFileSync(env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n')
}

// =============================================================================
// Dashboard HTML (deployed to GitHub Pages)
// =============================================================================

function generateDashboard() {
  const shortSha = env.COMMIT_SHA.slice(0, 7)
  const timestamp = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z/, ' UTC')

  const htmlIcon = (outcome) => {
    if (outcome === 'success') return '&#x2713;'
    if (outcome === 'failure') return '&#x2717;'
    return '&#x2014;'
  }

  const htmlClass = (outcome) => {
    if (outcome === 'success') return 'pass'
    if (outcome === 'failure') return 'fail'
    return 'skip'
  }

  // --- Per-card extras ---
  const e2eExtra = e2eJson
    ? '<a href="./playwright-report/index.html">View Playwright report</a>'
    : ''

  let unitExtra = ''
  const breakdown = unitTestBreakdown()
  if (breakdown.length > 0) {
    const suites = breakdown.map((file) => {
      const items = file.tests.map((t) => {
        const icon = t.status === 'passed' ? '&#x2713;' : '&#x2717;'
        const cls = t.status === 'passed' ? 'test-pass' : 'test-fail'
        return `<li class="${cls}"><span class="test-icon">${icon}</span> ${escapeHtml(t.name)}</li>`
      }).join('')
      return `<li><strong>${escapeHtml(file.name)}</strong><ul>${items}</ul></li>`
    }).join('')
    unitExtra = `<details class="test-breakdown"><summary>View test details</summary><ul class="suites">${suites}</ul></details>`
  }

  let lintExtra = ''
  const lintRules = lintBreakdown()
  if (lintRules.length > 0) {
    const rules = lintRules.map((r) => {
      const items = r.items.map((i) =>
        `<li>${escapeHtml(i.file)}:${i.line} — ${escapeHtml(i.message)}</li>`
      ).join('')
      return `<li><strong>${escapeHtml(r.rule)}</strong> (${r.items.length})<ul>${items}</ul></li>`
    }).join('')
    lintExtra = `<details class="test-breakdown"><summary>View lint warnings</summary><ul class="suites">${rules}</ul></details>`
  }

  // --- Failure details section ---
  let failureSection = ''
  if (hasAnyFailure) {
    let details = ''

    if (hasLintFailure) {
      const tail = escapeHtml(lintOutput.split('\n').slice(-30).join('\n'))
      details += `<details><summary>Lint errors</summary><pre>${tail}</pre></details>`
    }

    if (hasUnitFailure) {
      const items = failedUnitTests().map((t) => `<li>${escapeHtml(t)}</li>`).join('')
      details += `<details><summary>Failed unit tests</summary><ul>${items}</ul></details>`
    }

    if (hasE2eFailure) {
      details += '<details><summary>Failed E2E tests</summary>'
        + '<p>See the <a href="./playwright-report/index.html">Playwright HTML report</a> for screenshots and traces.</p>'
        + '</details>'
    }

    failureSection = `<section class="failures" aria-label="Failure details"><h2>Failure Details</h2>${details}</section>`
  }

  // --- Card helper ---
  const card = (outcome, title, detail, extra = '') => `
        <div class="card ${htmlClass(outcome)}">
          <span class="icon" aria-hidden="true">${htmlIcon(outcome)}</span>
          <div class="card-body">
            <div class="card-row">
              <h2>${title}</h2>
              <span class="detail">${detail}</span>
            </div>
            ${extra}
          </div>
        </div>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CI Results — Festive Board Manager</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0; padding: 2rem 1rem; background: #fafafa; color: #1a1a1a;
      line-height: 1.5; font-size: 16px;
    }
    .container { max-width: 700px; margin: 0 auto; }
    h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
    .subtitle { margin: 0 0 1.5rem; color: #555; font-size: 0.95rem; }
    .overall {
      padding: 1rem 1.5rem; border-radius: 8px; margin-bottom: 2rem;
      font-size: 1.25rem; font-weight: 600; text-align: center;
    }
    .overall.pass { background: #e8f5e9; color: #1b5e20; border: 2px solid #2e7d32; }
    .overall.fail { background: #ffebee; color: #b71c1c; border: 2px solid #c62828; }
    .checks { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
    .card {
      background: #fff; border-radius: 8px; padding: 1rem 1.25rem;
      border: 1px solid #e0e0e0; display: flex; flex-direction: row; align-items: flex-start; gap: 1rem;
    }
    .card .icon { font-size: 1.5rem; flex-shrink: 0; line-height: 1; padding-top: 0.1rem; }
    .card-body { flex: 1; min-width: 0; }
    .card-row { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; }
    .card h2 { margin: 0; font-size: 1rem; color: #333; white-space: nowrap; }
    .card .detail { color: #555; font-size: 0.9rem; }
    .card a { font-size: 0.85rem; color: #1565c0; }
    .card.pass .icon { color: #2e7d32; }
    .card.fail .icon { color: #c62828; }
    .card.skip .icon { color: #757575; }
    .meta { color: #666; font-size: 0.85rem; margin-bottom: 2rem; }
    .meta p { margin: 0.25rem 0; }
    .meta a { color: #1565c0; }
    .meta code { background: #f5f5f5; padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.85rem; }
    .failures { margin-bottom: 2rem; }
    .failures h2 { font-size: 1.1rem; margin: 0 0 0.75rem; color: #c62828; }
    .failures details { margin-bottom: 0.5rem; }
    .failures summary { cursor: pointer; font-weight: 500; padding: 0.5rem 0; }
    .failures pre {
      background: #f5f5f5; padding: 1rem; border-radius: 6px;
      overflow-x: auto; font-size: 0.8rem; line-height: 1.4; margin: 0.5rem 0 0;
    }
    .failures ul { margin: 0.5rem 0 0; padding-left: 1.5rem; }
    .failures li { font-size: 0.85rem; margin-bottom: 0.25rem; }
    .test-breakdown { margin-top: 0.5rem; }
    .test-breakdown summary { cursor: pointer; font-size: 0.85rem; color: #1565c0; padding: 0; font-weight: normal; }
    .test-breakdown .suites { list-style: none; padding: 0; margin: 0.5rem 0 0; }
    .test-breakdown .suites > li { margin-bottom: 0.75rem; }
    .test-breakdown .suites strong { font-size: 0.8rem; color: #555; }
    .test-breakdown .suites ul { list-style: none; padding: 0; margin: 0.25rem 0 0; }
    .test-breakdown .suites li li { font-size: 0.78rem; color: #666; padding: 0.1rem 0; }
    .test-breakdown .test-icon { font-size: 0.7rem; margin-right: 0.25rem; }
    .test-pass .test-icon { color: #2e7d32; }
    .test-fail .test-icon { color: #c62828; }
    footer { border-top: 1px solid #e0e0e0; padding-top: 1rem; color: #999; font-size: 0.8rem; }
    footer a { color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>CI Results</h1>
      <p class="subtitle">Festive Board Manager</p>
      <div class="overall ${allPassed ? 'pass' : 'fail'}">${allPassed ? 'All Checks Passed' : 'Checks Failed'}</div>
    </header>
    <main>
      <div class="checks">${card(outcomes.build, 'Build', outcomeLabel(outcomes.build))}${card(outcomes.lint, 'Lint', lintDetail(), lintExtra)}${card(outcomes.e2e, 'E2E Tests', e2eDetail(), e2eExtra)}${card(outcomes.unit, 'Unit Tests', unitDetail(), unitExtra)}
      </div>
      <div class="meta">
        <p>Branch: <code>${env.BRANCH}</code> &middot; Commit: <code><a href="${env.COMMIT_URL}">${shortSha}</a></code></p>
        <p>Generated: ${timestamp}</p>
        <p><a href="${env.RUN_URL}">View full CI run on GitHub Actions</a></p>
      </div>
      ${failureSection}
    </main>
    <footer>
      <a href="https://github.com/DarynHolmes/festive">Festive Board Manager</a>
    </footer>
  </div>
</body>
</html>`

  mkdirSync('dashboard', { recursive: true })
  writeFileSync('dashboard/index.html', html)
}

// =============================================================================
// Main
// =============================================================================
generateSummary()
generateDashboard()
