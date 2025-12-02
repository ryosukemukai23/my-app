// components/MUI/MuiArticleCard.tsx
"use client";

import {useLanguage} from "@/hooks/useLanguage";
import {Article} from "@/types/Article";
import {validateImageUrl} from "@/utils/apiUtils";
import {formatDate} from "@/utils/dateUtils";
import {CalendarToday, Source} from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material";
import {useRouter} from "next/navigation";
import React from "react";

interface MuiArticleCardProps {
  article: Article;
}

const MuiArticleCard: React.FC<MuiArticleCardProps> = ({article}) => {
  const {language} = useLanguage();
  const router = useRouter();

  // 記事IDを決定（優先順位: uuid > url > title）
  const articleId = article.uuid || article.url || article.title;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      if (!articleId) {
        console.error("❌ Article has no valid ID");
        return;
      }

      // 記事データをsessionStorageに保存（完全な記事オブジェクト）
      const storageKey = `article_${encodeURIComponent(articleId)}`;
      const articleData = JSON.stringify({
        ...article,
        // 確実にタイトルとカテゴリを保存
        title: article.title,
        categories: article.categories,
      });

      sessionStorage.setItem(storageKey, articleData);

      console.log("✅ Saved article to sessionStorage");
      console.log("   Storage key:", storageKey);
      console.log("   Article ID:", articleId);
      console.log("   Title:", article.title);
      console.log("   Categories:", article.categories);

      // 記事ページに遷移（URLエンコード）
      const encodedId = encodeURIComponent(articleId);
      router.push(`/${language}/article/${encodedId}`);
    } catch (error) {
      console.error("❌ Failed to save article data:", error);
      // エラーが発生しても、元記事のURLに直接遷移
      if (article.url) {
        window.open(article.url, "_blank");
      }
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {/* サムネイル画像 - サイズ統一 */}
        {article.image_url && (
          <CardMedia
            component="img"
            image={validateImageUrl(article.image_url)}
            alt={article.title}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            sx={{
              width: "100%",
              height: {
                xs: 300, // スマホ: 200px
                sm: 400, // タブレット: 240px
                md: 500, // PC: 280px
              },
              objectFit: "cover", // 画像を切り抜いてフィット
            }}
          />
        )}

        <CardContent
          sx={{flexGrow: 1, display: "flex", flexDirection: "column"}}
        >
          {/* カテゴリタグ */}
          {article.categories && article.categories.length > 0 && (
            <Box sx={{mb: 1.5}}>
              <Chip
                label={article.categories[0]}
                size="small"
                color="primary"
                sx={{fontWeight: 600}}
              />
            </Box>
          )}

          {/* タイトル */}
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1.5,
            }}
          >
            {article.title}
          </Typography>

          {/* 説明文 */}
          {article.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mb: 2,
                flexGrow: 1,
              }}
            >
              {article.description}
            </Typography>
          )}

          {/* メタ情報 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: "auto",
            }}
          >
            {/* 日付 */}
            {article.published_at && (
              <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                <CalendarToday sx={{fontSize: 16, color: "text.secondary"}} />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(article.published_at, language)}
                </Typography>
              </Box>
            )}

            {/* ソース */}
            {article.source && (
              <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                <Source sx={{fontSize: 16, color: "primary.main"}} />
                <Typography variant="caption" color="primary" fontWeight={600}>
                  {article.source}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default MuiArticleCard;
