// utils/rankingUtils.ts

/**
 * 配列をランキング順にソート
 * @param items ソート対象の配列
 * @param key ソートキー
 * @param order 昇順/降順
 * @returns ソート済み配列
 */
export const sortByRank = <T extends Record<string, any>>(
  items: T[],
  key: keyof T,
  order: "asc" | "desc" = "desc"
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
};

/**
 * トップN件を取得
 * @param items 配列
 * @param n 取得件数
 * @returns トップN件の配列
 */
export const getTopN = <T>(items: T[], n: number = 5): T[] => {
  return items.slice(0, Math.min(n, items.length));
};

/**
 * ランキング番号を付与
 * @param items 配列
 * @returns ランク付き配列
 */
export const addRankings = <T>(items: T[]): (T & {rank: number})[] => {
  return items.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
};

/**
 * スコアに基づいてランキングを計算
 * @param items 配列
 * @param scoreKey スコアのキー
 * @returns ランク付き配列
 */
export const calculateRankings = <T extends Record<string, any>>(
  items: T[],
  scoreKey: keyof T
): (T & {rank: number})[] => {
  const sorted = sortByRank(items, scoreKey, "desc");
  return addRankings(sorted);
};

/**
 * 複数の指標でスコアリング
 * @param items 配列
 * @param weights 重み付け設定 { key: weight }
 * @returns スコア付き配列
 */
export const calculateWeightedScore = <T extends Record<string, any>>(
  items: T[],
  weights: Record<keyof T, number>
): (T & {score: number})[] => {
  return items.map((item) => {
    let score = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      const value = item[key];
      if (typeof value === "number") {
        score += value * (weight as number);
      }
    });

    return {
      ...item,
      score,
    };
  });
};

/**
 * パーセンタイルを計算
 * @param items 配列
 * @param scoreKey スコアのキー
 * @returns パーセンタイル付き配列
 */
export const calculatePercentile = <T extends Record<string, any>>(
  items: T[],
  scoreKey: keyof T
): (T & {percentile: number})[] => {
  const sorted = sortByRank(items, scoreKey, "desc");
  const total = sorted.length;

  return sorted.map((item, index) => ({
    ...item,
    percentile: Math.round(((total - index) / total) * 100),
  }));
};

/**
 * カテゴリ別のトップを取得
 * @param items 配列
 * @param categoryKey カテゴリのキー
 * @param scoreKey スコアのキー
 * @param topN 各カテゴリのトップN件
 * @returns カテゴリ別トップ配列
 */
export const getTopByCategory = <T extends Record<string, any>>(
  items: T[],
  categoryKey: keyof T,
  scoreKey: keyof T,
  topN: number = 5
): Record<string, T[]> => {
  const grouped = items.reduce((acc, item) => {
    const category = String(item[categoryKey]);

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(item);
    return acc;
  }, {} as Record<string, T[]>);

  const result: Record<string, T[]> = {};

  Object.entries(grouped).forEach(([category, categoryItems]) => {
    const sorted = sortByRank(categoryItems, scoreKey, "desc");
    result[category] = getTopN(sorted, topN);
  });

  return result;
};

/**
 * ランキングバッジを取得（1位: 金、2位: 銀、3位: 銅）
 * @param rank ランク番号
 * @returns バッジの色クラス
 */
export const getRankBadgeClass = (rank: number): string => {
  switch (rank) {
    case 1:
      return "bg-yellow-500 text-white"; // 金
    case 2:
      return "bg-gray-400 text-white"; // 銀
    case 3:
      return "bg-orange-600 text-white"; // 銅
    default:
      return "bg-gray-200 text-gray-700"; // その他
  }
};

/**
 * ランキングアイコンを取得
 * @param rank ランク番号
 * @returns アイコン文字列
 */
export const getRankIcon = (rank: number): string => {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return `${rank}位`;
  }
};
