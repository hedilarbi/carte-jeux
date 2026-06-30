import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { assertObjectId } from "@/lib/utils/object-id";
import {
  createPaginatedResult,
  resolvePagination,
} from "@/lib/utils/pagination";
import { roundMoney } from "@/lib/utils/pricing";
import { serializeDocument } from "@/lib/utils/serialization";
import {
  applyPromoCodeSchema,
  promoCodeCreateSchema,
  promoCodeUpdateSchema,
} from "@/lib/validation/promo-code";
import type { PromoCodeRecord } from "@/models/promo-code.model";
import {
  createPromoCode,
  deletePromoCodeById,
  existsPromoCode,
  getPromoCodeByCode,
  getPromoCodeById,
  listPromoCodes,
  redeemPromoCodeById,
  type PromoCodeListFilters,
  updatePromoCodeById,
} from "@/repositories/promo-code.repository";
import type {
  AppliedPromoCode,
  PromoCode,
  PromoCodeDiscountType,
} from "@/types/entities";

type PromoCodeRecordWithId = PromoCodeRecord & {
  _id: unknown;
};

function toPublicPromoCode(record: unknown) {
  const serialized = serializeDocument<
    PromoCode & { usedByUserIds?: unknown }
  >(record);

  delete serialized.usedByUserIds;

  return serialized;
}

function assertValidDiscountValue(type: PromoCodeDiscountType, value: number) {
  if (type === "percentage" && value > 100) {
    throw new AppError("Une réduction en pourcentage ne peut pas dépasser 100%.", 422);
  }
}

function getPromoCodeId(promoCode: PromoCodeRecordWithId) {
  return String(promoCode._id);
}

function getUserUsageCount(
  promoCode: PromoCodeRecord,
  userId?: string,
) {
  if (!userId || !promoCode.usedByUserIds) {
    return 0;
  }

  if (promoCode.usedByUserIds instanceof Map) {
    return promoCode.usedByUserIds.get(userId) ?? 0;
  }

  return Number(promoCode.usedByUserIds[userId] ?? 0);
}

function assertPromoCodeIsUsable(
  promoCode: PromoCodeRecord,
  userId?: string,
) {
  const now = new Date();

  if (promoCode.expiresAt.getTime() <= now.getTime()) {
    throw new AppError("Ce code promo a expiré.", 409);
  }

  if (
    promoCode.usageLimit !== undefined &&
    promoCode.usedCount >= promoCode.usageLimit
  ) {
    throw new AppError("La limite d'utilisation de ce code promo est atteinte.", 409);
  }

  if (
    userId &&
    promoCode.usageLimitPerUser !== undefined &&
    getUserUsageCount(promoCode, userId) >= promoCode.usageLimitPerUser
  ) {
    throw new AppError(
      "Vous avez déjà utilisé ce code promo le nombre maximum de fois.",
      409,
    );
  }
}

function buildAppliedPromoCode(
  promoCode: PromoCodeRecordWithId,
): AppliedPromoCode {
  return {
    promoCodeId: getPromoCodeId(promoCode),
    code: promoCode.code,
    type: promoCode.type,
    value: promoCode.value,
  };
}

function hasOwnField(input: object, field: string) {
  return Object.prototype.hasOwnProperty.call(input, field);
}

export function calculatePromoCodeDiscount(input: {
  amount: number;
  type: PromoCodeDiscountType;
  value: number;
}) {
  const amount = Number.isFinite(input.amount) ? Math.max(0, input.amount) : 0;
  const rawDiscount =
    input.type === "percentage" ? amount * (input.value / 100) : input.value;

  return roundMoney(Math.min(amount, Math.max(0, rawDiscount)));
}

