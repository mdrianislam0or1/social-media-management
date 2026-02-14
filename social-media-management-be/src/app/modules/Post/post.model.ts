import { Schema, model, type Model } from 'mongoose';
import type { IPost } from './post.interface';

type PostModel = Model<IPost>;

const PostSchema = new Schema<IPost, PostModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [500, 'Content must not exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

// Index for sorting by newest first
PostSchema.index({ createdAt: -1 });

export const Post = model<IPost, PostModel>('Post', PostSchema);
