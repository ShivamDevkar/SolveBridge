# SolveBridge

SolveBridge is a problem-first service marketplace MVP. Customers describe a
repair or service problem, nearby professionals submit structured proposals,
and the customer selects a proposal to create a protected job workspace.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Supabase Auth
- **Backend:** Express 5, TypeScript, Zod validation
- **Data:** PostgreSQL via Prisma 7 and `@prisma/adapter-pg`
- **Authentication:** Supabase access tokens; application profiles are stored
  in PostgreSQL

## Repository layout

```text
frontend/  React application
backend/   Express API, Prisma schema/migrations, seed and smoke tests
```

## Local setup

### Backend

1. Copy `backend/.env.example` to `backend/.env` (or create the equivalent
   environment file) and provide the PostgreSQL and Supabase settings.
2. Install dependencies and apply the existing migrations:

   ```powershell
   cd backend
   npm install
   npx prisma migrate deploy
   npm run db:seed
   npm run dev
   ```

   The API runs on `http://localhost:4000` by default.

### Frontend

Create `frontend/.env.local` with:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
VITE_BACKEND_URL=http://localhost:4000
```

Then run:

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server normally runs on `http://localhost:5173`.
`FRONTEND_URL` in the backend environment must match the actual frontend
origin when using a different port.

## API conventions

All application endpoints use `/api/v1` and return either:

```json
{ "success": true, "data": {} }
```

or:

```json
{ "success": false, "message": "...", "code": "..." }
```

Money is stored as paise in PostgreSQL and exposed as rupees through the API.
Customer and professional IDs/roles are derived from the authenticated token;
they are never trusted from request payloads.

Implemented workflow areas include:

- authentication/profile synchronisation
- categories and notifications
- customer problems with masked professional views
- professional proposals and proposal acceptance
- jobs, strict status transitions, scheduling and activity notes
- protected job messaging and read receipts
- reviews, professional responses and rating aggregation
- admin metrics, user status management, verification decisions, categories
  and audit logs

Deferred MVP areas include payments, AI matching, real-time transport,
disputes, quote revisions and advanced analytics.

## Verification

Run the frontend checks:

```powershell
cd frontend
npm run typecheck
npm run build
```

Run backend checks while the API is listening on port 4000:

```powershell
cd backend
npm run typecheck
npm run smoke
```

The smoke suite creates/reuses Supabase test users and exercises the complete
backend workflow, including admin APIs. It currently covers **201 checks**.
The default test identities are:

- `sb.smoke.customer@gmail.com`
- `sb.smoke.pro@gmail.com`
- `sb.smoke.pro2@gmail.com`
- `sb.smoke.admin@gmail.com` (promoted directly in the database by the smoke
  fixture because public profile sync intentionally cannot create admins)

Default password: `SbTest!2026`. Use test-only accounts and never commit real
credentials or environment files.

## Notes for development

- Do not reset the database or delete migration history.
- Keep frontend domain types and page UI stable; API translation belongs in
  `frontend/src/services/http/`.
- If a browser uses Vite port 5174 or another port, update the backend CORS
  origin or restart Vite on the configured port.
- If port 4000 returns unexpected 404s, check for an older `tsx`/nodemon
  process still holding the port.
