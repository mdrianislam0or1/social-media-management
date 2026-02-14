import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import * as postService from './post.service';

/**
 * Create a new post
 * @route POST /api/posts
 * @access Auth required
 */
const createPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { content } = req.body;

  const result = await postService.createPost(userId, content);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Post created successfully',
    data: result.post,
  });
});

/**
 * Get paginated posts
 * @route GET /api/posts?page=1&limit=10&username=optional
 * @access Auth required
 */
const getPosts = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const username = req.query.username as string | undefined;
  const currentUserId = req.user?.userId;

  const result = await postService.getPosts(page, limit, username, currentUserId);

  res.status(httpStatus.OK).json({
    success: true,
    page: result.page,
    totalPages: result.totalPages,
    totalPosts: result.totalPosts,
    data: result.data,
  });
});

/**
 * Toggle like on a post
 * @route POST /api/posts/:id/like
 * @access Auth required
 */
const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const postId = req.params.id;

  const result = await postService.toggleLike(userId, postId);

  res.status(httpStatus.OK).json({
    success: true,
    message: result.liked ? 'Post liked' : 'Post unliked',
    data: {
      liked: result.liked,
      likeCount: result.likeCount,
    },
  });
});

/**
 * Add a comment to a post
 * @route POST /api/posts/:id/comment
 * @access Auth required
 */
const addComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const postId = req.params.id;
  const { content } = req.body;

  const result = await postService.addComment(userId, postId, content);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Comment added successfully',
    data: {
      comment: result.comment,
      commentCount: result.commentCount,
    },
  });
});

export const postController = {
  createPost,
  getPosts,
  toggleLike,
  addComment,
};
