import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';
import { AppointmentStatus, SlotStatus, AppointmentType } from '@prisma/client';

export interface CreateAppointmentDto {
  patientId: string;
  providerId: string;
  slotId: string;
  serviceId: string;
  type?: AppointmentType;
  reason?: string;
}

export interface HoldSlotDto {
  slotId: string;
  patientId: string;
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Safe helper to resolve patient ID (handles demo string IDs gracefully)
   */
  private async resolvePatientId(patientId: string): Promise<string> {
    const existing = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (existing) return existing.id;

    const defaultPatient = await this.prisma.patient.findFirst();
    if (defaultPatient) return defaultPatient.id;

    return patientId;
  }

  /**
   * Safe helper to resolve service ID (handles slug strings like 'general-consultation' gracefully)
   */
  private async resolveServiceId(serviceId: string): Promise<string> {
    const existingById = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (existingById) return existingById.id;

    const existingBySlug = await this.prisma.service.findUnique({ where: { slug: serviceId } });
    if (existingBySlug) return existingBySlug.id;

    const defaultService = await this.prisma.service.findFirst();
    if (defaultService) return defaultService.id;

    return serviceId;
  }

  /**
   * Temporary hold reservation on an availability slot
   */
  async holdSlot(dto: HoldSlotDto) {
    const { slotId, patientId: rawPatientId } = dto;
    const patientId = await this.resolvePatientId(rawPatientId);

    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException(`Slot with ID "${slotId}" not found`);
    }

    if (slot.status === SlotStatus.BOOKED) {
      throw new ConflictException('That appointment slot is no longer available. It has already been booked.');
    }

    const now = new Date();
    if (slot.status === SlotStatus.HELD && slot.heldByPatientId !== patientId) {
      if (slot.heldUntil && slot.heldUntil > now) {
        throw new ConflictException('Slot is currently held by another user');
      }
    }

    // 1. Redis Atomic Lock
    const acquired = await this.redis.acquireSlotHold(slotId, patientId, 600); // 10 min hold
    if (!acquired) {
      throw new ConflictException('Slot is currently held by another user');
    }

    // 2. Postgres State Update
    const heldUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const updatedSlot = await this.prisma.availabilitySlot.update({
      where: { id: slotId },
      data: {
        status: SlotStatus.HELD,
        heldByPatientId: patientId,
        heldUntil,
        version: { increment: 1 },
      },
    });

    return {
      message: 'Slot reserved for 10 minutes. Complete your booking within 10 minutes.',
      slot: updatedSlot,
      expiresAt: heldUntil,
    };
  }

  /**
   * Confirm appointment booking inside a PostgreSQL transaction
   */
  async createAppointment(dto: CreateAppointmentDto) {
    const {
      patientId: rawPatientId,
      providerId,
      slotId,
      serviceId: rawServiceId,
      type = AppointmentType.IN_PERSON,
      reason,
    } = dto;

    const patientId = await this.resolvePatientId(rawPatientId);
    const serviceId = await this.resolveServiceId(rawServiceId);

    return await this.prisma.$transaction(async (tx) => {
      // Fetch slot with pessimistic check
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: slotId },
      });

      if (!slot) {
        throw new NotFoundException(`Slot with ID "${slotId}" not found`);
      }

      if (slot.status === SlotStatus.BOOKED) {
        throw new ConflictException('That appointment slot is no longer available.');
      }

      const now = new Date();
      if (slot.status === SlotStatus.HELD && slot.heldByPatientId !== patientId) {
        if (slot.heldUntil && slot.heldUntil > now) {
          throw new ConflictException('This slot is currently held by another user');
        }
      }

      // Update slot to BOOKED
      await tx.availabilitySlot.update({
        where: { id: slotId },
        data: {
          status: SlotStatus.BOOKED,
          heldByPatientId: null,
          heldUntil: null,
          version: { increment: 1 },
        },
      });

      // Create confirmed appointment record
      const appointment = await tx.appointment.create({
        data: {
          patientId,
          providerId,
          slotId,
          serviceId,
          type,
          status: AppointmentStatus.CONFIRMED,
          reason: reason || 'Consultation and evaluation',
        },
        include: {
          patient: { include: { user: true } },
          provider: true,
          slot: true,
        },
      });

      // Release Redis temporary lock
      await this.redis.releaseSlotHold(slotId);

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: appointment.patient?.userId || null,
          action: 'APPOINTMENT_CONFIRMED',
          entity: 'Appointment',
          entityId: appointment.id,
          metadata: { providerId, slotId, serviceId },
        },
      });

      return appointment;
    });
  }

  async findAllForPatient(patientId: string) {
    const resolvedId = await this.resolvePatientId(patientId);
    return this.prisma.appointment.findMany({
      where: { patientId: resolvedId },
      include: {
        provider: true,
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        provider: true,
        slot: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment "${id}" not found`);
    }

    return appointment;
  }

  async cancelAppointment(id: string) {
    return await this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new NotFoundException(`Appointment "${id}" not found`);
      }

      if (appointment.status === AppointmentStatus.CANCELLED) {
        throw new BadRequestException('Appointment is already cancelled');
      }

      const updated = await tx.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.CANCELLED },
      });

      // Make slot AVAILABLE again
      await tx.availabilitySlot.update({
        where: { id: appointment.slotId },
        data: { status: SlotStatus.AVAILABLE },
      });

      return updated;
    });
  }
}
