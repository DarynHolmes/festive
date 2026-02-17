# TLDR Document

## Goal

A concise document that gives the interview panel a guided tour of the prototype in under 5 minutes of reading. Shows senior-level output: architecture, testing, accessibility, documentation.

## Content

- [ ] What this is and why it exists (1–2 sentences)
- [ ] Live links: app, Histoire, GitHub repo
- [ ] Architecture summary with a diagram (Mermaid): container/presentational, service/store/composable layers, PocketBase realtime
- [ ] Key technical decisions (link to ADRs): offline-first, optimistic updates, IndexedDB mutation queue
- [ ] Quality practices: Playwright E2E with axe-core, unit tests for pure functions, ESLint + strict TypeScript, CI pipeline
- [ ] Accessibility approach: WCAG 2.2 AA, elderly-friendly targets, aria-live regions, contrast compliance
- [ ] What was deliberately descoped and why (auth, member app, conflict resolution UI)
- [ ] Tech stack table mapping to the job spec

## Notes

- This is not a README — it's a presentation document aimed at the interview panel
- Keep it to 1–2 pages. Progressive disclosure — link to detailed docs, don't inline them
- Place at `documentation/TLDR.md` or similar prominent location
