// hooks/useItunesAPI.ts
"use client";

import { getCachedData, setCachedData } from "@/utils/cacheUtils";
import { useEffect, useState } from "react";

export interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  trackViewUrl: string;
  previewUrl?: string;
  collectionId?: number;
  collectionName?: string;
}

interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesTrack[];
  source?: "search" | "chart";
}

// キャッシュ用の型を定義
interface CachedItunesData {
  tracks: ItunesTrack[];
  source: "search" | "chart";
}

export const useItunesSearch = (keyword: string, limit: number = 5) => {
  const [tracks, setTracks] = useState<ItunesTrack[]>([]);
  // 追加: sourceの状態管理
  const [source, setSource] = useState<"search" | "chart">("search");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalizedKeyword = keyword.trim();
    let cancelled = false;

    const fetchTracks = async () => {
      // キャッシュ構造が変わるため、キーを v4 に更新
      const cacheKey = normalizedKeyword
        ? `itunes_search_v4_${normalizedKeyword
            .toLowerCase()
            .replace(/\s+/g, " ")}_${limit}`
        : `itunes_chart_v4_${limit}`;

      const cached = getCachedData<CachedItunesData>(cacheKey);

      if (cached && !Array.isArray(cached)) {
        // 念のため古い配列キャッシュを弾く
        if (!cancelled) {
          setTracks(cached.tracks);
          setSource(cached.source);
          setLoading(false);
          setError(null);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      try {
        const params = new URLSearchParams({
          term: normalizedKeyword,
          limit: Math.max(limit * 4, 20).toString(),
        });

        const response = await fetch(
          `/api/itunes/search?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: ItunesSearchResponse = await response.json();

        if (cancelled) {
          return;
        }

        const results = Array.isArray(data.results)
          ? data.results.slice(0, limit)
          : [];
        const resultSource = data.source || "search";

        setTracks(results);
        setSource(resultSource); // 取得したsourceをセット

        // オブジェクトとしてキャッシュを保存
        setCachedData(cacheKey, { tracks: results, source: resultSource });
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to fetch tracks");
        setTracks([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTracks();

    return () => {
      cancelled = true;
    };
  }, [keyword, limit]);

  // 返り値に source を追加
  return {
    tracks,
    source,
    loading,
    error,
  };
};
