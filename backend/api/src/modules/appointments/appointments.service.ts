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
   * Temporary hold reservation on an availability slot
   */
  async holdSlot(dto: HoldSlotDto) {
    const { slotId, patientId } = dto;

    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException(`Slot with ID "${slotId}" not found`);
    }

    if (slot.status === SlotStatus.BOOKED) {
      throw new ConflictException('Slot is already booked');
    }

    if (slot.status === SlotStatus.HELD && slot.heldByPatientId !== patientId) {
      const now = new Date();
      if (slot.heldUntil && slot.heldUntil > now) {
        throw new ConflictException('Slot is currently held by another user');
      }
    }

    // 1. Redis Atomic Lock
    const acquired = await this.redis.acquireSlotHold(slotId, patientId, 600); // 10 min hold
    if (!acquired) {
      throw new ConflictException('Slot is currently being held by another user');
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
      message: 'Slot successfully held for 10 minutes',
      slot: updatedSlot,
      expiresAt: heldUntil,
    };
  }

  /**
   * Confirm appointment booking inside a PostgreSQL transaction
   */
  async createAppointment(dto: CreateAppointmentDto) {
    const { patientId, providerId, slotId, serviceId, type = AppointmentType.IN_PERSON, reason } = dto;

    return await this.prisma.$transaction(async (tx) => {
      // Fetch slot with pessimistic check
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: slotId },
      });

      if (!slot) {
        throw new NotFoundException(`Slot with ID "${slotId}" not found`);
      }

      if (slot.status === SlotStatus.BOOKED) {
        throw new ConflictException('This slot has already been booked');
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
          reason,
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
          userId: patientId,
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
    return this.prisma.appointment.findMany({
      where: { patientId },
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
        data: {
          status: SlotStatus.AVAILABLE,
          heldByPatientId: null,
          heldUntil: null,
        },
      });

      return updated;
    });
  }
}
