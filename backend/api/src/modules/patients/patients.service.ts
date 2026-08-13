import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    return patient;
  }
}
