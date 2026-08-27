# WordUp — haqiqiy online sayt

Bu loyiha:
- Browserda ishlaydi
- GitHub Pages orqali internetga chiqariladi
- Supabase Auth orqali login/ro‘yxatdan o‘tish
- Supabase Postgres orqali har bir foydalanuvchining o‘z so‘zlarini saqlaydi
- B1/B2/C1 kartochkalar
- Talaffuz
- Quiz
- Shaxsiy so‘zlar
- Progress

## 1. Supabase
Supabase'da yangi project yarating.
SQL Editor'ga `supabase.sql` faylini to‘liq qo‘ying va Run bosing.

Project Settings/API bo‘limidan:
- Project URL
- Publishable key (yoki anon key, agar dashboard shuni ko‘rsatsa)

ni oling.

`app.js` ichida:
SUPABASE_URL = "..."
SUPABASE_KEY = "..."

qatorlarini o‘zgartiring.

MUHIM: service_role/secret key'ni hech qachon browser kodiga qo‘ymang.

## 2. GitHub Pages
GitHub'da yangi repository yarating va `index.html`, `style.css`, `app.js` va `supabase.sql` fayllarini yuklang.
Settings → Pages → Deploy from branch → main → /root ni tanlang.
GitHub Pages saytni internetga chiqaradi.

## 3. Supabase URL sozlamalari
Supabase Auth URL Configuration bo‘limida GitHub Pages saytingiz URL'ini Site URL sifatida kiriting.
Agar email confirmation yoqilgan bo‘lsa, Redirect URLs'ga ham saytingiz URL'ini qo‘shing.

Natijada sayt:
https://USERNAME.github.io/REPOSITORY/

ko‘rinishidagi manzilda ochiladi.

## 4. Muhim
Bu saytning public frontend kodi ichida Supabase publishable/anon key bo‘lishi normal. Lekin service_role yoki boshqa secret key'ni qo‘ymang.
