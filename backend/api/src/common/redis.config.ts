export interface RedisOptionsConfig {
  host: string;
  port: number;
  password?: string;
  tls?: {
    rejectUnauthorized: boolean;
  };
}

export function getRedisConfig(): RedisOptionsConfig {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  const useTls =
    (process.env.REDIS_TLS || 'false').toLowerCase() === 'true';

  return {
    host,
    port,
    ...(password ? { password } : {}),
    ...(useTls
      ? {
        tls: {
          rejectUnauthorized: true,
        },
      }
      : {}),
  };
}