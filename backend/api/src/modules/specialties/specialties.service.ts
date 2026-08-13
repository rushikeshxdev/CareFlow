import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.specialty.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
