'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { Align, FontKey, Mood, NewQuote, Size, TextColor } from '@/lib/types';
import { THEMES } from '@/lib/themes';
import { FONTS } from '@/lib/fonts';
import { MOODS } from '@/lib/moods';
import { cardStyle, cleanTag, initials, resizeImage, splitTags } from '@/lib/utils';
import { useStore } from '@/lib/store';
import {
  AlignIcon,
  ArrowRightIcon,
  CloseIcon,
  FontIcon,
  PaletteIcon,
  PhotoIcon,
  SparkleIcon,
  TagIcon,
} from './Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  onPost: (q: NewQuote) => void;
}

type ActiveTool = 'font' | 'color' | 'photo' | 'mood' | 'tags' | null;
const SUGGESTED_TAGS = ['vibes', 'life', 'motivation', 'calm', 'love', 'growth'];
const MAX_TAGS = 5;

export default function Composer({ open, onClose, onPost }: Props) {
  const { me } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState('');
  const [font, setFont] = useState<FontKey>('poster');
  const [theme, setTheme] = useState(1); // Vanilla Cream by default
  const [img, setImg] = useState<string | null>(null);
  const [align, setAlign] = useState<Align>('center');
  const [size, setSize] = useState<Size>('m');
  const [textColor, setTextColor] = useState<TextColor>('auto');
  const [mood, setMood] = useState<Mood | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [error, setError] = useState('');

  // Auto-focus the textarea when composer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    } else {
      setActiveTool(null);
    }
  }, [open]);

  // Handle escape key to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handlePickImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const resized = await resizeImage(f);
      setImg(resized);
      setError('');
      setActiveTool(null);
    } catch {
      setError('Please choose a valid photo.');
    }
  }

  function cycleAlign() {
    setAlign((cur) => (cur === 'center' ? 'left' : cur === 'left' ? 'right' : 'center'));
  }

  function toggleTool(tool: ActiveTool) {
    setActiveTool((cur) => (cur === tool ? null : tool));
  }

  function addTag(raw: string) {
    const t = cleanTag(raw);
    if (!t || tags.includes(t) || tags.length >= MAX_TAGS) return;
    setTags([...tags, t]);
    setTagInput('');
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  function handlePost() {
    const t = text.trim();
    if (!t) return;
    const split = splitTags(t);
    const allTags = [...new Set([...tags, ...split.tags])].slice(0, MAX_TAGS);

    onPost({
      text: split.text,
      theme,
      font,
      img,
      align,
      size,
      textColor,
      sticker: 'cat',
      mood,
      tags: allTags,
    });

    // Reset state
    setText('');
    setImg(null);
    setTheme(1);
    setFont('poster');
    setAlign('center');
    setMood(null);
    setTags([]);
    setTagInput('');
    setActiveTool(null);
    onClose();
  }

  return (
    <div className="story-composer" style={cardStyle(theme, img, textColor)}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handlePickImage}
      />

      {/* Minimal Top Bar: Close button on Left */}
      <header className="sc-top">
        <button
          type="button"
          className="sc-icon-btn close"
          aria-label="Discard and close"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </header>

      {/* Right Side Vertical Dock for all tools */}
      <aside className="sc-right-dock" aria-label="Creation tools">
        {/* Typography / Font Tool */}
        <button
          type="button"
          className={`sc-icon-btn ${activeTool === 'font' ? 'active' : ''}`}
          aria-label="Typography"
          title="Fonts"
          onClick={() => toggleTool('font')}
        >
          <FontIcon />
        </button>

        {/* Color Palette / Theme Tool */}
        <button
          type="button"
          className={`sc-icon-btn ${activeTool === 'color' ? 'active' : ''}`}
          aria-label="Colors & themes"
          title="Color Themes"
          onClick={() => toggleTool('color')}
        >
          <PaletteIcon />
        </button>

        {/* Photo / Background Tool */}
        <button
          type="button"
          className={`sc-icon-btn ${img ? 'has-photo' : ''} ${activeTool === 'photo' ? 'active' : ''}`}
          aria-label="Background photo"
          title="Photo Background"
          onClick={() => {
            if (img) toggleTool('photo');
            else fileInputRef.current?.click();
          }}
        >
          <PhotoIcon />
        </button>

        {/* Mood Selector Tool */}
        <button
          type="button"
          className={`sc-icon-btn ${mood ? 'has-mood' : ''} ${activeTool === 'mood' ? 'active' : ''}`}
          aria-label="Select mood"
          title="Mood"
          onClick={() => toggleTool('mood')}
        >
          <SparkleIcon />
        </button>

        {/* Text Alignment */}
        <button
          type="button"
          className="sc-icon-btn"
          aria-label={`Alignment: ${align}`}
          title={`Align: ${align}`}
          onClick={cycleAlign}
        >
          <AlignIcon align={align} />
        </button>

        {/* Tags Tool */}
        <button
          type="button"
          className={`sc-icon-btn ${tags.length > 0 ? 'has-tags' : ''} ${activeTool === 'tags' ? 'active' : ''}`}
          aria-label="Add tags"
          title="Tags"
          onClick={() => toggleTool('tags')}
        >
          <TagIcon />
        </button>
      </aside>

      {/* Main Card Canvas with Direct-on-Screen Text Editing */}
      <main
        className="sc-canvas"
        onClick={(e) => {
          if (e.target === e.currentTarget) textareaRef.current?.focus();
        }}
      >
        <div className="sc-card-content">
          <textarea
            ref={textareaRef}
            className={`sc-input f-${font} k-${size}`}
            style={{ textAlign: align }}
            value={text}
            maxLength={180}
            placeholder="Type your quote…"
            aria-label="Write quote"
            rows={4}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Tag Pill Preview inside the Canvas */}
          {tags.length > 0 && (
            <div className="sc-canvas-tags" style={{ justifyContent: align }}>
              {tags.map((t) => (
                <span key={t} className="sc-canvas-tag" onClick={() => removeTag(t)}>
                  #{t} ×
                </span>
              ))}
            </div>
          )}

          {error && <p className="sc-error">{error}</p>}
        </div>
      </main>

      {/* Dynamic Drawer / Floating Strip for Active Tool */}
      {activeTool && (
        <section className="sc-drawer" aria-label="Tool options">
          {activeTool === 'font' && (
            <div className="sc-strip fonts">
              {FONTS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`sc-pill-btn f-${f.key} ${font === f.key ? 'selected' : ''}`}
                  onClick={() => setFont(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {activeTool === 'color' && (
            <div className="sc-strip colors" role="group" aria-label="Color themes">
              {THEMES.map((t, idx) => (
                <button
                  key={t.name}
                  type="button"
                  className={`sc-swatch ${idx === theme && !img ? 'selected' : ''}`}
                  style={{ background: t.bg }}
                  title={t.name}
                  aria-label={t.name}
                  onClick={() => {
                    setTheme(idx);
                    setImg(null); // Return to color theme
                  }}
                >
                  <span className="sc-swatch-inner" />
                </button>
              ))}
            </div>
          )}

          {activeTool === 'photo' && (
            <div className="sc-strip photo-actions">
              <button
                type="button"
                className="sc-pill-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose from gallery
              </button>
              {img && (
                <button
                  type="button"
                  className="sc-pill-btn danger"
                  onClick={() => {
                    setImg(null);
                    setActiveTool(null);
                  }}
                >
                  Remove photo
                </button>
              )}
            </div>
          )}

          {activeTool === 'mood' && (
            <div className="sc-strip moods">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={`sc-pill-btn ${mood === m.key ? 'selected' : ''}`}
                  onClick={() => setMood(mood === m.key ? null : m.key)}
                >
                  ✦ {m.label}
                </button>
              ))}
            </div>
          )}

          {activeTool === 'tags' && (
            <div className="sc-tag-drawer">
              <div className="sc-tag-input-row">
                <input
                  type="text"
                  value={tagInput}
                  maxLength={20}
                  placeholder="Add hashtag, e.g. vibes"
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                />
                <button
                  type="button"
                  className="sc-tag-add-btn"
                  disabled={!cleanTag(tagInput) || tags.length >= MAX_TAGS}
                  onClick={() => addTag(tagInput)}
                >
                  Add
                </button>
              </div>
              <div className="sc-suggested-tags">
                {SUGGESTED_TAGS.filter((s) => !tags.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="sc-tag-chip"
                    onClick={() => addTag(s)}
                    disabled={tags.length >= MAX_TAGS}
                  >
                    +{s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Floating Bottom Bar matching Instagram Story Creator */}
      <footer className="sc-bottom">
        <button
          type="button"
          className="sc-feed-btn"
          onClick={handlePost}
          disabled={!text.trim()}
          aria-label="Share to Feed"
        >
          <span
            className="sc-avatar"
            style={me.avatar ? { backgroundImage: `url("${me.avatar}")` } : undefined}
          >
            {!me.avatar && initials(me.name)}
          </span>
          <span className="sc-feed-label">Share to feed</span>
        </button>

        {/* Big Circular Next / Post Arrow Button */}
        <button
          type="button"
          className="sc-publish-circle"
          onClick={handlePost}
          disabled={!text.trim()}
          aria-label="Post quote"
        >
          <ArrowRightIcon />
        </button>
      </footer>
    </div>
  );
}
