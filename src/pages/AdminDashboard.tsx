import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PostFeed } from "@/components/posts/PostFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { grantAdmin, kickUser, searchUsers } from "@/lib/admin.functions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, Loader2, Search, Trash2, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const { user } = useAuth();

  const t =
    lang === "ar"
      ? { feed: "الفيد", users: "المستخدمون", addAdmin: "إضافة أدمن", categories: "التصنيفات", reports: "البلاغات" }
      : { feed: "Feed", users: "Users", addAdmin: "Add Admin", categories: "Categories", reports: "Reports" };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl mb-6 text-gradient-amber">
          {lang === "ar" ? "لوحة الأدمن" : "Admin Dashboard"}
        </h1>
        <Tabs defaultValue="feed">
          <TabsList className="flex-wrap">
            <TabsTrigger value="feed">{t.feed}</TabsTrigger>
            <TabsTrigger value="users">{t.users}</TabsTrigger>
            <TabsTrigger value="addadmin">{t.addAdmin}</TabsTrigger>
            <TabsTrigger value="categories">{t.categories}</TabsTrigger>
            <TabsTrigger value="reports">{t.reports}</TabsTrigger>
          </TabsList>
          <TabsContent value="feed" className="mt-6">
            <PostFeed />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
          <TabsContent value="addadmin" className="mt-6">
            <AddAdminPanel />
          </TabsContent>
          <TabsContent value="categories" className="mt-6">
            <CategoryManagement />
          </TabsContent>
          <TabsContent value="reports" className="mt-6">
            <ReportsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function UserSearch({
  onSelect,
  placeholder,
}: {
  onSelect: (u: { id: string; username: string | null; display_name: string | null; avatar_url: string | null; email?: string }) => void;
  placeholder: string;
}) {
  const [q, setQ] = useState("");
  const search = useServerFn(searchUsers);
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["user-search", q],
    enabled: false,
    queryFn: () => search({ data: { query: q } }),
  });
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
        <Button onClick={() => q.trim() && refetch()} disabled={isFetching}>
          <Search className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {data?.results.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelect(u)}
            className="w-full text-start flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/40 transition"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={u.avatar_url ?? undefined} />
              <AvatarFallback>{u.display_name?.[0] ?? u.email?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display truncate">{u.display_name ?? u.email}</p>
              <p className="text-xs text-muted-foreground truncate">
                {u.username ? `@${u.username}` : ""} {u.email ? `· ${u.email}` : ""}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function UserManagement() {
  const { lang } = useLanguage();
  const { adminPerms } = useAuth();
  const qc = useQueryClient();
  const kick = useServerFn(kickUser);

  const kickMut = useMutation({
    mutationFn: (id: string) => kick({ data: { targetUserId: id } }),
    onSuccess: () => toast.success(lang === "ar" ? "تم الطرد" : "User kicked"),
    onError: (e: Error) => toast.error(e.message),
  });

  const grantVerifiedMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("badges").insert({ user_id: id, type: "verified" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم منح التوثيق" : "Verified granted");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [selected, setSelected] = useState<{ id: string; display_name: string | null; email?: string } | null>(null);

  return (
    <div className="space-y-4">
      <UserSearch
        placeholder={lang === "ar" ? "ابحث بالاسم أو الايميل" : "Search by name or email"}
        onSelect={(u) => setSelected({ id: u.id, display_name: u.display_name, email: u.email })}
      />
      {selected && (
        <div className="bg-card border border-primary/40 rounded-xl p-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm flex-1">{selected.display_name ?? selected.email}</span>
          {adminPerms?.can_grant_verified && (
            <Button size="sm" variant="outline" onClick={() => grantVerifiedMut.mutate(selected.id)}>
              <BadgeCheck className="w-4 h-4 me-1" /> {lang === "ar" ? "توثيق" : "Verify"}
            </Button>
          )}
          {adminPerms?.can_kick && (
            <Button size="sm" variant="destructive" onClick={() => kickMut.mutate(selected.id)}>
              <UserX className="w-4 h-4 me-1" /> {lang === "ar" ? "طرد" : "Kick"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Override children pattern: use an enhanced version
// (re-define with action buttons)
function AddAdminPanel() {
  const { lang } = useLanguage();
  const grant = useServerFn(grantAdmin);
  const [target, setTarget] = useState<{ id: string; display_name: string | null; email?: string } | null>(null);
  const [perms, setPerms] = useState({
    can_kick: false,
    can_delete_posts: false,
    can_grant_verified: false,
    can_review_reports: false,
    can_manage_categories: false,
  });

  const mut = useMutation({
    mutationFn: () => grant({ data: { targetUserId: target!.id, perms } }),
    onSuccess: () => {
      toast.success(lang === "ar" ? "تمت الإضافة" : "Admin added");
      setTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const PERMS: { key: keyof typeof perms; label_en: string; label_ar: string }[] = [
    { key: "can_kick", label_en: "Kick users", label_ar: "طرد المستخدمين" },
    { key: "can_delete_posts", label_en: "Delete posts", label_ar: "حذف المنشورات" },
    { key: "can_grant_verified", label_en: "Grant verified", label_ar: "منح التوثيق" },
    { key: "can_review_reports", label_en: "Review reports", label_ar: "مراجعة البلاغات" },
    { key: "can_manage_categories", label_en: "Manage categories", label_ar: "إدارة التصنيفات" },
  ];

  return (
    <div className="space-y-4">
      <UserSearch
        placeholder={lang === "ar" ? "ابحث عن مستخدم" : "Find a user"}
        onSelect={(u) => setTarget({ id: u.id, display_name: u.display_name, email: u.email })}
      />
      {target && (
        <div className="bg-card border border-primary/40 rounded-xl p-4 space-y-3">
          <p className="text-sm">
            {lang === "ar" ? "المستخدم المختار:" : "Selected:"}{" "}
            <span className="font-display">{target.display_name ?? target.email}</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PERMS.map((p) => (
              <Label key={p.key} className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer">
                <Checkbox
                  checked={perms[p.key]}
                  onCheckedChange={(v) => setPerms((s) => ({ ...s, [p.key]: Boolean(v) }))}
                />
                {lang === "ar" ? p.label_ar : p.label_en}
              </Label>
            ))}
          </div>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
            {lang === "ar" ? "منح صلاحية الأدمن" : "Grant Admin"}
          </Button>
        </div>
      )}
    </div>
  );
}

function CategoryManagement() {
  const { lang } = useLanguage();
  const qc = useQueryClient();
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");

  const { data } = useQuery({
    queryKey: ["categories-admin"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name_en");
      return data ?? [];
    },
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("categories")
        .insert({ name_en: nameEn.trim(), name_ar: nameAr.trim(), slug: slug.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setNameEn("");
      setNameAr("");
      setSlug("");
      qc.invalidateQueries({ queryKey: ["categories-admin"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success(lang === "ar" ? "تمت الإضافة" : "Added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories-admin"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Input placeholder="Name EN" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        <Input placeholder="الاسم بالعربي" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        <div className="flex gap-2">
          <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Button onClick={() => addMut.mutate()} disabled={addMut.isPending}>+</Button>
        </div>
      </div>
      <div className="space-y-2">
        {data?.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
            <span className="flex-1">{c.name_en} / {c.name_ar}</span>
            <code className="text-xs text-muted-foreground">{c.slug}</code>
            <Button size="icon" variant="ghost" onClick={() => delMut.mutate(c.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsPanel() {
  const { lang } = useLanguage();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reports")
        .select("id, post_id, reason, status, created_at")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const deletePostMut = useMutation({
    mutationFn: async (postId: string) => {
      await supabase.from("posts").delete().eq("id", postId);
    },
    onSuccess: () => {
      toast.success(lang === "ar" ? "حُذف المنشور" : "Post deleted");
      qc.invalidateQueries();
    },
  });

  const dismissMut = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("reports").update({ status: "dismissed" }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });

  return (
    <div className="space-y-2">
      {!data?.length && <p className="text-muted-foreground text-center py-8">{lang === "ar" ? "لا بلاغات" : "No reports"}</p>}
      {data?.map((r) => (
        <div key={r.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm">Post: <code>{r.post_id.slice(0, 8)}</code></p>
            <p className="text-xs text-muted-foreground truncate">{r.reason} · {r.status}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => dismissMut.mutate(r.id)}>
            {lang === "ar" ? "تجاهل" : "Dismiss"}
          </Button>
          <Button size="sm" variant="destructive" onClick={() => deletePostMut.mutate(r.post_id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
