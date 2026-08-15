export interface EnvironmentVariables {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  AI_PROVIDER: string;
  AI_API_KEY?: string;
  AI_SERVICE_URL: string;
  QUEUE_MAX_ATTEMPTS: number;
  QUEUE_BACKOFF_DELAY_MS: number;
}

export function validateEnvironment(config: Record<string, any>): EnvironmentVariables {
  const nodeEnv = config.NODE_ENV || 'development';
  const errors: string[] = [];

  if (!config.DATABASE_URL) {
    errors.push('DATABASE_URL is missing.');
  }

  if (!config.JWT_SECRET) {
    errors.push('JWT_SECRET is missing.');
  }

  if (!config.JWT_REFRESH_SECRET) {
    errors.push('JWT_REFRESH_SECRET is missing.');
  }

  const aiProvider = config.AI_PROVIDER || 'mock';

  if (aiProvider === 'gemini' && !config.AI_API_KEY) {
    errors.push(
      `AI_API_KEY is required when AI_PROVIDER is 'gemini'.`,
    );
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach((err) => console.error(`  - ${err}`));
    throw new Error(`Environment validation failed. Missing required environment variables:\n${errors.join('\n')}`);
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: parseInt(config.PORT || '3001', 10),
    DATABASE_URL: config.DATABASE_URL,
    REDIS_HOST: config.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(config.REDIS_PORT || '6379', 10),
    JWT_SECRET: config.JWT_SECRET,
    JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET,
    AI_PROVIDER: aiProvider,
    AI_API_KEY: config.AI_API_KEY,
    AI_SERVICE_URL: config.AI_SERVICE_URL || 'http://localhost:8000',
    QUEUE_MAX_ATTEMPTS: parseInt(config.QUEUE_MAX_ATTEMPTS || '3', 10),
    QUEUE_BACKOFF_DELAY_MS: parseInt(config.QUEUE_BACKOFF_DELAY_MS || '2000', 10),
  };
}
