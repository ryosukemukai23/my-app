// utils/serverNewsAPI.ts
import { Article, NewsAPIResponse } from "@/types/Article";
import { cache } from "react";

const NEWS_API_KEY = process.env.NEWS_API_KEY as string;
const NEWS_API_BASE_URL = "https://api.thenewsapi.com/v1/news";
const PLACEHOLDER_IMAGE =
  "https://placehold.jp/cccccc/ffffff/800x500.png?text=newsportal";

// ✅ 1日1回相当のキャッシュ（無料プランのAPI上限対策）
// ⚠️ この値は app/[lang]/[category]/page.tsx と
//    app/[lang]/article/[id]/page.tsx の `export const revalidate`
//    と必ず同じ値にすること。ルートセグメント側のrevalidateが
//    ここより短いと、この設定は無視されて短い方が使われる。
const CACHE_REVALIDATE_SECONDS = 86400; // 24時間

// thenewsapi.comの無料プランは1リクエストあたりの結果セットが
// limit × page ≤ 20,000 に制限されている。meta.foundは
// 世界中の一致件数（数百万件になりうる）なので、それをそのまま
// limitで割るとtotalPagesが非現実的な数値になり、存在しない
// ページへのリンクが生成されてしまう。ここで上限をキャップする。
const MAX_RESULT_SET = 20000;

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

// ✅ meta.foundと無料プランの結果セット上限からtotalPagesを計算
const calculateTotalPages = (
  found: number | undefined,
  limit: number,
): number => {
  if (!found || found <= 0) return 1;

  const rawPages = Math.ceil(found / limit);
  const maxPagesByResultSet = Math.floor(MAX_RESULT_SET / limit);

  return Math.max(1, Math.min(rawPages, maxPagesByResultSet));
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
        // ⚠️ /v1/news/all エンドポイントは `locale` を受け付けない
        // （`locale`は headlines / top エンドポイント専用）。
        // 言語を絞り込むには `language` パラメータを使う。
        language: language,
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
      const totalPages = calculateTotalPages(data.meta?.found, limit);

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
        // 402 (usage_limit_reached) と 404 (resource_not_found) を区別する。
        // どちらも従来はnullを返してnotFound()に流れていたため、
        // 「上限到達で記事が取れないだけ」なのに「記事が存在しない」
        // という誤ったUIになっていた。
        if (response.status === 402) {
          console.error(
            "⚠️ [Server] API利用上限に達しました。記事取得不可:",
            articleId,
          );
        } else {
          console.error(
            "❌ [Server] UUID fetch error:",
            response.status,
            "for id:",
            articleId,
          );
        }
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
        // ⚠️ こちらも /all エンドポイントなので `language` を使う（`locale`不可）
        language: language,
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
