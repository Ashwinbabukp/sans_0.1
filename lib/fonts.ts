import type { FontKey } from './types';

/** Fallback stack so Malayalam, Hindi and Tamil text renders properly in every font. */
export const INDIC = '"Noto Sans Malayalam", "Noto Sans Devanagari", "Noto Sans Tamil"';

export const FONTS: { key: FontKey; label: string; family: string; weight: number; base: number; italic?: boolean; upper?: boolean }[] = [
  { key: 'serif', label: 'Serif', family: '"Young Serif", serif', weight: 400, base: 100 },
  { key: 'sans', label: 'Bold', family: 'Outfit, sans-serif', weight: 700, base: 98 },
  { key: 'hand', label: 'Hand', family: 'Caveat, cursive', weight: 600, base: 130 },
  { key: 'elegant', label: 'Elegant', family: '"Playfair Display", serif', weight: 500, base: 92, italic: true },
  { key: 'script', label: 'Script', family: '"Dancing Script", cursive', weight: 700, base: 124 },
  { key: 'marker', label: 'Marker', family: '"Permanent Marker", cursive', weight: 400, base: 88 },
  { key: 'type', label: 'Type', family: '"Special Elite", "Courier New", monospace', weight: 400, base: 78 },
  { key: 'poster', label: 'Poster', family: '"Bebas Neue", Impact, sans-serif', weight: 400, base: 170, upper: true },
  { key: 'round', label: 'Round', family: 'Fredoka, sans-serif', weight: 600, base: 98 },
  { key: 'indic', label: 'മലയാളം · हिंदी · தமிழ்', family: INDIC, weight: 700, base: 82 },
];
