import type { Quote } from './types';
import { THEMES } from './themes';
import { FONTS, INDIC } from './fonts';
import { initials } from './utils';
import { CTA, TAGLINE } from './brand';

export type ShareFormat = 'post' | 'story';
export type ShareStyle = 'frame' | 'minimal';
export const SIZES = { post: { w: 1080, h: 1350 }, story: { w: 1080, h: 1920 } } as const;

type Ctx = CanvasRenderingContext2D;
interface Box { x: number; y: number; w: number; h: number }

const INK = '#181512';
const COBALT = '#052BA8';

const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
  });

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: Ctx, text: string, maxW: number) {
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(/\s+/)) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function paintCard(ctx: Ctx, q: Quote, b: Box, r: number, img: HTMLImageElement | null) {
  const t = THEMES[q.theme] ?? THEMES[0];
  ctx.save();
  rr(ctx, b.x, b.y, b.w, b.h, r);
  ctx.clip();
  if (img) {
    const s = Math.max(b.w / img.width, b.h / img.height);
    ctx.drawImage(img, b.x + (b.w - img.width * s) / 2, b.y + (b.h - img.height * s) / 2, img.width * s, img.height * s);
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(b.x, b.y, b.w, b.h);
  } else if (t.stops) {
    const g = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    g.addColorStop(0, t.stops[0]); g.addColorStop(1, t.stops[1]);
    ctx.fillStyle = g; ctx.fillRect(b.x, b.y, b.w, b.h);
  } else {
    ctx.fillStyle = t.bg; ctx.fillRect(b.x, b.y, b.w, b.h);
  }
  ctx.restore();
}

function drawQuote(ctx: Ctx, q: Quote, box: Box, fg: string, marks: boolean) {
  const f = FONTS.find((x) => x.key === q.font) ?? FONTS[0];
  const fam = `${f.family}, ${INDIC}, sans-serif`;
  const style = `${f.italic ? 'italic ' : ''}${f.weight}`;
  let text = marks ? `“${q.text}”` : q.text;
  if (f.upper) text = text.toUpperCase();
  let size = Math.round(f.base * (q.size === 's' ? 0.85 : q.size === 'l' ? 1.2 : 1));
  let lines: string[] = [];
  for (;;) {
    ctx.font = `${style} ${size}px ${fam}`;
    lines = wrap(ctx, text, box.w);
    if (lines.length * size * 1.22 <= box.h || size < 40) break;
    size -= 4;
  }
  const lh = size * 1.22;
  const x = q.align === 'left' ? box.x : q.align === 'right' ? box.x + box.w : box.x + box.w / 2;
  let y = box.y + (box.h - lines.length * lh) / 2 + lh / 2;
  ctx.fillStyle = fg; ctx.textAlign = q.align; ctx.textBaseline = 'middle';
  for (const l of lines) { ctx.fillText(l, x, y); y += lh; }
}

