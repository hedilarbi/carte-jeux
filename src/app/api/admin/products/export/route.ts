import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import { errorResponse, handleRouteError } from "@/lib/utils/api-response";
import { productService } from "@/services/product.service";

const PRODUCT_BASE_URL = "https://playsdepot.com/produits";

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const products = await productService.listForCsvExport();
    const rows = products.map((product) =>
      [
        escapeCsvCell(product.title),
        escapeCsvCell(`${PRODUCT_BASE_URL}/${product.slug}`),
      ].join(";"),
    );
    const csv = `\uFEFF${["Nom du produit;URL", ...rows].join("\r\n")}`;

    return new Response(csv, {
      headers: {
        "Content-Disposition":
          'attachment; filename="export-produits-playsdepot.csv"',
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
