import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      // Force Supabase pooler to use Transaction Pooler port 6543 instead of Session port 5432
      if (dbUrl.includes('pooler.supabase.com:5432')) {
        dbUrl = dbUrl.replace('pooler.supabase.com:5432', 'pooler.supabase.com:6543');
      }

      if (!dbUrl.includes('connection_limit')) {
        const separator = dbUrl.includes('?') ? '&' : '?';
        dbUrl = `${dbUrl}${separator}connection_limit=3&pgbouncer=true`;
      }
    }
    super({
      datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
