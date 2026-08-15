import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  NOTIFICATION_QUEUE,
  REMINDER_QUEUE,
  CLEANUP_QUEUE,
  CLEANUP_REPEATABLE_JOB_ID,
  getConfirmationDedupeKey,
  getReminderDedupeKey,
} from './queue.constants';
import { NotificationJobPayload, ReminderJobPayload, CleanupJobPayload } from './queue.types';

@Injectable()
export class QueueProducerService {
  private readonly logger = new Logger(QueueProducerService.name);
  private readonly maxAttempts: number;
  private readonly backoffDelayMs: number;

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue<NotificationJobPayload>,
    @InjectQueue(REMINDER_QUEUE) private readonly reminderQueue: Queue<ReminderJobPayload>,
    @InjectQueue(CLEANUP_QUEUE) private readonly cleanupQueue: Queue<CleanupJobPayload>,
    private readonly configService: ConfigService,
  ) {
    this.maxAttempts = parseInt(this.configService.get<string>('QUEUE_MAX_ATTEMPTS', '3'), 10);
    this.backoffDelayMs = parseInt(this.configService.get<string>('QUEUE_BACKOFF_DELAY_MS', '1000'), 10);
  }

  /**
   * Enqueue asynchronous appointment confirmation notification.
   * Non-blocking: Errors are logged gracefully without rolling back caller transactions.
   */
  async enqueueNotification(payload: NotificationJobPayload): Promise<boolean> {
    const dedupeKey = getConfirmationDedupeKey(payload.appointmentId);
    try {
      await this.notificationQueue.add(payload.type, payload, {
        jobId: dedupeKey,
        attempts: this.maxAttempts,
        backoff: {
          type: 'exponential',
          delay: this.backoffDelayMs,
        },
        removeOnComplete: true,
      });
      this.logger.log(`Enqueued notification job for appt=${payload.appointmentId}`);
      return true;
    } catch (err: any) {
      this.logger.error(`ENQUEUE_FAILED: Failed to enqueue notification for appt=${payload.appointmentId}: ${err.message}`);
      return false;
    }
  }

  /**
   * Schedule delayed reminder jobs (DAY_BEFORE: 24h prior, HOUR_BEFORE: 1h prior).
   * Edge-case rule: If calculated delay <= 0, the job is skipped.
   */
  async scheduleReminders(
    appointmentId: string,
    userId: string,
    patientId: string,
    slotStartTime: Date,
  ): Promise<void> {
    const now = Date.now();
    const apptTime = new Date(slotStartTime).getTime();

    // 1. DAY_BEFORE Reminder (24h before appointment)
    const dayBeforeTimestamp = apptTime - 24 * 60 * 60 * 1000;
    const dayBeforeDelay = dayBeforeTimestamp - now;

    if (dayBeforeDelay > 0) {
      const jobId = getReminderDedupeKey('DAY_BEFORE', appointmentId);
      try {
        await this.reminderQueue.add(
          'DAY_BEFORE',
          { reminderType: 'DAY_BEFORE', appointmentId, userId, patientId },
          {
            jobId,
            delay: dayBeforeDelay,
            attempts: this.maxAttempts,
            backoff: { type: 'exponential', delay: this.backoffDelayMs },
            removeOnComplete: true,
          },
        );
        this.logger.log(`Scheduled DAY_BEFORE reminder for appt=${appointmentId} with delay=${Math.round(dayBeforeDelay / 1000)}s`);
      } catch (err: any) {
        this.logger.error(`ENQUEUE_FAILED: Failed to schedule DAY_BEFORE reminder: ${err.message}`);
      }
    } else {
      this.logger.log(`Skipped DAY_BEFORE reminder for appt=${appointmentId} (scheduled timestamp in the past)`);
    }

    // 2. HOUR_BEFORE Reminder (1h before appointment)
    const hourBeforeTimestamp = apptTime - 1 * 60 * 60 * 1000;
    const hourBeforeDelay = hourBeforeTimestamp - now;

    if (hourBeforeDelay > 0) {
      const jobId = getReminderDedupeKey('HOUR_BEFORE', appointmentId);
      try {
        await this.reminderQueue.add(
          'HOUR_BEFORE',
          { reminderType: 'HOUR_BEFORE', appointmentId, userId, patientId },
          {
            jobId,
            delay: hourBeforeDelay,
            attempts: this.maxAttempts,
            backoff: { type: 'exponential', delay: this.backoffDelayMs },
            removeOnComplete: true,
          },
        );
        this.logger.log(`Scheduled HOUR_BEFORE reminder for appt=${appointmentId} with delay=${Math.round(hourBeforeDelay / 1000)}s`);
      } catch (err: any) {
        this.logger.error(`ENQUEUE_FAILED: Failed to schedule HOUR_BEFORE reminder: ${err.message}`);
      }
    } else {
      this.logger.log(`Skipped HOUR_BEFORE reminder for appt=${appointmentId} (scheduled timestamp in the past)`);
    }
  }

  /**
   * Schedule idempotent repeatable slot cleanup job.
   * Uses fixed job ID to prevent duplicate repeaters on server restart.
   */
  async scheduleIdempotentSlotCleanup(intervalMs: number = 5 * 60 * 1000): Promise<void> {
    try {
      await this.cleanupQueue.add(
        'EXPIRED_SLOT_CLEANUP',
        { jobType: 'EXPIRED_SLOT_CLEANUP' },
        {
          jobId: CLEANUP_REPEATABLE_JOB_ID,
          repeat: { every: intervalMs },
          removeOnComplete: true,
        } as any,
      );
      this.logger.log(`Registered idempotent repeatable slot cleanup job every ${intervalMs / 1000}s`);
    } catch (err: any) {
      this.logger.error(`Failed to register repeatable slot cleanup job: ${err.message}`);
    }
  }
}
