"use client";

import {CurrentWeather, Location} from "@/types/Weather";
import {
  canMakeRequest,
  getCachedData,
  incrementRequestCount,
  setCachedData,
} from "@/utils/cacheUtils";
import {useCallback, useEffect, useState} from "react";

const WEATHER_API_KEY = "REMOVED";
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

// デフォルト位置（東京）
const DEFAULT_LOCATION: Location = {
  latitude: 35.6762,
  longitude: 139.6503,
};

// 主要都市の座標マッピング
const CITY_COORDINATES: {[key: string]: Location} = {
  tokyo: {latitude: 35.6762, longitude: 139.6503},
  東京: {latitude: 35.6762, longitude: 139.6503},
  osaka: {latitude: 34.6937, longitude: 135.5023},
  大阪: {latitude: 34.6937, longitude: 135.5023},
  kyoto: {latitude: 35.0116, longitude: 135.7681},
  京都: {latitude: 35.0116, longitude: 135.7681},
};

// 現在地取得フック
export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (typeof window === "undefined") {
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setError("Location request timed out");
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      () => {
        clearTimeout(timeoutId);
        setError("Failed to get location");
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
      },
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 300000}
    );
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  return {location, loading, error, refetch: getUserLocation};
};

// 現在の天気取得フック（5日予報削除）
export const useCurrentWeather = (
  location?: Location | null,
  city?: string
) => {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location && !city) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      let effectiveLocation = location;
      let effectiveCity = city;

      if (city) {
        const cityLower = city.toLowerCase();
        if (CITY_COORDINATES[cityLower]) {
          effectiveLocation = CITY_COORDINATES[cityLower];
          effectiveCity = undefined;
        }
      }

      const cacheKey = `weather_current_${
        effectiveCity
          ? effectiveCity.toLowerCase()
          : `${effectiveLocation?.latitude}_${effectiveLocation?.longitude}`
      }`;

      const cached = getCachedData<CurrentWeather>(cacheKey);
      if (cached) {
        setWeather(cached);
        setLoading(false);
        return;
      }

      if (!canMakeRequest()) {
        setError("API limit reached. Showing cached data.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let url = `${WEATHER_API_BASE_URL}/weather?appid=${WEATHER_API_KEY}&units=metric&lang=ja`;

        if (effectiveLocation) {
          url += `&lat=${effectiveLocation.latitude}&lon=${effectiveLocation.longitude}`;
        } else if (effectiveCity) {
          url += `&q=${encodeURIComponent(effectiveCity)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `API Error: ${response.status} - ${errorData.message || "Unknown"}`
          );
        }

        incrementRequestCount();

        const data = await response.json();

        // timezone を追加して CurrentWeather 型に対応
        const weatherData: CurrentWeather = {
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          temp_min: data.main.temp_min,
          temp_max: data.main.temp_max,
          pressure: data.main.pressure,
          humidity: data.main.humidity,
          weather: data.weather,
          wind: data.wind,
          clouds: data.clouds,
          dt: data.dt,
          sys: data.sys,
          name: data.name,
          timezone: data.timezone, // ここを追加
        };

        setWeather(weatherData);
        setCachedData(cacheKey, weatherData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch weather"
        );
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location, city]);

  return {weather, loading, error};
};

// 統合フック（forecastは削除）
export const useWeatherAPI = (location?: Location | null, city?: string) => {
  const currentWeather = useCurrentWeather(location, city);

  return {
    current: currentWeather.weather,
    loading: currentWeather.loading,
    error: currentWeather.error,
  };
};

// UNIX秒とtimezone秒から現地時間表示
const formatLocalTime = (timestamp: number, timezoneOffset: number) => {
  // timestamp + timezoneOffset は秒単位なのでミリ秒に変換
  const date = new Date((timestamp + timezoneOffset) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
