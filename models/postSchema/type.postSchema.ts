import { Document, Types } from "mongoose";

export interface MediaMetadata {
  url: string;
  name: string;
  type: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  mediaType: 'image' | 'video';
}

export interface Like {
  user: Types.ObjectId;
  name: string;
  createdAt: Date;
}

export interface Comment {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostInterface {
  user: Types.ObjectId;
  caption?: string;
  media?: MediaMetadata;
  likes: Like[];
  comments: Comment[];
  isDeleted: boolean;
}

export interface PostDocument extends PostInterface, Document {
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  toggleLike(userId: Types.ObjectId, userName: string): Promise<PostDocument>;
  addComment(userId: Types.ObjectId, userName: string, commentText: string): Promise<PostDocument>;
  removeComment(commentId: Types.ObjectId, userId: Types.ObjectId): Promise<PostDocument>;
  isLikedByUserMethod(userId: Types.ObjectId): boolean;
  isCommentedByUserMethod(userId: Types.ObjectId): boolean;
  getLikesCount(): number;
  getCommentsCount(): number;
}
