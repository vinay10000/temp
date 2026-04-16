"use client";

import { useMemo } from "react";
import type { AsciiFrame } from "./types";

type ASCIIOutputProps = {
  frame: AsciiFrame | null;
  colorMode: "matrix" | "original";
  loading: boolean;
  error: string | null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const sanitizeColor = (value: string) =>
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$|^rgb\(\d{1,3},\s\d{1,3},\s\d{1,3}\)$/.test(value)
    ? value
    : "#00ff9f";

export function ASCIIOutput({ frame, colorMode, loading, error }: ASCIIOutputProps) {

  const renderedAscii = useMemo(() => {
    if (!frame) {
      return "";
    }

    if (colorMode === "matrix") {
      return escapeHtml(frame.text).replace(/\n/g, "<br/>");
    }

    return frame.rows
      .map((row) =>
        row
          .map(
            (cell) =>
              `<span style=\"color:${sanitizeColor(cell.color)}\">${escapeHtml(cell.char)}</span>`
          )
          .join("")
      )
      .join("<br/>");
  }, [frame, colorMode]);

  return (
    <div className="relative min-h-[260px] max-h-[65vh] overflow-auto rounded-xl border border-emerald-400/30 bg-black/70 p-3 shadow-[0_0_35px_rgba(0,255,159,0.2)] backdrop-blur-sm sm:min-h-[300px] sm:max-h-none sm:p-4">
      <pre
        className="ascii-output m-0 font-mono text-[7px] leading-[0.85] text-[#00ff9f] sm:text-[9px] lg:text-[10px]"
        dangerouslySetInnerHTML={{
          __html:
            renderedAscii ||
            (loading
              ? "Initializing camera..."
              : error ?? "Press START CAMERA to begin the Matrix feed."),
        }}
      />
      <div className="scanline-overlay" aria-hidden="true" />
    </div>
  );
}
