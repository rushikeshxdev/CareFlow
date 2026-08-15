import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AppointmentsService, CreateAppointmentDto, HoldSlotDto } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '@prisma/client';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('hold')
  @ApiOperation({ summary: 'Hold an availability slot temporarily (10-min lock)' })
  @ApiResponse({ status: 201, description: 'Slot successfully held' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @ApiResponse({ status: 409, description: 'Slot already held or booked' })
  async holdSlot(@Body() dto: HoldSlotDto, @Req() req: Request & { user: AuthenticatedUser }) {
    if (!req.user.patientId) {
      throw new BadRequestException('Authenticated user does not have a registered patient profile.');
    }
    // Bind hold to authenticated patient identity
    const safeDto = { ...dto, patientId: req.user.patientId };
    return this.appointmentsService.holdSlot(safeDto);
  }

  @Post()
  @ApiOperation({ summary: 'Book & confirm an appointment' })
  @ApiResponse({ status: 201, description: 'Appointment confirmed' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @ApiResponse({ status: 409, description: 'Slot already booked' })
  async create(@Body() dto: CreateAppointmentDto, @Req() req: Request & { user: AuthenticatedUser }) {
    if (!req.user.patientId) {
      throw new BadRequestException('Authenticated user does not have a registered patient profile.');
    }
    // Override frontend patientId with authenticated user patientId
    const safeDto = { ...dto, patientId: req.user.patientId };
    return this.appointmentsService.createAppointment(safeDto);
  }

  @Get()
  @ApiOperation({ summary: 'List appointments for authenticated patient' })
  async findAll(@Req() req: Request & { user: AuthenticatedUser }) {
    if (!req.user.patientId) {
      return [];
    }
    return this.appointmentsService.findAllForPatient(req.user.patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details by ID (Patient ownership protected)' })
  async findOne(@Param('id') id: string, @Req() req: Request & { user: AuthenticatedUser }) {
    const appointment = await this.appointmentsService.findOne(id);
    
    // Strict ownership validation: Patient can only view their own appointments
    if (req.user.role !== UserRole.ADMIN && appointment.patientId !== req.user.patientId) {
      throw new NotFoundException(`Appointment "${id}" not found.`);
    }

    return appointment;
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an appointment (Patient ownership protected)' })
  async cancel(@Param('id') id: string, @Req() req: Request & { user: AuthenticatedUser }) {
    const appointment = await this.appointmentsService.findOne(id);

    // Strict ownership validation: Patient can only cancel their own appointments
    if (req.user.role !== UserRole.ADMIN && appointment.patientId !== req.user.patientId) {
      throw new NotFoundException(`Appointment "${id}" not found.`);
    }

    return this.appointmentsService.cancelAppointment(id);
  }
}
