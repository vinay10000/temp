"use client";

import type { ColorMode } from "./types";

type CharsetPreset = {
  key: string;
  label: string;
};

type ColorModeOption = {
  key: ColorMode;
  label: string;
};

type ControlPanelProps = {
  running: boolean;
  mirror: boolean;
  resolution: number;
  charsetPreset: string;
  charsetPresets: CharsetPreset[];
  colorMode: ColorMode;
  colorModes: ColorModeOption[];
  brightness: number;
  contrast: number;
  blockSize: number;
  fpsLimitEnabled: boolean;
  fps: number;
  hasFrame: boolean;
  onToggleRunning: () => void;
  onToggleMirror: () => void;
  onResolutionChange: (value: number) => void;
  onCharsetPresetChange: (value: string) => void;
  onColorModeChange: (value: ColorMode) => void;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onBlockSizeChange: (value: number) => void;
  onToggleFpsLimit: () => void;
  onDownloadText: () => void;
  onDownloadImage: () => void;
  onFullscreen: () => void;
};

export function ControlPanel({
  running,
  mirror,
  resolution,
  charsetPreset,
  charsetPresets,
  colorMode,
  colorModes,
  brightness,
  contrast,
  blockSize,
  fpsLimitEnabled,
  fps,
  hasFrame,
  onToggleRunning,
  onToggleMirror,
  onResolutionChange,
  onCharsetPresetChange,
  onColorModeChange,
  onBrightnessChange,
  onContrastChange,
  onBlockSizeChange,
  onToggleFpsLimit,
  onDownloadText,
  onDownloadImage,
  onFullscreen,
}: ControlPanelProps) {
  return (
    <aside className="glass-panel space-y-4 rounded-xl border border-emerald-300/30 p-4 text-xs sm:text-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-widest text-emerald-200">CONTROL PANEL</h2>
        <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-emerald-300">
          {fps.toFixed(1)} FPS
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className="control-btn" onClick={onToggleRunning} type="button">
          {running ? "STOP CAMERA" : "START CAMERA"}
        </button>
        <button className="control-btn" onClick={onFullscreen} type="button">
          FULLSCREEN
        </button>
        <button className="control-btn" onClick={onDownloadText} type="button" disabled={!hasFrame}>
          DOWNLOAD TXT
        </button>
        <button className="control-btn" onClick={onDownloadImage} type="button" disabled={!hasFrame}>
          DOWNLOAD PNG
        </button>
      </div>

      <label className="control-row">
        <span>Mirror Mode</span>
        <input checked={mirror} onChange={onToggleMirror} type="checkbox" />
      </label>

      <label className="control-row">
        <span>FPS Limiter (15)</span>
        <input checked={fpsLimitEnabled} onChange={onToggleFpsLimit} type="checkbox" />
      </label>

      <label className="space-y-1 block">
        <span className="control-label">Resolution: {resolution}</span>
        <input
          type="range"
          min={60}
          max={180}
          step={5}
          value={resolution}
          onChange={(event) => onResolutionChange(Number(event.target.value))}
          className="w-full"
        />
      </label>

      <label className="space-y-1 block">
        <span className="control-label">Charset</span>
        <select
          value={charsetPreset}
          onChange={(event) => onCharsetPresetChange(event.target.value)}
          className="w-full rounded border border-emerald-400/40 bg-black/50 p-2"
        >
          {charsetPresets.map((preset) => (
            <option key={preset.key} value={preset.key}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 block">
        <span className="control-label">Color Effect</span>
        <select
          value={colorMode}
          onChange={(event) => onColorModeChange(event.target.value as ColorMode)}
          className="w-full rounded border border-emerald-400/40 bg-black/50 p-2"
        >
          {colorModes.map((mode) => (
            <option key={mode.key} value={mode.key}>
              {mode.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 block">
        <span className="control-label">Block Size: {blockSize}px</span>
        <input
          type="range"
          min={6}
          max={16}
          step={1}
          value={blockSize}
          onChange={(event) => onBlockSizeChange(Number(event.target.value))}
          className="w-full"
        />
      </label>

      <label className="space-y-1 block">
        <span className="control-label">Brightness: {brightness}</span>
        <input
          type="range"
          min={-100}
          max={100}
          value={brightness}
          onChange={(event) => onBrightnessChange(Number(event.target.value))}
          className="w-full"
        />
      </label>

      <label className="space-y-1 block">
        <span className="control-label">Contrast: {contrast}</span>
        <input
          type="range"
          min={-100}
          max={100}
          value={contrast}
          onChange={(event) => onContrastChange(Number(event.target.value))}
          className="w-full"
        />
      </label>
    </aside>
  );
}
