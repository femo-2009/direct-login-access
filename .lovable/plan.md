## Goal

Turn Rawy Blog into a full 3-role social platform (Guest / User / Admin) **without changing the existing visual design**. All new UI reuses the current colors, fonts, logo, and component style.

## Phase 0 — Enable Lovable Cloud + base schema

Enable Cloud (Postgres + Auth + Storage + Realtime). Create:

- `profiles` (id → auth.users, username, display_name, avatar_url, bio, created_at)
- `user_roles` (user_id, role: `admin` | `user`) — separate table, with `has_role()` security-definer function
- `admin_permissions` (user_id, can_kick, can_delete_posts, can_grant_verified, can_review_reports, can_manage_categories) — granular admin powers
- `categories` (id, name_en, name_ar, slug) — managed by admins (e.g. "Sci-Fi")
- `posts` (id, author_id, title, content, image_url, category_id, created_at)
- `comments` (id, post_id, author_id, content, created_at)
- `likes` (post_id, user_id) — composite PK
- `follows` (follower_id, following_id) — composite PK
- `reports` (id, post_id, reporter_id, reason, status, created_at)
- `notifications` (id, user_id, type: follow|new_post|report|admin_grant, payload jsonb, read, created_at)
- `badges` (id, user_id, type: verified|admin|tier, granted_by, created_at)
- Storage buckets: `avatars` (public), `post-images` (public)

RLS on every table. Auto-create profile on signup via trigger. Auto-assign `user` role on signup; first signup with the existing admin email gets `admin` + all permissions.

## Phase 1 — Auth modes & guest flow

- **Guest**: "Continue as guest" on login → can read posts and view profiles only. Cannot like, comment, follow, post, or own a profile. Any restricted action shows a "sign up to continue" prompt.
- **User**: standard email signup/login → goes to home feed.
- **Admin**: same login, but routed to admin dashboard with admin badge.
- Top bar shown on every page (login, home, profile, etc.) with: **Language toggle** (EN default ↔ AR), and when logged-in: **Add post**, **Notifications**, **Settings menu** (→ Profile / Logout). Guest sees only Language + Sign up.

## Phase 2 — Posts, feed & post detail

- **Add Post form**: title, image upload, body, category dropdown (from admin-managed list).
- **Feed**: modern card grid — cover image, title, author avatar + name + badges, follow button, excerpt, like / comment / report buttons.
- **Post detail modal/page**: full story, scroll-friendly typography, comments below.
- Likes: heart icon, plays a soft "pop" sound on click.
- Comments: input + send, plays a soft "tap" sound on submit.
- Report: sends a `report` notification to all admins with `can_review_reports`.
- Click author avatar anywhere → opens that user's profile (read-only for guests).

## Phase 3 — Profiles, tiers, follows, notifications

- Profile page: avatar (uploadable), display name, post count, **auto tier badge** computed from posts:
  - 0–3 → Beginner
  - 4–7 → Silver
  - 8–15 → Gold
  - 16+ → Master
- Plus optional **Verified** badge (granted by admin) and **Admin** badge (only admins).
- Followers / Following counts + lists.
- Follow button creates a `follow` notification for the followed user.
- New post by someone you follow creates a `new_post` notification for each follower.
- **Notifications panel** (bell dropdown): list, mark-as-read, realtime via Supabase Realtime.
- **Browser push**: request `Notification` permission and fire a native browser notification when a realtime notification arrives while the tab is open or backgrounded (true OS push requires a service worker + VAPID — out of scope for v1, can be added later).

## Phase 4 — Admin dashboard

Settings menu for admins gets extra items:

- **Users on the site**: list with search by name / username / email.
- **Add admin**: search a user → checkbox list of permissions → grant `admin` role + selected `admin_permissions` + admin badge.
- Per-post admin actions (visible only to admins with the matching permission):
  - Kick user (disable account)
  - Delete post
  - Grant Verified badge to author
- **Reports inbox**: review reported posts, delete or dismiss.
- **Categories manager**: add / edit / delete categories used in the post form.

## Phase 5 — Polish & QA

- Sound assets (like + comment) added to `src/assets/sounds/`.
- All new strings translated EN + AR via existing `LanguageContext`.
- Verify the original design tokens, splash, and login look untouched.
- Test each role end-to-end in the preview.

## Technical notes

- Stack stays as-is: TanStack Start, file-based routes, existing `LanguageContext`, existing splash gate.
- New routes: `/feed`, `/post/$postId`, `/profile/$username`, `/admin/users`, `/admin/categories`, `/admin/reports`, `/admin/add-admin`.
- All DB writes go through `createServerFn` with `requireSupabaseAuth`; admin-only mutations check `has_role` + the matching `admin_permissions` flag server-side.
- Realtime via `supabase.channel('notifications:user_id=eq.<me>')`.
- Guest mode = no Supabase session; restricted actions are gated client-side AND by RLS.

## Delivery

I'll implement Phase 0 + Phase 1 in the first pass so you can sign in / browse / see the new top bar, then continue Phase 2 → 5 in follow-up turns. Each phase is independently testable.
