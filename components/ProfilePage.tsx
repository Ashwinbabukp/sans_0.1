'use client';

import { useEffect, useRef } from 'react';
import type { ThemeMode } from '@/lib/types';
import { useStore } from '@/lib/store';
import { cardStyle, fmt, initials, titleName } from '@/lib/utils';
import { MoonIcon } from './Icons';

interface Props {
  userKey: string; // "me" or a username
  onBack: () => void;
  onEdit: () => void;
  onOpenQuote: (id: string) => void;
  onSignOut: () => void;
  notify: (message: string) => void;
}

const MODES: { k: ThemeMode; l: string }[] = [{ k: 'system', l: 'System' }, { k: 'light', l: 'Light' }, { k: 'dark', l: 'Dark' }];

export default function ProfilePage({ userKey, onBack, onEdit, onOpenQuote, onSignOut, notify }: Props) {
  const { visible, me, follows, followers, toggleFollow, block, theme, setTheme } = useStore();
  const back = useRef<HTMLButtonElement>(null);
  const self = userKey === 'me';
  const list = visible.filter((q) => (self ? q.mine : q.author === userKey));
  const name = self ? me.name : titleName(userKey);
  const user = self ? me.user : userKey;
  const likes = list.reduce((sum, q) => sum + q.likes, 0);
  const following = follows.includes(userKey);

  useEffect(() => { back.current?.focus(); }, [userKey]);

  return (
    <section className="page" aria-label="Profile">
      <div className="pbar">
        <button ref={back} className="chip" onClick={onBack}>Back</button>
        <b>{self ? 'Your profile' : 'Profile'}</b>
        <span style={{ width: 64 }} />
      </div>

      <div className="phead">
        <span className="pav" style={cardStyle(list[0]?.theme ?? 0)}>{initials(name)}</span>
        <h2>{name}</h2>
        <p>@{user}</p>
        <p>{self ? me.bio || 'Add a short bio so people know who you are.' : 'Shares short quotes on Sans.'}</p>
        <div className="stats">
          <div><b>{list.length}</b>Quotes</div>
          <div><b>{fmt(likes)}</b>Likes</div>
          {self && <div><b>{followers}</b>Followers</div>}
          {self && <div><b>{follows.length}</b>Following</div>}
        </div>
        {self ? (
          <button className="post" onClick={onEdit}>Edit profile</button>
        ) : (
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="post" onClick={() => toggleFollow(userKey)}>{following ? 'Following' : 'Follow'}</button>
            <button className="chip" onClick={() => { block(userKey); onBack(); notify(`Blocked @${userKey}`); }}>Block</button>
          </div>
        )}
      </div>

      <div className={`grid${list.length < 3 ? ' few' : ''}`}>
        {list.length ? list.map((q) => (
          <button key={q.id} className={`tile f-${q.font}`} style={cardStyle(q.theme, q.img, q.textColor)} onClick={() => onOpenQuote(q.id)}>
            <span>{q.text}</span>
            <i className="lk">♥ {fmt(q.likes)}</i>
          </button>
        )) : (
          <p className="none">{self ? 'You haven’t posted yet. Tap Write a quote to start.' : 'No quotes yet.'}</p>
        )}
      </div>

      {self && (
        <div className="sec">
          <span className="lbl"><MoonIcon />Appearance</span>
          <div className="row">
            {MODES.map((m) => <button key={m.k} className="chip" aria-pressed={theme === m.k} onClick={() => setTheme(m.k)}>{m.k === 'dark' && <MoonIcon />}{m.l}</button>)}
          </div>
          <button className="chip" onClick={onSignOut}>Sign out</button>
        </div>
      )}
    </section>
  );
}
