export type AsciiCell = {
  char: string;
  color: string;
};

export type ColorMode = "matrix" | "original" | "grayscale" | "amber" | "inverted";

export type AsciiFrame = {
  text: string;
  rows: AsciiCell[][];
};
