// utils/serverNewsAPI.ts
import { Article, NewsAPIResponse } from "@/types/Article";
import { cache } from "react";

const NEWS_API_KEY = "REMOVED";
const NEWS_API_BASE_URL = "https://api.thenewsapi.com/v1/news";
const PLACEHOLDER_IMAGE =
  "https://placehold.jp/cccccc/ffffff/800x500.png?text=newsportal";

// ✅ 1日1回相当のキャッシュ（無料プランのAPI上限対策）
const CACHE_REVALIDATE_SECONDS = 86400; // 24時間

interface FetchNewsParams {
  category?: string;
  language?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// ✅ 画像URLを正規化
const normalizeArticleImage = (article: Article): Article => {
  return {
    ...article,
    image_url: article.image_url || PLACEHOLDER_IMAGE,
  };
};

// ✅ React cache でサーバー側キャッシュを実装
export const fetchNewsServer = cache(
  async ({
    category = "general",
    language = "ja",
    page = 1,
    limit = 10,
    search = "",
  }: FetchNewsParams = {}): Promise<{
    articles: Article[];
    totalPages: number;
  }> => {
    try {
      const params = new URLSearchParams({
        api_token: NEWS_API_KEY,
        locale: language,
        limit: limit.toString(),
        page: page.toString(),
      });

      if (category !== "top" && category !== "general") {
        params.append("categories", category);
      }
      if (search) {
        params.append("search", search);
      }

      console.log("🔍 [Server] Fetching news:", {
        category,
        language,
        page,
        limit,
        search,
      });

      const response = await fetch(
        `${NEWS_API_BASE_URL}/all?${params.toString()}`,
        {
          next: { revalidate: CACHE_REVALIDATE_SECONDS },
        },
      );

      if (!response.ok) {
        console.error("❌ [Server] API Error:", response.status);
        return { articles: [], totalPages: 1 };
      }

      const data: NewsAPIResponse = await response.json();
      const articles = (data.data || []).map(normalizeArticleImage);
      const totalPages = data.meta ? Math.ceil(data.meta.found / limit) : 1;

      console.log("✅ [Server] Fetched news:", articles.length, "articles");

      return { articles, totalPages };
    } catch (error) {
      console.error("❌ [Server] News API error:", error);
      return { articles: [], totalPages: 1 };
    }
  },
);

// ✅ 単一記事取得（記事詳細ページ用）— UUID指定の専用エンドポイントを使用
export const fetchArticleByIdServer = cache(
  async (
    articleId: string,
    language: string = "ja",
  ): Promise<Article | null> => {
    try {
      const params = new URLSearchParams({ api_token: NEWS_API_KEY });

      console.log("🔍 [Server] Fetching article by uuid:", articleId);

      const response = await fetch(
        `${NEWS_API_BASE_URL}/uuid/${articleId}?${params.toString()}`,
        {
          next: { revalidate: CACHE_REVALIDATE_SECONDS },
        },
      );

      if (!response.ok) {
        console.error(
          "❌ [Server] UUID fetch error:",
          response.status,
          "for id:",
          articleId,
        );
        return null;
      }

      const article: Article = await response.json();

      console.log("✅ [Server] Found article:", article.title);

      return normalizeArticleImage(article);
    } catch (error) {
      console.error("❌ [Server] Error fetching article by uuid:", error);
      return null;
    }
  },
);

// ✅ 類似記事取得
export const fetchSimilarArticlesServer = cache(
  async (
    category: string,
    limit: number = 3,
    language: string = "ja",
  ): Promise<Article[]> => {
    try {
      const params = new URLSearchParams({
        api_token: NEWS_API_KEY,
        locale: language,
        categories: category,
        limit: limit.toString(),
        sort: "published_at",
      });

      console.log(
        "🔍 [Server] Fetching similar articles for category:",
        category,
      );

      const response = await fetch(
        `${NEWS_API_BASE_URL}/all?${params.toString()}`,
        {
          next: { revalidate: CACHE_REVALIDATE_SECONDS },
        },
      );

      if (!response.ok) {
        return [];
      }

      const data: NewsAPIResponse = await response.json();
      const articles = (data.data || []).map(normalizeArticleImage);

      console.log("✅ [Server] Fetched similar articles:", articles.length);

      return articles;
    } catch (error) {
      console.error("❌ [Server] Error fetching similar articles:", error);
      return [];
    }
  },
);
