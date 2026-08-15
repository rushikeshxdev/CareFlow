# CareFlow — SDE Interview Preparation Guide & Rationale

This document provides concise, high-impact responses to technical interview questions about CareFlow's architecture, concurrency control, transaction boundaries, and system reliability.

---

## 1. Architecture & System Design

### Q1: Why did you choose a Modular Monolith over Microservices for the backend?
**Answer**:
> *"CareFlow prioritizes high transactional consistency (booking appointments, creating care journeys) and fast developer velocity. A modular monolith in NestJS provides clean module boundaries (`AuthModule`, `AppointmentsModule`, `CareJourneysModule`) and single-command deployment while avoiding network latency, distributed transactions (Saga/2PC overhead), and deployment complexity. If specific domains scale unevenly (e.g. notifications), BullMQ workers or modules can be extracted into microservices independently."*

### Q2: Why isolate the AI Service in FastAPI (Python) instead of keeping it in NestJS?
**Answer**:
> *"Python is the industry standard for LLM orchestration and AI tooling. Isolating AI logic in a FastAPI service provides strict schema validation via Pydantic, keeps heavy Python ML/AI dependencies isolated from the Node.js API runtime, and allows independent scaling of AI request handling without impacting core REST API response times."*

---

## 2. Concurrency & Data Consistency

### Q3: How does CareFlow prevent double-booking when 1,000 users try to book the same slot simultaneously?
**Answer**:
> *"CareFlow uses a 2-Tier Concurrency Lock:*
> 1. **Redis Atomic Lock**: During checkout, `POST /appointments/hold` uses Redis `SETNX` with a 10-minute TTL. Only one request succeeds in setting the key; concurrent requests fail fast with `409 Conflict` at the cache layer.
> 2. **PostgreSQL Transaction & Optimistic Locking**: During final booking (`POST /appointments`), PostgreSQL runs an ACID transaction verifying that `status = HELD` and `heldByPatientId = currentPatient`. If state checks fail, the transaction rolls back cleanly."*

### Q4: What happens if Redis goes down during a booking attempt?
**Answer**:
> *"PostgreSQL remains the ultimate source of truth. If Redis is temporarily unreachable, the system falls back to PostgreSQL transactional checks (`SELECT FOR UPDATE` or conditional status updates). Redis acts as a high-speed lock shield to prevent DB connection pool exhaustion."*

---

## 3. Asynchronous Processing & Queue Reliability

### Q5: Why is notification handling asynchronous via BullMQ instead of synchronous inside the booking request?
**Answer**:
> *"Sending emails/SMS or generating notifications involves network I/O and potential third-party delays. Making it synchronous inside `POST /appointments` would bloat API latency and risk rolling back a valid booking if notification delivery failed. By pushing jobs to BullMQ post-commit, the booking API completes in <50ms, while background workers handle notifications with retries and exponential backoff."*

### Q6: How do you handle idempotency and worker failures in BullMQ?
**Answer**:
> *1. **Post-Commit Enqueueing**: Jobs are pushed to BullMQ ONLY after the PostgreSQL transaction commits successfully.*
> *2. **State-Aware Workers**: Worker jobs carry only IDs. On execution, the worker fetches fresh data from PostgreSQL. If an appointment was cancelled, the worker suppresses the reminder.*
> *3. **Unique Deduplication Constraints**: Notifications use a database `dedupeKey` (e.g. `APPOINTMENT_CONFIRMED_{id}`). Retried jobs that attempt duplicate insertion hit PostgreSQL unique constraint protection and exit safely with `SKIPPED_DUPLICATE`."*

---

## 4. Security & Data Protection

### Q7: How does CareFlow secure authentication and prevent refresh token theft?
**Answer**:
> *"CareFlow implements single-use Refresh Token Rotation:*
> - Access tokens are short-lived (15 mins) and passed in Authorization headers.
> - Refresh tokens are stored in `HttpOnly`, `SameSite` cookies and saved as bcrypt hashes in PostgreSQL.
> - When a refresh token is used, it is revoked and replaced with a new token pair. If a revoked refresh token is reused, CareFlow flags potential theft, revokes all refresh tokens for that user, and forces re-authentication."*

### Q8: How is patient data privacy and resource ownership enforced?
**Answer**:
> *"All patient endpoints (`GET /appointments/:id`, `GET /care-journeys/:id`, `PATCH /notifications/:id/read`) extract the patient identity from the authenticated JWT token—never from request query or body parameters. Attempting to scan or access another patient's resource returns `404 Not Found` rather than `403 Forbidden`, preventing resource enumeration attacks."*

---

## 5. System Trade-offs & Future Scaling

### Q9: If CareFlow grew to 1,000,000 daily bookings, what would you change?
**Answer**:
> *1. **Database Sharding/Read Replicas**: Separate read queries (provider search, slots) to read-replicas while keeping write transactions on primary PostgreSQL.*
> *2. **Distributed Queue Cluster**: Scale BullMQ workers across dedicated Redis clusters with consumer group partitioning.*
> *3. **CDN Caching for Static Provider Metadata**: Cache specialty lists and provider bios at Edge nodes.*
