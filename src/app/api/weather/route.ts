// app/api/weather/route.ts
import {NextRequest, NextResponse} from "next/server";

// ブラウザからOpenWeatherMapを直接呼ぶとAPIキーが露出するため、
// このRoute Handlerで中継する。
// - APIキー(OPENWEATHER_API_KEY)はサーバー側の環境変数にのみ置く
// - 外部APIが応答しない場合に備えて、タイムアウトを設ける
// - Next.jsのData Cacheで結果を共有し、無料枠の消費を抑える
// - 座標は小数第2位に丸める（約1km単位）。キャッシュが効きやすくなり、
//   ユーザーの正確な位置情報をAPIに送らずに済む

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";
const TIMEOUT_MS = 5000;
const REVALIDATE_SECONDS = 600; // 10分
const MAX_CITY_LENGTH = 100;

const parseCoordinate = (value: string | null, min: number, max: number): number | null => {
  if (value === null || value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num >= min && num <= max ? num : null;
};

export async function GET(request: NextRequest) {
  if (!OPENWEATHER_API_KEY) {
    console.error("❌ [API Route] /api/weather: OPENWEATHER_API_KEY is not set");
    return NextResponse.json({error: "Weather API is not configured"}, {status: 500});
  }

  const {searchParams} = new URL(request.url);
  const lat = parseCoordinate(searchParams.get("lat"), -90, 90);
  const lon = parseCoordinate(searchParams.get("lon"), -180, 180);
  const city = (searchParams.get("q") ?? "").trim().slice(0, MAX_CITY_LENGTH);

  const params = new URLSearchParams({
    appid: OPENWEATHER_API_KEY,
    units: "metric",
    lang: "ja",
  });

  if (lat !== null && lon !== null) {
    params.set("lat", lat.toFixed(2));
    params.set("lon", lon.toFixed(2));
  } else if (city) {
    params.set("q", city);
  } else {
    return NextResponse.json({error: "lat/lon or q is required"}, {status: 400});
  }

  try {
    const response = await fetch(`${WEATHER_API_BASE_URL}/weather?${params.toString()}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: {revalidate: REVALIDATE_SECONDS},
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ [API Route] /api/weather upstream error:", response.status, errorData.message);
      // 都市が見つからない場合のみ404、それ以外は上流のエラーとして502を返す
      return NextResponse.json(
        {error: errorData.message || "Weather API error"},
        {status: response.status === 404 ? 404 : 502},
      );
    }

    const data = await response.json();

    return NextResponse.json({
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
      timezone: data.timezone,
    });
  } catch (error) {
    console.error("❌ [API Route] /api/weather error:", error);
    return NextResponse.json({error: "Failed to fetch weather"}, {status: 502});
  }
}
