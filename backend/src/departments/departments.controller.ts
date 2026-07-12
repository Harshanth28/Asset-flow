import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { JwtAuthGuard, RolesGuard } from '../users/auth.guard';
import { Roles } from '../users/roles.decorator';
import { Role } from '@prisma/client';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDeptDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDeptDto);
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateDeptDto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, updateDeptDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  deactivate(@Param('id') id: string) {
    return this.departmentsService.deactivate(id);
  }
}
