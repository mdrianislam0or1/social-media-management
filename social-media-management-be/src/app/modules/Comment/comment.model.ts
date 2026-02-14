import { Schema, model, type Model } from 'mongoose';
import type { IComment } from './comment.interface';

type CommentModel = Model<IComment>;

const CommentSchema = new Schema<IComment, CommentModel>(
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
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [300, 'Comment must not exceed 300 characters'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Index for fetching comments per post
CommentSchema.index({ postId: 1, createdAt: -1 });

export const Comment = model<IComment, CommentModel>('Comment', CommentSchema);
