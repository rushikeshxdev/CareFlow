import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppointmentsService, CreateAppointmentDto, HoldSlotDto } from './appointments.service';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('hold')
  @ApiOperation({ summary: 'Hold an availability slot temporarily (10-min lock)' })
  @ApiResponse({ status: 201, description: 'Slot successfully held' })
  async holdSlot(@Body() dto: HoldSlotDto) {
    return this.appointmentsService.holdSlot(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Book & confirm an appointment' })
  @ApiResponse({ status: 201, description: 'Appointment confirmed' })
  async create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List appointments for a patient' })
  async findAll(@Query('patientId') patientId: string) {
    return this.appointmentsService.findAllForPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details by ID' })
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an appointment' })
  async cancel(@Param('id') id: string) {
    return this.appointmentsService.cancelAppointment(id);
  }
}
