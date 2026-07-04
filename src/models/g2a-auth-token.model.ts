import { type HydratedDocument, model, models, Schema } from "mongoose";

export interface G2AAuthTokenRecord {
  provider: "g2a";
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type G2AAuthTokenDocument = HydratedDocument<G2AAuthTokenRecord>;

const g2aAuthTokenSchema = new Schema<G2AAuthTokenRecord>(
  {
    provider: {
      type: String,
      enum: ["g2a"],
      default: "g2a",
      required: true,
      unique: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
      trim: true,
    },
    tokenType: {
      type: String,
      required: true,
      trim: true,
      default: "Bearer",
    },
    expiresIn: {
      type: Number,
      required: true,
      min: 1,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const G2AAuthTokenModel =
  models.G2AAuthToken ||
  model<G2AAuthTokenRecord>("G2AAuthToken", g2aAuthTokenSchema);
