import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Bell, BookOpen, UserPlus, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface NotificationRow {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, type, payload, read, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      return (data ?? []) as NotificationRow[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["notifications", user.id] });
          // Try in-app browser notification
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(lang === "ar" ? "إشعار جديد" : "New notification");
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, qc, lang]);

  // Mark all as read on mount
  useEffect(() => {
    if (!user) return;
    void supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl mb-6 flex items-center gap-2">
          <Bell className="w-7 h-7 text-primary" />
          {lang === "ar" ? "الإشعارات" : "Notifications"}
        </h1>

        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        ) : !data?.length ? (
          <div className="text-center text-muted-foreground py-12">
            {lang === "ar" ? "لا توجد إشعارات" : "No notifications"}
          </div>
        ) : (
          <ul className="space-y-2">
            {data.map((n) => (
              <NotificationItem key={n.id} n={n} lang={lang} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NotificationItem({ n, lang }: { n: NotificationRow; lang: "en" | "ar" }) {
  const isFollow = n.type === "follow";
  const Icon = isFollow ? UserPlus : BookOpen;
  const otherId = (n.payload?.follower_id ?? n.payload?.author_id) as string | undefined;

  const { data: profile } = useQuery({
    queryKey: ["profile-by-id", otherId],
    enabled: Boolean(otherId),
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", otherId!)
        .maybeSingle();
      return data;
    },
  });

  const name = profile?.display_name ?? (lang === "ar" ? "مستخدم" : "Someone");
  const text = isFollow
    ? lang === "ar"
      ? `${name} بدأ بمتابعتك`
      : `${name} started following you`
    : lang === "ar"
      ? `${name} نشر منشوراً جديداً`
      : `${name} published a new post`;

  return (
    <li className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-primary/40 transition">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        {profile ? (
          <Link
            to="/profile/$username"
            params={{ username: profile.username }}
            className="text-sm hover:text-primary"
          >
            {text}
          </Link>
        ) : (
          <span className="text-sm">{text}</span>
        )}
        <p className="text-xs text-muted-foreground">
          {new Date(n.created_at).toLocaleString(lang === "ar" ? "ar" : "en")}
        </p>
      </div>
      {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
    </li>
  );
}
