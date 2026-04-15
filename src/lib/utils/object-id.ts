import { Types } from "mongoose";

import { AppError } from "@/lib/utils/app-error";

export function isObjectId(value: string) {
  return Types.ObjectId.isValid(value);
}

export function assertObjectId(value: string, label = "Resource id") {
  if (!isObjectId(value)) {
    throw new AppError(`${label} is invalid.`, 400);
  }

  return value;
}
