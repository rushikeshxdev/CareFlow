<div align="center">

# 🩺 CareFlow

### AI-Powered Healthcare Discovery & Appointment Booking Platform

[![NestJS](https://img.shields.io/badge/NestJS-v10.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js_14-App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16.0-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-v7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Prisma](https://img.shields.io/badge/Prisma-v5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<p align="center">
  <b>CareFlow</b> helps patients discover healthcare providers, extract clinical intent from natural language symptoms using AI, search deterministic ranking scores, and book appointment slots with <b>zero double-booking guarantees</b>.
</p>

[Key Features](#-key-engineering-highlights) • [Architecture](#-system-architecture) • [Directory Tree](#-monorepo-structure) • [Quickstart Guide](#-quickstart--local-setup) • [API Documentation](#-api-reference)

---

</div>

## 🌟 Overview

**CareFlow** is an end-to-end healthcare platform demonstrating production-grade software engineering for real-world medical workflows:

1. **Natural Language AI Intent Analysis**: Describe symptoms or health concerns in plain text; an AI microservice extracts clinical intent, symptoms, and urgency, recommending appropriate medical specialties.
2. **Deterministic Provider Search & Ranking**: Transparency-first search scoring formula balancing specialty match, patient rating, slot availability, experience, and fee matching.
3. **2-Tier Concurrency Protection**: High-performance concurrency lock combining **Redis atomic temporary slot holding** (`SETNX` with 10-min TTL) and **PostgreSQL transactional state constraints** (`AVAILABLE` -> `HELD` -> `BOOKED`).
4. **Comprehensive Synthetic Healthcare Dataset**: Pre-seeded database featuring 30 verified providers (15 Doctors, 5 Hospitals, 5 Diagnostic Centers, 5 Home-care Providers), services, specialties, and 120+ availability slots ready for demo.

---

## ⚡ Key Engineering Highlights

### 🔒 Two-Tier Slot Concurrency Lock
```
Patient Booking Request
   │
   ├─► 1. Redis Lock (SETNX slot:{id}:hold patientId EX 600)
   │      └─► Fast 10-minute temporary reservation lock during checkout.
   │
   └─► 2. PostgreSQL Transaction ($transaction + State Validation)
          └─► Atomically verifies state transition (AVAILABLE -> HELD -> BOOKED).
```

### 📊 Deterministic Provider Ranking Formula
Providers are ranked transparently using a multi-factor weighted scoring algorithm:
$$\text{Score} = (\text{Specialty Match} \times 0.35) + (\text{Rating} \times 0.25) + (\text{Slot Availability} \times 0.20) + (\text{Experience} \times 0.10) + (\text{Price Match} \times 0.10)$$

---

## 🏗️ System Architecture

```
                               ┌──────────────────────────┐
                               │   Next.js 14 Web App     │
                               │        (apps/web)        │
                               └────────────┬─────────────┘
                                            │ HTTP / REST
                                            ▼
                               ┌──────────────────────────┐
                               │  NestJS Backend Monolith │
                               │      (backend/api)       │
                               └─────┬──────────────┬─────┘
                                     │              │
                 ┌───────────────────┴──┐        ┌──┴───────────────────┐
                 │ PostgreSQL (Prisma)  │        │  FastAPI AI Service  │
                 │  (Source of Truth)   │        │    (services/ai)     │
                 └──────────────────────┘        └──────────────────────┘
                             ▲                              ▲
                             │                              │
                  ┌──────────┴─────────┐         ┌──────────┴───────────┐
                  │    Redis Cache     │         │ Google Gemini SDK /  │
                  │ & Slot Lock (SETNX)│         │ Mock AI Provider     │
                  └────────────────────┘         └──────────────────────┘
```

---

## 📂 Monorepo Structure

```
CareFlow/
├── apps/
│   └── web/                  # Next.js 14 Web Frontend (App Router, Tailwind CSS)
├── services/
│   └── ai/                   # Python FastAPI AI Microservice (Pydantic, Gemini SDK)
├── backend/
│   └── api/                  # NestJS Core Modular Monolith (12 Domain Modules, Swagger)
├── packages/
│   └── shared/               # Shared TypeScript Package (@careflow/shared)
├── prisma/
│   ├── schema.prisma         # 14 PostgreSQL Domain Entities
│   └── seed.ts               # Database Seeder (30 Providers + Availability Slots)
├── docs/
│   ├── architecture.md       # Technical Architecture Specification
│   ├── api.md                # OpenAPI REST API Route Reference
│   └── decisions.md          # Architectural Decision Records (ADRs)
├── docker-compose.yml        # PostgreSQL 16 & Redis 7 Docker Services
├── .env.example              # Environment Configuration Template
└── README.md                 # Project Overview & Setup Guide
```

---

## 🛠️ Tech Stack Table

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React 18, Tailwind CSS | App Router, Server Components, Custom Healthcare Palette |
| **Core Backend** | NestJS, TypeScript, Swagger | Modular Monolith Business Authority, Validation Pipes |
| **AI Microservice** | Python 3.10+, FastAPI, Pydantic | Structured Intent Analysis, LLM Abstraction |
| **Database** | PostgreSQL 16, Prisma ORM | Relational Data Modeling, Migrations, Seed Data |
| **Cache & Lock** | Redis 7, ioredis | Atomic Slot Reservation (`SETNX`), Query Caching |
| **Infrastructure** | Docker, Docker Compose | Isolated Database & Cache Containers |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **Python**: `v3.10` or higher
* **Docker & Docker Compose** (or local PostgreSQL 16 & Redis 7)

---

### Step 1: Initialize Environment
Clone the repository and copy the environment template:
```bash
# Clone the repository
git clone https://github.com/your-username/CareFlow.git
cd CareFlow

# Copy environment template
cp .env.example .env
```

---

### Step 2: Start Infrastructure Containers
Launch background PostgreSQL 16 and Redis 7 containers:
```bash
docker-compose up -d
```

---

### Step 3: Install Workspace Dependencies
Install monorepo dependencies across all packages:
```bash
npm install
```

---

### Step 4: Push Database Schema & Seed Data
Initialize PostgreSQL tables and seed realistic healthcare data:
```bash
# Push Prisma schema to PostgreSQL
npm run db:push

# Seed 30 synthetic providers and availability slots
npm run db:seed
```

---

### Step 5: Launch Development Services

#### 1. Core Backend API (NestJS - Port 3001)
```bash
npm run dev:backend
```
* **Swagger API Docs**: `http://localhost:3001/api/docs`
* **Health Check**: `http://localhost:3001/health`

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

## 📚 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | System health check (Database, Redis, Memory) |
| `/health/dependencies` | `GET` | External dependency check (FastAPI AI Service) |
| `/providers` | `GET` | Search and rank providers deterministically |
| `/providers/:id` | `GET` | Get detailed provider profile and slots |
| `/appointments/hold` | `POST` | Hold an availability slot for 10 minutes (Redis lock) |
| `/appointments` | `POST` | Confirm appointment booking (PostgreSQL transaction) |
| `/ai/analyze-intent` | `POST` | Extract health intent & recommend specialties |

*Interactive Swagger docs available at `http://localhost:3001/api/docs` when the backend is running.*

---

## 🛡️ Medical & Safety Disclaimer

> [!IMPORTANT]
> CareFlow AI is built strictly as an **informational care discovery and decision support platform**. It does **NOT** diagnose medical conditions, issue prescriptions, or replace clinical consultation with licensed medical professionals. If you are experiencing a medical emergency, please call your local emergency services immediately.

---

<div align="center">
  <sub>Built with ❤️ for portfolio & software developer internship application evaluation.</sub>
</div>
