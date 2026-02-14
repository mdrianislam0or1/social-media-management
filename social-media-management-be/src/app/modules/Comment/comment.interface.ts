import { Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  content: string;
  createdAt: Date;
}
