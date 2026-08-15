import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { REMINDER_QUEUE, getReminderDedupeKey } from '../queue.constants';
import { ReminderJobPayload } from '../queue.types';
import { AppointmentStatus } from '@prisma/client';

@Processor(REMINDER_QUEUE)
export class ReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(ReminderProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<ReminderJobPayload>): Promise<any> {
    const startTime = Date.now();
    const { reminderType, appointmentId, userId } = job.data;
    this.logger.log(`Processing reminder job ${job.id} type=${reminderType} apptId=${appointmentId}`);

    // Fetch latest DB state
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { provider: true, slot: true },
    });

    if (!appointment) {
      this.logger.warn(`Appointment ${appointmentId} not found. Skipping reminder.`);
      return { status: 'SKIPPED_NOT_FOUND' };
    }

    // Verify appointment status in DB (Suppression rule if CANCELLED or COMPLETED)
    if (appointment.status === AppointmentStatus.CANCELLED || appointment.status === AppointmentStatus.COMPLETED) {
      this.logger.log(`Appointment ${appointmentId} is ${appointment.status}. Suppressing reminder notification.`);
      return { status: 'SUPPRESSED_STATUS', currentStatus: appointment.status };
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      this.logger.log(`Appointment ${appointmentId} status is ${appointment.status}. Skipping reminder.`);
      return { status: 'SKIPPED_UNCONFIRMED' };
    }

    const dedupeKey = getReminderDedupeKey(reminderType, appointmentId);

    // Idempotency check
    const existing = await this.prisma.notification.findUnique({
      where: { dedupeKey },
    });

    if (existing) {
      this.logger.log(`Reminder notification already exists for dedupeKey=${dedupeKey}. Skipping.`);
      return { status: 'SKIPPED_DUPLICATE', notificationId: existing.id };
    }

    const providerName = appointment.provider?.name || 'your care provider';
    const timePhrase = reminderType === 'DAY_BEFORE' ? 'tomorrow' : 'in 1 hour';
    const formattedTime = appointment.slot?.startTime
      ? new Date(appointment.slot.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : '';

    const message = `Reminder: You have an upcoming consultation with ${providerName} ${timePhrase}${formattedTime ? ` at ${formattedTime}` : ''}.`;

    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          type: `REMINDER_${reminderType}`,
          title: `Upcoming Appointment Reminder (${reminderType === 'DAY_BEFORE' ? 'Tomorrow' : '1 Hour'})`,
          message,
          dedupeKey,
        },
      });

      const duration = Date.now() - startTime;
      this.logger.log(`Successfully created reminder notification ${notification.id} in ${duration}ms`);
      return { status: 'CREATED', notificationId: notification.id };
    } catch (err: any) {
      if (err.code === 'P2002') {
        this.logger.log(`Duplicate reminder race condition caught for dedupeKey=${dedupeKey}`);
        return { status: 'SKIPPED_DUPLICATE' };
      }
      throw err;
    }
  }
}
