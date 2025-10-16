import { Document, Types } from "mongoose";

export interface FavoriteInterface {
  user: Types.ObjectId;
  post: Types.ObjectId;
  createdAt: Date;
}

export interface FavoriteDocument extends FavoriteInterface, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
