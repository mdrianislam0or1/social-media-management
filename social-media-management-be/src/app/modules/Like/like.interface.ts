import { Document, Types } from 'mongoose';

export interface ILike extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  createdAt: Date;
}
