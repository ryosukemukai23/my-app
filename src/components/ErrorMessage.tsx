// components/ErrorMessage.tsx
"use client";

import React from "react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = "",
}) => {
  // 💡 エラー枠自体を強制的に非表示にする (display: none)
  return null;

  /*
  // 以前のコード（残しておきたい場合はコメントアウト）
  return (
    <div
      className={`
        bg-red-50 dark:bg-red-900/20
        border border-red-200 dark:border-red-800
        rounded-lg p-4
        ${className}
      `}
      role="alert"
    >
      ...
    </div>
  );
  */
};

export default ErrorMessage;
