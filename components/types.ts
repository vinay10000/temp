export type AsciiCell = {
  char: string;
  color: string;
};

export type AsciiFrame = {
  text: string;
  rows: AsciiCell[][];
};
