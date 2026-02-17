# ADR-007: Histoire over Storybook for Component Showcase

**Status:** Accepted

**Date:** 2026-02-14

## Context

The project follows a container/presentational pattern (see [component design](../03_component_design.md)). Presentational components are the building blocks of the UI — props in, events out. A component showcase tool lets us:

- Develop components in isolation, outside page context
- Document component variants and states visually
- Provide a living reference for design review (hosted on Vercel)

The two serious options in the Vue ecosystem are **Histoire** and **Storybook**.

## Decision

**Use Histoire.**

### Why Histoire

- **Vue-native** — built specifically for Vue by the creator of Vue's official devtools. Stories are written as `.story.vue` files using `<script setup>` and Composition API — the same authoring model as the rest of the codebase. No framework-agnostic abstraction layer to learn
- **Vite-native** — shares the project's existing Vite config, plugins, and dependency resolution. HMR works instantly with no separate bundler process. Storybook adopted Vite as an option, but its architecture still wraps it behind its own build pipeline
- **Lightweight** — Histoire installs a fraction of the dependencies Storybook pulls in. For a prototype that values simplicity and fast CI, this matters. Fewer dependencies means fewer security advisories, fewer version conflicts with Quasar/Vue, and faster `pnpm install`
- **First-class Quasar support** — because Histoire uses the same Vite pipeline, Quasar components, SCSS variables, and plugins are available in stories without additional configuration. Storybook requires manual setup of Quasar's plugin system and global styles in its `preview.js`
- **Story format is just Vue** — no CSF (Component Story Format), no `args`/`argTypes` DSL to learn. A story file imports a component and renders it. Controls are standard Vue `ref()`s bound to props. This lowers the barrier for anyone who already knows Vue
- **Markdown docs built in** — documentation pages can live alongside stories as `.md` files, rendered within the same UI. Useful for documenting component design rationale without a separate docs site

### Where Storybook would have an edge

- **Ecosystem maturity** — Storybook has years of addons (a11y panel, design tokens, Figma integration, visual regression via Chromatic). Histoire's addon ecosystem is smaller
- **Cross-framework teams** — Storybook supports React, Angular, Svelte, and more. If the organisation had teams across frameworks, a shared tool would reduce context-switching. Not relevant here — this project is Vue-only
- **Visual regression testing** — Chromatic (Storybook's companion service) provides screenshot diffing out of the box. Histoire can achieve this with Playwright screenshots, but it requires more manual setup
- **Community and hiring** — Storybook is more widely known. New developers are more likely to have used it. For a prototype with a team of one (plus AI), this is a minor consideration

### Why the trade-offs are acceptable

- The prototype is Vue-only and Vite-only — Histoire's strengths align exactly with this stack
- Addon richness is a future concern, not a present one. The immediate need is isolated component development and a hosted showcase for review
- Accessibility testing is handled by axe-core in Playwright (see [ADR-006](ADR-006-test-mocking-strategy.md)), not by a Storybook addon
- Visual regression can be added later via Playwright screenshot comparisons if needed

## Consequences

- Stories are `.story.vue` files co-located with their components (e.g. `DiningCountCard.story.vue` alongside `DiningCountCard.vue`)
- Histoire is hosted as a separate Vercel deployment for design review
- If the project scales beyond a prototype and needs Chromatic-level visual regression, this decision should be revisited
