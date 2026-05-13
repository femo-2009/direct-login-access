-- =========================================================
-- ENUMS
-- =========================================================
create type public.app_role as enum ('admin', 'user');
create type public.notification_type as enum ('follow', 'new_post', 'report', 'admin_grant', 'verified_grant');
create type public.badge_type as enum ('verified', 'admin');
create type public.report_status as enum ('pending', 'reviewed', 'dismissed');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Roles are viewable by everyone" on public.user_roles for select using (true);
create policy "Admins manage roles" on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ADMIN PERMISSIONS
create table public.admin_permissions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  can_kick boolean not null default false,
  can_delete_posts boolean not null default false,
  can_grant_verified boolean not null default false,
  can_review_reports boolean not null default false,
  can_manage_categories boolean not null default false,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.admin_permissions enable row level security;
create policy "Admins view permissions" on public.admin_permissions for select using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage permissions" on public.admin_permissions for all
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.has_admin_permission(_user_id uuid, _perm text)
returns boolean language plpgsql stable security definer set search_path = public
as $$
declare ok boolean;
begin
  execute format('select coalesce(%I, false) from public.admin_permissions where user_id = $1', _perm)
    into ok using _user_id;
  return coalesce(ok, false);
end; $$;

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_ar text not null,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "Categories viewable by everyone" on public.categories for select using (true);
create policy "Admins with permission manage categories" on public.categories for all
  using (public.has_admin_permission(auth.uid(), 'can_manage_categories'))
  with check (public.has_admin_permission(auth.uid(), 'can_manage_categories'));

insert into public.categories (slug, name_en, name_ar) values
  ('sci-fi', 'Sci-Fi', 'خيال علمي'),
  ('fantasy', 'Fantasy', 'فانتازيا'),
  ('romance', 'Romance', 'رومانسية'),
  ('mystery', 'Mystery', 'غموض'),
  ('horror', 'Horror', 'رعب'),
  ('drama', 'Drama', 'دراما');

-- POSTS
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.posts enable row level security;
create policy "Posts viewable by everyone" on public.posts for select using (true);
create policy "Users can create posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "Authors update own posts" on public.posts for update using (auth.uid() = author_id);
create policy "Authors delete own posts" on public.posts for delete using (auth.uid() = author_id);
create policy "Admins with permission delete any post" on public.posts for delete using (public.has_admin_permission(auth.uid(), 'can_delete_posts'));

-- COMMENTS
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
create policy "Comments viewable by everyone" on public.comments for select using (true);
create policy "Signed-in users create comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "Authors delete own comments" on public.comments for delete using (auth.uid() = author_id);
create policy "Admins delete any comment" on public.comments for delete using (public.has_admin_permission(auth.uid(), 'can_delete_posts'));

-- LIKES
create table public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.likes enable row level security;
create policy "Likes viewable by everyone" on public.likes for select using (true);
create policy "Users like as themselves" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users unlike own" on public.likes for delete using (auth.uid() = user_id);

-- FOLLOWS
create table public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
alter table public.follows enable row level security;
create policy "Follows viewable by everyone" on public.follows for select using (true);
create policy "Users follow as themselves" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users unfollow as themselves" on public.follows for delete using (auth.uid() = follower_id);

-- REPORTS
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;
create policy "Reporters view own" on public.reports for select using (auth.uid() = reporter_id);
create policy "Admins view reports" on public.reports for select using (public.has_admin_permission(auth.uid(), 'can_review_reports'));
create policy "Users create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "Admins update reports" on public.reports for update using (public.has_admin_permission(auth.uid(), 'can_review_reports'));

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.notification_type not null,
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "Users view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Anyone can insert notifications" on public.notifications for insert with check (true);
alter publication supabase_realtime add table public.notifications;
alter table public.notifications replica identity full;

-- BADGES
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.badge_type not null,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_id, type)
);
alter table public.badges enable row level security;
create policy "Badges viewable by everyone" on public.badges for select using (true);
create policy "Admins grant verified badges" on public.badges for insert with check (
  (type = 'verified' and public.has_admin_permission(auth.uid(), 'can_grant_verified'))
  or (type = 'admin' and public.has_role(auth.uid(), 'admin'))
);
create policy "Admins remove badges" on public.badges for delete using (public.has_role(auth.uid(), 'admin'));

-- AUTO PROFILE + ROLE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare uname text; dname text; is_seed_admin boolean;
begin
  uname := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  dname := coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', uname);
  while exists(select 1 from public.profiles where username = uname) loop
    uname := uname || floor(random()*9999)::text;
  end loop;
  insert into public.profiles (id, username, display_name) values (new.id, uname, dname);
  is_seed_admin := lower(new.email) = 'rawy.admin.234@gmail.com';
  insert into public.user_roles (user_id, role)
    values (new.id, case when is_seed_admin then 'admin'::public.app_role else 'user'::public.app_role end);
  if is_seed_admin then
    insert into public.admin_permissions (user_id, can_kick, can_delete_posts, can_grant_verified, can_review_reports, can_manage_categories)
      values (new.id, true, true, true, true, true);
    insert into public.badges (user_id, type) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- AUTO NOTIFICATION ON FOLLOW
create or replace function public.notify_on_follow()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.notifications (user_id, type, payload)
    values (new.following_id, 'follow', jsonb_build_object('follower_id', new.follower_id));
  return new;
end; $$;
create trigger trg_notify_on_follow after insert on public.follows
  for each row execute function public.notify_on_follow();

-- AUTO NOTIFICATION ON NEW POST
create or replace function public.notify_followers_on_post()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.notifications (user_id, type, payload)
  select f.follower_id, 'new_post', jsonb_build_object('post_id', new.id, 'author_id', new.author_id)
  from public.follows f where f.following_id = new.author_id;
  return new;
end; $$;
create trigger trg_notify_followers_on_post after insert on public.posts
  for each row execute function public.notify_followers_on_post();

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true) on conflict (id) do nothing;

create policy "Avatars are public" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users upload own avatar" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users update own avatar" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own avatar" on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Post images are public" on storage.objects for select using (bucket_id = 'post-images');
create policy "Users upload own post images" on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own post images" on storage.objects for delete
  using (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);