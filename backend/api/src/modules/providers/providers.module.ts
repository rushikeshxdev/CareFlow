import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService, PrismaService, RedisService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
