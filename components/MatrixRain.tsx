"use client";

import { useEffect, useRef } from "react";

type MatrixRainProps = {
  active: boolean;
};

export function MatrixRain({ active }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const chars = "01アァカサタナハマヤャラワ0123456789";
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.max(1, Math.floor(canvas.width / 14));
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -100));
    };

    resize();
    window.addEventListener("resize", resize);

    let animationId = 0;
    let last = 0;
    const draw = (timestamp: number) => {
      if (timestamp - last < 50) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      last = timestamp;

      context.fillStyle = "rgba(0, 0, 0, 0.08)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#00ff9f";
      context.font = "14px 'Courier New', monospace";

      for (let index = 0; index < drops.length; index += 1) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        context.fillText(text, index * 14, drops[index] * 14);

        if (drops[index] * 14 > canvas.height && Math.random() > 0.975) {
          drops[index] = 0;
        }
        drops[index] += 1;
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return <canvas ref={canvasRef} className={`pointer-events-none fixed inset-0 z-0 transition-opacity ${active ? "opacity-30" : "opacity-0"}`} />;
}
