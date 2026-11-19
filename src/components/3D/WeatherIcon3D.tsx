// components/3D/WeatherIcon3D.tsx
"use client";

import React, {useEffect, useRef} from "react";

interface WeatherIcon3DProps {
  iconCode: string;
  size?: number;
}

// 天気アイコンのマッピング（再生成を避けるためコンポーネント外に定義）
const WEATHER_ICONS: Record<string, string> = {
  "01d": "☀️", // 晴れ（昼）
  "01n": "🌙", // 晴れ（夜）
  "02d": "⛅", // 曇りがち（昼）
  "02n": "☁️", // 曇りがち（夜）
  "03d": "☁️", // 曇り
  "03n": "☁️", // 曇り
  "04d": "☁️", // 厚い雲
  "04n": "☁️", // 厚い雲
  "09d": "🌧️", // にわか雨
  "09n": "🌧️", // にわか雨
  "10d": "🌦️", // 雨（昼）
  "10n": "🌧️", // 雨（夜）
  "11d": "⛈️", // 雷雨
  "11n": "⛈️", // 雷雨
  "13d": "🌨️", // 雪
  "13n": "🌨️", // 雪
  "50d": "🌫️", // 霧
  "50n": "🌫️", // 霧
};

const WeatherIcon3D: React.FC<WeatherIcon3DProps> = ({iconCode, size = 80}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ✅ HiDPI対応
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const emoji = WEATHER_ICONS[iconCode] || "☀️";

    const drawFrame = (rotation: number) => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();

      ctx.translate(size / 2, size / 2);
      ctx.rotate(Math.sin(rotation) * 0.1);
      ctx.translate(-size / 2, -size / 2);

      // 3D効果（影）
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      ctx.font = `${size * 0.6}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, size / 2, size / 2);

      ctx.restore();
    };

    // ✅ アニメーション軽減設定のユーザーには静止画1枚
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      drawFrame(0);
      return;
    }

    // ✅ 毎フレーム更新されるIDを保持し、cleanupで確実に止める
    let raf = 0;
    let rotation = 0;

    const loop = () => {
      rotation += 0.02;
      drawFrame(rotation);
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const startLoop = () => {
      if (raf === 0) raf = requestAnimationFrame(loop);
    };

    // ✅ タブが非表示のときは描画を止める
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        startLoop();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    startLoop();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stop();
    };
  }, [iconCode, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="weather-icon-3d" />;
};

export default WeatherIcon3D;
