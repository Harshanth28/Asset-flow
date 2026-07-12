import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import {
  CreateMaintenanceDto,
  AssignTechnicianDto,
} from './dto/maintenance.dto';
import { JwtAuthGuard, RolesGuard } from '../users/auth.guard';
import { Roles } from '../users/roles.decorator';
import { Role } from '@prisma/client';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  // Any user can raise a request
  @Post()
  create(
    @Req() req: { user: { sub: string } },
    @Body() dto: CreateMaintenanceDto,
  ) {
    return this.maintenanceService.create(req.user.sub, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD)
  findAll() {
    return this.maintenanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  // Pending → Approved  (asset becomes UNDER_MAINTENANCE)
  @Patch(':id/approve')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  approve(@Param('id') id: string) {
    return this.maintenanceService.approve(id);
  }

  // Pending → Rejected
  @Patch(':id/reject')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  reject(@Param('id') id: string) {
    return this.maintenanceService.reject(id);
  }

  // Approved → In Progress (assign technician)
  @Patch(':id/assign')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  assignTechnician(@Param('id') id: string, @Body() dto: AssignTechnicianDto) {
    return this.maintenanceService.assignTechnician(id, dto);
  }

  // In Progress → Resolved  (asset becomes AVAILABLE)
  @Patch(':id/resolve')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  resolve(@Param('id') id: string) {
    return this.maintenanceService.resolve(id);
  }
}
