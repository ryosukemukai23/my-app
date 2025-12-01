// // components/Sidebar.tsx
// "use client";

// import {useLanguage} from "@/hooks/useLanguage";
// import useRakutenAPI from "@/hooks/useRakutenAPI";
// import {useSportsDBAPI} from "@/hooks/useSportsDBAPI";
// import {useSpotifySearch} from "@/hooks/useSpotifyAPI";
// import {useGeolocation, useWeatherAPI} from "@/hooks/useWeatherAPI";
// import {validateImageUrl} from "@/utils/apiUtils";
// import {formatDateShort} from "@/utils/dateUtils";
// import {Music, Package, Search, TrendingUp} from "lucide-react";
// import Link from "next/link";
// import React, {useState} from "react";
// import WeatherIcon3D from "./3D/WeatherIcon3D";
// import LoadingSpinner from "./LoadingSpinner";

// interface SidebarProps {
//   category?: string;
//   articleKeyword?: string;
// }

// const Sidebar: React.FC<SidebarProps> = ({
//   category = "general",
//   articleKeyword = "",
// }) => {
//   const {t} = useLanguage();
//   const [searchCity, setSearchCity] = useState("");
//   const [cityQuery, setCityQuery] = useState("");

//   // 現在地取得
//   const {location} = useGeolocation();

//   // 天気取得（現在地または検索都市）
//   const {
//     current,
//     forecast,
//     loading: weatherLoading,
//   } = useWeatherAPI(cityQuery ? undefined : location, cityQuery);

//   // 楽天商品取得
//   const {products, loading: rakutenLoading} = useRakutenAPI({
//     keyword: articleKeyword || "おすすめ",
//     hits: 5,
//   });

//   // Spotify（Entertainmentカテゴリの場合）
//   const {tracks, loading: spotifyLoading} = useSpotifySearch(
//     category === "entertainment" ? articleKeyword : "",
//     5
//   );

//   // SportsDB（Sportsカテゴリの場合）
//   const {events, loading: sportsLoading} = useSportsDBAPI(
//     category === "sports" ? articleKeyword : ""
//   );

//   // 天気検索
//   const handleWeatherSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchCity.trim()) {
//       setCityQuery(searchCity);
//     }
//   };

//   return (
//     <aside className="w-full lg:w-80 space-y-6">
//       {/* 天気セクション */}
//       <div className="bg-white dark:bg-gray-900 rounded-lg shadow-card dark:shadow-card-dark p-6">
//         <h2 className="text-xl font-bold text-black dark:text-white mb-4">
//           {t("sidebar.weather")}
//         </h2>

//         {/* 天気検索フォーム */}
//         <form onSubmit={handleWeatherSearch} className="mb-4">
//           <div className="flex space-x-2">
//             <input
//               type="text"
//               value={searchCity}
//               onChange={(e) => setSearchCity(e.target.value)}
//               placeholder={t("sidebar.searchWeather")}
//               className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
//             />
//             <button
//               type="submit"
//               className="p-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
//             >
//               <Search className="w-4 h-4" />
//             </button>
//           </div>
//         </form>

//         {/* 現在の天気 */}
//         {weatherLoading ? (
//           <LoadingSpinner />
//         ) : current ? (
//           <Link href={`/weather/${current.sys.country}`}>
//             <div className="space-y-4 cursor-pointer hover:opacity-80 transition-opacity">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">
//                     {current.name}, {current.sys.country}
//                   </p>
//                   <p className="text-4xl font-bold text-black dark:text-white">
//                     {Math.round(current.temp)}°C
//                   </p>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">
//                     {current.weather[0]?.description}
//                   </p>
//                 </div>
//                 <WeatherIcon3D iconCode={current.weather[0]?.icon || "01d"} />
//               </div>

//               {/* 5日間予報 */}
//               {forecast && (
//                 <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
//                   <p className="text-sm font-semibold text-black dark:text-white mb-2">
//                     {t("sidebar.forecast")}
//                   </p>
//                   <div className="space-y-2">
//                     {forecast.list.slice(0, 5).map((day, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between text-sm"
//                       >
//                         <span className="text-gray-600 dark:text-gray-400">
//                           {formatDateShort(
//                             new Date(day.dt * 1000).toISOString()
//                           )}
//                         </span>
//                         <div className="flex items-center space-x-2">
//                           <span className="text-black dark:text-white font-medium">
//                             {Math.round(day.temp.max)}° /{" "}
//                             {Math.round(day.temp.min)}°
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </Link>
//         ) : (
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             {t("common.noData")}
//           </p>
//         )}
//       </div>

