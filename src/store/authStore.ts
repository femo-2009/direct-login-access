import type { Role, User } from "@/types";
import { create } from "zustand";

export interface AdminPermissions {
  can_kick: boolean;
  can_delete_posts: boolean;
  can_grant_verified: boolean;
  can_review_reports: boolean;
  can_manage_categories: boolean;
}

interface AuthState {
  user: User | null;
  role: Role;
  sessionToken: string | null;
  adminPerms: AdminPermissions | null;
  isLoading: boolean;
  setUser: (user: User, token: string) => void;
  setRole: (role: Role) => void;
  setAdminPerms: (perms: AdminPermissions | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  continueAsGuest: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: "guest",
  sessionToken: null,
  adminPerms: null,
  isLoading: true,
  setUser: (user, token) =>
    set({ user, role: user.role, sessionToken: token, isLoading: false }),
  setRole: (role) => set({ role }),
  setAdminPerms: (perms) => set({ adminPerms: perms }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () =>
    set({
      user: null,
      role: "guest",
      sessionToken: null,
      adminPerms: null,
      isLoading: false,
    }),
  continueAsGuest: () =>
    set({
      user: null,
      role: "guest",
      sessionToken: null,
      adminPerms: null,
      isLoading: false,
    }),
}));
