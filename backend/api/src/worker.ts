import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { QueueProducerService } from './infrastructure/queues/queue-producer.service';
import * as http from 'http';

async function bootstrapWorker() {
  const logger = new Logger('WorkerRunner');
  logger.log('Starting CareFlow Background Worker Process...');

  const app = await NestFactory.createApplicationContext(AppModule);

  // Register repeatable slot cleanup job idempotently
  const queueProducer = app.get(QueueProducerService);
  await queueProducer.scheduleIdempotentSlotCleanup();

  logger.log('CareFlow Background Worker Process initialized and listening for jobs.');

  // Create lightweight HTTP server for Render health checks and port binding
  const port = process.env.PORT || 10001;
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy', service: 'careflow-worker', timestamp: new Date() }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(port, () => {
    logger.log(`Worker health check server listening on port ${port}`);
  });

  // Graceful shutdown handling (User Rule #9)
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Gracefully shutting down worker process...`);
    try {
      server.close();
      await app.close();
      logger.log('Worker process closed successfully.');
      process.exit(0);
    } catch (err: any) {
      logger.error(`Error during worker shutdown: ${err.message}`);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrapWorker().catch((err) => {
  console.error('Fatal error starting worker process:', err);
  process.exit(1);
});
