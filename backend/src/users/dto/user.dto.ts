import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class PromoteUserDto {
  @IsString()
  userId!: string;

  @IsEnum(Role)
  role!: Role;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

