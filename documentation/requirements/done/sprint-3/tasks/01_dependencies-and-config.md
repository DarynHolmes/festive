# Task 1: Dependencies & Config

## Summary

Install `idb` for IndexedDB access, `fake-indexeddb` for unit testing, and enable Quasar's Notify plugin for toast notifications.

## Work

1. `pnpm add idb` — thin, typed IndexedDB wrapper (~1.2KB gzipped)
2. `pnpm add -D fake-indexeddb` — in-memory IndexedDB polyfill for vitest
3. In `quasar.config.ts`, add `'Notify'` to the `plugins: []` array

## Files

| File | Action |
|------|--------|
| `package.json` | Add dependencies |
| `quasar.config.ts` | Add Notify plugin |

## Verification

- [ ] `pnpm install` completes without errors
- [ ] `pnpm dev` starts the dev server successfully
- [ ] `pnpm build` produces a clean build
- [ ] In the browser console, `Quasar.Notify` is available (or verify via Vue Devtools)
