import express from 'express';
import { auth } from '../../../middleware/auth';
import validateRequest from '../../../middleware/validation.middleware';
import { postController } from './post.controller';
import {
    addCommentValidation,
    createPostValidation,
    getPostsValidation,
    postIdParamValidation,
} from './post.validation';

const router = express.Router();

/**
 * @route   POST /api/posts
 * @desc    Create a new text-only post
 * @access  Auth required
 */
router.post(
  '/',
  auth(),
  validateRequest(createPostValidation),
  postController.createPost,
);

/**
 * @route   GET /api/posts?page=1&limit=10&username=optional
 * @desc    Get paginated posts (newest first), optionally filter by username
 * @access  Auth required
 */
router.get(
  '/',
  auth(),
  validateRequest(getPostsValidation),
  postController.getPosts,
);

/**
 * @route   POST /api/posts/:id/like
 * @desc    Toggle like on a post
 * @access  Auth required
 */
router.post(
  '/:id/like',
  auth(),
  validateRequest(postIdParamValidation),
  postController.toggleLike,
);

/**
 * @route   POST /api/posts/:id/comment
 * @desc    Add a comment to a post
 * @access  Auth required
 */
router.post(
  '/:id/comment',
  auth(),
  validateRequest(addCommentValidation),
  postController.addComment,
);

export const postRoutes = router;
