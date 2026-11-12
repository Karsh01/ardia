export const DEFAULT_SIDEBAR_WIDTH = 190;

export const CARD_INSET = 9;

export const PAGE_FRAME = { min: 0, max: 12, default: CARD_INSET } as const;

const SPLIT_MIN_GAP = 2;

export const validPageFrame = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= PAGE_FRAME.min && v <= PAGE_FRAME.max;

export type PageFrame = {
  inset: number;
  radius: number;
  splitGap: number;
  peek: { left: number; top: number; bottom: number; radius: number };
};

export function pageFrameOf(_inset: number, _windowRadius: number, _peekRadius: number): PageFrame {
  return {
    inset: 0,
    radius: 0,
    splitGap: SPLIT_MIN_GAP,
    peek: { left: 0, top: 0, bottom: 0, radius: 0 },
  };
}
