// hooks/useAIRecommendation.ts
"use client";

import {useCallback, useState} from "react";

interface AIRecommendationParams {
  title?: string;
  content?: string;
  category?: string;
}

interface AIRecommendation {
  title: string;
  description: string;
  keywords: string[];
}

export const useAIRecommendation = () => {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // AI補助による疑似レコメンド生成
  const generateRecommendation = useCallback(
    async ({
      title = "",
      content = "",
      category = "general",
    }: AIRecommendationParams) => {
      setLoading(true);
      setError(null);

      try {
        // Claude APIを使用してレコメンド生成
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content: `以下の記事情報から、関連性の高いレコメンド記事のタイトル、説明文、キーワードを生成してください。

記事タイトル: ${title}
記事内容: ${content.substring(0, 500)}
カテゴリ: ${category}

JSON形式で以下のように出力してください：
{
  "title": "レコメンド記事のタイトル",
  "description": "記事の説明文（100文字程度）",
  "keywords": ["キーワード1", "キーワード2", "キーワード3"]
}`,
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`AI API Error: ${response.status}`);
        }

        const data = await response.json();

        // レスポンスからテキストを抽出
        const textContent = data.content
          .filter((item: any) => item.type === "text")
          .map((item: any) => item.text)
          .join("\n");

        // JSONを抽出してパース
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const cleanJson = jsonMatch[0].replace(/```json|```/g, "").trim();
          const parsedRecommendation: AIRecommendation = JSON.parse(cleanJson);
          setRecommendation(parsedRecommendation);
        } else {
          throw new Error("Failed to parse AI response");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate recommendation"
        );
        setRecommendation(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 楽天商品検索用キーワード生成
  const generateRakutenKeyword = useCallback(
    async (articleTitle: string): Promise<string> => {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content: `以下の記事タイトルから、楽天市場で検索するのに最適なキーワードを1つ生成してください。キーワードのみを出力してください。

記事タイトル: ${articleTitle}`,
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate keyword");
        }

        const data = await response.json();
        const keyword = data.content
          .filter((item: any) => item.type === "text")
          .map((item: any) => item.text)
          .join("")
          .trim();

        return keyword;
      } catch (err) {
        console.error("Keyword generation error:", err);
        return articleTitle.split(" ")[0]; // フォールバック
      }
    },
    []
  );

  return {
    recommendation,
    loading,
    error,
    generateRecommendation,
    generateRakutenKeyword,
  };
};
