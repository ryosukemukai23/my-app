// app/[lang]/article/[id]/page.tsx
import ArticleContent from "@/components/ArticleContent";
import { fetchArticleByIdServer, fetchNewsServer } from "@/utils/serverNewsAPI";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ArticlePageProps {
  params: Promise<{
    lang: string;
    id: string;
  }>;
}

// ✅ 動的メタデータ生成（SEO対策）
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { lang, id } = await params;
  const article = await fetchArticleByIdServer(id, lang);

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

// ✅ 静的パス生成（人気記事を事前生成）
export async function generateStaticParams() {
  try {
    // 最新記事50件を事前生成
    const { articles } = await fetchNewsServer({ limit: 50 });
    
    return articles.map((article) => ({
      id: article.uuid,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// ✅ サーバーコンポーネント
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { lang, id } = await params;
  
  // サーバー側で記事データ取得
  const article = await fetchArticleByIdServer(id, lang);

  if (!article) {
    notFound();
  }

  // クライアントコンポーネントに記事データを渡す
  return <ArticleContent article={article} lang={lang} />;
}

// ✅ 動的レンダリング設定
export const dynamic = "force-static";
export const revalidate = 300; // 5分ごとに再生成