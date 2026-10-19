# PropMinder Server

Node.js + Express API for the PropMinder property management platform.

## Tech stack

- **Runtime**: Node.js >= 20
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: MongoDB 7 (Mongoose ODM)
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Jest + Supertest + mongodb-memory-server

## Project structure

```
server/
├── src/
│   ├── app.ts              # Express app factory (middleware + routes)
│   ├── server.ts           # Entry point (DB connect, listen, graceful shutdown)
│   ├── config/
│   │   └── env.ts          # Environment variables
│   ├── db/
│   │   ├── connect.ts      # Mongoose connection
│   │   └── tenantPlugin.ts # Multi-tenancy plugin (orgId scoping)
│   ├── middleware/
│   │   ├── validate.ts     # Zod request validation middleware
│   │   └── errorHandler.ts # Centralized error handling
│   ├── utils/
│   │   ├── AppError.ts     # Custom error class
│   │   ├── AppError.test.ts
│   │   ├── getAuth.ts      # Extract orgId/userId from response locals
│   │   ├── logger.ts       # Pino logger
│   │   ├── pagination.ts   # Pagination helpers
│   │   ├── period.ts       # Period utilities
│   │   └── zod.ts          # Shared Zod schemas (ObjectId, pagination, period)
│   └── modules/
│       ├── auth/           # Registration, login, JWT
│       ├── property/       # Properties + nested units
│       ├── unit/           # Units (nested + standalone)
│       ├── tenant/         # Tenants
│       ├── lease/          # Leases (unit + tenant)
│       ├── rent/           # Rent charge generation & listing
│       ├── dashboard/      # Dashboard aggregates
│       ├── organization/   # Organization model
│       └── user/           # User model
├── tests/                  # Jest test suites
├── package.json
├── tsconfig.json
└── tsconfig.test.json
```

## Prerequisites

- Node.js >= 20
- MongoDB (local or via Docker)

## Getting started

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment

Create `server/.env` (copy from `.env.example` if available):

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/propminder
LOG_LEVEL=info
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN_SECONDS=86400
```

### 3. Start MongoDB (via Docker)

```bash
docker-compose up -d   # run from the repo root
```

### 4. Run the dev server

```bash
npm run dev
```

The API listens on `http://localhost:4000`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start with `tsx watch` (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled output (`node dist/server.js`) |
| `npm run typecheck` | Type-check without emitting (`tsc --noEmit`) |
| `npm test` | Run Jest test suite |

## Multi-tenancy

The `tenantPlugin` Mongoose plugin adds a required, indexed `orgId` field to every schema that uses it. A query helper (`skipTenant`) allows bypassing org scoping for auth-related lookups that happen before the org is known.

All authenticated routes extract `orgId` from the JWT via `getAuth(res)`, and every downstream query is scoped to that org. This ensures org A can never access org B's data.

## Validation

Request bodies, query parameters, and URL params are validated with Zod via the `validate` middleware. Validation errors return `400` with a `VALIDATION_ERROR` code and a `details` array listing each failing field:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [
      { "where": "body", "path": "propertyId", "message": "Invalid ObjectId" }
    ]
  }
}
```

Optional ObjectId fields (e.g. `tenant.propertyId`, `tenant.unitId`) treat an empty string `""` as "not set" — they are normalized to `undefined` before validation.

## Money & period conventions

- Money is stored and transmitted as integer **paise** (1/100 of the base currency). ₹100.00 = 10000 paise.
- Billing periods are `YYYY-MM` strings (e.g. `"2026-03"`).

## Testing

```bash
npm test
```

Tests run against an in-memory MongoDB (`mongodb-memory-server`). No external database is required.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push to `main` and on pull requests:

1. `npm ci`
2. `npm run typecheck`
3. `npm test`