import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

async function hydrateFromSession(session: Session | null) {
  const store = useAuthStore.getState();
  if (!session?.user) {
    store.logout();
    return;
  }
  const userId = session.user.id;
  const email = session.user.email ?? "";

  // Fetch profile, role, admin perms in parallel
  const [profileRes, rolesRes, permsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name, avatar_url, bio")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase
      .from("admin_permissions")
      .select(
        "can_kick, can_delete_posts, can_grant_verified, can_review_reports, can_manage_categories",
      )
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const isAdmin = (rolesRes.data ?? []).some((r) => r.role === "admin");

  store.setUser(
    {
      id: userId,
      email,
      name: profile?.display_name ?? email.split("@")[0] ?? "User",
      username: profile?.username ?? email.split("@")[0] ?? "user",
      gender: "unspecified",
      age: 0,
      role: isAdmin ? "admin" : "user",
    },
    session.access_token,
  );
  store.setAdminPerms(isAdmin ? (permsRes.data ?? null) : null);
}

/**
 * Mount once at the root. Listens to Supabase auth state and syncs into authStore.
 */
export function useSupabaseSession() {
  useEffect(() => {
    let mounted = true;

    // 1. Listener FIRST to avoid missing events
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      // Defer DB calls to avoid deadlock inside the callback
      setTimeout(() => {
        void hydrateFromSession(session);
      }, 0);
    });

    // 2. Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      void hydrateFromSession(data.session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
}
