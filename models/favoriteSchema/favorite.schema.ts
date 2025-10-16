import { Schema, model } from "mongoose";
import { FavoriteDocument } from "./type.favoriteSchema";

const favoriteSchema = new Schema<FavoriteDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure a user can only favorite a post once
favoriteSchema.index({ user: 1, post: 1 }, { unique: true });

// Index for efficient queries by user
favoriteSchema.index({ user: 1, createdAt: -1 });

// Index for efficient queries by post
favoriteSchema.index({ post: 1 });

export default model<FavoriteDocument>("Favorite", favoriteSchema);
