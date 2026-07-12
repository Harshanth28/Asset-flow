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
exports.AllocationsController = void 0;
const common_1 = require("@nestjs/common");
const allocations_service_1 = require("./allocations.service");
const allocation_dto_1 = require("./dto/allocation.dto");
const auth_guard_1 = require("../users/auth.guard");
const roles_decorator_1 = require("../users/roles.decorator");
const client_1 = require("@prisma/client");
let AllocationsController = class AllocationsController {
    allocationsService;
    constructor(allocationsService) {
        this.allocationsService = allocationsService;
    }
    allocate(dto) {
        return this.allocationsService.allocate(dto);
    }
    findAll() {
        return this.allocationsService.findAll();
    }
    returnAsset(id, dto) {
        return this.allocationsService.returnAsset(id, dto);
    }
    getOverdue() {
        return this.allocationsService.getOverdue();
    }
    requestTransfer(req, dto) {
        return this.allocationsService.requestTransfer(req.user.sub, dto);
    }
    getTransferRequests() {
        return this.allocationsService.getTransferRequests();
    }
    approveTransfer(id) {
        return this.allocationsService.approveTransfer(id);
    }
    rejectTransfer(id) {
        return this.allocationsService.rejectTransfer(id);
    }
};
exports.AllocationsController = AllocationsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [allocation_dto_1.CreateAllocationDto]),
    __metadata("design:returntype", void 0)
], AllocationsController.prototype, "allocate", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER, client_1.Role.DEPARTMENT_HEAD),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AllocationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/return'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, allocation_dto_1.ReturnAssetDto]),
    __metadata("design:returntype", void 0)
], AllocationsController.prototype, "returnAsset", null);
__decorate([
    (0, common_1.Get)('overdue'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER, client_1.Role.DEPARTMENT_HEAD),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AllocationsController.prototype, "getOverdue", null);
__decorate([
    (0, common_1.Post)('transfers/request'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, allocation_dto_1.CreateTransferRequestDto]),
    __metadata("design:returntype", void 0)
], AllocationsController.prototype, "requestTransfer", null);
__decorate([
    (0, common_1.Get)('transfers'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER, client_1.Role.DEPARTMENT_HEAD),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AllocationsController.prototype, "getTransferRequests", null);
__decorate([
    (0, common_1.Patch)('transfers/:id/approve'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER, client_1.Role.DEPARTMENT_HEAD),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AllocationsController.prototype, "approveTransfer", null);
__decorate([
    (0, common_1.Patch)('transfers/:id/reject'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER, client_1.Role.DEPARTMENT_HEAD),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AllocationsController.prototype, "rejectTransfer", null);
exports.AllocationsController = AllocationsController = __decorate([
    (0, common_1.Controller)('allocations'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.RolesGuard),
    __metadata("design:paramtypes", [allocations_service_1.AllocationsService])
], AllocationsController);
//# sourceMappingURL=allocations.controller.js.map