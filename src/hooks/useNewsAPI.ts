// hooks/useNewsAPI.ts
"use client";

import { Article } from "@/types/Article";
import { useCallback, useEffect, useState } from "react";

interface UseNewsAPIParams {
  category?: string;
  language?: string;
  page?: number;
  limit?: number;
  search?: string;
}

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
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        language,
        page: page.toString(),
        limit: limit.toString(),
      });
      if (category !== "top") params.set("category", category);
      if (search) params.set("search", search);

      const response = await fetch(`/api/news?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: { articles: Article[]; totalPages: number } =
        await response.json();

      setArticles(data.articles);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("❌ News API error:", err);
      setArticles([]);
      setError(err instanceof Error ? err.message : "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  }, [category, language, page, limit, search]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, loading, error, totalPages, refetch: fetchNews };
};

// ✅ 類似記事取得（エラー時に画面を壊さないよう安全設計に改良）
export const useSimilarArticles = (category: string, limit: number = 3) => {
  const [similarArticles, setSimilarArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) {
      return;
    }

    const fetchSimilarArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          category,
          limit: limit.toString(),
        });

        const response = await fetch(`/api/news/similar?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: { articles: Article[] } = await response.json();
        setSimilarArticles(data.articles);
      } catch (err) {
        console.warn("⚠️ 類似記事の取得をスキップしました:", err);
        setSimilarArticles([]);
        // setError をあえて設定しないことで、余計なエラー枠の表示を防ぐ
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarArticles();
  }, [category, limit]);

  return { similarArticles, loading, error };
};
