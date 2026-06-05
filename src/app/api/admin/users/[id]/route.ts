import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { userService } from "@/services/user.service";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { id } = await context.params;
    const data = await userService.delete(id);

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
