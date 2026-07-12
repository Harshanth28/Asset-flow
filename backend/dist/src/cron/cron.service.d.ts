import { AllocationsService } from '../allocations/allocations.service';
import { BookingsService } from '../bookings/bookings.service';
export declare class CronService {
    private readonly allocationsService;
    private readonly bookingsService;
    private readonly logger;
    constructor(allocationsService: AllocationsService, bookingsService: BookingsService);
    flagOverdueAllocations(): Promise<void>;
    syncBookingStatuses(): Promise<void>;
}
