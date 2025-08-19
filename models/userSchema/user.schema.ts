import { Schema, model } from "mongoose";
import * as bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import envConfig from "../../config/env.config";
import { UserDocument } from "./type.userSchema";

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: [true, "Enter your first name"],
      trim: true,
      maxLength: [25, "Name must be under 10 character"],
    },

    lastName: {
      type: String,
      required: [true, "Enter your last name"],
      trim: true,
      maxLength: [25, "Name must be under 10 character"],
    },

    email: {
      type: String,
      unique: true,
      required: [true, "Enter your email"],
      trim: true,
    },

    password: {
      type: String,
      minLength: [4, "Password must be at least 4 character long"],
      required: [true, "Password is required"],
      trim: true,
    },

    profilePhoto: {
      photo_id: {
        type: String,
      },
      photo_url: {
        type: String,
      },
      photo_data: {
        type: String,
      },
    },

    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// bcrypt password
userSchema.pre("save", async function (next) {
  var user = this as UserDocument;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
  return next();
});

// Virtual field
userSchema.virtual("fullName").get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods = {
  comparePassword: async function (providedPassword: string): Promise<boolean> {
    return await bcrypt.compare(providedPassword, this.password);
  },
};

export default model<UserDocument>("User", userSchema);
