import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SpecialtiesService } from './specialties.service';

@ApiTags('Specialties')
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get medical specialties list' })
  async findAll() {
    return this.specialtiesService.findAll();
  }
}
