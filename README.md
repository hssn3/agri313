# 🌱 SmartAgri Analyze

پلتفرم هوشمند تحلیل آماری طرح‌های آزمایشی کشاورزی — **مستقل از اینترنت، بدون نیاز به AI API**

## قابلیت‌ها

- **۵ طرح آزمایشی:** CRD، RCBD، LSD، فاکتوریل، کرت‌های خرد شده
- **ANOVA کامل** با جداول F دقیق (محاسبه عددی نه جدول ثابت)
- **مقایسه میانگین:** Duncan، Tukey HSD، LSD
- **آزمون نرمالیته** Shapiro-Wilk واقعی
- **همبستگی پیرسون** + **رگرسیون خطی**
- **Import** از CSV | **Export** به Excel و PDF
- **تفسیر فارسی** rule-based بدون AI
- **پنل ادمین** (stub برای توسعه آینده)

## اجرای محلی (Development)

```bash
# نصب dependencies
npm install

# اجرای همزمان frontend + backend
npm run dev:all
# یا جداگانه:
npm run dev          # Vite frontend → localhost:5173
npm run server:dev   # Express backend → localhost:3000
```

## Build برای Production

```bash
# Frontend build (Vite)
npm run build        # auto bump version + compile + build → dist/

# Server compile (فقط server، بدون engine)
npx tsc -p tsconfig.server.json  # → dist-server/

# اجرا
npm start            # مستقیم: node dist-server/server/index.js
```

## اجرا با PM2 (Windows Server)

```powershell
# نصب PM2
npm install -g pm2

# شروع سرویس
pm2 start ecosystem.config.cjs
pm2 save

# مانیتورینگ
pm2 status
pm2 logs smartagri
pm2 monit

# Restart بعد از تغییرات
pm2 restart smartagri
```

## Deploy روی Railway

1. پروژه را به GitHub push کنید
2. در Railway: **New Project → Deploy from GitHub**
3. Railway خودکار Dockerfile را detect می‌کند
4. متغیر `PORT=3000` را تنظیم کنید
5. آدرس تولید شده را باز کنید ✅

## Deploy روی Ubuntu Server

```bash
# نصب Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# clone و build
git clone <repo-url> /opt/smartagri
cd /opt/smartagri
npm install --production
npm run build
npx tsc -p tsconfig.server.json

# اجرا با PM2
npm install -g pm2
pm2 start dist-server/server/index.js --name smartagri
pm2 save && pm2 startup
```

## ساختار پروژه

```
src/
  engine/          # موتور محاسباتی (بدون وابستگی UI)
    distributions.ts  # F, t, q, Normal distributions
    statsEngine.ts    # ANOVA, post-hoc, correlation, regression
    interpreter.ts    # تفسیر rule-based فارسی
  components/      # React components
  pages/           # صفحات اصلی
  services/        # ارتباط با backend
  types/           # TypeScript types
server/
  index.ts         # Express server
  routes/          # API endpoints
  middleware/      # Auth middleware (stub)
```

## ویژگی‌های v1.1.0 🎉

- ✅ **پاکسازی داده‌های پیش‌فرض** — جداول با فیلدهای خالی شروع می‌شوند
- ✅ **تاریخچه پروژه‌ها** — ذخیره خودکار هر تحلیل در localStorage با جستجو و بازگشایی
- ✅ **دکمه تولید داده نمونه** — داده واقعی از Gomez&Gomez، Steel&Torrie، Cochran&Cox
- ✅ **نقشه راه امکانات** — جدول ۲۵ امکان آینده با فیلتر دسته/اولویت
- ✅ **Changelog خودکار** — هر build نسخه را بالا می‌برد

## نقشه راه آینده (۲۵ امکان)

برای مشاهده لیست کامل، در برنامه روی دکمه **🗺️ نقشه راه امکانات** کلیک کنید:

- **آماری پیشرفته:** تحلیل پایداری، آزمون‌های ناپارامتری، PCA، مدیریت داده گمشده
- **طرح‌های جدید:** Augmented، Alpha، Strip-Plot
- **نمودارها:** Interaction Plot، Error Bar با حروف گروه‌بندی، Q-Q Plot
- **گزارش:** Import XLSX مستقیم، خروجی Word، قالب APA/JAST
- **سیستم:** احراز هویت JWT، اشتراک و توکن، ذخیره Cloud، API عمومی
