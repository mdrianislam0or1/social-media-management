import admin from 'firebase-admin';
import path from 'path';
import logger from '../utils/logger';
import config from './index';

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Gracefully handles missing configuration — won't crash the app
 */
export const initializeFirebase = (): void => {
  try {
    const serviceAccountPath = config.firebase.serviceAccountPath;

    if (!serviceAccountPath) {
      logger.warn('⚠️ Firebase service account path not configured. FCM notifications disabled.');
      return;
    }

    // Use path.resolve to ensure we load relative to project root, not the file
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require(path.resolve(process.cwd(), serviceAccountPath));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    logger.info('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('⚠️ Failed to initialize Firebase Admin SDK:', error);
    logger.warn('FCM notifications will be disabled.');
  }
};

/**
 * Check if Firebase is initialized
 */
export const isFirebaseInitialized = (): boolean => firebaseInitialized;

/**
 * Get Firebase Messaging instance
 */
export const getMessaging = (): admin.messaging.Messaging | null => {
  if (!firebaseInitialized) return null;
  return admin.messaging();
};

export default { initializeFirebase, isFirebaseInitialized, getMessaging };
