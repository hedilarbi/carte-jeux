import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { contactSubmissionService } from "@/services/contact-submission.service";
import type { ContactSubmissionStatus } from "@/types/entities";

function resolveStatus(value: string | null): ContactSubmissionStatus | undefined {
  if (value === "new" || value === "replied") {
    return value;
  }

  return undefined;
}

export async function GET(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const { searchParams } = request.nextUrl;
    const data = await contactSubmissionService.list({
      limit: searchParams.get("limit"),
      page: searchParams.get("page"),
      search: searchParams.get("search"),
      status: resolveStatus(searchParams.get("status")),
    });

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
