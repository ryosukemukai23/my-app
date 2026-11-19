// app/page.tsx
"use client";

import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // デフォルトで /ja/top にリダイレクト（履歴を残さない）
    router.replace("/ja/top");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-accent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
