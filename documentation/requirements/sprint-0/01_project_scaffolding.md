### 1. User Story
"As a Lodge Secretary, I want the Admin SPA scaffolded with a responsive, type-safe foundation so that all subsequent features are built on a consistent, reliable base."

### 2. Acceptance Criteria

* **Quasar 2 + Vite + TypeScript:** Initialize a Quasar 2 (Vue 3) project using Vite as the build tool and TypeScript throughout. No `any` types in scaffolded code.

* **Responsive Layout Shell:** Create a root layout using `QLayout` with a `QHeader`, `QDrawer`, and `QPageContainer`. Include a default `QPage` placeholder to confirm the layout renders correctly on both desktop and tablet viewports.

* **Environment Configuration:** Set up `.env.development`, `.env.production`, and `.env.staging` files. Define at minimum `VITE_POCKETBASE_URL` with appropriate values:
  - Development: local PocketBase instance (`http://127.0.0.1:8090`)
  - Production/Staging: PocketHost placeholder URLs

* **Legacy Browser Support:** Configure the Vite build target to support older Chromium-based browsers (e.g., Chrome 80+) commonly found on aging Lodge laptops.

* **Project Structure:** Establish folder conventions aligned with Quasar defaults and the project's architectural principles (container pages, presentational components):
  - `src/pages/` — container pages that fetch data and orchestrate state
  - `src/components/` — presentational components using props/emits
  - `src/composables/` — shared composition functions
  - `src/stores/` — Pinia stores
  - `src/services/` — backend client wrappers
  - `src/schemas/` — Zod validation schemas

### 3. Technical Notes
* Add `.env*` patterns to `.gitignore` (except `.env.example` templates).
* The layout shell is structural only — no business logic or data fetching in this task.
