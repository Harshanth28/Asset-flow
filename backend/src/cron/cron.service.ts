import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AllocationsService } from '../allocations/allocations.service';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly allocationsService: AllocationsService,
    private readonly bookingsService: BookingsService,
  ) {}

  // Run every hour — flag overdue allocations
  @Cron(CronExpression.EVERY_HOUR)
  async flagOverdueAllocations() {
    const result = await this.allocationsService.flagOverdue();
    this.logger.log(`[CRON] Overdue allocations flagged: ${result.flagged}`);
  }

  // Run every 15 minutes — sync booking statuses (upcoming → ongoing → completed)
  @Cron('*/15 * * * *')
  async syncBookingStatuses() {
    const result = await this.bookingsService.syncBookingStatuses();
    this.logger.log(
      `[CRON] Booking statuses synced: ${JSON.stringify(result)}`,
    );
  }
}
