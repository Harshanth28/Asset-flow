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
var CronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const allocations_service_1 = require("../allocations/allocations.service");
const bookings_service_1 = require("../bookings/bookings.service");
let CronService = CronService_1 = class CronService {
    allocationsService;
    bookingsService;
    logger = new common_1.Logger(CronService_1.name);
    constructor(allocationsService, bookingsService) {
        this.allocationsService = allocationsService;
        this.bookingsService = bookingsService;
    }
    async flagOverdueAllocations() {
        const result = await this.allocationsService.flagOverdue();
        this.logger.log(`[CRON] Overdue allocations flagged: ${result.flagged}`);
    }
    async syncBookingStatuses() {
        const result = await this.bookingsService.syncBookingStatuses();
        this.logger.log(`[CRON] Booking statuses synced: ${JSON.stringify(result)}`);
    }
};
exports.CronService = CronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "flagOverdueAllocations", null);
__decorate([
    (0, schedule_1.Cron)('*/15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "syncBookingStatuses", null);
exports.CronService = CronService = CronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [allocations_service_1.AllocationsService,
        bookings_service_1.BookingsService])
], CronService);
//# sourceMappingURL=cron.service.js.map