# MIT Salon SaaS

Monorepo layout — each top-level folder can become its **own Git repository**.

```
mit_saloon_saas_project/
├── admin/          → Admin dashboard (port 5174)
├── customer/       → Customer booking app (port 5173)
├── backend/        → REST API + MySQL (port 3001)
├── shared/         → @mit-salon/shared (admin + customer)
├── web/            → Legacy single app (deprecated)
└── guide_code/     → Reference only
```

## Quick start (all apps)

```bash
npm install

# Terminal 1 — API
npm run dev:backend

# Terminal 2 — Admin
npm run dev:admin

# Terminal 3 — Customer
npm run dev:customer
```

Configure **`backend/.env`** with your MySQL password, then:

```bash
npm run db:setup
```

## Split into separate repos

| Repo | Folder to publish | Notes |
|------|-------------------|--------|
| `mit-salon-backend` | `backend/` | Includes `database/` SQL |
| `mit-salon-admin` | `admin/` + copy `shared/` or npm package |
| `mit-salon-customer` | `customer/` + copy `shared/` or npm package |
| `mit-salon-shared` | `shared/` | Optional fourth repo |

After split, point admin/customer at shared via `file:../shared` or published package.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:backend` | API server |
| `npm run dev:admin` | Admin UI |
| `npm run dev:customer` | Customer UI |
| `npm run db:setup` | Initialize MySQL |
| `npm run build` | Build both frontends |

## Legacy

- **`api/`** — old API folder; use **`backend/`** instead (safe to delete after stopping dev servers).
- **`database/`** at root — moved into **`backend/database/`**.
