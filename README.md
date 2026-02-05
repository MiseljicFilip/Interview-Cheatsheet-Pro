# Interview Cheatsheet Pro

A personal interview-prep knowledge base: private question/answer notes with Markdown answers. Built as a **PERN** full-stack app (PostgreSQL, Express, React, Node) with TypeScript.

---

## Tech stack

| Layer    | Stack |
|----------|--------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Lucide icons, react-markdown |
| Backend  | Node.js, Express, TypeScript *(to be added)* |
| Database | PostgreSQL *(to be added)* |
| Auth     | JWT (access token; optional refresh for MVP) *(to be added)* |

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (or pnpm/yarn)
- **PostgreSQL** 14+ *(for backend work)*
- **Git**

---

## Quick start

### 1. Clone and install

```bash
git clone <repository-url>
cd notes
npm install
```

### 2. Environment variables

Create a `.env` file in the project root when you need to run the API or point the frontend at the backend. **Do not commit `.env`** (it is in `.gitignore`).

| Variable       | Description                    | Example (dev)        |
|----------------|--------------------------------|----------------------|
| `DATABASE_URL` | PostgreSQL connection string   | `postgresql://user:pass@localhost:5432/cheatsheet` |
| `JWT_SECRET`   | Secret for signing JWTs        | Long random string   |
| `PORT`         | Backend server port (optional) | `5000`               |
| `VITE_API_URL` | Backend base URL (frontend)    | `http://localhost:5000` |

For backend-only setup, `DATABASE_URL` and `JWT_SECRET` are required. You can add an `.env.example` file (without real values) and commit it so others know which variables are needed.

### 3. Run the app

**Frontend only (current state):**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The UI currently uses LocalStorage; it will be wired to the backend API once the API is ready.

**Backend (when added):**

When the `server/` (or `backend/`) app exists, document the run command here, e.g.:

```bash
# From repo root, e.g.:
cd server && npm install && npm run dev
```

Then run both: backend on e.g. port 5000, frontend on 5173.

---

## Project structure

```
notes/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # Reusable UI (Button, Card, TagsSelect, etc.)
│   ├── data/               # Default tags and static data
│   ├── types/              # TypeScript types (Note, Tag, etc.)
│   ├── App.tsx             # Root + routes + local state (will use API later)
│   ├── NoteList.tsx        # List + search/filter/sort
│   ├── NewNote.tsx         # Create note
│   ├── EditNote.tsx        # Edit note
│   ├── Note.tsx            # Single note view
│   └── useLocalStorage.ts  # LocalStorage hook (notes will move to API)
├── public/
├── index.html
├── package.json            # Frontend deps and scripts
├── .env.example            # Template for env vars
└── server/                 # Backend (to be added)
    # Expected: routes/, services/, repos/ or repositories/, middleware/, config/
```

**Backend devs:** Put the Node + Express + TypeScript app in `server/` (or `backend/`). Keep route handlers thin; use **services** for business logic and **repositories** for database access. API contract, data model, and conventions are in this README below.

---

## API contract (MVP)

The frontend will consume this API. Full specification is below; implement all routes and rules described in this README before integrating with the frontend.

### Auth

| Method | Endpoint                 | Body / Headers        | Response / notes      |
|--------|--------------------------|------------------------|------------------------|
| POST   | `/api/auth/register`     | `{ email, password }`  | Create user            |
| POST   | `/api/auth/login`        | `{ email, password }`  | `{ accessToken }`      |
| GET    | `/api/auth/me`           | `Authorization: Bearer <token>` | `{ id, email }` (no password) |

### Notes (all protected by JWT; scoped to authenticated user)

| Method | Endpoint           | Body (where applicable)   | Notes                          |
|--------|--------------------|----------------------------|--------------------------------|
| GET    | `/api/notes`       | —                          | Only notes for `req.user.id`   |
| POST   | `/api/notes`       | `{ question, answer_md, tags }` | `tags`: string[]               |
| GET    | `/api/notes/:id`   | —                          | 404 if not owner               |
| PATCH  | `/api/notes/:id`   | `{ question?, answer_md?, tags? }` | 404 if not owner               |
| DELETE | `/api/notes/:id`   | —                          | 404 if not owner               |

**Important:** Every note must have `user_id`. All read/write must be scoped to `req.user.id`; never trust the client. Validate request bodies and use a single error response format.

---

## Data model (MVP)

- **users:** `id` (uuid), `email` (unique), `password_hash`, `created_at`
- **notes:** `id` (uuid), `user_id` (FK → users.id), `question`, `answer_md`, `tags` (text[]), `created_at`, `updated_at`

Use `tags text[]` in PostgreSQL for MVP (no separate tags table required).

---

## Conventions and rules

- **TypeScript:** Strict mode; avoid `any`; validate request bodies and return typed responses.
- **Security:** Hash passwords with bcrypt; validate JWT on protected routes; set CORS correctly; never return password hashes.
- **Architecture:** Thin route handlers → services → repositories. Single error format and consistent naming.
- **Product:** Notes are private and per-user; no global cheatsheet or admin roles for MVP.

---

## Contributing

- **Frontend:** React app in `src/`; will be wired to the backend API once auth and notes CRUD are ready.
- **Backend:** Implement auth and notes API per this README in `server/` (or agreed folder). Use the same repo so both sides can run and test together.

If you add new env vars or scripts, update this README and, if you use one, `.env.example`.
