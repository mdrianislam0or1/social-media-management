import httpStatus from 'http-status';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../../../config';
import { ApplicationError } from '../../../errors/ApplicationError';
import logger from '../../../utils/logger';
import type {
  IAuthResponse,
  IJwtPayload,
  ILoginRequest,
  ISignupRequest,
  IUser,
} from './auth.interface';
import { User } from './auth.model';

/**
 * Generate JWT access token
 * Token contains only userId as per spec
 */
const generateToken = (payload: IJwtPayload): string => {
  const options: SignOptions = {
    expiresIn: '7d',
  };
  return jwt.sign(payload, config.jwt.jwt_secret as string, options);
};

/**
 * Format user response — never return password
 */
const formatUserResponse = (user: IUser) => ({
  userId: user._id.toString(),
  email: user.email,
  username: user.username,
  createdAt: user.createdAt,
});

/**
 * Register new user
 */
export const signup = async (
  userData: ISignupRequest,
): Promise<{ user: IUser; message: string }> => {
  logger.info('📝 User signup attempt', { email: userData.email });

  // Check if email already exists
  const existingEmail = await User.findOne({ email: userData.email.toLowerCase() });
  if (existingEmail) {
    throw new ApplicationError(httpStatus.CONFLICT, 'Email is already registered');
  }

  // Check if username already exists
  const existingUsername = await User.findOne({ username: userData.username.toLowerCase() });
  if (existingUsername) {
    throw new ApplicationError(httpStatus.CONFLICT, 'Username is already taken');
  }

  // Create user — password hashed via pre-save hook
  const newUser = new User({
    username: userData.username.toLowerCase(),
    email: userData.email.toLowerCase(),
    password: userData.password,
  });

  const savedUser = await newUser.save();

  logger.info('✅ User registered successfully', {
    userId: savedUser._id,
    email: savedUser.email,
  });

  return {
    user: savedUser,
    message: 'User registered successfully',
  };
};

/**
 * Login user
 */
export const login = async (loginData: ILoginRequest): Promise<IAuthResponse> => {
  logger.info('🔐 User login attempt', { email: loginData.email });

  // Find user with password field
  const user = await User.findOne({ email: loginData.email.toLowerCase() }).select('+password');

  if (!user) {
    throw new ApplicationError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(loginData.password);
  if (!isPasswordValid) {
    throw new ApplicationError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  // Generate access token — only userId in payload
  const payload: IJwtPayload = {
    userId: user._id.toString(),
  };

  const accessToken = generateToken(payload);

  logger.info('✅ User logged in successfully', {
    userId: user._id,
    email: user.email,
  });

  return {
    user: formatUserResponse(user),
    token: accessToken,
    expiresIn: '7d',
  };
};

export const authService = {
  signup,
  login,
};
