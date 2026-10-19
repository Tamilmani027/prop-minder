# PropMinder

Property management platform — a full-stack application for managing properties, units, tenants, leases, and rent collection.

## Overview

PropMinder is a multi-tenant property management system. Each organization (org) is fully isolated — users can only see and manage their own properties, units, tenants, leases, and rent charges.

### Core features

| Module | Capabilities |
|--------|-------------|
| **Auth** | Organization registration, owner login, JWT-based authentication |
| **Properties** | Create, list, view, update, delete properties |
| **Units** | Create and manage units nested under a property |
| **Tenants** | Create and manage tenants, optionally linked to a property + unit |
| **Leases** | Create leases linking a unit + tenant with rent, deposit, due day, and dates; end leases |
| **Rent** | Generate rent charges for a billing period, list and view charges |
| **Dashboard** | Totals, counts, occupancy, and overdue charge list |

### Tech stack

- **Server**: Node.js, Express 5, TypeScript, Mongoose (MongoDB), Zod validation, Pino logging, Jest + Supertest
- **Client**: React 19, TypeScript, Vite, TanStack Query, React Router, Axios, Tailwind CSS, Lucide icons
- **Database**: MongoDB 7 (via Docker Compose locally)
- **CI**: GitHub Actions (typecheck + test on `main` and PRs)

## Repository structure

```
prop-minder/
├── client/              # React frontend (Vite, port 3000)
├── server/              # Node.js + Express API (port 4000)
├── docker-compose.yml   # MongoDB service
├── README.md            # This file (project overview)
└── .github/
    └── workflows/
        └── ci.yml       # CI pipeline
```

## Prerequisites

- Node.js >= 20
- Docker & Docker Compose (for local MongoDB)

## Quick start

### 1. Start MongoDB

```bash
docker-compose up -d
```

This starts MongoDB on port `27017`.

### 2. Set up the server

```bash
cd server
cp .env.example .env   # create .env if it doesn't exist
npm install
npm run dev
```

The API listens on `http://localhost:4000`.

### 3. Set up the client (in a new terminal)

```bash
cd client
npm install
npm run dev            # Vite dev server on http://localhost:3000
```

The client proxies `/api/v1` requests to `http://localhost:4000`.

## Environment variables

### Server (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | API server port |
| `NODE_ENV` | `development` | Node environment |
| `MONGODB_URI` | `mongodb://localhost:27017/propminder` | MongoDB connection string |
| `LOG_LEVEL` | `info` | Pino log level |
| `JWT_SECRET` | *(required)* | Secret for signing JWTs — change for production |
| `JWT_EXPIRES_IN_SECONDS` | `86400` | JWT expiry (1 day) |

### Client (`client/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE` | `http://localhost:4000/api/v1` | API base URL |

## Available scripts

### Server (`cd server`)

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start with `tsx watch` (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled output |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run Jest test suite |

### Client (`cd client`)

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server (port 3000) |
| `npm run build` | Type-check + Vite production build |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview production build |

## API reference

All server paths are prefixed with `/api/v1`. All routes require authentication (Bearer JWT) unless marked otherwise.

### Auth

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/auth/register` | No | Register org + owner, returns JWT |
| `POST` | `/auth/login` | No | Login with email + password, returns JWT |

### Properties

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/properties` | Yes | Create a property |
| `GET` | `/properties` | Yes | List properties (paginated, `q` search) |
| `GET` | `/properties/:id` | Yes | Get a single property |
| `PATCH` | `/properties/:id` | Yes | Update a property |
| `DELETE` | `/properties/:id` | Yes | Delete a property (409 if it has units) |

### Units

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/properties/:propertyId/units` | Yes | Create a unit under a property |
| `GET` | `/properties/:propertyId/units` | Yes | List units of a property (paginated, sorted by label) |
| `GET` | `/units/:id` | Yes | Get a single unit |
| `PATCH` | `/units/:id` | Yes | Update a unit |
| `DELETE` | `/units/:id` | Yes | Delete a unit (409 if it has an active lease) |

### Tenants

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/tenants` | Yes | Create a tenant (optional property + unit) |
| `GET` | `/tenants` | Yes | List tenants (paginated, `q` search on name/phone) |
| `GET` | `/tenants/:id` | Yes | Get a single tenant |
| `PATCH` | `/tenants/:id` | Yes | Update a tenant |
| `DELETE` | `/tenants/:id` | Yes | Delete a tenant (409 if they have leases) |

### Leases

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/leases` | Yes | Create a lease (unit + tenant must be in org) |
| `GET` | `/leases` | Yes | List leases (paginated, populated unit/tenant) |
| `GET` | `/leases/:id` | Yes | Get a single lease |
| `PATCH` | `/leases/:id` | Yes | Update a lease (not allowed if ended) |
| `POST` | `/leases/:id/end` | Yes | Mark a lease as ended |

### Rent

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/rent/generate` | Yes | Generate rent charges for a period |
| `GET` | `/rent/charges` | Yes | List rent charges (paginated, status filter) |
| `GET` | `/rent/charges/:id` | Yes | Get a single rent charge |

### Dashboard

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/dashboard` | Yes | Dashboard totals, counts, occupancy, overdue list |

### Health

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/health` | No | Health check |

## Money & period conventions

- All money values are stored and transmitted as integer **paise** (1/100 of the base currency). For example, ₹100.00 = 10000 paise. No floating-point math is used for money.
- Billing periods are `YYYY-MM` strings (e.g. `"2026-03"`). All date comparisons are done in UTC.

## Multi-tenancy

Every request carries a JWT with `userId` and `orgId`. All data queries are scoped to the caller's `orgId`, so org A can never see org B's data. Auth endpoints (register/login) run before an org is known and use a global unique email index.

## Testing

```bash
cd server
npm test
```

Runs the Jest suite (62 tests across 7 suites) against an in-memory MongoDB instance.

## CI

GitHub Actions runs on push to `main` and on pull requests:

1. `npm ci` — install dependencies
2. `npm run typecheck` — TypeScript type-check
3. `npm test` — Jest test suite

## License

ISC