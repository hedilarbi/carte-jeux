import { handleRouteError, successResponse } from "@/lib/utils/api-response";
import { homeService } from "@/services/home.service";

export async function GET() {
  try {
    const data = await homeService.getHomePageContent();
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
