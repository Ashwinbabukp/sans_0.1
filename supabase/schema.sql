-- Sans: Production-ready Supabase Schema with JWT Auth & RLS
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9._]{3,20}$'),
  display_name text not null,
  bio text default '',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Automatic Profile Creation Trigger for Email/Password & Google OAuth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  raw_user text;
  clean_user text;
  display text;
begin
  raw_user := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'user_name',
    split_part(new.email, '@', 1)
  );
  clean_user := lower(regexp_replace(raw_user, '[^a-z0-9._]', '', 'g'));
  if length(clean_user) < 3 then
    clean_user := 'user_' || substr(new.id::text, 1, 6);
  end if;
  clean_user := substr(clean_user, 1, 20);

  if exists (select 1 from public.profiles where username = clean_user) then
    clean_user := substr(clean_user, 1, 13) || '_' || substr(new.id::text, 1, 6);
  end if;

  display := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    clean_user
  );

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    clean_user,
    display,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. QUOTES
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 180),
  theme int not null default 0,
  font text not null default 'serif',
  align text not null default 'left',
  size text not null default 'm',
  text_color text not null default 'auto',
  mood text,
  tags text[] not null default '{}',
  image_path text,
  created_at timestamptz default now()
);

-- 3. INTERACTION TABLES
create table if not exists public.likes (
  quote_id uuid references public.quotes(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (quote_id, user_id)
);

create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  followee_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, followee_id)
);

create table if not exists public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references public.quotes(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete cascade,
  reason text default '',
  created_at timestamptz default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references public.quotes(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 200),
  created_at timestamptz default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique (owner_id, name)
);

create table if not exists public.saved (
  collection_id uuid references public.collections(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (collection_id, quote_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'follow')),
  quote_id uuid references public.quotes(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- 4. AUTOMATIC NOTIFICATIONS (DATABASE TRIGGERS)
create or replace function public.notify_on_like()
returns trigger language plpgsql security definer as $$
declare
  target_user uuid;
begin
  select author_id into target_user from public.quotes where id = new.quote_id;
  if target_user is not null and target_user <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, quote_id)
    values (target_user, new.user_id, 'like', new.quote_id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_like_created on public.likes;
create trigger on_like_created
  after insert on public.likes
  for each row execute function public.notify_on_like();

create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer as $$
declare
  target_user uuid;
begin
  select author_id into target_user from public.quotes where id = new.quote_id;
  if target_user is not null and target_user <> new.author_id then
    insert into public.notifications (user_id, actor_id, type, quote_id, comment_id)
    values (target_user, new.author_id, 'comment', new.quote_id, new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_comment_created on public.comments;
create trigger on_comment_created
  after insert on public.comments
  for each row execute function public.notify_on_comment();

create or replace function public.notify_on_follow()
returns trigger language plpgsql security definer as $$
begin
  if new.follower_id <> new.followee_id then
    insert into public.notifications (user_id, actor_id, type)
    values (new.followee_id, new.follower_id, 'follow');
  end if;
  return new;
end;
$$;

drop trigger if exists on_follow_created on public.follows;
create trigger on_follow_created
  after insert on public.follows
  for each row execute function public.notify_on_follow();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.quotes enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.comments enable row level security;
alter table public.collections enable row level security;
alter table public.saved enable row level security;
alter table public.notifications enable row level security;

-- Profiles: Anyone can view profiles; users can only update their own
create policy "Anyone can read profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Quotes: Anyone can read unblocked quotes; users can insert/update/delete their own
create policy "Anyone can read quotes" on public.quotes for select using (true);
create policy "Users can insert own quotes" on public.quotes for insert
  with check (auth.uid() = author_id);
create policy "Users can update own quotes" on public.quotes for update
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "Users can delete own quotes" on public.quotes for delete
  using (auth.uid() = author_id);

-- Likes: Anyone can read; authenticated users can like / unlike
create policy "Anyone can read likes" on public.likes for select using (true);
create policy "Users can like" on public.likes for insert
  with check (auth.uid() = user_id);
create policy "Users can unlike" on public.likes for delete
  using (auth.uid() = user_id);

-- Follows: Anyone can read; users manage their own follows
create policy "Anyone can read follows" on public.follows for select using (true);
create policy "Users can follow" on public.follows for insert
  with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete
  using (auth.uid() = follower_id);

-- Blocks: Users manage their own block list
create policy "Users can view own blocks" on public.blocks for select
  using (auth.uid() = blocker_id);
create policy "Users can block" on public.blocks for insert
  with check (auth.uid() = blocker_id);
create policy "Users can unblock" on public.blocks for delete
  using (auth.uid() = blocker_id);

-- Reports: Authenticated users can submit reports
create policy "Users can report" on public.reports for insert
  with check (auth.uid() = reporter_id);
create policy "Users can view own reports" on public.reports for select
  using (auth.uid() = reporter_id);

-- Comments: Anyone can read; author can insert/delete
create policy "Anyone can read comments" on public.comments for select using (true);
create policy "Users can comment" on public.comments for insert
  with check (auth.uid() = author_id);
create policy "Users can delete own comments" on public.comments for delete
  using (auth.uid() = author_id);

-- Collections & Saved: Private to each user
create policy "Users can view own collections" on public.collections for select
  using (auth.uid() = owner_id);
create policy "Users can create collections" on public.collections for insert
  with check (auth.uid() = owner_id);
create policy "Users can delete own collections" on public.collections for delete
  using (auth.uid() = owner_id);

create policy "Users can view own saved" on public.saved for select
  using (exists (select 1 from public.collections c where c.id = collection_id and c.owner_id = auth.uid()));
create policy "Users can save quotes" on public.saved for insert
  with check (exists (select 1 from public.collections c where c.id = collection_id and c.owner_id = auth.uid()));
create policy "Users can unsave quotes" on public.saved for delete
  using (exists (select 1 from public.collections c where c.id = collection_id and c.owner_id = auth.uid()));

-- Notifications: Strictly private to recipient
create policy "Users can view own notifications" on public.notifications for select
  using (auth.uid() = user_id);
create policy "Users can mark own notifications read" on public.notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
