import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { AssetStatus, Prisma } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAssetDto) {
    // Generate next tag AF-XXXX using the latest sequential tag to avoid collisions and count overhead
    const lastAsset = await this.prisma.asset.findFirst({
      orderBy: { tag: 'desc' },
      select: { tag: true },
    });

    let nextNum = 1;
    if (lastAsset && lastAsset.tag) {
      const match = lastAsset.tag.match(/^AF-(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const tag = `AF-${String(nextNum).padStart(4, '0')}`;

    return this.prisma.asset.create({
      data: {
        name: dto.name,
        tag,
        categoryId: dto.categoryId,
        serialNumber: dto.serialNumber || null,
        acquisitionDate: dto.acquisitionDate
          ? new Date(dto.acquisitionDate)
          : new Date(),
        acquisitionCost:
          dto.acquisitionCost !== undefined ? dto.acquisitionCost : 0.0,
        condition: dto.condition || 'NEW',
        location: dto.location || null,
        isBookable: dto.isBookable || false,
        status: AssetStatus.AVAILABLE,
        photoUrl: dto.photoUrl || null,
        documentUrls: dto.documentUrls || [],
      },
    });
  }

  async findAll(filters: {
    search?: string;
    categoryId?: string;
    status?: AssetStatus;
    location?: string;
    departmentId?: string;
  }) {
    const whereClause: Prisma.AssetWhereInput = {};

    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search } },
        { tag: { contains: filters.search } },
        { serialNumber: { contains: filters.search } },
      ];
    }

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.location) {
      whereClause.location = {
        contains: filters.location,
      };
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

  async findOne(id: string) {
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
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async update(id: string, dto: UpdateAssetDto) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.asset.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
        serialNumber:
          dto.serialNumber !== undefined ? dto.serialNumber : undefined,
        acquisitionDate:
          dto.acquisitionDate !== undefined
            ? new Date(dto.acquisitionDate)
            : undefined,
        acquisitionCost:
          dto.acquisitionCost !== undefined ? dto.acquisitionCost : undefined,
        condition: dto.condition !== undefined ? dto.condition : undefined,
        location: dto.location !== undefined ? dto.location : undefined,
        isBookable: dto.isBookable !== undefined ? dto.isBookable : undefined,
        status: dto.status !== undefined ? dto.status : undefined,
        photoUrl: dto.photoUrl !== undefined ? dto.photoUrl : undefined,
        documentUrls:
          dto.documentUrls !== undefined ? dto.documentUrls : undefined,
      },
    });
  }

  async remove(id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return this.prisma.asset.delete({ where: { id } });
  }
}
