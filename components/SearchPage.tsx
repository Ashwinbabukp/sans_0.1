'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { cardStyle, fmt, searchQuotes, titleName, trendingTags } from '@/lib/utils';

interface Props {
  query: string;
  setQuery: (q: string) => void;
  onClose: () => void;
  onOpenQuote: (id: string) => void;
  onOpenProfile: (key: string) => void;
}

export default function SearchPage({ query, setQuery, onClose, onOpenQuote, onOpenProfile }: Props) {
  const { visible, me } = useStore();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);

  const results = searchQuotes(visible, query);
  const q = query.trim().toLowerCase().replace(/^#/, '');
  const people = q && !query.trim().startsWith('#')
    ? [...new Set(visible.filter((x) => !x.mine && x.author.includes(q)).map((x) => x.author))] : [];
  const tags = trendingTags(visible);

  return (
    <section className="page" aria-label="Search">
      <div className="pbar">
        <button className="chip" onClick={onClose}>Back</button>
        <b>Search</b>
        <span style={{ width: 64 }} />
      </div>
      <div className="sbox">
        <input
          ref={input} value={query} placeholder="Search quotes, people or #tags" aria-label="Search"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!query.trim() ? (
        <div className="sbox">
          <span className="lbl">Trending</span>
          <div className="row">
            {tags.map((t) => <button key={t} className="chip" onClick={() => setQuery(t)}>{t}</button>)}
          </div>
        </div>
      ) : (
        <>
          {people.length > 0 && (
            <div className="sbox">
              <span className="lbl">People</span>
              <div className="row">
                {people.map((u) => <button key={u} className="chip" onClick={() => onOpenProfile(u)}>{titleName(u)} · @{u}</button>)}
              </div>
            </div>
          )}
          <div className={`grid${results.length < 3 ? ' few' : ''}`}>
            {results.length ? results.map((r) => (
              <button key={r.id} className={`tile f-${r.font}`} style={cardStyle(r.theme, r.img, r.textColor)} onClick={() => onOpenQuote(r.id)}>
                <span>{r.text}</span>
                <i className="lk">♥ {fmt(r.likes)}</i>
              </button>
            )) : <p className="none">No quotes found for “{query}”.{me.user ? '' : ''}</p>}
          </div>
        </>
      )}
    </section>
  );
}
