import {
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { userService } from "@/services/user.service";

export async function POST() {
  try {
    const data = await userService.ensureBootstrapAdmin();
    return successResponse(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
