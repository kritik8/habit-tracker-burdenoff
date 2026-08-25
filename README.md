# Habit Tracker with Streaks

A full-stack, production-ready habit tracking application built with Next.js, PostgreSQL, and Prisma. The application focuses on tracking user habits and calculating calendar-day streaks (both current and longest) based on the user's local timezone.

## Tech Stack

- **Frontend/Application**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Lucide Icons
- **Backend**: Next.js Server-side routes and API endpoints
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Testing**: Vitest, jsdom
- **Infrastructure**: Docker Compose for local database management

## Local Development

To run the application locally:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the database**:
   Ensure Docker Desktop is running, then start the PostgreSQL container:
   ```bash
   docker compose up -d
   ```

3. **Database Migration**:
   Run migrations and generate the client (in Phase 2, real schemas will be added):
   ```bash
   npm run db:generate
   ```

4. **Start Next.js dev server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the homepage.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```

Key variables configured in `.env.example`:
- `POSTGRES_USER` — Local database user
- `POSTGRES_PASSWORD` — Local database password
- `POSTGRES_DB` — Local database name
- `POSTGRES_PORT` — Port to expose database on local machine (default: 5432)
- `DATABASE_URL` — Connection URL for Prisma

## Database

Manage the database schema and clients using:
- `npm run db:generate` — Regenerate the Prisma Client
- `npm run db:migrate` — Create and apply migrations in development
- `npm run db:studio` — Open Prisma Studio GUI for database exploration

## Testing

Run tests using Vitest:
- `npm run test` — Run all tests once
- `npm run test:watch` — Start Vitest in interactive watch mode

## Project Structure

```text
src/
  app/           # Next.js App Router routes, pages, and API endpoints
  components/    # Reusable presentation and layout components (e.g., shadcn/ui)
  lib/           # Shared utility directories
    auth/        # Authentication logic (placeholder)
    db/          # Prisma database client utility
    dates/       # Timezone and streak calendar logic (placeholder)
    validations/ # Zod schema validations (placeholder)
  types/         # Shared TypeScript interfaces and types
prisma/          # Schema definitions and migrations
tests/           # Automated testing suites
```
