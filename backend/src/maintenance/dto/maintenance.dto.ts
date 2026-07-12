import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  assetId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class AssignTechnicianDto {
  @IsString()
  @IsNotEmpty()
  technician!: string;
}
