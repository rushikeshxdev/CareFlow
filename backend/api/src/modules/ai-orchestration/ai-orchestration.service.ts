import { Injectable, Logger } from '@nestjs/common';
import { ProvidersService } from '../providers/providers.service';

export interface AnalyzeConcernDto {
  concern: string;
  location?: string;
  userAge?: number;
  gender?: string;
}

const SUPPORTED_SPECIALTIES = [
  'Cardiology',
  'General Medicine',
  'Orthopedics',
  'Neurology',
  'Pulmonology',
  'Gynecology',
  'Pediatrics',
  'Dermatology',
];

const SUPPORTED_INTENTS = ['find_doctor', 'find_hospital', 'diagnostic_test', 'home_care', 'general_query'];
const SUPPORTED_URGENCIES = ['routine', 'urgent', 'emergency'];

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
        throw new Error(`AI service returned HTTP ${response.status}`);
      }

      const rawAiData = await response.json();

      // Task 5: Business Authority Validation & Normalization
      const validatedIntent = SUPPORTED_INTENTS.includes(rawAiData.intent) ? rawAiData.intent : 'find_doctor';
      const validatedUrgency = SUPPORTED_URGENCIES.includes(rawAiData.urgency) ? rawAiData.urgency : 'routine';
      
      let validatedSpecialty = rawAiData.recommendedSpecialty;
      if (!validatedSpecialty || !SUPPORTED_SPECIALTIES.some((s) => s.toLowerCase() === validatedSpecialty.toLowerCase())) {
        this.logger.warn(`AI returned unmapped specialty "${rawAiData.recommendedSpecialty}". Falling back to General Medicine.`);
        validatedSpecialty = 'General Medicine';
      } else {
        const matched = SUPPORTED_SPECIALTIES.find((s) => s.toLowerCase() === validatedSpecialty.toLowerCase());
        if (matched) validatedSpecialty = matched;
      }

      const aiData = {
        ...rawAiData,
        intent: validatedIntent,
        urgency: validatedUrgency,
        recommendedSpecialty: validatedSpecialty,
        disclaimer:
          rawAiData.disclaimer ||
          'Informational guidance only. CareFlow AI does not diagnose conditions. Consult a licensed healthcare provider for medical advice.',
      };

      // Query & rank matching providers based on validated AI specialty intent
      let matchedProviders = [];
      if (dto.location) {
        matchedProviders = await this.providersService.findAll({
          search: validatedSpecialty,
          city: dto.location,
        });
      }

      // If location filter returns 0 providers, query nationwide matching providers
      if (matchedProviders.length === 0) {
        matchedProviders = await this.providersService.findAll({
          search: validatedSpecialty,
        });
      }

      // If still no providers found, fallback to top available providers overall
      if (matchedProviders.length === 0) {
        matchedProviders = await this.providersService.findAll({});
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

      // Graceful fallback mode if FastAPI is offline
      const fallbackSpecialty = 'Cardiology';
      const fallbackProviders = await this.providersService.findAll({ search: fallbackSpecialty });

      return {
        aiAnalysis: {
          intent: 'find_doctor',
          recommendedSpecialty: fallbackSpecialty,
          recommendedServiceType: 'CONSULTATION',
          suggestedAction: 'Schedule a consultation for comprehensive evaluation.',
          urgency: 'routine',
          summary: dto.concern,
          keySymptoms: ['Reported symptoms'],
          disclaimer:
            'Informational guidance only. CareFlow AI does not diagnose conditions. Consult a licensed healthcare provider for medical advice.',
        },
        recommendedProviders: fallbackProviders.slice(0, 5),
        meta: {
          fallback: true,
          reason: 'AI microservice offline. Operating in local fallback mode.',
          processedAt: new Date().toISOString(),
        },
      };
    }
  }
}
