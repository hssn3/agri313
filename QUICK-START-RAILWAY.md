# ⚡ راه‌اندازی سریع Railway — 5 دقیقه

## ✅ وضعیت فعلی

- ✅ **GitHub Repo:** https://github.com/hssn3/agri313.git (Private)
- ✅ **Branch:** main
- ✅ **Dockerfile:** بهینه و آماده
- ✅ **railway.toml:** پیکربندی شده
- ✅ **Health Endpoint:** `/api/health`

---

## 🚀 مراحل Deploy (5 دقیقه)

### 1️⃣ ورود به Railway

```
🔗 https://railway.app
```

**ورود با GitHub:**
- کلیک: "Login with GitHub"
- Authorize کنید

---

### 2️⃣ ایجاد New Project

1. **Dashboard** → کلیک: "New Project"

2. انتخاب: **"Deploy from GitHub repo"**

3. اولین بار:
   - "Configure GitHub App" کلیک کنید
   - "Only select repositories" → `hssn3/agri313` را انتخاب کنید
   - "Install & Authorize"

4. ریپو `hssn3/agri313` را انتخاب کنید

5. Railway شروع به build می‌کند ⏳

---

### 3️⃣ منتظر Build بمانید

**زمان:** 2-5 دقیقه

**مشاهده Progress:**
- Deployments → Build Logs
- منتظر پیام `Build Complete` باشید ✅

---

### 4️⃣ تنظیم Environment Variables

1. Service → **Variables** tab

2. کلیک: "Add Variable"

3. اضافه کنید:
   ```
   PORT = 3000
   NODE_ENV = production
   ```

4. Railway به صورت خودکار **Redeploy** می‌کند

---

### 5️⃣ دریافت Public URL

1. Service → **Settings** tab

2. قسمت "Networking" پیدا کنید

3. کلیک: **"Generate Domain"**

4. URL شما:
   ```
   https://agri313-production-XXXX.up.railway.app
   ```

5. این URL را کپی کنید ✅

---

## ✅ تست Deploy

### Health Check

باز کنید:
```
https://your-app.up.railway.app/api/health
```

**انتظار:**
```json
{
  "status": "ok",
  "version": "1.1.0",
  "timestamp": "2026-07-27..."
}
```

✅ اگر این response را دیدید، **deploy موفق بوده است!**

---

### صفحه اصلی

باز کنید:
```
https://your-app.up.railway.app
```

**باید ببینید:**
- 🌱 SmartAgri Analyze
- 5 کارت طرح آزمایشی
- دکمه "پروژه‌ها" و "نقشه راه"

---

## 📊 دادن دسترسی به Kiro

بعد از deploy موفق، من (Kiro) می‌توانم deployment را بررسی کنم.

**فقط Public URL لازم است:**

```
🔗 URL شما: https://agri313-production-XXXX.up.railway.app
```

این URL را به من بدهید تا:
- ✅ تست کنم همه endpoints کار می‌کنند
- ✅ بررسی کنم تمام فیچرها load می‌شوند
- ✅ مشکلات احتمالی را شناسایی کنم

**راهنمای کامل:** `RAILWAY-ACCESS.md`

---

## 🐛 مشکل دارید؟

### Build Failed

1. Deployments → **Build Logs** را بررسی کنید
2. خطا را بخوانید
3. راهنمای کامل: `RAILWAY-DEPLOY.md`

### Application Failed to Start

1. Deployments → **Deploy Logs** را بررسی کنید
2. بررسی کنید Variables تنظیم شده‌اند
3. Redeploy کنید

### صفحه 404

1. بررسی کنید build موفق بوده
2. Health endpoint را تست کنید
3. Logs را بررسی کنید

---

## 📚 مستندات کامل

- **راهنمای جامع:** `RAILWAY-DEPLOY.md`
- **راهنمای دسترسی:** `RAILWAY-ACCESS.md`
- **تست چک‌لیست:** `TEST-CHECKLIST.md`

---

## ✅ چک‌لیست

- [ ] به Railway.app login کردم
- [ ] Project جدید از GitHub ایجاد کردم
- [ ] Build موفق شد (Status: Success)
- [ ] Variables تنظیم شدند (PORT, NODE_ENV)
- [ ] Public Domain تولید شد
- [ ] Health endpoint کار می‌کند
- [ ] صفحه اصلی باز می‌شود
- [ ] URL را به Kiro دادم

---

**موفق باشید! 🚀**
