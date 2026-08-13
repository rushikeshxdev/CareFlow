import { Module } from '@nestjs/common';
import { AiOrchestrationController } from './ai-orchestration.controller';
import { AiOrchestrationService } from './ai-orchestration.service';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [ProvidersModule],
  controllers: [AiOrchestrationController],
  providers: [AiOrchestrationService],
})
export class AiOrchestrationModule {}
