import { z } from 'zod';

/**
 * Create post validation
 */
export const createPostSchema = z.object({
  body: z.object({
    content: z
      .string({
        required_error: 'Content is required',
      })
      .trim()
      .min(1, 'Content cannot be empty')
      .max(500, 'Content must not exceed 500 characters'),
  }),
});

/**
 * Get posts query validation
 */
export const getPostsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().positive('Page must be a positive integer')),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .pipe(z.number().int().min(1).max(100, 'Limit must not exceed 100')),
    username: z
      .string()
      .optional()
      .transform((val) => (val ? val.toLowerCase().trim() : undefined)),
  }),
});

/**
 * Post ID param validation (for like/comment endpoints)
 */
export const postIdParamSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Post ID is required' }).regex(
      /^[0-9a-fA-F]{24}$/,
      'Invalid post ID format',
    ),
  }),
});

/**
 * Add comment validation (includes param + body)
 */
export const addCommentSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Post ID is required' }).regex(
      /^[0-9a-fA-F]{24}$/,
      'Invalid post ID format',
    ),
  }),
  body: z.object({
    content: z
      .string({
        required_error: 'Comment content is required',
      })
      .trim()
      .min(1, 'Comment cannot be empty')
      .max(300, 'Comment must not exceed 300 characters'),
  }),
});

// Export for route usage
export const createPostValidation = createPostSchema;
export const getPostsValidation = getPostsSchema;
export const postIdParamValidation = postIdParamSchema;
export const addCommentValidation = addCommentSchema;
