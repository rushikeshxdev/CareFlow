import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { RedisService } from '../../../common/redis.service';
import { CLEANUP_QUEUE } from '../queue.constants';
import { CleanupJobPayload } from '../queue.types';
import { SlotStatus } from '@prisma/client';

@Processor(CLEANUP_QUEUE)
export class CleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(CleanupProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super();
  }

  async process(job: Job<CleanupJobPayload>): Promise<any> {
    this.logger.log(`Processing slot cleanup job ${job.id}`);
    const now = new Date();

    // Find all slots in DB marked HELD whose hold has expired
    const expiredSlots = await this.prisma.availabilitySlot.findMany({
      where: {
        status: SlotStatus.HELD,
        heldUntil: { lt: now },
      },
    });

    if (expiredSlots.length === 0) {
      return { status: 'NO_EXPIRED_SLOTS', resetCount: 0 };
    }

    let resetCount = 0;
    for (const slot of expiredSlots) {
      // Concurrency Protection: Check if an active Redis lock still exists for this slot
      const redisLockKey = `slot:hold:${slot.id}`;
      const activeHolder = await this.redis.get(redisLockKey);

      if (activeHolder) {
        this.logger.warn(`Slot ${slot.id} hold expired in DB but active Redis lock exists for patient ${activeHolder}. Skipping reset.`);
        continue;
      }

      // Reset slot to AVAILABLE atomically in DB
      await this.prisma.availabilitySlot.update({
        where: { id: slot.id },
        data: {
          status: SlotStatus.AVAILABLE,
          heldUntil: null,
          heldByPatientId: null,
        },
      });

      resetCount++;
      this.logger.log(`Reset expired slot ${slot.id} back to AVAILABLE`);
    }

    return { status: 'CLEANED', resetCount };
  }
}
