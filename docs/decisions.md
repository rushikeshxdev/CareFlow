# CareFlow — Architectural Decision Records (ADRs)

This document records the architectural decision records (ADRs) guiding CareFlow's platform design.

---

## ADR 1: Modular Monolith Core Backend over Microservices
- **Context**: CareFlow requires clean domain boundaries for users, patients, providers, appointments, care journeys, and notifications.
- **Decision**: Implement a **Modular Monolith in NestJS** for core business logic, paired with an isolated **Python FastAPI microservice** for AI intent analysis.
- **Rationale**: Eliminates network latency overhead for core database operations, preserves ACID transactions, and simplifies deployment while keeping domains decoupled inside NestJS modules.

---

## ADR 2: PostgreSQL as Single Source of Truth
- **Context**: Medical appointments and patient care journeys require strict relational integrity and transactional guarantees.
- **Decision**: Use PostgreSQL 16 managed via Prisma ORM as the single source of truth for all persistent entities.
- **Rationale**: Provides relational integrity, cascading foreign keys, schema migrations, and ACID transaction boundaries.

---

## ADR 3: 2-Tier Concurrency Strategy for Appointment Slot Locking
- **Context**: Prevent double-booking when concurrent users select the exact same slot simultaneously.
- **Decision**: Implement a 2-tier lock:
  1. **Tier 1 (Redis Temporary Hold)**: Fast atomic `SETNX` lock with 10-minute TTL during checkout.
  2. **Tier 2 (PostgreSQL Transaction)**: Atomic `$transaction` validating `status = HELD` and `version` increment.
- **Rationale**: Offloads high-frequency reservation locks to Redis memory while preserving PostgreSQL as the ultimate transactional authority.

---

## ADR 4: FastAPI Python Microservice Isolation for AI Orchestration
- **Context**: LLM inference and symptom-to-specialty intent extraction require Python machine learning libraries.
- **Decision**: Isolate AI intent extraction inside a standalone Python FastAPI service using Pydantic schemas.
- **Rationale**: Keeps heavy Python ML dependencies separate from Node.js runtime and permits independent scaling of AI request handling.

---

## ADR 5: Deterministic Provider Search & Ranking Scoring System
- **Context**: Provider discovery requires fair, explainable ranking without black-box bias.
- **Decision**: Implement a weighted multi-factor scoring algorithm:
  $$\text{Score} = (\text{Specialty} \times 0.35) + (\text{Rating} \times 0.25) + (\text{Availability} \times 0.20) + (\text{Experience} \times 0.10) + (\text{Price} \times 0.10)$$
- **Rationale**: Provides transparent, audit-ready provider rankings with zero black-box bias.

---

## ADR 6: Single-Use Refresh Token Rotation & Theft Detection
- **Context**: Session management must prevent refresh token theft and long-lived access token exposure.
- **Decision**: Store short-lived access tokens in memory and long-lived refresh token hashes in `HttpOnly`, `SameSite` cookies. On token refresh, rotate the token and revoke old hashes.
- **Rationale**: Detecting reuse of an old refresh token immediately revokes all user sessions, mitigating token theft attacks.

---

## ADR 7: Patient Resource Ownership & Resource Scanning Protection
- **Context**: Prevent unauthorized access or resource enumeration across patient accounts.
- **Decision**: Automatically bind authenticated patient ID from JWT claims to all database queries. Cross-patient requests return `404 Not Found` rather than `403 Forbidden`.
- **Rationale**: Prevents resource scanning and identity impersonation while preserving privacy.

---

## ADR 8: Atomic CareJourney Lifecycle Integration
- **Context**: Appointments must seamlessly generate persistent patient care timelines.
- **Decision**: Confirming an appointment executes an atomic PostgreSQL transaction that updates slot status to `BOOKED`, creates the `Appointment` record, and automatically creates a `CareJourney` and `CareEvent`.
- **Rationale**: Guarantees zero orphaned appointments without a care journey timeline.

---

## ADR 9: BullMQ Eventual Consistency Queues for Background Tasks
- **Context**: Sending notifications or scheduling reminders should not delay the critical appointment booking API response.
- **Decision**: Enqueue notification and reminder jobs to BullMQ Redis queues post-commit, executed asynchronously by a standalone worker process.
- **Rationale**: Keeps booking API response times <50ms and isolates background I/O failures from primary booking transactions.

---

## ADR 10: Worker DB State Awareness & Idempotent Execution
- **Context**: Delayed queue jobs (e.g. reminders) must not act on stale data (e.g. cancelled appointments).
- **Decision**: BullMQ jobs carry only entity IDs. Upon execution, the worker fetches fresh data from PostgreSQL. Notifications use unique `dedupeKey` database constraints.
- **Rationale**: Ensures workers never send stale reminders for cancelled appointments and prevents duplicate notification creation during job retries.
