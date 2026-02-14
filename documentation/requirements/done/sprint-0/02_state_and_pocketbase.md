### 1. User Story
"As a Lodge Secretary, I want a single source of truth for dining data backed by a real-time database, so that attendance counts are always current and consistent."

### 2. Acceptance Criteria

* **Pinia Store Configuration:** Install and configure Pinia as the global state management solution. Create an initial store skeleton (e.g., `useLodgeStore`) to confirm the integration works end-to-end with Vue's devtools.

* **pinia-colada Integration:** Install and configure `pinia-colada` for managing asynchronous server state (queries and mutations). If pinia-colada proves insufficient during implementation, fall back to Vue Query as noted in project guidelines.

* **PocketBase Client:** Create a PocketBase client service (`src/services/pocketbase.ts`) that:
  - Reads the instance URL from the environment variable (`VITE_POCKETBASE_URL`)
  - Exports a typed, reusable client instance
  - Supports both local development and PocketHost deployment without code changes

* **Collection Definitions:** Define the following collections in PocketBase (via the admin UI or migration scripts):
  - **`lodges`** — represents a Lodge entity (fields TBD as data model evolves)
  - **`dining_records`** — represents an individual dining attendance record linked to a lodge

* **Realtime Subscriptions:** Wire up PocketBase's Realtime Subscriptions so that changes to `lodges` and `dining_records` are pushed to the client. Confirm that a subscription can be opened and that incoming events are logged or reflected in the Pinia store.

### 3. Technical Notes
* The PocketBase instance for local development lives in `pocketbase_0.36.3/`. Document how to start it in a brief README or script.
* Collection schemas will evolve — define the minimum viable fields now, iterate in later tasks.
* pinia-colada is young; document any limitations encountered and whether the Vue Query fallback was needed.
