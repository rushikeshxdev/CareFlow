import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiOrchestrationService, AnalyzeConcernDto } from './ai-orchestration.service';

@ApiTags('AI Orchestration')
@Controller('ai')
export class AiOrchestrationController {
  constructor(private readonly aiOrchestrationService: AiOrchestrationService) {}

  @Post('analyze-intent')
  @ApiOperation({ summary: 'Analyze patient concern with AI microservice & orchestrate recommendations' })
  @ApiResponse({ status: 200, description: 'Structured intent analysis with provider matches' })
  async analyzeIntent(@Body() dto: AnalyzeConcernDto) {
    return this.aiOrchestrationService.analyzeIntent(dto);
  }
}
