// types/Article.ts
export interface Article {
  uuid: string; // 主キー
  title: string;
  description: string;
  content?: string; // オプショナル
  url: string;
  image_url: string;
  published_at: string;
  source: string;
  categories: string[];
  locale: string;
  category?: string; // 単一カテゴリー（オプショナル）
}

export interface NewsAPIResponse {
  data: Article[];
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
}

// SimilarArticle を削除して Article を使う
