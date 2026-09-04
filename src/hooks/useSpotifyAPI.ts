// hooks/useSpotifyAPI.ts
"use client";

import {
  SpotifyPlaylist,
  SpotifySearchResponse,
  SpotifyTrack,
} from "@/types/SpotifyTrack";
import { getCachedData, setCachedData } from "@/utils/cacheUtils";
import { useEffect, useState } from "react";

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

// ⚠️ 以前はここでCLIENT_ID/CLIENT_SECRETを直書きし、ブラウザから直接
//   https://accounts.spotify.com/api/token にBasic認証で問い合わせていた。
//   これは"use client"ファイルなのでシークレットがそのままJSバンドルに
//   含まれ、誰でも盗める状態になっていた。
//   既存の app/api/spotify/token/route.ts がサーバー側で安全にトークンを
//   発行しているので、クライアントはそれを呼ぶだけにする。
const getSpotifyToken = async (): Promise<string | null> => {
  const cachedToken = getCachedData<{ token: string; expiresAt: number }>(
    "spotify_token",
  );

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    const response = await fetch("/api/spotify/token");

    if (!response.ok) {
      throw new Error("Failed to get Spotify token");
    }

    const data: { access_token: string; expires_in: number } =
      await response.json();

    const expiresAt = Date.now() + data.expires_in * 1000;
    setCachedData("spotify_token", { token: data.access_token, expiresAt });

    return data.access_token;
  } catch (err) {
    console.error("Spotify token error:", err);
    return null;
  }
};

// キーワードで音楽検索
export const useSpotifySearch = (keyword: string, limit: number = 5) => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!keyword) {
      setTracks([]);
      return;
    }

    const fetchTracks = async () => {
      const cacheKey = `spotify_search_${keyword}_${limit}`;

      const cached = getCachedData<SpotifyTrack[]>(cacheKey);
      if (cached) {
        setTracks(cached);
        setLoading(false);
        return;
      }

      // ⚠️ 以前は他の無関係なAPI（Rakuten/Weather/SportsDB）と共有の
      //   canMakeRequest()カウンターでここをブロックしていたため、
      //   他のウィジェットの利用量でSpotify検索まで止まっていた。撤去。

      setLoading(true);
      setError(null);

      try {
        const token = await getSpotifyToken();
        if (!token) {
          throw new Error("Failed to authenticate with Spotify");
        }

        const params = new URLSearchParams({
          q: keyword,
          type: "track",
          limit: limit.toString(),
          market: "JP",
        });

        const response = await fetch(
          `${SPOTIFY_API_BASE_URL}/search?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: SpotifySearchResponse = await response.json();
        const tracks = data.tracks.items || [];

        setTracks(tracks);
        setCachedData(cacheKey, tracks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tracks");
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [keyword, limit]);

  return { tracks, loading, error };
};

// 国別トップチャート取得（検索APIを使用）
export const useSpotifyCountryChart = (
  countryCode: string = "JP",
  limit: number = 10,
) => {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryCode) return;

    const fetchChart = async () => {
      const cacheKey = `spotify_chart_${countryCode}_${limit}`;

      const cached = getCachedData<SpotifyPlaylist>(cacheKey);
      if (cached) {
        setPlaylist(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await getSpotifyToken();
        if (!token) {
          throw new Error("Failed to authenticate with Spotify");
        }

        const searchQuery =
          countryCode === "JP" ? "japan top hits" : `${countryCode} top hits`;

        const searchResponse = await fetch(
          `${SPOTIFY_API_BASE_URL}/search?q=${encodeURIComponent(
            searchQuery,
          )}&type=playlist&market=${countryCode}&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!searchResponse.ok) {
          throw new Error(`Search API Error: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();

        if (searchData.playlists?.items?.[0]) {
          const playlistId = searchData.playlists.items[0].id;

          const playlistResponse = await fetch(
            `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!playlistResponse.ok) {
            throw new Error(`Playlist API Error: ${playlistResponse.status}`);
          }

          const playlistData: SpotifyPlaylist = await playlistResponse.json();

          setPlaylist(playlistData);
          setCachedData(cacheKey, playlistData);
        } else {
          throw new Error("No playlists found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch chart");
        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [countryCode, limit]);

  return { playlist, loading, error };
};
