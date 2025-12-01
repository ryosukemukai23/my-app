// components/SimilarArticles.tsx
"use client";

import {useDarkMode} from "@/hooks/useDarkMode";
import {useLanguage} from "@/hooks/useLanguage";
import {useSimilarArticles} from "@/hooks/useNewsAPI";
import {validateImageUrl} from "@/utils/apiUtils";
import {formatDate} from "@/utils/dateUtils";
import {FileText} from "lucide-react";
import Link from "next/link";
import React from "react";
import ErrorMessage from "./ErrorMessage";
import LoadingSpinner from "./LoadingSpinner";

interface SimilarArticlesProps {
  category: string;
  limit?: number;
}

const SimilarArticles: React.FC<SimilarArticlesProps> = ({
  category,
  limit = 3,
}) => {
  const {language, t} = useLanguage();
  const {similarArticles, loading, error} = useSimilarArticles(category, limit);
  const {isDarkMode} = useDarkMode();

  if (loading) {
    return (
      <div className="py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} className="my-4" />;
  }

  if (!similarArticles || similarArticles.length === 0) {
    return null;
  }

  return (
    <section
      className={`mt-16 pt-12 border-t-2 ${
        isDarkMode ? "border-gray-700" : "border-gray-200"
      }`}
    >
      {/* ヘッダー */}
      <div className="mb-8">
        <h2
          className={`text-3xl font-bold ${
            isDarkMode ? "text-white" : "text-black"
          } flex items-center gap-3`}
        >
          <div
            className={`p-2 ${isDarkMode ? "bg-accent/20" : "bg-accent/10"}`}
          >
            <FileText className="w-7 h-7 text-accent" />
          </div>
          {t("article.similar")}
        </h2>
        <p
          className={`mt-2 ml-14 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {language === "ja"
            ? "同じカテゴリーの最新記事をチェック"
            : "Check out the latest articles in this category"}
        </p>
      </div>

      {/* 記事グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarArticles.map((article) => (
          <Link
            key={article.uuid}
            href={`/${language}/article/${article.uuid}`}
            className="group"
          >
            <article
              className={`h-full shadow-md overflow-hidden transition-all duration-300 border
                ${
                  isDarkMode
                    ? "bg-gray-900 shadow-gray-900/50 border-gray-800 hover:shadow-accent/20"
                    : "bg-white border-gray-100 hover:shadow-2xl"
                }
                hover:border-accent/50
              `}
            >
              {/* 画像 */}
              <div
                className={`relative w-full h-48 overflow-hidden ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
                }`}
              >
                <img
                  src={validateImageUrl(article.image_url)}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* オーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* コンテンツ */}
              <div className="p-6 space-y-3">
                {/* タイトル */}
                <h3
                  className={`text-lg font-bold line-clamp-2 group-hover:text-accent transition-colors leading-tight
                  ${isDarkMode ? "text-white" : "text-black"}
                `}
                >
                  {article.title}
                </h3>

                {/* 説明 */}
                <p
                  className={`text-sm line-clamp-3 leading-relaxed ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {article.description}
                </p>

                {/* メタ情報 */}
                <div
                  className={`flex items-center justify-between pt-3 border-t ${
                    isDarkMode ? "border-gray-800" : "border-gray-100"
                  }`}
                >
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatDate(article.published_at, language)}
                  </span>
                  {article.source && (
                    <span
                      className={`text-xs font-semibold text-accent px-2 py-1 ${
                        isDarkMode ? "bg-accent/20" : "bg-accent/10"
                      }`}
                    >
                      {article.source}
                    </span>
                  )}
                </div>
              </div>

              {/* ホバー時のボトムバー */}
              <div className="h-1 bg-gradient-to-r from-accent/50 via-accent to-accent/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SimilarArticles;
