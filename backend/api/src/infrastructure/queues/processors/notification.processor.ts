import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { NOTIFICATION_QUEUE, getConfirmationDedupeKey } from '../queue.constants';
import { NotificationJobPayload } from '../queue.types';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<NotificationJobPayload>): Promise<any> {
    const startTime = Date.now();
    const { type, appointmentId, userId } = job.data;
    this.logger.log(`Processing notification job ${job.id} type=${type} apptId=${appointmentId}`);

    if (type === 'APPOINTMENT_CONFIRMED') {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { provider: true, slot: true },
      });

      if (!appointment) {
        this.logger.warn(`Appointment ${appointmentId} not found in DB. Skipping notification.`);
        return { status: 'SKIPPED_NOT_FOUND' };
      }

      const dedupeKey = getConfirmationDedupeKey(appointmentId);

      // Check if notification with dedupeKey already exists (Idempotency)
      const existing = await this.prisma.notification.findUnique({
        where: { dedupeKey },
      });

      if (existing) {
        this.logger.log(`Notification already exists for dedupeKey=${dedupeKey}. Skipping creation.`);
        return { status: 'SKIPPED_DUPLICATE', notificationId: existing.id };
      }

      const formattedTime = appointment.slot?.startTime
        ? new Date(appointment.slot.startTime).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : 'scheduled time';

      const providerName = appointment.provider?.name || 'your care provider';

      try {
        const notification = await this.prisma.notification.create({
          data: {
            userId,
            type: 'APPOINTMENT_CONFIRMED',
            title: 'Appointment Confirmed',
            message: `Your consultation with ${providerName} is confirmed for ${formattedTime}.`,
            dedupeKey,
          },
        });

        const duration = Date.now() - startTime;
        this.logger.log(`Successfully created notification ${notification.id} in ${duration}ms`);
        return { status: 'CREATED', notificationId: notification.id };
      } catch (err: any) {
        // Handle race condition on unique constraint
        if (err.code === 'P2002') {
          this.logger.log(`Duplicate notification race condition caught for dedupeKey=${dedupeKey}`);
          return { status: 'SKIPPED_DUPLICATE' };
        }
        throw err;
      }
    }

    return { status: 'UNHANDLED_TYPE' };
  }
}
