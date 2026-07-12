# Odoo AssetFlow Task List

## [ ] Backend Setup (`/backend`)
- [ ] Initialize NestJS project
- [ ] Install Prisma, configure PostgreSQL connection
- [ ] Create Database Schema (`schema.prisma`)
  - [ ] User, Role, Department models
  - [ ] Category, Asset, Allocation, Transfer models
  - [ ] Booking, Maintenance, Audit models
  - [ ] Notification, Log models
- [ ] Run Prisma migrations & seed database
- [ ] Implement JWT Authentication and Guard roles
- [ ] Build modules:
  - [ ] Organization (Departments & Employees Setup)
  - [ ] Assets (Directory & Sequence generation)
  - [ ] Allocations & Transfers (Conflict checks)
  - [ ] Bookings (Overlap checker)
  - [ ] Maintenance (Approval cycle)
  - [ ] Audits (Discrepancy reporter)
- [ ] Set up Socket.IO gateway for real-time notifications
- [ ] Set up cron jobs for overdue alerts

## [ ] Frontend Setup (`/frontend`)
- [ ] Initialize Vite + React + TS project
- [ ] Configure Tailwind CSS (v3) & shadcn/ui
- [ ] Install dependencies (Redux Toolkit, React Router, Recharts, FullCalendar, Axios)
- [ ] Create UI components and page layouts
- [ ] Implement Screens:
  - [ ] Screen 1: Login / Signup (with role simulation utility)
  - [ ] Screen 2: Dashboard (KPI cards, overdue indicators, quick actions)
  - [ ] Screen 3: Organization Setup (Admin: Departments, Categories, Employee Promotion)
  - [ ] Screen 4: Asset Registration & Directory (Search, filters, history timeline)
  - [ ] Screen 5: Allocations & Transfers (Conflict UI, request dialogs)
  - [ ] Screen 6: Resource Bookings (Calendar-based slot bookings)
  - [ ] Screen 7: Maintenance Management (Status trackers)
  - [ ] Screen 8: Asset Audits (Audit checklist, discrepancies sheet)
  - [ ] Screen 9: Reports & Analytics (Charts & peak usage heatmaps)
  - [ ] Screen 10: Logs & Notifications (Event feeds)
- [ ] Integrate API calls and state management
