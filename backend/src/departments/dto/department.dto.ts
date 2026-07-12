import { UserStatus } from '@prisma/client';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  headId?: string;
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  headId?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
