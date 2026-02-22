# Accessibility Strategy

**Standard:** WCAG 2.2 AA

**Membership:** Ages 18–90+, varying technical literacy, diverse devices

Accessibility is not a feature — it's a constraint that shapes every design and implementation decision.

---

## Design Principles for an Elderly-Friendly UI

| Principle | Specification | Rationale |
|-----------|--------------|-----------|
| Large hit targets | Min 44×44px for all interactive elements | Reduced motor precision in older Members |
| Simple interactions | Click/tap only — no swipe, long-press, or drag | Complex gestures exclude Members with limited dexterity |
| High contrast | Min 4.5:1 for text, 3:1 for large text and UI elements | Age-related vision changes reduce contrast sensitivity |
| Text scaling | Layout must not break at 200% browser font size | Members with low vision rely on browser zoom |
| Clear feedback | Visible focus indicators, loading states, success/error confirmations | Reduces uncertainty and cognitive load for less technical Members |
| Progressive disclosure | Show essential actions first; reveal complexity on demand | Prevents overwhelming users with information |

---

## Automated Enforcement

### axe-core in Playwright

Every E2E test injects axe-core to catch accessibility violations as regressions. This runs in CI — violations fail the build.

```typescript
// Actual pattern: uses makeAxeBuilder fixture from e2e/fixtures.ts
import { test, expect } from './fixtures';

test('default page has no WCAG 2.2 AA violations', async ({ page, makeAxeBuilder }) => {
  await page.goto('/');
  const results = await makeAxeBuilder().analyze();
  expect(results.violations).toEqual([]);
});
```

The `makeAxeBuilder` fixture pre-configures axe-core with WCAG 2.2 AA tags and excludes the Vite checker overlay.

### CI gate

GitHub Actions runs accessibility audits on every PR. No merge with open violations.

---

## Quasar Accessibility Baseline

Quasar components provide a reasonable starting point, but several gaps require manual attention:

### What Quasar provides out of the box

- Keyboard navigation on interactive components (buttons, inputs, selects)
- Basic ARIA roles on layout components (`QDrawer`, `QDialog`)
- Focus trap in dialogs
- Screen-reader-compatible form components

### Where we must supplement

| Gap | Solution |
|-----|----------|
| Form error messages not linked to inputs | Add `aria-describedby` pointing to error message `id` on every form field |
| No skip-to-content link | Add custom skip link in `QLayout` header — visible on focus |
| Connection status not announced | Use `aria-live="polite"` region for online/offline status changes |
| Dining count changes | Use `aria-live="polite"` to announce Festive Board count updates to screen readers |
| Colour contrast in default theme | Audit and override Quasar's default palette; enforce 4.5:1 minimum |
| Custom focus indicators | Override browser defaults with visible, high-contrast focus rings (not just colour change) |

---

## Manual Audit Checklist

Automated tests catch ~30-40% of accessibility issues. These manual checks cover the rest:

- [ ] **Keyboard navigation:** Every interactive element is reachable and operable via keyboard alone (Tab, Enter, Space, Escape, Arrow keys)
- [ ] **Focus order:** Tab order follows visual layout; no focus traps outside of modals
- [ ] **Screen reader:** Test with VoiceOver (macOS) — all content is announced, interactive elements have labels, state changes are communicated
- [ ] **Zoom:** Layout remains usable at 200% browser zoom with no horizontal scrolling
- [ ] **Colour only:** No information conveyed by colour alone (e.g., error states use icon + text, not just red border)
- [ ] **Touch targets:** Verify 44×44px minimum on mobile viewport
- [ ] **Motion:** Respect `prefers-reduced-motion` — disable animations for Members who opt out

---

## Testing at Each Level

| Level | What we test | Tool |
|-------|-------------|------|
| **Component** | Props render correct ARIA attributes; keyboard interactions work | Vitest unit tests |
| **Page** | Full page passes axe-core audit; focus management on navigation | Playwright E2E + axe-core |
| **Application** | End-to-end keyboard-only workflow; screen reader compatibility | Manual audit (pre-release) |

---

## Reference

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/?levels=aaa)
- [Quasar Accessibility](https://quasar.dev/start/accessibility)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
