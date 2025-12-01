// utils/apiUtils.ts

/**
 * APIレスポンスのキャッシュ管理
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * キャッシュの有効期限（ミリ秒）
 * デフォルト: 24時間
 */
const CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * キャッシュからデータを取得
 * @param key キャッシュキー
 * @returns キャッシュされたデータまたはnull
 */
export const getCache = <T>(key: string): T | null => {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  const now = Date.now();
  const isExpired = now - entry.timestamp > CACHE_DURATION;

  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
};

/**
 * キャッシュにデータを保存
 * @param key キャッシュキー
 * @param data 保存するデータ
 */
export const setCache = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * キャッシュをクリア
 * @param key 特定のキー（省略時は全てクリア）
 */
export const clearCache = (key?: string): void => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

/**
 * APIエラーハンドリング
 * @param error エラーオブジェクト
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
export const handleAPIError = (error: unknown): string => {
  if (error instanceof Error) {
    // ネットワークエラー
    if (error.message.includes("Failed to fetch")) {
      return "ネットワークエラーが発生しました。インターネット接続を確認してください。";
    }

    // タイムアウト
    if (error.message.includes("timeout")) {
      return "リクエストがタイムアウトしました。もう一度お試しください。";
    }

    // その他のエラー
    return error.message;
  }

  return "エラーが発生しました。もう一度お試しください。";
};

/**
 * URLパラメータを構築
 * @param params パラメータオブジェクト
 * @returns URLSearchParams
 */
export const buildQueryParams = (
  params: Record<string, string | number | boolean>
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams;
};

/**
 * API リクエストのリトライ処理
 * @param fn リトライする関数
 * @param maxRetries 最大リトライ回数
 * @param delay リトライ間隔（ミリ秒）
 * @returns 関数の戻り値
 */
export const retryRequest = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
};

/**
 * レスポンスのバリデーション
 * @param response Fetchレスポンス
 * @returns バリデーション済みレスポンス
 */
export const validateResponse = async (
  response: Response
): Promise<Response> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response;
};

/**
 * 画像URLのバリデーション
 * @param url 画像URL
 * @returns 有効な画像URLまたはデフォルト画像
 */
export const validateImageUrl = (url: string | null | undefined): string => {
  if (!url || url === "") {
    return "/images/no-image.png"; // デフォルト画像
  }

  try {
    new URL(url);
    return url;
  } catch {
    return "/images/no-image.png";
  }
};
