import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import {
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { gtaPreorderService } from "@/services/gta-preorder.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await gtaPreorderService.create(body);

    revalidatePath("/admin/precommandes");

    return successResponse(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
