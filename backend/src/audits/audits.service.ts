import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditCycleDto, MarkAuditResultDto } from './dto/audit.dto';
import { AuditStatus, AssetStatus } from '@prisma/client';

@Injectable()
export class AuditsService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE AUDIT CYCLE ───────────────────────────────────────────────────────
  async createCycle(dto: CreateAuditCycleDto) {
    return this.prisma.auditCycle.create({
      data: {
        name: dto.name,
        scopeType: dto.scopeType,
        scopeValue: dto.scopeValue,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: AuditStatus.ACTIVE,
        auditors: {
          create: (dto.auditorIds ?? []).map((userId: string) => ({ userId })),
        },
      },
    });
  }


  // ─── GET ALL CYCLES ───────────────────────────────────────────────────────────
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

  // ─── GET ONE CYCLE ────────────────────────────────────────────────────────────
  async findOne(id: string) {
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
    if (!cycle) throw new NotFoundException('Audit cycle not found');
    return cycle;
  }

  // ─── MARK AUDIT RESULT ────────────────────────────────────────────────────────
  async markResult(cycleId: string, dto: MarkAuditResultDto) {
    const cycle = await this.prisma.auditCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) throw new NotFoundException('Audit cycle not found');
    if (cycle.status === AuditStatus.CLOSED) {
      throw new BadRequestException('Cannot add results to a closed audit cycle');
    }

    const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    // One result per asset per cycle — find existing or create new
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

  // ─── GET DISCREPANCY REPORT ───────────────────────────────────────────────────
  async getDiscrepancyReport(cycleId: string) {
    const cycle = await this.prisma.auditCycle.findUnique({ where: { id: cycleId } });
    if (!cycle) throw new NotFoundException('Audit cycle not found');

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

  // ─── CLOSE AUDIT CYCLE ────────────────────────────────────────────────────────
  // Locks the cycle and updates asset statuses for flagged items
  async closeCycle(cycleId: string) {
    const cycle = await this.prisma.auditCycle.findUnique({
      where: { id: cycleId },
      include: { results: true },
    });
    if (!cycle) throw new NotFoundException('Audit cycle not found');
    if (cycle.status === AuditStatus.CLOSED) {
      throw new BadRequestException('Audit cycle is already closed');
    }

    // Update asset statuses based on final audit results
    for (const result of cycle.results) {
      if (result.status === 'MISSING') {
        await this.prisma.asset.update({
          where: { id: result.assetId },
          data: { status: AssetStatus.LOST },
        });
      } else if (result.status === 'DAMAGED') {
        // Mark condition but keep existing lifecycle status (could be escalated to maintenance)
        await this.prisma.asset.update({
          where: { id: result.assetId },
          data: { condition: 'DAMAGED' },
        });
      }
    }

    // Lock the cycle
    return this.prisma.auditCycle.update({
      where: { id: cycleId },
      data: { status: AuditStatus.CLOSED },
    });
  }
}
