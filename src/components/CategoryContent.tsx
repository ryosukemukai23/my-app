// components/CategoryContent.tsx
"use client";

import MuiArticleCard from "@/components/MUI/MuiArticleCard";
import MuiPagination from "@/components/MUI/MuiPagination";
import MuiSidebar from "@/components/MUI/MuiSidebar";
import {Article} from "@/types/Article";
import {Alert, Box, Container, Grid} from "@mui/material";
import {useRouter} from "next/navigation";
import {useTransition} from "react";

interface CategoryContentProps {
  articles: Article[];
  category: string;
  lang: string;
  nextPageToken: string | null;
  searchQuery: string;
}

export default function CategoryContent({articles, category, lang, nextPageToken, searchQuery}: CategoryContentProps) {
  const router = useRouter();
  // ✅ useTransition は遷移完了で自動的に false に戻る。
  const [isPending, startTransition] = useTransition();

  // ✅ 「次へ」：現在のnextPageTokenをそのままcursorとしてURLに積む
  const handleNext = () => {
    if (!nextPageToken) return;

    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    params.set("cursor", nextPageToken);

    startTransition(() => {
      router.push(`/${lang}/${category}?${params.toString()}`);
    });

    window.scrollTo({top: 0, behavior: "smooth"});
  };

  return (
    <Container maxWidth="xl">
      <Grid container spacing={4}>
        {/* メインコンテンツ */}
        <Grid size={{xs: 12, lg: 8}}>
          {/* 検索結果表示 */}
          {searchQuery && (
            <Box sx={{mb: 2}}>
              <Alert severity="info">
                {lang === "ja" ? `検索キーワード: "${searchQuery}"` : `Search results for: "${searchQuery}"`}
              </Alert>
            </Box>
          )}

          {/* 記事一覧 */}
          {articles.length > 0 ? (
            <>
              <Box sx={{display: "flex", flexDirection: "column", gap: 3, mb: 4}}>
                {articles.map((article, index) => (
                  <Box key={`article-${article.uuid}-${index}`}>
                    <MuiArticleCard article={article} />
                  </Box>
                ))}
              </Box>

              {/* ページネーション（「次へ」のみ） */}
              <MuiPagination hasNextPage={!!nextPageToken} isLoading={isPending} onNext={handleNext} lang={lang} />
            </>
          ) : (
            <Box sx={{textAlign: "center", py: 8}}>
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
        <Grid size={{xs: 12, lg: 4}}>
          <MuiSidebar category={category} categories={[category]} searchQuery={searchQuery} />
        </Grid>
      </Grid>
    </Container>
  );
}
