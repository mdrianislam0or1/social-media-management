import { Schema, model, type Model } from 'mongoose';
import type { ILike } from './like.interface';

type LikeModel = Model<ILike>;

const LikeSchema = new Schema<ILike, LikeModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post ID is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Compound unique index — one like per user per post
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

// Index for counting likes per post
LikeSchema.index({ postId: 1 });

export const Like = model<ILike, LikeModel>('Like', LikeSchema);
