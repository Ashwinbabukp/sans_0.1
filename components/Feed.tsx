'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Notify, Quote } from '@/lib/types';
import QuoteCard from './QuoteCard';

interface Props {
  list: Quote[];
  resetKey: string; // changes when the tab or filter changes
  empty: { title: string; body: string };
  qotdId: string | null;
  jumpTo: string | null;
  onJumped: () => void;
  onFg: (color: string) => void;
  keysEnabled: boolean;
  homeSignal: number;
  onOpenProfile: (key: string) => void;
  onComments: (id: string) => void;
  onMenu: (id: string) => void;
  onShare: (id: string) => void;
  notify: Notify;
}

export default function Feed(p: Props) {
  const { list, resetKey, empty, qotdId, jumpTo, onJumped, onFg, keysEnabled, homeSignal } = p;
  const ref = useRef<HTMLElement>(null);
  const raf = useRef(0);
  const firstId = list[0]?.id;

  // Keep the logo colour in step with the card currently on screen.
  const paint = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('.card');
    if (!cards.length) { onFg('#052BA8'); return; }
    const h = el.clientHeight || 1;
    const i = Math.max(0, Math.min(Math.round(el.scrollTop / h), cards.length - 1));
    const target = cards[i] ?? cards[0];
    if (target) {
      onFg(getComputedStyle(target).getPropertyValue('--fg').trim() || '#fff');
    }
  }, [onFg]);

  useEffect(() => { ref.current?.scrollTo({ top: 0 }); paint(); }, [resetKey, firstId, paint]);
  useEffect(() => { ref.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, [homeSignal]);

  useEffect(() => {
    if (!jumpTo) return;
    ref.current?.querySelector(`[data-id="${jumpTo}"]`)?.scrollIntoView();
    onJumped();
    paint();
  }, [jumpTo, onJumped, paint]);

  useEffect(() => {
    if (!keysEnabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      if ((e.target as HTMLElement).closest('input,textarea')) return;
      e.preventDefault();
      const el = ref.current;
      if (el) el.scrollBy({ top: (e.key === 'ArrowDown' ? 1 : -1) * el.clientHeight, behavior: 'smooth' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keysEnabled]);

  return (
    <main
      className="feed"
      ref={ref}
      tabIndex={0}
      aria-label="Quotes feed"
      onScroll={() => { cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(paint); }}
    >
      {list.length ? list.map((q) => (
        <QuoteCard
          key={q.id} quote={q} qotd={q.id === qotdId}
          onOpenProfile={p.onOpenProfile} onComments={p.onComments} onMenu={p.onMenu} onShare={p.onShare} notify={p.notify}
        />
      )) : (
        <div className="empty"><div><h2>{empty.title}</h2><p>{empty.body}</p></div></div>
      )}
    </main>
  );
}
