# CareFlow — Curer Software Developer Intern Requirements Mapping

This document maps CareFlow's technical implementation against the core expectations of a Software Developer Engineering Intern position at Curer.

---

## Technical Skill Mapping Table

| Curer Internship Expectation | CareFlow Architectural Feature | Evidence & Code Location |
| :--- | :--- | :--- |
| **Node.js & Backend Architecture** | NestJS Modular Monolith with 12 domain modules, DTO validation, and Swagger OpenAPI docs. | [`backend/api/src/app.module.ts`](file:///d:/CareFlow/backend/api/src/app.module.ts) |
| **Python Development** | FastAPI AI microservice with Pydantic schema validation and Google Gemini LLM integration. | [`services/ai/main.py`](file:///d:/CareFlow/services/ai/main.py) |
| **Database Design & ORM** | PostgreSQL relational modeling with Prisma ORM, version-controlled migrations, and atomic ACID transactions. | [`prisma/schema.prisma`](file:///d:/CareFlow/prisma/schema.prisma) |
| **Redis & Concurrency Control** | 2-Tier Concurrency Protection using Redis `SETNX` atomic locks for 10-minute temporary checkout holds. | [`backend/api/src/common/redis.service.ts`](file:///d:/CareFlow/backend/api/src/common/redis.service.ts) |
| **Asynchronous & Queue Systems** | Eventual consistency BullMQ queue processing for post-commit notifications, reminders, and cleanup. | [`backend/api/src/infrastructure/queues/queue-producer.service.ts`](file:///d:/CareFlow/backend/api/src/infrastructure/queues/queue-producer.service.ts) |
| **Authentication & Security** | Single-use JWT refresh token rotation with `HttpOnly` cookies, bcrypt hashing, and ownership isolation. | [`backend/api/src/modules/auth/auth.service.ts`](file:///d:/CareFlow/backend/api/src/modules/auth/auth.service.ts) |
| **AI-Assisted Integration** | LLM symptom-to-specialty intent extraction with fallback normalization to backend database authority. | [`backend/api/src/modules/ai-orchestration/ai-orchestration.service.ts`](file:///d:/CareFlow/backend/api/src/modules/ai-orchestration/ai-orchestration.service.ts) |
| **Modern Frontend Engineering** | Next.js 14 App Router, Server/Client components, dynamic booking interface, and care timeline visualizer. | [`apps/web/src/app/my-care/page.tsx`](file:///d:/CareFlow/apps/web/src/app/my-care/page.tsx) |
| **Containerization & CI/CD** | Multi-stage production Dockerfiles for NestJS, Worker, FastAPI, Next.js, and GitHub Actions CI workflow. | [`.github/workflows/ci.yml`](file:///d:/CareFlow/.github/workflows/ci.yml) |
| **Production Readiness & Testing** | Comprehensive unit, security, integration, concurrency, queue, and E2E test suites with CLI harness. | [`backend/api/test/`](file:///d:/CareFlow/backend/api/test/) |

---

## Core Product Journey Evidence

```text
1. Natural Language Intent -> FastAPI AI Service parses symptoms ("Chest pain") -> Cardiology recommendation
2. Provider Search & Ranking -> Deterministic scoring balances specialty, rating, experience, and fee
3. Slot Holding -> Redis SETNX locks slot for 10 minutes (Concurrency Protection)
4. Booking -> PostgreSQL transaction confirms appointment & seeds CareJourney timeline
5. Eventual Consistency -> BullMQ Worker creates notification without blocking booking API latency
6. Care Timeline -> Patient views persistent care journey and real-time notification bell on /my-care
```

---

## Conclusion
CareFlow demonstrates a complete, production-grade healthcare application showcasing proficiency across backend engineering, database modeling, AI integration, concurrency control, system security, and containerized deployment.
