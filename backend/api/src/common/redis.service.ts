import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    this.client = new Redis({
      host,
      port,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      lazyConnect: true,
    });

    this.client.connect().then(() => {
      this.logger.log(`Connected to Redis server at ${host}:${port}`);
    }).catch((err) => {
      this.logger.warn(`Redis connection warning: ${err.message}. Operating in fallback mode if needed.`);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null> {
    try {
      if (ttlSeconds) {
        return await this.client.set(key, value, 'EX', ttlSeconds);
      }
      return await this.client.set(key, value);
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch {
      return 0;
    }
  }

  /**
   * Acquire a temporary hold lock for appointment slots
   * Uses atomic SETNX (set if not exists) with TTL
   */
  async acquireSlotHold(slotId: string, patientId: string, ttlSeconds: number = 600): Promise<boolean> {
    try {
      const lockKey = `slot:hold:${slotId}`;
      const result = await this.client.set(lockKey, patientId, 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch {
      // In case Redis is offline, fallback to PostgreSQL constraint enforcement
      return true;
    }
  }

  /**
   * Release temporary slot hold lock
   */
  async releaseSlotHold(slotId: string): Promise<void> {
    try {
      const lockKey = `slot:hold:${slotId}`;
      await this.client.del(lockKey);
    } catch {
      // Ignore Redis error during release
    }
  }

  async ping(): Promise<boolean> {
    try {
      const res = await this.client.ping();
      return res === 'PONG';
    } catch {
      return false;
    }
  }
}
