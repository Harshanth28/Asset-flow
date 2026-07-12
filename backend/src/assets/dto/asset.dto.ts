import { AssetCondition, AssetStatus } from '@prisma/client';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  acquisitionDate?: string;

  @IsNumber()
  @IsOptional()
  acquisitionCost?: number;

  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isBookable?: boolean;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsArray()
  @IsOptional()
  documentUrls?: string[];
}

export class UpdateAssetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  acquisitionDate?: string;

  @IsNumber()
  @IsOptional()
  acquisitionCost?: number;

  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isBookable?: boolean;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsArray()
  @IsOptional()
  documentUrls?: string[];
}
