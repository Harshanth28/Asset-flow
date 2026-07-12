import { Controller, Post, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginDto, PromoteUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard, RolesGuard } from './auth.guard';
import { Roles } from './roles.decorator';
import { CurrentUser } from './current-user.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── AUTH ───────────────────────────────────────────────────────────────────
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signup(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  // ─── CURRENT USER ─────────────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.findOne(userId);
  }

  // ─── ADMIN ACTIONS ────────────────────────────────────────────────────────
  @Post('promote')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  promote(@Body() promoteUserDto: PromoteUserDto) {
    return this.usersService.promote(promoteUserDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  // ─── EMPLOYEE DIRECTORY ───────────────────────────────────────────────────
  @Get('directory')
  @UseGuards(JwtAuthGuard)
  getDirectory() {
    return this.usersService.getDirectory();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}

