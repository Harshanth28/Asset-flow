# AssetFlow — Implementation Blueprint

Enterprise Asset & Resource Management System built with NestJS + Prisma + SQLite backend, with React frontend planned.

---

## Project Structure

```
/
├── backend/              # NestJS API, Prisma ORM, SQLite
│   ├── prisma/
│   │   ├── schema.prisma # 13 models (full domain)
│   │   ├── migrations/   # SQLite migrations
│   │   └── seed.ts       # Test data seeder
│   ├── src/
│   │   ├── allocations/  # Allocation & transfer conflict logic
│   │   ├── assets/       # Asset CRUD, auto-tag, search
│   │   ├── audits/       # Audit cycles, findings, close
│   │   ├── auth/         # JWT auth (register/login/me)
│   │   ├── bookings/     # Overlap-validated time-slot booking
│   │   ├── categories/   # Asset category CRUD
│   │   ├── common/       # RolesGuard, decorators
│   │   ├── cron/         # Scheduler: overdue checks, auto transitions
│   │   ├── dashboard/    # KPI aggregation
│   │   ├── departments/  # CRUD + hierarchy
│   │   ├── employees/    # Employee directory + role promotion
│   │   ├── logs/         # Activity audit trail
│   │   ├── maintenance/  # Approval workflow (5 states)
│   │   ├── notifications/# In-app notifications
│   │   ├── prisma/       # Prisma service (SQLite adapter)
│   │   ├── reports/      # Analytics queries
│   │   └── users/        # User module, guards, decorators
│   ├── package.json
│   └── prisma.config.ts
├── docker-compose.yml    # PostgreSQL for production (optional)
├── implementation_plan.md
├── README.md
└── task.md
```

---

## Tech Stack

### Backend (Complete)
| Component | Technology |
|-----------|-----------|
| Framework | NestJS (modular architecture) |
| ORM | Prisma 7 |
| Database | SQLite (dev), PostgreSQL (prod via docker-compose) |
| Auth | JWT + bcrypt, Passport strategies |
| Validation | class-validator + class-transformer |
| API Docs | Swagger/OpenAPI |
| Scheduler | node-cron |
| Real-time | Socket.IO (planned) |

### Frontend (Not Started)
| Component | Technology |
|-----------|-----------|
| Build Tool | Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Redux Toolkit |
| Routing | React Router DOM |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Calendar | FullCalendar |

---

## Database Schema (13 Models)

| Model | Purpose |
|-------|---------|
| Department | Hierarchical org units (parent FK self) |
| AssetCategory | Typed categories (JSON schema fields) |
| Employee | Users with role (employee/dept_head/asset_manager/admin) |
| Asset | Full lifecycle with 7 states + holder tracking |
| Allocation | Conflict-safe assignment ledger |
| TransferRequest | Approval-gated transfer workflow |
| Booking | Time-slot reservation with overlap check |
| MaintenanceRequest | 5-state approval workflow |
| AuditCycle | Structured verification cycles |
| AuditAssignment | Auditors per cycle |
| AuditFinding | Verified/Missing/Damaged results |
| Notification | In-app notifications |
| ActivityLog | Full audit trail |

---

## Asset State Machine

```
available → allocated, reserved, under_maintenance, retired, disposed
allocated → available (return), lost (audit)
reserved → available (complete/cancel)
under_maintenance → available (resolved)
retired → disposed
lost, disposed → terminal
```

---

## Key Business Rules (Implemented)

- **Allocation conflict**: Row-lock check (`SELECT ... FOR UPDATE`) — cannot allocate already-taken asset
- **Booking overlap**: `startTime < new.endTime AND endTime > new.startTime` — transactional validation
- **Signup**: Always creates `role=employee`, server-enforced, no self-elevation
- **Promotion**: Admin-only endpoint `PATCH /employees/:id/role`
- **Audit close**: Transactional — all Missing assets → Lost status in one atomic operation
- **Auto-tag**: Assets get `AF-0001`-style sequential tags
- **Notifications**: Emitted on every state-changing endpoint

---

## API Endpoints Overview

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | All authenticated |

### Departments
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/departments` | All |
| POST | `/api/departments` | Admin |
| GET | `/api/departments/:id` | All |
| PUT | `/api/departments/:id` | Admin |
| DELETE | `/api/departments/:id` | Admin |

### Categories
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/categories` | All |
| POST | `/api/categories` | Admin |
| GET | `/api/categories/:id` | All |
| PUT | `/api/categories/:id` | Admin |
| DELETE | `/api/categories/:id` | Admin |

### Employees
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/employees` | All |
| POST | `/api/employees` | Admin |
| PATCH | `/api/employees/:id/role` | Admin |

### Assets
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/assets` | All |
| POST | `/api/assets` | Asset Manager, Admin |
| GET | `/api/assets/search` | All |
| GET | `/api/assets/:id` | All |
| PUT | `/api/assets/:id` | Asset Manager, Admin |

### Allocations
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/allocations` | Dept Head, Asset Manager, Admin |
| POST | `/api/allocations/:id/return` | Asset Manager, Admin |
| GET | `/api/transfers` | All |
| POST | `/api/transfers` | Employee+ |
| PATCH | `/api/transfers/:id/approve` | Dept Head, Asset Manager, Admin |
| PATCH | `/api/transfers/:id/reject` | Dept Head, Asset Manager, Admin |

### Bookings
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/bookings` | All |
| POST | `/api/bookings` | All |
| PUT | `/api/bookings/:id` | Owner |
| DELETE | `/api/bookings/:id` | Owner |

### Maintenance
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/maintenance` | All |
| POST | `/api/maintenance` | All |
| PATCH | `/api/maintenance/:id/approve` | Asset Manager, Admin |
| PATCH | `/api/maintenance/:id/reject` | Asset Manager, Admin |
| PATCH | `/api/maintenance/:id/assign` | Asset Manager, Admin |
| PATCH | `/api/maintenance/:id/resolve` | Technician, Admin |

### Audits
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/audits` | Admin |
| POST | `/api/audits` | Admin |
| PATCH | `/api/audits/:id/close` | Admin |
| POST | `/api/audits/:id/findings` | Auditor |

### Dashboard
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/dashboard/kpis` | All |
| GET | `/api/dashboard/overdue` | All |

---

## Build Status

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Foundation (Prisma, Auth, Seed) | ✅ Complete |
| 1 | Master Data (Departments, Categories, Employees) | ✅ Complete |
| 2 | Asset Core (Registration, Search, Lifecycle) | ✅ Complete |
| 3 | Conflict Workflows (Allocations, Bookings) | ✅ Complete |
| 4 | Approval Workflows (Maintenance, Audits) | ✅ Complete |
| 5 | Cross-cutting (Cron, Notifications, Logs) | ✅ Complete |
| 6 | Views/API (Dashboard, Reports) | ✅ Complete |
| 7 | Frontend (React screens) | 🔄 Not Started |

---

## Running the Project

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
# Server: http://localhost:3000
# Docs: http://localhost:3000/api/docs
```

## Test Credentials

See `README.md` for full list.
