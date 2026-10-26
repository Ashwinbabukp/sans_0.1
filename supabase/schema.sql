-- Sans: starter schema for Supabase (Postgres). Run it in the Supabase SQL editor.
-- Auth users live in auth.users; each gets a row in profiles.

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9._]{3,20}$'),
  display_name text not null,
  bio text default '',
  created_at timestamptz default now()
);

create table quotes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles on delete cascade,
  body text not null check (char_length(body) between 1 and 180),
  theme int not null default 0,
  font text not null default 'serif',
  align text not null default 'left',
  size text not null default 'm',
  text_color text not null default 'auto',
  sticker text,
  mood text,
  image_path text,            -- path in Supabase Storage, not a data URL
  created_at timestamptz default now()
);

create table likes      (quote_id uuid references quotes on delete cascade, user_id uuid references profiles on delete cascade, primary key (quote_id, user_id));
create table follows    (follower_id uuid references profiles on delete cascade, followee_id uuid references profiles on delete cascade, primary key (follower_id, followee_id));
create table blocks     (blocker_id uuid references profiles on delete cascade, blocked_id uuid references profiles on delete cascade, primary key (blocker_id, blocked_id));
create table reports    (id uuid primary key default gen_random_uuid(), quote_id uuid references quotes on delete cascade, reporter_id uuid references profiles on delete cascade, created_at timestamptz default now());
create table comments   (id uuid primary key default gen_random_uuid(), quote_id uuid references quotes on delete cascade, author_id uuid references profiles on delete cascade, body text not null check (char_length(body) <= 200), created_at timestamptz default now());
create table collections(id uuid primary key default gen_random_uuid(), owner_id uuid references profiles on delete cascade, name text not null, unique (owner_id, name));
create table saved      (collection_id uuid references collections on delete cascade, quote_id uuid references quotes on delete cascade, primary key (collection_id, quote_id));
create table notifications (id uuid primary key default gen_random_uuid(), user_id uuid references profiles on delete cascade, actor_id uuid references profiles on delete cascade, type text check (type in ('like','comment','follow')), quote_id uuid references quotes on delete cascade, read boolean default false, created_at timestamptz default now());

-- Row level security: everyone signed in can read; people only change their own rows.
alter table profiles enable row level security;
alter table quotes enable row level security;
alter table likes enable row level security;
alter table follows enable row level security;
alter table blocks enable row level security;
alter table reports enable row level security;
alter table comments enable row level security;
alter table collections enable row level security;
alter table saved enable row level security;
alter table notifications enable row level security;

create policy "read profiles" on profiles for select using (true);
create policy "edit own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "read quotes" on quotes for select using (true);
create policy "write own quotes" on quotes for all using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "read likes" on likes for select using (true);
create policy "write own likes" on likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "read follows" on follows for select using (true);
create policy "write own follows" on follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
create policy "own blocks" on blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
create policy "own reports" on reports for all using (auth.uid() = reporter_id) with check (auth.uid() = reporter_id);
create policy "read comments" on comments for select using (true);
create policy "write own comments" on comments for all using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "own collections" on collections for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "own saved" on saved for all
  using (exists (select 1 from collections c where c.id = collection_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from collections c where c.id = collection_id and c.owner_id = auth.uid()));
create policy "own notifications" on notifications for select using (auth.uid() = user_id);
create policy "mark own read" on notifications for update using (auth.uid() = user_id);
