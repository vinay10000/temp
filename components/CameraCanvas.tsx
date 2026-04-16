"use client";

import { useEffect, useRef } from "react";
import type { AsciiFrame } from "./types";

type CameraCanvasProps = {
  running: boolean;
  mirror: boolean;
  resolution: number;
  charset: string;
  colorMode: "matrix" | "original";
  brightness: number;
  contrast: number;
  fpsLimitEnabled: boolean;
  onFrame: (frame: AsciiFrame) => void;
  onFpsUpdate: (fps: number) => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (message: string | null) => void;
};

const clampColor = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

export function CameraCanvas({
  running,
  mirror,
  resolution,
  charset,
  colorMode,
  brightness,
  contrast,
  fpsLimitEnabled,
  onFrame,
  onFpsUpdate,
  onLoadingChange,
  onError,
}: CameraCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameTsRef = useRef<number>(0);
  const fpsCounterRef = useRef({ frames: 0, lastTs: 0 });

  useEffect(() => {
    const stopCamera = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      onFpsUpdate(0);
      onLoadingChange(false);
    };

    if (!running) {
      stopCamera();
      return stopCamera;
    }

    const startCamera = async () => {
      onError(null);
      onLoadingChange(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) {
          return;
        }

        video.srcObject = stream;
        await video.play();
        onLoadingChange(false);

        const render = (ts: number) => {
          const videoElement = videoRef.current;
          const canvas = canvasRef.current;
          if (!videoElement || !canvas) {
            rafRef.current = requestAnimationFrame(render);
            return;
          }

          const targetFps = fpsLimitEnabled ? 15 : 0;
          if (targetFps > 0 && ts - lastFrameTsRef.current < 1000 / targetFps) {
            rafRef.current = requestAnimationFrame(render);
            return;
          }
          lastFrameTsRef.current = ts;

          if (videoElement.readyState < 2 || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            rafRef.current = requestAnimationFrame(render);
            return;
          }

          const cols = Math.max(30, resolution);
          const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
          const rows = Math.max(20, Math.round((cols / aspectRatio) * 0.55));

          canvas.width = cols;
          canvas.height = rows;

          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) {
            rafRef.current = requestAnimationFrame(render);
            return;
          }

          ctx.save();
          if (mirror) {
            ctx.scale(-1, 1);
            ctx.drawImage(videoElement, -cols, 0, cols, rows);
          } else {
            ctx.drawImage(videoElement, 0, 0, cols, rows);
          }
          ctx.restore();

          const imageData = ctx.getImageData(0, 0, cols, rows).data;

          const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

          const applyAdjustments = (channel: number) => {
            const withBrightness = channel + brightness;
            const withContrast = contrastFactor * (withBrightness - 128) + 128;
            return clampColor(withContrast);
          };

          const frameRows: AsciiFrame["rows"] = [];
          const textLines: string[] = [];

          for (let y = 0; y < rows; y += 1) {
            const textLineChars: string[] = [];
            const row: AsciiFrame["rows"][number] = [];

            for (let x = 0; x < cols; x += 1) {
              const index = (y * cols + x) * 4;
              if (index + 3 >= imageData.length) {
                continue;
              }
              const red = applyAdjustments(imageData[index]);
              const green = applyAdjustments(imageData[index + 1]);
              const blue = applyAdjustments(imageData[index + 2]);
              const grayscale = 0.299 * red + 0.587 * green + 0.114 * blue;

              const charIndex = Math.floor((grayscale / 255) * (charset.length - 1));
              const safeIndex = Math.max(0, Math.min(charset.length - 1, charIndex));
              const char = charset[safeIndex];

              textLineChars.push(char);
              row.push({
                char,
                color: colorMode === "original" ? `rgb(${red}, ${green}, ${blue})` : "#00ff9f",
              });
            }

            textLines.push(textLineChars.join(""));
            frameRows.push(row);
          }

          onFrame({
            text: textLines.join("\n"),
            rows: frameRows,
          });

          if (fpsCounterRef.current.lastTs === 0) {
            fpsCounterRef.current.lastTs = ts;
          }
          fpsCounterRef.current.frames += 1;
          if (ts - fpsCounterRef.current.lastTs >= 500) {
            const elapsed = ts - fpsCounterRef.current.lastTs;
            const fps = (fpsCounterRef.current.frames * 1000) / elapsed;
            onFpsUpdate(Number(fps.toFixed(1)));
            fpsCounterRef.current.frames = 0;
            fpsCounterRef.current.lastTs = ts;
          }

          rafRef.current = requestAnimationFrame(render);
        };

        rafRef.current = requestAnimationFrame(render);
      } catch (error) {
        onLoadingChange(false);
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          onError("Camera permission denied. Please allow webcam access.");
        } else if (error instanceof DOMException && error.name === "NotFoundError") {
          onError("No camera detected on this device.");
        } else {
          onError("Unable to access camera. Please check webcam permissions and availability.");
        }
        onFpsUpdate(0);
      }
    };

    void startCamera();

    return stopCamera;
  }, [
    running,
    mirror,
    resolution,
    charset,
    colorMode,
    brightness,
    contrast,
    fpsLimitEnabled,
    onFrame,
    onFpsUpdate,
    onLoadingChange,
    onError,
  ]);

  return (
    <div className="hidden">
      <video ref={videoRef} playsInline muted autoPlay />
      <canvas ref={canvasRef} />
    </div>
  );
}
