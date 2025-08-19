import { Document } from "mongoose";

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
}

export interface UserDocument extends UserInterface, Document {
  // _id: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(providedPassword: string): Promise<boolean>;
}
