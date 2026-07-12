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
exports.AllocationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AllocationsService = class AllocationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async allocate(dto) {
        const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        if (asset.status !== client_1.AssetStatus.AVAILABLE) {
            const currentAllocation = await this.prisma.assetAllocation.findFirst({
                where: { assetId: dto.assetId, status: client_1.AllocationStatus.ACTIVE },
                include: { employee: { select: { id: true, name: true } }, department: true },
            });
            throw new common_1.ConflictException({
                message: `Asset is currently ${asset.status.toLowerCase().replace('_', ' ')}`,
                heldBy: currentAllocation?.employee ?? null,
                heldByDept: currentAllocation?.department ?? null,
                suggestion: 'TRANSFER_REQUEST',
            });
        }
        const allocation = await this.prisma.assetAllocation.create({
            data: {
                assetId: dto.assetId,
                employeeId: dto.employeeId || null,
                departmentId: dto.departmentId || null,
                expectedReturnDate: dto.expectedReturnDate ? new Date(dto.expectedReturnDate) : null,
                status: client_1.AllocationStatus.ACTIVE,
            },
        });
        await this.prisma.asset.update({
            where: { id: dto.assetId },
            data: { status: client_1.AssetStatus.ALLOCATED },
        });
        return allocation;
    }
    async findAll() {
        return this.prisma.assetAllocation.findMany({
            include: {
                asset: { select: { id: true, name: true, tag: true, status: true } },
                employee: { select: { id: true, name: true, email: true } },
                department: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async returnAsset(allocationId, dto) {
        const allocation = await this.prisma.assetAllocation.findUnique({
            where: { id: allocationId },
        });
        if (!allocation)
            throw new common_1.NotFoundException('Allocation not found');
        if (allocation.status === client_1.AllocationStatus.RETURNED) {
            throw new common_1.BadRequestException('Asset has already been returned');
        }
        const updated = await this.prisma.assetAllocation.update({
            where: { id: allocationId },
            data: {
                status: client_1.AllocationStatus.RETURNED,
                actualReturnDate: new Date(),
                checkInNotes: dto.checkInNotes || null,
            },
        });
        await this.prisma.asset.update({
            where: { id: allocation.assetId },
            data: { status: client_1.AssetStatus.AVAILABLE },
        });
        return updated;
    }
    async flagOverdue() {
        const now = new Date();
        const overdueAllocations = await this.prisma.assetAllocation.findMany({
            where: {
                status: client_1.AllocationStatus.ACTIVE,
                expectedReturnDate: { lt: now },
            },
        });
        if (overdueAllocations.length > 0) {
            await this.prisma.assetAllocation.updateMany({
                where: {
                    id: { in: overdueAllocations.map((a) => a.id) },
                    status: client_1.AllocationStatus.ACTIVE,
                    expectedReturnDate: { lt: now },
                },
                data: { status: client_1.AllocationStatus.OVERDUE },
            });
        }
        return { flagged: overdueAllocations.length };
    }
    async getOverdue() {
        return this.prisma.assetAllocation.findMany({
            where: { status: client_1.AllocationStatus.OVERDUE },
            include: {
                asset: { select: { id: true, name: true, tag: true } },
                employee: { select: { id: true, name: true, email: true } },
                department: { select: { id: true, name: true } },
            },
        });
    }
    async requestTransfer(requesterId, dto) {
        const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        if (asset.status === client_1.AssetStatus.AVAILABLE) {
            throw new common_1.BadRequestException('Asset is available — just allocate it directly');
        }
        const existing = await this.prisma.transferRequest.findFirst({
            where: {
                assetId: dto.assetId,
                status: client_1.TransferStatus.PENDING,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('A pending transfer request already exists for this asset');
        }
        return this.prisma.transferRequest.create({
            data: {
                assetId: dto.assetId,
                fromEmployeeId: requesterId,
                toEmployeeId: dto.toEmployeeId,
                status: client_1.TransferStatus.PENDING,
            },
        });
    }
    async approveTransfer(transferId) {
        const transfer = await this.prisma.transferRequest.findUnique({
            where: { id: transferId },
        });
        if (!transfer)
            throw new common_1.NotFoundException('Transfer request not found');
        if (transfer.status !== client_1.TransferStatus.PENDING) {
            throw new common_1.BadRequestException('Transfer is not in a pending state');
        }
        await this.prisma.assetAllocation.updateMany({
            where: { assetId: transfer.assetId, status: client_1.AllocationStatus.ACTIVE },
            data: { status: client_1.AllocationStatus.RETURNED, actualReturnDate: new Date() },
        });
        await this.prisma.assetAllocation.create({
            data: {
                assetId: transfer.assetId,
                employeeId: transfer.toEmployeeId,
                status: client_1.AllocationStatus.ACTIVE,
            },
        });
        const updated = await this.prisma.transferRequest.update({
            where: { id: transferId },
            data: { status: client_1.TransferStatus.APPROVED },
        });
        return updated;
    }
    async rejectTransfer(transferId) {
        const transfer = await this.prisma.transferRequest.findUnique({
            where: { id: transferId },
        });
        if (!transfer)
            throw new common_1.NotFoundException('Transfer request not found');
        if (transfer.status !== client_1.TransferStatus.PENDING) {
            throw new common_1.BadRequestException('Transfer is not in a pending state');
        }
        return this.prisma.transferRequest.update({
            where: { id: transferId },
            data: { status: client_1.TransferStatus.REJECTED },
        });
    }
    async getTransferRequests() {
        return this.prisma.transferRequest.findMany({
            include: {
                asset: { select: { id: true, name: true, tag: true } },
                fromEmployee: { select: { id: true, name: true, email: true } },
                toEmployee: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.AllocationsService = AllocationsService;
exports.AllocationsService = AllocationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AllocationsService);
//# sourceMappingURL=allocations.service.js.map