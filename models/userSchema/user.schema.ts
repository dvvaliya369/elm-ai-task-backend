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
      required: function(this: UserDocument) {
        return !this.googleId; // Password not required for Google OAuth users
      },
      trim: true,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values to be non-unique
    },

    provider: {
      type: String,
      default: 'local',
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
  // Only hash password if it exists and is modified
  if (!user.password || !user.isModified("password")) return next();
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
    if (!this.password) return false;
    return await bcrypt.compare(providedPassword, this.password);
  },
};

export default model<UserDocument>("User", userSchema);
