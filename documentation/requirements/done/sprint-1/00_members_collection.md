New Requirement: Members Collection
Epic: Foundation / Data Model
Priority: Critical (Blocker for Sprint 1)

Context
Sprint 0 implementation relied on a plain text member_id in the dining_records collection. To support the Festive Board Manager user story ("As a Lodge Secretary..."), the system must display human-readable names and ranks, not just database IDs.

User Story
"As a System Administrator, I want a dedicated members collection in PocketBase that links to specific Lodges, so that the frontend can display accurate Rosters and Dining Lists with correct Masonic titles."

Schema Definition
Field,Type,Required,Notes
id,text (auto),Yes,Primary Key
lodge_id,relation,Yes,Relation to lodges collection (Single select)
first_name,text,Yes,
last_name,text,Yes,
rank,select,Yes,"Values: Bro, W Bro, VW Bro, RW Bro (Required for Table Plans)"
status,select,Yes,"Values: active, honorary, resigned"

Acceptance Criteria

Collection Created: The members collection exists in PocketBase with the fields defined above.

Relation Established: The lodge_id correctly enforces a relationship to the existing lodges collection.

Seed Data: At least 5 dummy members are created for the test Lodge to facilitate Sprint 1 UI development.

API Rules: Read access is granted to authenticated users (consistent with lodges rules).