# CareFlow — Technical Architecture Specification

CareFlow is built as a **Modular Monolith for the core backend** paired with a specialized **Python FastAPI AI Microservice** and a **Next.js 14 Web Frontend**.

---

## 1. High-Level Architecture Overview

```
                          ┌──────────────────────────┐
                          │   Next.js Web Frontend   │
                          │        (apps/web)        │
                          └────────────┬─────────────┘
                                       │ HTTP / REST
                                       ▼
                          ┌──────────────────────────┐
                          │   NestJS Backend Monolith│
                          │      (backend/api)       │
                          └─────┬──────────────┬─────┘
                                │              │
            ┌───────────────────┴──┐        ┌──┴───────────────────┐
            │ PostgreSQL (Prisma)  │        │  FastAPI AI Service  │
            │ (Source of Truth)    │        │    (services/ai)     │
            └──────────────────────┘        └──────────────────────┘
                        ▲                              ▲
                        │                              │
             ┌──────────┴─────────┐         ┌──────────┴───────────┐
             │    Redis Cache     │         │ Google Gemini SDK /  │
             │ & Slot Lock (SETNX)│         │ Mock AI Provider     │
             └────────────────────┘         └──────────────────────┘
```

---

## 2. Component Breakdown

### A. Next.js 14 Web Frontend (`apps/web`)
- **Framework**: Next.js 14 with App Router, TypeScript, and Tailwind CSS.
- **Design Token System**: Professional healthcare aesthetic featuring a white base, deep purple primary (`#6B21A8`), and medical teal accent (`#0D9488`).
- **Key Routes**:
  - `/`: Landing page with provider search and discovery.
  - `/ai`: Symptom description and intent extraction entry.
  - `/ai/summary`: Structured clinical summary of extracted AI intent.
  - `/recommendations`: Matched provider recommendation grid with match scores.
  - `/providers/[id]`: Provider bio, services, and interactive slot picker.
  - `/book`: Booking configuration and appointment mode selection.
  - `/booking/confirmation`: Confirmed appointment reference.
  - `/care` & `/my-care`: Lightweight patient care journey dashboard.

### B. NestJS Core Backend (`backend/api`)
- **Pattern**: Modular Monolith organized by clean business domains.
- **Domain Modules**:
  1. `auth`: Authentication and JWT lifecycle management.
  2. `users`: User identity & role handling (`PATIENT`, `PROVIDER`, `ADMIN`).
  3. `patients`: Patient record and health metadata handling.
  4. `providers`: Provider discovery, filtering, and deterministic ranking scoring algorithm.
  5. `specialties`: Specialty taxonomy catalog.
  6. `services`: Healthcare service catalog.
  7. `availability`: Slot availability queries.
  8. `appointments`: Appointment state machine & 2-tier concurrency lock.
  9. `care-journeys`: Patient milestone tracking.
  10. `notifications`: In-app notification queue handlers.
  11. `ai-orchestration`: Proxy layer connecting NestJS with FastAPI AI service.
  12. `health`: Infrastructure health checking (`GET /health` & `GET /health/dependencies`).

### C. FastAPI AI Service (`services/ai`)
- **Framework**: Python FastAPI running on port 8000.
- **Provider Abstraction Interface**:
  - `BaseAIProvider`: Abstract interface for intent extraction and chat.
  - `MockAIProvider`: Default fallback provider returning deterministic, realistic structured JSON.
  - `GeminiAIProvider`: Google Gemini LLM provider integration.
- **Safety Boundary**: Clinical disclaimers attached to every AI output enforcing informational guidance limits.

### D. Data & Infrastructure Layer
- **PostgreSQL 16**: Primary relation database containing 14 domain entities managed via Prisma ORM.
- **Redis 7**: High-performance caching layer for hot search queries and atomic temporary slot holding (`SETNX` with TTL).
- **BullMQ**: Asynchronous background queue for reminders and notification dispatch.
