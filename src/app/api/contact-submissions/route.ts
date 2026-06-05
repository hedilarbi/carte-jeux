import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import {
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { contactSubmissionService } from "@/services/contact-submission.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await contactSubmissionService.create(body);

    revalidatePath("/admin/soumissions");

    return successResponse(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
