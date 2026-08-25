# Habit Tracker with Streaks

A full-stack, production-ready habit tracking take-home assignment focused on calculating timezone-aware calendar day streaks.

---

## Overview
This application tracks user habits (e.g., "Drink Water", "Read") and computes current/longest completion streaks. The key engineering requirement is that **streaks operate on local calendar days rather than arbitrary 24-hour elapsed windows.**

## Features
- **Stateless HTTP-Only Sessions**: JWT authentication using `jose` cookies.
- **Calendar-Day Streak Engine**: Computes DST-proof day transitions at UTC noon.
- **Timezone Modifications**: Users can modify their profile timezone settings without shifting historical check-in data.
- **Visual Log History & Calendar**: Detailed habit grid showing completion statuses.
- **Retroactive Backfilling**: Insert past check-ins with automatic streak joins.
- **Log Pagination**: Bounded history logs to prevent giant payload sizes.

## Tech Stack
- **Frontend & Routing**: Next.js 16 (App Router with `src/proxy.ts` routing protection)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Database**: PostgreSQL & Prisma ORM
- **Security**: JWT cookie encryption (`jose`), password hashing (`bcryptjs`), and Zod validation schemas
- **Testing**: Vitest, jsdom
- **CI & Build Pipeline**: GitHub Actions

## Architecture
```
┌───────────────────────────────────────────────────────────────┐
│                          Next.js UI                           │
└───────────────┬───────────────────────────────▲───────────────┘
                │ HTTP Requests                 │ JSON Payload
                ▼                               │
┌───────────────────────────────────────────────┴───────────────┐
│                   App Router API Endpoints                    │
│   (Checks Auth Session, resolves User Timezone context)        │
└───────────────┬───────────────────────────────▲───────────────┘
                │ Invokes methods               │ Returns computed values
                ▼                               │
┌───────────────────────────────────────────────┴───────────────┐
│                     Isolated Date Engine                      │
│   (Resolves UTC offsets, calendar dates, & streak counts)    │
└───────────────────────────────┬───────────────────────────────┘
                                ▼ Queries
┌───────────────────────────────────────────────────────────────┐
│                    Prisma ORM & PostgreSQL                    │
└───────────────────────────────────────────────────────────────┘
```

