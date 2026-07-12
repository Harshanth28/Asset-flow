import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto, CreateTransferRequestDto, ReturnAssetDto } from './dto/allocation.dto';
import { JwtAuthGuard, RolesGuard } from '../users/auth.guard';
import { Roles } from '../users/roles.decorator';
import { Role } from '@prisma/client';

@Controller('allocations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  // Allocate an asset (Asset Manager / Admin only)
  @Post()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  allocate(@Body() dto: CreateAllocationDto) {
    return this.allocationsService.allocate(dto);
  }

  // Get all allocations
  @Get()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD)
  findAll() {
    return this.allocationsService.findAll();
  }

  // Return an asset (Asset Manager approves)
  @Patch(':id/return')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  returnAsset(@Param('id') id: string, @Body() dto: ReturnAssetDto) {
    return this.allocationsService.returnAsset(id, dto);
  }

  // Get overdue allocations (for dashboard)
  @Get('overdue')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD)
  getOverdue() {
    return this.allocationsService.getOverdue();
  }

  // Request a transfer (any authenticated user)
  @Post('transfers/request')
  requestTransfer(@Req() req: any, @Body() dto: CreateTransferRequestDto) {
    return this.allocationsService.requestTransfer(req.user.sub, dto);
  }

  // Get all transfer requests
  @Get('transfers')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD)
  getTransferRequests() {
    return this.allocationsService.getTransferRequests();
  }

  // Approve a transfer (Asset Manager / Dept Head)
  @Patch('transfers/:id/approve')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD)
  approveTransfer(@Param('id') id: string) {
    return this.allocationsService.approveTransfer(id);
  }

  // Reject a transfer
  @Patch('transfers/:id/reject')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD)
  rejectTransfer(@Param('id') id: string) {
    return this.allocationsService.rejectTransfer(id);
  }
}
