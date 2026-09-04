// hooks/useSportsDBAPI.ts
"use client";

import {
  SportsDBEvent,
  SportsDBResponse,
  SportsDBTeam,
} from "@/types/SportsDBEvent";
import { getCachedData, setCachedData } from "@/utils/cacheUtils";
import { useEffect, useState } from "react";

// API key
const SPORTSDB_API_KEY = "3"; // 無料版のキー
const SPORTSDB_API_BASE_URL = `https://www.thesportsdb.com/api/v1/json/${SPORTSDB_API_KEY}`;

// 主要サッカーリーグID
const MAJOR_SOCCER_LEAGUES = {
  premierLeague: "4328",
  laLiga: "4335",
  bundesliga: "4331",
  serieA: "4332",
  ligue1: "4334",
};

// 次のイベント取得（リーグID指定） - メイン機能
// ⚠️ `enabled` を追加。以前はこのフックが呼ばれると常にfetchしてしまい、
//   結果として useSportsDBAPI 経由で「スポーツカテゴリでないページ」
//   でも毎回 thesportsdb.com にリクエストが飛んでいた。
export const useSportsDBNextEvents = (
  leagueId: string = MAJOR_SOCCER_LEAGUES.premierLeague,
  enabled: boolean = true,
) => {
  const [events, setEvents] = useState<SportsDBEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchNextEvents = async () => {
      const cacheKey = `sportsdb_next_${leagueId}`;

      const cached = getCachedData<SportsDBEvent[]>(cacheKey);
      if (cached && cached.length > 0) {
        console.log("✅ Using cached next events data");
        setEvents(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = `${SPORTSDB_API_BASE_URL}/eventsnextleague.php?id=${leagueId}`;
        console.log("📅 Fetching next events:", url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: SportsDBResponse = await response.json();
        const events = data.events || [];

        console.log("✅ Next events received:", events.length, "events");
        setEvents(events);

        if (events.length > 0) {
          setCachedData(cacheKey, events);
        }
      } catch (err) {
        console.error("❌ Failed to fetch next events:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch next events",
        );
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNextEvents();
  }, [leagueId, enabled]);

  return { events, loading, error };
};

// 過去のイベント取得（リーグID + シーズン指定）
export const useSportsDBPastEvents = (leagueId: string, season: string) => {
  const [events, setEvents] = useState<SportsDBEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leagueId || !season) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchPastEvents = async () => {
      const cacheKey = `sportsdb_past_${leagueId}_${season}`;

      const cached = getCachedData<SportsDBEvent[]>(cacheKey);
      if (cached && cached.length > 0) {
        console.log("✅ Using cached past events data");
        setEvents(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = `${SPORTSDB_API_BASE_URL}/eventsseason.php?id=${leagueId}&s=${season}`;
        console.log("📅 Fetching past events:", url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: SportsDBResponse = await response.json();
        const events = (data.events || []).filter(
          (e) => e.intHomeScore && e.intAwayScore,
        );

        console.log("✅ Past events received:", events.length, "events");
        setEvents(events.slice(0, 15));

        if (events.length > 0) {
          setCachedData(cacheKey, events.slice(0, 15));
        }
      } catch (err) {
        console.error("❌ Failed to fetch past events:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch past events",
        );
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, [leagueId, season]);

  return { events, loading, error };
};

// キーワードでイベント検索（オプション機能）
export const useSportsDBEventSearch = (keyword: string) => {
  const [events, setEvents] = useState<SportsDBEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!keyword || keyword.trim().length < 3) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      const cacheKey = `sportsdb_search_${keyword.toLowerCase()}`;

      const cached = getCachedData<SportsDBEvent[]>(cacheKey);
      if (cached && cached.length > 0) {
        console.log("✅ Using cached search results");
        setEvents(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = `${SPORTSDB_API_BASE_URL}/searchevents.php?e=${encodeURIComponent(keyword)}`;
        console.log("🔍 Searching events:", url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: SportsDBResponse = await response.json();
        const events = data.events || [];

        console.log("✅ Search results:", events.length, "events");
        setEvents(events);

        if (events.length > 0) {
          setCachedData(cacheKey, events);
        }
      } catch (err) {
        console.error("❌ Search failed:", err);
        setError(err instanceof Error ? err.message : "Search failed");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [keyword]);

  return { events, loading, error };
};

// チーム検索
export const useSportsDBTeamSearch = (teamName: string) => {
  const [teams, setTeams] = useState<SportsDBTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamName || teamName.trim().length < 3) {
      setTeams([]);
      setLoading(false);
      return;
    }

    const fetchTeams = async () => {
      const cacheKey = `sportsdb_teams_${teamName.toLowerCase()}`;

      const cached = getCachedData<SportsDBTeam[]>(cacheKey);
      if (cached && cached.length > 0) {
        console.log("✅ Using cached teams data");
        setTeams(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = `${SPORTSDB_API_BASE_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`;
        console.log("🔍 Searching teams:", url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: SportsDBResponse = await response.json();
        const teams = data.teams || [];

        console.log("✅ Teams found:", teams.length);
        setTeams(teams);

        if (teams.length > 0) {
          setCachedData(cacheKey, teams);
        }
      } catch (err) {
        console.error("❌ Team search failed:", err);
        setError(err instanceof Error ? err.message : "Team search failed");
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [teamName]);

  return { teams, loading, error };
};

// 統合スポーツ情報フック
// ⚠️ `enabled` パラメータを追加。呼び出し側（MuiSidebar.tsx）で
//   スポーツカテゴリの時だけ true を渡すことで、他カテゴリでの
//   無駄なthesportsdb.comへのリクエストを止める。
//   MuiSidebar.tsx側の呼び出しを
//     useSportsDBAPI(shouldShowSports ? sportsKeyword : "")
//   から
//     useSportsDBAPI(sportsKeyword, shouldShowSports)
//   に変更してください。
export const useSportsDBAPI = (keyword?: string, enabled: boolean = true) => {
  const nextEvents = useSportsDBNextEvents(
    MAJOR_SOCCER_LEAGUES.premierLeague,
    enabled && !keyword,
  );

  const searchEvents = useSportsDBEventSearch(enabled ? keyword || "" : "");

  const events =
    searchEvents.events.length > 0 ? searchEvents.events : nextEvents.events;
  const loading = keyword ? searchEvents.loading : nextEvents.loading;
  const error = keyword ? searchEvents.error : nextEvents.error;

  return {
    events: enabled ? events : [],
    loading: enabled ? loading : false,
    error: enabled ? error : null,
  };
};
