import { createFileRoute, redirect } from "@tanstack/react-router";
import NotificationsPage from "@/pages/NotificationsPage";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/notifications")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { user } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
  },
  component: NotificationsPage,
});
