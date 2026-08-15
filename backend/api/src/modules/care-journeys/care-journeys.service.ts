import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Prisma, CareJourneyStatus, CareEventType } from '@prisma/client';

@Injectable()
export class CareJourneysService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Return all care journeys for a specific patient, ordered by latest update.
   */
  async findAll(patientId: string) {
    return this.prisma.careJourney.findMany({
      where: { patientId },
      include: {
        events: {
          orderBy: { createdAt: 'asc' },
          include: {
            appointment: {
              include: {
                provider: true,
                slot: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Return a single care journey with events and patient information.
   */
  async findOne(id: string) {
    return this.prisma.careJourney.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { createdAt: 'asc' },
          include: {
            appointment: {
              include: {
                provider: true,
                slot: true,
              },
            },
          },
        },
        patient: true,
      },
    });
  }

  /**
   * Idempotently create or find a CareJourney & create initial CareEvent for an appointment.
   * MUST use the injected Prisma TransactionClient (`tx`) to preserve atomicity.
   */
  async ensureJourneyAndEventForAppointment(tx: Prisma.TransactionClient, appointment: any) {
    // 1. Idempotency Check: If CareEvent already exists for this appointment, return existing journey
    const existingEvent = await tx.careEvent.findUnique({
      where: { appointmentId: appointment.id },
      include: { careJourney: { include: { events: true } } },
    });

    if (existingEvent) {
      return existingEvent.careJourney;
    }

    // 2. Find active CareJourney for patient or create a new one
    const providerName = appointment.provider?.name || 'Doctor';
    const title = `${providerName} Consultation`;

    let journey = await tx.careJourney.findFirst({
      where: {
        patientId: appointment.patientId,
        status: CareJourneyStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!journey) {
      journey = await tx.careJourney.create({
        data: {
          patientId: appointment.patientId,
          title,
          description: `Longitudinal care journey for ${title}`,
          status: CareJourneyStatus.ACTIVE,
        },
      });
    }

    // 3. Create initial CareEvent for the appointment
    const slotTimeFormatted = appointment.slot?.startTime
      ? new Date(appointment.slot.startTime).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'scheduled time';

    await tx.careEvent.create({
      data: {
        careJourneyId: journey.id,
        appointmentId: appointment.id,
        eventType: CareEventType.CONSULTATION,
        title: `Consultation with ${providerName}`,
        description: `Doctor appointment confirmed for ${slotTimeFormatted}.`,
        status: 'CONFIRMED',
      },
    });

    return tx.careJourney.findUnique({
      where: { id: journey.id },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    });
  }

  /**
   * Synchronize CareEvent status when an appointment status changes (COMPLETED / CANCELLED).
   */
  async updateEventStatusForAppointment(tx: Prisma.TransactionClient, appointmentId: string, status: string) {
    const event = await tx.careEvent.findUnique({
      where: { appointmentId },
    });

    if (event) {
      await tx.careEvent.update({
        where: { id: event.id },
        data: { status },
      });
    }
  }

  /**
   * Log an AI Care Assessment event during AI-assisted workflows.
   */
  async createAIAssessmentEvent(patientId: string, title?: string, summary?: string) {
    let journey = await this.prisma.careJourney.findFirst({
      where: { patientId, status: CareJourneyStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });

    if (!journey) {
      journey = await this.prisma.careJourney.create({
        data: {
          patientId,
          title: title || 'AI Care Assessment & Guidance',
          description: 'AI-guided intent analysis and care recommendations',
          status: CareJourneyStatus.ACTIVE,
        },
      });
    }

    await this.prisma.careEvent.create({
      data: {
        careJourneyId: journey.id,
        eventType: CareEventType.AI_ASSESSMENT,
        title: 'AI Care Assessment Completed',
        description: summary || 'Patient concern assessed by CareFlow AI',
        status: 'COMPLETED',
      },
    });

    return journey;
  }
}
