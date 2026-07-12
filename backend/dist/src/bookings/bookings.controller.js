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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
const booking_dto_1 = require("./dto/booking.dto");
const auth_guard_1 = require("../users/auth.guard");
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    create(req, dto) {
        return this.bookingsService.create(req.user.sub, dto);
    }
    findByAsset(assetId) {
        return this.bookingsService.findByAsset(assetId);
    }
    findMyBookings(req) {
        return this.bookingsService.findMyBookings(req.user.sub);
    }
    reschedule(id, req, dto) {
        return this.bookingsService.reschedule(id, req.user.sub, dto);
    }
    cancel(id, req) {
        return this.bookingsService.cancel(id, req.user.sub);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('asset/:assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findByAsset", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findMyBookings", null);
__decorate([
    (0, common_1.Patch)(':id/reschedule'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, booking_dto_1.UpdateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "reschedule", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "cancel", null);
exports.BookingsController = BookingsController = __decorate([
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map