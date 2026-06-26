import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import { errorResponse, handleRouteError, successResponse } from "@/lib/utils/api-response";
import { getFormDataFile } from "@/lib/utils/form-data";
import { productCsvImportService } from "@/services/product-csv-import.service";

const MAX_CSV_FILE_SIZE = 2 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const formData = await request.formData();
    const file = getFormDataFile(formData, "file");

    if (!file) {
      return errorResponse("Sélectionnez un fichier CSV.", 422);
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return errorResponse("Le fichier doit avoir l’extension .csv.", 422);
    }

    if (file.size > MAX_CSV_FILE_SIZE) {
      return errorResponse("Le fichier CSV ne peut pas dépasser 2 Mo.", 422);
    }

    const data = await productCsvImportService.import(await file.text());

    if (data.createdCount > 0) {
      revalidatePath("/admin");
      revalidatePath("/admin/products");
      revalidatePath("/admin/orders");
    }

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
