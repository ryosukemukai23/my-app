// app/api/rakuten/search/route.ts
import { NextRequest, NextResponse } from "next/server";

const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID || "";
const RAKUTEN_ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY || "";
const RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID || "";
const RAKUTEN_ORIGIN = process.env.RAKUTEN_ORIGIN || "";
const RAKUTEN_API_BASE_URL =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";

// ✅ 2026年仕様変更対応：新エンドポイント＋accessKey＋Origin/Referer一致が必須
//   （旧: app.rakuten.co.jp/... + applicationIdのみ、では503 Authentication
//   service errorになる）

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1500; // 429対策。1.5秒以上の間隔を確保

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

  if (!RAKUTEN_APP_ID || !RAKUTEN_ACCESS_KEY || !RAKUTEN_ORIGIN) {
    console.error(
      "❌ [Rakuten Proxy] Missing required env: RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY / RAKUTEN_ORIGIN",
    );
    return NextResponse.json(
      { error: "Rakuten API is not configured" },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID,
    accessKey: RAKUTEN_ACCESS_KEY, // ✅ 新仕様で必須
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
      {
        headers: {
          Origin: RAKUTEN_ORIGIN, // ✅ 登録した「許可されたWebサイト」と一致させる
          Referer: `${RAKUTEN_ORIGIN}/`,
          "User-Agent": "news-portal/1.0",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      const body = await response.text(); // ✅ 本文を握り潰さずログに残す
      console.error(
        "❌ [Rakuten Proxy] API Error:",
        response.status,
        body.slice(0, 1000),
      );
      return NextResponse.json(
        { error: `Rakuten API Error: ${response.status}`, detail: body },
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
