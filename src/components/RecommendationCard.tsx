// components/RecommendationCard.tsx
'use client';

import React, { useEffect } from 'react';
import { useAIRecommendation } from '@/hooks/useAIRecommendation';
import { useLanguage } from '@/hooks/useLanguage';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { Sparkles, Tag } from 'lucide-react';

interface RecommendationCardProps {
  articleTitle: string;
  articleContent: string;
  category?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  articleTitle,
  articleContent,
  category = 'general',
}) => {
  const { t } = useLanguage();
  const { recommendation, loading, error, generateRecommendation } = useAIRecommendation();

  useEffect(() => {
    if (articleTitle && articleContent) {
      generateRecommendation({
        title: articleTitle,
        content: articleContent,
        category,
      });
    }
  }, [articleTitle, articleContent, category, generateRecommendation]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-card dark:shadow-card-dark p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={() => generateRecommendation({ title: articleTitle, content: articleContent, category })}
      />
    );
  }

  if (!recommendation) {
    return null;
  }

  return (
    <article className="bg-gradient-to-br from-accent/5 to-accent/10 dark:from-accent/10 dark:to-accent/20 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-accent/20">
      {/* ヘッダー */}
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold text-black dark:text-white">
          {t('article.recommendation')}
        </h3>
        <span className="ml-auto text-xs bg-accent text-white px-2 py-1 rounded-full">
          AI
        </span>
      </div>

      {/* タイトル */}
      <h4 className="text-base font-bold text-black dark:text-white mb-2">
        {recommendation.title}
      </h4>

      {/* 説明文 */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {recommendation.description}
      </p>

      {/* キーワード */}
      {recommendation.keywords && recommendation.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recommendation.keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
            >
              <Tag className="w-3 h-3 mr-1" />
              {keyword}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default RecommendationCard;