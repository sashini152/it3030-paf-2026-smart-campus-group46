# IT3030 PAF 2026 — Smart Campus Operations Hub

Spring Boot REST API + React (Vite) for facility bookings, maintenance tickets, notifications, and OAuth2-based access control.

**Suggested repository name:** `it3030-paf-2026-smart-campus-groupXX` (replace `XX`).

## Prerequisites

- **Java 21**
- **Node.js 20+** (LTS recommended)
- **MongoDB** — local instance, Docker, or MongoDB Atlas (see below)
- Maven: use the wrapper in `backend/` (`./mvnw` or `mvnw.cmd`)

## MongoDB setup

Pick one approach.

### A. Local MongoDB Community Server (Windows)

1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2. Run the installer. Choose **Complete** setup and install **MongoDB as a Service** so it starts on boot.
3. By default the server listens on **`mongodb://localhost:27017`**.
4. No username/password is required for local dev unless you enabled auth.
5. The app uses database name **`smartcampus`** (created automatically on first write).  
   Connection string (default in `application.yml`):

   `mongodb://localhost:27017/smartcampus`

### B. MongoDB with Docker

```bash
docker run -d --name smart-campus-mongo -p 27017:27017 mongo:7
```

Then set (optional, this matches the default):

`MONGODB_URI=mongodb://localhost:27017/smartcampus`

### C. MongoDB Atlas (cloud)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow your IP (or `0.0.0.0/0` for development only).
3. **Database** → **Connect** → **Drivers** and copy the SRV connection string.
4. Set the environment variable before starting the backend (replace user, password, and cluster host):

   `MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/smartcampus?retryWrites=true&w=majority`

### Verify MongoDB is running

- **Compass:** connect to `mongodb://localhost:27017` and check that `smartcampus` appears after you use the app.
- **Command line:** `mongosh` then `show dbs`.

---

## Quick start

1. **Start MongoDB** (see above).

2. **Backend**

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   Windows: `mvnw.cmd spring-boot:run`  
   API: `http://localhost:8080`  
   Health: `GET http://localhost:8080/api/health`

3. **Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   App: `http://localhost:5175` — Vite proxies `/api` to the backend.

## API highlights (Modules A & B)

| Area      | Endpoints                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Resources | `GET/POST /api/resources`, `GET/PUT/DELETE /api/resources/{id}` — query: `type`, `location`, `minCapacity`, `q`                              |
| Bookings  | `GET/POST /api/bookings`, `GET /api/bookings/{id}`, `PUT .../approve`, `PUT .../reject` (JSON `reason`), `PUT .../cancel`, `DELETE .../{id}` |

Bookings block overlapping **PENDING** or **APPROVED** slots on the same resource. Only **ACTIVE** resources accept new requests.

## Configuration

| Variable      | Purpose                                                                   |
| ------------- | ------------------------------------------------------------------------- |
| `MONGODB_URI` | Full MongoDB connection string (overrides default local URI)              |
| Google OAuth  | Configure when Module E is integrated (`spring.security.oauth2.client.*`) |

## Project layout

| Path        | Role                 |
| ----------- | -------------------- |
| `backend/`  | Spring Boot REST API |
| `frontend/` | React SPA            |

Document **which member owns which endpoints and UI** in your report and/or `CONTRIBUTORS.md`.

## CI

`.github/workflows/ci.yml` runs Maven tests (with MongoDB service) and `npm ci` + `npm run build` for the frontend on pushes/PRs to `main` / `master`.

## Academic integrity

Disclose AI-assisted tooling in your report and progress reviews if required by the module.
