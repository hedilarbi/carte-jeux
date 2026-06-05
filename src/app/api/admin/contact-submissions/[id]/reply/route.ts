import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { contactSubmissionService } from "@/services/contact-submission.service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminApiSession(request);

  if (!session) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await contactSubmissionService.reply(id, body, session.email);

    revalidatePath("/admin/soumissions");
    revalidatePath(`/admin/soumissions/${id}`);

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
