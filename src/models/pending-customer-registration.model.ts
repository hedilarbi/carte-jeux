import {
  type HydratedDocument,
  type Model,
  model,
  Schema,
} from "mongoose";

export interface PendingCustomerRegistrationRecord {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  passwordHash: string;
  otpHash: string;
  otpExpiresAt: Date;
  resendAvailableAt: Date;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PendingCustomerRegistrationDocument =
  HydratedDocument<PendingCustomerRegistrationRecord>;

const pendingCustomerRegistrationSchema =
  new Schema<PendingCustomerRegistrationRecord>(
    {
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
      },
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
      phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 24,
      },
      passwordHash: {
        type: String,
        required: true,
      },
      otpHash: {
        type: String,
        required: true,
        index: true,
      },
      otpExpiresAt: {
        type: Date,
        required: true,
        index: {
          expireAfterSeconds: 0,
        },
      },
      resendAvailableAt: {
        type: Date,
        required: true,
        index: true,
      },
      attemptCount: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },
    {
      timestamps: true,
    },
  );

export const PendingCustomerRegistrationModel =
  model<PendingCustomerRegistrationRecord>(
    "PendingCustomerRegistration",
    pendingCustomerRegistrationSchema,
    undefined,
    {
      overwriteModels: true,
    },
  ) as Model<PendingCustomerRegistrationRecord>;
