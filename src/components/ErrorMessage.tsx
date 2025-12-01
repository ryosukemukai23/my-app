// components/ErrorMessage.tsx
"use client";

import {AlertCircle} from "lucide-react";
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
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-800 dark:text-red-300">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
            >
              再試行
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
