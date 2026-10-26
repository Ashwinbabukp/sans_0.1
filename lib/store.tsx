'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Comment, Me, NewQuote, Notice, Quote, ThemeMode } from './types';
import { SEED_QUOTES } from './seed';
import { uid } from './utils';

const KEY = 'sans:v3';

interface State {
  quotes: Quote[]; me: Me; follows: string[]; followers: number;
  blocked: string[]; reported: string[]; collections: string[]; notifications: Notice[];
  theme: ThemeMode; signedIn: boolean; ready: boolean;
}

type Action =
  | { type: 'hydrate'; payload: Partial<State> }
  | { type: 'like'; id: string }
  | { type: 'save'; id: string; collection: string | null }
  | { type: 'add'; quote: Quote }
  | { type: 'delete'; id: string }
  | { type: 'comment'; id: string; comment: Comment }
  | { type: 'report'; id: string }
  | { type: 'block'; user: string }
  | { type: 'collection'; name: string }
  | { type: 'me'; me: Partial<Me> }
  | { type: 'follow'; user: string }
  | { type: 'read' }
  | { type: 'signIn'; me: Me }
  | { type: 'signOut' }
  | { type: 'theme'; mode: ThemeMode }
  | { type: 'demo'; id: string; kind: 'like' | 'comment' | 'follow' };

const initial: State = {
  quotes: SEED_QUOTES, me: { name: 'You', user: 'you', bio: '' }, follows: [], followers: 0,
  blocked: [], reported: [], collections: ['Saved'], notifications: [],
  theme: 'system', signedIn: false, ready: false,
};

const mapQuote = (s: State, id: string, fn: (q: Quote) => Quote): Quote[] =>
  s.quotes.map((q) => (q.id === id ? fn(q) : q));

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'hydrate': return { ...s, ...a.payload, ready: true };
    case 'like': return { ...s, quotes: mapQuote(s, a.id, (q) => ({ ...q, liked: !q.liked, likes: q.likes + (q.liked ? -1 : 1) })) };
    case 'save': return { ...s, quotes: mapQuote(s, a.id, (q) => ({ ...q, collection: a.collection })) };
    case 'add': return { ...s, quotes: [a.quote, ...s.quotes] };
    case 'delete': return { ...s, quotes: s.quotes.filter((q) => q.id !== a.id) };
    case 'comment': return { ...s, quotes: mapQuote(s, a.id, (q) => ({ ...q, comments: [...q.comments, a.comment] })) };
    case 'report': return { ...s, reported: [...s.reported, a.id] };
    case 'block': return { ...s, blocked: s.blocked.includes(a.user) ? s.blocked : [...s.blocked, a.user], follows: s.follows.filter((u) => u !== a.user) };
    case 'collection': return s.collections.includes(a.name) ? s : { ...s, collections: [...s.collections, a.name] };
    case 'me': return { ...s, me: { ...s.me, ...a.me } };
    case 'follow': return { ...s, follows: s.follows.includes(a.user) ? s.follows.filter((u) => u !== a.user) : [...s.follows, a.user] };
    case 'read': return { ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) };
    case 'signIn': return { ...s, me: a.me, signedIn: true };
    case 'signOut': return { ...s, signedIn: false };
    case 'theme': return { ...s, theme: a.mode };
    case 'demo': {
      // Demo mode: sample accounts react to your quote so you can see notifications working.
      const at = Date.now();
      if (a.kind === 'like') {
        return { ...s, quotes: mapQuote(s, a.id, (q) => ({ ...q, likes: q.likes + 1 })),
          notifications: [{ id: uid(), type: 'like', user: 'meera.writes', quoteId: a.id, read: false, at }, ...s.notifications] };
      }
      if (a.kind === 'comment') {
        const c: Comment = { id: uid(), author: 'arjun_codes', text: 'Love this one ✨' };
        return { ...s, quotes: mapQuote(s, a.id, (q) => ({ ...q, comments: [...q.comments, c] })),
          notifications: [{ id: uid(), type: 'comment', user: 'arjun_codes', quoteId: a.id, text: c.text, read: false, at }, ...s.notifications] };
      }
      return { ...s, followers: s.followers + 1,
        notifications: [{ id: uid(), type: 'follow', user: 'sana.k', read: false, at }, ...s.notifications] };
    }
  }
}

interface Store extends State {
  visible: Quote[];
  toggleLike: (id: string) => void;
  saveTo: (id: string, collection: string | null) => void;
  addQuote: (n: NewQuote) => void;
  deleteQuote: (id: string) => void;
  addComment: (id: string, text: string) => void;
  report: (id: string) => void;
  block: (user: string) => void;
  addCollection: (name: string) => void;
  updateMe: (m: Partial<Me>) => void;
  toggleFollow: (user: string) => void;
  markRead: () => void;
  signIn: (me: Me) => void;
  signOut: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // Load saved data after mount so server and client render the same first HTML.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      dispatch({ type: 'hydrate', payload: raw ? JSON.parse(raw) : {} });
    } catch {
      dispatch({ type: 'hydrate', payload: {} });
    }
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    const { ready: _ready, ...persist } = state;
    void _ready;
    try { localStorage.setItem(KEY, JSON.stringify(persist)); } catch { /* storage full or blocked */ }
  }, [state]);

  const value = useMemo<Store>(() => ({
    ...state,
    visible: state.quotes.filter((q) => !state.reported.includes(q.id) && (q.mine || !state.blocked.includes(q.author))),
    toggleLike: (id) => dispatch({ type: 'like', id }),
    saveTo: (id, collection) => dispatch({ type: 'save', id, collection }),
    addQuote: (n) => {
      const id = uid();
      dispatch({ type: 'add', quote: { id, author: '', mine: true, likes: 0, liked: false, collection: null, comments: [], ...n } });
      setTimeout(() => dispatch({ type: 'demo', id, kind: 'like' }), 4000);
      setTimeout(() => dispatch({ type: 'demo', id, kind: 'comment' }), 9000);
      setTimeout(() => dispatch({ type: 'demo', id, kind: 'follow' }), 14000);
    },
    deleteQuote: (id) => dispatch({ type: 'delete', id }),
    addComment: (id, text) => dispatch({ type: 'comment', id, comment: { id: uid(), author: '', mine: true, text } }),
    report: (id) => dispatch({ type: 'report', id }),
    block: (user) => dispatch({ type: 'block', user }),
    addCollection: (name) => dispatch({ type: 'collection', name }),
    updateMe: (me) => dispatch({ type: 'me', me }),
    toggleFollow: (user) => dispatch({ type: 'follow', user }),
    markRead: () => dispatch({ type: 'read' }),
    signIn: (me) => dispatch({ type: 'signIn', me }),
    signOut: () => dispatch({ type: 'signOut' }),
    setTheme: (mode) => dispatch({ type: 'theme', mode }),
  }), [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
}
