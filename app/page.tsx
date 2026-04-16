"use client";

import { useMemo, useState } from "react";
import { ASCIIOutput } from "@/components/ASCIIOutput";
import { CameraCanvas } from "@/components/CameraCanvas";
import { ControlPanel } from "@/components/ControlPanel";
import { MatrixRain } from "@/components/MatrixRain";
import type { AsciiFrame } from "@/components/types";

const CHARSET_PRESETS = {
  dense: "@#S%?*+;:,. ",
  minimal: "@#*:. ",
  matrix: "MATRIX01 .",
} as const;

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function Home() {
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mirror, setMirror] = useState(true);
  const [resolution, setResolution] = useState(120);
  const [charsetPreset, setCharsetPreset] = useState<keyof typeof CHARSET_PRESETS>("dense");
  const [colorMode, setColorMode] = useState<"matrix" | "original">("matrix");
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [fpsLimitEnabled, setFpsLimitEnabled] = useState(true);
  const [fps, setFps] = useState(0);
  const [frame, setFrame] = useState<AsciiFrame | null>(null);

  const charsetPresets = useMemo(
    () => [
      { key: "dense", label: "Dense" },
      { key: "minimal", label: "Minimal" },
      { key: "matrix", label: "Matrix" },
    ],
    []
  );

  const handleDownloadText = () => {
    if (!frame) return;
    downloadBlob(new Blob([frame.text], { type: "text/plain;charset=utf-8" }), "ascii-frame.txt");
  };

  const handleDownloadImage = () => {
    if (!frame) return;
    if (frame.rows.length === 0) return;

    const rowCount = frame.rows.length;
    const colCount = frame.rows[0]?.length ?? 0;
    if (!rowCount || !colCount) return;

    const charWidth = 8;
    const charHeight = 12;

    const canvas = document.createElement("canvas");
    canvas.width = colCount * charWidth + 20;
    canvas.height = rowCount * charHeight + 20;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "12px 'Courier New', monospace";

    frame.rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        context.fillStyle = cell.color;
        context.fillText(cell.char, 10 + colIndex * charWidth, 14 + rowIndex * charHeight);
      });
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, "ascii-frame.png");
    }, "image/png");
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 py-6 text-[#00ff9f] sm:px-8">
      <MatrixRain active={!running} />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="glass-panel rounded-xl border border-emerald-300/30 p-4 text-center">
          <h1 className="ascii-glow text-xl font-bold tracking-[0.2em] sm:text-2xl">REAL-TIME ASCII CAMERA</h1>
          <p className="mt-1 text-xs text-emerald-300/80 sm:text-sm">Cyberpunk webcam renderer with live Matrix terminal output</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <ControlPanel
            running={running}
            mirror={mirror}
            resolution={resolution}
            charsetPreset={charsetPreset}
            charsetPresets={charsetPresets}
            colorMode={colorMode}
            brightness={brightness}
            contrast={contrast}
            fpsLimitEnabled={fpsLimitEnabled}
            fps={fps}
            hasFrame={Boolean(frame)}
            onToggleRunning={() => setRunning((current) => !current)}
            onToggleMirror={() => setMirror((current) => !current)}
            onResolutionChange={setResolution}
            onCharsetPresetChange={(value) => setCharsetPreset(value as keyof typeof CHARSET_PRESETS)}
            onToggleColorMode={() => setColorMode((current) => (current === "matrix" ? "original" : "matrix"))}
            onBrightnessChange={setBrightness}
            onContrastChange={setContrast}
            onToggleFpsLimit={() => setFpsLimitEnabled((current) => !current)}
            onDownloadText={handleDownloadText}
            onDownloadImage={handleDownloadImage}
            onFullscreen={() => {
              void toggleFullscreen();
            }}
          />

          <ASCIIOutput frame={frame} colorMode={colorMode} loading={loading} error={error} />
        </div>
      </div>

      <CameraCanvas
        running={running}
        mirror={mirror}
        resolution={resolution}
        charset={CHARSET_PRESETS[charsetPreset]}
        colorMode={colorMode}
        brightness={brightness}
        contrast={contrast}
        fpsLimitEnabled={fpsLimitEnabled}
        onFrame={setFrame}
        onFpsUpdate={setFps}
        onLoadingChange={setLoading}
        onError={setError}
      />
    </main>
  );
}
