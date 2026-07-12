import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getUtilization() {
    const assets = await this.prisma.asset.findMany({
      select: {
        id: true,
        name: true,
        tag: true,
        status: true,
        categoryId: true,
        category: { select: { name: true } },
      },
    });

    const total = assets.length;
    const allocated = assets.filter(a => a.status === 'ALLOCATED').length;
    const available = assets.filter(a => a.status === 'AVAILABLE').length;
    const maintenance = assets.filter(a => a.status === 'UNDER_MAINTENANCE').length;

    const categoryBreakdown = assets.reduce((acc, a) => {
      const cat = a.category?.name || 'Uncategorized';
      if (!acc[cat]) acc[cat] = 0;
      acc[cat]++;
      return acc;
    }, {} as Record<string, number>);

    return { total, allocated, available, maintenance, categoryBreakdown };
  }
}
