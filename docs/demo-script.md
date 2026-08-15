# CareFlow 2-Minute Live Demo Script

This guide outlines a step-by-step 2-minute live browser demonstration of CareFlow for software engineering hiring managers and technical interviewers.

---

## Demo Flow Overview

```text
1. Register/Login Patient
       │
       ▼
2. Enter Natural Language Health Concern ("Chest pain & shortness of breath")
       │
       ▼
3. AI Extracts Intent & Recommends Cardiology
       │
       ▼
4. Provider Search Ranks Top Cardiologists
       │
       ▼
5. Select Slot & Redis 10-Min Hold Starts
       │
       ▼
6. Confirm Booking (PostgreSQL Atomic Transaction)
       │
       ▼
7. View Persistent Care Journey Timeline (/my-care)
       │
       ▼
8. Check Real-Time Bell Notification (BullMQ Worker)
```

---

## Step-by-Step Execution

### Step 1: User Authentication (0:00 - 0:20)
1. Open browser to `http://localhost:3000`.
2. Click **Sign Up** or **Login**.
3. Register a new patient account (e.g. `jane.doe@example.com` / `Password123!`).
4. **Key Talking Point**: *"CareFlow uses JWT access tokens stored in memory and single-use refresh token rotation in HttpOnly cookies with automatic theft detection."*

### Step 2: AI Clinical Intent Extraction (0:20 - 0:45)
1. On the homepage, type in the AI search bar:
   > *"I have been experiencing chest tightness, shortness of breath, and fatigue for 2 days."*
2. Click **Analyze Symptoms**.
3. **Observation**:
   - AI intent panel displays: **Specialty: Cardiology**, **Urgency: Urgent**, **Category: Find Doctor**.
4. **Key Talking Point**: *"FastAPI parses natural language using Google Gemini / Mock AI with strict Pydantic schemas, and NestJS normalizes the output against backend database specialties."*

### Step 3: Provider Ranking & Slot Hold (0:45 - 1:15)
1. Click **View Recommended Providers**.
2. **Observation**:
   - Dr. Aris Thorne (Cardiology) appears at the top with a 98% match score.
3. Select an available slot (e.g. `Tomorrow at 10:00 AM`).
4. Click **Reserve Slot**.
5. **Observation**:
   - A 10-minute checkout timer begins counting down (`09:59...`).
6. **Key Talking Point**: *"This triggers an atomic Redis `SETNX` lock. If another user attempts to reserve this exact slot concurrently, Redis instantly rejects it with a 409 Conflict."*

### Step 4: Booking & Atomic Care Journey Creation (1:15 - 1:40)
1. Enter appointment reason: *"Cardiovascular evaluation for chest tightness"*.
2. Click **Confirm Appointment**.
3. **Observation**:
   - Confirmation toast appears: *"Appointment Confirmed!"*.
   - Redirects to `/my-care`.
4. **Key Talking Point**: *"PostgreSQL executes an atomic ACID transaction that updates slot status to `BOOKED`, creates the `Appointment` record, and automatically creates a `CareJourney` and `CareEvent` timeline item."*

### Step 5: Async BullMQ Notification (1:40 - 2:00)
1. Look at the top navigation bar bell icon.
2. Click the bell icon to reveal notifications.
3. **Observation**:
   - Notification item: *"Appointment Confirmed with Dr. Aris Thorne"*.
4. **Key Talking Point**: *"Notice the booking API responded in under 50ms without waiting for notifications. Post-commit, NestJS enqueued a job into BullMQ, which the standalone worker process executed asynchronously with idempotency deduplication."*

---

## Technical Highlights Summary
- **Zero Double-Booking Guarantee**: Redis atomic lock + PostgreSQL version-checked transactions.
- **Eventual Consistency**: BullMQ background workers isolate notification delays from critical path API latency.
- **Security & Privacy**: Resource ownership isolation blocks cross-patient scanning with strict 404 Not Found responses.
