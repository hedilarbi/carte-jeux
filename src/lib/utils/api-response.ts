import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { isAppError } from "@/lib/utils/app-error";

export function successResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    init,
  );
}

export function errorResponse(
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        details,
      },
    },
    { status },
  );
}

export function parseBooleanParam(value: string | null) {
  if (value === null) {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return errorResponse(
      error.issues[0]?.message ?? "Validation failed.",
      422,
      error.issues,
    );
  }

  if (isAppError(error)) {
    return errorResponse(error.message, error.statusCode, error.details);
  }

  console.error(error);
  return errorResponse("Internal server error.", 500);
}
