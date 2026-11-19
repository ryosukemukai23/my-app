// app/api/sportsdb/route.ts
import {NextRequest, NextResponse} from "next/server";

// ブラウザから thesportsdb.com を直接呼ぶと CORS・広告ブロッカー等で失敗するため、
// サーバー側で中継する。
// キーは環境変数 SPORTSDB_API_KEY で上書き可能。未設定なら公式の無料テストキーを使う。
const SPORTSDB_API_KEY = process.env.SPORTSDB_API_KEY || "123";
const SPORTSDB_BASE_URL = `https://www.thesportsdb.com/api/v1/json/${SPORTSDB_API_KEY}`;

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const type = sp.get("type");

  let path: string | null = null;

  switch (type) {
    case "next": {
      const id = sp.get("id");
      if (id && /^\d+$/.test(id)) {
        path = `eventsnextleague.php?id=${id}`;
      }
      break;
    }
    case "past": {
      const id = sp.get("id");
      const season = sp.get("season");
      if (id && /^\d+$/.test(id) && season && /^[\w-]+$/.test(season)) {
        path = `eventsseason.php?id=${id}&s=${encodeURIComponent(season)}`;
      }
      break;
    }
    case "search": {
      const q = sp.get("q");
      if (q && q.trim().length >= 3) {
        path = `searchevents.php?e=${encodeURIComponent(q)}`;
      }
      break;
    }
    case "teams": {
      const q = sp.get("q");
      if (q && q.trim().length >= 3) {
        path = `searchteams.php?t=${encodeURIComponent(q)}`;
      }
      break;
    }
  }

  if (!path) {
    return NextResponse.json({error: "Invalid parameters"}, {status: 400});
  }

  try {
    const response = await fetch(`${SPORTSDB_BASE_URL}/${path}`, {
      next: {revalidate: 3600},
    });

    if (!response.ok) {
      console.error("❌ [API Route] SportsDB error:", response.status, path);
      return NextResponse.json({error: "Upstream error"}, {status: 502});
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("❌ [API Route] /api/sportsdb error:", error);
    return NextResponse.json({error: "Fetch failed"}, {status: 502});
  }
}
