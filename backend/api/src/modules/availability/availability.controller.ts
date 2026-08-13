import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';

@ApiTags('Availability')
@Controller()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('providers/:id/availability')
  @ApiOperation({ summary: 'Get availability slots for a specific provider' })
  async getAvailability(@Param('id') providerId: string) {
    return this.availabilityService.getProviderAvailability(providerId);
  }
}
