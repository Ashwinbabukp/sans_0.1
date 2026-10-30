'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { initials, timeAgo, titleName } from '@/lib/utils';

export default function NotificationsPage({ onBack, onOpenQuote }: { onBack: () => void; onOpenQuote: (id: string) => void }) {
  const { notifications, markRead } = useStore();
  useEffect(() => { markRead(); }, [markRead]);

  const line = (n: (typeof notifications)[number]) =>
    n.type === 'like' ? 'liked your quote'
      : n.type === 'comment' ? `commented: “${n.text ?? ''}”`
        : 'started following you';

  return (
    <section className="page" aria-label="Notifications">
      <div className="pbar">
        <button className="chip" onClick={onBack}>Back</button>
        <b>Notifications</b>
        <span style={{ width: 64 }} />
      </div>
      <p className="muted pad">Demo mode: sample accounts react to quotes you post. With a backend connected, these become real.</p>
      <div className="nlist">
        {notifications.filter((n) => n && n.user).length ? notifications.filter((n) => n && n.user).map((n) => (
          <button key={n.id} className="nrow" onClick={() => n.quoteId && onOpenQuote(n.quoteId)}>
            <span className="av">{initials(titleName(n.user))}</span>
            <span><b>{titleName(n.user)}</b> {line(n)}<small>{timeAgo(n.at)}</small></span>
          </button>
        )) : <p className="none">Nothing yet. Post a quote and see what happens.</p>}
      </div>
    </section>
  );
}
