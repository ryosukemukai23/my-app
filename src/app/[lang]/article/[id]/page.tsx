// app/[lang]/article/[id]/page.tsx
import ArticleContent from "@/components/ArticleContent";
import SimilarArticles from "@/components/SimilarArticles";
import {fetchArticleByIdServer} from "@/utils/serverNewsAPI";
import {Box, CircularProgress} from "@mui/material";
import {Metadata} from "next";
import {notFound} from "next/navigation";
import {Suspense} from "react";

interface ArticlePageProps {
  params: Promise<{
    lang: string;
    id: string;
  }>;
}

// ✅ 404をキャッシュさせないため動的レンダリングにする
export const dynamic = "force-dynamic";

// ✅ 動的メタデータ生成（SEO対策）
export async function generateMetadata({params}: ArticlePageProps): Promise<Metadata> {
  const {lang, id} = await params;
  const article = await fetchArticleByIdServer(decodeURIComponent(id), lang);

  if (!article) {
    return {
      title: "記事が見つかりません | News Portal",
    };
  }

  return {
    title: `${article.title} | News Portal`,
    description: article.description || article.title,
    openGraph: {
      title: article.title,
      description: article.description || article.title,
      images: article.image_url ? [article.image_url] : [],
      type: "article",
      publishedTime: article.published_at,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description || article.title,
      images: article.image_url ? [article.image_url] : [],
    },
  };
}

// ✅ サーバーコンポーネント
export default async function ArticlePage({params}: ArticlePageProps) {
  const {lang, id} = await params;

  const article = await fetchArticleByIdServer(decodeURIComponent(id), lang);

  if (!article) {
    notFound();
  }

  // ✅ 類似記事は Suspense で包み、記事本文の表示を待たせない
  const similarArticlesSlot =
    article.categories && article.categories.length > 0 ? (
      <Suspense
        fallback={
          <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
            <CircularProgress size={24} />
          </Box>
        }
      >
        <SimilarArticles category={article.categories[0]} limit={3} lang={lang} />
      </Suspense>
    ) : null;

  return (
    <ArticleContent article={article} lang={lang}>
      {similarArticlesSlot}
    </ArticleContent>
  );
}
