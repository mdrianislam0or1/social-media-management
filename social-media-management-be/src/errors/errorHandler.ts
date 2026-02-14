import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import config from '../config';
import logger from '../utils/logger';
import { AppError } from './AppError';
import { ApplicationError } from './ApplicationError';

interface ErrorMessage {
  path: string | number;
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
  errorMessages?: ErrorMessage[];
  stack?: string;
}

/**
 * Handles Zod validation errors
 */
const handleZodError = (error: ZodError): ErrorResponse => {
  const errorMessages: ErrorMessage[] = error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));

  return {
    success: false,
    message: 'Validation Error',
    errorMessages,
  };
};

/**
 * Handles Mongoose validation errors
 */
const handleMongooseValidationError = (error: any): ErrorResponse => {
  const errorMessages: ErrorMessage[] = Object.values(error.errors).map(
    (val: any) => ({
      path: val?.path || '',
      message: val?.message || 'Validation error',
    }),
  );

  return {
    success: false,
    message: 'Validation Error',
    errorMessages,
  };
};

/**
 * Handles Mongoose duplicate key errors (E11000)
 */
const handleMongooseDuplicateError = (error: any): ErrorResponse => {
  const match = error.message.match(/"([^"]*)"/);
  const extractedMessage = match?.[1] || 'Value';

  const errorMessages: ErrorMessage[] = [
    {
      path: '',
      message: `${extractedMessage} already exists`,
    },
  ];

  return {
    success: false,
    message: 'Duplicate Entry',
    errorMessages,
  };
};

/**
 * Handles Mongoose CastError (invalid ObjectId, etc.)
 */
const handleCastError = (error: any): ErrorResponse => {
  const errorMessages: ErrorMessage[] = [
    {
      path: error.path || '',
      message: `Invalid ${error.path}: ${error.value}`,
    },
  ];

  return {
    success: false,
    message: 'Invalid ID',
    errorMessages,
  };
};

/**
 * Processes errors and extracts status code, message, and error details
 */
const processError = (
  err: any,
): {
  statusCode: number;
  message: string;
  errorMessages: ErrorMessage[];
} => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong!';
  let errorMessages: ErrorMessage[] = [];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = httpStatus.BAD_REQUEST;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages || [];
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = handleMongooseValidationError(err);
    statusCode = httpStatus.BAD_REQUEST;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages || [];
  } else if (err?.code === 11000) {
    const simplifiedError = handleMongooseDuplicateError(err);
    statusCode = httpStatus.CONFLICT;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages || [];
  } else if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err);
    statusCode = httpStatus.BAD_REQUEST;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages || [];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ApplicationError) {
    statusCode = err.statusCode;
    message = err.message;

    if (err.details) {
      errorMessages = [
        {
          path: '',
          message:
            typeof err.details === 'string'
              ? err.details
              : JSON.stringify(err.details),
        },
      ];
    }
  } else if (err instanceof Error) {
    message = err.message;
  }

  return { statusCode, message, errorMessages };
};

/**
 * Sanitizes stack trace for production by removing absolute paths
 */
const sanitizeStackTrace = (stack?: string): string | undefined => {
  if (!stack) return undefined;

  return stack
    .split('\n')
    .map((line) => {
      // Remove absolute file paths, keep only relative paths and line numbers
      return line.replace(/\/[^\s]+\//g, '').replace(/\(.*node_modules/, '(node_modules');
    })
    .join('\n');
};

/**
 * Global error handling middleware
 * Catches all errors thrown in the application and formats them consistently
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Log full error details for debugging (server-side only)
  logger.error('Error occurred:', {
    error: err.message || err,
    name: err.name,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id || 'unauthenticated',
    stack: err?.stack,
  });

  // Process the error to extract relevant information
  const { statusCode, message, errorMessages } = processError(err);

  // Build the error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    ...(errorMessages.length > 0 && { errorMessages }),
    ...(config.env === 'development' && {
      stack: sanitizeStackTrace(err?.stack),
    }),
  };

  // Send the response
  res.status(statusCode).json(errorResponse);
};
