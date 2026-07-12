# Full-Stack Blueprint: Odoo AssetFlow

This blueprint details the implementation plan for the **Odoo AssetFlow** application using a split monorepo architecture (NestJS Backend + React/TS Frontend).

---

## 1. Project Structure

We will structure the project into two main directories:
```
/
├── backend/            # NestJS API, Prisma, MongoDB
└── frontend/           # React + TypeScript + Vite + Tailwind + shadcn/ui
```

---

## 2. Tech Stack & Architecture

### Backend (`/backend`)
- **Framework**: NestJS (Modular structure: `users`, `assets`, `bookings`, `allocations`, `maintenance`, `audits`, `departments`)
- **ORM**: Prisma
- **Database**: MongoDB (Users, Roles, Departments, Categories, Assets, Allocations, Transfers, Bookings, Maintenance, Audits, AuditResults, Notifications, Logs)
- **Auth**: JWT Authentication + bcrypt password hashing
- **Real-time**: Socket.IO for notifications
- **Jobs**: `node-cron` for overdue return checks and booking reminders

### Frontend (`/frontend`)
- **Build Tool**: Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **State Management**: Redux Toolkit (for global state/user session) + React Context/hooks
- **Routing**: React Router DOM (protected routes by Role)
- **Forms**: React Hook Form + Zod
- **Visuals**: FullCalendar (resource bookings) + Recharts (analytics dashboards)

---

## 3. Database Schema (Prisma `schema.prisma`)

We will define models matching the requested structure using MongoDB-compatible structures (such as string ObjectIds with `@map("_id") @db.ObjectId` annotations):
1. `User` & `Role` (Employee, Admin, Asset Manager, Department Head)
2. `Department` (hierarchical relationship)
3. `AssetCategory` (custom fields supported via JSON/embedded documents)
4. `Asset` (auto-generated code sequence prefix `AF-`)
5. `AssetAllocation` & `TransferRequest` (conflict control rules enforced at the database/API level)
6. `ResourceBooking` (overlap validation constraints)
7. `MaintenanceRequest` (asset status transitions from Available -> Maintenance -> Available)
8. `AuditCycle` & `AuditResult` (auditing verification runs)
9. `Notification` & `ActivityLog`

---

## 4. Key Implementation Steps

### Phase 1: Backend Setup
1. Initialize NestJS application in `/backend`.
2. Configure Prisma with MongoDB connection string.
3. Design and generate the database schema using Prisma `db pull`/`db push`.
4. Implement JWT authentication and role-based guards (`@Roles('admin')`).
5. Develop REST API modules:
   - Organization (Departments, Categories, Employee Promotion)
   - Assets (CRUD, sequence generator, history views)
   - Allocations (Check-in/out, transfer workflows with locks)
   - Bookings (Overlap validator module)
   - Maintenance (Approval workflows)
   - Audits (Cycles, discrepancy generators)
   - Analytics (Data aggregation for Recharts)

### Phase 2: Frontend Setup
1. Initialize Vite React + TypeScript project in `/frontend`.
2. Install Tailwind CSS and configure shadcn/ui components.
3. Set up Routing (Public: Login/Signup. Protected: Dashboard, Org Setup, Directory, Bookings, etc.).
4. Integrate Axios API client and Redux storage.
5. Create screens with rich custom-styled charts (Recharts) and interactive calendar (FullCalendar).

---

## 5. Verification Plan

### Automated Testing
- Backend unit tests for conflict resolution and overlap checking.
- Prisma seed script containing baseline roles, mock assets, and admin credentials.

### Manual Verification
- Visual inspection of all 10 screens.
- Multi-role simulation checks to verify role-based layouts (Admin vs Employee).

