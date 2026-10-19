# PropMinder Client

React frontend for the PropMinder property management platform.

## Tech stack

- **Framework**: React 19
- **Build tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router DOM
- **Data fetching**: TanStack Query (React Query)
- **HTTP client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Validation**: Zod
- **Linting**: Oxlint

## Project structure

```
client/
├── src/
│   ├── main.tsx          # Entry point
│   ├── App.tsx           # Route definitions
│   ├── pages/            # Page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── PropertiesPage.tsx
│   │   ├── PropertyDetailPage.tsx
│   │   ├── UnitsPage.tsx
│   │   ├── TenantsPage.tsx
│   │   └── LeasesPage.tsx
│   ├── components/
│   │   ├── Navbar.tsx    # Layout + ProtectedRoute
│   │   └── ui/           # Shared UI primitives (Button, Input, Card, Badge)
│   ├── context/
│   │   └── AuthContext.tsx   # Auth state + token management
│   ├── hooks/
│   │   └── useAuth.ts    # Auth hook
│   ├── services/         # API service layer (Axios-based)
│   │   ├── api.ts        # Axios instance + auth interceptor
│   │   ├── authService.ts
│   │   ├── propertyService.ts
│   │   ├── unitService.ts
│   │   ├── tenantService.ts
│   │   ├── leaseService.ts
│   │   └── rentService.ts
│   ├── lib/
│   │   ├── validation.ts # Client-side Zod schemas
│   │   └── utils.ts
│   └── types/            # TypeScript interfaces
├── vite.config.ts        # Vite config (port 3000, /api/v1 proxy)
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js >= 20

## Getting started

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Configure environment

Create `client/.env`:

```env
VITE_API_BASE=http://localhost:4000/api/v1
```

### 3. Start the dev server

```bash
npm run dev
```

The client runs on `http://localhost:3000` and proxies `/api/v1` requests to `http://localhost:4000`.

Make sure the server is running (see `../server/README.md`).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server (port 3000) |
| `npm run build` | Type-check + Vite production build |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview production build |

## Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Public landing page |
| Login | `/login` | Sign in |
| Register | `/register` | Register a new organization |
| Dashboard | `/dashboard` | Overview stats |
| Properties | `/properties` | List properties; add property |
| Property Detail | `/properties/:id` | View property + units |
| Units | `/properties/:propertyId/units` | Manage units for a property |
| Tenants | `/tenants` | List tenants; add tenant (optional property + unit) |
| Leases | `/leases` | List leases; create lease (unit + tenant) |

## Authentication

The client stores the JWT in `localStorage` under the `token` key. The Axios instance (`src/lib/api.ts`) automatically attaches the `Authorization: Bearer <token>` header to every request. On a `401` response, the user is redirected to `/login`.

## Notes

- All money values are handled as integer paise on the server; the client displays them formatted with the ₹ symbol.
- Tenant creation supports an optional Property → Unit dependent dropdown: selecting a property loads its units, and selecting a unit stores `unitId` on the tenant.