# IT3030 PAF 2026 — Smart Campus Operations Hub

Spring Boot REST API + React (Vite) client for facility bookings, maintenance tickets, notifications, and OAuth2-based access control.

**Suggested repository name:** `it3030-paf-2026-smart-campus-groupXX` (replace `XX`).

## Prerequisites

- Java 21  
- Node.js 20+ (LTS recommended)  
- MongoDB 7+ (local or Atlas)  
- Maven uses the included wrapper (`backend/mvnw` / `mvnw.cmd`)

## Quick start

1. **MongoDB** — run locally on `27017` or set `MONGODB_URI` (see below).

2. **Backend**

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   Windows: `mvnw.cmd spring-boot:run`  
   API default: `http://localhost:8080` — health check: `GET /api/health`

3. **Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Dev server: `http://localhost:5173` (proxies `/api` to the backend).

## Configuration

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string (default: `mongodb://localhost:27017/smartcampus`) |
| Google OAuth | Configure in Spring when Module E is integrated (`spring.security.oauth2.client.*`) |

## Project layout

| Path | Role |
|------|------|
| `backend/` | Spring Boot: REST API, security, persistence |
| `frontend/` | React SPA |

Document **which member owns which endpoints and UI screens** in your final report and/or a `CONTRIBUTORS.md` file.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs Maven tests for the backend and `npm ci` + `npm run build` for the frontend on pushes and pull requests to `main` / `master`.

## Academic integrity

If you use AI-assisted tooling, disclose it in your report and progress reviews as required by the module.
"# it3030-paf-2026-smart-campus-group" 
"# it3030-paf-2026-smart-campus-group" 
"# it3030-paf-2026-smart-campus-group" 
