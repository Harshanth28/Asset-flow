import { Controller, Post, Get, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { JwtAuthGuard, RolesGuard } from '../users/auth.guard';
import { Roles } from '../users/roles.decorator';
import { Role, AssetStatus } from '@prisma/client';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: AssetStatus,
    @Query('location') location?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.assetsService.findAll({ search, categoryId, status, location, departmentId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}
