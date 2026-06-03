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
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  authProviders: AuthProvider[];
  googleId?: string;
  facebookId?: string;
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
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
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
