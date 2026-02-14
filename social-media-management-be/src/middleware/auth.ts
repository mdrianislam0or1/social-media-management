/* eslint-disable @typescript-eslint/no-namespace */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { IJwtPayload } from '../app/modules/Auth/auth.interface';
import { User } from '../app/modules/Auth/auth.model';
import config from '../config';
import { ApplicationError } from '../errors/ApplicationError';
import logger from '../utils/logger';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        userId: string;
        email: string;
        username: string;
      };
    }
  }
}

/**
 * Auth middleware — verifies JWT and attaches user to request
 * No role-based authorization (social feed has no roles)
 */
export const auth = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApplicationError(httpStatus.UNAUTHORIZED, 'No token provided');
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      let decoded: IJwtPayload;
      try {
        decoded = jwt.verify(token, config.jwt.jwt_secret) as IJwtPayload;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new ApplicationError(httpStatus.UNAUTHORIZED, 'Token has expired');
        }
        throw new ApplicationError(httpStatus.UNAUTHORIZED, 'Invalid token');
      }

      // Check if user exists
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new ApplicationError(httpStatus.UNAUTHORIZED, 'User not found');
      }

      // Attach user to request
      req.user = {
        _id: user._id.toString(),
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      };

      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      next(error);
    }
  };
};

/**
 * Optional auth — doesn't throw error if no token
 * Used for endpoints that work with or without auth
 */
export const optionalAuth = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.split(' ')[1];

      try {
        const decoded = jwt.verify(token, config.jwt.jwt_secret) as IJwtPayload;

        const user = await User.findById(decoded.userId);

        if (user) {
          req.user = {
            _id: user._id.toString(),
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
          };
        }
      } catch (error) {
        logger.debug('Optional auth failed:', error);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
