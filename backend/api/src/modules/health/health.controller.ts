import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Core system health check (App, Database, Redis)' })
  @ApiResponse({ status: 200, description: 'Core infrastructure is healthy' })
  async checkHealth() {
    let dbStatus = 'ok';
    let redisStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'degraded';
    }

    const redisPing = await this.redis.ping();
    if (!redisPing) {
      redisStatus = 'degraded';
    }

    const isHealthy = dbStatus === 'ok';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
  }

  @Get('dependencies')
  @ApiOperation({ summary: 'External dependencies health check (FastAPI AI Service)' })
  @ApiResponse({ status: 200, description: 'Dependency status report' })
  async checkDependencies() {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    let aiStatus = 'unknown';

    try {
      const response = await fetch(`${aiServiceUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        aiStatus = 'healthy';
      } else {
        aiStatus = 'degraded';
      }
    } catch {
      aiStatus = 'unreachable';
    }

    return {
      timestamp: new Date().toISOString(),
      dependencies: {
        aiService: {
          url: aiServiceUrl,
          status: aiStatus,
        },
      },
    };
  }
}
