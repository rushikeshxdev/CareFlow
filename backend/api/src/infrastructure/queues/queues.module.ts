import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';

import {
  NOTIFICATION_QUEUE,
  REMINDER_QUEUE,
  CLEANUP_QUEUE,
} from './queue.constants';

import { QueueProducerService } from './queue-producer.service';
import { NotificationProcessor } from './processors/notification.processor';
import { ReminderProcessor } from './processors/reminder.processor';
import { CleanupProcessor } from './processors/cleanup.processor';

import { getRedisConfig } from '../../common/redis.config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        const redisOptions = getRedisConfig();

        return {
          connection: redisOptions,
        };
      },
    }),

    BullModule.registerQueue(
      { name: NOTIFICATION_QUEUE },
      { name: REMINDER_QUEUE },
      { name: CLEANUP_QUEUE },
    ),
  ],

  providers: [
    PrismaService,
    RedisService,
    QueueProducerService,
    NotificationProcessor,
    ReminderProcessor,
    CleanupProcessor,
  ],

  exports: [QueueProducerService, BullModule],
})
export class QueuesModule { }