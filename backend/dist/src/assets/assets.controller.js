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
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const assets_service_1 = require("./assets.service");
const asset_dto_1 = require("./dto/asset.dto");
const auth_guard_1 = require("../users/auth.guard");
const roles_decorator_1 = require("../users/roles.decorator");
const client_1 = require("@prisma/client");
let AssetsController = class AssetsController {
    assetsService;
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    create(createAssetDto) {
        return this.assetsService.create(createAssetDto);
    }
    findAll(search, categoryId, status, location, departmentId) {
        return this.assetsService.findAll({ search, categoryId, status, location, departmentId });
    }
    findOne(id) {
        return this.assetsService.findOne(id);
    }
    update(id, updateAssetDto) {
        return this.assetsService.update(id, updateAssetDto);
    }
    remove(id) {
        return this.assetsService.remove(id);
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [asset_dto_1.CreateAssetDto]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('location')),
    __param(4, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.ASSET_MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, asset_dto_1.UpdateAssetDto]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "remove", null);
exports.AssetsController = AssetsController = __decorate([
    (0, common_1.Controller)('assets'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.RolesGuard),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map