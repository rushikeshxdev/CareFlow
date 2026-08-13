import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PatientsService } from './patients.service';

@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get patient record' })
  async findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }
}
