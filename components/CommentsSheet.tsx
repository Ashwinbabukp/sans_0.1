'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { initials, titleName } from '@/lib/utils';
import { useDialog } from '@/lib/useDialog';

export default function CommentsSheet({ quoteId, onClose }: { quoteId: string | null; onClose: () => void }) {
  const { quotes, me, addComment } = useStore();
  const { ref, ...dlg } = useDialog(quoteId !== null, onClose);
  const [text, setText] = useState('');
  const q = quotes.find((x) => x.id === quoteId);

  function send() {
    const t = text.trim();
    if (!t || !quoteId) return;
    addComment(quoteId, t);
    setText('');
  }

  return (
    <dialog ref={ref} {...dlg} aria-labelledby="cm-title">
      <div className="sheet">
        <h2 id="cm-title">Comments</h2>
        <div className="cms">
          {(q?.comments ?? []).filter(Boolean).length ? (q?.comments ?? []).filter(Boolean).map((c) => {
            const name = c.mine ? me.name : titleName(c.author || 'User');
            return (
              <div className="cm" key={c.id}>
                <span
                  className="av"
                  style={c.mine && me.avatar ? { backgroundImage: `url("${me.avatar}")` } : undefined}
                >
                  {!(c.mine && me.avatar) && initials(name)}
                </span>
                <div><b>{name}</b><p>{c.text}</p></div>
              </div>
            );
          }) : <p className="muted">No comments yet. Start the conversation.</p>}
        </div>
        <div className="cin">
          <input value={text} maxLength={200} placeholder="Add a comment" aria-label="Add a comment"
            onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
          <button className="post" disabled={!text.trim()} onClick={send}>Post</button>
        </div>
      </div>
    </dialog>
  );
}
