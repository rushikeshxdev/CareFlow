import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getProviderAvailability(providerId: string) {
    return this.prisma.availabilitySlot.findMany({
      where: {
        providerId,
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: 'asc' },
    });
  }
}
