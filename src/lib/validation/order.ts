import { z } from "zod";

import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/constants/admin";
import {
  createUpdateSchema,
  nonNegativeNumberSchema,
  optionalString,
} from "@/lib/validation/common";

const orderPatchShape = {
  status: z.enum(ORDER_STATUS_OPTIONS).optional(),
  paymentStatus: z.enum(PAYMENT_STATUS_OPTIONS).optional(),
  supplierPlatform: optionalString(160),
  supplierPurchaseReference: optionalString(160),
  supplierCost: nonNegativeNumberSchema.optional(),
  internalNote: optionalString(2000),
  deliveredCode: optionalString(4000),
  deliveryNote: optionalString(1200),
  paymentProvider: optionalString(120),
  paymentReference: optionalString(180),
};

export const orderUpdateSchema = createUpdateSchema(orderPatchShape);
