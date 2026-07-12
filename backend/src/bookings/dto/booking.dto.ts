import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  assetId!: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string; // ISO string

  @IsString()
  @IsNotEmpty()
  endTime!: string; // ISO string
}

export class UpdateBookingDto {
  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;
}
