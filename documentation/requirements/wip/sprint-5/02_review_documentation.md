# Review & Improve Documentation

## Context

The goal of this prototype is to demonstrate that Daryn has the technical capabilities of a senior frontend developer. Documentation is a key part of that — it shows architectural thinking, quality standards, and the ability to communicate decisions clearly.

The reader is likely a hiring panel member with limited time. Documentation should be high signal-to-noise, structured for progressive disclosure, and accurate to what's actually been built.

## Guiding Principles

- **Accuracy over volume** — docs must match the codebase as it stands today
- **Respect the reader's time** — they won't read everything; make the important things easy to find
- **Surface what matters** — architecture, quality practices, and decision-making are the high-value signals
- **Remove or update stale content** — outdated information erodes trust

## Exceptions

**`supporting-documentation/development-journal.md` must not be modified.** It is Ada's (Claude Code) authentic journal — a true record of the collaboration as it happened. We can update where and how it's referenced, and flag concerns if the content is problematic, but the journal itself stays untouched.

---

## Tasks

### 1. Architecture Documentation

**File:** `documentation/02_architecture.md`

Review against the actual codebase and update where needed:

- [ ] **System context diagram** — verify it reflects the current deployment (Vercel app, PocketHost backend, Histoire on Vercel)
- [ ] **Client architecture diagram** — verify the layer names and relationships match the actual code structure: Pages → Components → Composables → Stores/Colada → Services/Schemas
- [ ] **Data flow diagrams** — verify the realtime and offline sequence diagrams match the implemented behaviour, particularly:
  - The dual-layer connection detection (PocketBase SSE + browser online/offline)
  - The mutation queue lifecycle (queued → syncing → removed with cache-patching)
  - Event-based query invalidation via `useRealtimeSync`
- [ ] **ER diagram** — verify it matches the PocketBase collections (lodges, members, dining_records)
- [ ] **Offline architecture** — the offline mutation queue, IndexedDB persistence, and three-state connection model are sophisticated features; ensure they're adequately represented in the architecture docs (not just in code)

### 2. Component Design Documentation

**File:** `documentation/03_component_design.md`

- [ ] Verify the container/presentational example still matches the current `DiningPage` → `DiningTable` implementation
- [ ] Check whether additional patterns worth documenting have emerged (e.g. composable composition, slot usage)

### 3. ADR Review

**Files:** `documentation/decisions/ADR-001` through `ADR-009`

For each ADR:

- [ ] **Accuracy** — does the decision still hold? Has the approach changed?
- [ ] **"Revisit after X" clauses** — check if the trigger condition has been met and update status accordingly
- [ ] **Completeness** — are there architectural decisions made during Sprints 3-4 that aren't captured in an ADR? Candidates:
  - IndexedDB for offline persistence (currently only mentioned within ADR-003)
  - Dual-layer connection detection strategy
  - Event-based cache invalidation (TkDodo pattern)
  - CI/CD pipeline design choices (build-then-serve for E2E, artifact uploads)
- [ ] **Consistency** — do ADRs reference each other correctly? Are links valid?

### 4. Diagram Audit

All diagrams are embedded as Mermaid in markdown. For each:

- [ ] **Renders correctly** — verify Mermaid syntax produces the intended output
- [ ] **Matches reality** — labels, relationships, and flows reflect the current code
- [ ] **Files containing diagrams:**
  - `documentation/02_architecture.md` (4 diagrams)
  - `documentation/03_component_design.md` (1 diagram)
  - `documentation/TLDR.md` (1 diagram)
  - `supporting-documentation/development-journal.md` (1 diagram — **do not modify**, flag if inaccurate)

### 5. Manual Testing Guides

**Files:** `documentation/manual-testing/offline-queue-sync.md`, `documentation/manual-testing/accessibility.md`

- [ ] **Accuracy** — do the test steps match the current UI and behaviour?
- [ ] **Completeness** — are there manual test scenarios that should exist but don't? Consider:
  - Realtime updates (multi-tab or multi-device sync)
  - PWA install experience (if enabled)
- [ ] **Presentation** — are they clear enough for someone unfamiliar with the app to follow?

### 6. TLDR / Entry Points

**File:** `documentation/TLDR.md`

The TLDR is the most likely document to be read. Give it extra attention:

- [ ] **Current and accurate** — reflects Sprint 4 completion and all delivered features
- [ ] **Tells a compelling story** — architecture, quality, offline-first, accessibility, CI/CD
- [ ] **Links work** — all internal references point to valid files
- [ ] **Diagram is correct** — the architecture layer diagram matches the full version

### 7. README

**File:** `README.md`

- [ ] **Requirements table** — up to date with all completed sprints
- [ ] **Live links** — app URL and Histoire URL work
- [ ] **Documentation index** — all links point to existing files; no dead links
- [ ] **Setup instructions** — either present or clearly linked to `documentation/local-development.md`

### 8. Supporting Documentation

**Files:** `supporting-documentation/done-features.md`, `supporting-documentation/implementation-context.md`

- [ ] **done-features.md** — includes Sprint 4 deliverables; accurate feature list
- [ ] **implementation-context.md** — PocketBase collections, TypeScript types, and schemas match the current code

---

## Flag: Potential Missing Documentation

Review whether any of the following would strengthen the prototype. Don't create docs for the sake of it — only if they add genuine signal:

- [ ] **Offline architecture deep-dive** — the mutation queue lifecycle, connection detection, and cache-patching strategy are the most technically impressive parts of this prototype. They're currently documented in code comments and the development journal but not in a standalone architecture doc. Worth considering.
- [ ] **Testing strategy overview** — how unit tests, E2E tests, accessibility tests, and manual tests fit together. The philosophy is in CLAUDE.md but a reader-facing summary may help.
- [ ] **CI/CD pipeline documentation** — what runs, why, and how (build-then-serve pattern, artifact uploads, env var handling). Demonstrates DevOps awareness.
- [ ] **Accessibility compliance summary** — a concise doc showing what WCAG 2.2 AA measures are in place (automated axe-core, manual audits, semantic HTML, ARIA patterns, elderly-friendly design). This is specifically called out in the job spec.
- [ ] **Codebase patterns catalogue** — the codebase uses several deliberate patterns (container/presentational, composable composition, repository-light, optimistic updates, event-based cache invalidation, three-state connection model). If there are enough well-defined patterns to warrant it, a concise patterns section in the documentation would demonstrate senior-level architectural thinking. Only justified if it surfaces patterns not already covered by existing ADRs and architecture docs.

---

## Acceptance Criteria

- All documentation accurately reflects the current codebase and deployed state
- Diagrams render correctly and match implementation
- ADRs are reviewed and any "revisit" clauses are addressed
- No dead links in README, TLDR, or documentation index
- Any flagged missing documentation is discussed and a decision made (create, defer, or skip)
- Documentation remains terse and high signal-to-noise — no padding
- Development journal is left untouched; concerns flagged only
