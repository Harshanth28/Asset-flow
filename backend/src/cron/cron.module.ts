import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { AllocationsModule } from '../allocations/allocations.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [AllocationsModule, BookingsModule],
  providers: [CronService],
})
export class CronModule {}
