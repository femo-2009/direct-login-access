import { createFileRoute, redirect } from "@tanstack/react-router";
import PermissionsPage from "@/pages/PermissionsPage";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/permissions")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { user } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
  },
  component: PermissionsPage,
});
