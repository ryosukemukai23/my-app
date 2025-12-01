// components/3D/WeatherIcon3D.tsx
"use client";

import React, {useEffect, useRef} from "react";

interface WeatherIcon3DProps {
  iconCode: string;
  size?: number;
}

const WeatherIcon3D: React.FC<WeatherIcon3DProps> = ({iconCode, size = 80}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // キャンバスをクリア
    ctx.clearRect(0, 0, size, size);

    // 天気アイコンのマッピング
    const weatherIcons: Record<string, string> = {
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

    const emoji = weatherIcons[iconCode] || "☀️";

    // 3D効果（影とグラデーション）
    ctx.save();

    // 影を描画
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    // 絵文字を描画
    ctx.font = `${size * 0.6}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, size / 2, size / 2);

    ctx.restore();

    // アニメーション（回転）
    let rotation = 0;
    const animate = () => {
      rotation += 0.02;

      ctx.clearRect(0, 0, size, size);
      ctx.save();

      ctx.translate(size / 2, size / 2);
      ctx.rotate(Math.sin(rotation) * 0.1);
      ctx.translate(-size / 2, -size / 2);

      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      ctx.font = `${size * 0.6}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, size / 2, size / 2);

      ctx.restore();

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [iconCode, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="weather-icon-3d"
    />
  );
};

export default WeatherIcon3D;
