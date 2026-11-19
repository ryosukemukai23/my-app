"use client";

import React, {useEffect, useRef} from "react";

interface Logo3DProps {
  size?: number;
  durationMs?: number; // one-way duration for 0 -> 180deg, animation ping-pongs
}

const Logo3D: React.FC<Logo3DProps> = ({size = 120, durationMs = 1400}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // HiDPI handling
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    const start = performance.now();

    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const draw = (now: number) => {
      const elapsed = now - start;
      // ping-pong 0..1..0 over durationMs*2
      const t = (elapsed % (durationMs * 2)) / durationMs; // 0..2
      const phase = t <= 1 ? t : 2 - t; // 0..1..0
      const eased = easeInOutCubic(phase);
      // angle around X-axis from 0 -> PI (0..180deg)
      const angle = eased * Math.PI;

      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.44;

      // ===== ベース（オーブ） =====
      // 赤系グラデーション: #c43a4f -> #801b2b -> #3d0a12
      {
        const baseGradient = ctx.createRadialGradient(
          cx - radius * 0.35,
          cy - radius * 0.35,
          radius * 0.1,
          cx,
          cy,
          radius,
        );
        baseGradient.addColorStop(0, "#c43a4f");
        baseGradient.addColorStop(0.6, "#801b2b");
        baseGradient.addColorStop(1, "#3d0a12");

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = baseGradient;
        ctx.fill();
      }

      // ===== X軸回転表現 =====
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const scaleY = Math.abs(cos); // vertical compression to simulate X-rotation
      const facingFront = cos >= 0; // front face when cos >= 0
      const depth = sin * (size * 0.06); // depth used to offset extrusion vertically

      // Draw letter "N" only (beveled / extruded)
      ctx.save();
      ctx.translate(cx, cy);

      const shearX = sin * 0.04 * (facingFront ? 1 : -1);
      ctx.transform(1, shearX, 0, scaleY, 0, 0);

      const topColor = facingFront ? "#ffffff" : "#f0e9e9";
      const midColor = facingFront ? "#ffdfe4" : "#c4b3b6";
      const shadowColor = facingFront ? "#8b1b2b" : "#2e2630";

      const text = "N";
      const fontSize = Math.round(size * 0.42);
      ctx.font = `700 ${fontSize}px "Inter", "Segoe UI", Roboto, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Extrusion
      const extrudeSteps = Math.max(5, Math.round(size / 22));
      for (let i = extrudeSteps; i >= 1; i--) {
        const step = i / extrudeSteps;
        const offsetY = (step * depth) | 0;
        const alpha = 0.5 * (step / extrudeSteps);
        ctx.fillStyle = `rgba(15,8,10,${alpha})`;
        ctx.fillText(text, 0, offsetY);
      }

      // Top face
      const faceGrad = ctx.createLinearGradient(-size * 0.25, -size * 0.35, size * 0.25, size * 0.35);
      faceGrad.addColorStop(0, topColor);
      faceGrad.addColorStop(0.5, midColor);
      faceGrad.addColorStop(1, shadowColor);
      ctx.fillStyle = faceGrad;
      ctx.fillText(text, 0, 0);

      // crisp stroke to define edges
      ctx.lineWidth = Math.max(1, size * 0.02);
      ctx.strokeStyle = "rgba(0,0,0,0.28)";
      ctx.strokeText(text, 0, 0);

      // subtle rim highlight when front-facing
      if (facingFront) {
        ctx.globalCompositeOperation = "screen";
        const rim = ctx.createLinearGradient(-size * 0.2, -size * 0.6, size * 0.2, size * 0.2);
        rim.addColorStop(0, "rgba(255,255,255,0.36)");
        rim.addColorStop(0.6, "rgba(255,255,255,0.06)");
        rim.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = rim;
        ctx.fillText(text, -depth * 0.08, -depth * 0.06);
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.restore();

      // soft shadow beneath
      {
        ctx.save();
        const shadowY = cy + size * 0.34 + Math.max(0, depth) * 0.6;
        ctx.translate(cx, shadowY);
        ctx.scale(1, 0.22 + 0.38 * scaleY);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 0.9, radius * 0.5, 0, 0, Math.PI * 2);
        const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.9);
        sg.addColorStop(0, "rgba(0,0,0,0.28)");
        sg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = sg;
        ctx.fill();
        ctx.restore();
      }

      // light reflection on orb
      {
        ctx.beginPath();
        const hg = ctx.createRadialGradient(
          cx - radius * 0.45,
          cy - radius * 0.45,
          0,
          cx - radius * 0.45,
          cy - radius * 0.45,
          radius * 0.9,
        );
        hg.addColorStop(0, "rgba(255,255,255,0.22)");
        hg.addColorStop(0.35, "rgba(255,255,255,0.06)");
        hg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = hg;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const startLoop = () => {
      if (raf === 0) raf = requestAnimationFrame(loop);
    };

    // ✅ アニメーション軽減設定のユーザーには静止画1枚
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      draw(start);
      return;
    }

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
  }, [size, durationMs]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

export default Logo3D;
