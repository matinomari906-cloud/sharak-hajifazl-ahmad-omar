# راه‌اندازی پنل مدیریت سایت

سایت روی GitHub Pages به‌صورت ایستا میزبانی می‌شود؛ در نتیجه رمز یا کلید محرمانه نباید داخل فایل‌های سایت قرار بگیرد. پنل از Supabase برای ورود مدیر، ذخیرهٔ متن‌ها و نگهداری تصاویر استفاده می‌کند. فقط کلید عمومی `anon` در `supabase-config.js` قرار می‌گیرد و محدودیت دسترسی با RLS در خود Supabase اعمال می‌شود.

## ۱. ساخت پروژه و حساب مدیر

1. در [Supabase](https://supabase.com/) یک پروژه بسازید و رمز پایگاه‌داده را نزد خود نگه دارید.
2. در بخش **Authentication → Users**، یک کاربر مدیر با ایمیل و رمز عبور بسازید.
3. در بخش **Authentication → Providers → Email** ثبت‌نام عمومی (Sign ups) را خاموش کنید؛ مدیر را فقط از داشبورد Supabase اضافه کنید.
4. شناسهٔ UUID کاربر مدیر را از فهرست Users کپی کنید.

## ۲. ساخت جدول‌ها و سیاست‌های دسترسی

در **SQL Editor** پروژه، اسکریپت زیر را اجرا کنید و به‌جای `ADMIN_USER_UUID` شناسهٔ کاربر مدیر را وارد کنید:

```sql
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.site_admins enable row level security;

create policy "Admins can read their own membership"
  on public.site_admins for select to authenticated
  using (user_id = auth.uid());

insert into public.site_admins (user_id)
values ('ADMIN_USER_UUID')
on conflict (user_id) do nothing;

create table if not exists public.site_content (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb
);

alter table public.site_content enable row level security;

create policy "Anyone can read published site content"
  on public.site_content for select to anon, authenticated
  using (true);

create policy "Admins can insert site content"
  on public.site_content for insert to authenticated
  with check (
    exists (select 1 from public.site_admins where user_id = auth.uid())
  );

create policy "Admins can update site content"
  on public.site_content for update to authenticated
  using (
    exists (select 1 from public.site_admins where user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.site_admins where user_id = auth.uid())
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can upload site images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'site-images'
    and exists (select 1 from public.site_admins where user_id = auth.uid())
  );

create policy "Admins can update site images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'site-images'
    and exists (select 1 from public.site_admins where user_id = auth.uid())
  )
  with check (
    bucket_id = 'site-images'
    and exists (select 1 from public.site_admins where user_id = auth.uid())
  );
```

مخزن تصاویر عمومی است تا تصاویر در سایت دیده شوند، اما بارگذاری و تغییر آن‌ها فقط برای مدیر مجاز است. برای هر مدیر دیگری، ابتدا کاربر را در Supabase Auth بسازید و سپس UUID او را با دسترسی مدیریتی به `site_admins` اضافه کنید. هیچ‌گاه کلید `service_role` را در فایل‌های این سایت قرار ندهید.

## ۳. وصل‌کردن فایل‌های سایت به Supabase

1. از **Project Settings → API** کپی کنید:
   - نشانی پروژه، مانند `https://....supabase.co`
   - کلید عمومی `anon` (یا `publishable`)
2. این دو مقدار را در `supabase-config.js` تنظیم کنید:

```js
window.SUPABASE_CONFIG = {
  url: 'نشانی پروژه',
  anonKey: 'کلید عمومی پروژه'
};
```

کلید عمومی برای کد مرورگر است؛ امن‌بودن داده‌ها به سیاست‌های RLS بالا وابسته است. رمز مدیر و `service_role` را در این فایل ننویسید.

## ۴. انتشار و استفاده

فایل‌های پروژه را در مخزن GitHub Pages منتشر کنید. پنل در نشانی `https://نام‌کاربری.github.io/نام‌مخزن/admin.html` در دسترس خواهد بود. با ایمیل و رمز مدیر وارد شوید، متن‌ها را ویرایش یا تصویر JPG/PNG/WebP حداکثر ۵ مگابایت بارگذاری کنید و **ذخیرهٔ تغییرات** را بزنید. محتوای جدید برای بازدیدکنندگان سایت بارگذاری می‌شود؛ انتشار کد از پنل لازم نیست.
