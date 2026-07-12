import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(req: any, dto: CreateBookingDto): Promise<{
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        startTime: Date;
        endTime: Date;
    }>;
    findByAsset(assetId: string): Promise<({
        user: {
            name: string;
            id: string;
        };
    } & {
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        startTime: Date;
        endTime: Date;
    })[]>;
    findMyBookings(req: any): Promise<({
        asset: {
            name: string;
            id: string;
            tag: string;
            location: string | null;
        };
    } & {
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        startTime: Date;
        endTime: Date;
    })[]>;
    reschedule(id: string, req: any, dto: UpdateBookingDto): Promise<{
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        startTime: Date;
        endTime: Date;
    }>;
    cancel(id: string, req: any): Promise<{
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        startTime: Date;
        endTime: Date;
    }>;
}
