import type { CSSProperties } from 'react';
import type { Me, Quote, TextColor } from './types';
import { THEMES } from './themes';

export function cardStyle(theme: number, img?: string | null, textColor: TextColor = 'auto'): CSSProperties {
  const over = textColor === 'dark' ? '#14141C' : textColor === 'light' ? '#FFFFFF' : null;
  if (img) {
    return {
      '--bg': '#000', '--solid': '#000', '--fg': over ?? '#fff',
      backgroundImage: `linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.5)),url(${img})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
    } as CSSProperties;
  }
  const t = THEMES[theme] ?? THEMES[0];
  return { '--bg': t.bg, '--solid': t.solid, '--fg': over ?? t.fg } as CSSProperties;
}

export const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n));

export const initials = (name: string) =>
  name.trim().split(/\s+/).map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase();

export const titleName = (user: string) =>
  user.split(/[._]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

export function authorOf(q: Quote, me: Me) {
  return q.mine
    ? { key: 'me', name: me.name, user: me.user }
    : { key: q.author, name: titleName(q.author), user: q.author };
}

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/** One quote from the community per day, the same for everyone on that date. */
export function quoteOfDay(quotes: Quote[]): string | null {
  const list = quotes.filter((q) => !q.mine);
  if (!list.length) return null;
  const d = new Date();
  const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return list[day % list.length].id;
}

const TAG = /#[\p{L}\p{N}_]+/gu;

export const cleanTag = (t: string) =>
  t.toLowerCase().replace(/^#/, '').replace(/[^\p{L}\p{N}_]/gu, '').slice(0, 20);

/** Moves any #hashtags typed in the quote out of the visible text and into tags. */
export function splitTags(text: string): { text: string; tags: string[] } {
  const tags = (text.match(TAG) ?? []).map(cleanTag).filter(Boolean);
  const clean = text.replace(TAG, '').replace(/\s{2,}/g, ' ').trim();
  return { text: clean || text.trim(), tags };
}

export function searchQuotes(quotes: Quote[], query: string): Quote[] {
  const s = query.trim().toLowerCase();
  if (!s) return [];
  if (s.startsWith('#')) {
    const tag = cleanTag(s);
    return quotes.filter((q) => (q.tags ?? []).includes(tag));
  }
  return quotes.filter((q) =>
    q.text.toLowerCase().includes(s) || q.author.toLowerCase().includes(s) ||
    (q.mood ?? '').includes(s) || (q.tags ?? []).some((t) => t.includes(s)));
}

export function trendingTags(quotes: Quote[], n = 8): string[] {
  const count = new Map<string, number>();
  quotes.forEach((q) => (q.tags ?? []).forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([t]) => `#${t}`);
}

export function timeAgo(at: number): string {
  const m = Math.floor((Date.now() - at) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

/** Downscale a gallery photo so it stays light in the feed and in localStorage. */
export function resizeImage(file: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Not an image')); };
    img.src = url;
  });
}
