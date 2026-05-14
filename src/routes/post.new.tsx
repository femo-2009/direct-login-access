import { createFileRoute, redirect } from "@tanstack/react-router";
import NewPostPage from "@/pages/NewPostPage";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/post/new")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { user } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
  },
  component: NewPostPage,
});
