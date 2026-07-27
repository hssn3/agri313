# 🚂 راهنمای Deploy روی Railway — SmartAgri v1.1.0

## ✅ پیش‌نیازها

- ✅ کد روی GitHub: `https://github.com/hssn3/agri313.git`
- ✅ Dockerfile بهینه شده
- ✅ railway.toml آماده
- ✅ Health endpoint: `/api/health`

---

## 📍 مرحله 1: ایجاد حساب و ورود به Railway

1. به آدرس زیر بروید:
   ```
   https://railway.app
   ```

2. **Sign up / Login** کنید با یکی از روش‌ها:
   - GitHub (توصیه می‌شود)
   - Email

3. بعد از ورود، Dashboard باز می‌شود

---

## 📍 مرحله 2: ایجاد New Project

### روش 1: Deploy from GitHub (توصیه شده)

1. در Dashboard کلیک کنید: **"New Project"**

2. انتخاب کنید: **"Deploy from GitHub repo"**

3. اگر اولین بار است:
   - **"Configure GitHub App"** کلیک کنید
   - Railway دسترسی به GitHub می‌خواهد
   - انتخاب کنید: **"Only select repositories"**
   - ریپو را انتخاب کنید: `hssn3/agri313`
   - **Install & Authorize** کنید

4. بعد از authorization، ریپو `hssn3/agri313` را انتخاب کنید

5. Railway به صورت خودکار:
   - ✅ Dockerfile را detect می‌کند
   - ✅ Build را شروع می‌کند
   - ⏳ منتظر بمانید تا build تمام شود (2-5 دقیقه)

---

## 📍 مرحله 3: تنظیم Environment Variables

1. در صفحه Project، روی **service name** (احتمالاً `agri313`) کلیک کنید

2. تب **"Variables"** را باز کنید

3. **Add Variable** کلیک کنید و این متغیرها را اضافه کنید:

   ```bash
   PORT=3000
   NODE_ENV=production
   ```

   یا از UI:
   - Key: `PORT` → Value: `3000`
   - Key: `NODE_ENV` → Value: `production`

4. **Save** کنید

5. Railway به صورت خودکار **redeploy** می‌کند

---

## 📍 مرحله 4: فعال‌سازی Public Domain

1. در صفحه Service، تب **"Settings"** را باز کنید

2. قسمت **"Networking"** پیدا کنید

3. کلیک کنید: **"Generate Domain"**

4. Railway یک URL عمومی تولید می‌کند:
   ```
   https://agri313-production-xxxx.up.railway.app
   ```

5. این URL را کپی کنید ✅

---

## 📍 مرحله 5: تست Deploy

### بررسی Health Endpoint

باز کنید:
```
https://your-app.up.railway.app/api/health
```

باید response زیر را ببینید:
```json
{
  "status": "ok",
  "version": "1.1.0",
  "timestamp": "2026-07-27T..."
}
```

### بررسی صفحه اصلی

باز کنید:
```
https://your-app.up.railway.app
```

باید صفحه اصلی SmartAgri نمایش داده شود ✅

---

## 📍 مرحله 6: بررسی Logs

1. در صفحه Service، تب **"Deployments"** را باز کنید

2. روی آخرین deployment کلیک کنید

3. تب **"Build Logs"** و **"Deploy Logs"** را بررسی کنید

4. باید این پیام را ببینید:
   ```
   🌱 SmartAgri server running on port 3000
   ```

---

## 🔧 تنظیمات پیشرفته (اختیاری)

### تنظیم Custom Domain

1. تب **"Settings"** → **"Networking"**
2. کلیک: **"Custom Domain"**
3. دامنه خود را وارد کنید (مثلاً `smartagri.yourdomain.com`)
4. DNS records را طبق راهنمای Railway تنظیم کنید

### تنظیم Auto Deploy

Railway به صورت پیش‌فرض **auto-deploy** فعال است:
- هر `git push` به branch `main` → deploy خودکار

برای غیرفعال کردن:
1. Settings → **"Service"**
2. قسمت **"Source"** → **"Watch Paths"**
3. می‌توانید فقط برای فایل‌های خاص deploy کنید

### تنظیم Resource Limits

Railway رایگان:
- **$5 اعتبار ماهانه رایگان**
- **512 MB RAM**
- **1 GB Disk**
- **100 GB Bandwidth**

