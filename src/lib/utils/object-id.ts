import { Types } from "mongoose";

import { AppError } from "@/lib/utils/app-error";

export function isObjectId(value: string) {
  return Types.ObjectId.isValid(value);
}

export function assertObjectId(value: string, label = "Identifiant de ressource") {
  if (!isObjectId(value)) {
    throw new AppError(`${label} est invalide.`, 400);
  }

  return value;
}
