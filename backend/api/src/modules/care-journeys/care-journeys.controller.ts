import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CareJourneysService } from './care-journeys.service';

@ApiTags('Care Journey')
@Controller('care-journeys')
export class CareJourneysController {
  constructor(private readonly careJourneysService: CareJourneysService) {}

  @Get()
  @ApiOperation({ summary: 'Get care journeys for a patient' })
  async findAll(@Query('patientId') patientId?: string) {
    return this.careJourneysService.findAll(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get care journey details' })
  async findOne(@Param('id') id: string) {
    return this.careJourneysService.findOne(id);
  }
}
