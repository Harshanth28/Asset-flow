import { Controller, Get, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard, RolesGuard } from '../users/auth.guard';
import { Roles } from '../users/roles.decorator';
import { Role } from '@prisma/client';

@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  findAll() {
    return this.logsService.findAll();
  }
}
