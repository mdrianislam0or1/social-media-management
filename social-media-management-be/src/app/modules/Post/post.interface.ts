import { Document, Types } from 'mongoose';

export interface IPost extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePostRequest {
  content: string;
}

export interface IGetPostsQuery {
  page?: number;
  limit?: number;
  username?: string;
}

export interface IPostResponse {
  postId: string;
  content: string;
  author: string;
  createdAt: Date;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
}

export interface IGetPostsResponse {
  success: true;
  page: number;
  totalPages: number;
  totalPosts: number;
  data: IPostResponse[];
}
