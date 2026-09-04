// app/api/news/similar/route.ts
import { fetchSimilarArticlesServer } from "@/utils/serverNewsAPI";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "3", 10);
  const language = searchParams.get("language") || "ja";

  if (!category) {
    return NextResponse.json(
      { error: "category is required" },
      { status: 400 },
    );
  }

  try {
    const articles = await fetchSimilarArticlesServer(
      category,
      limit,
      language,
    );
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("❌ [API Route] /api/news/similar error:", error);
    return NextResponse.json({ articles: [] }, { status: 500 });
  }
}
