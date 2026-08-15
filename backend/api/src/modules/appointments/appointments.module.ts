import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';

import { CareJourneysModule } from '../care-journeys/care-journeys.module';

@Module({
  imports: [CareJourneysModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PrismaService, RedisService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
