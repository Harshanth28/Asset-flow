"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKPIs() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 86400000);
        const [assetsAvailable, assetsAllocated, maintenanceToday, activeBookings, pendingTransfers, upcomingReturns, overdueReturns,] = await Promise.all([
            this.prisma.asset.count({ where: { status: client_1.AssetStatus.AVAILABLE } }),
            this.prisma.asset.count({ where: { status: client_1.AssetStatus.ALLOCATED } }),
            this.prisma.maintenanceRequest.count({
                where: {
                    status: { in: [client_1.MaintenanceStatus.APPROVED, client_1.MaintenanceStatus.IN_PROGRESS] },
                    updatedAt: { gte: todayStart, lt: todayEnd },
                },
            }),
            this.prisma.resourceBooking.count({
                where: { status: { in: [client_1.BookingStatus.UPCOMING, client_1.BookingStatus.ONGOING] } },
            }),
            this.prisma.transferRequest.count({ where: { status: 'PENDING' } }),
            this.prisma.assetAllocation.count({
                where: {
                    status: client_1.AllocationStatus.ACTIVE,
                    expectedReturnDate: { gte: now },
                },
            }),
            this.prisma.assetAllocation.count({
                where: { status: client_1.AllocationStatus.OVERDUE },
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map