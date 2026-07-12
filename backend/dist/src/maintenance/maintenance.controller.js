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
exports.MaintenanceController = void 0;
const common_1 = require("@nestjs/common");
const maintenance_service_1 = require("./maintenance.service");
const maintenance_dto_1 = require("./dto/maintenance.dto");
const auth_guard_1 = require("../users/auth.guard");
const roles_decorator_1 = require("../users/roles.decorator");
const client_1 = require("@prisma/client");
let MaintenanceController = class MaintenanceController {
    maintenanceService;
    constructor(maintenanceService) {
        this.maintenanceService = maintenanceService;
    }
    create(req, dto) {
        return this.maintenanceService.create(req.user.sub, dto);
    }
    findAll() {
        return this.maintenanceService.findAll();
    }
    findOne(id) {
        return this.maintenanceService.findOne(id);
    }
    approve(id) {
        return this.maintenanceService.approve(id);
    }
    reject(id) {
        return this.maintenanceService.reject(id);
    }
    assignTechnician(id, dto) {
        return this.maintenanceService.assignTechnician(id, dto);
    }
    resolve(id) {
        return this.maintenanceService.resolve(id);
    }
};
exports.MaintenanceController = MaintenanceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, maintenance_dto_1.CreateMaintenanceDto]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER, client_1.Role.DEPARTMENT_HEAD),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "reject", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, maintenance_dto_1.AssignTechnicianDto]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "assignTechnician", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "resolve", null);
exports.MaintenanceController = MaintenanceController = __decorate([
    (0, common_1.Controller)('maintenance'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.RolesGuard),
    __metadata("design:paramtypes", [maintenance_service_1.MaintenanceService])
], MaintenanceController);
//# sourceMappingURL=maintenance.controller.js.map