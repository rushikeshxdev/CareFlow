# CareFlow — Architectural Decision Records (ADRs)

---

## ADR 1: Modular Monolith Core Backend over Microservices

### Context
CareFlow needs clear domain boundaries for patients, providers, appointments, and care journeys, while keeping deployment straightforward and fast for portfolio evaluation.

### Decision
Implement a **Modular Monolith in NestJS** for all core business logic, paired with a separate **Python FastAPI microservice** dedicated to AI intent analysis.

### Rationale
- **Maintainability**: Keeps domain modules (`providers`, `appointments`, `availability`) loosely coupled inside a single repository.
- **Performance**: Eliminates inter-service HTTP overhead for core database operations while enabling AI model execution in Python's native ML ecosystem.
- **Interview Readiness**: Demonstrates domain-driven design without unnecessary distributed system complexity.

---

## ADR 2: Two-Tier Concurrency Strategy for Appointment Slot Locking

### Context
Preventing double-booking when multiple patients attempt to book the exact same slot at the exact same moment is a mandatory engineering requirement.

### Decision
Use a 2-tier concurrency lock strategy:
1. **Tier 1 (Redis Temporary Hold)**: Atomic `SETNX` with a 10-minute TTL to reserve slot holds fast during checkout.
2. **Tier 2 (PostgreSQL State & Optimistic Locking)**: PostgreSQL `$transaction` with state validation (`AVAILABLE` -> `HELD` -> `BOOKED`) and a `version` column check as the ultimate source of truth.

### Rationale
- Prevents database lock contention under high traffic while guaranteeing zero double-booking at confirmation time.

---

## ADR 3: Deterministic Provider Search & Ranking Scoring System

### Context
Provider search must rank healthcare providers fairly based on clear, explainable factors rather than opaque black-box AI algorithms.

### Decision
Implement a transparent deterministic scoring formula:
```
Score = (Specialty Match * 0.35) + (Rating Score * 0.25) + (Availability Score * 0.20) + (Experience Score * 0.10) + (Price Match * 0.10)
```

### Rationale
- **Explainability**: Every score can be audited and displayed transparently to the user.
- **Configurability**: Weights are easily tuned in code or configuration without model re-training.

---

## ADR 4: NestJS as the Business Rules Authority over AI Service

### Context
The AI service extracts patient intent and suggests specialties, but should not directly perform database operations or mutate patient state.

### Decision
NestJS receives structured JSON from FastAPI, validates all recommended parameters against the PostgreSQL database, and enforces business rules before presenting choices or creating appointments.

### Rationale
- Preserves security, data integrity, and strict separation between non-deterministic AI inference and deterministic healthcare business operations.
