# 🚀 ReachInbox – Full-Stack Email Job Scheduler (BullMQ + Redis)

A production-grade **email scheduling service + dashboard** built as part of the ReachInbox hiring assignment.

This project focuses on **reliable email scheduling at scale** using:

✅ **BullMQ delayed jobs** (NO cron jobs)  
✅ **Redis-backed persistence** (jobs survive restarts)  
✅ **PostgreSQL + Prisma** storage  
✅ **Ethereal Email SMTP** (safe fake email sending)  
✅ **Google OAuth login (real)** + optional Local Auth (bonus)  
✅ Dashboard UI for scheduling, tracking scheduled & sent emails

---

## 📌 Tech Stack

### Backend
- **TypeScript**
- **Express.js**
- **BullMQ**
- **Redis**
- **PostgreSQL**
- **Prisma ORM**
- **Nodemailer + Ethereal SMTP**
- **Passport.js + Google OAuth**
- **bcrypt** (bonus email/password auth)

### Frontend
- **React + TypeScript**
- **Vite**
- **Axios**
- Custom UI (dashboard + modal + lists)

---

# ✅ Features Implemented (Mapped to Requirements)

## ✅ Backend Features

### Scheduler + Storage
- ✅ Accepts email scheduling requests via API
- ✅ Stores scheduled emails in relational DB (PostgreSQL)
- ✅ Schedules using **BullMQ delayed jobs** (no cron)
- ✅ Supports **bulk scheduling** (CSV/TXT leads)
- ✅ Multiple senders supported (DB model + selection)

### Persistence & Restart Safety
- ✅ Scheduled jobs persist in Redis (BullMQ)  
- ✅ Email records persist in DB (Postgres)  
- ✅ Server restart will NOT lose future scheduled jobs  
- ✅ Idempotency: email jobs do not get duplicated

### Worker Concurrency
- ✅ Worker concurrency is configurable via env:
  - `WORKER_CONCURRENCY=5` (example)

### Rate Limiting / Throughput
- ✅ Delay between each send supported:
  - `MIN_DELAY_BETWEEN_EMAILS_MS=2000` (example)

- ✅ Hourly limit per sender:
  - `MAX_EMAILS_PER_HOUR_PER_SENDER=200`

- ✅ Rate limiting is safe across multiple workers/instances
  - Uses Redis counters by time-window

- ✅ When limit reached:
  - Jobs are delayed/rescheduled into the **next hour window**
  - Jobs are NOT dropped

---

## ✅ Frontend Features

### Authentication
- ✅ Google OAuth login (real)
- ✅ Shows user name/email/avatar (from backend session)
- ✅ Logout option
- ✅ Bonus:
  - Local Email/Password Register + Login (`/register`, `/login`)

### Dashboard
- ✅ Scheduled emails view
- ✅ Sent emails view
- ✅ Inbox-style UI (sidebar + list + search)
- ✅ Refresh emails on demand
- ✅ Empty state + loading support

### Compose Modal
- ✅ Choose sender (multi-sender supported)
- ✅ Create Ethereal sender from UI button
- ✅ Subject + HTML body
- ✅ Start time selection
- ✅ Delay + hourly limit config
- ✅ Upload CSV/TXT leads file
- ✅ Parses emails and shows "Emails detected"
- ✅ Schedule bulk emails

---

# 🏗 Architecture Overview

## ✅ How Scheduling Works
1. User schedules a bulk email campaign from the frontend (Compose Modal)
2. Frontend sends request → Backend `/emails/bulk-schedule`
3. Backend stores each email in DB with status `SCHEDULED`
4. Backend adds a BullMQ job with a delay calculated by:
   - `delay = sendAt - now`
5. BullMQ persists the job in Redis with a delayed timestamp
6. When the job becomes active:
   - Worker picks it up
   - Sends email using sender’s SMTP credentials (Ethereal)
7. DB is updated:
   - `SCHEDULED → PROCESSING → SENT`
   - or `FAILED` if error occurs

✅ Important: **No cron jobs are used.**  
Scheduling is handled purely via BullMQ delayed jobs.

---

## ✅ How Persistence on Restart is handled
This system survives restarts because:

### BullMQ + Redis persistence
- BullMQ stores job metadata in Redis
- Delayed jobs remain queued even if the backend restarts
- Worker resumes processing once the server is back

### DB persistence
- Every email is stored in the relational DB (Postgres)
- Email state is always recoverable even if Redis queue fails

✅ Combined approach ensures:
- Future emails still send at correct time
- No “restart from scratch” behavior
- Status tracking stays accurate

---

## ✅ Rate Limiting & Concurrency Implementation

### ✅ Worker Concurrency
The worker uses a configurable concurrency via environment variables:

```env
WORKER_CONCURRENCY=5
MIN_DELAY_BETWEEN_EMAILS_MS=2000
MAX_EMAILS_PER_HOUR_PER_SENDER=200
```

---

## 🐳 Running with Docker (Redis + Postgres)

This project uses Docker for local infrastructure.

### Start Infrastructure

From root folder:

```bash
docker compose up -d
```

**Services started:**
- Redis → `localhost:6379`
- PostgreSQL → `localhost:5432`

---

## ⚙️ Backend Setup (Express + Redis + DB + BullMQ Worker)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:

```env
PORT=4000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reachinbox

FRONTEND_URL=http://localhost:5173

REDIS_HOST=localhost
REDIS_PORT=6379

QUEUE_NAME=email-scheduler
WORKER_CONCURRENCY=5

MIN_DELAY_BETWEEN_EMAILS_MS=2000
MAX_EMAILS_PER_HOUR_PER_SENDER=200

SESSION_SECRET=some_super_secret_value

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

**Important:** Google OAuth Redirect URI must be set to:
```
http://localhost:4000/auth/google/callback
```

### 3. Run Prisma Migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Start Backend

```bash
npm run dev
```

**Backend runs on:** 📍 http://localhost:4000

---

## 🖥 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Frontend

```bash
npm run dev
```

**Frontend runs on:** 📍 http://localhost:5173

---

## ✉️ Ethereal Email Setup (Fake SMTP)

This project uses Ethereal Email for safe email testing.

Instead of manually creating accounts, you can generate senders automatically using:

### API to Create Sender

```
POST /senders/create-ethereal
```

This uses `nodemailer.createTestAccount()`. The sender is stored in DB and can be selected in the Compose modal.

**Sent emails return a preview URL, viewable in your browser.**

---

## 🔌 API Endpoints

### Auth
- `GET /auth/me` → current logged-in user
- `POST /auth/logout` → logout

### Google OAuth
- `GET /auth/google`
- `GET /auth/google/callback`

### Local Auth (Bonus)
- `POST /auth/local/register`
- `POST /auth/local/login`

### Senders
- `GET /senders`
- `POST /senders/create-ethereal`

### Emails
- `POST /emails/bulk-schedule`
- `GET /emails/scheduled`
- `GET /emails/sent`

---

## ✅ Quick Start Commands (Full Setup)

From root folder:

```bash
# 1) Start infrastructure
docker compose up -d

# 2) Run backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# 3) Run frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

---

## 📝 Notes

- This project intentionally avoids cron jobs
- BullMQ delayed jobs ensure schedule reliability
- Redis ensures queue persistence
- DB ensures long-term tracking and idempotency

---

## 👨‍💻 Author

Built by Zee for ReachInbox Hiring Assignment.

⭐ **If you like this repo, consider giving it a star!**