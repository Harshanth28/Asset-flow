export class CreateBookingDto {
  assetId!: string;
  startTime!: string; // ISO string
  endTime!: string;   // ISO string
}

export class UpdateBookingDto {
  startTime?: string;
  endTime?: string;
}
