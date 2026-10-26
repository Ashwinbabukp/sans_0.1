# Sans

A pastel quote-sharing app: swipe through quote cards, write your own, and share the ones that hit.
Built with Next.js (App Router), React and TypeScript.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Features

- Swipe feed with pastel and gradient cards; double-tap to like, swipe left to save
- Welcome screen with a profile (name + username), profile page with an aesthetic post grid
- Follow people and a Following feed; comments; report, block and delete
- Tags and mood on every quote (hidden on the card): search quotes, people and #tags, trending tags, and tags in the ⋯ menu; #hashtags typed in a quote are moved into tags automatically
- Mood filter, a Quote of the day, and collections for saved quotes
- Composer: 10 fonts including Malayalam, Hindi and Tamil, alignment, size, text colour, stickers, gradients, gallery photos
- Instagram share cards: Story (9:16) and Post (4:5), Frame and Minimal styles, with sans. branding and a copy-caption button; liking a quote offers a Share card button
- Notifications, and a light / dark / system appearance setting

## What is real and what is demo

Everything is stored in the browser (localStorage), so there is no shared data between people yet:

- "Sign in" creates a profile on this device. It is not real authentication.
- Likes, follows and comments only exist on this device.
- Notifications are demo reactions: after you post, sample accounts like, comment and follow so you can see the feature working.
- The sample quotes and people are placeholder data.

## Going live with Supabase

1. Create a project at supabase.com and run `supabase/schema.sql` in the SQL editor.
2. Enable Google or phone sign-in under Authentication.
3. `npm i @supabase/supabase-js`, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
4. Replace the actions in `lib/store.tsx` (like, save, add quote, comment, follow, report, block) with Supabase calls, and upload gallery photos to Supabase Storage instead of storing data URLs.
5. Create notifications from database triggers or a small Edge Function, and deploy to Vercel.

## Structure

```
app/           layout, page, global styles
components/    SansApp (shell), Feed, QuoteCard, Composer, ProfilePage, SearchPage, NotificationsPage, sheets
lib/           types, themes, fonts, seed data, utils, cardImage (PNG export), store (state + persistence)
supabase/      schema.sql
```
