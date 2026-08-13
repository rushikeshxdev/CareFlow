import { Module } from '@nestjs/common';
import { CareJourneysController } from './care-journeys.controller';
import { CareJourneysService } from './care-journeys.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [CareJourneysController],
  providers: [CareJourneysService, PrismaService],
})
export class CareJourneysModule {}
