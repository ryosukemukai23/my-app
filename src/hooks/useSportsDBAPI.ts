// hooks/useSportsDBAPI.ts
"use client";

import {SportsDBEvent, SportsDBResponse, SportsDBTeam} from "@/types/SportsDBEvent";
import {getCachedData, setCachedData} from "@/utils/cacheUtils";
import {useEffect, useState} from "react";

// 主要サッカーリーグID
const MAJOR_SOCCER_LEAGUES = {
  premierLeague: "4328",
  laLiga: "4335",
  bundesliga: "4331",
  serieA: "4332",
  ligue1: "4334",
};

// ✅ thesportsdb.com は直接呼ばず、自前の Route Handler 経由で取得する
const fetchFromProxy = async (params: Record<string, string>): Promise<SportsDBResponse> => {
  const qs = new URLSearchParams(params);
  const response = await fetch(`/api/sportsdb?${qs.toString()}`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// 次のイベント取得（リーグID指定） - メイン機能
// `enabled` が false のときは一切 fetch しない。
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
        console.log("📅 Fetching next events:", leagueId);

        const data = await fetchFromProxy({type: "next", id: leagueId});
        const events = data.events || [];

        console.log("✅ Next events received:", events.length, "events");
        setEvents(events);

        if (events.length > 0) {
          setCachedData(cacheKey, events);
        }
      } catch (err) {
        console.warn("⚠️ Failed to fetch next events:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch next events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNextEvents();
  }, [leagueId, enabled]);

  return {events, loading, error};
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
        console.log("📅 Fetching past events:", leagueId, season);

        const data = await fetchFromProxy({
          type: "past",
          id: leagueId,
          season,
        });
        const events = (data.events || []).filter((e) => e.intHomeScore && e.intAwayScore);

        console.log("✅ Past events received:", events.length, "events");
        setEvents(events.slice(0, 15));

        if (events.length > 0) {
          setCachedData(cacheKey, events.slice(0, 15));
        }
      } catch (err) {
        console.warn("⚠️ Failed to fetch past events:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch past events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, [leagueId, season]);

  return {events, loading, error};
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
        console.log("🔍 Searching events:", keyword);

        const data = await fetchFromProxy({type: "search", q: keyword});
        const events = data.events || [];

        console.log("✅ Search results:", events.length, "events");
        setEvents(events);

        if (events.length > 0) {
          setCachedData(cacheKey, events);
        }
      } catch (err) {
        console.warn("⚠️ Search failed:", err);
        setError(err instanceof Error ? err.message : "Search failed");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [keyword]);

  return {events, loading, error};
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
        console.log("🔍 Searching teams:", teamName);

        const data = await fetchFromProxy({type: "teams", q: teamName});
        const teams = data.teams || [];

        console.log("✅ Teams found:", teams.length);
        setTeams(teams);

        if (teams.length > 0) {
          setCachedData(cacheKey, teams);
        }
      } catch (err) {
        console.warn("⚠️ Team search failed:", err);
        setError(err instanceof Error ? err.message : "Team search failed");
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [teamName]);

  return {teams, loading, error};
};

// 統合スポーツ情報フック
// 呼び出し側（MuiSidebar.tsx）は
//   useSportsDBAPI(sportsKeyword, shouldShowSports)
// の形で呼ぶこと。スポーツカテゴリ以外では fetch しない。
export const useSportsDBAPI = (keyword?: string, enabled: boolean = true) => {
  // ✅ 次節は常に取得し、キーワード検索が0件のときのフォールバックにする
  const nextEvents = useSportsDBNextEvents(MAJOR_SOCCER_LEAGUES.premierLeague, enabled);

  const searchEvents = useSportsDBEventSearch(enabled ? keyword || "" : "");

  const hasSearchResult = searchEvents.events.length > 0;
  const events = hasSearchResult ? searchEvents.events : nextEvents.events;
  const loading = nextEvents.loading || searchEvents.loading;
  const error = hasSearchResult ? null : nextEvents.error;

  return {
    events: enabled ? events : [],
    loading: enabled ? loading : false,
    error: enabled ? error : null,
  };
};
