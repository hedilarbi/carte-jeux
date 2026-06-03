import { compareSync, hashSync } from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { serializeDocument } from "@/lib/utils/serialization";
import {
  customerLoginSchema,
  customerRegisterSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import {
  attachProviderToUser,
  createUser,
  getUserByEmail,
  getUserById,
  getUserByResetTokenHash,
  updateUserById,
  updateUserPasswordAndClearReset,
} from "@/repositories/user.repository";
import type { AuthProvider, AuthUser, User } from "@/types/entities";

type OAuthProfile = {
  email: string;
  facebookId?: string;
  firstName?: string;
  googleId?: string;
  lastName?: string;
  provider: Extract<AuthProvider, "google" | "facebook">;
};

function normalizeNameFromEmail(email: string) {
  const baseName = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();

  return baseName || "Client";
}

function toAuthUser(user: User): AuthUser {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    authProviders: user.authProviders?.length ? user.authProviders : ["local"],
  };
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createUnusablePasswordHash() {
  return hashSync(randomBytes(32).toString("hex"), 12);
}

async function createSessionPayload(user: User) {
  if (!user.isActive) {
    throw new AppError("Ce compte est inactif.", 403);
  }

  if (user.role !== "customer") {
    throw new AppError("Ce compte ne peut pas se connecter côté client.", 403);
  }

  return toAuthUser(user);
}

export const customerAuthService = {
  async register(input: z.input<typeof customerRegisterSchema>) {
    const parsed = customerRegisterSchema.parse(input);
    const existingUser = await getUserByEmail(parsed.email);

    if (existingUser) {
      throw new AppError("Un compte existe déjà avec cet email.", 409);
    }

    const firstName = normalizeNameFromEmail(parsed.email);
    const createdUser = await createUser({
      firstName,
      lastName: "Client",
      email: parsed.email,
      passwordHash: hashSync(parsed.password, 12),
      role: "customer",
      isActive: true,
      authProviders: ["local"],
    });

    return createSessionPayload(serializeDocument<User>(createdUser));
  },

  async login(input: z.input<typeof customerLoginSchema>) {
    const parsed = customerLoginSchema.parse(input);
    const userDocument = await getUserByEmail(parsed.email);

    if (!userDocument) {
      throw new AppError("Email ou mot de passe invalide.", 401);
    }

    const user = serializeDocument<User>(userDocument);

    if (!compareSync(parsed.password, user.passwordHash)) {
      throw new AppError("Email ou mot de passe invalide.", 401);
    }

    return createSessionPayload(user);
  },

  async getSessionUser(userId: string) {
    const userDocument = await getUserById(userId);

    if (!userDocument) {
      return null;
    }

    return toAuthUser(serializeDocument<User>(userDocument));
  },

  async requestPasswordReset(
    input: z.input<typeof forgotPasswordSchema>,
    origin: string,
  ) {
    const parsed = forgotPasswordSchema.parse(input);
    const userDocument = await getUserByEmail(parsed.email);
    let resetUrl: string | undefined;

    if (userDocument) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = hashResetToken(token);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

      await updateUserById(String(userDocument._id), {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
      });

      resetUrl = `${origin}/reinitialiser-mot-de-passe?token=${token}`;
      console.info(`Lien de réinitialisation pour ${parsed.email}: ${resetUrl}`);
    }

    return {
      sent: true,
      resetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
    };
  },

  async resetPassword(input: z.input<typeof resetPasswordSchema>) {
    const parsed = resetPasswordSchema.parse(input);
    const userDocument = await getUserByResetTokenHash(
      hashResetToken(parsed.token),
    );

    if (!userDocument) {
      throw new AppError("Le lien de réinitialisation est invalide ou expiré.", 400);
    }

    const updatedUser = await updateUserPasswordAndClearReset(
      String(userDocument._id),
      hashSync(parsed.password, 12),
    );

    if (!updatedUser) {
      throw new AppError("Impossible de réinitialiser le mot de passe.", 500);
    }

    return {
      reset: true,
    };
  },

  async authenticateOAuth(profile: OAuthProfile) {
    const email = profile.email.toLowerCase();
    const existingUser = await getUserByEmail(email);
    const providerPayload = {
      ...(profile.provider === "google" ? { googleId: profile.googleId } : {}),
      ...(profile.provider === "facebook"
        ? { facebookId: profile.facebookId }
        : {}),
      firstName: profile.firstName?.trim() || normalizeNameFromEmail(email),
      lastName: profile.lastName?.trim() || "Client",
      email,
      role: "customer" as const,
      isActive: true,
    };

    if (existingUser) {
      const updatedUser = await attachProviderToUser(
        email,
        profile.provider,
        providerPayload,
      );

      if (!updatedUser) {
        throw new AppError("Impossible de connecter ce compte.", 500);
      }

      return createSessionPayload(serializeDocument<User>(updatedUser));
    }

    const createdUser = await createUser({
      ...providerPayload,
      passwordHash: createUnusablePasswordHash(),
      authProviders: [profile.provider],
    });

    return createSessionPayload(serializeDocument<User>(createdUser));
  },
};
