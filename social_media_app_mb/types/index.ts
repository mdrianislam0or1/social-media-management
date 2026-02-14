export interface User {
  userId: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token?: string;
    expiresIn?: string;
  };
}

export interface Post {
  postId: string;
  content: string;
  author: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
}

export interface PostResponse {
  success: boolean;
  message?: string;
  data?: Post;
  page?: number;
  totalPages?: number;
  totalPosts?: number;
}

export interface PostsResponse {
  success: boolean;
  page: number;
  totalPages: number;
  totalPosts: number;
  data: Post[];
}

export interface Comment {
  commentId: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: {
    comment: Comment;
    commentCount: number;
  };
}

export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    liked: boolean;
    likeCount: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}
