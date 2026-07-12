"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAssetDto = exports.CreateAssetDto = void 0;
class CreateAssetDto {
    name;
    categoryId;
    serialNumber;
    acquisitionDate;
    acquisitionCost;
    condition;
    location;
    isBookable;
    photoUrl;
    documentUrls;
}
exports.CreateAssetDto = CreateAssetDto;
class UpdateAssetDto {
    name;
    categoryId;
    serialNumber;
    acquisitionDate;
    acquisitionCost;
    condition;
    location;
    isBookable;
    status;
    photoUrl;
    documentUrls;
}
exports.UpdateAssetDto = UpdateAssetDto;
//# sourceMappingURL=asset.dto.js.map