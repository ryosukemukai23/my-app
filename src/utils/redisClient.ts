// utils/redisClient.ts
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

declare global {
  var __redisClient: Redis | undefined;

  var __redisDownUntil: number | undefined;
}

// ✅ 接続失敗後、この時間はRedisを一切呼ばない（毎リクエストの待ちを防ぐ）
const COOLDOWN_MS = 60 * 1000;

const createClient = (): Redis | null => {
  if (!REDIS_URL) {
    console.warn("⚠️ [Redis] REDIS_URL が未設定のためキャッシュを無効化します");
    return null;
  }

  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
    commandTimeout: 1000,
    enableOfflineQueue: false, // ✅ 未接続時にコマンドを溜めず、即エラーにする
    retryStrategy: (times) => (times > 2 ? null : 500), // ✅ 再接続は2回まで
    lazyConnect: false,
  });

  client.on("error", (err) => {
    // ✅ 失敗時はクールダウンに入る。ログは1行だけ。
    if (!global.__redisDownUntil || Date.now() > global.__redisDownUntil) {
      console.error("❌ [Redis] Connection error:", err.message);
    }
    global.__redisDownUntil = Date.now() + COOLDOWN_MS;
  });

  client.on("ready", () => {
    global.__redisDownUntil = undefined;
  });

  return client;
};

const getClient = (): Redis | null => {
  if (global.__redisClient) return global.__redisClient;

  const client = createClient();
  if (client) global.__redisClient = client;

  return client;
};

const isAvailable = (): boolean => {
  if (!REDIS_URL) return false;
  return !(global.__redisDownUntil && Date.now() < global.__redisDownUntil);
};

// ✅ 記事データの永続キャッシュ用ヘルパー
const ARTICLE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30日

export const cacheArticle = async (articleId: string, data: unknown) => {
  if (!isAvailable()) return;

  const client = getClient();
  if (!client) return;

  try {
    await client.set(`article:${articleId}`, JSON.stringify(data), "EX", ARTICLE_TTL_SECONDS);
  } catch {
    global.__redisDownUntil = Date.now() + COOLDOWN_MS;
  }
};

export const getCachedArticle = async <T>(articleId: string): Promise<T | null> => {
  if (!isAvailable()) return null;

  const client = getClient();
  if (!client) return null;

  try {
    const raw = await client.get(`article:${articleId}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    global.__redisDownUntil = Date.now() + COOLDOWN_MS;
    return null;
  }
};
