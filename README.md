# AssetFlow

Enterprise Asset & Resource Management System

A centralized ERP platform for organizations to track, allocate, and maintain physical assets and shared resources — equipment, furniture, vehicles, rooms — through structured lifecycles, conflict-free allocation, approval workflows, and audit cycles.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS (Node.js) |
| **Database** | SQLite via Prisma ORM |
| **Auth** | JWT + bcrypt, role-based guards |
| **API** | REST with Swagger docs |
| **Scheduled Jobs** | node-cron |
| **Frontend** | React + Vite + TypeScript + Tailwind + shadcn/ui *(coming soon)* |

---

## Project Structure

```
/
├── backend/
│   ├── prisma/               # Schema, migrations, seed
│   ├── src/
│   │   ├── allocations/      # Asset allocation & transfer requests
│   │   ├── assets/           # Asset registration & directory
│   │   ├── audits/           # Audit cycles & discrepancy reports
│   │   ├── auth/             # JWT auth, signup/login
│   │   ├── bookings/         # Resource booking with overlap validation
│   │   ├── categories/       # Asset categories
│   │   ├── common/           # Guards, decorators (Roles, CurrentUser)
│   │   ├── cron/             # Scheduled jobs (overdue alerts)
│   │   ├── dashboard/        # KPI aggregation queries
│   │   ├── departments/      # Department hierarchy management
│   │   ├── employees/        # Employee directory
│   │   ├── logs/             # Activity log
│   │   ├── maintenance/      # Maintenance approval workflow
│   │   ├── notifications/    # In-app notifications
│   │   ├── prisma/           # Prisma service module
│   │   ├── reports/          # Analytics & reports
│   │   ├── users/            # User management, role promotion
│   │   ├── app.module.ts     # Root module
│   │   └── main.ts           # Entry point (port 3000)
│   └── package.json
├── docker-compose.yml         # PostgreSQL (optional, for production)
├── implementation_plan.md
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm

### Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Generate Prisma client & run migrations
npx prisma migrate dev

# 3. Seed the database
npx prisma db seed

# 4. Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000/api` with Swagger docs at `http://localhost:3000/api/docs`.

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@assetflow.com | admin123 |
| Dept Head (IT) | sarah.chen@assetflow.com | password123 |
| Dept Head (HR) | michael.torres@assetflow.com | password123 |
| Dept Head (Facilities) | jennifer.park@assetflow.com | password123 |
| Asset Manager | david.kim@assetflow.com | password123 |
| Employee | priya.sharma@assetflow.com | password123 |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new employee |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user profile |

### Organization
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/api/departments` | Department hierarchy |
| CRUD | `/api/categories` | Asset categories |
| CRUD | `/api/employees` | Employee directory |
| PATCH | `/api/employees/:id/role` | Promote role (Admin only) |

### Assets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/assets` | List/Create assets |
| GET | `/api/assets/search` | Search & filter |
| GET/PUT/DELETE | `/api/assets/:id` | Single asset CRUD |

### Allocations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/allocations` | Allocate asset (with conflict check) |
| POST | `/api/allocations/:id/return` | Return asset |
| GET/POST | `/api/transfers` | Transfer requests |
| PATCH | `/api/transfers/:id/approve` | Approve transfer |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/bookings` | List/Create bookings (overlap validated) |
| PUT | `/api/bookings/:id` | Reschedule booking |
| DELETE | `/api/bookings/:id` | Cancel booking |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/maintenance` | List/Create requests |
| PATCH | `/api/maintenance/:id/approve` | Approve request |
| PATCH | `/api/maintenance/:id/reject` | Reject request |
| PATCH | `/api/maintenance/:id/assign` | Assign technician |
| PATCH | `/api/maintenance/:id/resolve` | Mark resolved |

### Audits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/audits` | List/Create cycles |
| POST | `/api/audits/:id/close` | Close cycle (transactional) |
| POST | `/api/audits/:id/findings` | Record finding |

### Dashboard & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/kpis` | KPI cards |
| GET | `/api/dashboard/overdue` | Overdue items |
| GET | `/api/reports/utilization` | Asset utilization |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | User notifications |
| PATCH | `/api/notifications/:id/read` | Mark as read |

### Activity Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs` | Activity log (Admin) |

---

## Domain Model

The system uses 13 database models with full relational integrity:

- **Department** — Hierarchical org units
- **AssetCategory** — Typed categories with JSON schema fields
- **Employee** — Users with role-based access
- **Asset** — Full lifecycle management (7 states)
- **Allocation** — Conflict-safe asset assignment
- **TransferRequest** — Approval-gated transfers
- **Booking** — Time-slot resource reservations
- **MaintenanceRequest** — Approval workflow for repairs
- **AuditCycle / AuditAssignment / AuditFinding** — Structured audit cycles
- **Notification** — In-app notifications
- **ActivityLog** — Audit trail

---

## Key Business Rules

1. **Asset State Machine** — Explicit transition table enforced server-side
2. **Allocation Conflict** — Row-level locking with `SELECT ... FOR UPDATE`
3. **Booking Overlap** — Transactional overlap validation
4. **Role Enforcement** — Admin-only promotions, guards on every route
5. **Signup Restriction** — Always creates `employee` role, never self-elevated

---

## Build Phases

### ✅ Phase 0: Foundation (Complete)
- Prisma schema + migrations
- JWT auth with role-based guards
- Seed script with test data

### ✅ Phases 1-4: Core Modules (Complete)
- Departments, Categories, Employees
- Assets, Allocations, Transfers
- Bookings (overlap validation)
- Maintenance (approval workflow)
- Audits (structured cycles)

### ✅ Phase 5: Cross-cutting (Complete)
- Cron jobs for overdue detection
- Notifications on all state changes
- Activity log middleware

### ✅ Phase 6: Views/API (Complete)
- Dashboard KPI endpoints
- Reports & analytics endpoints

### 🔄 Phase 7: Frontend (Not Started)
- React + Vite + TypeScript + Tailwind + shadcn/ui
- All 10 screens from the spec

---

## License

MIT
