import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
export declare class BookingsService {
    private prisma;
    constructor(prisma: PrismaService);
    private checkOverlap;
    create(userId: string, dto: CreateBookingDto): Promise<{
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
    findMyBookings(userId: string): Promise<({
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
    reschedule(bookingId: string, userId: string, dto: UpdateBookingDto): Promise<{
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        startTime: Date;
        endTime: Date;
    }>;
    cancel(bookingId: string, userId: string): Promise<{
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        startTime: Date;
        endTime: Date;
    }>;
    syncBookingStatuses(): Promise<{
        synced: boolean;
    }>;
}
