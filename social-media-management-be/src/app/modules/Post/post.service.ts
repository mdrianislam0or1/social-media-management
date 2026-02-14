import httpStatus from 'http-status';
import { ApplicationError } from '../../../errors/ApplicationError';
import logger from '../../../utils/logger';
import { sendNotification } from '../../../utils/notification';
import { User } from '../Auth/auth.model';
import { Comment } from '../Comment/comment.model';
import { Like } from '../Like/like.model';
import type { IPostResponse } from './post.interface';
import { Post } from './post.model';

/**
 * Create a new text-only post
 */
export const createPost = async (
  userId: string,
  content: string,
): Promise<{ post: IPostResponse }> => {
  logger.info('📝 Creating new post', { userId });

  const user = await User.findById(userId);
  if (!user) {
    throw new ApplicationError(httpStatus.NOT_FOUND, 'User not found');
  }

  const newPost = await Post.create({
    userId,
    content: content.trim(),
  });

  return {
    post: {
      postId: newPost._id.toString(),
      content: newPost.content,
      author: user.username,
      createdAt: newPost.createdAt,
      likeCount: 0,
      commentCount: 0,
      likedByCurrentUser: false,
    },
  };
};

/**
 * Get paginated posts with like/comment counts
 * Optionally filter by username
 */
export const getPosts = async (
  page: number = 1,
  limit: number = 10,
  username?: string,
  currentUserId?: string,
): Promise<{
  page: number;
  totalPages: number;
  totalPosts: number;
  data: IPostResponse[];
}> => {
  // Build filter query
  let filter: Record<string, any> = {};

  if (username) {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      // Username not found — return empty results
      return {
        page,
        totalPages: 0,
        totalPosts: 0,
        data: [],
      };
    }
    filter = { userId: user._id };
  }

  // Total documents for pagination
  const totalPosts = await Post.countDocuments(filter);
  const totalPages = Math.ceil(totalPosts / limit) || 1;

  // Clamp page to valid range
  const validPage = Math.min(Math.max(1, page), totalPages);
  const skip = (validPage - 1) * limit;

  // Fetch posts sorted by newest first, populate author
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username')
    .lean();

  // Get like and comment counts for all posts in one query each
  const postIds = posts.map((p) => p._id);

  // Aggregate like counts
  const likeCounts = await Like.aggregate([
    { $match: { postId: { $in: postIds } } },
    { $group: { _id: '$postId', count: { $sum: 1 } } },
  ]);
  const likeCountMap = new Map(likeCounts.map((lc) => [lc._id.toString(), lc.count]));

  // Aggregate comment counts
  const commentCounts = await Comment.aggregate([
    { $match: { postId: { $in: postIds } } },
    { $group: { _id: '$postId', count: { $sum: 1 } } },
  ]);
  const commentCountMap = new Map(commentCounts.map((cc) => [cc._id.toString(), cc.count]));

  // Check which posts current user has liked
  let userLikedPostIds = new Set<string>();
  if (currentUserId) {
    const userLikes = await Like.find({
      userId: currentUserId,
      postId: { $in: postIds },
    }).select('postId');
    userLikedPostIds = new Set(userLikes.map((l) => l.postId.toString()));
  }

  // Format response
  const data: IPostResponse[] = posts.map((post) => {
    const postIdStr = post._id.toString();
    const author = (post.userId as any)?.username || 'unknown';

    return {
      postId: postIdStr,
      content: post.content,
      author,
      createdAt: post.createdAt,
      likeCount: likeCountMap.get(postIdStr) || 0,
      commentCount: commentCountMap.get(postIdStr) || 0,
      likedByCurrentUser: userLikedPostIds.has(postIdStr),
    };
  });

  return {
    page: validPage,
    totalPages,
    totalPosts,
    data,
  };
};

/**
 * Toggle like on a post
 * If already liked → unlike; otherwise → like
 */
export const toggleLike = async (
  userId: string,
  postId: string,
): Promise<{ liked: boolean; likeCount: number }> => {
  // Validate post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApplicationError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // Check if already liked
  const existingLike = await Like.findOne({ userId, postId });

  let liked: boolean;

  if (existingLike) {
    // Unlike — remove the like
    await Like.deleteOne({ _id: existingLike._id });
    liked = false;
    logger.info('❌ Post unliked', { userId, postId });
  } else {
    // Like — create new like
    await Like.create({ userId, postId });
    liked = true;
    logger.info('❤️ Post liked', { userId, postId });

    // Send notification (only if not self-interaction)
    if (post.userId.toString() !== userId) {
      const sender = await User.findById(userId).select('username');
      if (sender) {
        // Fire and forget — don't await
        sendNotification(post.userId.toString(), {
          type: 'like',
          postId,
          senderUsername: sender.username,
        });
      }
    }
  }

  // Get updated like count
  const likeCount = await Like.countDocuments({ postId });

  return { liked, likeCount };
};

/**
 * Add a comment to a post
 */
export const addComment = async (
  userId: string,
  postId: string,
  content: string,
): Promise<{
  comment: {
    commentId: string;
    content: string;
    author: string;
    createdAt: Date;
  };
  commentCount: number;
}> => {
  // Validate post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApplicationError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const user = await User.findById(userId).select('username');
  if (!user) {
    throw new ApplicationError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Create comment
  const newComment = await Comment.create({
    userId,
    postId,
    content: content.trim(),
  });

  logger.info('💬 Comment added', { userId, postId, commentId: newComment._id });

  // Send notification (only if not self-interaction)
  if (post.userId.toString() !== userId) {
    sendNotification(post.userId.toString(), {
      type: 'comment',
      postId,
      senderUsername: user.username,
    });
  }

  // Get updated comment count
  const commentCount = await Comment.countDocuments({ postId });

  return {
    comment: {
      commentId: newComment._id.toString(),
      content: newComment.content,
      author: user.username,
      createdAt: newComment.createdAt,
    },
    commentCount,
  };
};

export const postService = {
  createPost,
  getPosts,
  toggleLike,
  addComment,
};
