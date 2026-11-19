// hooks/useItunesAPI.ts
"use client";

import {getCachedData, setCachedData} from "@/utils/cacheUtils";
import {useEffect, useState} from "react";

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

// ✅ route.ts 側は最大 5秒 × 2回（検索→チャート）なので、それより少し長く待つ
const CLIENT_TIMEOUT_MS = 12000;

export const useItunesSearch = (keyword: string, limit: number = 5) => {
  const [tracks, setTracks] = useState<ItunesTrack[]>([]);
  const [source, setSource] = useState<"search" | "chart">("search");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalizedKeyword = keyword.trim();
    const controller = new AbortController();
    let cancelled = false;

    // ✅ 応答が返らなくても、一定時間で必ず打ち切る
    const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    const fetchTracks = async () => {
      const cacheKey = normalizedKeyword
        ? `itunes_search_v4_${normalizedKeyword.toLowerCase().replace(/\s+/g, " ")}_${limit}`
        : `itunes_chart_v4_${limit}`;

      const cached = getCachedData<CachedItunesData>(cacheKey);

      // 古い配列キャッシュ・空のキャッシュは使わない
      if (cached && !Array.isArray(cached) && cached.tracks?.length > 0) {
        setTracks(cached.tracks);
        setSource(cached.source);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          term: normalizedKeyword,
          limit: Math.max(limit * 4, 20).toString(),
        });

        const response = await fetch(`/api/itunes/search?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: ItunesSearchResponse = await response.json();

        if (cancelled) {
          return;
        }

        const results = Array.isArray(data.results) ? data.results.slice(0, limit) : [];
        const resultSource = data.source || "search";

        setTracks(results);
        setSource(resultSource);

        // ✅ 空の結果はキャッシュしない（24時間空のままになるのを防ぐ）
        if (results.length > 0) {
          setCachedData(cacheKey, {tracks: results, source: resultSource});
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        const isTimeout = err instanceof DOMException && err.name === "AbortError";
        setError(isTimeout ? "Timeout" : err instanceof Error ? err.message : "Failed to fetch tracks");
        setTracks([]);
      } finally {
        clearTimeout(timeoutId);
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTracks();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [keyword, limit]);

  return {
    tracks,
    source,
    loading,
    error,
  };
};
