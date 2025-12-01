// app/[lang]/article/[id]/page.tsx
"use client";

import MuiSidebar from "@/components/MUI/MuiSidebar";
import SimilarArticles from "@/components/SimilarArticles";
import {useLanguage} from "@/hooks/useLanguage";
import {Article} from "@/types/Article";
import {validateImageUrl} from "@/utils/apiUtils";
import {formatDateTime} from "@/utils/dateUtils";
import {ArrowBack, CalendarToday, Label, OpenInNew} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params?.id as string;
  const {language, t} = useLanguage();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // sessionStorageからのみデータを取得（API呼び出しなし）
    const loadArticle = () => {
      setLoading(true);
      setError(null);

      try {
        if (!articleId || articleId === "undefined") {
          throw new Error("Invalid article ID");
        }

        console.log("📄 Loading article with encoded ID:", articleId);

        // sessionStorageから記事データを取得
        const storageKey = `article_${articleId}`;
        console.log("🔍 Looking for storage key:", storageKey);

        const cachedArticle = sessionStorage.getItem(storageKey);

        if (cachedArticle) {
          const parsedArticle = JSON.parse(cachedArticle);
          console.log("✅ Article loaded from sessionStorage");
          console.log("📰 Article:", parsedArticle.title);
          setArticle(parsedArticle);
        } else {
          // sessionStorageの全キーをログ出力してデバッグ
          console.log("❌ Article not found. Available sessionStorage keys:");
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key?.startsWith("article_")) {
              console.log(`  - ${key}`);
            }
          }
          console.error(
            "❌ Article not found in sessionStorage for key:",
            storageKey
          );
          throw new Error(
            language === "ja"
              ? "記事が見つかりません。記事一覧から再度選択してください。"
              : "Article not found. Please return to the news list and select an article again."
          );
        }
      } catch (err) {
        console.error("💥 Error loading article:", err);
        setError(err instanceof Error ? err.message : "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId, language]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{py: 8}}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="body2" color="text.secondary">
            {language === "ja"
              ? "記事を読み込んでいます..."
              : "Loading article..."}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container maxWidth="xl" sx={{py: 8}}>
        <Alert severity="error" sx={{mb: 2}}>
          {error ||
            (language === "ja" ? "記事が見つかりません" : "Article not found")}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
        >
          {language === "ja" ? "戻る" : "Go Back"}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{py: 4}}>
      {/* 戻るボタン */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{mb: 3}}
      >
        {language === "ja" ? "記事一覧に戻る" : "Back to Articles"}
      </Button>

      <Grid container spacing={4}>
        {/* メインコンテンツ */}
        <Grid size={{xs: 12, lg: 8}}>
          <Paper elevation={0} sx={{p: {xs: 2, md: 4}}}>
            {/* ヘッダー画像 */}
            {article.image_url && (
              <Box
                component="img"
                src={validateImageUrl(article.image_url)}
                alt={article.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                sx={{
                  width: "100%",
                  height: {xs: 250, md: 400},
                  objectFit: "cover",
                  borderRadius: 2,
                  mb: 3,
                }}
              />
            )}

            {/* カテゴリタグ */}
            {article.categories && article.categories.length > 0 && (
              <Stack direction="row" spacing={1} sx={{mb: 2}} flexWrap="wrap">
                {article.categories.map((cat, index) => (
                  <Chip
                    key={index}
                    icon={<Label />}
                    label={cat}
                    color="primary"
                    size="small"
                  />
                ))}
              </Stack>
            )}

            {/* タイトル */}
            <Typography
              variant="h3"
              component="h1"
              fontWeight={700}
              gutterBottom
              sx={{
                fontSize: {xs: "1.75rem", sm: "2.5rem", md: "3rem"},
                wordBreak: "break-word",
              }}
            >
              {article.title}
            </Typography>

            {/* メタ情報 */}
            <Stack
              direction={{xs: "column", sm: "row"}}
              spacing={2}
              sx={{mb: 3, pb: 3, borderBottom: 1, borderColor: "divider"}}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(article.published_at, language)}
                </Typography>
              </Stack>
              {article.source && (
                <Typography variant="body2" color="primary" fontWeight={600}>
                  {article.source}
                </Typography>
              )}
            </Stack>

            {/* 説明文 */}
            {article.description && (
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mb: 4,
                  lineHeight: 1.8,
                  fontSize: {xs: "1rem", md: "1.25rem"},
                  wordBreak: "break-word",
                }}
              >
                {article.description}
              </Typography>
            )}

            <Divider sx={{my: 3}} />

            {/* 本文 */}
            <Box
              sx={{
                "& p": {mb: 2, lineHeight: 1.8},
                "& h1, & h2, & h3": {mt: 3, mb: 2, fontWeight: 700},
                "& a": {color: "primary.main", textDecoration: "underline"},
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 2,
                  my: 2,
                },
                "& ul, & ol": {pl: 3, mb: 2},
                "& li": {mb: 1},
                fontSize: {xs: "1rem", md: "1.1rem"},
                wordBreak: "break-word",
              }}
            >
              {article.content ? (
                <Typography
                  variant="body1"
                  component="div"
                  sx={{whiteSpace: "pre-line"}}
                >
                  {/* NewsAPI.orgのcontentには[+XXX chars]という文字列が含まれるので削除 */}
                  {article.content.replace(/\[\+\d+ chars\]/g, "")}
                </Typography>
              ) : (
                <Typography variant="body1" paragraph>
                  {article.description}
                </Typography>
              )}
            </Box>

            {/* 元記事リンク */}
            {article.url && (
              <Box sx={{mt: 4, pt: 3, borderTop: 1, borderColor: "divider"}}>
                <Button
                  variant="contained"
                  endIcon={<OpenInNew />}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="large"
                >
                  {language === "ja"
                    ? "元記事を読む（全文）"
                    : "Read Full Article"}
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{display: "block", mt: 1}}
                >
                  {language === "ja"
                    ? "※ 記事の全文を読むには、元サイトをご覧ください"
                    : "※ Visit the original site to read the full article"}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* 類似記事 */}
          <Box sx={{mt: 6}}>
            {article.categories && article.categories.length > 0 && (
              <SimilarArticles category={article.categories[0]} limit={3} />
            )}
          </Box>
        </Grid>

        {/* サイドバー */}
        <Grid size={{xs: 12, lg: 4}}>
          <Box
            sx={{
              position: {lg: "sticky"},
              top: 80,
              maxHeight: {lg: "calc(100vh - 100px)"},
              overflowY: "auto",
            }}
          >
            {/* ✅ 記事タイトルを渡して商品検索 */}
            <MuiSidebar
              category={article.categories?.[0] || "general"}
              articleTitle={article.title}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}