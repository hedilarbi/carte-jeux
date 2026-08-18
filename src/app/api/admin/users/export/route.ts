import type { NextRequest } from "next/server";

import { canExportUsersCsv, getAdminApiSession } from "@/lib/auth/admin";
import { errorResponse, handleRouteError } from "@/lib/utils/api-response";
import { userService } from "@/services/user.service";

const CSV_HEADER = [
  "Prénom",
  "Nom",
  "Email",
  "Téléphone",
  "Rôle",
  "Statut",
  "Connexion",
  "Créé le",
].join(";");

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function roleLabel(role: string) {
  switch (role) {
    case "admin":
      return "Admin";
    case "guest":
      return "Invité";
    default:
      return "Client";
  }
}

function providerLabel(provider: string) {
  switch (provider) {
    case "facebook":
      return "Facebook";
    case "google":
      return "Google";
    default:
      return "Email";
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminApiSession(request);

    if (!session) {
      return errorResponse("Non autorisé.", 401);
    }

    if (!(await canExportUsersCsv(session))) {
      return errorResponse(
        "Vous n'êtes pas autorisé à exporter les utilisateurs.",
        403,
      );
    }

    const users = await userService.listForCsvExport();
    const rows = users.map((user) =>
      [
        user.firstName ?? "",
        user.lastName ?? "",
        user.email ?? "",
        user.phone ?? "",
        roleLabel(user.role),
        user.isActive ? "Actif" : "Inactif",
        (user.role === "guest" ? [] : (user.authProviders ?? []))
          .map(providerLabel)
          .join(", "),
        user.createdAt ? new Date(user.createdAt).toISOString() : "",
      ]
        .map((cell) => escapeCsvCell(String(cell)))
        .join(";"),
    );
    const csv = `\uFEFF${[CSV_HEADER, ...rows].join("\r\n")}`;

    return new Response(csv, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition":
          'attachment; filename="export-utilisateurs-playsdepot.csv"',
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
