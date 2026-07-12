// Local storage mock DB manager to keep the application fully interactive and standalone

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ASSET_MANAGER' | 'DEPT_HEAD' | 'EMPLOYEE';
  departmentId?: string;
  status: 'active' | 'inactive';
}

export interface MockDepartment {
  id: string;
  name: string;
  headId?: string;
  parentId?: string;
  status: 'active' | 'inactive';
}

export interface MockCategory {
  id: string;
  name: string;
  customFields: string[]; // e.g. ["Warranty", "Model"]
  status: 'active' | 'inactive';
}

export interface MockAsset {
  id: string;
  tag: string;
  name: string;
  categoryId: string;
  serialNumber: string;
  acquisitionDate: string;
  acquisitionCost: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  location: string;
  isBookable: boolean;
  status: 'AVAILABLE' | 'ALLOCATED' | 'RESERVED' | 'UNDER_MAINTENANCE' | 'LOST' | 'RETIRED' | 'DISPOSED';
  meta?: Record<string, string>; // Category dynamic custom fields
}

export interface MockAllocation {
  id: string;
  assetId: string;
  userId?: string;
  departmentId?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  conditionOnReturn?: string;
  status: 'ACTIVE' | 'RETURNED' | 'TRANSFERRED';
  createdAt: string;
}

export interface MockTransfer {
  id: string;
  allocationId: string;
  targetUserId?: string;
  targetDeptId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedById: string;
  createdAt: string;
}

export interface MockBooking {
  id: string;
  assetId: string;
  userId: string;
  date: string;
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "10:00"
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export interface MockMaintenance {
  id: string;
  assetId: string;
  issue: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'RESOLVED';
  technicianName?: string;
  raisedById: string;
  createdAt: string;
}

export interface MockAuditCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  scopeDeptId?: string;
  scopeLocation?: string;
  status: 'ACTIVE' | 'CLOSED';
}

export interface MockAuditResult {
  id: string;
  auditCycleId: string;
  assetId: string;
  auditorId: string;
  verification: 'VERIFIED' | 'MISSING' | 'DAMAGED';
  notes?: string;
}

