# 🔑 دسترسی به Railway برای Kiro Agent

## اطلاعات مورد نیاز

برای اینکه من (Kiro) بتوانم به Railway دسترسی داشته باشم و deploy را بررسی کنم، به اطلاعات زیر نیاز دارم:

---

## 1️⃣ Railway Project Token

### چگونه دریافت کنم؟

1. به Railway Dashboard بروید:
   ```
   https://railway.app
   ```

2. پروژه `agri313` را باز کنید

3. **Settings** → **Tokens** (یا **Service Tokens**)

4. **Generate Token** کلیک کنید:
   - Token Name: `kiro-agent`
   - Permissions: `Read` (فقط برای مشاهده)

5. Token را کپی کنید و به من بدهید:
   ```
   railway_token_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

⚠️ **توجه:** این token دسترسی به پروژه شما می‌دهد. فقط با `Read` permission ایجاد کنید.

---

## 2️⃣ Railway Project ID

### چگونه پیدا کنم؟

**روش 1: از URL**
```
https://railway.app/project/{PROJECT_ID}/service/{SERVICE_ID}
                           ^^^^^^^^^^^
```

**روش 2: از Settings**
1. Project Dashboard → **Settings**
2. قسمت **"Project ID"** را کپی کنید

**مثال:**
```
PROJECT_ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## 3️⃣ Service ID (اختیاری)

اگر چندین service دارید، Service ID لازم است:

**از URL:**
```
https://railway.app/project/{PROJECT_ID}/service/{SERVICE_ID}
                                                   ^^^^^^^^^^^
```

---

## 4️⃣ راه‌های جایگزین (بدون Token)

### روش 1: Public URL فقط

اگر نمی‌خواهید token بدهید، فقط **Public URL** را به من بدهید:

```
https://agri313-production-xxxx.up.railway.app
```

من فقط می‌توانم:
- ✅ Health endpoint را تست کنم
- ✅ صفحه اصلی را بررسی کنم
- ❌ Logs و metrics را نمی‌بینم

---

### روش 2: Screenshot

Deploy Logs و Status را screenshot بگیرید و به من نشان دهید.

---

## 🔒 امنیت

### Token Permissions

وقتی token ایجاد می‌کنید:
- ✅ **Read-only** انتخاب کنید
- ❌ **Write** ندهید (من نیازی به تغییر ندارم)

### Revoke Token

بعد از اینکه کارم تمام شد:
1. Railway Dashboard → **Settings** → **Tokens**
2. Token `kiro-agent` را **Revoke** کنید

---

## 📋 خلاصه اطلاعات مورد نیاز

لطفاً این اطلاعات را به من بدهید:

```
✅ Public URL: https://agri313-production-xxxx.up.railway.app
🔑 Railway Token: railway_token_XXXXXXXX... (اختیاری)
🆔 Project ID: a1b2c3d4-e5f6-... (اختیاری)
```

با این اطلاعات می‌توانم:
1. ✅ تست کنم که deploy موفق بوده
2. ✅ بررسی کنم همه endpoints کار می‌کنند
3. ✅ مشکلات احتمالی را شناسایی کنم

---

## ⚠️ توجه

اگر نمی‌خواهید token بدهید، **فقط Public URL** کافی است!
من می‌توانم تمام فیچرهای عمومی را تست کنم.
