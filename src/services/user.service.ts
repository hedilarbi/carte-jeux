import { hashSync } from "bcryptjs";

import { AppError } from "@/lib/utils/app-error";
import { serializeDocument } from "@/lib/utils/serialization";
import {
  createUser,
  getUserByEmail,
  upsertUserByEmail,
} from "@/repositories/user.repository";
import type { User } from "@/types/entities";

interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: "admin" | "customer";
  isActive?: boolean;
}

export const userService = {
  async ensureSeedUser(input: CreateUserInput) {
    const existing = await getUserByEmail(input.email);

    if (existing) {
      return serializeDocument<User>(existing);
    }

    if (input.password.length < 8) {
      throw new AppError("Seed user password must be at least 8 characters.", 400);
    }

    const created = await createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      passwordHash: hashSync(input.password, 12),
      role: input.role ?? "admin",
      isActive: input.isActive ?? true,
    });

    return serializeDocument<User>(created);
  },

  async ensureBootstrapAdmin() {
    const email = "admin@gmail.com";
    const existing = await getUserByEmail(email);
    const nextUser = await upsertUserByEmail(email, {
      firstName: "Admin",
      lastName: "User",
      email,
      passwordHash: hashSync("123123", 12),
      role: "admin",
      isActive: true,
    });

    if (!nextUser) {
      throw new AppError("Unable to bootstrap admin user.", 500);
    }

    return {
      alreadyExisted: Boolean(existing),
      user: {
        _id: String(nextUser._id),
        firstName: nextUser.firstName,
        lastName: nextUser.lastName,
        email: nextUser.email,
        role: nextUser.role,
        isActive: nextUser.isActive,
      },
      credentials: {
        email,
        password: "123123",
      },
    };
  },
};
