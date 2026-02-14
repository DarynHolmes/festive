### 1. User Story (Ecosystem)
"As a Lodge Secretary, I want a robust, type-safe foundation for the Admin SPA, so that I can manage Lodge data with zero latency and high reliability even in historic buildings with poor connectivity."

### 2. Acceptance Criteria (The Definition of Done)
* **Quasar SPA (Vue/TS):** Initialize a Quasar 2 (Vue 3) project using Vite and TypeScript. The layout must utilize `QLayout` and `QPage` to ensure a responsive, "app-like" feel on both desktop and tablet.

* **State Management:** Configure Pinia for global state and integrate `pinia-colada` for handling asynchronous server state, ensuring we have a "single source of truth" for the dining counts.

* **PocketBase Sync:** Establish a connection to the PocketBase v0.36 instance. Define the initial `lodges` and `dining_records` collections with Realtime Subscriptions enabled to allow the UI to react instantly to data changes. For development we will use the locally running pocketbase in the pocketbase_0.36.3 folder. For prod and remote staging we will use instances on pocket host, use placeholder config for now. Ensure that you use env files. 

* **Quality & Accessibility:** Configure Playwright with an initial `axe-core` injection to automate WCAG 2.2 AA audits from day one. Define a Zod schema for "Member Entry" to prevent malformed data from hitting the API.
* **Compliance:** Satisfies Job Spec requirements for Vue/TypeScript implementation, SPA architecture, and automated testing.

### 3. Technical Edge Cases & Resilience
* **Connectivity:** Implement a "Connection Status" indicator. Since many Lodges are in basement meeting rooms with thick stone walls, the SPA must gracefully handle WebSocket reconnections without losing UI state.
* **Concurrency:** Use Pinia to implement "Optimistic Updates." When a Secretary marks a member as "Dining," the UI should update immediately while the request processes in the background.
* **Legacy Hardware:** Ensure the Vite build target includes support for older Chromium-based browsers often found on aging Lodge laptops.