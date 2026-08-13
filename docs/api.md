# CareFlow — REST API Documentation & Swagger Reference

The NestJS core backend exposes interactive OpenAPI / Swagger documentation at `http://localhost:3001/api/docs`.

---

## Endpoint Summary

### 1. Health & Infrastructure
- `GET /health`: Core system health (App, Database, Redis).
- `GET /health/dependencies`: External service health (FastAPI AI microservice).

### 2. Authentication (`/auth`)
- `POST /auth/register`: Register new patient or provider account.
- `POST /auth/login`: Authenticate and receive JWT access token.
- `POST /auth/refresh`: Refresh JWT access token.

### 3. Provider Discovery (`/providers`)
- `GET /providers`: Discover & rank providers with query parameters:
  - `providerType`: `DOCTOR` | `HOSPITAL` | `DIAGNOSTIC_CENTER` | `HOME_CARE`
  - `specialtyId`: string
  - `city`: string
  - `maxPrice`: number
  - `minRating`: number
  - `search`: string query
  - `sortBy`: `score` | `rating` | `price` | `experience`
- `GET /providers/:id`: Get detailed provider profile, specialties, services, and slots.

### 4. Availability (`/providers/:id/availability`)
- `GET /providers/:id/availability`: List upcoming available slots.

### 5. Appointment Booking (`/appointments`)
- `POST /appointments/hold`: Reserve temporary 10-minute slot hold via Redis.
- `POST /appointments`: Confirm appointment booking inside PostgreSQL transaction.
- `GET /appointments`: List patient appointments.
- `GET /appointments/:id`: Get specific appointment detail.
- `PATCH /appointments/:id/cancel`: Cancel appointment and release slot.

### 6. AI Orchestration (`/ai`)
- `POST /ai/analyze-intent`: Proxy patient symptoms to FastAPI AI service, returning intent analysis and provider recommendations.

### 7. FastAPI AI Service Direct API (`http://localhost:8000`)
- `GET /health`: AI service provider status.
- `POST /ai/analyze-intent`: Returns structured `IntentAnalysisResponse`.
- `POST /ai/recommend`: Returns filter recommendations.
- `POST /ai/chat`: Returns conversational guidance.
