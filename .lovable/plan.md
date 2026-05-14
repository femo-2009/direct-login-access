# خطة شاملة: 3 أوضاع (ضيف / مستخدم / أدمن)

قاعدة البيانات جاهزة بالفعل (profiles, posts, follows, likes, comments, reports, badges, admin_permissions, categories, notifications). الخطة تركّز على بناء الواجهات والربط.

## 1. الضيف (Guest)
- صفحة `/guest` للقراءة فقط: feed المنشورات + فتح منشور في مودال للقراءة الكاملة.
- إخفاء أزرار: إضافة منشور، إعجاب، تعليق، متابعة، إشعارات، بروفايل.
- زر دائم "سجّل الدخول لإضافة محتوى".

## 2. المستخدم (User) — `/user/dashboard`
**الشريط العلوي (TopBar موجود، نعدّله):** شعار + زر اللغة (EN افتراضي) + زر إضافة + زر إشعارات + زر إعدادات (Profile / Logout).

**الفيد الرئيسي:**
- بطاقة منشور حديثة: صورة الناشر (تفتح بروفايله) + الاسم + الشارات (verified/admin/level) + زر Follow + العنوان + مقتطف من القصة + الصورة + زرّ Love (قلب + صوت) + زر Comment (يفتح مودال + صوت عند الإرسال) + زر Report.
- الضغط على المنشور يفتح Modal بالقصة كاملة.

**صفحة إضافة منشور `/post/new`:** عنوان + رفع صورة (bucket `post-images`) + المحتوى + اختيار تصنيف من قائمة `categories`.

**صفحة البروفايل `/profile/$username`:**
- صورة بروفايل قابلة للرفع (bucket `avatars`) + الاسم + عدد المنشورات + المستوى المحسوب تلقائياً:
  - مبتدئ: 0–3، فضي: 4–7، ذهبي: 8–15، ماسي: 16+
- شارات (verified من الأدمن، شارة مستوى من النظام).
- عدد المتابِعين والمتابَعين (قابلة للفتح).
- شبكة منشورات المستخدم.

**الإشعارات `/notifications`:** قائمة من جدول `notifications` (متابعة جديدة + منشور جديد لمن تتابع). علامة قراءة. Realtime اشتراك. (الإشعارات خارج البرنامج/Web Push نتركها كمرحلة لاحقة لأنها تتطلب VAPID + Service Worker.)

**اللغة:** زر تبديل عربي/إنجليزي ثابت في كل الصفحات (LanguageContext موجود).

## 3. الأدمن (Admin) — `/admin/dashboard`
كل ميزات المستخدم + قائمة إعدادات إضافية:
- **المستخدمون:** بحث بالاسم/الـusername/الإيميل، طرد (حذف من auth)، منح شارة Verified.
- **إضافة أدمن:** بحث عن مستخدم → اختيار صلاحيات (kick / delete_posts / grant_verified / review_reports / manage_categories) → إدراج في `user_roles` + `admin_permissions`.
- **التصنيفات:** CRUD على `categories` (اسم عربي + إنجليزي + slug).
- **البلاغات:** قائمة `reports` مع إمكانية حذف المنشور أو رفض البلاغ.
- شارة أدمن مخصّصة تظهر بجانب اسمه في كل مكان.

## 4. تفاعلات المنشور
- Love: insert/delete في `likes` + تشغيل صوت قصير (`/assets/sounds/like.mp3`).
- Comment: insert في `comments` + صوت (`/assets/sounds/comment.mp3`) + عرض التعليقات.
- Report: insert في `reports` (يصل للأدمن تلقائياً عبر RLS).
- Follow: insert/delete في `follows` (الـtrigger الموجود `notify_on_follow` يصنع الإشعار).

## التفاصيل التقنية
- Storage: `avatars` و `post-images` موجودان (public). نضيف RLS upload policies إن لم تكن موجودة.
- Realtime: تفعيل `notifications` و `posts` في `supabase_realtime`.
- ملفات صوت: نضيف ملفين قصيرين في `public/assets/sounds/`.
- الشارات: مكوّن `<UserBadges>` يقرأ من `badges` + يحسب شارة المستوى من عدد المنشورات.
- الترجمة: نوسّع قواميس `EN/AR` في كل صفحة جديدة.

## ترتيب التنفيذ (تدريجي)
1. Storage policies + تفعيل Realtime + إضافة ملفات الصوت.
2. مكوّنات مشتركة: `PostCard`, `PostModal`, `UserBadges`, `LevelBadge`, `FollowButton`.
3. صفحة Feed داخل `UserDashboard` + صفحة `GuestPage` للقراءة فقط.
4. صفحة `/post/new` (إضافة منشور).
5. صفحة `/profile/$username` (مع رفع الأفاتار + المتابعون/المتابَعون).
6. صفحة `/notifications` + Realtime.
7. صفحة `/admin/dashboard` (المستخدمون، إضافة أدمن، التصنيفات، البلاغات).
8. ربط الأصوات وزر Follow و Like و Comment و Report.

## ملاحظات
- لن نتطرّق لإشعارات Push خارج المتصفح في هذه الخطة (تحتاج إعداد VAPID وService Worker — يمكن إضافتها لاحقاً عند الطلب).
- "الطرد" يعني حذف المستخدم من النظام عبر serverFn يستخدم `supabaseAdmin.auth.admin.deleteUser`.
- جميع التحقّقات الحسّاسة (طرد، حذف منشور، منح شارة) تجري عبر RLS الموجودة + serverFn محمي بـ`requireSupabaseAuth`.

هل أبدأ بالتنفيذ على هذا الترتيب؟ أو هل تريد تعديل الأولويات (مثلاً تأجيل لوحة الأدمن أو الإشعارات الخارجية)؟