function drawAuthor(ctx: Ctx, x: number, y: number, fg: string, inv: string, name: string, user: string) {
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(x + 40, y, 40, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = inv; ctx.textAlign = 'center'; ctx.font = '700 36px Outfit, sans-serif';
  ctx.fillText(initials(name), x + 40, y + 2);
  ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.font = '700 38px Outfit, sans-serif';
  ctx.fillText(name, x + 100, y - 17);
  ctx.globalAlpha = 0.7; ctx.font = '400 30px Outfit, sans-serif';
  ctx.fillText(`@${user}`, x + 100, y + 24); ctx.globalAlpha = 1;
}

function drawBrand(ctx: Ctx, cx: number, y: number, size: number, color: string) {
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = `800 ${size}px "Bricolage Grotesque", sans-serif`;
  const a = ctx.measureText('sans').width, b = ctx.measureText('.').width;
  const x0 = cx - (a + b) / 2;
  ctx.fillStyle = color; ctx.fillText('sans', x0, y);
  ctx.fillStyle = COBALT; ctx.fillText('.', x0 + a, y);
}

function drawLine(ctx: Ctx, cx: number, y: number, size: number, color: string, alpha: number, text: string) {
  ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `400 ${size}px Outfit, sans-serif`;
  ctx.fillText(text, cx, y); ctx.globalAlpha = 1;
}

function drawPill(ctx: Ctx, cx: number, y: number, text: string, bg: string, fg: string) {
  ctx.font = '700 32px Outfit, sans-serif';
  const w = ctx.measureText(text).width + 80, h = 78;
  rr(ctx, cx - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = bg; ctx.fill();
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, y + 2);
}

/**
 * Instagram-ready share card.
 * "frame": the quote card floats on a soft tinted backdrop with the sans. brand underneath.
 * "minimal": full-bleed colour, big quote mark, lots of space, tiny brand at the bottom.
 */
export async function renderShareCard(
  q: Quote, name: string, user: string, opts: { format: ShareFormat; style: ShareStyle },
): Promise<Blob> {
  const { w: W, h: H } = SIZES[opts.format];
  const story = opts.format === 'story';
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  const t = THEMES[q.theme] ?? THEMES[0];
  const fg = q.textColor === 'dark' ? INK : q.textColor === 'light' ? '#FFFFFF' : q.img ? '#FFFFFF' : t.fg;
  const inv = fg === '#FFFFFF' ? INK : q.img ? INK : t.solid;
  const img = q.img ? await loadImg(q.img) : null;

  const f = FONTS.find((x) => x.key === q.font) ?? FONTS[0];
  if (typeof document !== 'undefined' && document.fonts?.load) {
    await Promise.all([
      document.fonts.load(`${f.italic ? 'italic ' : ''}${f.weight} 100px ${f.family}, ${INDIC}`, q.text),
      document.fonts.load('800 60px "Bricolage Grotesque"'),
      document.fonts.load('400 30px Outfit'),
      document.fonts.load('700 36px Outfit'),
      document.fonts.load('400 100px "Young Serif"'),
    ]).catch(() => undefined);
  }

  const cta = `${TAGLINE} ${CTA}`;

  if (opts.style === 'frame') {
    ctx.fillStyle = t.solid; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.62)'; ctx.fillRect(0, 0, W, H);

    const card: Box = { x: 90, y: story ? 300 : 96, w: 900, h: story ? 1120 : 1010 };
    ctx.save();
    ctx.shadowColor = 'rgba(45,37,82,.22)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 28;
    rr(ctx, card.x, card.y, card.w, card.h, 60);
    ctx.fillStyle = img ? '#000' : t.solid; ctx.fill();
    ctx.restore();
    paintCard(ctx, q, card, 60, img);

    drawQuote(ctx, q, { x: card.x + 80, y: card.y + 170, w: card.w - 160, h: card.h - 170 - 230 }, fg, true);
    drawAuthor(ctx, card.x + 80, card.y + card.h - 110, fg, inv, name, user);

    const fy = card.y + card.h;
    if (story) {
      drawBrand(ctx, W / 2, fy + 130, 96, INK);
      drawLine(ctx, W / 2, fy + 232, 36, INK, 0.65, TAGLINE);
      drawPill(ctx, W / 2, fy + 340, CTA, INK, '#FFFFFF');
    } else {
      drawBrand(ctx, W / 2, fy + (H - fy) * 0.38, 64, INK);
      drawLine(ctx, W / 2, fy + (H - fy) * 0.76, 30, INK, 0.62, cta);
    }
  } else {
    paintCard(ctx, q, { x: 0, y: 0, w: W, h: H }, 0, img);
    const pad = 110;
    const top = story ? 380 : 250;
    const bottom = story ? H - 640 : H - 420;

    ctx.globalAlpha = 0.16; ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = '400 340px "Young Serif", serif';
    ctx.fillText('“', pad - 14, top + 190);
    ctx.globalAlpha = 1;

    drawQuote(ctx, q, { x: pad, y: top + 110, w: W - pad * 2, h: bottom - top - 130 }, fg, false);

    ctx.globalAlpha = 0.5; ctx.fillStyle = fg; ctx.fillRect(pad, bottom + 24, 110, 5); ctx.globalAlpha = 1;
    drawAuthor(ctx, pad, bottom + 120, fg, inv, name, user);

    const by = story ? H - 360 : H - 150;
    drawBrand(ctx, W / 2, by, 58, fg);
    drawLine(ctx, W / 2, by + 62, 28, fg, 0.7, cta);
  }

  return new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Export failed'))), 'image/png'));
}
