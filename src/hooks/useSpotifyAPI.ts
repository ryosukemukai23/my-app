// hooks/useSpotifyAPI.ts
"use client";

import {
  SpotifyAuthToken,
  SpotifyPlaylist,
  SpotifySearchResponse,
  SpotifyTrack,
} from "@/types/SpotifyTrack";
import {
  canMakeRequest,
  getCachedData,
  incrementRequestCount,
  setCachedData,
} from "@/utils/cacheUtils";
import {useEffect, useState} from "react";

const SPOTIFY_CLIENT_ID = "b841d62e84514046927fbab2aaf74721";
const SPOTIFY_CLIENT_SECRET = "2020177856d443f8bac89e0858d1c5e8";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

// Spotifyアクセストークン取得（キャッシュ付き）
const getSpotifyToken = async (): Promise<string | null> => {
  // トークンをキャッシュから取得
  const cachedToken = getCachedData<{token: string; expiresAt: number}>(
    "spotify_token"
  );

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        )}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Failed to get Spotify token");
    }

    const data: SpotifyAuthToken = await response.json();

    // トークンをキャッシュ（有効期限付き）
    const expiresAt = Date.now() + data.expires_in * 1000;
    setCachedData("spotify_token", {token: data.access_token, expiresAt});

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
      // キャッシュキーを生成
      const cacheKey = `spotify_search_${keyword}_${limit}`;

      // キャッシュを確認
      const cached = getCachedData<SpotifyTrack[]>(cacheKey);
      if (cached) {
        setTracks(cached);
        setLoading(false);
        return;
      }

      // リクエスト制限をチェック
      if (!canMakeRequest()) {
        console.warn("⚠️ Daily API limit reached. Using cached data only.");
        setError("API limit reached");
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
          }
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        incrementRequestCount();

        const data: SpotifySearchResponse = await response.json();
        const tracks = data.tracks.items || [];

        setTracks(tracks);

        // キャッシュに保存
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

  return {tracks, loading, error};
};

// 国別トップチャート取得（検索APIを使用）
export const useSpotifyCountryChart = (
  countryCode: string = "JP",
  limit: number = 10
) => {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryCode) return;

    const fetchChart = async () => {
      // キャッシュキーを生成
      const cacheKey = `spotify_chart_${countryCode}_${limit}`;

      // キャッシュを確認
      const cached = getCachedData<SpotifyPlaylist>(cacheKey);
      if (cached) {
        setPlaylist(cached);
        setLoading(false);
        return;
      }

      // リクエスト制限をチェック
      if (!canMakeRequest()) {
        console.warn("⚠️ Daily API limit reached. Using cached data only.");
        setError("API limit reached");
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

        // 検索APIを使用して人気プレイリストを取得
        const searchQuery =
          countryCode === "JP" ? "japan top hits" : `${countryCode} top hits`;

        const searchResponse = await fetch(
          `${SPOTIFY_API_BASE_URL}/search?q=${encodeURIComponent(
            searchQuery
          )}&type=playlist&market=${countryCode}&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!searchResponse.ok) {
          throw new Error(`Search API Error: ${searchResponse.status}`);
        }

        incrementRequestCount();

        const searchData = await searchResponse.json();

        if (searchData.playlists?.items?.[0]) {
          const playlistId = searchData.playlists.items[0].id;

          // プレイリスト詳細取得
          const playlistResponse = await fetch(
            `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!playlistResponse.ok) {
            throw new Error(`Playlist API Error: ${playlistResponse.status}`);
          }

          incrementRequestCount();

          const playlistData: SpotifyPlaylist = await playlistResponse.json();

          setPlaylist(playlistData);

          // キャッシュに保存
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

  return {playlist, loading, error};
};
