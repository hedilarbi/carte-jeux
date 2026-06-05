import { connectToDatabase } from "@/lib/db/mongoose";
import {
  PendingCustomerRegistrationModel,
  type PendingCustomerRegistrationRecord,
} from "@/models/pending-customer-registration.model";

export async function getPendingCustomerRegistrationByEmail(email: string) {
  await connectToDatabase();
  return PendingCustomerRegistrationModel.findOne({
    email: email.toLowerCase(),
  })
    .lean()
    .exec();
}

export async function upsertPendingCustomerRegistrationByEmail(
  email: string,
  payload: Partial<PendingCustomerRegistrationRecord>,
) {
  await connectToDatabase();
  return PendingCustomerRegistrationModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: payload,
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

export async function updatePendingCustomerRegistrationByEmail(
  email: string,
  payload: Partial<PendingCustomerRegistrationRecord>,
) {
  await connectToDatabase();
  return PendingCustomerRegistrationModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: payload,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}

export async function incrementPendingCustomerRegistrationAttempts(
  email: string,
) {
  await connectToDatabase();
  return PendingCustomerRegistrationModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $inc: {
        attemptCount: 1,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}

export async function deletePendingCustomerRegistrationByEmail(email: string) {
  await connectToDatabase();
  return PendingCustomerRegistrationModel.findOneAndDelete({
    email: email.toLowerCase(),
  })
    .lean()
    .exec();
}
