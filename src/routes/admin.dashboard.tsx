import { createFileRoute, redirect } from "@tanstack/react-router";
import AdminDashboard from "@/pages/AdminDashboard";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/admin/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { user, role } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
    if (role !== "admin") throw redirect({ to: "/user/dashboard" });
  },
  component: AdminDashboard,
});
