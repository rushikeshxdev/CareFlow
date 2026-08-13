import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
