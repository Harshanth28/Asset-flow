import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}
