### 1. User Story
"As a Lodge Secretary, I want automated quality and accessibility checks built into the project from day one, so that the application is reliable and usable by members of all ages and abilities."

### 2. Acceptance Criteria

* **Playwright Configuration:** Install and configure Playwright as the end-to-end test runner. Include a minimal smoke test that loads the SPA and confirms the layout shell renders.

* **axe-core Accessibility Audits:** Inject `axe-core` into the Playwright test setup to automate WCAG 2.2 AA compliance checks. Create an initial accessibility test that:
  - Loads the default page
  - Runs an axe-core scan
  - Fails the test if any WCAG 2.2 AA violations are detected

* **Zod Validation Schema:** Define an initial Zod schema for "Member Entry" in `src/schemas/`. The schema should validate the minimum fields required to record a member's dining status (e.g., member identifier, dining flag). This prevents malformed data from reaching the API.

### 3. Technical Notes
* The axe-core integration should be reusable — create a helper or fixture so future tests can run accessibility audits with a single function call.
* The Zod schema is intentionally minimal at this stage; it will expand as the data model matures.
* Align Playwright config with the project's testing philosophy: meaningful tests, not coverage for coverage's sake.
