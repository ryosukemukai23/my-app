// components/CategoryContent.tsx
"use client";

import MuiArticleCard from "@/components/MUI/MuiArticleCard";
import MuiPagination from "@/components/MUI/MuiPagination";
import MuiSidebar from "@/components/MUI/MuiSidebar";
import RecommendationCard from "@/components/RecommendationCard";
import { Article } from "@/types/Article";
import { Alert, Box, Container, Grid } from "@mui/material"; // ← ここ重要！
import { useRouter } from "next/navigation";

interface CategoryContentProps {
  articles: Article[];
  category: string;
  lang: string;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}

export default function CategoryContent({
  articles,
  category,
  lang,
  currentPage,
  totalPages,
  searchQuery,
}: CategoryContentProps) {
  const router = useRouter();

  // ページ変更
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (page > 1) params.set("page", page.toString());
    
    const queryString = params.toString();
    router.push(`/${lang}/${category}${queryString ? `?${queryString}` : ""}`);
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container maxWidth="xl">
      <Grid container spacing={4}>
        {/* メインコンテンツ */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* 検索結果表示 */}
          {searchQuery && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="info">
                {lang === "ja"
                  ? `検索キーワード: "${searchQuery}"`
                  : `Search results for: "${searchQuery}"`}
              </Alert>
            </Box>
          )}

          {/* 記事一覧 */}
          {articles.length > 0 ? (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
                {articles.map((article, index) => (
                  <Box key={`article-${article.uuid}-${index}`}>
                    <MuiArticleCard article={article} />

                    {/* 2件目の後にAIレコメンド表示 */}
                    {index === 1 && article.title && article.content && (
                      <Box sx={{ mt: 3 }}>
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
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Alert severity="info">
                {searchQuery
                  ? lang === "ja"
                    ? `「${searchQuery}」の検索結果が見つかりませんでした`
                    : `No results found for "${searchQuery}"`
                  : lang === "ja"
                  ? "記事が見つかりませんでした"
                  : "No articles found"}
              </Alert>
            </Box>
          )}
        </Grid>

        {/* サイドバー */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <MuiSidebar
            category={category}
            articleKeyword={articles[0]?.title || ""}
            searchQuery={searchQuery}
          />
        </Grid>
      </Grid>
    </Container>
  );
}