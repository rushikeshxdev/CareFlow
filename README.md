<div align="center">

# 🩺 CareFlow

### AI-Powered Healthcare Discovery, Async Booking & Persistent Care Platform

[![NestJS](https://img.shields.io/badge/NestJS-v10.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js_14-App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16.0-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-v7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Async_Queues-FF4500?style=for-the-badge&logo=redis&logoColor=white)](https://docs.bullmq.io/)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<p align="center">
  <b>CareFlow</b> is an enterprise-grade healthcare platform featuring natural language AI intent extraction, deterministic provider ranking, 2-tier concurrency protection, atomic care journey timelines, single-use JWT refresh token security, and BullMQ background queue processing.
</p>

[Key Architecture](#-system-architecture) • [Recruiter & Interview Assets](#-recruiter--interview-assets) • [Testing & Verification](#-testing--verification-suite) • [Quickstart Guide](#-quickstart--local-setup) • [ADRs](#-architectural-decision-records-adrs)

---

</div>

## 🌟 Executive Overview

**CareFlow** transforms complex medical care discovery into an integrated, reliable patient journey:

1. **AI Natural Language Clinical Intent Analysis**: Accepts plain-text symptom descriptions and uses FastAPI + Gemini/Mock providers to output structured clinical intent, urgency level, and specialty recommendations.
2. **Deterministic Provider Search & Ranking**: Transparency-first multi-factor scoring formula balancing specialty match, rating, slot availability, experience, and fee alignment.
3. **2-Tier Concurrency Protection**: High-performance concurrency lock combining **Redis atomic temporary slot holding** (`SETNX` with 10-min TTL) and **PostgreSQL transactional state constraints** (`AVAILABLE` -> `HELD` -> `BOOKED`).
4. **Transactional Care Journey Lifecycle**: Confirmed appointments automatically seed a persistent `CareJourney` and `CareEvent` timeline inside PostgreSQL in a single atomic transaction.
5. **Eventual Consistency BullMQ Queues**: Asynchronous post-commit background job processing for instant notification creation, reminder scheduling, and concurrency-aware slot cleanup.
6. **Authentication & RBAC**: JWT access tokens, HttpOnly refresh token rotation with single-use revocation, and resource-level patient ownership isolation.

---

## 🏗️ System Architecture

```text
                               ┌──────────────────────────┐
                               │   Next.js 14 Web App     │
                               │        (apps/web)        │
                               └────────────┬─────────────┘
                                            │ HTTP / REST / Cookie Auth
                                            ▼
                               ┌──────────────────────────┐
                               │  NestJS Backend Monolith │
                               │      (backend/api)       │
                               └─────┬───────────┬────────┘
                                     │           │
                 ┌───────────────────┴──┐     ┌──┴───────────────────┐
                 │ PostgreSQL (Prisma)  │     │  FastAPI AI Service  │
                 │  (Source of Truth)   │     │    (services/ai)     │
                 └──────────────────────┘     └──────────────────────┘
                             ▲                           ▲
                             │                           │
                  ┌──────────┴──────────┐     ┌──────────┴───────────┐
                  │  Redis Cache & Lock │     │ Google Gemini API /  │
                  │  & BullMQ Engine    │     │   Mock AI Provider   │
                  └──────────┬──────────┘     └──────────────────────┘
                             │
                             ▼
                ┌─────────────────────────┐
                │  BullMQ Worker Process  │
                │     (src/worker.ts)     │
                └─────────────────────────┘
```

---

## 💼 Recruiter & Interview Assets

For software engineering recruiters and technical interviewers:

* 📄 **[Job Description Technical Mapping](docs/jd-mapping.md)**: Direct mapping of CareFlow technical implementations against Curer Software Developer Intern job requirements.
* 🧠 **[SDE Interview Notes & Rationale](docs/interview-notes.md)**: Deep-dive answers to core architectural questions (concurrency, eventual consistency, transaction isolation, security).
* 🎬 **[2-Minute Live Demo Script](docs/demo-script.md)**: Step-by-step browser walkthrough covering AI intent, provider ranking, booking, care journey, and real-time notification bell.
* 🏛️ **[Architectural Decision Records (ADRs)](docs/decisions.md)**: ADRs 1 through 10 documenting key engineering trade-offs.

---

## 🧪 Testing & Verification Suite

CareFlow features a robust multi-tiered test suite organized under `backend/api/test/`:

```bash
# 1. Run Unit Tests (Fast, zero-dependency)
npm test

# 2. Run Security & Ownership Tests (JWT, RBAC, 404 scanning protection)
npm run test:security

# 3. Run Care Journey & Transaction Tests (Postgres transactions, atomic rollback)
npm run test:integration

# 4. Run Concurrent Slot Protection Tests (Race condition prevention)
npm run test:concurrency

# 5. Run BullMQ Worker & Async Queue Tests (Idempotency, retries, worker state check)
npm run test:queues

# 6. Run End-to-End Full User Journey Test
npm run test:e2e
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
* **Node.js**: `v20.0.0` or higher
* **Python**: `v3.11` or higher
* **Docker & Docker Compose** (or local PostgreSQL 16 & Redis 7)

---

### Step 1: Clone & Configure Environment
```bash
git clone https://github.com/your-username/CareFlow.git
cd CareFlow
cp .env.example .env
```

---

### Step 2: Launch Infrastructure Containers
```bash
docker compose up -d
```

---

### Step 3: Install Workspace Dependencies
```bash
npm install
```

---

### Step 4: Run Prisma Migrations & Seed Data
```bash
# Deploy version-controlled migrations
npx prisma migrate deploy

# Seed 30 synthetic providers and availability slots
npm run db:seed
```

---

### Step 5: Launch Local Services

#### 1. Core Backend API & Worker (NestJS & BullMQ)
```bash
# API Server (Port 3001)
npm run dev:backend

# Background Worker (Separate Terminal Process)
npm run start:worker --workspace=backend/api
```
* **Swagger Documentation**: `http://localhost:3001/api/docs`
* **Health Check**: `http://localhost:3001/api/v1/health`

#### 2. AI Microservice (FastAPI - Port 8000)
```bash
npm run dev:ai
```
* **AI Health Check**: `http://localhost:8000/health`

#### 3. Web Frontend (Next.js - Port 3000)
```bash
npm run dev:web
```
* **Web App**: `http://localhost:3000`

---

## 🏛️ Architectural Decision Records (ADRs)

| ADR | Title | Key Rationale |
| :--- | :--- | :--- |
| **ADR 1** | Modular Monolith vs Microservices | NestJS domain modules maintain fast velocity while enabling clean boundaries. |
| **ADR 2** | PostgreSQL as Single Source of Truth | Relational integrity and ACID transactions for bookings and care journeys. |
| **ADR 3** | Redis 2-Tier Slot Concurrency Lock | Fast 10-minute temporary checkout lock combined with PostgreSQL transactional state. |
| **ADR 4** | FastAPI Python AI Microservice Isolation | Python ecosystem isolation for LLM orchestration and Pydantic schema validation. |
| **ADR 5** | Deterministic Multi-Factor Ranking | Explainable provider scoring algorithm without black-box AI bias. |
| **ADR 6** | Single-Use Refresh Token Rotation | HttpOnly cookies with automatic theft detection and full session revocation. |
| **ADR 7** | Patient Ownership & Resource Scanning Protection | Automatic identity binding and 404 response on cross-patient resource access. |
| **ADR 8** | Atomic CareJourney Integration | Combined appointment confirmation & care event creation inside one DB transaction. |
| **ADR 9** | BullMQ Eventual Consistency Queues | Post-commit job enqueueing ensuring core booking transactions are never blocked. |
| **ADR 10** | Worker DB State Awareness & Idempotency | Worker re-fetches current DB state and uses unique `dedupeKey` constraints. |

---

## 🛡️ Medical & Safety Disclaimer

> [!IMPORTANT]
> CareFlow AI is built strictly as an **informational care discovery and decision support platform**. It does **NOT** diagnose medical conditions, issue prescriptions, or replace clinical consultation with licensed medical professionals. If you are experiencing a medical emergency, please call your local emergency services immediately.

---

<div align="center">
  <sub>Built with ❤️ for software developer internship application evaluation.</sub>
</div>
