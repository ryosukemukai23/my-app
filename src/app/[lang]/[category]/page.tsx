// app/[lang]/[category]/page.tsx
"use client";

import MuiArticleCard from "@/components/MUI/MuiArticleCard";
import MuiPagination from "@/components/MUI/MuiPagination";
import MuiSidebar from "@/components/MUI/MuiSidebar";
import RecommendationCard from "@/components/RecommendationCard";
import {useCookie} from "@/hooks/useCookie";
import {useNewsAPI} from "@/hooks/useNewsAPI";
import {Alert, Box, CircularProgress, Container, Grid} from "@mui/material";
import {useParams, useSearchParams} from "next/navigation";
import {useMemo, useState} from "react";

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const category = (params?.category as string) || "top";
  const lang = (params?.lang as string) || "ja";
  
  // ✅ URLパラメータから直接取得（useEffectを使わない）
  const urlSearchQuery = searchParams?.get("q") || "";

  const {value: savedPage, setValue: setSavedPage} = useCookie(
    `page_${category}`,
    "1"
  );
  
  // ✅ useMemo で計算（useEffect不要）
  const currentPage = useMemo(() => {
    if (urlSearchQuery) return 1; // 検索時は1ページ目
    return parseInt(savedPage) || 1;
  }, [urlSearchQuery, savedPage]);

  // ✅ ニュース取得（limit を 10 に変更）
  const {articles, loading, error, totalPages, refetch} = useNewsAPI({
    category: category === "top" ? undefined : category,
    language: lang,
    page: currentPage,
    limit: 10, // ← ここが重要！
    search: urlSearchQuery,
  });

  // デバッグログ
  console.log("📊 CategoryPage:", {
    category,
    currentPage,
    limit: 10,
    articlesCount: articles.length,
    urlSearchQuery,
  });

  // ページ変更
  const handlePageChange = (page: number) => {
    setSavedPage(page.toString());
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  return (
    <Container maxWidth="xl">
      <Grid container spacing={4}>
        {/* メインコンテンツ */}
        <Grid size={{xs: 12, lg: 8}}>
          {/* 検索結果表示 */}
          {urlSearchQuery && (
            <Box sx={{mb: 2}}>
              <Alert severity="info">
                {lang === "ja" 
                  ? `検索キーワード: "${urlSearchQuery}"` 
                  : `Search results for: "${urlSearchQuery}"`}
              </Alert>
            </Box>
          )}

          {/* ローディング */}
          {loading && (
            <Box sx={{display: "flex", justifyContent: "center", py: 8}}>
              <CircularProgress size={60} />
            </Box>
          )}

          {/* エラー */}
          {error && (
            <Alert
              severity="error"
              action={
                <Box
                  component="button"
                  onClick={refetch}
                  sx={{
                    border: "none",
                    background: "none",
                    color: "error.main",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: 600,
                  }}
                >
                  再試行
                </Box>
              }
            >
              {error}
            </Alert>
          )}

          {/* 記事一覧 */}
          {!loading && !error && articles.length > 0 && (
            <>
              <Box
                sx={{display: "flex", flexDirection: "column", gap: 3, mb: 4}}
              >
                {articles.map((article, index) => (
                  <Box key={`article-${article.uuid}-${index}`}>
                    <MuiArticleCard article={article} />

                    {/* 2件目の後にAIレコメンド表示 */}
                    {index === 1 && article.title && article.content && (
                      <Box sx={{mt: 3}}>
                        <RecommendationCard
                          articleTitle={article.title}
                          articleContent={article.content}
                          category={category}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>

              {/* ページネーション */}
              <MuiPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}

          {/* データなし */}
          {!loading && !error && articles.length === 0 && (
            <Box sx={{textAlign: "center", py: 8}}>
              <Alert severity="info">
                {urlSearchQuery
                  ? `「${urlSearchQuery}」の検索結果が見つかりませんでした`
                  : "記事が見つかりませんでした"}
              </Alert>
            </Box>
          )}
        </Grid>

        {/* サイドバー */}
        <Grid size={{xs: 12, lg: 4}}>
          <MuiSidebar
            category={category}
            articleKeyword={articles[0]?.title || ""}
            searchQuery={urlSearchQuery}   // ← ★これを追加！
          />
        </Grid>
      </Grid>
    </Container>
  );
}