import { z } from 'zod';

/**
 * Update FCM token validation
 */
export const updateFcmTokenSchema = z.object({
  body: z.object({
    fcmToken: z
      .string({
        required_error: 'FCM token is required',
      })
      .min(1, 'FCM token cannot be empty'),
  }),
});

export const updateFcmTokenValidation = updateFcmTokenSchema;
