import { User } from '../app/modules/Auth/auth.model';
import { getMessaging } from '../config/firebase';
import logger from './logger';

export interface NotificationPayload {
  type: 'like' | 'comment';
  postId: string;
  senderUsername: string;
}

/**
 * Send FCM push notification to a user
 *
 * Rules:
 * - Do NOT call if sender === recipient (self-interaction)
 * - Skip silently if no FCM token on recipient
 * - Skip silently if Firebase is not initialized
 * - Never throw — log errors and move on
 */
export const sendNotification = async (
  recipientUserId: string,
  payload: NotificationPayload,
): Promise<void> => {
  try {
    const messaging = getMessaging();
    if (!messaging) {
      logger.debug('Firebase not initialized, skipping notification');
      return;
    }

    // Look up recipient's FCM token
    const recipient = await User.findById(recipientUserId).select('fcmToken username');
    if (!recipient || !recipient.fcmToken) {
      logger.debug('No FCM token for user, skipping notification', { recipientUserId });
      return;
    }

    // Build notification message
    const title =
      payload.type === 'like'
        ? `${payload.senderUsername} liked your post`
        : `${payload.senderUsername} commented on your post`;

    const message = {
      token: recipient.fcmToken,
      notification: {
        title,
        body: payload.type === 'like' ? 'Tap to view your post' : 'Tap to read the comment',
      },
      data: {
        type: payload.type,
        postId: payload.postId,
        senderUsername: payload.senderUsername,
      },
    };

    await messaging.send(message);
    logger.info('✅ FCM notification sent', {
      recipientUserId,
      type: payload.type,
    });
  } catch (error) {
    // Never throw — log and move on
    logger.error('⚠️ Failed to send FCM notification (non-fatal):', error);
  }
};
