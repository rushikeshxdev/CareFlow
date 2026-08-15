import { Controller, Get, Param, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { CareJourneysService } from './care-journeys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '@prisma/client';

@ApiTags('Care Journey')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('care-journeys')
export class CareJourneysController {
  constructor(private readonly careJourneysService: CareJourneysService) {}

  @Get()
  @ApiOperation({ summary: 'Get care journeys for authenticated patient' })
  async findAll(@Req() req: Request & { user: AuthenticatedUser }) {
    if (!req.user.patientId) {
      return [];
    }
    return this.careJourneysService.findAll(req.user.patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get care journey details (Patient ownership protected)' })
  async findOne(@Param('id') id: string, @Req() req: Request & { user: AuthenticatedUser }) {
    const journey = await this.careJourneysService.findOne(id);
    
    // Strict ownership validation
    if (req.user.role !== UserRole.ADMIN && journey.patientId !== req.user.patientId) {
      throw new NotFoundException(`Care Journey "${id}" not found.`);
    }

    return journey;
  }
}
