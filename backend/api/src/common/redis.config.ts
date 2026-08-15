export interface RedisOptionsConfig {
  host: string;
  port: number;
  password?: string;
}

export function getRedisConfig(): RedisOptionsConfig {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  return {
    host,
    port,
    ...(password ? { password } : {}),
  };
}
