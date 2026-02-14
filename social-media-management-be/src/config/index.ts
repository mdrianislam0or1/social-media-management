import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,

  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/social-feed',
  },

  jwt: {
    jwt_secret: process.env.JWT_SECRET || 'your-secret-key',
    expires_in: process.env.JWT_EXPIRES_IN || '7d',
  },

  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
  },

  // Rate Limiting Configuration
  rateLimit: {
    window_ms: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max_requests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Application Configuration
  app: {
    name: process.env.APP_NAME || 'Mini Social Feed',
    version: process.env.APP_VERSION || '1.0.0',
  },

  frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',
  backend_url: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`,
  cors_origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(','),
};
