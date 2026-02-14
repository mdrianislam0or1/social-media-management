import express from 'express';
import { auth } from '../../../middleware/auth';
import validateRequest from '../../../middleware/validation.middleware';
import { userController } from './user.controller';
import { updateFcmTokenValidation } from './user.validation';

const router = express.Router();

/**
 * @route   PUT /api/users/fcm-token
 * @desc    Update or store FCM token
 * @access  Auth required
 */
router.put(
  '/fcm-token',
  auth(),
  validateRequest(updateFcmTokenValidation),
  userController.updateFcmToken,
);

export const userRoutes = router;
