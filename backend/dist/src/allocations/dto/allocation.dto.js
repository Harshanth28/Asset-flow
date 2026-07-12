"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnAssetDto = exports.CreateTransferRequestDto = exports.CreateAllocationDto = void 0;
class CreateAllocationDto {
    assetId;
    employeeId;
    departmentId;
    expectedReturnDate;
}
exports.CreateAllocationDto = CreateAllocationDto;
class CreateTransferRequestDto {
    assetId;
    toEmployeeId;
}
exports.CreateTransferRequestDto = CreateTransferRequestDto;
class ReturnAssetDto {
    checkInNotes;
}
exports.ReturnAssetDto = ReturnAssetDto;
//# sourceMappingURL=allocation.dto.js.map