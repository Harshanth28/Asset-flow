import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard, RolesGuard } from '../users/auth.guard';
import { Roles } from '../users/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('utilization')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD)
  getUtilization() {
    return this.reportsService.getUtilization();
  }
}
