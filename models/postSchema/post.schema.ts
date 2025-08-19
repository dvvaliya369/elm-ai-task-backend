import { Schema, model, Types } from "mongoose";
import { PostDocument } from "./type.postSchema";

const likeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const commentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      maxLength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Main Post schema
const postSchema = new Schema<PostDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      maxLength: [500, "Caption cannot exceed 500 characters"],
    },
    media: {
      url: {
        type: String,
      },
      name: {
        type: String,
      },
      type: {
        type: String,
      },
      size: {
        type: Number,
      },
      width: {
        type: Number,
      },
      height: {
        type: Number,
      },
      duration: {
        type: Number,
      },
      mediaType: {
        type: String,
        enum: ['image', 'video'],
      },
    },
    likes: [likeSchema],
    comments: [commentSchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.pre('save', function() {
  if (!this.caption && !this.media?.url) {
    throw new Error('Either caption or media is required');
  }
});

postSchema.methods = {
  toggleLike: async function (userId: Types.ObjectId, userName: string) {
    const likeIndex = this.likes.findIndex(
      (like: any) => like.user.toString() === userId.toString()
    );

    if (likeIndex !== -1) {
      this.likes.splice(likeIndex, 1);
    } else {
      this.likes.push({
        user: userId,
        name: userName,
        createdAt: new Date(),
      });
    }

    return await this.save();
  },

  addComment: async function (
    userId: Types.ObjectId,
    userName: string,
    commentText: string
  ) {
    this.comments.push({
      user: userId,
      name: userName,
      comment: commentText,
    });

    return await this.save();
  },

  removeComment: async function (
    commentId: Types.ObjectId,
    userId: Types.ObjectId
  ) {
    const comment = this.comments.id(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (
      comment.user.toString() !== userId.toString() &&
      this.user.toString() !== userId.toString()
    ) {
      throw new Error("Not authorized to delete this comment");
    }

    comment.deleteOne();
    return await this.save();
  },

  isLikedByUser: function (userId: Types.ObjectId): boolean {
    return this.likes.some(
      (like: any) => like.user.toString() === userId.toString()
    );
  },

  getLikesCount: function (): number {
    return this.likes.length;
  },

  getCommentsCount: function (): number {
    return this.comments.length;
  },
};

postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ "likes.user": 1 });
postSchema.index({ "comments.user": 1 });

export default model<PostDocument>("Post", postSchema);
