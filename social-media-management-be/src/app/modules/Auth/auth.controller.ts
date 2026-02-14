import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import * as authService from './auth.service';

/**
 * Signup a new user
 * @route POST /api/auth/signup
 * @access Public
 */
const signup = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: result.message,
    data: {
      user: {
        userId: result.user._id.toString(),
        email: result.user.email,
        username: result.user.username,
        createdAt: result.user.createdAt,
      },
    },
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const authController = {
  signup,
  login,
};
