// components/SimilarArticles.tsx
import { formatDateTime } from "@/utils/dateUtils";
import { fetchSimilarArticlesServer } from "@/utils/serverNewsAPI";
import { Box, Card, CardContent, CardMedia, Chip, Stack, Typography } from "@mui/material";
import Link from "next/link";

interface SimilarArticlesProps {
  category: string;
  limit?: number;
  lang?: string;
}

export default async function SimilarArticles({
  category,
  limit = 3,
  lang = "ja",
}: SimilarArticlesProps) {
  // サーバー側で類似記事取得
  const similarArticles = await fetchSimilarArticlesServer(category, limit, lang);

  if (similarArticles.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        {lang === "ja" ? "関連記事" : "Related Articles"}
      </Typography>

      <Stack spacing={3}>
        {similarArticles.map((article) => (
          <Link
            key={article.uuid}
            href={`/${lang}/article/${article.uuid}`}
            style={{ textDecoration: "none" }}
          >
            <Card
              sx={{
                display: "flex",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              {article.image_url && (
                <CardMedia
                  component="img"
                  sx={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                  }}
                  image={article.image_url}
                  alt={article.title}
                />
              )}
              <CardContent sx={{ flex: 1 }}>
                <Stack spacing={1}>
                  {article.categories && article.categories.length > 0 && (
                    <Chip
                      label={article.categories[0]}
                      size="small"
                      color="primary"
                      sx={{ width: "fit-content" }}
                    />
                  )}
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {article.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(article.published_at, lang)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Stack>
    </Box>
  );
}