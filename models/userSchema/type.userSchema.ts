import { Document, Types } from "mongoose";

export interface Photo {
  photo_id?: string;
  photo_url?: string;
  photo_data?: object | string;
}

export interface UserInterface {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  profilePhoto?: Photo;
  refreshToken?: string;
  savedPosts?: Types.ObjectId[];
}

export interface UserDocument extends UserInterface, Document {
  // _id: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(providedPassword: string): Promise<boolean>;
}
