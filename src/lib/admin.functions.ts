import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const kickUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ targetUserId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verify caller has can_kick permission
    const { data: perm } = await supabase
      .from("admin_permissions")
      .select("can_kick")
      .eq("user_id", userId)
      .maybeSingle();

    if (!perm?.can_kick) {
      throw new Error("Forbidden: missing can_kick permission");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(
      data.targetUserId,
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const searchUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ query: z.string().min(1).max(100) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Caller must be admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw new Error("Forbidden");

    const q = data.query.trim();

    // Profile search (username / display_name)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
      .limit(20);

    // Email search via admin auth
    let emailMatches: { id: string; email: string | undefined }[] = [];
    if (q.includes("@") || q.length >= 3) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      emailMatches = (list?.users ?? [])
        .filter((u) => (u.email ?? "").toLowerCase().includes(q.toLowerCase()))
        .map((u) => ({ id: u.id, email: u.email ?? undefined }));
    }

    // Merge
    const byId = new Map<
      string,
      {
        id: string;
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
        email?: string;
      }
    >();
    for (const p of profiles ?? []) byId.set(p.id, { ...p });
    for (const e of emailMatches) {
      const existing = byId.get(e.id);
      if (existing) existing.email = e.email;
      else
        byId.set(e.id, {
          id: e.id,
          username: null,
          display_name: null,
          avatar_url: null,
          email: e.email,
        });
    }

    // Attach emails to profile-only matches
    const ids = [...byId.keys()];
    if (ids.length) {
      const { data: list2 } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      for (const u of list2?.users ?? []) {
        const existing = byId.get(u.id);
        if (existing && !existing.email) existing.email = u.email ?? undefined;
      }
    }

    return { results: [...byId.values()].slice(0, 20) };
  });

export const grantAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        targetUserId: z.string().uuid(),
        perms: z.object({
          can_kick: z.boolean(),
          can_delete_posts: z.boolean(),
          can_grant_verified: z.boolean(),
          can_review_reports: z.boolean(),
          can_manage_categories: z.boolean(),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw new Error("Forbidden");

    // Insert admin role (ignore conflict)
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.targetUserId, role: "admin" }, { onConflict: "user_id,role" });

    // Upsert permissions
    await supabaseAdmin.from("admin_permissions").upsert(
      {
        user_id: data.targetUserId,
        ...data.perms,
        granted_by: userId,
      },
      { onConflict: "user_id" },
    );

    // Grant admin badge
    await supabaseAdmin
      .from("badges")
      .insert({ user_id: data.targetUserId, type: "admin", granted_by: userId })
      .select()
      .maybeSingle();

    return { ok: true };
  });
