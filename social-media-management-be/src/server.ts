import cluster from 'cluster';
import { Server } from 'http';
import os from 'os';
import app from './app';
import config from './config';
import { connectDB } from './db';
import logger from './utils/logger';

let server: Server;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Bootstrap the application
async function bootstrap() {
  try {
    const isVercel = process.env.VERCEL === '1';
    const isClusterEnabled = !isVercel && (config.env === 'production' || process.env.ENABLE_CLUSTER === 'true');

    if (isClusterEnabled && cluster.isPrimary) {
      const numCPUs = os.cpus().length;
      logger.info(`🚀 Setting up cluster with ${numCPUs} workers...`);
      logger.info(`🌍 Environment: ${config.env}`);
      logger.info(`📍 URL: ${config.backend_url}`);

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker, code, signal) => {
        logger.warn(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
        logger.info('Starting a new worker');
        cluster.fork();
      });

      logger.info(`🚀 Cluster setup complete. Master ${process.pid} is running.`);
    } else {
      if (!isVercel) {
        await connectDB();

        server = app.listen(config.port, () => {
          logger.info(`🚀 Mini Social Feed API running on port ${config.port} (PID: ${process.pid})`);
          logger.info(`🌍 Environment: ${config.env}`);
          logger.info(`📍 URL: ${config.backend_url}`);
          logger.info(`🏥 Health Check: ${config.backend_url}/health`);
        });
      } else {
        await connectDB();
        logger.info('☁️ Running on Vercel Serverless');
      }
    }

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
  logger.error('❌ Unhandled Rejection:', error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('👋 Signal received, shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('💤 Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Only bootstrap if not on Vercel
if (process.env.VERCEL !== '1') {
  bootstrap();
}

// Export app for Vercel
export default app;
