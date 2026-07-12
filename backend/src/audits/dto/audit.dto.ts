import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';

export class CreateAuditCycleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['department', 'location'])
  scopeType!: 'department' | 'location';

  @IsString()
  @IsNotEmpty()
  scopeValue!: string;

  @IsString()
  @IsNotEmpty()
  startDate!: string;

  @IsString()
  @IsNotEmpty()
  endDate!: string;

  @IsArray()
  @IsNotEmpty()
  auditorIds!: string[];
}

export class MarkAuditResultDto {
  @IsString()
  @IsNotEmpty()
  assetId!: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['VERIFIED', 'MISSING', 'DAMAGED'])
  status!: 'VERIFIED' | 'MISSING' | 'DAMAGED';

  @IsString()
  @IsOptional()
  notes?: string;
}
