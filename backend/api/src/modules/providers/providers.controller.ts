import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ProvidersService, ProviderQueryDto } from './providers.service';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'Search and discover providers with deterministic ranking scores' })
  @ApiQuery({ name: 'providerType', required: false, enum: ['DOCTOR', 'HOSPITAL', 'DIAGNOSTIC_CENTER', 'HOME_CARE'] })
  @ApiQuery({ name: 'specialtyId', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['score', 'rating', 'price', 'experience'] })
  @ApiResponse({ status: 200, description: 'List of scored providers' })
  async findAll(@Query() query: ProviderQueryDto) {
    return this.providersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider details by ID' })
  @ApiResponse({ status: 200, description: 'Detailed provider entity with slots and services' })
  async findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }
}
