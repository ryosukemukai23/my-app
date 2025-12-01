// utils/dateUtils.ts

/**
 * ISO形式の日付を読みやすい形式に変換
 * @param isoDate ISO形式の日付文字列
 * @param locale ロケール ('ja' | 'en')
 * @returns フォーマット済み日付文字列
 */
export const formatDate = (isoDate: string, locale: string = "ja"): string => {
  const date = new Date(isoDate);

  if (isNaN(date.getTime())) {
    return isoDate;
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", options);
};

/**
 * ISO形式の日付を短縮形式に変換
 * @param isoDate ISO形式の日付文字列
 * @param locale ロケール ('ja' | 'en')
 * @returns フォーマット済み日付文字列 (例: 2024/01/15)
 */
export const formatDateShort = (
  isoDate: string,
  locale: string = "ja"
): string => {
  const date = new Date(isoDate);

  if (isNaN(date.getTime())) {
    return isoDate;
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  return date.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", options);
};

/**
 * ISO形式の日付を時刻付きで変換
 * @param isoDate ISO形式の日付文字列
 * @param locale ロケール ('ja' | 'en')
 * @returns フォーマット済み日付・時刻文字列
 */
export const formatDateTime = (
  isoDate: string,
  locale: string = "ja"
): string => {
  const date = new Date(isoDate);

  if (isNaN(date.getTime())) {
    return isoDate;
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return date.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", options);
};

/**
 * 相対時間を取得（例: 2時間前、3日前）
 * @param isoDate ISO形式の日付文字列
 * @param locale ロケール ('ja' | 'en')
 * @returns 相対時間文字列
 */
export const getRelativeTime = (
  isoDate: string,
  locale: string = "ja"
): string => {
  const date = new Date(isoDate);
  const now = new Date();

  if (isNaN(date.getTime())) {
    return isoDate;
  }

  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (locale === "ja") {
    if (diffSeconds < 60) return `${diffSeconds}秒前`;
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return formatDate(isoDate, locale);
  } else {
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(isoDate, locale);
  }
};

/**
 * UNIX タイムスタンプを日付に変換
 * @param timestamp UNIX タイムスタンプ（秒単位）
 * @param locale ロケール ('ja' | 'en')
 * @returns フォーマット済み日付文字列
 */
export const formatUnixTimestamp = (
  timestamp: number,
  locale: string = "ja"
): string => {
  const date = new Date(timestamp * 1000);

  if (isNaN(date.getTime())) {
    return String(timestamp);
  }

  return formatDate(date.toISOString(), locale);
};

/**
 * 曜日を取得
 * @param isoDate ISO形式の日付文字列
 * @param locale ロケール ('ja' | 'en')
 * @returns 曜日文字列
 */
export const getDayOfWeek = (
  isoDate: string,
  locale: string = "ja"
): string => {
  const date = new Date(isoDate);

  if (isNaN(date.getTime())) {
    return "";
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
  };

  return date.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", options);
};
