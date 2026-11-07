-- WorldHopper Social Schema & Row-Level Security Policies
-- Publishing is opt-in per island. Private objectives, detailed goal progress,
-- email addresses, and raw browser storage are kept out of public tables/reads.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (char_length(handle) between 2 and 40),
  display_name text not null check (char_length(display_name) between 1 and 60),
  bio text not null default '' check (char_length(bio) <= 240),
  interests text[] not null default '{}',
  is_public boolean not null default true,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.islands (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  category text not null check (category in ('guitar', 'songwriting', 'photography', 'custom')),
  topic text,
  theme text,
  experience text not null default 'beginner' check (experience in ('beginner', 'intermediate', 'advanced')),
  session_minutes integer not null default 20 check (session_minutes between 1 and 120),
  xp integer not null default 0 check (xp >= 0),
  is_public boolean not null default false,
  public_summary text not null default '' check (char_length(public_summary) <= 220),
  shared_milestone text check (shared_milestone is null or char_length(shared_milestone) <= 220),
  roadmap jsonb not null default '{}'::jsonb,
  starter_goals jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Separate owner-only table for private objectives, per-goal completion state, and browser storage
-- so even column-wildcard selects on public.islands cannot leak sensitive progress.
create table if not exists public.island_private_state (
  island_id uuid primary key references public.islands(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  private_objective text not null default '',
  completed_goal_ids text[] not null default '{}',
  difficulty text not null default 'standard',
  raw_storage jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

create index if not exists idx_islands_owner_public on public.islands(owner_id, is_public);
create index if not exists idx_follows_following on public.follows(following_id);
create index if not exists idx_follows_follower on public.follows(follower_id);

-- Enable Row Level Security on every table
alter table public.profiles enable row level security;
alter table public.islands enable row level security;
alter table public.island_private_state enable row level security;
alter table public.follows enable row level security;

-- PROFILES POLICIES
create policy "profiles_select_public_or_own"
  on public.profiles for select
  using (is_public = true or auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- ISLANDS POLICIES (strictly opt-in per island for public reads)
create policy "islands_select_public_or_own"
  on public.islands for select
  using (
    (
      is_public = true
      and exists (
        select 1 from public.profiles p
        where p.id = islands.owner_id and p.is_public = true
      )
    )
    or auth.uid() = owner_id
  );

create policy "islands_insert_own"
  on public.islands for insert
  with check (auth.uid() = owner_id);

create policy "islands_update_own"
  on public.islands for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "islands_delete_own"
  on public.islands for delete
  using (auth.uid() = owner_id);

-- ISLAND_PRIVATE_STATE POLICIES (strictly owner-only)
create policy "island_private_state_owner_select"
  on public.island_private_state for select
  using (auth.uid() = owner_id);

create policy "island_private_state_owner_insert"
  on public.island_private_state for insert
  with check (auth.uid() = owner_id);

create policy "island_private_state_owner_update"
  on public.island_private_state for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "island_private_state_owner_delete"
  on public.island_private_state for delete
  using (auth.uid() = owner_id);

-- FOLLOWS POLICIES (anyone can read public follows; only authenticated follower can insert/delete own row)
create policy "follows_select_public"
  on public.follows for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = follows.following_id and (p.is_public = true or auth.uid() = follows.follower_id)
    )
  );

create policy "follows_insert_own"
  on public.follows for insert
  with check (
    auth.uid() = follower_id
    and follower_id <> following_id
    and exists (
      select 1 from public.profiles p
      where p.id = following_id and p.is_public = true
    )
  );

create policy "follows_delete_own"
  on public.follows for delete
  using (auth.uid() = follower_id);
