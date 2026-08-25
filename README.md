# Habit Tracker with Streaks

A full-stack, production-ready habit tracking application built with Next.js, PostgreSQL, and Prisma. The application focuses on tracking user habits and calculating calendar-day streaks (both current and longest) based on the user's local timezone.

## Tech Stack

- **Frontend/Application**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Lucide Icons
- **Backend**: Next.js Server-side routes and API endpoints
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Testing**: Vitest, jsdom
- **Infrastructure**: Docker Compose for local database management

---

## Architecture Overview

The backend is built inside the Next.js App Router using Route Handlers as modular API endpoints. Core business logic (timezone calculations, calendar day translations, streak calculations) is completely isolated from HTTP request details to ensure maximum testability.

### Database Model

The relational PostgreSQL schema (managed via Prisma) consists of three models:

1. **User**: Stores credentials and settings.
   - `id` (UUID primary key)
   - `email` (Unique, string)
   - `passwordHash` (Securely hashed using `bcryptjs`)
   - `timezone` (IANA timezone name, e.g., `"America/New_York"`)
2. **Habit**: Represents habits tracked by users.
   - `id` (UUID primary key)
   - `userId` (Foreign key to `User`)
   - `name` (String, required)
   - `description` (String, optional)
3. **CheckIn**: Represents completed habit marks.
   - `id` (UUID primary key)
   - `habitId` (Foreign key to `Habit`)
   - `localDate` (String format `"YYYY-MM-DD"`, representing the calendar day for which the check-in counts)
   - `checkedInAtUtc` (DateTime of transaction, default current UTC)

#### Unique Constraint Enforcement
To prevent double check-ins on the same calendar day for a single habit, the schema enforces a database-level unique composite index:
```prisma
@@unique([habitId, localDate])
```

---

## Core Business Logic

### 1. Local-Day Engine (`src/lib/dates/engine.ts`)

Streaks must be computed based on **local calendar days**, not elapsed 24-hour windows. The local-day engine is responsible for resolving a UTC instant to a timezone-aware calendar date.

- **Implementation**: Uses JavaScript's native `Intl.DateTimeFormat` API which leverages the underlying operating system's standard IANA database to resolve offsets and daylight saving transitions correctly.
- **Midnight & DST Safety**: Date increments and decrements are performed in UTC at noon (12:00:00Z). By performing math in UTC noon, we guarantee that arithmetic operations are immune to DST shifts and local offset jumps, always returning correct chronological day steps.

### 2. Streak Calculation (`src/lib/dates/streaks.ts`)

- **Current Streak**: Consecutive completed local calendar days ending either on *today's local date* (if completed) or *yesterday's local date* (if completed). If neither is completed, the streak is `0`.
- **Longest Streak**: The maximum run of consecutive local date strings (`"YYYY-MM-DD"`) in a habit's complete history.
- **Backfill Integration**: When a missed date is backfilled, the calendar array is re-sorted, and both `currentStreak` and `longestStreak` are automatically re-calculated from the check-in history. Gaps are joined seamlessly.

---

## Authentication & Security

- **Approach**: Simple cookie-based secure sessions. Passwords are hashed using `bcryptjs` (10 salt rounds) and verified during sign-in.
- **Session Tokens**: JWTs signed and encrypted using the lightweight `jose` library, stored in secure HTTP-only cookies:
  - `httpOnly: true` (Protects against XSS)
  - `secure: true` in production (Forces HTTPS)
  - `sameSite: "lax"` (Protects against CSRF)
- **Authorization**: All API Route Handlers inspect the JWT session, verify user ownership on the requested habits, and reject unauthorized or unauthenticated queries with standard JSON error structures.

---

## Timezone Update Behavior

- **Rules**: Users can update their current IANA timezone (e.g. from `"Europe/London"` to `"Asia/Kolkata"`).
- **History Preservation**: When a user changes their timezone, historical check-ins are **not** retroactively modified. Stored `"localDate"` strings represent the local day they were originally recorded for and remain unmodified.
- **New Check-ins**: New check-ins use the user's updated timezone to resolve today's date.

---

## Local Development & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Database configuration**:
   Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

3. **Start PostgreSQL via Docker Compose**:
   ```bash
   docker compose up -d
   ```

4. **Prisma setup & Migration**:
   ```bash
   npx prisma db push # push schema to db
   npx prisma generate # build client
   ```

5. **Run DB Seed Script (Optional)**:
   Pre-populates a developer account (`developer@habittracker.com` / `password123`) with dummy habits:
   ```bash
   npm run prisma db seed
   ```

6. **Start Dev Server**:
   ```bash
   npm run dev
   ```

---

## Running Tests

Automated testing is configured using Vitest. Tests cover local day boundaries, DST transitions, worked assignment example, mock API endpoint routing, and streak logic.

Run tests:
```bash
npm run test
```
