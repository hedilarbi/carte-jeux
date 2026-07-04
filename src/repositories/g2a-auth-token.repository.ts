import { connectToDatabase } from "@/lib/db/mongoose";
import {
  G2AAuthTokenModel,
  type G2AAuthTokenRecord,
} from "@/models/g2a-auth-token.model";

export type SaveG2AAuthTokenInput = Pick<
  G2AAuthTokenRecord,
  "accessToken" | "tokenType" | "expiresIn" | "expiresAt"
>;

export async function getStoredG2AAuthToken() {
  await connectToDatabase();

  return G2AAuthTokenModel.findOne({ provider: "g2a" }).lean().exec();
}

export async function saveG2AAuthToken(payload: SaveG2AAuthTokenInput) {
  await connectToDatabase();

  return G2AAuthTokenModel.findOneAndUpdate(
    { provider: "g2a" },
    {
      $set: {
        provider: "g2a",
        accessToken: payload.accessToken,
        tokenType: payload.tokenType,
        expiresIn: payload.expiresIn,
        expiresAt: payload.expiresAt,
      },
    },
    {
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    },
  )
    .lean()
    .exec();
}
