export type FontKey =
  | 'serif' | 'sans' | 'hand' | 'elegant' | 'script' | 'marker' | 'type' | 'poster' | 'round' | 'indic';
export type Mood = 'motivation' | 'love' | 'calm' | 'funny' | 'sad';
export type Align = 'left' | 'center' | 'right';
export type Size = 's' | 'm' | 'l';
export type TextColor = 'auto' | 'dark' | 'light';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface Comment { id: string; author: string; text: string; mine?: boolean }

export interface Quote {
  id: string;
  text: string;
  author: string; // username without "@"; ignored when `mine` is true
  mine?: boolean;
  theme: number; // index into THEMES
  font: FontKey;
  img?: string | null; // data URL for a gallery background
  align: Align;
  size: Size;
  textColor: TextColor;
  sticker?: string | null;
  mood?: Mood | null;
  tags: string[]; // hidden on the card, used for search
  likes: number;
  liked: boolean;
  collection: string | null; // null = not saved
  comments: Comment[];
}

export interface Me {
  id?: string;
  name: string;
  user: string;
  bio: string;
  avatar?: string | null;
  email?: string;
}

export interface NewQuote {
  text: string; theme: number; font: FontKey; img: string | null;
  align: Align; size: Size; textColor: TextColor; sticker: string | null; mood: Mood | null; tags: string[];
}

export interface Notice {
  id: string; type: 'like' | 'comment' | 'follow'; user: string;
  quoteId?: string; text?: string; read: boolean; at: number;
}

export type Notify = (message: string, action?: { label: string; run: () => void }) => void;
