import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function NewPostPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name_en, name_ar, slug").order("name_en");
      return data ?? [];
    },
  });

  const t =
    lang === "ar"
      ? {
          title: "منشور جديد",
          titleField: "العنوان",
          contentField: "المحتوى",
          category: "التصنيف",
          pickCategory: "اختر تصنيفاً",
          image: "صورة",
          uploadImage: "رفع صورة",
          submit: "نشر",
          submitting: "جارٍ النشر...",
          success: "تم نشر المنشور",
          fail: "فشل النشر",
          requireTitle: "أدخل العنوان",
          requireContent: "أدخل المحتوى",
        }
      : {
          title: "New Post",
          titleField: "Title",
          contentField: "Story / Content",
          category: "Category",
          pickCategory: "Pick a category",
          image: "Image",
          uploadImage: "Upload Image",
          submit: "Publish",
          submitting: "Publishing...",
          success: "Post published",
          fail: "Publish failed",
          requireTitle: "Title is required",
          requireContent: "Content is required",
        };

  function onPickImage(file: File) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) return toast.error(t.requireTitle);
    if (!content.trim()) return toast.error(t.requireContent);
    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("post-images")
          .upload(path, imageFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("post-images").getPublicUrl(path);
        imageUrl = pub.publicUrl;
      }
      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId || null,
        image_url: imageUrl,
      });
      if (error) throw error;
      toast.success(t.success);
      navigate({ to: "/user/dashboard" });
    } catch (err) {
      toast.error((err as Error).message ?? t.fail);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl mb-6 text-gradient-amber">{t.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-2xl p-6">
          <div className="space-y-1.5">
            <Label htmlFor="title">{t.titleField}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="font-display text-lg h-12"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t.category}</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder={t.pickCategory} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {lang === "ar" ? c.name_ar : c.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t.image}</Label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/60 transition">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="max-h-60 rounded-lg" />
              ) : (
                <span className="text-muted-foreground inline-flex items-center gap-2">
                  <ImagePlus className="w-5 h-5" /> {t.uploadImage}
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && onPickImage(e.target.files[0])}
              />
            </label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">{t.contentField}</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              maxLength={10000}
              className="resize-y leading-relaxed"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full h-11">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 me-2 animate-spin" /> {t.submitting}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 me-2" /> {t.submit}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
