# 🚀 راهنمای Deploy — SmartAgri v1.1.0

## وضعیت فعلی

✅ **Frontend:** React + Vite — کامل و آماده  
✅ **Backend:** Express (فقط برای static files و Excel export)  
✅ **محاسبات:** 100% client-side در مرورگر (بدون نیاز به server-side analysis)  
✅ **تمام فیچرها:** History، Sample Data، Feature Roadmap، Changelog خودکار  

## محدودیت RAM سرور ویندوز

سرور فعلی فقط **0.38 GB** RAM آزاد دارد از **4 GB** کل.  
راه‌حل: سرور فقط برای static files، محاسبات در مرورگر کاربر.

---

## ✅ مراحل Deploy روی Windows Server (با PM2)

### 1️⃣ Compile Server (سبک — فقط server/)

```powershell
npx tsc -p tsconfig.server.json
```

این فقط `server/` را compile می‌کند (نه `src/engine`) → خروجی: `dist-server/`

### 2️⃣ بررسی PM2 Status

```powershell
pm2 status
pm2 logs smartagri --lines 50
```

### 3️⃣ Restart با Memory Limit

```powershell
# حذف instance قدیمی
pm2 delete smartagri

# شروع با ecosystem.config.cjs (max_memory_restart: 500M)
pm2 start ecosystem.config.cjs

# ذخیره برای autostart
pm2 save
```

### 4️⃣ مانیتورینگ

```powershell
pm2 monit              # نمایش real-time CPU/RAM
pm2 logs smartagri     # مشاهده لاگ‌ها
```

### 5️⃣ تست

باز کردن:
```
http://localhost:3000
```

---

## 🌐 Deploy روی Railway (توصیه شده)

### مزایا
- RAM آزاد بیشتر
- Deploy خودکار از Git
- HTTPS رایگان
- Scaling آسان

### مراحل

1. **Push به GitHub:**
   ```bash
   git add .
   git commit -m "v1.1.0 — SmartAgri کامل"
   git push origin main
   ```

2. **Railway Dashboard:**
   - New Project → Deploy from GitHub
   - انتخاب ریپو `smartagri-analyze`
   - Railway خودکار `Dockerfile` را detect می‌کند

3. **تنظیمات:**
   - Environment Variable: `PORT=3000`
   - Deploy شروع می‌شود

4. **تست:**
   - Railway یک URL عمومی می‌دهد: `https://smartagri-xxx.railway.app`

---

## 🐧 Deploy روی Ubuntu Server

### نصب Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

### Clone و Setup

```bash
# Clone پروژه
git clone https://github.com/your-username/smartagri-analyze.git /opt/smartagri
cd /opt/smartagri

# نصب dependencies
npm install --production

# Build frontend (اگر در git نیست)
npm run build

# Compile server
npx tsc -p tsconfig.server.json
```

### اجرا با PM2

```bash
# نصب PM2 global
npm install -g pm2

# شروع سرویس
pm2 start dist-server/server/index.js --name smartagri --max-memory-restart 300M

# ذخیره و autostart
pm2 save
pm2 startup  # دستور systemd تولید می‌کند، آن را copy/paste کنید
```

### نصب Nginx (Reverse Proxy)

```bash
sudo apt install nginx

# ساخت config
sudo nano /etc/nginx/sites-available/smartagri
```

**محتوا:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# فعال‌سازی
sudo ln -s /etc/nginx/sites-available/smartagri /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL با Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📦 Build Local (برای تست)

```powershell
# Frontend
npm run build

# Server
npx tsc -p tsconfig.server.json

# تست local
npm start
# → http://localhost:3000
```

---

## 🧪 تست کامل

### چک‌لیست

- [ ] صفحه اصلی باز می‌شود
- [ ] انتخاب هر ۵ طرح
- [ ] دکمه "تولید داده نمونه" کار می‌کند
- [ ] تحلیل ANOVA اجرا می‌شود
- [ ] مقایسه میانگین Duncan/Tukey/LSD
- [ ] نمودارها render می‌شوند
- [ ] Export Excel
- [ ] گزارش PDF (print)
- [ ] History ذخیره و بازگشایی
- [ ] Feature Roadmap باز می‌شود

---

## 🐛 Troubleshooting

### خطا: "Zone Allocation failed"

**علت:** RAM کافی نیست  
**راه‌حل:**
1. `pm2 delete smartagri`
2. `pm2 start ecosystem.config.cjs` (max_memory_restart: 500M)
3. مرورگر cache را پاک کنید

### سرور start نمی‌شود

```powershell
# بررسی لاگ
pm2 logs smartagri --lines 100

# بررسی port
netstat -ano | findstr :3000

# اگر port اشغال است
taskkill /PID <PID> /F
```

### Frontend سفید است

1. `dist/` وجود دارد؟
2. `index.html` در root هست؟
3. Console مرورگر چه می‌گوید؟

---

## 📊 نسخه‌ها

**فعلی:** v1.1.0  
**آینده:** v1.2.0 (احراز هویت JWT + Cloud storage)

برای changelog کامل: `CHANGELOG.md`
