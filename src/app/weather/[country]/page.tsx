// app/weather/[country]/page.tsx
"use client";

import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import {useItunesSearch} from "@/hooks/useItunesAPI";
import {useLanguage} from "@/hooks/useLanguage";
import {validateImageUrl} from "@/utils/apiUtils";
import {Music, Play} from "lucide-react";
import {useParams} from "next/navigation";

export default function WeatherDetailPage() {
  const params = useParams();
  const countryCode = (params?.country as string) || "JP";
  const {t} = useLanguage();

  // キーワード空 = その国のチャート取得
  const {tracks, loading, error} = useItunesSearch("", 10, countryCode);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2 flex items-center">
            <Music className="w-8 h-8 mr-3" />
            {countryCode} - {t("sidebar.music")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">この国で人気の音楽トップチャート</p>
        </div>

        {/* ローディング */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* エラー */}
        {error && <ErrorMessage message={error} />}

        {/* トラックリスト */}
        {!loading && !error && tracks.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-card dark:shadow-card-dark p-6">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4">トラックリスト</h3>
            <div className="space-y-3">
              {tracks.slice(0, 10).map((track, index) => (
                <a
                  key={track.trackId}
                  href={track.trackViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  {/* 順位 */}
                  <div className="w-8 text-center">
                    <span className="text-lg font-bold text-gray-400 dark:text-gray-600 group-hover:text-accent">
                      {index + 1}
                    </span>
                  </div>

                  {/* アルバムアート */}
                  <img
                    src={validateImageUrl(track.artworkUrl100)}
                    alt={track.trackName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />

                  {/* トラック情報 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-black dark:text-white group-hover:text-accent transition-colors truncate">
                      {track.trackName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{track.artistName}</p>
                  </div>

                  {/* 再生アイコン */}
                  <Play className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* データなし */}
        {!loading && !error && tracks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t("common.noData")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
