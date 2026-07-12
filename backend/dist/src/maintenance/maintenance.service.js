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
exports.MaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MaintenanceService = class MaintenanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        return this.prisma.maintenanceRequest.create({
            data: {
                assetId: dto.assetId,
                userId,
                description: dto.description,
                priority: dto.priority || 'MEDIUM',
                status: client_1.MaintenanceStatus.PENDING,
                photoUrl: dto.photoUrl || null,
            },
        });
    }
    async findAll() {
        return this.prisma.maintenanceRequest.findMany({
            include: {
                asset: { select: { id: true, name: true, tag: true } },
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const req = await this.prisma.maintenanceRequest.findUnique({
            where: { id },
            include: {
                asset: true,
                user: { select: { id: true, name: true, email: true } },
            },
        });
        if (!req)
            throw new common_1.NotFoundException('Maintenance request not found');
        return req;
    }
    async approve(id) {
        const req = await this.prisma.maintenanceRequest.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Maintenance request not found');
        if (req.status !== client_1.MaintenanceStatus.PENDING) {
            throw new common_1.BadRequestException(`Request is already ${req.status}`);
        }
        await this.prisma.asset.update({
            where: { id: req.assetId },
            data: { status: client_1.AssetStatus.UNDER_MAINTENANCE },
        });
        return this.prisma.maintenanceRequest.update({
            where: { id },
            data: { status: client_1.MaintenanceStatus.APPROVED },
        });
    }
    async reject(id) {
        const req = await this.prisma.maintenanceRequest.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Maintenance request not found');
        if (req.status !== client_1.MaintenanceStatus.PENDING) {
            throw new common_1.BadRequestException(`Request is already ${req.status}`);
        }
        return this.prisma.maintenanceRequest.update({
            where: { id },
            data: { status: client_1.MaintenanceStatus.REJECTED },
        });
    }
    async assignTechnician(id, dto) {
        const req = await this.prisma.maintenanceRequest.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Maintenance request not found');
        if (req.status !== client_1.MaintenanceStatus.APPROVED) {
            throw new common_1.BadRequestException('Request must be approved before assigning a technician');
        }
        return this.prisma.maintenanceRequest.update({
            where: { id },
            data: { technician: dto.technician, status: client_1.MaintenanceStatus.IN_PROGRESS },
        });
    }
    async resolve(id) {
        const req = await this.prisma.maintenanceRequest.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Maintenance request not found');
        if (req.status !== client_1.MaintenanceStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Request must be in progress before resolving');
        }
        await this.prisma.asset.update({
            where: { id: req.assetId },
            data: { status: client_1.AssetStatus.AVAILABLE },
        });
        return this.prisma.maintenanceRequest.update({
            where: { id },
            data: { status: client_1.MaintenanceStatus.RESOLVED },
        });
    }
};
exports.MaintenanceService = MaintenanceService;
exports.MaintenanceService = MaintenanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintenanceService);
//# sourceMappingURL=maintenance.service.js.map