import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  // Append a log entry (called internally by other services)
  async log(userId: string, action: string, details: string) {
    return this.prisma.activityLog.create({
      data: { userId, action, details },
    });
  }

  // Get all activity logs (admin only)
  async findAll() {
    return this.prisma.activityLog.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get logs for a specific user
  async findForUser(userId: string) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
