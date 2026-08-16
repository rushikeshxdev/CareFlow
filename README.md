<div align="center">

# 🩺 CareFlow

### AI-Powered Healthcare Discovery, Async Booking & Persistent Care Platform

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://care-flow-web-nine.vercel.app)
[![API Status](https://img.shields.io/badge/⚡_API_Status-Online-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://careflow-api-txwj.onrender.com/health)
[![API Docs](https://img.shields.io/badge/📖_Swagger_Docs-API_v1-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://careflow-api-txwj.onrender.com/api/docs)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![Next.js 14](https://img.shields.io/badge/Next.js_14-App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-v10.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Async_Queues-FF4500?style=for-the-badge&logo=redis&logoColor=white)](https://docs.bullmq.io/)

<p align="center">
  <b>CareFlow</b> is a production-deployed, enterprise-grade healthcare platform engineering solution featuring <b>natural language AI clinical intent extraction</b>, <b>deterministic multi-factor provider ranking</b>, <b>2-tier concurrency protection (Redis + PostgreSQL)</b>, <b>atomic care journey timelines</b>, and <b>BullMQ background queue worker processing</b>.
</p>

[🌐 Live System Links](#-live-production-deployments) • [🌟 Key Features](#-key-features--highlights) • [🏗️ System Architecture](#-system-architecture) • [💼 Recruiter & Technical Assets](#-recruiter--technical-interview-assets) • [🧪 Testing Suite](#-testing--verification-suite) • [🏛️ ADRs](#-architectural-decision-records-adrs)

---

</div>

## 🌐 Live Production Deployments

The platform is fully deployed and operational across production cloud infrastructure:

* 💻 **Web Application (Vercel)**: [https://care-flow-web-nine.vercel.app](https://care-flow-web-nine.vercel.app)
* ⚡ **Backend REST API (Render)**: [https://careflow-api-txwj.onrender.com](https://careflow-api-txwj.onrender.com)
* 📖 **Interactive Swagger API Docs**: [https://careflow-api-txwj.onrender.com/api/docs](https://careflow-api-txwj.onrender.com/api/docs)
* 🛡️ **API Health Endpoint**: [https://careflow-api-txwj.onrender.com/health](https://careflow-api-txwj.onrender.com/health)
* ⚙️ **Background Worker (Render)**: Dedicated BullMQ worker service with HTTP port `10001` health-monitoring interface.

---

## 🌟 Key Features & Highlights

### 1. 🤖 AI Natural Language Clinical Intent Extraction
* Accepts plain-text symptom descriptions and uses a FastAPI microservice (leveraging Google Gemini / structured JSON parsers) to extract clinical intent, urgency tier (`ROUTINE`, `URGENT`, `EMERGENCY`), key symptoms, and specialty matches.

### 2. 🎯 Deterministic Multi-Factor Provider Ranking
* Explanable, multi-factor scoring formula to rank healthcare providers dynamically without black-box AI bias:
  $$\text{Score} = (\text{Specialty Match} \times 0.40) + (\text{Rating} \times 0.25) + (\text{Slot Availability} \times 0.20) + (\text{Fee Alignment} \times 0.15)$$

### 3. 🔒 2-Tier High-Concurrency Protection (Zero Double-Booking)
* Prevents race conditions under high concurrent booking loads using a two-phase concurrency guard:
  * **Tier 1 (Checkout Lock)**: Redis atomic temporary hold (`SETNX` with a 10-minute TTL) per availability slot.
  * **Tier 2 (Database Constraint)**: PostgreSQL transactional state transition (`AVAILABLE` $\rightarrow$ `HELD` $\rightarrow$ `BOOKED`) with optimistic/pessimistic lock verification.

### 4. 🔗 Atomic Care Journey & Timeline Generation
* When an appointment is confirmed, PostgreSQL database transactions (`$transaction`) atomically create the `Appointment` record and seed a persistent `CareJourney` and initial `CareEvent` in a single ACID step—preventing partial state corruption.

### 5. ⚡ Asynchronous Eventual Consistency via BullMQ
* Post-commit background tasks (notifications, appointment reminders, expired hold cleanups) are offloaded to a dedicated **BullMQ background worker process** using Upstash Redis, keeping core REST API response times under 50ms.

### 6. 🛡️ Advanced Security & RBAC Isolation
* Single-use **JWT Refresh Token Rotation** stored in HttpOnly, SameSite cookies with automatic theft revocation.
* Resource-level patient identity binding and automatic `404 Not Found` masking on unauthorized cross-tenant resource scanning attempts.

---

## 🛠️ Production High-Scale Engineering Solves

> [!TIP]
> **Database Pool Exhaustion Solution (`EMAXCONNSESSION`)**: CareFlow handles serverless connection spikes by implementing a custom NestJS `PrismaService` runtime URL rewriter. All database connections are forced through the **Supabase Transaction Pooler (Port 6543)** with `pgbouncer=true` and strict connection limits, preventing `EMAXCONNSESSION` errors under horizontal container scaling.

> [!NOTE]
> **Worker Process Zero-Downtime Lifecycle**: The background worker process (`backend/api/src/worker.ts`) runs as an independent NestJS Application Context integrated with an auxiliary HTTP health server on Port `10001`, satisfying cloud port-scanning health checks without HTTP request overhead.

---

## 🏗️ System Architecture

```text
                               ┌──────────────────────────┐
                               │   Next.js 14 Web App     │
                               │  (Vercel Global Edge)    │
                               └────────────┬─────────────┘
                                            │ HTTPS / REST / HttpOnly Cookie Auth
                                            ▼
                               ┌──────────────────────────┐
                               │  NestJS Backend Monolith │
                               │     (Render Cloud API)   │
                               └─────┬───────────┬────────┘
                                     │           │
                 ┌───────────────────┴──┐     ┌──┴───────────────────┐
                 │ Supabase PostgreSQL  │     │  FastAPI AI Service  │
                 │ (Transaction Pooler) │     │    (services/ai)     │
                 └──────────────────────┘     └──────────────────────┘
                             ▲                           ▲
                             │                           │
                  ┌──────────┴──────────┐     ┌──────────┴───────────┐
                  │ Upstash Redis Cache │     │ Google Gemini API /  │
                  │  & BullMQ Engine    │     │   Pydantic Parser    │
                  └──────────┬──────────┘     └──────────────────────┘
                             │
                             ▼
                ┌─────────────────────────┐
                │  BullMQ Worker Process  │
                │     (src/worker.ts)     │
                └─────────────────────────┘
```

## 🧪 Testing & Verification Suite

CareFlow maintains high code coverage with dedicated automated testing suites in `backend/api/test/`:

```bash
# 1. Run Unit Tests (Fast execution)
npm test

# 2. Run Security & Ownership Isolation Tests (RBAC, JWT rotation, 404 scanning guard)
npm run test:security

# 3. Run Care Journey Transaction Tests (Postgres ACID atomicity & rollback)
npm run test:integration

# 4. Run Concurrent Slot Protection Tests (Race condition & double-booking prevention)
npm run test:concurrency

# 5. Run BullMQ Queue & Worker Tests (Idempotency, retries, deduplication)
npm run test:queues

# 6. Run Complete End-to-End User Journey Tests
npm run test:e2e
```

---

## 🏛️ Architectural Decision Records (ADRs)

| ADR | Title | Technical Summary & Rationale |
| :--- | :--- | :--- |
| **ADR 1** | **Modular Monolith Architecture** | NestJS domain modules maintain high developer velocity while preserving strict bounded contexts for easy microservice splitting. |
| **ADR 2** | **PostgreSQL as Single Source of Truth** | Relational integrity and ACID transactions guarantee consistent appointment state and financial-grade booking records. |
| **ADR 3** | **Redis + Postgres 2-Tier Concurrency Lock** | Combines 10-minute temporary `SETNX` checkout locks in Redis with PostgreSQL transactional status constraints to prevent double-booking. |
| **ADR 4** | **Isolated FastAPI Python AI Microservice** | Isolates Python AI dependencies (Google Gemini, Pydantic) from the Node.js API runtime, enabling independent scaling. |
| **ADR 5** | **Deterministic Multi-Factor Provider Ranking** | Algorithmic scoring algorithm combining specialty relevance, rating, slot availability, and fee alignment without unexplainable AI bias. |
| **ADR 6** | **Single-Use Refresh Token Rotation** | HttpOnly, SameSite cookies with instant token theft detection and automatic session revocation. |
| **ADR 7** | **Patient Resource Isolation & Scanning Guard** | Automatic patient ID binding with `404 Not Found` masking on unauthorized cross-tenant resource access attempts. |
| **ADR 8** | **Atomic CareJourney Integration** | Single `$transaction` creates `Appointment` and seeds `CareJourney` and `CareEvent` records simultaneously. |
| **ADR 9** | **BullMQ Eventual Consistency Queues** | Post-commit job offloading ensures core HTTP response latency remains under 50ms. |
| **ADR 10** | **Worker DB State Awareness & Idempotency** | Workers re-fetch fresh DB state before processing and enforce unique `dedupeKey` constraints for at-most-once execution. |

---

## 💻 Local Quickstart & Development

### Prerequisites
* **Node.js**: `v20.0.0` or higher
* **Python**: `v3.11` or higher
* **Docker & Docker Compose** (Optional for local Postgres 16 & Redis 7)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/rushikeshxdev/CareFlow.git
cd CareFlow
cp .env.example .env
npm install
```

### 2. Database Migration & Seeding
```bash
# Push database migrations
npx prisma migrate deploy

# Seed 30 synthetic providers and availability slots
npm run db:seed
```

### 3. Launch Development Services
```bash
# Start Backend REST API (Port 3001)
npm run dev:backend

# Start Background Worker Process
npm run start:worker --workspace=backend/api

# Start Web App (Port 3000)
npm run dev:web
```

---

## 🛡️ Medical & Safety Disclaimer

> [!IMPORTANT]
> CareFlow is designed strictly as an **informational care discovery and decision support platform**. It does **NOT** diagnose medical conditions, issue prescriptions, or replace clinical consultation with licensed medical professionals. If you are experiencing a medical emergency, please contact your local emergency services immediately.

---

<div align="center">
  <sub>Built with ❤️ by <b>Rushikesh</b> | CareFlow Engineering Solutions</sub>
</div>
