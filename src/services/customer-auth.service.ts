import { compareSync, hashSync } from "bcryptjs";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";
import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { serializeDocument } from "@/lib/utils/serialization";
import {
  customerLoginSchema,
  customerProfileCompletionSchema,
  customerRegisterSchema,
  customerRegistrationOtpResendSchema,
  customerRegistrationOtpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import {
  deletePendingCustomerRegistrationByEmail,
  getPendingCustomerRegistrationByEmail,
  incrementPendingCustomerRegistrationAttempts,
  updatePendingCustomerRegistrationByEmail,
  upsertPendingCustomerRegistrationByEmail,
} from "@/repositories/pending-customer-registration.repository";
import {
  attachProviderToUser,
  createUser,
  getUserByEmail,
  getUserById,
  getUserByResetTokenHash,
  updateUserById,
  updateUserPasswordAndClearReset,
} from "@/repositories/user.repository";
import { emailService } from "@/services/email.service";
import type { AuthProvider, AuthUser, User } from "@/types/entities";
import type { UserRecord } from "@/models/user.model";

const REGISTRATION_OTP_EXPIRES_IN_MINUTES = 10;
const REGISTRATION_OTP_EXPIRES_IN_MS =
  REGISTRATION_OTP_EXPIRES_IN_MINUTES * 60 * 1000;
const REGISTRATION_OTP_RESEND_INTERVAL_MS = 60 * 1000;
const REGISTRATION_OTP_MAX_ATTEMPTS = 5;

type OAuthProfile = {
  email: string;
  facebookId?: string;
  firstName?: string;
  googleId?: string;
  lastName?: string;
  provider: Extract<AuthProvider, "google" | "facebook">;
};

type OAuthAuthenticationResult = {
  isNewUser: boolean;
  requiresProfileCompletion: boolean;
  user: AuthUser;
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
    phone: user.phone,
    profileCompletedAt: user.profileCompletedAt,
    role: user.role,
    authProviders: user.authProviders?.length ? user.authProviders : ["local"],
  };
}

