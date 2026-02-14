# Architecture Gaps (Deferred)

## Authentication & RBAC

The architecture document does not yet describe how authentication and role-based access flow through the client.

**To address:**

- PocketBase RBAC with 2 roles: Lodge Secretary and Member
- Auth state management (token storage, session handling)
- Route guards and UI gating based on role
- How roles map to PocketBase collection rules

## Interactive Reconciliation

The overview identifies "Interactive Reconciliation" as a key capability, but the architecture's realtime sync diagram only mentions "conflict" without describing resolution.

**To address:**

- How conflicts are detected (version/timestamp comparison)
- How conflicts are surfaced to the Lodge Secretary
- UI pattern for manual resolution
- Reconciliation flow diagram
