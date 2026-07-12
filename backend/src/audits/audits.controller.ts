import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuditsService } from './audits.service';
import { CreateAuditCycleDto, MarkAuditResultDto } from './dto/audit.dto';
import { JwtAuthGuard, RolesGuard } from '../users/auth.guard';
import { Roles } from '../users/roles.decorator';
import { Role } from '@prisma/client';

@Controller('audits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Post()
  @Roles(Role.ADMIN)
  createCycle(@Body() dto: CreateAuditCycleDto) {
    return this.auditsService.createCycle(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  findAll() {
    return this.auditsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditsService.findOne(id);
  }

  // Auditor marks each asset result
  @Post(':id/results')
  markResult(@Param('id') id: string, @Body() dto: MarkAuditResultDto) {
    return this.auditsService.markResult(id, dto);
  }

  // Auto-generate discrepancy report
  @Get(':id/report')
  getDiscrepancyReport(@Param('id') id: string) {
    return this.auditsService.getDiscrepancyReport(id);
  }

  // Close the audit cycle (locks + updates asset statuses)
  @Patch(':id/close')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  closeCycle(@Param('id') id: string) {
    return this.auditsService.closeCycle(id);
  }
}
