import { Controller, Post, Get, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../users/auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.sub, dto);
  }

  // Calendar view for a specific bookable asset
  @Get('asset/:assetId')
  findByAsset(@Param('assetId') assetId: string) {
    return this.bookingsService.findByAsset(assetId);
  }

  // Current user's bookings
  @Get('my')
  findMyBookings(@Req() req: any) {
    return this.bookingsService.findMyBookings(req.user.sub);
  }

  @Patch(':id/reschedule')
  reschedule(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateBookingDto) {
    return this.bookingsService.reschedule(id, req.user.sub, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.cancel(id, req.user.sub);
  }
}