export const promoCodeService = {
  async list(filters: PromoCodeListFilters = {}) {
    const result = await listPromoCodes(filters);
    const pagination = resolvePagination(filters);

    return createPaginatedResult<PromoCode>(
      result.items.map(toPublicPromoCode),
      result.totalItems,
      pagination,
    );
  },

  async getById(id: string) {
    assertObjectId(id, "Identifiant de code promo");

    const promoCode = await getPromoCodeById(id);

    if (!promoCode) {
      throw new AppError("Code promo introuvable.", 404);
    }

    return toPublicPromoCode(promoCode);
  },

  async create(input: z.input<typeof promoCodeCreateSchema>) {
    const parsed = promoCodeCreateSchema.parse(input);

    assertValidDiscountValue(parsed.type, parsed.value);

    if (await existsPromoCode(parsed.code)) {
      throw new AppError("Ce code promo existe déjà.", 409);
    }

    const created = await createPromoCode({
      ...parsed,
      usedCount: 0,
    });

    return toPublicPromoCode(created);
  },

  async update(id: string, input: z.input<typeof promoCodeUpdateSchema>) {
    assertObjectId(id, "Identifiant de code promo");

    const existing = await getPromoCodeById(id);

    if (!existing) {
      throw new AppError("Code promo introuvable.", 404);
    }

    const parsed = promoCodeUpdateSchema.parse(input);
    const inputObject =
      input && typeof input === "object" ? input : {};
    const nextType = parsed.type ?? existing.type;
    const nextValue = parsed.value ?? existing.value;
    const payload: Partial<PromoCodeRecord> = {};
    const unsetFields: Array<keyof PromoCodeRecord> = [];

    assertValidDiscountValue(nextType, nextValue);

    if (parsed.code && (await existsPromoCode(parsed.code, id))) {
      throw new AppError("Ce code promo existe déjà.", 409);
    }

    for (const field of ["code", "type", "value", "expiresAt"] as const) {
      if (parsed[field] !== undefined) {
        payload[field] = parsed[field] as never;
      }
    }

    for (const field of ["usageLimit", "usageLimitPerUser"] as const) {
      if (hasOwnField(inputObject, field)) {
        if (parsed[field] === undefined) {
          unsetFields.push(field);
        } else {
          payload[field] = parsed[field] as never;
        }
      }
    }

    const updated = await updatePromoCodeById(id, payload, unsetFields);

    if (!updated) {
      throw new AppError("Code promo introuvable.", 404);
    }

    return toPublicPromoCode(updated);
  },

  async delete(id: string) {
    assertObjectId(id, "Identifiant de code promo");

    const deleted = await deletePromoCodeById(id);

    if (!deleted) {
      throw new AppError("Code promo introuvable.", 404);
    }

    return {
      success: true,
    };
  },

  async getApplicableByCode(
    input: z.input<typeof applyPromoCodeSchema>,
    userId?: string,
  ) {
    const parsed = applyPromoCodeSchema.parse(input);
    const promoCode = await getPromoCodeByCode(parsed.code, true);

    if (!promoCode) {
      throw new AppError("Code promo invalide.", 404);
    }

    assertPromoCodeIsUsable(promoCode, userId);

    return buildAppliedPromoCode(promoCode as PromoCodeRecordWithId);
  },

  async redeemForOrder(input: {
    amount: number;
    code: string;
    promoCodeId: string;
    userId: string;
  }) {
    assertObjectId(input.promoCodeId, "Identifiant de code promo");
    assertObjectId(input.userId, "Identifiant utilisateur");

    const redeemedPromoCode = await redeemPromoCodeById({
      code: input.code,
      id: input.promoCodeId,
      now: new Date(),
      userId: input.userId,
    });

    if (!redeemedPromoCode) {
      throw new AppError(
        "Ce code promo n'est plus disponible ou sa limite d'utilisation est atteinte.",
        409,
      );
    }

    const discountAmount = calculatePromoCodeDiscount({
      amount: input.amount,
      type: redeemedPromoCode.type,
      value: redeemedPromoCode.value,
    });
    const discountedTotal = roundMoney(Math.max(0, input.amount - discountAmount));

    return {
      ...buildAppliedPromoCode(redeemedPromoCode as PromoCodeRecordWithId),
      discountAmount,
      initialTotal: roundMoney(input.amount),
      discountedTotal,
    };
  },
};
