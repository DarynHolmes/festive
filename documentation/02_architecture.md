# Technical Architecture

**Decisions:** See [ADRs](decisions/) for rationale behind each technology choice.

---

## System Context

```mermaid
graph LR
    Admin[Admin SPA<br/>Vue + Quasar]
    Participant[Participant App<br/>Deferred]
    PB[PocketBase v0.36]
    PH[PocketHost<br/>Managed hosting]
    Local[Local PocketBase<br/>Dev only]
    Vercel[Vercel<br/>Static hosting]
    GH[GitHub Actions<br/>CI/CD]

    Admin -->|REST + Realtime SSE| PB
    Participant -.->|Deferred| PB
    PB --- PH
    PB --- Local
    Admin --- Vercel
    GH -->|Tests + Lint| Admin
    GH -->|E2E against| PB
```

**Phase 1 scope:** Admin SPA only. Participant app is deferred.

---

## Client-Side Architecture

```mermaid
graph TD
    Pages[Pages<br/>Smart / thick]
    Components[Components<br/>Dumb / slim]
    Composables[Composables<br/>use* functions]
    Stores[Pinia Stores<br/>Global state]
    Colada[Pinia Colada<br/>Async state]
    Services[Services<br/>PocketBase client]
    Schemas[Zod Schemas<br/>Validation]
    SW[Service Worker<br/>vite-plugin-pwa]
    Queue[Offline Queue<br/>IndexedDB]

    Pages --> Components
    Pages --> Composables
    Composables --> Stores
    Composables --> Colada
    Colada --> Services
    Services --> Schemas
    SW --> Queue
    Queue --> Services
```

### Layer responsibilities

| Layer | Role | Example |
|-------|------|---------|
| **Pages** | Fetch data, orchestrate state, handle routing | `DiningDashboardPage.vue` |
| **Components** | Render props, emit events, no direct data access | `DiningCountCard.vue` |
| **Composables** | Encapsulate reusable logic (subscriptions, sync) | `useDiningSync()` |
| **Stores** | Global reactive state | `useDiningStore` |
| **Pinia Colada** | Server state caching, mutations, optimistic updates | Query/mutation definitions |
| **Services** | PocketBase SDK wrapper, repository-light pattern | `diningService.ts` |
| **Schemas** | Zod validation at system boundaries | `memberEntrySchema` |
| **Service Worker** | Asset caching, offline queue replay | Workbox via vite-plugin-pwa |

---

## Data Flow: Realtime Sync

```mermaid
sequenceDiagram
    participant UI as Admin UI
    participant Store as Pinia Store
    participant PB as PocketBase
    participant Q as Offline Queue

    Note over UI,PB: Online flow
    UI->>Store: User marks member as dining
    Store->>UI: Optimistic update (instant)
    Store->>PB: Mutation via service layer
    PB-->>Store: Confirmation / conflict
    Store->>UI: Confirm or rollback

    Note over UI,Q: Offline flow
    UI->>Store: User marks member as dining
    Store->>UI: Optimistic update (instant)
    Store->>Q: Enqueue mutation
    Note over Q: Stored in IndexedDB
    Q->>PB: Replay on reconnect
    PB-->>Store: Confirm / conflict
    Store->>UI: Reconcile
```

---

## Data Model (Phase 1)

```mermaid
erDiagram
    LODGES {
        string id PK
        string name
        string province
        string meeting_location
    }
    MEMBERS {
        string id PK
        string lodge_id FK
        string name
        string role "Administrator | Participant"
        string email
    }
    DINING_RECORDS {
        string id PK
        string lodge_id FK
        string member_id FK
        string meeting_date
        string status "dining | not_dining | undecided"
        datetime updated_at
        string updated_by FK
    }

    LODGES ||--o{ MEMBERS : has
    LODGES ||--o{ DINING_RECORDS : tracks
    MEMBERS ||--o{ DINING_RECORDS : reports
```

Collections map to PocketBase tables. The service layer transforms PocketBase records into typed domain objects (repository-light pattern — see [ADR-002](decisions/ADR-002-pocketbase.md)).

---

## Deployment

| Environment | App Hosting | Backend | Purpose |
|-------------|-------------|---------|---------|
| **Dev** | `localhost:9000` (Quasar dev) | Local PocketBase (`pocketbase_0.36.3/`) | Development |
| **Staging** | Vercel (preview deploys) | PocketHost instance | PR previews, CI E2E |
| **Production** | Vercel | PocketHost instance | Demo / review |

**CI pipeline:** GitHub Actions → install → lint → unit tests → E2E (Playwright against PocketHost) → deploy preview.

**Histoire:** Component showcase hosted separately on Vercel for design review.
