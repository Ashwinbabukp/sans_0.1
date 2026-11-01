'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import type { Comment, Me, NewQuote, Notice, Quote, ThemeMode } from './types';
import { SEED_QUOTES } from './seed';
import { uid } from './utils';
import { createClient } from './supabase/client';
import { uploadAvatar, uploadBanner, uploadQuoteImage } from './storage';

const KEY = 'sans:v3';

interface State {
  quotes: Quote[];
  me: Me;
  follows: string[];
  followers: number;
  blocked: string[];
  reported: string[];
  collections: string[];
  notifications: Notice[];
  theme: ThemeMode;
  signedIn: boolean;
  ready: boolean;
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
  | { type: 'demo'; id: string; kind: 'like' | 'comment' | 'follow' }
  | { type: 'syncQuotes'; quotes: Quote[] }
  | { type: 'syncQuote'; quote: Quote }
  | { type: 'syncLikes'; quoteId: string; likes: number; liked?: boolean }
  | { type: 'addNotification'; notice: Notice }
  | {
      type: 'syncUserData';
      collections?: string[];
      follows?: string[];
      followers?: number;
      notifications?: Notice[];
    };

const initial: State = {
  quotes: SEED_QUOTES,
  me: { name: 'You', user: 'you', bio: '' },
  follows: [],
  followers: 0,
  blocked: [],
  reported: [],
  collections: ['Saved'],
  notifications: [],
  theme: 'system',
  signedIn: false,
  ready: false,
};

function sanitizeQuote(q: Quote): Quote {
  return {
    ...q,
    tags: Array.isArray(q.tags) ? q.tags.filter(Boolean) : [],
    comments: Array.isArray(q.comments) ? q.comments.filter((c) => c && typeof c === 'object') : [],
    likes: typeof q.likes === 'number' ? q.likes : 0,
    liked: Boolean(q.liked),
    collection: q.collection ?? null,
  };
}

const mapQuote = (s: State, id: string, fn: (q: Quote) => Quote): Quote[] =>
  s.quotes.map((q) => (q.id === id ? fn(q) : q));

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'hydrate': {
      const payload = a.payload;
      let quotes =
        Array.isArray(payload.quotes) && payload.quotes.length > 0
          ? payload.quotes.map(sanitizeQuote)
          : s.quotes;
      if (!quotes.some((q) => q.author === 'sunny.days')) {
        quotes = [SEED_QUOTES[0], ...quotes];
      }
      const notifications = Array.isArray(payload.notifications)
        ? payload.notifications.filter((n) => n && n.user)
        : s.notifications;
      return { ...s, ...payload, quotes, notifications, ready: true };
    }
    case 'like':
      return {
        ...s,
        quotes: mapQuote(s, a.id, (q) => ({
          ...q,
          liked: !q.liked,
          likes: q.likes + (q.liked ? -1 : 1),
        })),
      };
    case 'save':
      return {
        ...s,
        quotes: mapQuote(s, a.id, (q) => ({ ...q, collection: a.collection })),
      };
    case 'add':
      return { ...s, quotes: [a.quote, ...s.quotes] };
    case 'delete':
      return { ...s, quotes: s.quotes.filter((q) => q.id !== a.id) };
    case 'comment':
      return {
        ...s,
        quotes: mapQuote(s, a.id, (q) => ({
          ...q,
          comments: [...(q.comments ?? []), a.comment],
        })),
      };
    case 'report':
      return { ...s, reported: [...s.reported, a.id] };
    case 'block':
      return {
        ...s,
        blocked: s.blocked.includes(a.user) ? s.blocked : [...s.blocked, a.user],
        follows: s.follows.filter((u) => u !== a.user),
      };
    case 'collection':
      return s.collections.includes(a.name) ? s : { ...s, collections: [...s.collections, a.name] };
    case 'me':
      return { ...s, me: { ...s.me, ...a.me } };
    case 'follow':
      return {
        ...s,
        follows: s.follows.includes(a.user)
          ? s.follows.filter((u) => u !== a.user)
          : [...s.follows, a.user],
      };
    case 'read':
      return s.notifications.every((n) => n.read)
        ? s
        : { ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) };
    case 'signIn':
      return { ...s, me: a.me, signedIn: true };
    case 'signOut':
      return {
        ...s,
        signedIn: false,
        me: { name: 'You', user: 'you', bio: '' },
        follows: [],
        followers: 0,
        notifications: [],
      };
    case 'theme':
      return { ...s, theme: a.mode };
    case 'demo': {
      const at = Date.now();
      if (a.kind === 'like') {
        return {
          ...s,
          quotes: mapQuote(s, a.id, (q) => ({ ...q, likes: q.likes + 1 })),
          notifications: [
            { id: uid(), type: 'like', user: 'meera.writes', quoteId: a.id, read: false, at },
            ...s.notifications,
          ],
        };
      }
      if (a.kind === 'comment') {
        const c: Comment = { id: uid(), author: 'arjun_codes', text: 'Love this one ✨' };
        return {
          ...s,
          quotes: mapQuote(s, a.id, (q) => ({
            ...q,
            comments: [...(q.comments ?? []), c],
          })),
          notifications: [
            { id: uid(), type: 'comment', user: 'arjun_codes', quoteId: a.id, text: c.text, read: false, at },
            ...s.notifications,
          ],
        };
      }
      return {
        ...s,
        followers: s.followers + 1,
        notifications: [{ id: uid(), type: 'follow', user: 'sana.k', read: false, at }, ...s.notifications],
      };
    }
    case 'syncQuotes': {
      // Retain any locally created quotes that might not yet be in remote
      const remoteIds = new Set(a.quotes.map((q) => q.id));
      const localMine = s.quotes.filter((q) => q.mine && !remoteIds.has(q.id));
      return {
        ...s,
        quotes: [...localMine, ...a.quotes],
      };
    }
    case 'syncQuote': {
      const exists = s.quotes.some((q) => q.id === a.quote.id);
      if (exists) {
        return { ...s, quotes: s.quotes.map((q) => (q.id === a.quote.id ? a.quote : q)) };
      }
      return { ...s, quotes: [a.quote, ...s.quotes] };
    }
    case 'syncLikes': {
      return {
        ...s,
        quotes: s.quotes.map((q) =>
          q.id === a.quoteId
            ? {
                ...q,
                likes: a.likes,
                liked: a.liked !== undefined ? a.liked : q.liked,
              }
            : q
        ),
      };
    }
    case 'addNotification': {
      if (s.notifications.some((n) => n.id === a.notice.id)) return s;
      return { ...s, notifications: [a.notice, ...s.notifications] };
    }
    case 'syncUserData': {
      return {
        ...s,
        collections: a.collections ?? s.collections,
        follows: a.follows ?? s.follows,
        followers: a.followers ?? s.followers,
        notifications: a.notifications ?? s.notifications,
      };
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
  const meRef = useRef(state.me);
  meRef.current = state.me;

  const markRead = useCallback(() => {
    dispatch({ type: 'read' });
    const supabase = createClient();
    if (supabase && meRef.current.id) {
      supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', meRef.current.id)
        .then(() => null, () => null);
    }
  }, []);

  // Helper to format Supabase quote row into Quote object
  const formatDbQuote = useCallback(
    (
      q: any,
      currentUserId?: string,
      savedMap?: Map<string, string>
    ): Quote => {
      const isMine = currentUserId ? q.author_id === currentUserId : false;
      const likesArr = Array.isArray(q.likes) ? q.likes : [];
      const liked = currentUserId ? likesArr.some((l: any) => l.user_id === currentUserId) : false;

      const commentsArr: Comment[] = Array.isArray(q.comments)
        ? q.comments.map((c: any) => ({
            id: c.id,
            author: c.profiles?.username || 'user',
            text: c.body,
            mine: currentUserId ? c.author_id === currentUserId : false,
          }))
        : [];

      return {
        id: q.id,
        text: q.body,
        author: q.profiles?.username || 'user',
        mine: isMine,
        theme: typeof q.theme === 'number' ? q.theme : 0,
        font: q.font || 'serif',
        img: q.image_path || null,
        align: q.align || 'left',
        size: q.size || 'm',
        textColor: q.text_color || 'auto',
        sticker: null,
        mood: q.mood || null,
        tags: Array.isArray(q.tags) ? q.tags : [],
        likes: likesArr.length,
        liked,
        collection: savedMap?.get(q.id) ?? null,
        comments: commentsArr,
      };
    },
    []
  );

  // Load quotes and relations from Supabase
  const loadSupabaseData = useCallback(
    async (userId?: string) => {
      const supabase = createClient();
      if (!supabase) return;

      try {
        // Fetch saved quote mappings for this user if logged in
        const savedMap = new Map<string, string>();
        let userCollections: string[] = ['Saved'];

        if (userId) {
          const { data: dbCols } = await supabase
            .from('collections')
            .select('id, name, saved (quote_id)')
            .eq('owner_id', userId);

          if (dbCols && dbCols.length > 0) {
            userCollections = ['Saved', ...dbCols.map((c: any) => c.name).filter((n: string) => n !== 'Saved')];
            for (const col of dbCols) {
              if (Array.isArray(col.saved)) {
                for (const s of col.saved) {
                  savedMap.set(s.quote_id, col.name);
                }
              }
            }
          }

          // Follows
          const { data: dbFollows } = await supabase
            .from('follows')
            .select('followee_id, profiles:followee_id (username)')
            .eq('follower_id', userId);

          const followsList = (dbFollows || [])
            .map((f: any) => f.profiles?.username)
            .filter(Boolean);

          // Followers count
          const { count: followerCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('followee_id', userId);

          // Notifications
          const { data: dbNotifs } = await supabase
            .from('notifications')
            .select('id, user_id, actor_id, type, quote_id, comment_id, read, created_at, profiles:actor_id (username)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          const notifsList: Notice[] = (dbNotifs || []).map((n: any) => ({
            id: n.id,
            type: n.type,
            user: n.profiles?.username || 'user',
            quoteId: n.quote_id,
            read: n.read,
            at: new Date(n.created_at).getTime(),
          }));

          dispatch({
            type: 'syncUserData',
            collections: userCollections,
            follows: followsList,
            followers: followerCount || 0,
            notifications: notifsList,
          });
        }

        // Fetch quotes
        const { data: dbQuotes, error: quotesError } = await supabase
          .from('quotes')
          .select(`
            id,
            body,
            theme,
            font,
            align,
            size,
            text_color,
            mood,
            tags,
            image_path,
            created_at,
            author_id,
            profiles:author_id (id, username, display_name, avatar_url),
            likes (user_id),
            comments (id, author_id, body, created_at, profiles:author_id (username))
          `)
          .order('created_at', { ascending: false });

        if (!quotesError && dbQuotes && dbQuotes.length > 0) {
          const formatted = dbQuotes.map((q) => formatDbQuote(q, userId, savedMap));
          dispatch({ type: 'syncQuotes', quotes: formatted });
        }
      } catch (err) {
        console.warn('Could not sync with Supabase (running in offline/local mode):', err);
      }
    },
    [formatDbQuote]
  );

  // Initial load from localStorage and auth session sync
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      dispatch({ type: 'hydrate', payload: raw ? JSON.parse(raw) : {} });
    } catch {
      dispatch({ type: 'hydrate', payload: {} });
    }

    const supabase = createClient();
    if (!supabase) return;

    // Check existing auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(async ({ data: profile, error: pErr }) => {
            if (pErr) {
              console.warn('Profiles table check:', pErr.message);
              return;
            }
            let userProfile = profile;
            if (!userProfile) {
              const cleanUser =
                (session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user')
                  .toLowerCase()
                  .replace(/[^a-z0-9._]/g, '');
              const { data: created } = await supabase
                .from('profiles')
                .upsert({
                  id: session.user.id,
                  username: cleanUser || 'user_' + session.user.id.slice(0, 6),
                  display_name: session.user.user_metadata?.full_name || 'You',
                })
                .select('*')
                .maybeSingle();
              userProfile = created;
            }

            const me: Me = {
              id: session.user.id,
              name: userProfile?.display_name || session.user.user_metadata?.full_name || meRef.current.name,
              user: userProfile?.username || session.user.email?.split('@')[0] || meRef.current.user,
              bio: userProfile?.bio || meRef.current.bio || '',
              avatar: userProfile?.avatar_url || session.user.user_metadata?.avatar_url || meRef.current.avatar || null,
              banner: userProfile?.banner_url || meRef.current.banner || null,
              email: session.user.email,
            };
            dispatch({ type: 'signIn', me });
            loadSupabaseData(session.user.id);
          });
      } else {
        loadSupabaseData();
      }
    });

    // Listen to Auth State Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(async ({ data: profile, error: pErr }) => {
            if (pErr) {
              console.warn('Profiles table check on auth state change:', pErr.message);
              return;
            }
            let userProfile = profile;
            if (!userProfile) {
              const cleanUser =
                (session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user')
                  .toLowerCase()
                  .replace(/[^a-z0-9._]/g, '');
              const { data: created } = await supabase
                .from('profiles')
                .upsert({
                  id: session.user.id,
                  username: cleanUser || 'user_' + session.user.id.slice(0, 6),
                  display_name: session.user.user_metadata?.full_name || 'You',
                })
                .select('*')
                .maybeSingle();
              userProfile = created;
            }

            const me: Me = {
              id: session.user.id,
              name: userProfile?.display_name || session.user.user_metadata?.full_name || meRef.current.name,
              user: userProfile?.username || session.user.email?.split('@')[0] || meRef.current.user,
              bio: userProfile?.bio || meRef.current.bio || '',
              avatar: userProfile?.avatar_url || session.user.user_metadata?.avatar_url || meRef.current.avatar || null,
              banner: userProfile?.banner_url || meRef.current.banner || null,
              email: session.user.email,
            };
            dispatch({ type: 'signIn', me });
            loadSupabaseData(session.user.id);
          });
      } else {
        dispatch({ type: 'signOut' });
        loadSupabaseData();
      }
    });

    // Realtime Postgres Channel Subscription
    const channel = supabase
      .channel('sans-live-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotes' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRecord = payload.new as Record<string, any>;
            if (!newRecord?.id) return;
            const { data: newQ } = await supabase
              .from('quotes')
              .select(`
                id,
                body,
                theme,
                font,
                align,
                size,
                text_color,
                mood,
                tags,
                image_path,
                created_at,
                author_id,
                profiles:author_id (id, username, display_name, avatar_url),
                likes (user_id),
                comments (id, author_id, body, created_at, profiles:author_id (username))
              `)
              .eq('id', newRecord.id)
              .single();

            if (newQ) {
              const formatted = formatDbQuote(newQ, meRef.current.id);
              dispatch({ type: 'syncQuote', quote: formatted });
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRecord = payload.old as Record<string, any>;
            if (oldRecord?.id) {
              dispatch({ type: 'delete', id: oldRecord.id });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        async (payload) => {
          const newRec = payload.new as Record<string, any> | undefined;
          const oldRec = payload.old as Record<string, any> | undefined;
          const qid = newRec?.quote_id || oldRec?.quote_id;
          if (qid) {
            const { data: likes } = await supabase
              .from('likes')
              .select('user_id')
              .eq('quote_id', qid);

            if (likes) {
              const liked = meRef.current.id
                ? likes.some((l: any) => l.user_id === meRef.current.id)
                : false;
              dispatch({
                type: 'syncLikes',
                quoteId: qid,
                likes: likes.length,
                liked,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        async (payload) => {
          const newRec = payload.new as Record<string, any>;
          const qid = newRec?.quote_id;
          if (!qid || !newRec?.id) return;
          const { data: comm } = await supabase
            .from('comments')
            .select('id, body, author_id, profiles:author_id (username)')
            .eq('id', newRec.id)
            .single();

          if (comm) {
            dispatch({
              type: 'comment',
              id: qid,
              comment: {
                id: comm.id,
                author: (comm as any).profiles?.username || 'user',
                text: comm.body,
                mine: meRef.current.id ? comm.author_id === meRef.current.id : false,
              },
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        async (payload) => {
          const newRec = payload.new as Record<string, any>;
          if (meRef.current.id && newRec?.user_id === meRef.current.id && newRec?.id) {
            const { data: notif } = await supabase
              .from('notifications')
              .select('id, type, quote_id, read, created_at, profiles:actor_id (username)')
              .eq('id', newRec.id)
              .single();

            if (notif) {
              dispatch({
                type: 'addNotification',
                notice: {
                  id: notif.id,
                  type: notif.type as any,
                  user: (notif as any).profiles?.username || 'user',
                  quoteId: notif.quote_id,
                  read: notif.read,
                  at: new Date(notif.created_at).getTime(),
                },
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [loadSupabaseData, formatDbQuote]);

  // Persist to local storage
  useEffect(() => {
    if (!state.ready) return;
    const { ready: _ready, ...persist } = state;
    void _ready;
    try {
      localStorage.setItem(KEY, JSON.stringify(persist));
    } catch {
      /* storage full or blocked */
    }
  }, [state]);

  const value = useMemo<Store>(
    () => ({
      ...state,
      visible: state.quotes.filter(
        (q) => !state.reported.includes(q.id) && (q.mine || !state.blocked.includes(q.author))
      ),

      toggleLike: (id) => {
        dispatch({ type: 'like', id });
        const supabase = createClient();
        if (supabase && state.me.id) {
          const target = state.quotes.find((q) => q.id === id);
          if (target) {
            if (target.liked) {
              supabase
                .from('likes')
                .delete()
                .eq('quote_id', id)
                .eq('user_id', state.me.id)
                .then(() => null, () => null);
            } else {
              supabase
                .from('likes')
                .insert({ quote_id: id, user_id: state.me.id })
                .then(() => null, () => null);
            }
          }
        }
      },

      saveTo: (id, collection) => {
        dispatch({ type: 'save', id, collection });
        const supabase = createClient();
        if (supabase && state.me.id) {
          if (!collection) {
            supabase
              .from('collections')
              .select('id')
              .eq('owner_id', state.me.id)
              .then(({ data: cols }) => {
                if (cols && cols.length > 0) {
                  supabase
                    .from('saved')
                    .delete()
                    .eq('quote_id', id)
                    .in('collection_id', cols.map((c) => c.id))
                    .then(() => null, () => null);
                }
              });
          } else {
            supabase
              .from('collections')
              .select('id')
              .eq('owner_id', state.me.id)
              .eq('name', collection)
              .maybeSingle()
              .then(async ({ data: existing }) => {
                let colId = existing?.id;
                if (!colId) {
                  const { data: created } = await supabase
                    .from('collections')
                    .insert({ owner_id: state.me.id, name: collection })
                    .select('id')
                    .single();
                  if (created) colId = created.id;
                }
                if (colId) {
                  supabase
                    .from('saved')
                    .upsert({ collection_id: colId, quote_id: id })
                    .then(() => null, () => null);
                }
              });
          }
        }
      },

      addQuote: (n) => {
        const id = uid();
        const quote: Quote = {
          id,
          author: state.me.user,
          mine: true,
          likes: 0,
          liked: false,
          collection: null,
          comments: [],
          ...n,
        };
        dispatch({ type: 'add', quote });

        const supabase = createClient();
        if (supabase && state.me.id) {
          (async () => {
            let remoteImg = n.img;
            if (n.img && n.img.startsWith('data:')) {
              remoteImg = await uploadQuoteImage(n.img, state.me.id!);
            }
            await supabase.from('quotes').insert({
              id,
              author_id: state.me.id,
              body: n.text,
              theme: n.theme,
              font: n.font,
              align: n.align,
              size: n.size,
              text_color: n.textColor,
              mood: n.mood,
              tags: n.tags,
              image_path: remoteImg,
            });
          })().catch((err) => console.warn('Supabase addQuote error:', err));
        } else {
          // Demo reactions for guest mode
          setTimeout(() => dispatch({ type: 'demo', id, kind: 'like' }), 4000);
          setTimeout(() => dispatch({ type: 'demo', id, kind: 'comment' }), 9000);
          setTimeout(() => dispatch({ type: 'demo', id, kind: 'follow' }), 14000);
        }
      },

      deleteQuote: (id) => {
        dispatch({ type: 'delete', id });
        const supabase = createClient();
        if (supabase && state.me.id) {
          supabase
            .from('quotes')
            .delete()
            .eq('id', id)
            .then(() => null, () => null);
        }
      },

      addComment: (id, text) => {
        const cid = uid();
        dispatch({
          type: 'comment',
          id,
          comment: { id: cid, author: state.me.user, mine: true, text },
        });
        const supabase = createClient();
        if (supabase && state.me.id) {
          supabase
            .from('comments')
            .insert({
              id: cid,
              quote_id: id,
              author_id: state.me.id,
              body: text,
            })
            .then(() => null, () => null);
        }
      },

      report: (id) => {
        dispatch({ type: 'report', id });
        const supabase = createClient();
        if (supabase && state.me.id) {
          supabase
            .from('reports')
            .insert({
              quote_id: id,
              reporter_id: state.me.id,
              reason: 'Reported by user',
            })
            .then(() => null, () => null);
        }
      },

      block: (user) => {
        dispatch({ type: 'block', user });
        const supabase = createClient();
        if (supabase && state.me.id) {
          supabase
            .from('profiles')
            .select('id')
            .eq('username', user)
            .maybeSingle()
            .then(({ data: target }) => {
              if (target) {
                supabase
                  .from('blocks')
                  .insert({
                    blocker_id: state.me.id,
                    blocked_id: target.id,
                  })
                  .then(() => null, () => null);
              }
            });
        }
      },

      addCollection: (name) => {
        dispatch({ type: 'collection', name });
        const supabase = createClient();
        if (supabase && state.me.id) {
          supabase
            .from('collections')
            .insert({
              owner_id: state.me.id,
              name,
            })
            .then(() => null, () => null);
        }
      },

      updateMe: (updates) => {
        dispatch({ type: 'me', me: updates });
        const supabase = createClient();
        if (supabase && state.me.id) {
          (async () => {
            let avatarUrl = updates.avatar;
            if (updates.avatar && updates.avatar.startsWith('data:')) {
              avatarUrl = await uploadAvatar(updates.avatar, state.me.id!);
              dispatch({ type: 'me', me: { avatar: avatarUrl } });
            }

            let bannerUrl = updates.banner;
            if (updates.banner && updates.banner.startsWith('data:')) {
              bannerUrl = await uploadBanner(updates.banner, state.me.id!);
              dispatch({ type: 'me', me: { banner: bannerUrl } });
            }

            await supabase
              .from('profiles')
              .update({
                display_name: updates.name ?? state.me.name,
                username: updates.user ?? state.me.user,
                bio: updates.bio ?? state.me.bio,
                avatar_url: avatarUrl !== undefined ? avatarUrl : state.me.avatar,
                banner_url: bannerUrl !== undefined ? bannerUrl : state.me.banner,
                updated_at: new Date().toISOString(),
              })
              .eq('id', state.me.id);

            // Never put base64 data URLs into auth metadata to prevent oversized cookies (HTTP 431)
            const safeAvatar = avatarUrl && !avatarUrl.startsWith('data:') ? avatarUrl : undefined;
            await supabase.auth.updateUser({
              data: {
                full_name: updates.name ?? state.me.name,
                username: updates.user ?? state.me.user,
                ...(safeAvatar ? { avatar_url: safeAvatar } : {}),
              },
            });
          })().catch((err) => console.warn('Supabase updateMe error:', err));
        }
      },

      toggleFollow: (user) => {
        dispatch({ type: 'follow', user });
        const supabase = createClient();
        if (supabase && state.me.id) {
          supabase
            .from('profiles')
            .select('id')
            .eq('username', user)
            .maybeSingle()
            .then(({ data: target }) => {
              if (target) {
                const wasFollowing = state.follows.includes(user);
                if (wasFollowing) {
                  supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', state.me.id)
                    .eq('followee_id', target.id)
                    .then(() => null, () => null);
                } else {
                  supabase
                    .from('follows')
                    .insert({
                      follower_id: state.me.id,
                      followee_id: target.id,
                    })
                    .then(() => null, () => null);
                }
              }
            });
        }
      },

      markRead,

      signIn: (me) => {
        dispatch({ type: 'signIn', me });
        if (me.id) {
          loadSupabaseData(me.id);
        }
      },

      signOut: () => {
        const supabase = createClient();
        if (supabase) {
          supabase.auth.signOut().catch(() => null);
        }
        dispatch({ type: 'signOut' });
      },

      setTheme: (mode) => dispatch({ type: 'theme', mode }),
    }),
    [state, markRead, loadSupabaseData]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
}
