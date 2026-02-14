
# Overview

This project is a prototype to support a job application with UGLE - https://www.ugle.org.uk/

- Job spec: `supporting-documentation/job-spec.md`
- Prototype scope: `documentation/01_overview.md`

## Objectives

- Clean and pragmatic architecture
- Good enterprise practices
- Alignment with the job spec

## Tech Stack

**Hard constraints** (must use):
- Vue (Composition API)
- Quasar
- TypeScript
- Playwright test suites (with built-in mocking)

**Suggested stack:**
- Vite
- Pinia for state management
- Pinia-colada for async state (fall back to Vue Query if it falls short)
- Zod for form validation
- Histoire for component showcase
- vite-plugin-pwa

**Backend:**
- PocketBase v0.36 (plays the role of Laravel in this prototype; I have a PocketHost subscription)
- Use PocketBase's realtime feature for WebSocket integration
- Use PocketBase to provide test data
- 2 roles (Lodge Secretary and Member) — use PocketBase's RBAC support
- Consider a repository-light pattern to decouple backend data structures

**App structure:**
- Start with the Lodge Secretary app; defer the Member app decision until Phase 1 is solid

## Domain Language

Use UGLE-specific terminology throughout code, documentation, and UI. This demonstrates domain awareness and makes the prototype immediately legible to UGLE staff.

Examples: Lodge, Province, Festive Board, Lodge Secretary, Worshipful Master, Tyler, Candidate, Dining, Meeting, Summons.

Avoid generic terms (e.g. "group" instead of "Lodge", "admin" instead of "Lodge Secretary", "event" instead of "Meeting") unless in a purely technical context.

## Architecture Principles

- Composable components with clear separation of concerns
- Sensible state management with good, consistent naming
- Low coupling
    - Decouple backend data structures
    - Use props in Vue components, defined by the components
- Favour pure functions — easier to test
- Avoid code duplication; maximise code reuse
- **Container pages, presentational components**
    - Pages (containers): fetch data, orchestrate state
    - Components (presentational): receive props, emit events
- Favour Vue slots to keep components flat, small, and reusable

## Testing

**Philosophy:** pragmatic test automation — meaningful tests, not coverage for coverage's sake. Write code that is easier to test (pure functions). Don't add tests because we can.

**Test types:**
- Meaningful unit tests
- E2E / high-level tests

**Quality characteristics:**
- Independent and atomic — no test depends on another, run in any order
- Deterministic — same result every time, no flaky tests
- Fast — immediate feedback for rapid development
- Maintainable — treat test code like production code
- Single responsibility — one behaviour per test
- Repeatable and automated — no human intervention, CI/CD ready
- Comprehensive data coverage — boundaries, valid, and invalid scenarios

## UX & Accessibility

### Accessibility

This is highly important for UGLE.

**Standards:** WCAG 2.2 AA

**Practices:**
- Semantic HTML
- Focus management
- ARIA — use `aria-describedby` to link error messages to inputs (not just red borders)
- Automated axe-core tests
- Manual keyboard audits
- Skip-to-content links where appropriate

**Elderly-friendly UI (ages 18-90+):**
- Large hit targets — buttons at least 44x44px
- Avoid complex gestures (swiping, long-pressing) — stick to simple clicks/taps
- High contrast ratios — at least 4.5:1 for text
- Support text scaling — layout must not break at 200% browser font size

### UX

- Follow progressive disclosure where it makes sense

## Infrastructure

- GitHub Actions for running tests and ESLint
- PocketBase hosted on PocketHost (available for CI testing)
- App and Histoire hosted on Vercel

## Scope & Strategy

**Approach:** narrow scope, go deep.

**Deep means:**
- Realtime updates with WebSockets (optimistic updates)
- Offline support
- Conflict resolution in data

**High-value deliverables:**
- Architecture Decision Records (ADRs) — short docs explaining why we chose Vue 3 Composition API, offline-first, PocketBase, etc.
- Component design rationale — a brief doc showing the container/presentational pattern with a real example

## Documentation Style

- Terse, high signal-to-noise ratio
- Progressive disclosure — use technical terms, link to detailed docs only when it adds value
- Mermaid diagrams encouraged (https://mermaid.ai/open-source/)
- ASCII art as a fallback
- **Blank lines between block elements** — markdown requires a blank line between headings, bold lines, paragraphs, lists, and other block-level elements for them to render on separate lines

## AI Usage

We don't hide that AI was used. I plan to use it in all areas from high-level architecture to low-level coding.

It should be self-evident that while AI was used, the developer was highly involved. I want us to challenge each other's assumptions and work together to produce a high-quality outcome.

If I am lacking in contribution, let me know.

**Roles:**
- **Gemini Gem** (`supporting-documentation/gemini-gem.md`) — acts as product owner; defines requirements
- **Claude Code** — implements requirements; encouraged to challenge them

As the project progresses, keep `supporting-documentation/gemini-gem.md` up to date with changes. Remind me to update the Gem with the latest information.

## Working with Claude Code

- Raise concerns around anything that might not be received well by UGLE
- This work is on my own volition, not requested — flag if I'm doing more harm than good
- Offer to create supporting documentation for key architectural decisions
- Make suggestions on important tasks; let me know if I'm missing a valuable deliverable
- Keep me on track

## Do NOT

- Do not introduce spaghetti code
- Do not let files get too long
- Do not allow TS errors — make sure we are avoiding them
- Don't add tests for the sake of it — they should be valuable
- Don't write documentation for the sake of it — high signal to noise


DON'T EXPOSE ANY API SECRETS OR ANY PRIVATE KEYS OR ANY SENSITIVE INFORMATION.
Use security best practices such as env files. 
This is non-negotiable and we can't compromise on security. 