## Database Model
Managed in [`prisma/schema.prisma`](file:///c:/Users/Kratik/IIIT%20Academics/Hustle/burdenoff-assignment/prisma/schema.prisma):
- **User**: credentials (`passwordHash`), unique email, and IANA timezone name (e.g., `"America/New_York"`).
- **Habit**: name, description, owner relationship.
- **CheckIn**: tracks individual logs. Stored with a composite index ensuring that a user can never check in twice for the same calendar date.

### Database Enforcement
To guarantee data integrity at the database level, we enforce a composite unique index:
```prisma
@@unique([habitId, localDate])
```
Any attempt to insert a duplicate check-in for the same habit day is rejected by PostgreSQL, throwing a unique constraint violation that the API maps to a clean `400 Bad Request` error.

## Local-Day Logic
A streak is determined strictly by the user's **local calendar days**, not elapsed hours. 
- **Storage**: All database transaction timestamps (`checkedInAtUtc`) are stored in UTC. However, each check-in record stores a `localDate` string format `YYYY-MM-DD` representing the calendar day for which it counts.
- **Resolution**: We resolve the user's timezone-aware date using JavaScript's native `Intl.DateTimeFormat` API based on their configured IANA timezone string.
- **Arithmetic**: Calendar calculations (e.g., finding yesterday's date to check if a streak is active) are done in UTC at noon (`12:00:00Z`). Math at UTC noon is immune to DST shifts and offset jumps.
- **Authoritative Server**: The frontend does not determine streak states or check-in validity. It consumes calculated streak properties (`currentStreak`, `longestStreak`, `isCompletedToday`) returned by the API.

## Streak Calculation
- **Algorithm**: Check-in records are ordered chronologically. We iterate through the check-in calendar dates:
  - If a consecutive sequence of days is found, the streak counter increments.
  - If a gap is found, the current streak terminates, and a new sequence starts.
- **Current Streak**: Active if the sequence extends to today's local date or yesterday's local date. If not, the current streak is `0`.
- **Longest Streak**: The maximum streak length achieved in the entire check-in history.
- **Backfill joining**: If a check-in is backfilled between two disconnected streaks, the gap is closed, and streaks are recalculated instantly.

## Timezone Handling
- **Profile Changes**: Users can change their IANA timezone under Settings (e.g., moving from `America/New_York` to `Asia/Kolkata`).
- **History Preservation**: Stored historical `localDate` strings are preserved. If a check-in was logged under `America/New_York` as `"2026-03-10"`, it remains `"2026-03-10"` regardless of timezone shifts. This prevents historic streaks from retroactively breaking.
- **New check-ins**: Any check-in created after a timezone update uses the newly updated timezone profile to resolve today's date.

## Validation & Edge Cases
The server validates check-ins and rejects:
1. **Duplicates**: Rejects same-day entries.
2. **Future check-ins**: Rejects local dates that are ahead of the user's timezone-resolved calendar date.
3. **Pre-creation check-ins**: Rejects dates before the habit's `createdAt` local date.
4. **Ownership breaches**: Blocks modifying or viewing habits belonging to other users.

## API Overview
- `/api/auth/signup` (POST): Signs up a user and initializes their timezone.
- `/api/auth/login` (POST): Establishes session.
- `/api/auth/logout` (POST): Clears session.
- `/api/auth/me` (GET/PUT): Retrieves details or updates timezone preferences.
- `/api/habits` (GET/POST): Lists/creates habits.
- `/api/habits/[id]` (GET/PUT/DELETE): Standard detail and CRUD endpoints. GET supports `?page=X&limit=Y` parameters.
- `/api/habits/[id]/check-in` (POST/DELETE): Records today/backfilled check-ins or removes an entry.

## Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```
3. **Spin up database**:
   ```bash
   docker compose up -d
   ```
4. **Run migrations**:
   ```bash
   npx prisma db push
   ```
5. **Start dev server**:
   ```bash
   npm run dev
   ```

## Environment Variables
Configured in [`.env.example`](file:///c:/Users/Kratik/IIIT%20Academics/Hustle/burdenoff-assignment/.env.example):
- `DATABASE_URL`: Connection string to PostgreSQL.
- `JWT_SECRET`: Security seed to encrypt and verify cookies.
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT`: PostgreSQL container credentials.

## Docker
A database container configuration is provided in [`docker-compose.yml`](file:///c:/Users/Kratik/IIIT%20Academics/Hustle/burdenoff-assignment/docker-compose.yml). Run `docker compose up -d` to provision a local PostgreSQL instance binding to port `5432` with a persistent Docker volume (`postgres_data`).

## Testing
Unit and integration tests are run via **Vitest**.
Run tests:
```bash
npm run test
```
The test suite consists of 21 tests covering:
- Kolkata midnight shifts.
- New York daylight saving offset transitions.
- Worked streaks calculation examples.
- Zod validation and API access control.

*Note: Since developer Docker daemons are environment-dependent, database requests in integration tests are mocked, avoiding dependency on a live PostgreSQL database during testing.*

## CI
Configured in [`.github/workflows/ci.yml`](file:///c:/Users/Kratik/IIIT%20Academics/Hustle/burdenoff-assignment/.github/workflows/ci.yml). Automatically triggers on push and pull requests to `main` checking:
1. Lint checks (`npm run lint`).
2. Test checks (`npm run test`).
3. Type-checks (`npx tsc --noEmit`).
4. Production build compilation (`npm run build`).

## Design Decisions
- **HTTP-Only Sessions**: Bypasses local storage vulnerabilities.
- **Intl API**: Relies on browser/runtime native formatting instead of bloated external timezone parsing packages, keeping bundle size tiny.
- **Lightweight Pagination**: Slices the memory array of the detail page logs to prevent huge JSON loads while retaining the full calendar history list on the same fetch.

## Tradeoffs
- **Mock-based tests**: Eliminates integration test requirements for active local docker daemons during test runs, but relies on mocking the database layer. Verified via production database seeds.
- **In-memory slice pagination**: Simple and efficient for typical habit logs (~hundreds of records), but would need database-level pagination if check-ins scaled to thousands.
