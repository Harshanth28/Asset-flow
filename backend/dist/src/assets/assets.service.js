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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AssetsService = class AssetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const count = await this.prisma.asset.count();
        const tag = `AF-${String(count + 1).padStart(4, '0')}`;
        return this.prisma.asset.create({
            data: {
                name: dto.name,
                tag,
                categoryId: dto.categoryId,
                serialNumber: dto.serialNumber || null,
                acquisitionDate: dto.acquisitionDate ? new Date(dto.acquisitionDate) : new Date(),
                acquisitionCost: dto.acquisitionCost !== undefined ? dto.acquisitionCost : 0.0,
                condition: dto.condition || 'NEW',
                location: dto.location || null,
                isBookable: dto.isBookable || false,
                status: client_1.AssetStatus.AVAILABLE,
                photoUrl: dto.photoUrl || null,
                documentUrls: dto.documentUrls || [],
            },
        });
    }
    async findAll(filters) {
        const whereClause = {};
        if (filters.search) {
            whereClause.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { tag: { contains: filters.search, mode: 'insensitive' } },
                { serialNumber: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters.categoryId) {
            whereClause.categoryId = filters.categoryId;
        }
        if (filters.status) {
            whereClause.status = filters.status;
        }
        if (filters.location) {
            whereClause.location = { contains: filters.location, mode: 'insensitive' };
        }
        if (filters.departmentId) {
            whereClause.allocations = {
                some: {
                    OR: [
                        { departmentId: filters.departmentId },
                        { employee: { departmentId: filters.departmentId } },
                    ],
                    status: 'ACTIVE',
                },
            };
        }
        return this.prisma.asset.findMany({
            where: whereClause,
            include: {
                category: true,
            },
        });
    }
    async findOne(id) {
        const asset = await this.prisma.asset.findUnique({
            where: { id },
            include: {
                category: true,
                allocations: {
                    include: {
                        employee: {
                            select: { id: true, name: true, email: true },
                        },
                        department: {
                            select: { id: true, name: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                maintenance: {
                    include: {
                        user: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        return asset;
    }
    async update(id, dto) {
        const asset = await this.prisma.asset.findUnique({ where: { id } });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        return this.prisma.asset.update({
            where: { id },
            data: {
                name: dto.name !== undefined ? dto.name : undefined,
                categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
                serialNumber: dto.serialNumber !== undefined ? dto.serialNumber : undefined,
                acquisitionDate: dto.acquisitionDate !== undefined ? new Date(dto.acquisitionDate) : undefined,
                acquisitionCost: dto.acquisitionCost !== undefined ? dto.acquisitionCost : undefined,
                condition: dto.condition !== undefined ? dto.condition : undefined,
                location: dto.location !== undefined ? dto.location : undefined,
                isBookable: dto.isBookable !== undefined ? dto.isBookable : undefined,
                status: dto.status !== undefined ? dto.status : undefined,
                photoUrl: dto.photoUrl !== undefined ? dto.photoUrl : undefined,
                documentUrls: dto.documentUrls !== undefined ? dto.documentUrls : undefined,
            },
        });
    }
    async remove(id) {
        const asset = await this.prisma.asset.findUnique({ where: { id } });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        return this.prisma.asset.delete({ where: { id } });
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map