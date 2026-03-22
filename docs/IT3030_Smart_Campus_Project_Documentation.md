# IT3030 — Programming Applications and Frameworks  
## Smart Campus Operations Hub — Project Documentation

**Module:** IT3030 PAF Assignment 2026 (Semester 1)  
**Institution:** Faculty of Computing, SLIIT  

**How to use this file in Microsoft Word**

- **Option A:** In Word, use **File → Open** and select this `.md` file (Word can import Markdown in recent versions).  
- **Option B:** Copy all sections from this file and paste into a blank Word document, then apply **Heading 1 / Heading 2** styles and your faculty cover page.  
- **Option C:** Save a PDF from Word for submission if required.

---

## 1. Executive summary

The **Smart Campus Operations Hub** is a web platform that lets a university manage **bookable facilities and assets** (Module A) and **booking requests with approval workflow** (Module B), with planned extensions for **maintenance tickets**, **notifications**, and **OAuth2 authentication**.  

The implementation uses:

- **Backend:** Java 17+, **Spring Boot 3.x**, REST APIs, **Spring Data MongoDB**  
- **Frontend:** **React** (Vite), consuming the REST API  
- **Database:** **MongoDB** (document store; collections created when the first document is saved)

This document explains **where configuration is stored**, **how the backend connects to MongoDB**, and **what the system currently implements**.

---

## 2. Where to save MongoDB connection details

| Location | Purpose |
|----------|---------|
| **`backend/src/main/resources/application.yml`** | Default connection for local development. Key: `spring.data.mongodb.uri`. |
| **Environment variable `MONGODB_URI`** | Overrides the YAML value (recommended for **Atlas**, CI, or production). |
| **Never commit** real Atlas passwords in public repositories; use env vars or secrets. |

**Default local URI used by this project:**

```text
mongodb://localhost:27017/SmartCampus_Local
```

- **Host:** `localhost`  
- **Port:** `27017` (MongoDB default)  
- **Database name:** `SmartCampus_Local` (MongoDB creates it automatically when your app first writes data)

**MongoDB Compass:** After you insert at least one document via the API or app, open Compass and select database **`SmartCampus_Local`**. You should see collections such as **`resources`** and **`bookings`** (not the system database **`local`** or `local.startup_log` — that is only internal server metadata).

---

## 3. How the backend works with MongoDB

### 3.1 High-level flow

1. **Spring Boot starts** and reads `application.yml` (and environment variables).  
2. **Spring Data MongoDB** auto-configures a **`MongoClient`** using `spring.data.mongodb.uri`.  
3. **Repository interfaces** (extending `MongoRepository`) are implemented at runtime by Spring — no SQL, no manual JDBC.  
4. **Service classes** contain business rules (validation, overlap checks for bookings).  
5. **Controllers** expose HTTP endpoints (`GET`, `POST`, `PUT`, `DELETE`) and return JSON.  
6. When you **save** an entity, MongoDB stores a **document** in a **collection** whose name comes from `@Document(collection = "...")` or the class name.

### 3.2 Concepts mapped to this project

| Concept | In SQL | In MongoDB (this project) |
|---------|--------|---------------------------|
| Database | Database | `SmartCampus_Local` |
| Table | Collection | e.g. `resources`, `bookings` |
| Row | Document | One JSON-like document per resource/booking |
| Primary key | Often numeric / UUID | String `id` field (`_id` in storage) |

### 3.3 Why Compass showed no “app data” at first

- MongoDB **does not create** an empty application database in a visible way until **at least one document** is written.  
- Collections **`resources`** and **`bookings`** appear after the first successful **`POST`** from the API or frontend.  
- **`local.startup_log`** is a **system** collection — it is **not** where application data is stored. Always inspect **`SmartCampus_Local`** → your collections.

### 3.4 Dependencies (Maven)

The backend includes **`spring-boot-starter-data-mongodb`** in `pom.xml`. That brings:

- MongoDB Java driver  
- Spring Data MongoDB (`MongoRepository`, `MongoTemplate`, mapping annotations)

Run **`mvnw.cmd clean test`** or **`mvnw.cmd spring-boot:run`** from the `backend` folder after changing dependencies.

---

## 4. Implemented modules (current scope)

### 4.1 Module A — Facilities and assets catalogue

**Purpose:** Maintain bookable items (lecture halls, labs, meeting rooms, equipment) with metadata and filters.

