'use client';

import { useState, type ChangeEvent, type ReactNode } from 'react';
import type { Align, FontKey, Mood, NewQuote, Size, TextColor } from '@/lib/types';
import { THEMES } from '@/lib/themes';
import { FONTS } from '@/lib/fonts';
import { MOODS, STICKERS } from '@/lib/moods';
import { cardStyle, cleanTag, resizeImage, splitTags } from '@/lib/utils';
import { useDialog } from '@/lib/useDialog';

interface Props { open: boolean; onClose: () => void; onPost: (q: NewQuote) => void }

const MAX_TAGS = 5;
const SUGGESTED = ['life', 'love', 'motivation', 'friendship', 'selflove', 'gratitude'];

const ALIGNS: { k: Align; l: string }[] = [{ k: 'left', l: 'Left' }, { k: 'center', l: 'Center' }, { k: 'right', l: 'Right' }];
const SIZES: { k: Size; l: string }[] = [{ k: 's', l: 'S' }, { k: 'm', l: 'M' }, { k: 'l', l: 'L' }];
const COLORS: { k: TextColor; l: string }[] = [{ k: 'auto', l: 'Auto' }, { k: 'dark', l: 'Dark' }, { k: 'light', l: 'Light' }];

export default function Composer({ open, onClose, onPost }: Props) {
  const { ref, ...dlg } = useDialog(open, onClose);
  const [fileEl, setFileEl] = useState<HTMLInputElement | null>(null);
  const [text, setText] = useState('');
  const [font, setFont] = useState<FontKey>('serif');
  const [theme, setTheme] = useState(0);
  const [img, setImg] = useState<string | null>(null);
  const [align, setAlign] = useState<Align>('left');
  const [size, setSize] = useState<Size>('m');
  const [textColor, setTextColor] = useState<TextColor>('auto');
  const [sticker, setSticker] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'color' | 'photo'>('color');
  // Only one background at a time: a colour OR a photo, never both.
  const bg = mode === 'photo' ? img : null;

  async function pickImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try { setImg(await resizeImage(f)); setMode('photo'); setError(''); }
    catch { setError('That file isn’t an image. Choose a photo.'); }
  }

  function addTag(raw: string) {
    const t = cleanTag(raw);
    if (!t || tags.includes(t) || tags.length >= MAX_TAGS) return;
    setTags([...tags, t]);
    setTagInput('');
  }

  function post() {
    const t = text.trim();
    if (!t) return;
    const split = splitTags(t);
    const all = [...new Set([...tags, ...split.tags])].slice(0, MAX_TAGS);
    onPost({ text: split.text, theme, font, img: bg, align, size, textColor, sticker, mood, tags: all });
    setText(''); setImg(null); setMode('color'); setSticker(null); setMood(null); setTags([]); setTagInput(''); setError('');
    onClose();
  }

  const group = (label: string, children: ReactNode) => (
    <div className="grp"><span className="lbl">{label}</span><div className="row">{children}</div></div>
  );

  return (
    <dialog ref={ref} {...dlg} aria-labelledby="composer-title">
      <div className="sheet">
        <h2 id="composer-title">Write a quote</h2>

        <div className="prev" style={cardStyle(theme, bg, textColor)}>
          {sticker && <span className="pstk" aria-hidden="true">{sticker}</span>}
          <p className={`f-${font} k-${size}`} style={{ textAlign: align }}>
            {text.trim() ? `“${splitTags(text.trim()).text}”` : 'Your words will look like this.'}
          </p>
        </div>

        <textarea
          value={text} maxLength={180} aria-label="Quote text"
          placeholder="Type your quote"
          onChange={(e) => setText(e.target.value)}
        />
        <span className="count">{text.length} / 180</span>

        {group('Font', FONTS.map((f) => (
          <button key={f.key} className={`chip f-${f.key}`} aria-pressed={font === f.key} onClick={() => setFont(f.key)}>{f.label}</button>
        )))}

        {group('Background', <>
          <button className="chip" aria-pressed={mode === 'color'} onClick={() => setMode('color')}>Colour</button>
          <button className="chip" aria-pressed={mode === 'photo'} onClick={() => { setMode('photo'); if (!img) fileEl?.click(); }}>Photo</button>
          <input ref={setFileEl} type="file" accept="image/*" hidden onChange={pickImage} />
        </>)}
        {mode === 'color'
          ? group('Pick a colour', THEMES.map((t, i) => (
            <button key={t.name} className="sw" style={cardStyle(i)} aria-label={t.name}
              aria-pressed={i === theme} onClick={() => setTheme(i)} />
          )))
          : group('Photo', <>
            <button className="chip" onClick={() => fileEl?.click()}>{img ? 'Change photo' : 'Choose from gallery'}</button>
            {img && <button className="chip" onClick={() => { setImg(null); setMode('color'); }}>Remove photo</button>}
          </>)}
        {error && <p className="err" role="alert">{error}</p>}

        {group('Style', <>
          {ALIGNS.map((x) => <button key={x.k} className="chip" aria-pressed={align === x.k} onClick={() => setAlign(x.k)}>{x.l}</button>)}
          {SIZES.map((x) => <button key={x.k} className="chip" aria-label={`Size ${x.l}`} aria-pressed={size === x.k} onClick={() => setSize(x.k)}>{x.l}</button>)}
          {COLORS.map((x) => <button key={x.k} className="chip" aria-label={`${x.l} text`} aria-pressed={textColor === x.k} onClick={() => setTextColor(x.k)}>{x.l}</button>)}
        </>)}

        {group('Sticker', <>
          <button className="chip" aria-pressed={sticker === null} onClick={() => setSticker(null)}>None</button>
          {STICKERS.map((s) => (
            <button key={s} className="chip stkb" aria-label={`Sticker ${s}`} aria-pressed={sticker === s} onClick={() => setSticker(s)}>{s}</button>
          ))}
        </>)}

        {group('Mood', MOODS.map((m) => (
          <button key={m.key} className="chip" aria-pressed={mood === m.key} onClick={() => setMood(mood === m.key ? null : m.key)}>{m.label}</button>
        )))}
        <div className="grp">
          <span className="lbl">Tags</span>
          <div className="cin">
            <input
              value={tagInput} maxLength={21} placeholder="Add a tag, like love or life" aria-label="Add a tag"
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); } }}
            />
            <button className="post" disabled={!cleanTag(tagInput) || tags.length >= MAX_TAGS} onClick={() => addTag(tagInput)}>Add</button>
          </div>
          {tags.length > 0 && (
            <div className="row" aria-label="Selected tags">
              {tags.map((t) => (
                <button key={t} className="chip" aria-label={`Remove tag ${t}`} onClick={() => setTags(tags.filter((x) => x !== t))}>#{t} ×</button>
              ))}
            </div>
          )}
          <div className="row" aria-label="Suggested tags">
            {SUGGESTED.filter((s) => !tags.includes(s)).map((s) => (
              <button key={s} className="chip sug" disabled={tags.length >= MAX_TAGS} onClick={() => addTag(s)}>+ {s}</button>
            ))}
          </div>
        </div>


        <div className="row">
          <button className="chip" onClick={onClose}>Cancel</button>
          <button className="post" style={{ flex: 1 }} disabled={!text.trim()} onClick={post}>Post quote</button>
        </div>
      </div>
    </dialog>
  );
}
