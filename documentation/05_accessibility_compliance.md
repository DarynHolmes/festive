# Accessibility Compliance Summary

**Standard:** WCAG 2.2 AA | **Strategy:** [04_accessibility.md](04_accessibility.md)

This document summarises what's actually implemented — evidence of compliance rather than intent.

---

## Automated Enforcement

**4 axe-core E2E tests** audit against `wcag2a`, `wcag2aa`, `wcag22aa` tags. Any violation fails the CI build.

| Test | Scope |
|------|-------|
| `accessibility.spec.ts` | Lodge dashboard (index page) |
| `dining.spec.ts` | Dining page with member data |
| `offline.spec.ts` × 2 | Offline state; queued mutation state |

**Fixture:** Custom `makeAxeBuilder()` extends Playwright tests — axe-core is available in every test via `fixtures.ts`.

---

## ARIA Implementation

### Live Regions

| Location | Priority | Announces |
|----------|----------|-----------|
| `MainLayout.vue` — connection badge | `polite` | "Connection status: Connected/Offline/Reconnecting" |
| `MainLayout.vue` — sr-only region | `assertive` | "Connection lost. Changes will be saved locally." / "Connection restored. Syncing changes." |
| `DiningPage.vue` — summary chips | `polite` | Dining count changes as toggles happen |
| `DiningPage.vue` — last synced | `polite` | "Last updated: X ago" / "Not yet synced" |

### Labels & Roles

| Element | ARIA | Purpose |
|---------|------|---------|
| Dining table | `aria-label="Dining status for N members"` | Table summary for screen readers |
| Status button | `aria-label="Dining — tap to change dining status for John Smith"` | Full context with member name |
| Status button | `aria-haspopup="menu"` | Indicates popup menu will open |
| Sync icons | `aria-label="Syncing changes"` / `"Queued for sync"` | Status icon descriptions |
| Loading states | `role="status"` + `q-spinner-dots` / `q-skeleton` | Announced without interrupting |
| Error banners | `role="alert"` + `q-banner type="negative"` | Immediately announced |
| Staleness warning | `role="alert"` + `q-banner` | "You are viewing cached data" |

---

## Elderly-Friendly Design (Ages 18–90+)

### Hit Targets

| Element | Size | WCAG Minimum |
|---------|------|-------------|
| Status button (`.status-chip`) | 44px × 160px | 44 × 44px (AA) |
| Status menu items | 48px height | 44 × 44px (AA) |
| Mobile status button | 40px × 145px | Acceptable — width compensates |

### Contrast (Verified)

| Status | Colour | Ratio | Passes |
|--------|--------|-------|--------|
| Dining | `green-9` (#2e7d32) on white text | > 4.5:1 | AA |
| Not Dining | `blue-grey-8` (#455a64) on white text | > 4.5:1 | AA |
| Undecided | `grey-7` (#616161) on white text | 4.52:1 | AA |

Design principle: status colours are calm and non-judgmental — blue-grey for "Not Dining" (neutral, not red/alarming), grey for "Undecided". No information conveyed by colour alone (all statuses include icon + text label).

### Interaction Simplicity

- **Click/tap only** — no swipe, long-press, or drag gestures
- **One-tap status change** — single button opens menu; one more tap to select
- **Progressive disclosure** — summary chips visible; full table below; status menu only on demand

### Text Scaling

- Page headings use `rem` units (2rem desktop, 1.5rem mobile)
- Lodge grid uses `auto-fill` with `minmax(340px, 1fr)` — reflows at 200% zoom
- No fixed-width containers that would cause horizontal scrolling

---

## Focus & Keyboard

- **Row highlight:** 2px primary outline on active row when status menu is open (`.row-active`)
- **Keyboard flow:** Tab → status button → Enter to open menu → Arrow keys → Enter to select → Escape to close
- **Screen-reader-only region:** `.sr-only` class in `MainLayout.vue` for connection announcements (hidden visually, exposed to assistive tech)
- **Quasar defaults:** QBtn, QMenu, QTable provide built-in keyboard handling and focus trap in menus

---

## Loading & Error States

| State | Pattern | Accessibility |
|-------|---------|---------------|
| Loading | `q-skeleton` placeholders | Preserves layout (no jumps); `role="status"` |
| Error | `q-banner type="negative"` | `role="alert"` — announced immediately |
| Staleness | `q-banner` after 5 min offline | `role="alert"` + `text-dark` on amber (contrast verified) |
| Sync toast | `Notify` plugin | "Synced N changes to the Festive Board" — transient feedback |

---

## Manual Testing

Two guides cover what automation can't:

- [Offline queue sync testing](manual-testing/offline-queue-sync.md) — 5 test cases for queue lifecycle
- [Accessibility manual testing](manual-testing/accessibility.md) — screen reader, keyboard, zoom, touch targets

---

## Known Gaps (Deferred)

| Gap | Status | Rationale |
|-----|--------|-----------|
| Skip-to-content link | Deferred | Flat routing under one layout; low impact for prototype scope |
| `aria-describedby` on form fields | Not yet applicable | No form fields in prototype; will add when forms arrive |
| `prefers-reduced-motion` | Not implemented | Animations are minimal (fade-in, spinner); low risk for motion sensitivity |
| Base font size increase (16px) | Deferred | Quasar's 14px default was difficult to override; `dense` removal improved readability |
