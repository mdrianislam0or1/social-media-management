import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../config';
import { AppError } from '../errors/AppError';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    if (!config.database.url) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Database connection URL not found in environment variables',
        false,
      );
    }

    await mongoose.connect(config.database.url); // <- use config.database.url

    logger.info('✅ Database connection established successfully');

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to application termination');
      process.exit(0);
    });
  } catch (error: any) {
    logger.error('❌ Database connection failed:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to connect to database',
      false,
      '',
      error,
    );
  }
};
