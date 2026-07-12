"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkAuditResultDto = exports.CreateAuditCycleDto = void 0;
class CreateAuditCycleDto {
    name;
    scopeType;
    scopeValue;
    startDate;
    endDate;
    auditorIds;
}
exports.CreateAuditCycleDto = CreateAuditCycleDto;
class MarkAuditResultDto {
    assetId;
    status;
    notes;
}
exports.MarkAuditResultDto = MarkAuditResultDto;
//# sourceMappingURL=audit.dto.js.map