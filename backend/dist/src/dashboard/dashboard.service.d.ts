import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
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
