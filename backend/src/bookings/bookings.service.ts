import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  // ─── OVERLAP VALIDATION ENGINE ───────────────────────────────────────────────
  // Two bookings overlap if: newStart < existingEnd AND newEnd > existingStart
  // Boundary case: newStart = existingEnd is NOT an overlap (back-to-back is fine)
  private async checkOverlap(
    assetId: string,
    newStart: Date,
    newEnd: Date,
    excludeBookingId?: string,
  ): Promise<void> {
    const conflicting = await this.prisma.resourceBooking.findFirst({
      where: {
        assetId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] },
        // Overlap condition: newStart < existing.endTime AND newEnd > existing.startTime
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
      throw new ConflictException({
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

  // ─── CREATE BOOKING ───────────────────────────────────────────────────────────
  async create(userId: string, dto: CreateBookingDto) {
    const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException('Asset not found');
    if (!asset.isBookable) {
      throw new BadRequestException('This asset is not marked as bookable/shared');
    }

    const newStart = new Date(dto.startTime);
    const newEnd = new Date(dto.endTime);

    if (newEnd <= newStart) {
      throw new BadRequestException('End time must be after start time');
    }

    // Run overlap check
    await this.checkOverlap(dto.assetId, newStart, newEnd);

    return this.prisma.resourceBooking.create({
      data: {
        assetId: dto.assetId,
        userId,
        startTime: newStart,
        endTime: newEnd,
        status: BookingStatus.UPCOMING,
      },
    });
  }

  // ─── GET BOOKINGS FOR AN ASSET (calendar view) ───────────────────────────────
  async findByAsset(assetId: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    return this.prisma.resourceBooking.findMany({
      where: {
        assetId,
        status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  // ─── GET USER'S BOOKINGS ──────────────────────────────────────────────────────
  async findMyBookings(userId: string) {
    return this.prisma.resourceBooking.findMany({
      where: { userId },
      include: {
        asset: { select: { id: true, name: true, tag: true, location: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  // ─── RESCHEDULE BOOKING ───────────────────────────────────────────────────────
  async reschedule(bookingId: string, userId: string, dto: UpdateBookingDto) {
    const booking = await this.prisma.resourceBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new BadRequestException('You can only reschedule your own bookings');
    }
    if (booking.status !== BookingStatus.UPCOMING) {
      throw new BadRequestException('Only upcoming bookings can be rescheduled');
    }

    const newStart = dto.startTime ? new Date(dto.startTime) : booking.startTime;
    const newEnd = dto.endTime ? new Date(dto.endTime) : booking.endTime;

    if (newEnd <= newStart) {
      throw new BadRequestException('End time must be after start time');
    }

    // Overlap check (excluding current booking)
    await this.checkOverlap(booking.assetId, newStart, newEnd, bookingId);

    return this.prisma.resourceBooking.update({
      where: { id: bookingId },
      data: { startTime: newStart, endTime: newEnd },
    });
  }

  // ─── CANCEL BOOKING ───────────────────────────────────────────────────────────
  async cancel(bookingId: string, userId: string) {
    const booking = await this.prisma.resourceBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new BadRequestException('You can only cancel your own bookings');
    }
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking cannot be cancelled');
    }

    return this.prisma.resourceBooking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });
  }

  // ─── UPDATE BOOKING STATUSES (called by cron job) ────────────────────────────
  async syncBookingStatuses() {
    const now = new Date();

    // Mark ongoing bookings
    await this.prisma.resourceBooking.updateMany({
      where: {
        status: BookingStatus.UPCOMING,
        startTime: { lte: now },
        endTime: { gt: now },
      },
      data: { status: BookingStatus.ONGOING },
    });

    // Mark completed bookings
    await this.prisma.resourceBooking.updateMany({
      where: {
        status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] },
        endTime: { lte: now },
      },
      data: { status: BookingStatus.COMPLETED },
    });

    return { synced: true };
  }
}
