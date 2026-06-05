import {
  type HydratedDocument,
  type Model,
  model,
  Schema,
} from "mongoose";

import type { AuthProvider, UserRole } from "@/types/entities";

export interface UserRecord {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: UserRole;
  isActive: boolean;
  authProviders: AuthProvider[];
  googleId?: string;
  facebookId?: string;
  profileCompletedAt?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<UserRecord>;

const userSchema = new Schema<UserRecord>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 24,
    },
    passwordHash: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "customer", "guest"],
      required: true,
      default: "customer",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    authProviders: {
      type: [String],
      enum: ["local", "google", "facebook"],
      default: ["local"],
    },
    googleId: {
      type: String,
      trim: true,
      index: true,
    },
    facebookId: {
      type: String,
      trim: true,
      index: true,
    },
    profileCompletedAt: {
      type: Date,
    },
    passwordResetTokenHash: {
      type: String,
      trim: true,
      index: true,
    },
    passwordResetExpiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model<UserRecord>("User", userSchema, undefined, {
  overwriteModels: true,
}) as Model<UserRecord>;
