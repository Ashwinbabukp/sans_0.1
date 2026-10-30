'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Mood, Notify, Quote } from '@/lib/types';
import { useStore } from '@/lib/store';
import { MOODS } from '@/lib/moods';
import { initials, quoteOfDay } from '@/lib/utils';
import Feed from './Feed';
import Composer from './Composer';
import ProfilePage from './ProfilePage';
import ProfileEditor from './ProfileEditor';
import SearchPage from './SearchPage';
import NotificationsPage from './NotificationsPage';
import CommentsSheet from './CommentsSheet';
import MenuSheet from './MenuSheet';
import ShareDialog from './ShareDialog';
import Welcome from './Welcome';
import Logo from './Logo';
import LoadingScreen from './LoadingScreen';
import { BellIcon, BookmarkIcon, HomeIcon, PlusIcon, SearchIcon, UserIcon } from './Icons';

type Tab = 'explore' | 'following' | 'saved';
const TABS: { k: Tab; l: string }[] = [{ k: 'explore', l: 'Explore' }, { k: 'following', l: 'Following' }, { k: 'saved', l: 'Saved' }];

const EMPTY: Record<Tab, { title: string; body: string }> = {
  explore: { title: 'No quotes here', body: 'Try another mood, or write the first one.' },
  following: { title: 'Nobody followed yet', body: 'Follow people from their profile to see their quotes here.' },
  saved: { title: 'Nothing saved yet', body: 'Tap the bookmark on a quote to keep it here.' },
};

