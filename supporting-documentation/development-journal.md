# Ada's Development Journal

I'm Ada (Claude Code), the implementation partner on this project. This journal records how the three of us build this prototype — what each person contributes, and the decisions that shaped the code.

> Started from Sprint 2. Earlier sprints predate this journal.

## The Team

| Role | Who | Responsibility |
|------|-----|----------------|
| Developer | Daryn Holmes | Architecture, manual testing, quality oversight, technical direction |
| Product Owner | Gem (Gemini Gem) | Requirements, acceptance criteria, domain language |
| Implementation Partner | Ada (Claude Code) | Code generation, test automation, research |

## How We Work

Gem defines the requirements — user stories, acceptance criteria, edge cases — in UGLE domain language. I propose implementation plans and write code. Daryn reviews plans before I write anything, tests every feature manually, and challenges decisions from both sides. The git history shows what was built. This journal captures what led to it.

---

## Sprint 2: Offline Awareness & Connectivity Guardrails

**Spec:** `documentation/requirements/wip/sprint-2/01-offline-awareness.md`

### Plan Review

I proposed an 11-step plan covering connection monitoring, staleness warnings, pending mutation indicators, and E2E tests. Daryn reviewed and approved.

One thing I flagged during planning: the spec mentions "WebSocket" but PocketBase uses SSE (Server-Sent Events). Not a functional issue, but worth noting for accuracy.

### Implementation & Testing

I implemented the plan. Daryn tested each feature manually in the browser — this surfaced several issues my automated tests missed:

**Reconnection bug** — Daryn toggled Chrome DevTools offline and back. The badge stuck at "Reconnecting." I diagnosed the cause: PocketBase SDK exhausts its reconnect backoff while offline, so `PB_CONNECT` never fires when the network returns. I added a reconnect polling fallback. Daryn verified the fix and asked me to add detailed comments explaining why both detection layers exist.

**Toggle alignment regression** — Daryn spotted that dining status toggles shifted left after I added the sync icon wrapper. I traced it to a missing `justify-center` class.

**PocketBase auto-cancellation race** — Daryn captured a `ClientResponseError` when toggling dining status. I identified PocketBase's request auto-cancellation as the cause and added `requestKey: null` as a workaround. (Later removed — see below.)

**Button jump on toggle** — Daryn reported buttons flickering and shifting on toggle. I traced it to the sync icon using `v-if`, which added/removed DOM elements inside a centred flex container. Switched to `visibility: hidden` to reserve space.

### Architectural Decisions Driven by Daryn

**Removing redundant invalidation** — Daryn questioned why we had both `invalidateQueries` in `onSuccess` and realtime event invalidation. Good question — they were racing each other. I replaced the broad `invalidateQueries` with a targeted cache patch, which fixed the root cause.

**Removing `requestKey: null`** — After the root cause was fixed, Daryn asked whether the workaround was still needed. The only remaining scenario was two simultaneous realtime events — theoretical. We removed it, applying the project's own YAGNI principle.

**E2E test hygiene** — Daryn checked whether our E2E tests respected ADR-008. I audited them and found duplicated mock setup across spec files and a CSS selector where a semantic locator should be. Daryn directed the cleanup and had me add a YAGNI clause to the ADR.

**Offline mutation queuing** — Daryn asked whether the spec covered offline mutation behaviour. It didn't — mutations fail and roll back when offline. Daryn directed me to document the gap in `documentation/requirements/todo/` rather than build it speculatively.

### Pre-existing Issues Discovered

Sprint 2 work uncovered two issues that predated the sprint:

- `QBtnToggle` renders `button` roles, not `radio` — my E2E tests were using the wrong role selector
- Quasar's `bg-positive` green (#21ba45) with white text fails WCAG AA contrast (2.56:1) — switched to `outline` variant with darker colours
