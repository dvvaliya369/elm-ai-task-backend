import { Request } from "express";

/**
 * Auth routes interface
 */
export interface IAuthBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ISignInBody {
  email: string;
  password: string;
}

// Signup Request
export interface ISignUpRequest extends Request {
  body: IAuthBody;
}

// Signin Request
export interface ISignInRequest extends Request {
  body: ISignInBody;
}

export interface IRefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

export interface IChangePasswordRequest extends Request {
  body: {
    oldPassword: string;
    newPassword: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

/**
 * Post routes interface
 */
export interface CreatePostRequest extends Request {
  body: {
    caption?: string;
  };
  file?: Express.Multer.File;
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface UpdatePostRequest extends Request {
  params: {
    id: string;
  };
  body: {
    caption?: string;
    isRemoveMedia?: boolean;
  };
  file?: Express.Multer.File;
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface DeletePostRequest extends Request {
  params: {
    id: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface GetPostsRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    search?: string;
    userId?: string;
    mediaType?: "image" | "video";
    sortBy?: "newest" | "oldest" | "popular";
    minLikes?: string;
    hasMedia?: string;
    days?: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface GetPostByIdRequest extends Request {
  params: {
    id: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface LikePostRequest extends Request {
  params: {
    id: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface CommentPostRequest extends Request {
  params: {
    id: string;
  };
  body: {
    comment: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface DeleteCommentRequest extends Request {
  params: {
    id: string;
  };
  body: {
    commentId: ObjectId;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

/**
 * Profile routes interface
 */
export interface UpdateProfileRequest extends Request {
  body: {
    firstName?: string;
    lastName?: string;
  };
  file?: Express.Multer.File;
  user?: {
    _id: string;
    email: string;
    fullName?: string;
  };
}

export interface GetProfileRequest extends Request {
  params?: {
    id?: string;
  };
  user?: {
    _id: string;
    email: string;
    fullName?: string;
  };
}

export type FilterOperator = "gt" | "gte" | "lt" | "lte" | "eq" | "ne";
export type SortOrder = "asc" | "desc";

export interface FilterItem {
  field: "likesCount" | "commentsCount" | "caption";
  operator:
    | "="
    | "!="
    | ">"
    | ">="
    | "<"
    | "<="
    | "contains"
    | "doesNotContain"
    | "startsWith"
    | "endsWith"
    | "equals"
    | "doesNotEqual";
  value: number | string;
}

export interface GetPostByUserIdRequest extends Request {
  query: {
    userId?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
    filters?: string; // JSON string of FilterItem[]
  };
  params: {
    id: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface SavePostToProfileRequest extends Request {
  params: {
    postId: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface RemovePostFromProfileRequest extends Request {
  params: {
    postId: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface GetSavedPostsRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    sortBy?: "newest" | "oldest";
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

/**
 * Favorite routes interface
 */
export interface AddFavoriteRequest extends Request {
  params: {
    postId: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface RemoveFavoriteRequest extends Request {
  params: {
    postId: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface GetFavoritesRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    sortBy?: "newest" | "oldest";
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}

export interface CheckFavoriteRequest extends Request {
  params: {
    postId: string;
  };
  user?: {
    _id: ObjectId;
    email: string;
    fullName?: string;
  };
}
