'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { authorOf } from '@/lib/utils';
import { useDialog } from '@/lib/useDialog';

interface Props {
  quoteId: string | null;
  onClose: () => void;
  notify: (message: string) => void;
  onShare: (id: string) => void;
  onTag: (tag: string) => void;
}

export default function MenuSheet({ quoteId, onClose, notify, onShare, onTag }: Props) {
  const { quotes, me, collections, saveTo, addCollection, report, block, deleteQuote } = useStore();
  const { ref, ...dlg } = useDialog(quoteId !== null, onClose);
  const [mode, setMode] = useState<'menu' | 'collections'>('menu');
  const [name, setName] = useState('');
  const q = quotes.find((x) => x.id === quoteId);

  useEffect(() => { if (quoteId) { setMode('menu'); setName(''); } }, [quoteId]);
  if (!q) return <dialog ref={ref} {...dlg} />;

  const a = authorOf(q, me);

  async function share() {
    const text = `“${q!.text}” – @${a.user}`;
    onClose();
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); notify('Quote copied'); }
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') notify('Couldn’t share. Try again.');
    }
  }

  function saveInto(col: string) {
    saveTo(q!.id, col);
    notify(`Saved to ${col}`);
    onClose();
  }

  function create() {
    const n = name.trim();
    if (!n) return;
    addCollection(n);
    saveInto(n);
  }

  return (
    <dialog ref={ref} {...dlg} aria-labelledby="menu-title">
      <div className="sheet">
        {mode === 'menu' ? (
          <>
            <h2 id="menu-title">@{a.user}’s quote</h2>
            {(q.tags ?? []).length > 0 && (
              <div className="row">
                {(q.tags ?? []).map((t) => (
                  <button key={t} className="chip" onClick={() => { onClose(); onTag(`#${t}`); }}>#{t}</button>
                ))}
              </div>
            )}
            <div className="mlist">
              <button className="mitem" onClick={() => { onClose(); onShare(q.id); }}>Share as Instagram card</button>
              <button className="mitem" onClick={share}>Share text</button>
              <button className="mitem" onClick={() => setMode('collections')}>Add to collection</button>
              {q.mine ? (
                <button className="mitem danger" onClick={() => { deleteQuote(q.id); onClose(); notify('Quote deleted'); }}>Delete quote</button>
              ) : (
                <>
                  <button className="mitem danger" onClick={() => { report(q.id); onClose(); notify('Reported. We’ve hidden it for you.'); }}>Report quote</button>
                  <button className="mitem danger" onClick={() => { block(q.author); onClose(); notify(`Blocked @${q.author}`); }}>Block @{q.author}</button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 id="menu-title">Add to collection</h2>
            <div className="mlist">
              {collections.map((c) => (
                <button key={c} className="mitem" aria-pressed={q.collection === c} onClick={() => saveInto(c)}>
                  {c}{q.collection === c ? ' ✓' : ''}
                </button>
              ))}
              {q.collection !== null && (
                <button className="mitem" onClick={() => { saveTo(q.id, null); onClose(); notify('Removed from saved'); }}>Remove from saved</button>
              )}
            </div>
            <div className="cin">
              <input value={name} maxLength={24} placeholder="New collection name" aria-label="New collection name"
                onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') create(); }} />
              <button className="post" disabled={!name.trim()} onClick={create}>Create</button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
