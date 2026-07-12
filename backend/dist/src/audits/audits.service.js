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
exports.AuditsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuditsService = class AuditsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCycle(dto) {
        return this.prisma.auditCycle.create({
            data: {
                name: dto.name,
                scopeType: dto.scopeType,
                scopeValue: dto.scopeValue,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                status: client_1.AuditStatus.ACTIVE,
                auditors: {
                    create: (dto.auditorIds ?? []).map((userId) => ({ userId })),
                },
            },
        });
    }
    async findAll() {
        return this.prisma.auditCycle.findMany({
            include: {
                auditors: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
                results: {
                    include: {
                        asset: { select: { id: true, name: true, tag: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const cycle = await this.prisma.auditCycle.findUnique({
            where: { id },
            include: {
                auditors: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
                results: {
                    include: {
                        asset: { select: { id: true, name: true, tag: true, status: true } },
                    },
                },
            },
        });
        if (!cycle)
            throw new common_1.NotFoundException('Audit cycle not found');
        return cycle;
    }
    async markResult(cycleId, dto) {
        const cycle = await this.prisma.auditCycle.findUnique({ where: { id: cycleId } });
        if (!cycle)
            throw new common_1.NotFoundException('Audit cycle not found');
        if (cycle.status === client_1.AuditStatus.CLOSED) {
            throw new common_1.BadRequestException('Cannot add results to a closed audit cycle');
        }
        const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        const existing = await this.prisma.auditResult.findFirst({
            where: { auditCycleId: cycleId, assetId: dto.assetId },
        });
        if (existing) {
            return this.prisma.auditResult.update({
                where: { id: existing.id },
                data: { status: dto.status, notes: dto.notes ?? null },
            });
        }
        return this.prisma.auditResult.create({
            data: {
                auditCycleId: cycleId,
                assetId: dto.assetId,
                status: dto.status,
                notes: dto.notes ?? null,
            },
        });
    }
    async getDiscrepancyReport(cycleId) {
        const cycle = await this.prisma.auditCycle.findUnique({ where: { id: cycleId } });
        if (!cycle)
            throw new common_1.NotFoundException('Audit cycle not found');
        const flaggedResults = await this.prisma.auditResult.findMany({
            where: {
                auditCycleId: cycleId,
                status: { in: ['MISSING', 'DAMAGED'] },
            },
            include: {
                asset: { select: { id: true, name: true, tag: true, status: true, location: true } },
            },
        });
        return {
            cycleId,
            cycleName: cycle.name,
            scope: `${cycle.scopeType}: ${cycle.scopeValue}`,
            totalFlagged: flaggedResults.length,
            discrepancies: flaggedResults,
        };
    }
    async closeCycle(cycleId) {
        const cycle = await this.prisma.auditCycle.findUnique({
            where: { id: cycleId },
            include: { results: true },
        });
        if (!cycle)
            throw new common_1.NotFoundException('Audit cycle not found');
        if (cycle.status === client_1.AuditStatus.CLOSED) {
            throw new common_1.BadRequestException('Audit cycle is already closed');
        }
        for (const result of cycle.results) {
            if (result.status === 'MISSING') {
                await this.prisma.asset.update({
                    where: { id: result.assetId },
                    data: { status: client_1.AssetStatus.LOST },
                });
            }
            else if (result.status === 'DAMAGED') {
                await this.prisma.asset.update({
                    where: { id: result.assetId },
                    data: { condition: 'DAMAGED' },
                });
            }
        }
        return this.prisma.auditCycle.update({
            where: { id: cycleId },
            data: { status: client_1.AuditStatus.CLOSED },
        });
    }
};
exports.AuditsService = AuditsService;
exports.AuditsService = AuditsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditsService);
//# sourceMappingURL=audits.service.js.map