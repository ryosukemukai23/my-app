// utils/serverNewsAPI.ts
import {Article} from "@/types/Article";
import {cache} from "react";

const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY as string;
const NEWSDATA_BASE_URL = "https://newsdata.io/api/1/latest";
const PLACEHOLDER_IMAGE = "https://placehold.jp/cccccc/ffffff/800x500.png?text=newsportal";

const FREE_PLAN_MAX_SIZE = 10;

// 一覧・類似記事のキャッシュ期間（秒）
const LIST_REVALIDATE_SEC = 60 * 60; // 1時間
// 記事詳細のキャッシュ期間（秒）。内容は変わらず、APIの取得可能期間も限られるので長めにする
const ARTICLE_REVALIDATE_SEC = 60 * 60 * 24; // 24時間

const CATEGORY_MAP: Record<string, string | undefined> = {
  top: undefined, // カテゴリ指定なし＝トップニュース扱い
  business: "business",
  tech: "technology",
  technology: "technology",
  sports: "sports",
  entertainment: "entertainment",
  science: "science",
  health: "health",
  politics: "politics",
  world: "world",
  environment: "environment",
  lifestyle: "lifestyle",
  food: "food",
  tourism: "tourism",
  education: "education",
  crime: "crime",
};

interface NewsDataArticle {
  article_id: string;
  title: string;
  link: string;
  description: string | null;
  content: string | null;
  pubDate: string;
  image_url: string | null;
  source_id: string;
  source_name?: string;
  category?: string[];
  language: string;
}

interface NewsDataResponse {
  status: string;
  totalResults?: number;
  results: NewsDataArticle[];
  nextPage?: string | null;
}

interface FetchNewsParams {
  category?: string;
  language?: string;
  cursor?: string;
  page?: string | number;
  limit?: number;
  search?: string;
}

const normalizeArticle = (item: NewsDataArticle): Article => ({
  uuid: item.article_id,
  title: item.title,
  description: item.description || "",
  content: item.content || "",
  image_url: item.image_url || PLACEHOLDER_IMAGE,
  published_at: item.pubDate,
  source: item.source_name || item.source_id,
  categories: item.category || [],
  url: item.link,
  locale: item.language,
});

// 一覧取得
export const fetchNewsServer = cache(
  async ({
    category = "top",
    language = "ja",
    cursor,
    page,
    limit = FREE_PLAN_MAX_SIZE,
    search = "",
  }: FetchNewsParams = {}): Promise<{
    articles: Article[];
    nextPage: string | null;
  }> => {
    try {
      const params = new URLSearchParams({
        apikey: NEWSDATA_API_KEY,
        language,
        size: Math.min(limit, FREE_PLAN_MAX_SIZE).toString(),
      });

      const mappedCategory = CATEGORY_MAP[category.toLowerCase()];

      if (mappedCategory) {
        params.append("category", mappedCategory);
      }

      if (search) {
        params.append("q", search);
      }

      // page または cursor のどちらが指定されても
      // NewsData.io の page パラメータとして追加
      const nextPageToken = page || cursor;

      if (nextPageToken) {
        params.append("page", String(nextPageToken));
      }

      console.log("🔍 [Server] Fetching news (NewsData.io):", {
        category,
        language,
        cursor: nextPageToken,
        search,
      });

      const response = await fetch(`${NEWSDATA_BASE_URL}?${params.toString()}`, {
        next: {revalidate: LIST_REVALIDATE_SEC},
      });

      if (!response.ok) {
        const errorBody = await response.text();

        console.error("❌ [Server] News list fetch error:", response.status, errorBody);

        return {
          articles: [],
          nextPage: null,
        };
      }

      const data: NewsDataResponse = await response.json();
      const articles = (data.results || []).map(normalizeArticle);

      console.log("✅ [Server] Fetched news:", articles.length, "articles");

      return {
        articles,
        nextPage: data.nextPage || null,
      };
    } catch (error) {
      console.error("❌ [Server] News API error:", error);

      return {
        articles: [],
        nextPage: null,
      };
    }
  },
);

// 単一記事取得
export const fetchArticleByIdServer = cache(
  async (articleId: string, language: string = "ja"): Promise<Article | null> => {
    try {
      const params = new URLSearchParams({
        apikey: NEWSDATA_API_KEY,
        id: articleId,
      });

      console.log("🔍 [Server] Fetching article by id:", articleId);

      const response = await fetch(`${NEWSDATA_BASE_URL}?${params.toString()}`, {
        next: {revalidate: ARTICLE_REVALIDATE_SEC},
      });

      if (!response.ok) {
        const errorBody = await response.text();

        console.error("❌ [Server] Article fetch error:", response.status, errorBody, "for id:", articleId);

        return null;
      }

      const data: NewsDataResponse = await response.json();
      const found = data.results?.[0];

      if (!found) {
        console.error("❌ [Server] Article not found (expired from 48h window?):", articleId);

        return null;
      }

      const article = normalizeArticle(found);

      console.log("✅ [Server] Found article via direct fetch:", article.title);

      return article;
    } catch (error) {
      console.error("❌ [Server] Error fetching article by id:", error);

      return null;
    }
  },
);

// 類似記事取得
export const fetchSimilarArticlesServer = cache(
  async (category: string, limit: number = 3, language: string = "ja"): Promise<Article[]> => {
    try {
      const params = new URLSearchParams({
        apikey: NEWSDATA_API_KEY,
        language,
        size: Math.min(limit, FREE_PLAN_MAX_SIZE).toString(),
      });

      const mappedCategory = CATEGORY_MAP[category.toLowerCase()];

      if (mappedCategory) {
        params.append("category", mappedCategory);
      }

      console.log("🔍 [Server] Fetching similar articles for category:", category);

      const response = await fetch(`${NEWSDATA_BASE_URL}?${params.toString()}`, {
        next: {revalidate: LIST_REVALIDATE_SEC},
      });

      if (!response.ok) {
        return [];
      }

      const data: NewsDataResponse = await response.json();
      const articles = (data.results || []).map(normalizeArticle);

      console.log("✅ [Server] Fetched similar articles:", articles.length);

      return articles;
    } catch (error) {
      console.error("❌ [Server] Error fetching similar articles:", error);

      return [];
    }
  },
);
