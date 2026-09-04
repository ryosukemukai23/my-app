// utils/redisClient.ts
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL as string;

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | undefined;
}

// ✅ 開発中のNext.jsホットリロードで接続が重複生成されるのを防ぐため、
//   globalに保持して使い回す（本番では毎回新規生成でも実害はない）
export const redis: Redis =
  global.__redisClient ??
  new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
  });

if (process.env.NODE_ENV !== "production") {
  global.__redisClient = redis;
}

redis.on("error", (err) => {
  console.error("❌ [Redis] Connection error:", err);
});

// ✅ 記事データの永続キャッシュ用ヘルパー
const ARTICLE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30日。無期限にすると際限なく肥大化するため上限を設ける

export const cacheArticle = async (articleId: string, data: unknown) => {
  try {
    await redis.set(
      `article:${articleId}`,
      JSON.stringify(data),
      "EX",
      ARTICLE_TTL_SECONDS,
    );
  } catch (err) {
    // ✅ Redis障害時もサイト全体を止めないよう、ログのみに留める
    console.error("❌ [Redis] Failed to cache article:", articleId, err);
  }
};

export const getCachedArticle = async <T>(
  articleId: string,
): Promise<T | null> => {
  try {
    const raw = await redis.get(`article:${articleId}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.error("❌ [Redis] Failed to read article:", articleId, err);
    return null;
  }
};
