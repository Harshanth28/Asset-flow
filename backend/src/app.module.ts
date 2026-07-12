import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { CategoriesModule } from './categories/categories.module';
import { AssetsModule } from './assets/assets.module';
import { AllocationsModule } from './allocations/allocations.module';
import { BookingsModule } from './bookings/bookings.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AuditsModule } from './audits/audits.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LogsModule } from './logs/logs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    DepartmentsModule,
    CategoriesModule,
    AssetsModule,
    AllocationsModule,
    BookingsModule,
    MaintenanceModule,
    AuditsModule,
    NotificationsModule,
    LogsModule,
    DashboardModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

