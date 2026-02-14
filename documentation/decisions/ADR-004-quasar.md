# ADR-004: Quasar as Component Framework

**Status:** Accepted
**Date:** 2026-02-14

## Context

The UGLE job spec mentions "utility-based CSS frameworks" and requires building accessible, responsive interfaces for both SPA and PWA. The UGLE membership spans ages 18-90+, making accessibility and usability non-negotiable.

Alternatives considered: Vuetify 3, PrimeVue, headless UI (Radix Vue / Headless UI) + Tailwind.

## Decision

**Quasar Framework v2 with Vite build mode.**

### Why Quasar

- **All-in-one** — layout system (`QLayout`, `QDrawer`, `QPage`), form components, dialogs, notifications, and platform detection in a single dependency
- **Accessibility baseline** — Quasar components ship with keyboard navigation, ARIA attributes, and focus management. Not perfect (custom ARIA work is still needed — see [accessibility strategy](../04_accessibility.md)), but a strong foundation
- **Responsive by default** — built-in breakpoint system and responsive utilities; critical for an app used on aging Lodge laptops and modern tablets alike
- **PWA mode** — native `quasar dev -m pwa` support, though we use `vite-plugin-pwa` for finer control over service worker behaviour
- **Material Design** — familiar visual language; reduces cognitive load for Lodge Secretaries with varying technical literacy
- **Treeshakeable** — only imports used components; keeps bundle size manageable

### Why not the alternatives

- **Vuetify 3** — strong contender, but heavier bundle and less mature PWA tooling. Accessibility story is comparable
- **PrimeVue** — rich component library but less opinionated about layout; would require additional layout scaffolding
- **Headless UI + Tailwind** — maximum flexibility, but requires building every component's visual design from scratch. For a prototype, pre-styled components are more pragmatic. Tailwind would also diverge from UGLE's "utility-based CSS frameworks" context (Quasar uses utility classes too)

### Accessibility gaps to address

Quasar provides a baseline, but the following require manual attention:
- `aria-describedby` on form error messages (Quasar uses visual-only error indicators by default)
- Skip-to-content links (not provided by `QLayout`)
- Custom focus trap management in modals/dialogs for screen readers
- Colour contrast verification — Quasar's default theme may not meet 4.5:1 ratio everywhere

## Consequences

- Tied to Quasar's component API and design system; migration to another framework would be significant
- Quasar's opinionated structure reduces choice but accelerates development — appropriate for a prototype
- Must supplement Quasar's accessibility with custom ARIA and testing (axe-core in Playwright)
