import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto, AssignTechnicianDto } from './dto/maintenance.dto';
import { MaintenanceStatus, AssetStatus } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  // ─── RAISE REQUEST ────────────────────────────────────────────────────────────
  async create(userId: string, dto: CreateMaintenanceDto) {
    const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    return this.prisma.maintenanceRequest.create({
      data: {
        assetId: dto.assetId,
        userId,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        status: MaintenanceStatus.PENDING,
        photoUrl: dto.photoUrl || null,
      },
    });
  }

  // ─── GET ALL REQUESTS ─────────────────────────────────────────────────────────
  async findAll() {
    return this.prisma.maintenanceRequest.findMany({
      include: {
        asset: { select: { id: true, name: true, tag: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── GET ONE ──────────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const req = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!req) throw new NotFoundException('Maintenance request not found');
    return req;
  }

  // ─── APPROVE REQUEST → Asset flips to UNDER_MAINTENANCE ──────────────────────
  async approve(id: string) {
    const req = await this.prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Maintenance request not found');
    if (req.status !== MaintenanceStatus.PENDING) {
      throw new BadRequestException(`Request is already ${req.status}`);
    }

    // Update asset status to UNDER_MAINTENANCE
    await this.prisma.asset.update({
      where: { id: req.assetId },
      data: { status: AssetStatus.UNDER_MAINTENANCE },
    });

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status: MaintenanceStatus.APPROVED },
    });
  }

  // ─── REJECT REQUEST ───────────────────────────────────────────────────────────
  async reject(id: string) {
    const req = await this.prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Maintenance request not found');
    if (req.status !== MaintenanceStatus.PENDING) {
      throw new BadRequestException(`Request is already ${req.status}`);
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status: MaintenanceStatus.REJECTED },
    });
  }

  // ─── ASSIGN TECHNICIAN + Mark IN_PROGRESS ────────────────────────────────────
  async assignTechnician(id: string, dto: AssignTechnicianDto) {
    const req = await this.prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Maintenance request not found');
    if (req.status !== MaintenanceStatus.APPROVED) {
      throw new BadRequestException('Request must be approved before assigning a technician');
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: { technician: dto.technician, status: MaintenanceStatus.IN_PROGRESS },
    });
  }

  // ─── RESOLVE → Asset reverts to AVAILABLE ────────────────────────────────────
  async resolve(id: string) {
    const req = await this.prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Maintenance request not found');
    if (req.status !== MaintenanceStatus.IN_PROGRESS) {
      throw new BadRequestException('Request must be in progress before resolving');
    }

    // Revert asset status back to AVAILABLE
    await this.prisma.asset.update({
      where: { id: req.assetId },
      data: { status: AssetStatus.AVAILABLE },
    });

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status: MaintenanceStatus.RESOLVED },
    });
  }
}
