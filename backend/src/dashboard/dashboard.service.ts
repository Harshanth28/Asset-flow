import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetStatus, AllocationStatus, BookingStatus, MaintenanceStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKPIs() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const [
      assetsAvailable,
      assetsAllocated,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
      overdueReturns,
    ] = await Promise.all([
      this.prisma.asset.count({ where: { status: AssetStatus.AVAILABLE } }),
      this.prisma.asset.count({ where: { status: AssetStatus.ALLOCATED } }),
      this.prisma.maintenanceRequest.count({
        where: {
          status: { in: [MaintenanceStatus.APPROVED, MaintenanceStatus.IN_PROGRESS] },
          updatedAt: { gte: todayStart, lt: todayEnd },
        },
      }),
      this.prisma.resourceBooking.count({
        where: { status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] } },
      }),
      this.prisma.transferRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.assetAllocation.count({
        where: {
          status: AllocationStatus.ACTIVE,
          expectedReturnDate: { gte: now },
        },
      }),
      this.prisma.assetAllocation.count({
        where: { status: AllocationStatus.OVERDUE },
      }),
    ]);

    return {
      assetsAvailable,
      assetsAllocated,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
      overdueReturns,
    };
  }
}