// Check and seed default data
export const initializeMockDb = () => {
  if (localStorage.getItem('af_initialized')) return;

  const defaultUsers: MockUser[] = [
    { id: 'emp-1', name: 'Alice Chen', email: 'admin@assetflow.com', role: 'ADMIN', departmentId: 'dept-1', status: 'active' },
    { id: 'emp-2', name: 'Sarah Connor', email: 'manager@assetflow.com', role: 'ASSET_MANAGER', departmentId: 'dept-1', status: 'active' },
    { id: 'emp-3', name: 'Priya Sharma', email: 'priya@assetflow.com', role: 'DEPT_HEAD', departmentId: 'dept-2', status: 'active' },
    { id: 'emp-4', name: 'Raj Patel', email: 'raj@assetflow.com', role: 'EMPLOYEE', departmentId: 'dept-2', status: 'active' },
  ];

  const defaultDepts: MockDepartment[] = [
    { id: 'dept-1', name: 'Operations', headId: 'emp-1', status: 'active' },
    { id: 'dept-2', name: 'Engineering', headId: 'emp-3', parentId: 'dept-1', status: 'active' },
    { id: 'dept-3', name: 'Human Resources', status: 'active' },
  ];

  const defaultCategories: MockCategory[] = [
    { id: 'cat-1', name: 'Electronics', customFields: ['Warranty Period (months)', 'Model Number'], status: 'active' },
    { id: 'cat-2', name: 'Furniture', customFields: ['Material', 'Dimensions'], status: 'active' },
    { id: 'cat-3', name: 'Vehicles', customFields: ['License Plate', 'Fuel Type'], status: 'active' },
  ];

  const defaultAssets: MockAsset[] = [
    { id: 'asset-1', tag: 'AF-0001', name: 'MacBook Pro 16 M3', categoryId: 'cat-1', serialNumber: 'SN-MBP16-M3', acquisitionDate: '2026-01-15', acquisitionCost: 2499, condition: 'Excellent', location: 'Engineering Lab', isBookable: false, status: 'ALLOCATED', meta: { 'Warranty Period (months)': '36', 'Model Number': 'A2918' } },
    { id: 'asset-2', tag: 'AF-0002', name: 'Lenovo ThinkPad T14', categoryId: 'cat-1', serialNumber: 'SN-TP-T14-987', acquisitionDate: '2025-05-10', acquisitionCost: 1250, condition: 'Good', location: 'Operations Desk B', isBookable: false, status: 'ALLOCATED', meta: { 'Warranty Period (months)': '24', 'Model Number': '20W0000GUS' } },
    { id: 'asset-3', tag: 'AF-0003', name: 'Conference Room B2', categoryId: 'cat-2', serialNumber: 'SN-CR-B2', acquisitionDate: '2024-08-01', acquisitionCost: 4500, condition: 'Excellent', location: 'Building B, 2nd Floor', isBookable: true, status: 'AVAILABLE', meta: { Material: 'Glass, Wood', Dimensions: '20ft x 15ft' } },
    { id: 'asset-4', tag: 'AF-0004', name: 'Toyota Prius Shuttle', categoryId: 'cat-3', serialNumber: 'SN-PRIUS-9988', acquisitionDate: '2024-12-01', acquisitionCost: 28500, condition: 'Good', location: 'Parking Bay 4', isBookable: true, status: 'AVAILABLE', meta: { 'License Plate': 'CA-992-XX', 'Fuel Type': 'Hybrid' } },
    { id: 'asset-5', tag: 'AF-0005', name: 'Ergonomic Office Chair', categoryId: 'cat-2', serialNumber: 'SN-CHAIR-872', acquisitionDate: '2025-11-20', acquisitionCost: 350, condition: 'Fair', location: 'Room 302', isBookable: false, status: 'UNDER_MAINTENANCE', meta: { Material: 'Mesh and Nylon', Dimensions: 'Standard Adjust' } },
  ];

  // 10 days ago (overdue)
  const tenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0];
  // 30 days in future (active)
  const thirtyDaysAhead = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0];

  const defaultAllocations: MockAllocation[] = [
    { id: 'alloc-1', assetId: 'asset-1', userId: 'emp-4', expectedReturnDate: thirtyDaysAhead, status: 'ACTIVE', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
    { id: 'alloc-2', assetId: 'asset-2', userId: 'emp-3', expectedReturnDate: tenDaysAgo, status: 'ACTIVE', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString() },
  ];

  const defaultBookings: MockBooking[] = [
    { id: 'book-1', assetId: 'asset-3', userId: 'emp-4', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:00', status: 'ONGOING' },
    { id: 'book-2', assetId: 'asset-3', userId: 'emp-3', date: new Date().toISOString().split('T')[0], startTime: '13:00', endTime: '14:30', status: 'UPCOMING' },
  ];

  const defaultMaintenance: MockMaintenance[] = [
    { id: 'maint-1', assetId: 'asset-5', issue: 'Hydraulic lift cylinder is failing to maintain height.', priority: 'MEDIUM', status: 'APPROVED', technicianName: 'Bob the Builder', raisedById: 'emp-4', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() }
  ];

  const defaultNotifications = [
    { 
      id: 'notify-init-1', 
      userId: 'emp-2', 
      title: '🚨 Overdue Return Alert', 
      message: 'Lenovo ThinkPad T14 (AF-0002) is 10 days overdue.', 
      type: 'OVERDUE_RETURN' as const, 
      isRead: false, 
      createdAt: new Date(Date.now() - 1000 * 3600 * 2).toISOString() 
    }
  ];

  localStorage.setItem('af_users', JSON.stringify(defaultUsers));
  localStorage.setItem('af_departments', JSON.stringify(defaultDepts));
  localStorage.setItem('af_categories', JSON.stringify(defaultCategories));
  localStorage.setItem('af_assets', JSON.stringify(defaultAssets));
  localStorage.setItem('af_allocations', JSON.stringify(defaultAllocations));
  localStorage.setItem('af_transfers', JSON.stringify([]));
  localStorage.setItem('af_bookings', JSON.stringify(defaultBookings));
  localStorage.setItem('af_maintenance', JSON.stringify(defaultMaintenance));
  localStorage.setItem('af_notifications', JSON.stringify(defaultNotifications));
  localStorage.setItem('af_audits', JSON.stringify([]));
  localStorage.setItem('af_audit_results', JSON.stringify([]));
  localStorage.setItem('af_initialized', 'true');
};

// Seed db instantly
initializeMockDb();

// Getter/Setter API Helpers for UI screens
export const getDbTable = <T>(key: string): T[] => {
  initializeMockDb();
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
};

export const saveDbTable = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const resetToSIHMockData = () => {
  localStorage.removeItem('af_initialized');
  localStorage.removeItem('af_users');
  localStorage.removeItem('af_departments');
  localStorage.removeItem('af_categories');
  localStorage.removeItem('af_assets');
  localStorage.removeItem('af_allocations');
  localStorage.removeItem('af_transfers');
  localStorage.removeItem('af_bookings');
  localStorage.removeItem('af_maintenance');
  localStorage.removeItem('af_audits');
  localStorage.removeItem('af_audit_results');
  localStorage.removeItem('af_logs');
  localStorage.removeItem('af_notifications');
  
  initializeMockDb();
  
  const alloc2 = getDbTable<any>('af_allocations').find(a => a.assetId === 'asset-2');
  const sihTransfers = [];
  if (alloc2) {
    sihTransfers.push({
      id: 'trans-sih-1',
      allocationId: alloc2.id,
      targetUserId: 'emp-4',
      status: 'PENDING',
      requestedById: 'emp-3',
      createdAt: new Date().toISOString()
    });
  }
  saveDbTable('af_transfers', sihTransfers);

  const sihLogs = [
    { id: 'log-sih-1', action: 'REGISTER', details: 'MacBook Pro 16 M3 registered as AVAILABLE.', createdAt: new Date(Date.now() - 1000 * 3600 * 48).toISOString() },
    { id: 'log-sih-2', action: 'ALLOCATE', details: 'MacBook Pro 16 M3 checked out to Raj Patel.', createdAt: new Date(Date.now() - 1000 * 3600 * 24).toISOString() },
    { id: 'log-sih-3', action: 'MAINTENANCE_RAISE', details: 'Filed ticket for Office Chair adjustment issue.', createdAt: new Date(Date.now() - 1000 * 3600 * 2).toISOString() }
  ];
  saveDbTable('af_logs', sihLogs);

  const sihNotifs = [
    { id: 'notify-sih-1', userId: 'emp-2', title: '🔄 Transfer Requested', message: 'Priya requests to transfer Lenovo ThinkPad (AF-0002) to Raj Patel.', type: 'TRANSFER_REQUEST', isRead: false, createdAt: new Date().toISOString() }
  ];
  saveDbTable('af_notifications', sihNotifs);
};

