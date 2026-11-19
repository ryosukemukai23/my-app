// app/api/itunes/search/route.ts

import {NextRequest, NextResponse} from "next/server";

const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";
const APPLE_CHARTS_URL = "https://rss.applemarketingtools.com/api/v2";

// ✅ 外部APIが応答しなくても永遠に待たない（5秒で打ち切る）
const FETCH_TIMEOUT_MS = 5000;

const fetchWithTimeout = (url: string, options: RequestInit & {next?: {revalidate: number}} = {}) =>
  fetch(url, {
    ...options,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

interface ItunesRawTrack {
  trackId: number;
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
  previewUrl?: string;
  collectionId?: number;
  collectionName?: string;
}

/**
 * 文字列を検索用に正規化
 */
function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[「」『』【】［］\[\]（）()]/g, " ")
    .replace(/[、。,.!！?？:：;；]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * iTunes検索結果を整理する。
 *
 * 優先順位:
 * 1. 同じ曲の重複を除外
 * 2. 同じアルバムばかりにならないようにする
 * 3. 同じアーティストばかりにならないようにする
 * 4. それでも足りなければ残りから補完
 */
function diversifyTracks(results: ItunesRawTrack[], limit: number) {
  const validResults = results.filter(
    (track) =>
      track &&
      typeof track.trackId === "number" &&
      track.trackName &&
      track.artistName &&
      track.artworkUrl100 &&
      track.trackViewUrl,
  );

  const usedTrackIds = new Set<number>();
  const usedArtists = new Set<string>();
  const usedCollections = new Set<string>();

  const selected: ItunesRawTrack[] = [];

  /*
   * 第1段階
   *
   * アーティストもアルバムも重複しないものを優先。
   */
  for (const track of validResults) {
    if (selected.length >= limit) {
      break;
    }

    if (usedTrackIds.has(track.trackId)) {
      continue;
    }

    const artistKey = normalizeText(track.artistName || "");

    const collectionKey =
      track.collectionId != null ? String(track.collectionId) : normalizeText(track.collectionName || "");

    if (usedArtists.has(artistKey)) {
      continue;
    }

    if (collectionKey && usedCollections.has(collectionKey)) {
      continue;
    }

    selected.push(track);

    usedTrackIds.add(track.trackId);

    if (artistKey) {
      usedArtists.add(artistKey);
    }

    if (collectionKey) {
      usedCollections.add(collectionKey);
    }
  }

  /*
   * 第2段階
   *
   * 5件に足りなければ、アーティスト重複は許可。
   * ただし同じ曲は出さない。
   */
  if (selected.length < limit) {
    for (const track of validResults) {
      if (selected.length >= limit) {
        break;
      }

      if (usedTrackIds.has(track.trackId)) {
        continue;
      }

      const collectionKey =
        track.collectionId != null ? String(track.collectionId) : normalizeText(track.collectionName || "");

      /*
       * 可能なら同じアルバムはまだ避ける。
       */
      if (collectionKey && usedCollections.has(collectionKey)) {
        continue;
      }

      selected.push(track);
      usedTrackIds.add(track.trackId);

      if (collectionKey) {
        usedCollections.add(collectionKey);
      }
    }
  }

  /*
   * 第3段階
   *
   * それでも足りない場合は残りをそのまま補完。
   */
  if (selected.length < limit) {
    for (const track of validResults) {
      if (selected.length >= limit) {
        break;
      }

      if (usedTrackIds.has(track.trackId)) {
        continue;
      }

      selected.push(track);
      usedTrackIds.add(track.trackId);
    }
  }

  return selected.slice(0, limit);
}

/**
 * 国コードを決定する。
 * 1. クエリの ?country=XX（2文字のアルファベット）があればそれを優先
 * 2. なければアクセス元の国を推定（Vercel / Cloudflare のヘッダー）
 * 3. それも取れなければ "JP"
 */
function detectCountry(request: NextRequest, countryParam?: string | null): string {
  if (countryParam && /^[A-Za-z]{2}$/.test(countryParam.trim())) {
    return countryParam.trim().toUpperCase();
  }

  const raw = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "JP";

  const country = raw.toUpperCase();

  return /^[A-Z]{2}$/.test(country) ? country : "JP";
}

/**
 * Apple公式の国別最新チャート（Most Played）を取得する。
 * 認証不要の公開エンドポイント。
 */
async function fetchCountryTopSongs(country: string): Promise<ItunesRawTrack[]> {
  // ✅ 件数は固定。limitごとにURLが変わるとキャッシュが分散するため
  const url = `${APPLE_CHARTS_URL}/${country.toLowerCase()}/music/most-played/30/songs.json`;

  try {
    const res = await fetchWithTimeout(url, {
      next: {
        revalidate: 3600,
      },
    });

    if (!res.ok) {
      console.error("❌ [iTunes Proxy] Chart fetch failed:", res.status);
      return [];
    }

    const data = await res.json();
    const results = data?.feed?.results ?? [];

    return results.map(
      (item: any, i: number): ItunesRawTrack => ({
        trackId: Number(item.id) || i,
        trackName: item.name,
        artistName: item.artistName,
        artworkUrl100: item.artworkUrl100,
        trackViewUrl: item.url,
      }),
    );
  } catch (error) {
    console.error("❌ [iTunes Proxy] Chart fetch error:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);

  const rawTerm = searchParams.get("term") || "";
  const rawLimit = searchParams.get("limit") || "5";

  const term = rawTerm.trim();

  /*
   * limitを安全な範囲に制限
   */
  const requestedLimit = Number.parseInt(rawLimit, 10);

  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 20) : 5;

  const country = detectCountry(request, searchParams.get("country"));

  /*
   * チャートへのフォールバック処理をまとめたヘルパー。
   * 検索語が無い/ヒットしない/エラー時に共通で使う。
   */
  const respondWithChart = async () => {
    const chartTracks = await fetchCountryTopSongs(country);
    const results = diversifyTracks(chartTracks, limit);

    console.log(`🎵 [iTunes Proxy] Chart fallback (${country}): ${results.length}`);

    return NextResponse.json({
      resultCount: results.length,
      results,
      source: "chart",
    });
  };

  /*
   * ✅ 検索語は50文字までに短縮。
   * 記事タイトル全文だと0件になりやすく、無駄な往復が増える。
   */
  const searchTerm = normalizeText(term).slice(0, 50);

  if (!searchTerm) {
    return respondWithChart();
  }

  const params = new URLSearchParams({
    term: searchTerm,

    /*
     * 多めに取得してからこちらで整理する。
     */
    limit: Math.max(limit * 4, 20).toString(),

    media: "music",
    entity: "song",
    country,
    explicit: "No",
  });

  try {
    console.log(`🎵 [iTunes Proxy] Search: "${searchTerm}"`);

    const response = await fetchWithTimeout(`${ITUNES_SEARCH_URL}?${params.toString()}`, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      const body = await response.text();

      console.error("❌ [iTunes Proxy] API Error:", response.status, body.slice(0, 500));

      return respondWithChart();
    }

    const data = await response.json();

    const rawResults: ItunesRawTrack[] = Array.isArray(data.results) ? data.results : [];

    const results = diversifyTracks(rawResults, limit);

    // タイトル検索でヒットしなければ国別チャートにフォールバック
    if (results.length === 0) {
      return respondWithChart();
    }

    console.log(`🎵 [iTunes Proxy] Results: ${results.length}`);

    return NextResponse.json({
      resultCount: results.length,
      results,
      source: "search",
    });
  } catch (error) {
    console.error("❌ [iTunes Proxy] Fetch error:", error);

    return respondWithChart();
  }
}
