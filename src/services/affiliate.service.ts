import { hashSync } from "bcryptjs";
import type { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { serializeDocument } from "@/lib/utils/serialization";
import { assertObjectId } from "@/lib/utils/object-id";
import {
  createAffiliateSchema,
  updateAffiliateSchema,
} from "@/lib/validation/affiliate";
import {
  attachPromoCodesToAffiliate,
  detachPromoCodesFromAffiliate,
  listPromoCodesByAffiliateIds,
  listPromoCodesByIds,
} from "@/repositories/promo-code.repository";
import {
  createUser,
  deleteUserById,
  getUserByEmail,
  getUserById,
  listUsers,
  updateUserById,
} from "@/repositories/user.repository";
import type { PromoCode, User } from "@/types/entities";

export type AffiliatePromoCodeSummary = Pick<
  PromoCode,
  "_id" | "code" | "type" | "value"
>;

export interface AdminAffiliateListItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  promoCodes: AffiliatePromoCodeSummary[];
}

function toPromoCodeSummary(promoCode: PromoCode): AffiliatePromoCodeSummary {
  return {
    _id: promoCode._id,
    code: promoCode.code,
    type: promoCode.type,
    value: promoCode.value,
  };
}

function toAffiliateListItem(
  user: User,
  promoCodesByAffiliate: Map<string, AffiliatePromoCodeSummary[]>,
): AdminAffiliateListItem {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isActive: user.isActive,
    createdAt: user.createdAt,
    promoCodes: promoCodesByAffiliate.get(user._id) ?? [],
  };
}

async function groupPromoCodesByAffiliateId(affiliateIds: string[]) {
  const promoCodes = serializeDocument<PromoCode[]>(
    await listPromoCodesByAffiliateIds(affiliateIds),
  );

  const grouped = new Map<string, AffiliatePromoCodeSummary[]>();

  for (const promoCode of promoCodes) {
    if (!promoCode.affiliateUserId) {
      continue;
    }

    const existing = grouped.get(promoCode.affiliateUserId) ?? [];
    existing.push(toPromoCodeSummary(promoCode));
    grouped.set(promoCode.affiliateUserId, existing);
  }

  return grouped;
}

// Seuls les comptes au rôle "affiliate" sont modifiables ici : jamais un client ni un admin.
async function getAffiliateOrThrow(id: string) {
  assertObjectId(id, "Identifiant d'affilié");

  const user = await getUserById(id);

  if (!user || user.role !== "affiliate") {
    throw new AppError("Compte affilié introuvable.", 404);
  }

  return user;
}

export const affiliateService = {
  async list() {
    const result = await listUsers({
      page: 1,
      limit: 200,
      role: "affiliate",
    });
    const affiliates = serializeDocument<User[]>(result.items);
    const promoCodesByAffiliate = await groupPromoCodesByAffiliateId(
      affiliates.map((affiliate) => affiliate._id),
    );

    return {
      items: affiliates.map((affiliate) =>
        toAffiliateListItem(affiliate, promoCodesByAffiliate),
      ),
      totalItems: result.totalItems,
    };
  },

  async create(input: z.input<typeof createAffiliateSchema>) {
    const parsed = createAffiliateSchema.parse(input);

    if (await getUserByEmail(parsed.email)) {
      throw new AppError("Cet email est déjà utilisé.", 409);
    }

    const created = await createUser({
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      passwordHash: hashSync(parsed.password, 12),
      role: "affiliate",
      isActive: true,
      authProviders: ["local"],
    });

    const affiliateId = String(created._id);

    if (parsed.promoCodeIds.length > 0) {
      await attachPromoCodesToAffiliate(parsed.promoCodeIds, affiliateId);
    }

    const promoCodesByAffiliate = await groupPromoCodesByAffiliateId([
      affiliateId,
    ]);

    return toAffiliateListItem(
      serializeDocument<User>(created),
      promoCodesByAffiliate,
    );
  },

  async update(id: string, input: z.input<typeof updateAffiliateSchema>) {
    const existing = await getAffiliateOrThrow(id);
    const parsed = updateAffiliateSchema.parse(input);

    if (parsed.email !== existing.email) {
      const emailOwner = await getUserByEmail(parsed.email);

      if (emailOwner && String(emailOwner._id) !== id) {
        throw new AppError("Cet email est déjà utilisé.", 409);
      }
    }

    const promoCodeIds = [...new Set(parsed.promoCodeIds)];
    const selectedPromoCodes = await listPromoCodesByIds(promoCodeIds);

    if (selectedPromoCodes.length !== promoCodeIds.length) {
      throw new AppError("Un des codes promo sélectionnés est introuvable.", 400);
    }

    const takenByAnotherAffiliate = selectedPromoCodes.some(
      (promoCode) =>
        promoCode.affiliateUserId && String(promoCode.affiliateUserId) !== id,
    );

    if (takenByAnotherAffiliate) {
      throw new AppError(
        "Un des codes promo sélectionnés est déjà attribué à un autre affilié.",
        409,
      );
    }

    const updated = await updateUserById(id, {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      isActive: parsed.isActive,
      ...(parsed.password ? { passwordHash: hashSync(parsed.password, 12) } : {}),
    });

    if (!updated) {
      throw new AppError("Compte affilié introuvable.", 404);
    }

    await detachPromoCodesFromAffiliate(id, promoCodeIds);
    await attachPromoCodesToAffiliate(promoCodeIds, id);

    const promoCodesByAffiliate = await groupPromoCodesByAffiliateId([id]);

    return toAffiliateListItem(
      serializeDocument<User>(updated),
      promoCodesByAffiliate,
    );
  },

  async delete(id: string) {
    await getAffiliateOrThrow(id);

    // Le compte disparaît (la session affilié est revérifiée en base à chaque
    // requête, l'accès est donc coupé immédiatement) ; ses codes promo sont
    // conservés et redeviennent disponibles.
    await detachPromoCodesFromAffiliate(id);

    const deleted = await deleteUserById(id);

    if (!deleted) {
      throw new AppError("Compte affilié introuvable.", 404);
    }

    return { success: true };
  },

  async getProfile(userId: string) {
    const user = await getUserById(userId);

    if (!user || user.role !== "affiliate") {
      throw new AppError("Compte affilié introuvable.", 404);
    }

    return serializeDocument<User>(user);
  },
};
