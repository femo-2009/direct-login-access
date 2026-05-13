import { createFileRoute, redirect } from "@tanstack/react-router";
import UserDashboard from "@/pages/UserDashboard";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/user/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { user, role } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
    if (role === "admin") throw redirect({ to: "/admin/dashboard" });
  },
  component: UserDashboard,
});
