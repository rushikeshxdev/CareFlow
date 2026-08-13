import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CareJourneysService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(patientId?: string) {
    return this.prisma.careJourney.findMany({
      where: patientId ? { patientId } : {},
      include: { events: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.careJourney.findUnique({
      where: { id },
      include: { events: true, patient: true },
    });
  }
}
