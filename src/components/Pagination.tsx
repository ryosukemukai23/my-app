// components/Pagination.tsx
"use client";

import {useLanguage} from "@/hooks/useLanguage";
import {ChevronLeft, ChevronRight} from "lucide-react";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  const {t} = useLanguage();

  // ページ番号の配列を生成
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // 開始ページの調整
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }

    // 終了ページの調整
    if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    // 最初のページ
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // 中間のページ
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // 最後のページ
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === "number") {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="flex items-center justify-center space-x-2 mt-8"
      aria-label="Pagination"
    >
      {/* 前へボタン */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`
          flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${
            currentPage === 1
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : "bg-white dark:bg-gray-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700"
          }
        `}
        aria-label={t("common.previous")}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        {t("common.previous")}
      </button>

      {/* ページ番号 */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500 dark:text-gray-500"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => handlePageClick(pageNumber)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-white dark:bg-gray-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700"
                }
              `}
              aria-label={`${t("common.page")} ${pageNumber}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* 次へボタン */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`
          flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${
            currentPage === totalPages
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : "bg-white dark:bg-gray-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700"
          }
        `}
        aria-label={t("common.next")}
      >
        {t("common.next")}
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </nav>
  );
};

export default Pagination;
