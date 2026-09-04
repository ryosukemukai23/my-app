// app/[lang]/article/[id]/page.tsx
import ArticleContent from "@/components/ArticleContent";
import SimilarArticles from "@/components/SimilarArticles";
import { fetchArticleByIdServer } from "@/utils/serverNewsAPI";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface ArticlePageProps {
  params: Promise<{
    lang: string;
    id: string;
  }>;
}

// ✅ 動的メタデータ生成（SEO対策）
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
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

// ✅ ビルド時の事前生成をゼロにする
// ⚠️ 無料プラン1日100リクエスト枠に対し、以前は記事50件を事前生成しており
//   （一覧取得1回＋記事詳細フェッチ最大50回＝1デプロイで最大51回消費）、
//   デプロイ2回で枠が枯渇していた。
//   generateStaticParamsが[]を返しても、Next.jsのdynamicParamsは
//   デフォルトでtrueのため404にはならず、未生成の記事は初回アクセス時に
//   その場で生成される。以後はrevalidate(86400)でキャッシュされるため、
//   2人目以降の訪問者への追加フェッチは発生しない。
export async function generateStaticParams() {
  return [];
}

// ✅ サーバーコンポーネント
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { lang, id } = await params;

  // サーバー側で記事データ取得
  const article = await fetchArticleByIdServer(id, lang);

  if (!article) {
    notFound();
  }

  // ✅ SimilarArticles（async Server Component）はここ（Serverコンポーネント）で生成し、
  //   children としてClient Componentへ渡す。Client Component内でasync Server
  //   Componentを直接importして描画することはできないため。
  const similarArticlesSlot =
    article.categories && article.categories.length > 0 ? (
      <SimilarArticles category={article.categories[0]} limit={3} lang={lang} />
    ) : null;

  // クライアントコンポーネントに記事データを渡す
  return (
    <ArticleContent article={article} lang={lang}>
      {similarArticlesSlot}
    </ArticleContent>
  );
}

// ✅ 動的レンダリング設定
export const dynamic = "force-static";
// serverNewsAPI.ts のfetch revalidate(86400)と必ず一致させる。
// ここが短いと、fetch側のキャッシュ意図が無視されて毎回API課金枠を消費する。
export const revalidate = 86400; // 24時間ごとに再生成（serverNewsAPI.tsと統一）
