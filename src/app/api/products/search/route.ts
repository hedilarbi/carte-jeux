import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { catalogService } from "@/services/catalog.service";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const content = await catalogService.getProductsPageContent({
      limit: body.limit,
      max: body.max,
      min: body.min,
      page: body.page,
      platform: body.platforms,
      q: body.q,
      region: body.regions,
      search: body.search,
      sort: body.sort,
      type: body.types,
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("Products search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
