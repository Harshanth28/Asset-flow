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
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DepartmentsService = class DepartmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.department.findUnique({
            where: { name: dto.name },
        });
        if (existing) {
            throw new common_1.ConflictException('Department name already exists');
        }
        const dept = await this.prisma.department.create({
            data: {
                name: dto.name,
                parentId: dto.parentId || null,
                headId: dto.headId || null,
            },
        });
        if (dto.headId) {
            await this.prisma.user.update({
                where: { id: dto.headId },
                data: { role: client_1.Role.DEPARTMENT_HEAD, departmentId: dept.id },
            });
        }
        return dept;
    }
    async findAll() {
        return this.prisma.department.findMany({
            include: {
                head: {
                    select: { id: true, name: true, email: true },
                },
                parent: {
                    select: { id: true, name: true },
                },
                children: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async findOne(id) {
        const dept = await this.prisma.department.findUnique({
            where: { id },
            include: {
                head: {
                    select: { id: true, name: true, email: true },
                },
                parent: true,
                children: true,
                employees: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
        if (!dept) {
            throw new common_1.NotFoundException('Department not found');
        }
        return dept;
    }
    async update(id, dto) {
        const dept = await this.prisma.department.findUnique({ where: { id } });
        if (!dept) {
            throw new common_1.NotFoundException('Department not found');
        }
        if (dto.headId && dto.headId !== dept.headId) {
            if (dept.headId) {
                await this.prisma.user.update({
                    where: { id: dept.headId },
                    data: { role: client_1.Role.EMPLOYEE },
                });
            }
            await this.prisma.user.update({
                where: { id: dto.headId },
                data: { role: client_1.Role.DEPARTMENT_HEAD, departmentId: id },
            });
        }
        return this.prisma.department.update({
            where: { id },
            data: {
                name: dto.name !== undefined ? dto.name : undefined,
                parentId: dto.parentId !== undefined ? (dto.parentId || null) : undefined,
                headId: dto.headId !== undefined ? (dto.headId || null) : undefined,
                status: dto.status !== undefined ? dto.status : undefined,
            },
        });
    }
    async deactivate(id) {
        return this.update(id, { status: client_1.UserStatus.INACTIVE });
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map