import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import * as userService from './user.service';

/**
 * Update FCM token
 * @route PUT /api/users/fcm-token
 * @access Auth required
 */
const updateFcmToken = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { fcmToken } = req.body;

  const result = await userService.updateFcmToken(userId, fcmToken);

  res.status(httpStatus.OK).json({
    success: true,
    message: result.message,
  });
});

export const userController = {
  updateFcmToken,
};
