'use client';

import { useRef, useState, type PointerEvent as RPE } from 'react';
import type { Notify, Quote } from '@/lib/types';
import { useStore } from '@/lib/store';
import { authorOf, cardStyle, fmt, initials } from '@/lib/utils';
import { BookmarkIcon, CommentIcon, HeartIcon, MoreIcon, ShareIcon } from './Icons';

interface Props {
  quote: Quote;
  qotd: boolean;
  onOpenProfile: (key: string) => void;
  onComments: (id: string) => void;
  onMenu: (id: string) => void;
  onShare: (id: string) => void;
  notify: Notify;
}

export default function QuoteCard({ quote, qotd, onOpenProfile, onComments, onMenu, onShare, notify }: Props) {
  const { me, follows, toggleFollow, toggleLike, saveTo } = useStore();
  const following = follows.includes(quote.author);
  const a = authorOf(quote, me);
  const saved = quote.collection !== null;
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);
  const start = useRef<{ x: number; y: number } | null>(null);

  const toggleSave = () => {
    saveTo(quote.id, saved ? null : 'Saved');
    notify(saved ? 'Removed from saved' : 'Saved to your collection');
  };

  // Liking offers to share the quote as an Instagram card.
  const likeIt = () => {
    toggleLike(quote.id);
    if (!quote.liked) notify('Liked ♥', { label: 'Share card', run: () => onShare(quote.id) });
  };

  // Double-tap to like, swipe left to save.
  function onDown(e: RPE<HTMLElement>) {
    start.current = (e.target as HTMLElement).closest('button,.by') ? null : { x: e.clientX, y: e.clientY };
  }
  function onUp(e: RPE<HTMLElement>) {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (dx < -80 && Math.abs(dy) < 50) { toggleSave(); return; }
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const now = Date.now();
      if (now - lastTap.current < 320) {
        lastTap.current = 0;
        if (!quote.liked) likeIt();
        setBurst(true);
        setTimeout(() => setBurst(false), 700);
      } else lastTap.current = now;
    }
  }

  return (
    <section
      className="card"
      data-id={quote.id}
      style={cardStyle(quote.theme, quote.img, quote.textColor)}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={() => { start.current = null; }}
    >
      {qotd && <span className="qotd">✦ Quote of the day</span>}
      {quote.sticker && <span className="stk" aria-hidden="true">{quote.sticker}</span>}

      <p
        className={`q f-${quote.font} k-${quote.size}${quote.text.length > 90 ? ' long' : ''}`}
        style={{ textAlign: quote.align }}
      >
        “{quote.text}”
      </p>

      <div className="by">
        <div
          className="who"
          role="button"
          tabIndex={0}
          aria-label={`Open ${a.name}’s profile`}
          onClick={() => onOpenProfile(a.key)}
          onKeyDown={(e) => { if (e.key === 'Enter') onOpenProfile(a.key); }}
        >
          <span className="av">{initials(a.name)}</span>
          <div><b>{a.name}</b><small>@{a.user}</small></div>
        </div>
        {!quote.mine && (
          <button
            className="fol"
            aria-pressed={following}
            onClick={() => {
              toggleFollow(quote.author);
              notify(following ? `Unfollowed @${quote.author}` : `Following @${quote.author}`);
            }}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <div className="acts">
        <button className="act like" aria-pressed={quote.liked} aria-label="Like" onClick={likeIt}>
          <span className="ic"><HeartIcon /></span>{fmt(quote.likes)}
        </button>
        <button className="act" aria-label="Comments" onClick={() => onComments(quote.id)}>
          <span className="ic"><CommentIcon /></span>{quote.comments.length}
        </button>
        <button className="act" aria-pressed={saved} aria-label="Save" onClick={toggleSave}>
          <span className="ic"><BookmarkIcon /></span>{saved ? 'Saved' : 'Save'}
        </button>
        <button className="act" aria-label="Share as Instagram card" onClick={() => onShare(quote.id)}>
          <span className="ic"><ShareIcon /></span>Share
        </button>
        <button className="act" aria-label="More options" onClick={() => onMenu(quote.id)}>
          <span className="ic"><MoreIcon /></span>More
        </button>
      </div>

      {burst && <div className="burst" aria-hidden="true">♥</div>}
    </section>
  );
}
