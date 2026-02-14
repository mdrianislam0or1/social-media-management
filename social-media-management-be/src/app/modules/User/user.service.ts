import httpStatus from 'http-status';
import { ApplicationError } from '../../../errors/ApplicationError';
import logger from '../../../utils/logger';
import { User } from '../Auth/auth.model';

/**
 * Update or store FCM token for a user
 */
export const updateFcmToken = async (
  userId: string,
  fcmToken: string,
): Promise<{ message: string }> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApplicationError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.fcmToken = fcmToken;
  await user.save();

  logger.info('✅ FCM token updated', { userId });

  return { message: 'FCM token updated successfully' };
};

export const userService = {
  updateFcmToken,
};
