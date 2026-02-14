import { z } from 'zod';

/**
 * Signup validation schema
 */
export const signupSchema = z.object({
  body: z.object({
    username: z
      .string({
        required_error: 'Username is required',
      })
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must not exceed 30 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, hyphens, and underscores',
      )
      .toLowerCase()
      .trim(),

    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),

    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, 'Password must be at least 8 characters'),
  }),
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),

    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

// Export for use in routes
export const signupValidation = signupSchema;
export const loginValidation = loginSchema;