**REST API (base path `/api/resources`):**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/resources` | List/search (query params: type, location, minCapacity, q) |
| GET | `/api/resources/{id}` | Get one |
| POST | `/api/resources` | Create |
| PUT | `/api/resources/{id}` | Update |
| DELETE | `/api/resources/{id}` | Delete |

**Persistence:** Collection **`resources`**, document fields include type, name, capacity, location, availability text, status (e.g. ACTIVE / OUT_OF_SERVICE).

**Frontend:** **Resources** page — filters, add/edit form, table.

---

### 4.2 Module B — Booking management

**Purpose:** Users request bookings; workflow **PENDING → APPROVED / REJECTED**; **CANCELLED** for approved or pending where applicable; **conflict detection** for overlapping times on the same resource.

**REST API (base path `/api/bookings`):**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bookings` | List (optional filters: status, userId, resourceId) |
| GET | `/api/bookings/{id}` | Get one |
| POST | `/api/bookings` | Create request (status PENDING) |
| PUT | `/api/bookings/{id}/approve` | Approve (admin workflow; role enforcement planned) |
| PUT | `/api/bookings/{id}/reject` | Reject with JSON `{ "reason": "..." }` |
| PUT | `/api/bookings/{id}/cancel` | Cancel approved or pending |
| DELETE | `/api/bookings/{id}` | Remove record |

**Business rules (summary):**  
- Only **ACTIVE** resources can be booked.  
- Overlaps with existing **PENDING** or **APPROVED** bookings on the same resource are rejected (**409 Conflict**).  
- Approving checks against other **APPROVED** bookings for the same slot.

**Persistence:** Collection **`bookings`**.

**Frontend:** **Bookings** page — user ID (temporary until OAuth), request form, history, admin approval list.

---

## 5. Security and cross-origin (current state)

- **Spring Security** is enabled; for development, endpoints are broadly accessible and **CORS** allows the React dev server (`http://localhost:5173`).  
- **OAuth2 (Google)** and **role-based access (USER / ADMIN / TECHNICIAN)** are **planned** for Module E; the UI should be updated to hide admin actions from non-admin users when security is enforced.

---

## 6. Frontend overview

| Technology | Role |
|------------|------|
| React + Vite | SPA, routing, forms |
| Fetch API | Calls backend via relative URLs `/api/...` |
| Vite proxy | Forwards `/api` to `http://localhost:8080` during `npm run dev` |

**Run:** `cd frontend` → `npm install` → `npm run dev` → browser at `http://localhost:5173`.

---

## 7. Testing and quality

- **Maven:** Unit/integration tests under `backend/src/test`; GitHub Actions can run `mvnw test`.  
- **Manual:** Postman collections can be built for each endpoint; include screenshots in the final report.  
- **Validation:** Jakarta Bean Validation on request DTOs; global handler returns JSON errors for **400** / **404** / **409**.

---

## 8. Version control and CI

- Repository hosted on **GitHub** with meaningful commits.  
- **GitHub Actions** workflow (if present) builds backend and frontend to satisfy coursework CI requirements.

---

## 9. Team contribution (template)

Fill this table for your PDF report:

| Team member | Module / area | REST endpoints | Frontend | Documentation |
|-------------|---------------|----------------|----------|----------------|
| Name 1 | | | | |
| Name 2 | | | | |
| Name 3 | | | | |
| Name 4 | | | | |

---

## 10. AI-assisted tooling disclosure

If your module policy requires it, state here whether any code or documentation was produced with assistance from AI tools and how you reviewed it for correctness.

---

## 11. Future work (assignment alignment)

- Module C: Tickets, attachments, comments, technician assignment.  
- Module D: Notifications panel and persistence.  
- Module E: OAuth2 login, roles, secured routes and `@PreAuthorize` on sensitive endpoints.  
- Optional innovations: QR check-in, analytics dashboard, notification preferences.

---

## 12. Glossary

| Term | Meaning |
|------|---------|
| **REST** | HTTP-based API using resources, verbs, and status codes. |
| **DTO** | Data Transfer Object — JSON body shape for requests/responses. |
| **MongoDB collection** | Set of documents (like a table without a fixed schema for every row). |
| **Spring Data Mongo** | Framework that implements repositories and maps Java objects to documents. |

---

*End of document. Replace placeholders with your group name, IDs, and screenshots before submission.*
