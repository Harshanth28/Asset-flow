import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getUtilization() {
    const [statusCounts, categoryCounts, categories] = await Promise.all([
      this.prisma.asset.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.asset.groupBy({
        by: ['categoryId'],
        _count: { _all: true },
      }),
      this.prisma.assetCategory.findMany({
        select: { id: true, name: true },
      }),
    ]);

    const total = statusCounts.reduce((sum, curr) => sum + curr._count._all, 0);
    const allocated =
      statusCounts.find((s) => s.status === 'ALLOCATED')?._count._all || 0;
    const available =
      statusCounts.find((s) => s.status === 'AVAILABLE')?._count._all || 0;
    const maintenance =
      statusCounts.find((s) => s.status === 'UNDER_MAINTENANCE')?._count._all ||
      0;

    const categoryBreakdown = categories.reduce(
      (acc, cat) => {
        const countObj = categoryCounts.find((c) => c.categoryId === cat.id);
        acc[cat.name] = countObj ? countObj._count._all : 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, allocated, available, maintenance, categoryBreakdown };
  }
}
