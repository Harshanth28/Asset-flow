export class CreateAllocationDto {
  assetId!: string;
  employeeId?: string;
  departmentId?: string;
  expectedReturnDate?: string;
}

export class CreateTransferRequestDto {
  assetId!: string;
  toEmployeeId!: string;
}

export class ReturnAssetDto {
  checkInNotes?: string;
}
