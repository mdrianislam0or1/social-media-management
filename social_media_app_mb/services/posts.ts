import { CommentResponse, LikeResponse, PostResponse, PostsResponse } from '@/types';
import { API_ENDPOINTS, PAGINATION } from '../constants/config';
import { api } from './api';

export interface CreatePostData {
  content: string;
}

export interface GetPostsParams {
  page?: number;
  limit?: number;
  username?: string;
}

export interface AddCommentData {
  content: string;
}

export const createPost = async (data: CreatePostData): Promise<PostResponse> => {
  try {
    const response = await api.post<PostResponse>(API_ENDPOINTS.POSTS.CREATE, data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getPosts = async (params?: GetPostsParams): Promise<PostsResponse> => {
  try {
    const queryParams = {
      page: params?.page || PAGINATION.DEFAULT_PAGE,
      limit: params?.limit || PAGINATION.DEFAULT_LIMIT,
      username: params?.username || '',
    };

    const response = await api.get<PostsResponse>(API_ENDPOINTS.POSTS.GET_ALL, {
      params: queryParams,
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const toggleLike = async (postId: string): Promise<LikeResponse> => {
  try {
    const response = await api.post<LikeResponse>(API_ENDPOINTS.POSTS.LIKE(postId));
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const addComment = async (postId: string, data: AddCommentData): Promise<CommentResponse> => {
  try {
    const response = await api.post<CommentResponse>(
      API_ENDPOINTS.POSTS.COMMENT(postId),
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