برای افزایش:
1. Settings → **"Resources"**
2. Upgrade به پلن **Hobby** یا **Pro**

---

## 🐛 Troubleshooting

### خطا: Build Failed

**بررسی Build Logs:**
```
Deployments → Build Logs
```

**رایج‌ترین مشکلات:**
1. **npm install failed** → `package.json` درست نیست
2. **vite build failed** → بررسی `tsconfig.app.json`
3. **tsc compile failed** → بررسی `tsconfig.server.json`

**راه‌حل:**
```bash
# Local test
npm install
npm run build
npx tsc -p tsconfig.server.json
```

اگر local کار کرد، GitHub push کنید و Railway دوباره build می‌کند.

---

### خطا: Application Failed to Start

**بررسی Deploy Logs:**
```
Deployments → Deploy Logs
```

**رایج‌ترین مشکلات:**
1. **Cannot find module** → dist یا dist-server build نشده
2. **Port already in use** → PORT env variable تنظیم نشده
3. **ENOENT index.html** → frontend build نشده

**راه‌حل:**
- Environment Variables → `PORT=3000` اضافه کنید
- Redeploy کنید

---

### صفحه سفید است (404)

**علت:** frontend (dist/) build نشده یا server آن را serve نمی‌کند

**راه‌حل:**
1. Dockerfile را بررسی کنید → `COPY --from=builder /app/dist ./dist`
2. server/index.ts → static files path درست است؟
   ```typescript
   const distPath = path.join(__dirname, '..', '..', 'dist');
   app.use(express.static(distPath));
   ```

---

### Health Check Failed

**علت:** `/api/health` response نمی‌دهد

**بررسی:**
```bash
curl https://your-app.up.railway.app/api/health
```

**راه‌حل:**
- server/index.ts → health endpoint وجود دارد؟
- Redeploy کنید

---

## 📊 Monitoring و Logs

### مانیتورینگ Real-time

Railway Dashboard:
1. **Metrics** → CPU، RAM، Network usage
2. **Logs** → Real-time logs
3. **Deployments** → تاریخچه deploys

### Export Logs

```bash
# نصب Railway CLI
npm install -g @railway/cli

# ورود
railway login

# انتخاب project
railway link

# مشاهده logs
railway logs
```

---

## 🔐 امنیت

### Environment Variables

**هرگز** secrets را در کد commit نکنید:
- ❌ API keys در کد
- ❌ Database passwords در کد
- ✅ همه را در Railway Variables تنظیم کنید

### Private Repository

GitHub repo شما **private** است ✅
- فقط شما دسترسی دارید
- Railway فقط با authorization دسترسی دارد

---

## 💰 هزینه‌ها

### Free Tier (فعلی)

- **$5 اعتبار ماهانه رایگان**
- برای SmartAgri کافی است (traffic کم)
- بعد از اتمام اعتبار، سرویس متوقف می‌شود

### نظارت بر مصرف

Dashboard → **Usage**
- مصرف فعلی را ببینید
- تخمین هزینه ماهانه

### Upgrade (در صورت نیاز)

**Hobby Plan:** $5/month
- 8 GB RAM
- 100 GB Disk
- Priority Support

---

## 🎯 خلاصه دستورات

```bash
# 1. Push به GitHub (انجام شده ✅)
git push origin main

# 2. Railway Dashboard
https://railway.app

# 3. Deploy
New Project → Deploy from GitHub → hssn3/agri313

# 4. Environment Variables
PORT=3000
NODE_ENV=production

# 5. Generate Domain
Settings → Networking → Generate Domain

# 6. تست
https://your-app.up.railway.app/api/health
```

---

## ✅ چک‌لیست نهایی

- [ ] GitHub repo accessible: `https://github.com/hssn3/agri313`
- [ ] Railway project created
- [ ] Build successful (Deployments → Status: Success)
- [ ] Environment variables set: `PORT`, `NODE_ENV`
- [ ] Public domain generated
- [ ] Health endpoint works: `/api/health` → `{"status":"ok"}`
- [ ] صفحه اصلی باز می‌شود
- [ ] تمام فیچرها کار می‌کنند (History، Sample Data، Roadmap)

---

## 📞 پشتیبانی

**مشکل دارید؟**
1. Railway Logs را بررسی کنید
2. این راهنما را مرور کنید
3. با تیم توسعه تماس بگیرید

**پروژه آماده است! 🚀**
