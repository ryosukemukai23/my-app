// components/ArticleCard.tsx
"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { Article } from "@/types/Article";
import { validateImageUrl } from "@/utils/apiUtils";
import { formatDate } from "@/utils/dateUtils";
import { Calendar, Tag } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({article}) => {
  const {language, t} = useLanguage();

  // URLエンコードされた記事識別子を生成
  const articleSlug = encodeURIComponent(article.url || article.title);

  return (
    <Link href={`/${language}/article/${articleSlug}`}>
      <article className="bg-white dark:bg-gray-900 rounded-lg shadow-card dark:shadow-card-dark overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        {/* サムネイル画像 */}
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={validateImageUrl(article.image_url)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* カテゴリタグ */}
          {article.categories && article.categories.length > 0 && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent text-white">
                <Tag className="w-3 h-3 mr-1" />
                {article.categories[0]}
              </span>
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div className="p-5">
          {/* タイトル */}
          <h3 className="text-lg font-bold text-black dark:text-white mb-2 line-clamp-2 group-hover:text-accent dark:group-hover:text-accent transition-colors">
            {article.title}
          </h3>

          {/* 説明文 */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
            {article.description}
          </p>

          {/* メタ情報 */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
            {/* 日付 */}
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(article.published_at, language)}</span>
            </div>

            {/* ソース */}
            {article.source && (
              <span className="font-medium text-accent">{article.source}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;