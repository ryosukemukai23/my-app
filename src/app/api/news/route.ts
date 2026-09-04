// app/api/news/route.ts
import { fetchNewsServer } from "@/utils/serverNewsAPI";
import { NextRequest, NextResponse } from "next/server";

// クライアント(useNewsAPI.ts)からはこのRouteを叩く。
// サーバー側のfetchNewsServerを経由することで、
// - APIキーをクライアントに露出させない
// - Next.jsのData Cache（revalidate）を全訪問者で共有し、
//   実質のAPIコール回数をカテゴリ×言語の組み合わせ数程度に抑える
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") || undefined;
  const language = searchParams.get("language") || "ja";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";

  try {
    const result = await fetchNewsServer({
      category,
      language,
      page,
      limit,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ [API Route] /api/news error:", error);
    return NextResponse.json({ articles: [], totalPages: 1 }, { status: 500 });
  }
}
