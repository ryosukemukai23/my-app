// hooks/useNewsAPI.ts
"use client";

import {Article, NewsAPIResponse} from "@/types/Article";
import {
  canMakeRequest,
  getCachedData,
  getRequestStats,
  incrementRequestCount,
  setCachedData,
} from "@/utils/cacheUtils";
import {useCallback, useEffect, useState} from "react";

const NEWS_API_KEY = "REMOVED";
const NEWS_API_BASE_URL = "https://api.thenewsapi.com/v1/news";
const PLACEHOLDER_IMAGE =
  "https://placehold.jp/cccccc/ffffff/800x500.png?text=newsportal";

interface UseNewsAPIParams {
  category?: string;
  language?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// ✅ 画像URLを正規化（ダミー画像を設定）
const normalizeArticleImage = (article: Article): Article => {
  return {
    ...article,
    image_url: article.image_url || PLACEHOLDER_IMAGE,
  };
};

// ✅ 記事配列の画像を正規化
const normalizeArticles = (articles: Article[]): Article[] => {
  return articles.map(normalizeArticleImage);
};

// ✅ 期限切れでもキャッシュを取得（402エラー時用）
const getExpiredCache = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry = JSON.parse(cached);
    console.log("⏰ Using expired cache:", key);
    return entry.data;
  } catch (error) {
    console.error("❌ Expired cache read error:", error);
    return null;
  }
};

export const useNewsAPI = ({
  category = "general",
  language = "ja",
  page = 1,
  limit = 5,
  search = "",
}: UseNewsAPIParams = {}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchNews = useCallback(async () => {
    const cacheKey = `news_${category}_${language}_${page}_${limit}_${search}`;

    // ✅ まず有効なキャッシュを確認
    const cached = getCachedData<{articles: Article[]; totalPages: number}>(
      cacheKey
    );
    if (cached) {
      setArticles(normalizeArticles(cached.articles));
      setTotalPages(cached.totalPages);
      setLoading(false);
      return;
    }

    // ✅ リクエスト制限チェック
    if (!canMakeRequest()) {
      const stats = getRequestStats();
      console.warn("⚠️ API limit reached. Checking for expired cache...");

      const expiredCache = getExpiredCache<{
        articles: Article[];
        totalPages: number;
      }>(cacheKey);
      if (expiredCache) {
        setArticles(normalizeArticles(expiredCache.articles));
        setTotalPages(expiredCache.totalPages);
        setError(
          `APIリミットに達しました (${stats.count}/${stats.total})。キャッシュデータを表示しています。`
        );
      } else {
        setArticles([]);
        setError(
          `Daily API limit reached (${stats.count}/${stats.total}). Please try again tomorrow.`
        );
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        api_token: NEWS_API_KEY,
        locale: language,
        limit: limit.toString(),
        page: page.toString(),
      });
      if (category !== "top") params.append("categories", category);
      if (search) params.append("search", search);

      console.log("🔍 Fetching news:", {category, language, page, limit});

      const response = await fetch(
        `${NEWS_API_BASE_URL}/all?${params.toString()}`
      );

      // ✅ 402エラー時に期限切れキャッシュを使用
      if (!response.ok) {
        if (response.status === 402) {
          console.warn("⚠️ API returned 402. Checking for expired cache...");

          const expiredCache = getExpiredCache<{
            articles: Article[];
            totalPages: number;
          }>(cacheKey);
          if (expiredCache) {
            setArticles(normalizeArticles(expiredCache.articles));
            setTotalPages(expiredCache.totalPages);
            setError(
              "APIリミットに達しました。キャッシュデータを表示しています。"
            );
            setLoading(false);
            return;
          }
        }
        throw new Error(`API Error: ${response.status}`);
      }

      incrementRequestCount();
      getRequestStats();

      const data: NewsAPIResponse = await response.json();
      const articles = data.data || [];
      const totalPages = data.meta ? Math.ceil(data.meta.found / limit) : 1;

      console.log("✅ Fetched news:", articles.length, "articles");

      const normalizedArticles = normalizeArticles(articles);
      setArticles(normalizedArticles);
      setTotalPages(totalPages);
      setCachedData(cacheKey, {articles: normalizedArticles, totalPages});
    } catch (err) {
      console.error("❌ News API error:", err);

      // ✅ エラー時も期限切れキャッシュをチェック
      const expiredCache = getExpiredCache<{
        articles: Article[];
        totalPages: number;
      }>(cacheKey);
      if (expiredCache) {
        setArticles(normalizeArticles(expiredCache.articles));
        setTotalPages(expiredCache.totalPages);
        setError("ネットワークエラー。キャッシュデータを表示しています。");
      } else {
        setArticles([]);
        setError(err instanceof Error ? err.message : "Failed to fetch news");
      }
    } finally {
      setLoading(false);
    }
  }, [category, language, page, limit, search]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {articles, loading, error, totalPages, refetch: fetchNews};
};

// ✅ 類似記事取得（402エラー対応版 + ダミー画像対応）
export const useSimilarArticles = (category: string, limit: number = 3) => {
  const [similarArticles, setSimilarArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) {
      console.warn("⚠️ No category provided to useSimilarArticles");
      return;
    }

    const fetchSimilarArticles = async () => {
      const cacheKey = `similar_category_${category}_${limit}`;

      // ✅ 有効なキャッシュを確認
      const cached = getCachedData<Article[]>(cacheKey);
      if (cached) {
        console.log("✅ Using cached similar articles:", cached.length);
        setSimilarArticles(normalizeArticles(cached));
        setLoading(false);
        return;
      }

      // ✅ リクエスト制限チェック
      if (!canMakeRequest()) {
        console.warn("⚠️ API limit reached for similar articles");

        const expiredCache = getExpiredCache<Article[]>(cacheKey);
        if (expiredCache) {
          setSimilarArticles(normalizeArticles(expiredCache));
          setError("APIリミットに達しました。キャッシュを表示しています。");
        } else {
          setSimilarArticles([]);
          setError("API limit reached");
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          api_token: NEWS_API_KEY,
          categories: category,
          limit: limit.toString(),
          sort: "published_at",
        });

        console.log("🔍 Fetching similar articles for category:", category);

        const response = await fetch(
          `${NEWS_API_BASE_URL}/all?${params.toString()}`
        );

        // ✅ 402エラー時に期限切れキャッシュを使用
        if (!response.ok) {
          if (response.status === 402) {
            console.warn("⚠️ Similar articles API returned 402");

            const expiredCache = getExpiredCache<Article[]>(cacheKey);
            if (expiredCache) {
              setSimilarArticles(normalizeArticles(expiredCache));
              setError("APIリミットに達しました。キャッシュを表示しています。");
              setLoading(false);
              return;
            }
          }
          throw new Error(`API Error: ${response.status}`);
        }

        incrementRequestCount();

        const data: NewsAPIResponse = await response.json();
        const similar: Article[] = data.data || [];

        console.log("✅ Fetched similar articles:", similar.length);

        const normalizedSimilar = normalizeArticles(similar);
        setSimilarArticles(normalizedSimilar);
        setCachedData(cacheKey, normalizedSimilar);
      } catch (err) {
        console.error("❌ Error fetching similar articles:", err);

        // ✅ エラー時も期限切れキャッシュをチェック
        const expiredCache = getExpiredCache<Article[]>(cacheKey);
        if (expiredCache) {
          setSimilarArticles(normalizeArticles(expiredCache));
          setError("ネットワークエラー。キャッシュを表示しています。");
        } else {
          setSimilarArticles([]);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch similar articles"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarArticles();
  }, [category, limit]);

  return {similarArticles, loading, error};
};
