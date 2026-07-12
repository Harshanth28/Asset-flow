import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAllocationDto, CreateTransferRequestDto, ReturnAssetDto } from './dto/allocation.dto';
import { AssetStatus, AllocationStatus, TransferStatus } from '@prisma/client';

@Injectable()
export class AllocationsService {
  constructor(private prisma: PrismaService) {}

  // ─── ALLOCATE ────────────────────────────────────────────────────────────────
  async allocate(dto: CreateAllocationDto) {
    const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    // CONFLICT RULE: asset must be Available
    if (asset.status !== AssetStatus.AVAILABLE) {
      // Find who currently holds it
      const currentAllocation = await this.prisma.assetAllocation.findFirst({
        where: { assetId: dto.assetId, status: AllocationStatus.ACTIVE },
        include: { employee: { select: { id: true, name: true } }, department: true },
      });

      throw new ConflictException({
        message: `Asset is currently ${asset.status.toLowerCase().replace('_', ' ')}`,
        heldBy: currentAllocation?.employee ?? null,
        heldByDept: currentAllocation?.department ?? null,
        suggestion: 'TRANSFER_REQUEST',
      });
    }

    // Create the allocation
    const allocation = await this.prisma.assetAllocation.create({
      data: {
        assetId: dto.assetId,
        employeeId: dto.employeeId || null,
        departmentId: dto.departmentId || null,
        expectedReturnDate: dto.expectedReturnDate ? new Date(dto.expectedReturnDate) : null,
        status: AllocationStatus.ACTIVE,
      },
    });

    // Update asset status
    await this.prisma.asset.update({
      where: { id: dto.assetId },
      data: { status: AssetStatus.ALLOCATED },
    });

    return allocation;
  }

  // ─── GET ALL ALLOCATIONS ──────────────────────────────────────────────────────
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

  // ─── RETURN ASSET ─────────────────────────────────────────────────────────────
  async returnAsset(allocationId: string, dto: ReturnAssetDto) {
    const allocation = await this.prisma.assetAllocation.findUnique({
      where: { id: allocationId },
    });
    if (!allocation) throw new NotFoundException('Allocation not found');
    if (allocation.status === AllocationStatus.RETURNED) {
      throw new BadRequestException('Asset has already been returned');
    }

    // Mark allocation as returned
    const updated = await this.prisma.assetAllocation.update({
      where: { id: allocationId },
      data: {
        status: AllocationStatus.RETURNED,
        actualReturnDate: new Date(),
        checkInNotes: dto.checkInNotes || null,
      },
    });

    // Revert asset status back to Available
    await this.prisma.asset.update({
      where: { id: allocation.assetId },
      data: { status: AssetStatus.AVAILABLE },
    });

    return updated;
  }

  // ─── CHECK & FLAG OVERDUE ALLOCATIONS ─────────────────────────────────────────
  async flagOverdue() {
    const now = new Date();
    const overdueAllocations = await this.prisma.assetAllocation.findMany({
      where: {
        status: AllocationStatus.ACTIVE,
        expectedReturnDate: { lt: now },
      },
    });

    // Batch update all overdue allocations
    if (overdueAllocations.length > 0) {
      await this.prisma.assetAllocation.updateMany({
        where: {
          id: { in: overdueAllocations.map((a) => a.id) },
          status: AllocationStatus.ACTIVE,
          expectedReturnDate: { lt: now },
        },
        data: { status: AllocationStatus.OVERDUE },
      });
    }

    return { flagged: overdueAllocations.length };
  }

  // ─── GET OVERDUE ALLOCATIONS (for dashboard) ──────────────────────────────────
  async getOverdue() {
    return this.prisma.assetAllocation.findMany({
      where: { status: AllocationStatus.OVERDUE },
      include: {
        asset: { select: { id: true, name: true, tag: true } },
        employee: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  // ─── REQUEST TRANSFER ────────────────────────────────────────────────────────
  async requestTransfer(requesterId: string, dto: CreateTransferRequestDto) {
    const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    if (asset.status === AssetStatus.AVAILABLE) {
      throw new BadRequestException('Asset is available — just allocate it directly');
    }

    const existing = await this.prisma.transferRequest.findFirst({
      where: {
        assetId: dto.assetId,
        status: TransferStatus.PENDING,
      },
    });
    if (existing) {
      throw new ConflictException('A pending transfer request already exists for this asset');
    }

    return this.prisma.transferRequest.create({
      data: {
        assetId: dto.assetId,
        fromEmployeeId: requesterId,
        toEmployeeId: dto.toEmployeeId,
        status: TransferStatus.PENDING,
      },
    });
  }

  // ─── APPROVE TRANSFER ────────────────────────────────────────────────────────
  async approveTransfer(transferId: string) {
    const transfer = await this.prisma.transferRequest.findUnique({
      where: { id: transferId },
    });
    if (!transfer) throw new NotFoundException('Transfer request not found');
    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Transfer is not in a pending state');
    }

    // Close old allocation
    await this.prisma.assetAllocation.updateMany({
      where: { assetId: transfer.assetId, status: AllocationStatus.ACTIVE },
      data: { status: AllocationStatus.RETURNED, actualReturnDate: new Date() },
    });

    // Create new allocation for the target employee
    await this.prisma.assetAllocation.create({
      data: {
        assetId: transfer.assetId,
        employeeId: transfer.toEmployeeId,
        status: AllocationStatus.ACTIVE,
      },
    });

    // Mark transfer as approved
    const updated = await this.prisma.transferRequest.update({
      where: { id: transferId },
      data: { status: TransferStatus.APPROVED },
    });

    // Asset remains ALLOCATED
    return updated;
  }

  // ─── REJECT TRANSFER ─────────────────────────────────────────────────────────
  async rejectTransfer(transferId: string) {
    const transfer = await this.prisma.transferRequest.findUnique({
      where: { id: transferId },
    });
    if (!transfer) throw new NotFoundException('Transfer request not found');
    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException('Transfer is not in a pending state');
    }

    return this.prisma.transferRequest.update({
      where: { id: transferId },
      data: { status: TransferStatus.REJECTED },
    });
  }

  // ─── GET ALL TRANSFER REQUESTS ────────────────────────────────────────────────
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
}
