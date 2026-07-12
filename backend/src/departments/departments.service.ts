import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { UserStatus, Role } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Department name already exists');
    }

    // Create the department
    const dept = await this.prisma.department.create({
      data: {
        name: dto.name,
        parentId: dto.parentId || null,
        headId: dto.headId || null,
      },
    });

    // If headId is provided, promote user to DEPARTMENT_HEAD role
    if (dto.headId) {
      await this.prisma.user.update({
        where: { id: dto.headId },
        data: { role: Role.DEPARTMENT_HEAD, departmentId: dept.id },
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

  async findOne(id: string) {
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
      throw new NotFoundException('Department not found');
    }
    return dept;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }

    // If the department head changes, clean up old head roles or update new head roles
    if (dto.headId && dto.headId !== dept.headId) {
      // Demote previous head to Employee (optional but standard, or leave as head)
      if (dept.headId) {
        await this.prisma.user.update({
          where: { id: dept.headId },
          data: { role: Role.EMPLOYEE },
        });
      }

      // Promote new head
      await this.prisma.user.update({
        where: { id: dto.headId },
        data: { role: Role.DEPARTMENT_HEAD, departmentId: id },
      });
    }

    return this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        parentId: dto.parentId !== undefined ? dto.parentId || null : undefined,
        headId: dto.headId !== undefined ? dto.headId || null : undefined,
        status: dto.status !== undefined ? dto.status : undefined,
      },
    });
  }

  async deactivate(id: string) {
    return this.update(id, { status: UserStatus.INACTIVE });
  }
}
