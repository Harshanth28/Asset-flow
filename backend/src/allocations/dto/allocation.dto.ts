import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAllocationDto {
  @IsString()
  @IsNotEmpty()
  assetId!: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  expectedReturnDate?: string;
}

export class CreateTransferRequestDto {
  @IsString()
  @IsNotEmpty()
  assetId!: string;

  @IsString()
  @IsNotEmpty()
  toEmployeeId!: string;
}

export class ReturnAssetDto {
  @IsString()
  @IsOptional()
  checkInNotes?: string;
}
