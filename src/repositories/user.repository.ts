import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel, type UserRecord } from "@/models/user.model";

export async function countUsers() {
  await connectToDatabase();
  return UserModel.countDocuments();
}

export async function getUserByEmail(email: string) {
  await connectToDatabase();
  return UserModel.findOne({ email: email.toLowerCase() }).lean().exec();
}

export async function createUser(payload: Partial<UserRecord>) {
  await connectToDatabase();
  return UserModel.create(payload);
}

export async function upsertUserByEmail(
  email: string,
  payload: Partial<UserRecord>,
) {
  await connectToDatabase();
  return UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: payload,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  )
    .lean()
    .exec();
}