function requiresProfileCompletion(user: User | AuthUser) {
  return !(
    user.firstName?.trim() &&
    user.lastName?.trim() &&
    user.phone?.trim()
  );
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getOtpHashSecret() {
  return (
    process.env.CUSTOMER_SESSION_SECRET?.trim() ||
    process.env.AUTH_SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_JWT_SECRET?.trim() ||
    "playsdepot-local-otp-secret"
  );
}

function hashOtp(email: string, otp: string) {
  return createHash("sha256")
    .update(`${email.toLowerCase()}:${otp}:${getOtpHashSecret()}`)
    .digest("hex");
}

function isMatchingOtpHash(expectedHash: string, actualHash: string) {
  const expected = Buffer.from(expectedHash, "hex");
  const actual = Buffer.from(actualHash, "hex");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function generateRegistrationOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
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

    if (existingUser && existingUser.role !== "guest") {
      throw new AppError("Un compte existe déjà avec cet email.", 409);
    }

    const otp = generateRegistrationOtp();
    const now = new Date();
    const otpExpiresAt = new Date(
      now.getTime() + REGISTRATION_OTP_EXPIRES_IN_MS,
    );
    const resendAvailableAt = new Date(
      now.getTime() + REGISTRATION_OTP_RESEND_INTERVAL_MS,
    );

    await upsertPendingCustomerRegistrationByEmail(parsed.email, {
      email: parsed.email,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      phone: parsed.phone,
      passwordHash: hashSync(parsed.password, 12),
      otpHash: hashOtp(parsed.email, otp),
      otpExpiresAt,
      resendAvailableAt,
      attemptCount: 0,
    });

    await emailService.sendRegistrationOtp({
      email: parsed.email,
      expiresInMinutes: REGISTRATION_OTP_EXPIRES_IN_MINUTES,
      otp,
    });

    return {
      email: parsed.email,
      otpExpiresAt: otpExpiresAt.toISOString(),
      resendAvailableAt: resendAvailableAt.toISOString(),
      requiresOtp: true,
    };
  },

  async resendRegistrationOtp(
    input: z.input<typeof customerRegistrationOtpResendSchema>,
  ) {
    const parsed = customerRegistrationOtpResendSchema.parse(input);
    const existingUser = await getUserByEmail(parsed.email);

    if (existingUser && existingUser.role !== "guest") {
      throw new AppError("Un compte existe déjà avec cet email.", 409);
    }

    const pendingRegistration =
      await getPendingCustomerRegistrationByEmail(parsed.email);

    if (!pendingRegistration) {
      throw new AppError("Aucune inscription en attente pour cet email.", 404);
    }

    const now = new Date();
    const resendAvailableAt = new Date(pendingRegistration.resendAvailableAt);

    if (resendAvailableAt.getTime() > now.getTime()) {
      const remainingSeconds = Math.ceil(
        (resendAvailableAt.getTime() - now.getTime()) / 1000,
      );

      throw new AppError(
        `Veuillez patienter ${remainingSeconds} secondes avant de renvoyer un code.`,
        429,
        { retryAfterSeconds: remainingSeconds },
      );
    }

    const otp = generateRegistrationOtp();
    const otpExpiresAt = new Date(
      now.getTime() + REGISTRATION_OTP_EXPIRES_IN_MS,
    );
    const nextResendAvailableAt = new Date(
      now.getTime() + REGISTRATION_OTP_RESEND_INTERVAL_MS,
    );

    await updatePendingCustomerRegistrationByEmail(parsed.email, {
      otpHash: hashOtp(parsed.email, otp),
      otpExpiresAt,
      resendAvailableAt: nextResendAvailableAt,
      attemptCount: 0,
    });

    await emailService.sendRegistrationOtp({
      email: parsed.email,
      expiresInMinutes: REGISTRATION_OTP_EXPIRES_IN_MINUTES,
      otp,
    });

    return {
      email: parsed.email,
      otpExpiresAt: otpExpiresAt.toISOString(),
      resendAvailableAt: nextResendAvailableAt.toISOString(),
      resent: true,
    };
  },

  async verifyRegistrationOtp(
    input: z.input<typeof customerRegistrationOtpVerifySchema>,
  ) {
    const parsed = customerRegistrationOtpVerifySchema.parse(input);
    const existingUser = await getUserByEmail(parsed.email);

    if (existingUser && existingUser.role !== "guest") {
      throw new AppError("Un compte existe déjà avec cet email.", 409);
    }

    const pendingRegistration =
      await getPendingCustomerRegistrationByEmail(parsed.email);

    if (!pendingRegistration) {
      throw new AppError("Le code est invalide ou expiré.", 400);
    }

    if (new Date(pendingRegistration.otpExpiresAt).getTime() < Date.now()) {
      await deletePendingCustomerRegistrationByEmail(parsed.email);
      throw new AppError("Le code est expiré. Veuillez recommencer.", 400);
    }

    if (pendingRegistration.attemptCount >= REGISTRATION_OTP_MAX_ATTEMPTS) {
      throw new AppError(
        "Trop de tentatives. Veuillez demander un nouveau code.",
        429,
      );
    }

    const actualHash = hashOtp(parsed.email, parsed.otp);

    if (!isMatchingOtpHash(pendingRegistration.otpHash, actualHash)) {
      await incrementPendingCustomerRegistrationAttempts(parsed.email);
      throw new AppError("Code OTP invalide.", 400);
    }

    const userPayload: Partial<UserRecord> = {
      firstName:
        pendingRegistration.firstName?.trim() ||
        normalizeNameFromEmail(parsed.email),
      lastName: pendingRegistration.lastName?.trim() || "Client",
      phone: pendingRegistration.phone?.trim(),
      email: parsed.email,
      passwordHash: pendingRegistration.passwordHash,
      role: "customer",
      isActive: true,
      authProviders: ["local"],
      profileCompletedAt: new Date(),
    };
    const userDocument =
      existingUser?.role === "guest"
        ? await updateUserById(String(existingUser._id), userPayload)
        : await createUser(userPayload);

    if (!userDocument) {
      throw new AppError("Impossible de créer le compte client.", 500);
    }

    await deletePendingCustomerRegistrationByEmail(parsed.email);

    return createSessionPayload(serializeDocument<User>(userDocument));
  },

  async login(input: z.input<typeof customerLoginSchema>) {
    const parsed = customerLoginSchema.parse(input);
    const userDocument = await getUserByEmail(parsed.email);

    if (!userDocument) {
      throw new AppError("Email ou mot de passe invalide.", 401);
    }

    const user = serializeDocument<User>(userDocument);

    if (!user.passwordHash || !compareSync(parsed.password, user.passwordHash)) {
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

  async completeProfile(
    userId: string,
    input: z.input<typeof customerProfileCompletionSchema>,
  ) {
    const parsed = customerProfileCompletionSchema.parse(input);
    const updatedUser = await updateUserById(userId, {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      phone: parsed.phone,
      profileCompletedAt: new Date(),
    });

    if (!updatedUser) {
      throw new AppError("Compte introuvable.", 404);
    }

    return createSessionPayload(serializeDocument<User>(updatedUser));
  },

  async requestPasswordReset(
    input: z.input<typeof forgotPasswordSchema>,
    origin: string,
  ) {
    const parsed = forgotPasswordSchema.parse(input);
    const userDocument = await getUserByEmail(parsed.email);
    let resetUrl: string | undefined;

    if (userDocument && userDocument.role === "customer") {
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

  async authenticateOAuth(
    profile: OAuthProfile,
  ): Promise<OAuthAuthenticationResult> {
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

    if (existingUser?.role === "admin") {
      throw new AppError("Ce compte ne peut pas se connecter côté client.", 403);
    }

    if (existingUser) {
      const updatedUser = await attachProviderToUser(
        email,
        profile.provider,
        providerPayload,
      );

      if (!updatedUser) {
        throw new AppError("Impossible de connecter ce compte.", 500);
      }

      const user = serializeDocument<User>(updatedUser);
      const sessionUser = await createSessionPayload(user);

      return {
        isNewUser: false,
        requiresProfileCompletion: requiresProfileCompletion(user),
        user: sessionUser,
      };
    }

    const createdUser = await createUser({
      ...providerPayload,
      passwordHash: createUnusablePasswordHash(),
      authProviders: [profile.provider],
    });

    const user = serializeDocument<User>(createdUser);
    const sessionUser = await createSessionPayload(user);

    return {
      isNewUser: true,
      requiresProfileCompletion: requiresProfileCompletion(user),
      user: sessionUser,
    };
  },
};
