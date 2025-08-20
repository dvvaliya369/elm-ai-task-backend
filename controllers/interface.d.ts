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
    mediaType?: 'image' | 'video';
    sortBy?: 'newest' | 'oldest' | 'popular';
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
