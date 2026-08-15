import { Controller, Get, Param, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '@prisma/client';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get patient record (Ownership protected)' })
  async findOne(@Param('id') id: string, @Req() req: Request & { user: AuthenticatedUser }) {
    // Strict ownership validation: PATIENT can only access their own record
    if (req.user.role !== UserRole.ADMIN && req.user.patientId !== id) {
      throw new NotFoundException(`Patient record "${id}" not found.`);
    }

    return this.patientsService.findOne(id);
  }
}
