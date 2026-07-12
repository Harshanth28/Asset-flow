"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./users/users.module");
const departments_module_1 = require("./departments/departments.module");
const categories_module_1 = require("./categories/categories.module");
const assets_module_1 = require("./assets/assets.module");
const allocations_module_1 = require("./allocations/allocations.module");
const bookings_module_1 = require("./bookings/bookings.module");
const maintenance_module_1 = require("./maintenance/maintenance.module");
const audits_module_1 = require("./audits/audits.module");
const notifications_module_1 = require("./notifications/notifications.module");
const logs_module_1 = require("./logs/logs.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const cron_module_1 = require("./cron/cron.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            departments_module_1.DepartmentsModule,
            categories_module_1.CategoriesModule,
            assets_module_1.AssetsModule,
            allocations_module_1.AllocationsModule,
            bookings_module_1.BookingsModule,
            maintenance_module_1.MaintenanceModule,
            audits_module_1.AuditsModule,
            notifications_module_1.NotificationsModule,
            logs_module_1.LogsModule,
            dashboard_module_1.DashboardModule,
            cron_module_1.CronModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map