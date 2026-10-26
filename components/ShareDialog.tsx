'use client';

import { useEffect, useState } from 'react';
import type { Notify, Quote } from '@/lib/types';
import { useStore } from '@/lib/store';
import { authorOf } from '@/lib/utils';
import { useDialog } from '@/lib/useDialog';
import { renderShareCard, type ShareFormat, type ShareStyle } from '@/lib/shareCard';
import { CTA, HASHTAGS, TAGLINE } from '@/lib/brand';

interface Props { quote: Quote | null; onClose: () => void; notify: Notify }
interface Out { url: string; blob: Blob }

export default function ShareDialog({ quote, onClose, notify }: Props) {
  const { me } = useStore();
  const { ref, ...dlg } = useDialog(quote !== null, onClose);
  const [format, setFormat] = useState<ShareFormat>('story');
  const [style, setStyle] = useState<ShareStyle>('frame');
  const [out, setOut] = useState<Out | null>(null);
  const [busy, setBusy] = useState(false);
  const canShare = typeof navigator !== 'undefined' && 'canShare' in navigator;
  const id = quote?.id;

  useEffect(() => {
    if (!quote) { setOut(null); return; }
    let dead = false;
    const a = authorOf(quote, me);
    setBusy(true);
    renderShareCard(quote, a.name, a.user, { format, style })
      .then((blob) => { if (!dead) setOut({ url: URL.createObjectURL(blob), blob }); })
      .catch(() => { if (!dead) notify('Couldn’t create the card. Try again.'); })
      .finally(() => { if (!dead) setBusy(false); });
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, format, style, me.name, me.user]);

  // Release each preview image once it has been replaced.
  useEffect(() => () => { if (out) URL.revokeObjectURL(out.url); }, [out]);

  const fileName = `sans-${(id ?? 'quote').slice(0, 6)}-${format}.png`;
  const caption = quote
    ? `“${quote.text}”\n— @${authorOf(quote, me).user}\n\n${TAGLINE} ${CTA} ${HASHTAGS}`
    : '';

  async function share() {
    if (!out) return;
    const file = new File([out.blob], fileName, { type: 'image/png' });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: caption });
      else notify('Sharing files isn’t supported here. Use Save image.');
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') notify('Couldn’t share. Try Save image.');
    }
  }

  async function copyCaption() {
    try { await navigator.clipboard.writeText(caption); notify('Caption copied'); }
    catch { notify('Couldn’t copy. Try again.'); }
  }

  return (
    <dialog ref={ref} {...dlg} aria-labelledby="share-title">
      <div className="sheet">
        <h2 id="share-title">Share card</h2>

        <div className="row" role="group" aria-label="Format">
          <button className="chip" aria-pressed={format === 'story'} onClick={() => setFormat('story')}>Story 9:16</button>
          <button className="chip" aria-pressed={format === 'post'} onClick={() => setFormat('post')}>Post 4:5</button>
          <span style={{ width: 8 }} />
          <button className="chip" aria-pressed={style === 'frame'} onClick={() => setStyle('frame')}>Frame</button>
          <button className="chip" aria-pressed={style === 'minimal'} onClick={() => setStyle('minimal')}>Minimal</button>
        </div>

        <div className="shprev" aria-busy={busy}>
          {out
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={out.url} alt="Share card preview" style={{ opacity: busy ? 0.5 : 1 }} />
            : <div className="skel" />}
          {busy && <span className="spin">Making your card…</span>}
        </div>

        <p className="muted">On Instagram, add it to your Story or Post. On a phone, Share opens it straight there.</p>
        <div className="row">
          <button className="chip" onClick={onClose}>Close</button>
          <button className="chip" onClick={copyCaption}>Copy caption</button>
          {out && <a className="post" href={out.url} download={fileName} style={{ textAlign: 'center', flex: 1 }}>Save image</a>}
          {canShare && out && <button className="post" onClick={share}>Share</button>}
        </div>
      </div>
    </dialog>
  );
}