export default function SansApp() {
  const { ready, signedIn, quotes, visible, follows, me, theme, notifications, addQuote, signOut } = useStore();
  const [tab, setTab] = useState<Tab>('explore');
  const [mood, setMood] = useState<Mood | 'all'>('all');
  const [col, setCol] = useState('all');
  const [composer, setComposer] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<string | null>(null);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [notifs, setNotifs] = useState(false);
  const [commentsId, setCommentsId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [jumpTo, setJumpTo] = useState<string | null>(null);
  const [homeSignal, setHomeSignal] = useState(0);
  const [fg, setFg] = useState('#FAF5EE');
  const [toast, setToast] = useState<{ message: string; action?: { label: string; run: () => void } } | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const [fading, setFading] = useState(false);
  const timer = useRef(0);

  const notify: Notify = useCallback((message, action) => {
    setToast({ message, action });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), action ? 3600 : 1800);
  }, []);
  const onJumped = useCallback(() => setJumpTo(null), []);

  useEffect(() => {
    if (ready) {
      const t1 = setTimeout(() => setFading(true), 400);
      const t2 = setTimeout(() => setShowLoader(false), 750);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [ready]);

  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'system') el.removeAttribute('data-theme'); else el.setAttribute('data-theme', theme);
  }, [theme]);

  const qotd = quoteOfDay(visible);
  const cols = [...new Set(visible.filter((q) => q.collection !== null).map((q) => q.collection as string))];

  let list: Quote[] = visible;
  if (tab === 'following') list = visible.filter((q) => !q.mine && follows.includes(q.author));
  if (tab === 'saved') list = visible.filter((q) => q.collection !== null && (col === 'all' || q.collection === col));
  if (tab !== 'saved' && mood !== 'all') list = list.filter((q) => q.mood === mood);

  const closeAll = () => {
    setProfile(null); setSearch(false); setNotifs(false); setComposer(false); setEditing(false);
    setCommentsId(null); setMenuId(null); setShareId(null);
  };
  const goHome = () => { closeAll(); setTab('explore'); setMood('all'); setHomeSignal((n) => n + 1); };
  const openQuote = (id: string) => { closeAll(); setTab('explore'); setMood('all'); setJumpTo(id); };
  const openTag = (tag: string) => { setQuery(tag); setSearch(true); };

  const unread = notifications.some((n) => !n.read);
  const overlay = !!(profile || search || notifs || composer || editing || commentsId || menuId || shareId || !signedIn);

  if (!ready && showLoader) {
    return (
      <div className="app">
        <LoadingScreen fading={false} />
      </div>
    );
  }

  return (
    <div className="app">
      {showLoader && <LoadingScreen fading={fading} />}
      <header className="top">
        <div className="trow">
          <Logo color={fg} onClick={goHome} />
          <div className="rgt">
            <button
              className="ib mob-saved"
              aria-label="Saved quotes"
              onClick={() => setTab(tab === 'saved' ? 'explore' : 'saved')}
              aria-pressed={tab === 'saved'}
            >
              <BookmarkIcon />
            </button>
            <button className="ib desk-only" aria-label="Search" onClick={() => setSearch(true)}><SearchIcon /></button>
            <button className="ib desk-only" aria-label="Notifications" onClick={() => setNotifs(true)}>
              <BellIcon />{unread && <span className="dotn" />}
            </button>
            <button
              className="me desk-only"
              aria-label="Open your profile"
              onClick={() => setProfile('me')}
              style={me.avatar ? { backgroundImage: `url("${me.avatar}")` } : undefined}
            >
              {!me.avatar && initials(me.name)}
            </button>
          </div>
        </div>

        <div className="tabs" role="tablist" aria-label="Feed">
          {TABS.map((t) => (
            <button key={t.k} className="tab" role="tab" aria-selected={tab === t.k} onClick={() => setTab(t.k)}>{t.l}</button>
          ))}
        </div>

        <div className="chips" role="group" aria-label={tab === 'saved' ? 'Collections' : 'Filter by mood'}>
          {tab === 'saved' ? (
            <>
              <button className="cchip" aria-pressed={col === 'all'} onClick={() => setCol('all')}>All</button>
              {cols.map((c) => <button key={c} className="cchip" aria-pressed={col === c} onClick={() => setCol(c)}>{c}</button>)}
            </>
          ) : (
            <>
              {qotd && <button className="cchip" onClick={() => openQuote(qotd)}>✦ Today</button>}
              <button className="cchip" aria-pressed={mood === 'all'} onClick={() => setMood('all')}>All</button>
              {MOODS.map((m) => (
                <button key={m.key} className="cchip" aria-pressed={mood === m.key} onClick={() => setMood(m.key)}>{m.label}</button>
              ))}
            </>
          )}
        </div>
      </header>

      <Feed
        list={list}
        resetKey={`${tab}|${mood}|${col}`}
        empty={EMPTY[tab]}
        qotdId={tab === 'explore' ? qotd : null}
        jumpTo={jumpTo}
        onJumped={onJumped}
        onFg={setFg}
        keysEnabled={!overlay}
        homeSignal={homeSignal}
        onOpenProfile={setProfile}
        onComments={setCommentsId}
        onMenu={setMenuId}
        onShare={setShareId}
        notify={notify}
      />

      <nav className="bottom-bar" aria-label="Main Navigation">
        <button
          type="button"
          className={`b-item ${tab === 'explore' && !overlay ? 'active' : ''}`}
          onClick={goHome}
          aria-label="Home feed"
        >
          <HomeIcon />
          <span>Home</span>
        </button>
        <button
          type="button"
          className={`b-item ${search ? 'active' : ''}`}
          onClick={() => { closeAll(); setSearch(true); }}
          aria-label="Search"
        >
          <SearchIcon />
          <span>Search</span>
        </button>
        <button
          type="button"
          className="b-compose"
          onClick={() => setComposer(true)}
          aria-label="Write a quote"
        >
          <PlusIcon />
        </button>
        <button
          type="button"
          className={`b-item ${notifs ? 'active' : ''}`}
          onClick={() => { closeAll(); setNotifs(true); }}
          aria-label="Notifications"
        >
          <div className="b-icon-wrap">
            <BellIcon />
            {unread && <span className="b-dot" />}
          </div>
          <span>Alerts</span>
        </button>
        <button
          type="button"
          className={`b-item ${profile === 'me' ? 'active' : ''}`}
          onClick={() => { closeAll(); setProfile('me'); }}
          aria-label="Your profile"
        >
          {me.avatar ? (
            <span className="b-av" style={{ backgroundImage: `url("${me.avatar}")` }} />
          ) : (
            <UserIcon />
          )}
          <span>Profile</span>
        </button>
      </nav>

      {search && (
        <SearchPage query={query} setQuery={setQuery} onClose={() => setSearch(false)}
          onOpenQuote={openQuote} onOpenProfile={(u) => { setSearch(false); setProfile(u); }} />
      )}
      {notifs && <NotificationsPage onBack={() => setNotifs(false)} onOpenQuote={openQuote} />}
      {profile && (
        <ProfilePage userKey={profile} onBack={() => setProfile(null)} onEdit={() => setEditing(true)}
          onOpenQuote={openQuote} onSignOut={() => { closeAll(); signOut(); }} notify={notify} />
      )}
      {!signedIn && <Welcome />}

      <div className={`toast${toast ? ' on' : ''}${toast?.action ? ' hasact' : ''}`} role="status" aria-live="polite">
        {toast?.message}
        {toast?.action && (
          <button className="tbtn" onClick={() => { toast.action?.run(); setToast(null); }}>{toast.action.label}</button>
        )}
      </div>

      <Composer open={composer} onClose={() => setComposer(false)}
        onPost={(n) => { addQuote(n); setTab('explore'); setMood('all'); notify('Quote posted'); }} />
      <ProfileEditor open={editing} onClose={() => setEditing(false)} onSaved={() => notify('Profile saved')} />
      <CommentsSheet quoteId={commentsId} onClose={() => setCommentsId(null)} />
      <MenuSheet quoteId={menuId} onClose={() => setMenuId(null)} notify={notify} onShare={setShareId} onTag={openTag} />
      <ShareDialog quote={quotes.find((q) => q.id === shareId) ?? null} onClose={() => setShareId(null)} notify={notify} />
    </div>
  );
}
