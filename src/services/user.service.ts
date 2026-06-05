import { hashSync } from "bcryptjs";

import { AppError } from "@/lib/utils/app-error";
import { serializeDocument } from "@/lib/utils/serialization";
import {
  createUser,
  deleteUserById,
  getUserByEmail,
  getUserById,
  listUsers,
  type UserListFilters,
  updateUserById,
  upsertUserByEmail,
} from "@/repositories/user.repository";
import { assertObjectId } from "@/lib/utils/object-id";
import type { AuthProvider, User, UserRole } from "@/types/entities";

export interface AdminUserListItem {
  _id: string;
  authProviders: AuthProvider[];
  createdAt: string;
  email: string;
  firstName: string;
  isActive: boolean;
  lastName: string;
  phone?: string;
  role: UserRole;
  updatedAt: string;
}

interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: "admin" | "customer";
  isActive?: boolean;
}

interface EnsureGuestUserInput {
  email: string;
  firstName: string;
  lastName: string;
}

function toAdminUserListItem(user: User): AdminUserListItem {
  return {
    _id: user._id,
    authProviders:
      user.role === "guest"
        ? []
        : user.authProviders?.length
          ? user.authProviders
          : ["local"],
    createdAt: user.createdAt,
    email: user.email,
    firstName: user.firstName,
    isActive: user.isActive,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    updatedAt: user.updatedAt,
  };
}

export const userService = {
  async list(filters: UserListFilters = {}) {
    const result = await listUsers(filters);
    const users = serializeDocument<User[]>(result.items);

    return {
      ...result,
      items: users.map(toAdminUserListItem),
    };
  },

  async ensureGuestForOrder(input: EnsureGuestUserInput) {
    const email = input.email.toLowerCase();
    const existing = await getUserByEmail(email);

    if (existing && existing.role !== "guest") {
      return serializeDocument<User>(existing);
    }

    if (existing) {
      const updated = await updateUserById(String(existing._id), {
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        role: "guest",
        isActive: true,
        authProviders: [],
      });

      return serializeDocument<User>(updated ?? existing);
    }

    const created = await createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      role: "guest",
      isActive: true,
      authProviders: [],
    });

    return serializeDocument<User>(created);
  },

  async delete(id: string) {
    assertObjectId(id, "Identifiant utilisateur");

    const existing = await getUserById(id);

    if (!existing) {
      throw new AppError("Utilisateur introuvable.", 404);
    }

    const deleted = await deleteUserById(id);

    if (!deleted) {
      throw new AppError("Utilisateur introuvable.", 404);
    }

    return {
      success: true,
    };
  },

  async ensureSeedUser(input: CreateUserInput) {
    const existing = await getUserByEmail(input.email);

    if (existing) {
      return serializeDocument<User>(existing);
    }

    if (input.password.length < 8) {
      throw new AppError("Le mot de passe seed doit contenir au moins 8 caractères.", 400);
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
      throw new AppError("Impossible d'initialiser l'utilisateur administrateur.", 500);
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
