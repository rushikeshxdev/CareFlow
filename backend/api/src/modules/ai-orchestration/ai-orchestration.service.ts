import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { ProvidersService } from '../providers/providers.service';

export interface AnalyzeConcernDto {
  concern: string;
  location?: string;
  userAge?: number;
  gender?: string;
}

@Injectable()
export class AiOrchestrationService {
  private readonly logger = new Logger(AiOrchestrationService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(private readonly providersService: ProvidersService) {}

  async analyzeIntent(dto: AnalyzeConcernDto) {
    try {
      const response = await fetch(`${this.aiServiceUrl}/ai/analyze-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        throw new Error(`AI service returned status ${response.status}`);
      }

      const aiData = await response.json();

      // NestJS validates & orchestrates provider recommendations based on structured AI output
      let matchedProviders = [];
      if (aiData.recommendedSpecialty) {
        matchedProviders = await this.providersService.findAll({
          search: aiData.recommendedSpecialty,
          city: dto.location,
        });
      }

      return {
        aiAnalysis: aiData,
        recommendedProviders: matchedProviders.slice(0, 5),
        meta: {
          validatedBy: 'CareFlow NestJS Business Authority',
          processedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`AI Orchestration Error: ${error.message}`);
      // Fallback response if AI microservice is offline or degraded
      return {
        aiAnalysis: {
          intent: 'find_doctor',
          recommendedSpecialty: 'General Medicine',
          recommendedServiceType: 'CONSULTATION',
          suggestedAction: 'Consult a primary care physician for symptom evaluation.',
          urgency: 'routine',
          summary: dto.concern,
          keySymptoms: ['Reported health concern'],
          disclaimer: 'Informational only. Please consult a qualified healthcare professional.',
        },
        recommendedProviders: await this.providersService.findAll({ search: 'General Medicine' }),
        meta: {
          fallback: true,
          reason: 'AI service currently operating in fallback mode',
        },
      };
    }
  }
}
