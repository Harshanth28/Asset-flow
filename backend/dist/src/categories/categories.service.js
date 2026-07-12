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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.assetCategory.findUnique({
            where: { name: dto.name },
        });
        if (existing) {
            throw new common_1.ConflictException('Category name already exists');
        }
        return this.prisma.assetCategory.create({
            data: {
                name: dto.name,
                customFields: dto.customFields || {},
            },
        });
    }
    async findAll() {
        return this.prisma.assetCategory.findMany();
    }
    async findOne(id) {
        const cat = await this.prisma.assetCategory.findUnique({
            where: { id },
        });
        if (!cat) {
            throw new common_1.NotFoundException('Category not found');
        }
        return cat;
    }
    async update(id, dto) {
        const cat = await this.prisma.assetCategory.findUnique({ where: { id } });
        if (!cat) {
            throw new common_1.NotFoundException('Category not found');
        }
        return this.prisma.assetCategory.update({
            where: { id },
            data: {
                name: dto.name !== undefined ? dto.name : undefined,
                customFields: dto.customFields !== undefined ? dto.customFields : undefined,
            },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map