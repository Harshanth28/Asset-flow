export declare class CreateAllocationDto {
    assetId: string;
    employeeId?: string;
    departmentId?: string;
    expectedReturnDate?: string;
}
export declare class CreateTransferRequestDto {
    assetId: string;
    toEmployeeId: string;
}
export declare class ReturnAssetDto {
    checkInNotes?: string;
}
