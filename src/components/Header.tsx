// components/Header.tsx
"use client";

import {useDarkMode} from "@/hooks/useDarkMode";
import {useLanguage} from "@/hooks/useLanguage";
import {Globe, Moon, Search, Sun} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import React, {useState} from "react";

const categories = [
  "top",
  "general",
  "science",
  "sports",
  "business",
  "health",
  "entertainment",
  "tech",
  "politics",
  "food",
  "travel",
];

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({onSearch}) => {
  const {isDarkMode, toggleDarkMode} = useDarkMode();
  const {language, setLanguage, t} = useLanguage();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 現在のカテゴリを取得
  const currentCategory = pathname?.split("/").pop() || "top";

  // 検索実行
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
      setIsSearchOpen(false);
    }
  };

  // 言語切替
  const handleLanguageToggle = () => {
    setLanguage(language === "ja" ? "en" : "ja");
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      {/* ロゴとコントロール */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* ロゴ */}
          <Link
            href={`/${language}/top`}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <h1 className="text-2xl font-bold text-black dark:text-white">
              News Portal
            </h1>
          </Link>

          {/* コントロール */}
          <div className="flex items-center space-x-4">
            {/* 検索ボタン */}
            {currentCategory === "top" && (
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={t("header.search")}
              >
                <Search className="w-5 h-5 text-black dark:text-white" />
              </button>
            )}

            {/* 言語切替 */}
            <button
              onClick={handleLanguageToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Language"
            >
              <Globe className="w-5 h-5 text-black dark:text-white" />
              <span className="ml-1 text-sm font-medium text-black dark:text-white">
                {language.toUpperCase()}
              </span>
            </button>

            {/* ダークモード切替 */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={
                isDarkMode ? t("header.lightMode") : t("header.darkMode")
              }
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-white" />
              ) : (
                <Moon className="w-5 h-5 text-black" />
              )}
            </button>
          </div>
        </div>

        {/* 検索フォーム */}
        {isSearchOpen && currentCategory === "top" && (
          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("header.search")}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
              >
                {t("header.search")}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* カテゴリタブ */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide space-x-1 py-2">
            {categories.map((category) => {
              const isActive = currentCategory === category;
              return (
                <Link
                  key={category}
                  href={`/${language}/${category}`}
                  className={`
                    px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-accent text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  {t(`category.${category}`)}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