//       {/* 楽天商品セクション */}
//       <div className="bg-white dark:bg-gray-900 rounded-lg shadow-card dark:shadow-card-dark p-6">
//         <h2 className="text-xl font-bold text-black dark:text-white mb-4 flex items-center">
//           <Package className="w-5 h-5 mr-2" />
//           {t("sidebar.products")}
//         </h2>

//         {rakutenLoading ? (
//           <LoadingSpinner />
//         ) : products.length > 0 ? (
//           <div className="space-y-3">
//             {products.map((product, index) => (
//               <a
//                 key={product.itemCode}
//                 href={product.affiliateUrl || product.itemUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="block hover:opacity-80 transition-opacity"
//               >
//                 <div className="flex space-x-3">
//                   <img
//                     src={validateImageUrl(product.imageUrl)}
//                     alt={product.itemName}
//                     className="w-16 h-16 object-cover rounded-lg"
//                   />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-black dark:text-white line-clamp-2">
//                       {product.itemName}
//                     </p>
//                     <p className="text-sm text-accent font-bold">
//                       ¥{product.itemPrice.toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </a>
//             ))}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             {t("common.noData")}
//           </p>
//         )}
//       </div>

//       {/* Spotifyセクション（Entertainmentカテゴリ） */}
//       {category === "entertainment" && (
//         <div className="bg-white dark:bg-gray-900 rounded-lg shadow-card dark:shadow-card-dark p-6">
//           <h2 className="text-xl font-bold text-black dark:text-white mb-4 flex items-center">
//             <Music className="w-5 h-5 mr-2" />
//             {t("sidebar.music")}
//           </h2>

//           {spotifyLoading ? (
//             <LoadingSpinner />
//           ) : tracks.length > 0 ? (
//             <div className="space-y-3">
//               {tracks.map((track) => (
//                 <a
//                   key={track.id}
//                   href={track.external_urls.spotify}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="block hover:opacity-80 transition-opacity"
//                 >
//                   <div className="flex space-x-3">
//                     <img
//                       src={validateImageUrl(track.album.images[0]?.url)}
//                       alt={track.name}
//                       className="w-16 h-16 object-cover rounded-lg"
//                     />
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-black dark:text-white line-clamp-1">
//                         {track.name}
//                       </p>
//                       <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
//                         {track.artists.map((a) => a.name).join(", ")}
//                       </p>
//                     </div>
//                   </div>
//                 </a>
//               ))}
//             </div>
//           ) : (
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               {t("common.noData")}
//             </p>
//           )}
//         </div>
//       )}

//       {/* SportsDBセクション（Sportsカテゴリ） */}
//       {category === "sports" && (
//         <div className="bg-white dark:bg-gray-900 rounded-lg shadow-card dark:shadow-card-dark p-6">
//           <h2 className="text-xl font-bold text-black dark:text-white mb-4 flex items-center">
//             <TrendingUp className="w-5 h-5 mr-2" />
//             {t("sidebar.sports")}
//           </h2>

//           {sportsLoading ? (
//             <LoadingSpinner />
//           ) : events.length > 0 ? (
//             <div className="space-y-3">
//               {events.slice(0, 5).map((event) => (
//                 <div
//                   key={event.idEvent}
//                   className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
//                 >
//                   <p className="text-sm font-medium text-black dark:text-white">
//                     {event.strEvent}
//                   </p>
//                   <p className="text-xs text-gray-600 dark:text-gray-400">
//                     {formatDateShort(event.dateEvent)}
//                   </p>
//                   {event.intHomeScore && event.intAwayScore && (
//                     <p className="text-xs text-accent font-bold">
//                       {event.intHomeScore} - {event.intAwayScore}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               {t("common.noData")}
//             </p>
//           )}
//         </div>
//       )}
//     </aside>
//   );
// };

// export default Sidebar;
