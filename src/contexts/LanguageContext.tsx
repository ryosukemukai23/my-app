// contexts/LanguageContext.tsx
"use client";

import {usePathname, useRouter} from "next/navigation";
import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";

type Language = "ja" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

// 翻訳辞書
const translations: Record<Language, Record<string, string>> = {
  ja: {
    // ヘッダー
    "header.search": "検索",
    "header.darkMode": "ダークモード",
    "header.lightMode": "ライトモード",

    // カテゴリ
    "category.top": "トップ",
    "category.general": "一般",
    "category.science": "科学",
    "category.sports": "スポーツ",
    "category.business": "ビジネス",
    "category.health": "健康",
    "category.entertainment": "エンタメ",
    "category.tech": "テクノロジー",
    "category.politics": "政治",
    "category.food": "食",
    "category.tourism": "旅行", // ✅ travel → tourism

    // サイドバー
    "sidebar.weather": "天気",
    "sidebar.forecast": "5日間予報",
    "sidebar.searchWeather": "都市名で検索",
    "sidebar.products": "関連商品",
    "sidebar.music": "関連音楽",
    "sidebar.sports": "スポーツ情報",

    // 共通
    "common.loading": "読み込み中...",
    "common.error": "エラーが発生しました",
    "common.noData": "データがありません",
    "common.readMore": "続きを読む",
    "common.previous": "前へ",
    "common.next": "次へ",
    "common.page": "ページ",
    "common.of": "/",

    // 記事
    "article.similar": "類似記事",
    "article.published": "公開日",
    "article.source": "情報源",
    "article.recommendation": "おすすめ記事",
  },
  en: {
    // Header
    "header.search": "Search",
    "header.darkMode": "Dark Mode",
    "header.lightMode": "Light Mode",

    // Categories
    "category.top": "Top",
    "category.general": "General",
    "category.science": "Science",
    "category.sports": "Sports",
    "category.business": "Business",
    "category.health": "Health",
    "category.entertainment": "Entertainment",
    "category.tech": "Technology",
    "category.politics": "Politics",
    "category.food": "Food",
    "category.tourism": "Travel", // ✅ travel → tourism

    // Sidebar
    "sidebar.weather": "Weather",
    "sidebar.forecast": "5-Day Forecast",
    "sidebar.searchWeather": "Search by City",
    "sidebar.products": "Related Products",
    "sidebar.music": "Related Music",
    "sidebar.sports": "Sports Info",

    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.noData": "No data available",
    "common.readMore": "Read More",
    "common.previous": "Previous",
    "common.next": "Next",
    "common.page": "Page",
    "common.of": "of",

    // Article
    "article.similar": "Similar Articles",
    "article.published": "Published",
    "article.source": "Source",
    "article.recommendation": "Recommended Articles",
  },
};

// URL の先頭が /ja または /en ならその言語を返す
const detectLanguageFromPath = (pathname: string | null): Language | null => {
  const match = pathname?.match(/^\/(ja|en)(?=\/|$)/);
  return match ? (match[1] as Language) : null;
};

const saveLanguageCookie = (lang: Language) => {
  document.cookie = `language=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1年間保存
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({children, initialLanguage = "ja"}) => {
  const router = useRouter();
  const pathname = usePathname();

  // URLにプレフィックスがないページ（/weather/JP など）用のフォールバック
  const [fallbackLanguage, setFallbackLanguage] = useState<Language>(initialLanguage);

  const pathLanguage = detectLanguageFromPath(pathname);

  // ✅ URL優先。サーバーの初回HTMLから正しい言語で描画される
  const language: Language = pathLanguage ?? fallbackLanguage;

  // 初回マウント時にCookieから読み込み（プレフィックスなしページ用）
  useEffect(() => {
    const savedLang = document.cookie
      .split("; ")
      .find((row) => row.startsWith("language="))
      ?.split("=")[1] as Language;

    if (savedLang === "ja" || savedLang === "en") {
      setFallbackLanguage(savedLang);
    }
  }, []);

  // URLの言語をCookieに同期（プレフィックスなしページでも直前の言語を引き継ぐ）
  useEffect(() => {
    if (pathLanguage) {
      saveLanguageCookie(pathLanguage);
      setFallbackLanguage(pathLanguage);
    }
  }, [pathLanguage]);

  // 言語変更時の処理
  const setLanguage = (lang: Language) => {
    setFallbackLanguage(lang);
    saveLanguageCookie(lang);

    // URLにプレフィックスがある場合だけ遷移（言語プレフィックスを更新）
    if (pathname && pathLanguage && pathLanguage !== lang) {
      const newPath = pathname.replace(/^\/(ja|en)/, `/${lang}`);
      router.push(newPath);
    }
  };

  // 翻訳関数（存在しないキーや未初期化時も安全にガード）
  const t = (key: string): string => {
    const langDict = translations[language] || translations.ja;
    return langDict[key] || key;
  };

  return <LanguageContext.Provider value={{language, setLanguage, t}}>{children}</LanguageContext.Provider>;
};

