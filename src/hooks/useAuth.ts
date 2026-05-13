import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types";
import { useCallback } from "react";

export function useAuth() {
  const {
    user,
    role,
    sessionToken,
    adminPerms,
    isLoading,
    setUser,
    setRole,
    setAdminPerms,
    setLoading,
    logout: storeLogout,
    continueAsGuest,
  } = useAuthStore();

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    storeLogout();
  }, [storeLogout]);

  const isAuthenticated = Boolean(user && sessionToken);
  const isAdmin = role === "admin";
  const isGuest = !isAuthenticated;
  const isNormalUser = role === "user";

  const hasRole = useCallback(
    (requiredRole: Role): boolean => {
      const hierarchy: Record<Role, number> = { guest: 0, user: 1, admin: 2 };
      return hierarchy[role] >= hierarchy[requiredRole];
    },
    [role],
  );

  const hasAdminPerm = useCallback(
    (perm: keyof NonNullable<typeof adminPerms>): boolean => {
      if (!isAdmin || !adminPerms) return false;
      return Boolean(adminPerms[perm]);
    },
    [isAdmin, adminPerms],
  );

  return {
    user,
    role,
    sessionToken,
    adminPerms,
    isLoading,
    isAuthenticated,
    isAdmin,
    isGuest,
    isNormalUser,
    hasRole,
    hasAdminPerm,
    setUser,
    setRole,
    setAdminPerms,
    setLoading,
    logout,
    continueAsGuest,
  };
}
