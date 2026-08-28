// app/api/rakuten/search/route.ts
import { NextRequest, NextResponse } from "next/server";

const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID || "1033789594110679388";
const RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID || "";
const RAKUTEN_API_BASE_URL =
  "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706";

// ✅ サーバーインスタンス内でシンプルに秒間1リクエストへ直列化
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100; // 楽天側の1req/sec制限に対する安全マージン

async function throttle() {
  const now = Date.now();
  const wait = lastRequestTime + MIN_INTERVAL_MS - now;
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastRequestTime = Date.now();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const genreId = searchParams.get("genreId") || "";
  const hits = searchParams.get("hits") || "5";
  const page = searchParams.get("page") || "1";

  if (!keyword && !genreId) {
    return NextResponse.json({ Items: [], hits: 0 });
  }

  const params = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID,
    hits,
    page,
    format: "json",
    sort: "-reviewCount",
  });

  if (keyword) params.append("keyword", keyword);
  if (genreId) params.append("genreId", genreId);
  if (RAKUTEN_AFFILIATE_ID) params.append("affiliateId", RAKUTEN_AFFILIATE_ID);

  await throttle();

  try {
    const response = await fetch(
      `${RAKUTEN_API_BASE_URL}?${params.toString()}`,
      { next: { revalidate: 3600 } }, // 1時間、訪問者間で共有キャッシュ
    );

    if (!response.ok) {
      console.error("❌ [Rakuten Proxy] API Error:", response.status);
      return NextResponse.json(
        { error: `Rakuten API Error: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ [Rakuten Proxy] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Rakuten" },
      { status: 502 },
    );
  }
}
