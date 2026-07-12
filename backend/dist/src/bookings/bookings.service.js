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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let BookingsService = class BookingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkOverlap(assetId, newStart, newEnd, excludeBookingId) {
        const conflicting = await this.prisma.resourceBooking.findFirst({
            where: {
                assetId,
                id: excludeBookingId ? { not: excludeBookingId } : undefined,
                status: { in: [client_1.BookingStatus.UPCOMING, client_1.BookingStatus.ONGOING] },
                AND: [
                    { startTime: { lt: newEnd } },
                    { endTime: { gt: newStart } },
                ],
            },
            include: {
                user: { select: { id: true, name: true } },
            },
        });
        if (conflicting) {
            throw new common_1.ConflictException({
                message: `Time slot overlaps with an existing booking`,
                conflictingBooking: {
                    id: conflicting.id,
                    bookedBy: conflicting.user.name,
                    from: conflicting.startTime,
                    to: conflicting.endTime,
                },
            });
        }
    }
    async create(userId, dto) {
        const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        if (!asset.isBookable) {
            throw new common_1.BadRequestException('This asset is not marked as bookable/shared');
        }
        const newStart = new Date(dto.startTime);
        const newEnd = new Date(dto.endTime);
        if (newEnd <= newStart) {
            throw new common_1.BadRequestException('End time must be after start time');
        }
        await this.checkOverlap(dto.assetId, newStart, newEnd);
        return this.prisma.resourceBooking.create({
            data: {
                assetId: dto.assetId,
                userId,
                startTime: newStart,
                endTime: newEnd,
                status: client_1.BookingStatus.UPCOMING,
            },
        });
    }
    async findByAsset(assetId) {
        const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        return this.prisma.resourceBooking.findMany({
            where: {
                assetId,
                status: { in: [client_1.BookingStatus.UPCOMING, client_1.BookingStatus.ONGOING] },
            },
            include: {
                user: { select: { id: true, name: true } },
            },
            orderBy: { startTime: 'asc' },
        });
    }
    async findMyBookings(userId) {
        return this.prisma.resourceBooking.findMany({
            where: { userId },
            include: {
                asset: { select: { id: true, name: true, tag: true, location: true } },
            },
            orderBy: { startTime: 'asc' },
        });
    }
    async reschedule(bookingId, userId, dto) {
        const booking = await this.prisma.resourceBooking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.userId !== userId) {
            throw new common_1.BadRequestException('You can only reschedule your own bookings');
        }
        if (booking.status !== client_1.BookingStatus.UPCOMING) {
            throw new common_1.BadRequestException('Only upcoming bookings can be rescheduled');
        }
        const newStart = dto.startTime ? new Date(dto.startTime) : booking.startTime;
        const newEnd = dto.endTime ? new Date(dto.endTime) : booking.endTime;
        if (newEnd <= newStart) {
            throw new common_1.BadRequestException('End time must be after start time');
        }
        await this.checkOverlap(booking.assetId, newStart, newEnd, bookingId);
        return this.prisma.resourceBooking.update({
            where: { id: bookingId },
            data: { startTime: newStart, endTime: newEnd },
        });
    }
    async cancel(bookingId, userId) {
        const booking = await this.prisma.resourceBooking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.userId !== userId) {
            throw new common_1.BadRequestException('You can only cancel your own bookings');
        }
        if (booking.status === client_1.BookingStatus.COMPLETED || booking.status === client_1.BookingStatus.CANCELLED) {
            throw new common_1.BadRequestException('Booking cannot be cancelled');
        }
        return this.prisma.resourceBooking.update({
            where: { id: bookingId },
            data: { status: client_1.BookingStatus.CANCELLED },
        });
    }
    async syncBookingStatuses() {
        const now = new Date();
        await this.prisma.resourceBooking.updateMany({
            where: {
                status: client_1.BookingStatus.UPCOMING,
                startTime: { lte: now },
                endTime: { gt: now },
            },
            data: { status: client_1.BookingStatus.ONGOING },
        });
        await this.prisma.resourceBooking.updateMany({
            where: {
                status: { in: [client_1.BookingStatus.UPCOMING, client_1.BookingStatus.ONGOING] },
                endTime: { lte: now },
            },
            data: { status: client_1.BookingStatus.COMPLETED },
        });
        return { synced: true };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map