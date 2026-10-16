# PropMinder

Property management platform.

## Structure

- `client/` — React frontend (to be built)
- `server/` — Node.js + TypeScript API
- `docker-compose.yml` — local services (MongoDB)
- `.github/workflows/ci.yml` — CI pipeline

## Server

### Prerequisites

- Node.js >= 20
- Docker & Docker Compose (for local MongoDB)

### 1. Start MongoDB with Docker

```bash
docker-compose up -d
```

This starts MongoDB on port 27017.

### 2. Configure environment

```bash
cd server
cp .env.example .env
```

Edit `.env` if needed. `JWT_SECRET` should be changed for production.

### 3. Install dependencies

```bash
npm install
```

### 4. Seed the database

```bash
npm run seed
```

### 5. Run the dev server

```bash
npm run dev
```

The API listens on `http://localhost:4000` (or the `PORT` from `.env`).

### Demo credentials

After seeding, you can register your own organization via `POST /api/v1/auth/register`.
There are no pre-seeded demo accounts; the first registration creates the first
organization and owner user.

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start with tsx watch (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled output |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run Jest test suite |

### Money & period conventions

- All money values are stored and transmitted as integer **paise** (1/100 of the
  base currency). For example, ₹100.00 = 10000 paise. No floating-point math is
  used for money.
- Billing periods are `YYYY-MM` strings (e.g. `"2026-03"`). All date comparisons
  are done in UTC.

### API endpoints

All paths are prefixed with `/api/v1`. All routes require authentication
(Bearer JWT) unless marked otherwise.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /health | No | Health check |
| POST | /auth/register | No | Register org + owner, returns JWT |
| POST | /auth/login | No | Login with email + password, returns JWT |
| POST | /properties | Yes | Create a property |
| GET | /properties | Yes | List properties (paginated, `q` search) |
| GET | /properties/:id | Yes | Get a single property |
| PATCH | /properties/:id | Yes | Update a property |
| DELETE | /properties/:id | Yes | Delete a property (409 if it has units) |
| POST | /properties/:propertyId/units | Yes | Create a unit under a property |
| GET | /properties/:propertyId/units | Yes | List units of a property (paginated, sorted by label) |
| GET | /units/:id | Yes | Get a single unit |
| PATCH | /units/:id | Yes | Update a unit |
| DELETE | /units/:id | Yes | Delete a unit (409 if it has an active lease) |
| POST | /tenants | Yes | Create a tenant |
| GET | /tenants | Yes | List tenants (paginated, `q` search on name/phone) |
| GET | /tenants/:id | Yes | Get a single tenant |
| PATCH | /tenants/:id | Yes | Update a tenant |
| DELETE | /tenants/:id | Yes | Delete a tenant (409 if they have leases) |
| POST | /leases | Yes | Create a lease (unit + tenant must be in org) |
| GET | /leases | Yes | List leases (paginated, populated unit/tenant) |
| GET | /leases/:id | Yes | Get a single lease |
| PATCH | /leases/:id | Yes | Update a lease (not allowed if ended) |
| POST | /leases/:id/end | Yes | Mark a lease as ended |
| POST | /rent/generate | Yes | Generate rent charges for a period |
| GET | /rent/charges | Yes | List rent charges (paginated, status filter) |
| GET | /rent/charges/:id | Yes | Get a single rent charge |
| GET | /dashboard | Yes | Dashboard totals, counts, occupancy, overdue list |

### Multi-tenancy

Every request carries a JWT with `userId` and `orgId`. All data queries are
scoped to the caller's `orgId`, so org A can never see org B's data. Auth
endpoints (register/login) run before an org is known and use a global unique
email index.
