"use client";

import { useLanguage } from "@/hooks/useLanguage";
import useRakutenAPI from "@/hooks/useRakutenAPI";
import { useSportsDBAPI } from "@/hooks/useSportsDBAPI";
import { useGeolocation, useWeatherAPI } from "@/hooks/useWeatherAPI";
import { validateImageUrl } from "@/utils/apiUtils";
import { formatDateShort } from "@/utils/dateUtils";
import { Search, SportsBasketball } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { useItunesSearch } from "../../hooks/useItunesAPI";
import WeatherIcon3D from "../3D/WeatherIcon3D";
import LoadingSpinner from "../LoadingSpinner";

const formatLocalTime = (timestamp: number, timezoneOffset: number) => {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

interface MuiSidebarProps {
  category?: string;
  categories?: string[]; // ✅ 記事ページからは配列全体を渡す
  articleKeyword?: string;
  articleTitle?: string;
  searchQuery?: string;
}

const MuiSidebar: React.FC<MuiSidebarProps> = ({
  category = "general",
  categories,
  articleKeyword = "",
  articleTitle = "",
  searchQuery = "",
}) => {
  const { t } = useLanguage();
  const [searchCity, setSearchCity] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const { location } = useGeolocation();
  const { current, loading: weatherLoading } = useWeatherAPI(
    cityQuery ? undefined : location,
    cityQuery,
  );

  // ✅ 配列が渡されていればそちらを優先、なければ単一categoryを配列化して統一的に扱う
  const categoryList = useMemo(
    () => (categories && categories.length > 0 ? categories : [category]),
    [categories, category],
  );

  // ✅ 公式カテゴリ（entertainment / sports）のみで判定。
  //   "エンタメ"/"music"/"スポーツ"はNewsData.ioが返さない値なので削除。
  const shouldShowSpotify = categoryList.includes("entertainment");
  const shouldShowSports = categoryList.includes("sports");

  // ✅ 商品検索キーワード（検索クエリを最優先）
  const productKeyword = useMemo(() => {
    if (searchQuery) {
      return searchQuery;
    }

    if (articleTitle) {
      const cleaned = articleTitle
        .replace(/[「」『』【】\[\]()（）]/g, " ")
        .replace(/[、。,\.!！?？]/g, " ")
        .trim();
      const words = cleaned.split(/\s+/).filter((word) => word.length > 1);
      const productWords = words.filter((word) => {
        const isKatakana = /[\u30A0-\u30FF]/.test(word);
        const hasNumber = /\d/.test(word);
        const isLong = word.length >= 3;
        return isKatakana || hasNumber || isLong;
      });
      return productWords.slice(0, 2).join(" ") || words.slice(0, 2).join(" ");
    }
    return "";
  }, [searchQuery, articleTitle]);

  // ✅ 楽天API（検索クエリに連動）
  const {
    products,
    loading: rakutenLoading,
    error: rakutenError,
  } = useRakutenAPI({
    keyword: productKeyword,
    newsCategory: productKeyword ? undefined : categoryList[0],
    hits: 5,
    autoFetch: true,
  });

  // ============================================================
  // 音楽検索
  // ============================================================

  /**
   * iTunes検索用キーワードを作る。
   *
   * 記事タイトル（またはarticleKeyword）をそのまま整形して検索語にする。
   * ヒットしない場合やキーワードが無い場合は、route.ts側が
   * アクセス国の最新チャートにフォールバックする。
   */
  const musicKeyword = useMemo(() => {
    const targetText = articleKeyword?.trim() || articleTitle?.trim() || "";

    if (!targetText) {
      return "";
    }

    return targetText
      .normalize("NFKC")
      .replace(/[「」『』【】［］\[\]（）()]/g, " ")
      .replace(/[、。,.!！?？:：;；]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }, [articleKeyword, articleTitle]);

  // 常時表示。キーワードが空でもroute.ts側がチャートを返すので出し分け不要。
  const shouldShowMusic = true;

  const {
    tracks,
    source: musicSource,
    loading: musicLoading,
  } = useItunesSearch(musicKeyword, 5);

  // スポーツ
  const sportsKeyword = useMemo(() => {
    if (articleTitle) {
      return articleTitle.split(/\s+/)[0] || "soccer";
    }
    return "soccer";
  }, [articleTitle]);

  const {
    events: sportsEvents,
    loading: sportsLoading,
    error: sportsError,
  } = useSportsDBAPI(shouldShowSports ? sportsKeyword : "");

  const handleWeatherSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setCityQuery(searchCity);
    }
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}
    >
      {/* 天気 */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={700}>
            {t("sidebar.weather")}
          </Typography>
          <Box component="form" onSubmit={handleWeatherSearch} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder={t("sidebar.searchWeather")}
              InputProps={{
                endAdornment: (
                  <IconButton type="submit" size="small" color="primary">
                    <Search />
                  </IconButton>
                ),
              }}
            />
          </Box>
          {weatherLoading ? (
            <LoadingSpinner />
          ) : current ? (
            <Box>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {current.name}, {current.sys.country}
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {Math.round(current.temp)}°C
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    最低 / 最高: {Math.round(current.temp_min)}°C /{" "}
                    {Math.round(current.temp_max)}°C
                  </Typography>
                </Box>
                <WeatherIcon3D iconCode={current.weather[0]?.icon || "01d"} />
              </Stack>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("common.noData")}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* 楽天 */}
      <Card elevation={2}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <img
              src="https://r.r10s.jp/com/img/home/smart/top/app/app_andr_68x68.png"
              alt="Rakuten Logo"
              width={40}
              height={40}
              style={{ display: "block" }}
            />
            <Typography variant="h6" fontWeight={700}>
              {searchQuery
                ? `「${searchQuery}」の関連商品`
                : articleTitle
                  ? "関連商品"
                  : t("sidebar.products")}
            </Typography>
          </Stack>
          {rakutenLoading ? (
            <LoadingSpinner />
          ) : rakutenError ? (
            <Typography variant="body2" color="error">
              {rakutenError}
            </Typography>
          ) : products.length > 0 ? (
            <List disablePadding>
              {products.map((product, index) => (
                <React.Fragment key={product.itemCode}>
                  {index > 0 && <Divider />}
                  <ListItem
                    component="a"
                    href={product.affiliateUrl || product.itemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ px: 0, "&:hover": { bgcolor: "action.hover" } }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={validateImageUrl(product.imageUrl)}
                        alt={product.itemName}
                        sx={{
                          width: 56,
                          height: 56,
                          objectFit: "cover",
                          mr: 1,
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" noWrap>
                          {product.itemName}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="primary"
                          fontWeight={700}
                        >
                          ¥{product.itemPrice.toLocaleString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("common.noData")}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* iTunes */}
      {shouldShowMusic && (
        <Card elevation={2}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  p: 1,
                  bgcolor: "transparent",
                  borderRadius: 1,
                }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Apple_Music_icon.svg"
                  alt="Apple Music Logo"
                  width={40}
                  height={40}
                  style={{ display: "block" }}
                />
              </Box>

              <Typography variant="h6" fontWeight={700}>
                {musicSource === "chart" ? "人気の楽曲" : t("sidebar.music")}
              </Typography>
            </Stack>

            {musicLoading ? (
              <LoadingSpinner />
            ) : tracks.length > 0 ? (
              <List disablePadding>
                {tracks.map((track, index) => (
                  <React.Fragment key={track.trackId}>
                    {index > 0 && <Divider />}

                    <ListItem
                      component="a"
                      href={track.trackViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        px: 0,
                        py: 1.5,
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={validateImageUrl(
                            track.artworkUrl100.replace("100x100", "600x600"),
                          )}
                          alt={track.trackName}
                          sx={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            mr: 1,
                          }}
                        />
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {track.trackName}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {track.artistName}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                関連する楽曲が見つかりませんでした
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* スポーツ */}
      {shouldShowSports && (
        <Card elevation={2}>
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box sx={{ p: 1, bgcolor: "warning.main", borderRadius: 1 }}>
                <SportsBasketball sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                スポーツ
              </Typography>
            </Stack>
            {sportsLoading ? (
              <LoadingSpinner />
            ) : sportsError ? (
              <Typography variant="body2" color="error">
                {sportsError}
              </Typography>
            ) : sportsEvents.length > 0 ? (
              <Stack spacing={2}>
                {sportsEvents.slice(0, 5).map((event) => (
                  <Box
                    key={event.idEvent}
                    sx={{
                      pb: 2,
                      borderBottom: 1,
                      borderColor: "divider",
                      "&:last-child": { borderBottom: 0 },
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      {event.strEvent}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {formatDateShort(event.dateEvent)}
                    </Typography>
                    {event.intHomeScore && event.intAwayScore && (
                      <Chip
                        label={`${event.intHomeScore} - ${event.intAwayScore}`}
                        size="small"
                        color="primary"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                データがありません
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MuiSidebar;
