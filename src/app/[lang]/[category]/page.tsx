// app/[lang]/[category]/page.tsx
import CategoryContent from "@/components/CategoryContent";
import { fetchNewsServer } from "@/utils/serverNewsAPI";
import { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{
    lang: string;
    category: string;
  }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

// ✅ 動的メタデータ生成
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { lang, category } = await params;

  const categoryNames: Record<string, Record<string, string>> = {
    ja: {
      top: "トップニュース",
      business: "ビジネス",
      tech: "テクノロジー",
      sports: "スポーツ",
      entertainment: "エンタメ",
      science: "科学",
      health: "健康",
    },
    en: {
      top: "Top News",
      business: "Business",
      tech: "Technology",
      sports: "Sports",
      entertainment: "Entertainment",
      science: "Science",
      health: "Health",
    },
  };

  const categoryName = categoryNames[lang]?.[category] || category;

  return {
    title: `${categoryName} | News Portal`,
    description: `Latest ${categoryName} news and updates`,
    openGraph: {
      title: `${categoryName} | News Portal`,
      description: `Latest ${categoryName} news and updates`,
    },
  };
}

// ✅ 静的パス生成
export async function generateStaticParams() {
  const languages = ["ja", "en"];
  const categories = [
    "top",
    "business",
    "tech",
    "sports",
    "entertainment",
    "science",
    "health",
  ];

  const params = [];
  for (const lang of languages) {
    for (const category of categories) {
      params.push({ lang, category });
    }
  }

  return params;
}

// ✅ サーバーコンポーネント
export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { lang, category } = await params;
  const { q: searchQuery, page: pageParam } = await searchParams;

  const currentPage = parseInt(pageParam || "1", 10);

  // サーバー側でニュース取得
  const { articles, totalPages } = await fetchNewsServer({
    category: category === "top" ? undefined : category,
    language: lang,
    page: currentPage,
    limit: 10,
    search: searchQuery || "",
  });

  // クライアントコンポーネントにデータを渡す
  return (
    <CategoryContent
      articles={articles}
      category={category}
      lang={lang}
      currentPage={currentPage}
      totalPages={totalPages}
      searchQuery={searchQuery || ""}
    />
  );
}

// ✅ 再検証設定
// serverNewsAPI.ts 側の fetch も revalidate: 86400 で統一。
// Next.jsのルートセグメントrevalidateは「そのセグメント内fetchの上限」として
// 働くため、ここが短いとfetch側の設定が無効化されてAPIを無駄打ちする。
// 無料プランの1日100リクエスト枠を守るため、必ずfetch側と同じ値にすること。
export const revalidate = 86400; // 24時間ごとに再生成（serverNewsAPI.tsと統一）
