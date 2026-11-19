// app/[lang]/[category]/page.tsx
import CategoryContent from "@/components/CategoryContent";
import {fetchNewsServer} from "@/utils/serverNewsAPI";
import {Metadata} from "next";

interface CategoryPageProps {
  params: Promise<{
    lang: string;
    category: string;
  }>;
  searchParams: Promise<{
    q?: string;
    cursor?: string; // ✅ ページ番号ではなく、NewsData.ioのnextPageトークンをそのまま保持
  }>;
}

// ✅ 動的メタデータ生成
export async function generateMetadata({params}: CategoryPageProps): Promise<Metadata> {
  const {lang, category} = await params;

  // categoryNames
  const categoryNames: Record<string, Record<string, string>> = {
    ja: {
      top: "トップニュース",
      business: "ビジネス",
      tech: "テクノロジー",
      sports: "スポーツ",
      entertainment: "エンタメ",
      science: "科学",
      health: "健康",
      politics: "政治",
      food: "グルメ",
      tourism: "旅行",
    },
    en: {
      top: "Top News",
      business: "Business",
      tech: "Technology",
      sports: "Sports",
      entertainment: "Entertainment",
      science: "Science",
      health: "Health",
      politics: "Politics",
      food: "Food",
      tourism: "Travel",
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

// ✅ 静的パス生成（カテゴリ×言語の20件のみ。cursorはクエリパラメータなので対象外）
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
    "politics",
    "food",
    "tourism",
  ];
  const params = [];
  for (const lang of languages) {
    for (const category of categories) {
      params.push({lang, category});
    }
  }

  return params;
}

// ✅ サーバーコンポーネント
export default async function CategoryPage({params, searchParams}: CategoryPageProps) {
  const {lang, category} = await params;
  const {q: searchQuery, cursor} = await searchParams;

  // ✅ NewsData.ioはページ番号ではなくnextPageトークン(cursor)方式
  const {articles, nextPage} = await fetchNewsServer({
    category: category === "top" ? undefined : category,
    language: lang,
    cursor,
    limit: 10,
    search: searchQuery || "",
  });

  return (
    <CategoryContent
      articles={articles}
      category={category}
      lang={lang}
      nextPageToken={nextPage}
      searchQuery={searchQuery || ""}
    />
  );
}

// ✅ 再検証設定
// serverNewsAPI.ts の LIST_REVALIDATE_SEC（3時間）と同じ値にする。
// Next.js の仕様で、ここは数値リテラルで書く必要がある（定数や計算式は不可）。
export const revalidate = 10800;
