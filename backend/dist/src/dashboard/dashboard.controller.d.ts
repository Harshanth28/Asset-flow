import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getKPIs(): Promise<{
        assetsAvailable: number;
        assetsAllocated: number;
        maintenanceToday: number;
        activeBookings: number;
        pendingTransfers: number;
        upcomingReturns: number;
        overdueReturns: number;
    }>;
}
