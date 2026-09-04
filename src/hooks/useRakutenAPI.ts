// hooks/useRakutenAPI.ts
"use client";

import { RakutenAPIResponse, RakutenProduct } from "@/types/RakutenProduct";
import { getCachedData, setCachedData } from "@/utils/cacheUtils";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseRakutenAPIParams {
  keyword?: string;
  hits?: number;
  page?: number;
  genreId?: string;
  autoFetch?: boolean;
  newsCategory?: string;
}

// ✅ ニュースカテゴリーから楽天検索キーワードを生成（純粋関数として外部に定義）
const getKeywordFromNewsCategory = (category: string): string => {
  const categoryKeywordMap: Record<string, string> = {
    general: "人気",
    business: "ビジネス書",
    tech: "ガジェット",
    technology: "ガジェット",
    science: "科学",
    sports: "スポーツ",
    health: "健康",
    entertainment: "エンタメ",
    politics: "政治",
    world: "旅行",
    food: "グルメ",
    travel: "旅行",
    lifestyle: "ライフスタイル",
    fashion: "ファッション",
    finance: "投資",
    education: "教育",
    environment: "エコ",
    automotive: "自動車",
    "real-estate": "不動産",
    crime: "防犯",
    weather: "アウトドア",

    一般: "人気",
    ビジネス: "ビジネス書",
    テクノロジー: "ガジェット",
    スポーツ: "スポーツ",
    健康: "健康",
  };

  return categoryKeywordMap[category.toLowerCase()] || "人気";
};

export default function useRakutenAPI({
  keyword = "",
  hits = 5,
  page = 1,
  genreId = "",
  autoFetch = true,
  newsCategory = "",
}: UseRakutenAPIParams = {}) {
  const [products, setProducts] = useState<RakutenProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const finalKeyword = useMemo(() => {
    if (keyword) return keyword;
    if (newsCategory) return getKeywordFromNewsCategory(newsCategory);
    return "";
  }, [keyword, newsCategory]);

  const fetchProducts = useCallback(async () => {
    if (!finalKeyword && !genreId) {
      console.log("⏸️ No keyword or genreId provided, skipping fetch");
      setProducts([]);
      setLoading(false);
      return;
    }

    const cacheKey = `rakuten_${finalKeyword}_${genreId}_${hits}_${page}`;

    const cached = getCachedData<{
      products: RakutenProduct[];
      totalCount: number;
    }>(cacheKey);

    if (cached) {
      console.log("✅ Using cached Rakuten products:", cached.products.length);
      setProducts(cached.products);
      setTotalCount(cached.totalCount);
      setLoading(false);
      return;
    }

    // ⚠️ 以前ここに他の無関係なAPI（Spotify/Weather/SportsDB）と共有の
    //   canMakeRequest()ゲートがあった。実際のレート制御は
    //   app/api/rakuten/search/route.ts 側のスロットリング(1.1秒間隔)＋
    //   1時間の共有キャッシュ(revalidate: 3600)で既に行われているため、
    //   このクライアント側の重複した・無関係な制限は撤去した。

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        hits: hits.toString(),
        page: page.toString(),
      });

      if (finalKeyword) {
        params.append("keyword", finalKeyword);
      }

      if (genreId) {
        params.append("genreId", genreId);
      }

      console.log("🔍 Fetching Rakuten products via proxy:", {
        keyword: finalKeyword,
        newsCategory,
        genreId,
        hits,
        page,
      });

      const response = await fetch(`/api/rakuten/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: RakutenAPIResponse = await response.json();

      if (!data.Items || !Array.isArray(data.Items)) {
        throw new Error("Invalid API response format");
      }

      const productList: RakutenProduct[] = data.Items.map((item, index) => ({
        rank: (page - 1) * hits + index + 1,
        itemName: item.Item.itemName,
        itemPrice: item.Item.itemPrice,
        itemUrl: item.Item.itemUrl,
        itemCode: item.Item.itemCode,
        mediumImageUrls: item.Item.mediumImageUrls || [],
        imageUrl: item.Item.mediumImageUrls?.[0]?.imageUrl || "",
        shopName: item.Item.shopName,
        shopUrl: item.Item.shopUrl,
        affiliateUrl: item.Item.affiliateUrl || item.Item.itemUrl,
        reviewCount: item.Item.reviewCount || 0,
        reviewAverage: item.Item.reviewAverage || 0,
        itemCaption: item.Item.itemCaption || "",
        availability: item.Item.availability || 0,
        taxFlag: item.Item.taxFlag || 0,
        postageFlag: item.Item.postageFlag || 0,
        creditCardFlag: item.Item.creditCardFlag || 0,
        shopOfTheYearFlag: item.Item.shopOfTheYearFlag || 0,
        shipOverseasFlag: item.Item.shipOverseasFlag || 0,
        shipOverseasArea: item.Item.shipOverseasArea || "",
        asurakuFlag: item.Item.asurakuFlag || 0,
        asurakuClosingTime: item.Item.asurakuClosingTime || "",
        asurakuArea: item.Item.asurakuArea || "",
        affiliateRate: item.Item.affiliateRate || 0,
        startTime: item.Item.startTime || "",
        endTime: item.Item.endTime || "",
      }));

      const totalCount = data.hits || 0;

      console.log("✅ Fetched Rakuten products:", productList.length);

      setProducts(productList);
      setTotalCount(totalCount);
      setCachedData(cacheKey, { products: productList, totalCount });
    } catch (err) {
      console.error("❌ Rakuten API error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [finalKeyword, genreId, hits, page, newsCategory]);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [fetchProducts, autoFetch]);

  return {
    products,
    loading,
    error,
    totalCount,
    refetch: fetchProducts,
  };
}
