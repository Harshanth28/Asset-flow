"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditsController = void 0;
const common_1 = require("@nestjs/common");
const audits_service_1 = require("./audits.service");
const audit_dto_1 = require("./dto/audit.dto");
const auth_guard_1 = require("../users/auth.guard");
const roles_decorator_1 = require("../users/roles.decorator");
const client_1 = require("@prisma/client");
let AuditsController = class AuditsController {
    auditsService;
    constructor(auditsService) {
        this.auditsService = auditsService;
    }
    createCycle(dto) {
        return this.auditsService.createCycle(dto);
    }
    findAll() {
        return this.auditsService.findAll();
    }
    findOne(id) {
        return this.auditsService.findOne(id);
    }
    markResult(id, dto) {
        return this.auditsService.markResult(id, dto);
    }
    getDiscrepancyReport(id) {
        return this.auditsService.getDiscrepancyReport(id);
    }
    closeCycle(id) {
        return this.auditsService.closeCycle(id);
    }
};
exports.AuditsController = AuditsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_dto_1.CreateAuditCycleDto]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "createCycle", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/results'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, audit_dto_1.MarkAuditResultDto]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "markResult", null);
__decorate([
    (0, common_1.Get)(':id/report'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "getDiscrepancyReport", null);
__decorate([
    (0, common_1.Patch)(':id/close'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuditsController.prototype, "closeCycle", null);
exports.AuditsController = AuditsController = __decorate([
    (0, common_1.Controller)('audits'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.RolesGuard),
    __metadata("design:paramtypes", [audits_service_1.AuditsService])
], AuditsController);
//# sourceMappingURL=audits.controller.js.map