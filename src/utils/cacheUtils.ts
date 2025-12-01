// utils/cacheUtils.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  requestCount: number;
}

interface DailyRequestTracker {
  date: string;
  count: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間
const MAX_DAILY_REQUESTS = 95; // 安全マージンを持たせて95に設定
const REQUEST_TRACKER_KEY = "api_request_tracker";

/**
 * ブラウザ環境かチェック
 */
const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
};

/**
 * 今日のリクエスト数を取得
 */
export const getTodayRequestCount = (): number => {
  if (!isBrowser()) return 0;

  try {
    const tracker = localStorage.getItem(REQUEST_TRACKER_KEY);
    if (!tracker) return 0;

    const data: DailyRequestTracker = JSON.parse(tracker);
    const today = new Date().toDateString();

    // 日付が変わっていればリセット
    if (data.date !== today) {
      localStorage.setItem(
        REQUEST_TRACKER_KEY,
        JSON.stringify({date: today, count: 0})
      );
      return 0;
    }

    return data.count;
  } catch {
    return 0;
  }
};

/**
 * リクエスト数を増やす（上限チェック付き）
 */
export const incrementRequestCount = (): boolean => {
  if (!isBrowser()) return true; // SSR時は常にtrue

  try {
    const currentCount = getTodayRequestCount();

    // 上限チェック（二重安全策）
    if (currentCount >= MAX_DAILY_REQUESTS) {
      console.error(
        `🚫 Cannot increment: Already at limit (${currentCount}/${MAX_DAILY_REQUESTS})`
      );
      return false;
    }

    const today = new Date().toDateString();
    const tracker = localStorage.getItem(REQUEST_TRACKER_KEY);

    if (!tracker) {
      localStorage.setItem(
        REQUEST_TRACKER_KEY,
        JSON.stringify({date: today, count: 1})
      );
      console.log(`✅ Request count: 1/${MAX_DAILY_REQUESTS}`);
      return true;
    }

    const data: DailyRequestTracker = JSON.parse(tracker);

    if (data.date !== today) {
      // 新しい日
      localStorage.setItem(
        REQUEST_TRACKER_KEY,
        JSON.stringify({date: today, count: 1})
      );
      console.log(`🆕 New day! Request count: 1/${MAX_DAILY_REQUESTS}`);
      return true;
    } else {
      // 同じ日
      const newCount = data.count + 1;

      if (newCount > MAX_DAILY_REQUESTS) {
        console.error(
          `🚫 Cannot increment: Would exceed limit (${newCount}/${MAX_DAILY_REQUESTS})`
        );
        return false;
      }

      data.count = newCount;
      localStorage.setItem(REQUEST_TRACKER_KEY, JSON.stringify(data));
      console.log(`✅ Request count: ${newCount}/${MAX_DAILY_REQUESTS}`);
      return true;
    }
  } catch (error) {
    console.error("Failed to increment request count:", error);
    return false;
  }
};

/**
 * リクエスト制限をチェック
 */
export const canMakeRequest = (): boolean => {
  if (!isBrowser()) return true; // SSR時は常にtrue

  const count = getTodayRequestCount();
  const canRequest = count < MAX_DAILY_REQUESTS;

  if (!canRequest) {
    console.error(
      `🚫 API Request Blocked: ${count}/${MAX_DAILY_REQUESTS} requests used today`
    );
    console.log("💡 Using cached data only. Limit resets at midnight.");
  }

  return canRequest;
};

/**
 * キャッシュから取得
 */
export const getCachedData = <T>(key: string): T | null => {
  if (!isBrowser()) return null;

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // キャッシュが有効期限内か確認
    if (now - entry.timestamp < CACHE_DURATION) {
      console.log(`✅ Using cached data for: ${key}`);
      return entry.data;
    }

    // 期限切れのキャッシュを削除
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
};

/**
 * キャッシュに保存
 */
export const setCachedData = <T>(key: string, data: T): void => {
  if (!isBrowser()) return;

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      requestCount: getTodayRequestCount(),
    };

    localStorage.setItem(key, JSON.stringify(entry));
    console.log(`💾 Cached data for: ${key}`);
  } catch (error) {
    console.error("Cache write error:", error);
  }
};

/**
 * キャッシュを削除
 */
export const clearCache = (key?: string): void => {
  if (!isBrowser()) return;

  if (key) {
    localStorage.removeItem(key);
  } else {
    // 全キャッシュをクリア（リクエストトラッカーは除く）
    const keys = Object.keys(localStorage);
    keys.forEach((k) => {
      if (k !== REQUEST_TRACKER_KEY) {
        localStorage.removeItem(k);
      }
    });
  }
};

/**
 * リクエスト統計を表示
 */
export const getRequestStats = () => {
  if (!isBrowser()) {
    return {
      count: 0,
      remaining: MAX_DAILY_REQUESTS,
      total: MAX_DAILY_REQUESTS,
      percentage: 0,
    };
  }

  const count = getTodayRequestCount();
  const remaining = MAX_DAILY_REQUESTS - count;
  const percentage = Math.round((count / MAX_DAILY_REQUESTS) * 100);

  console.log(`📊 API Request Stats:`);
  console.log(`   Today: ${count}/${MAX_DAILY_REQUESTS} (${percentage}%)`);
  console.log(`   Remaining: ${remaining}`);

  if (remaining < 10) {
    console.warn(`⚠️ WARNING: Only ${remaining} requests remaining today!`);
  }

  return {count, remaining, total: MAX_DAILY_REQUESTS, percentage};
};
