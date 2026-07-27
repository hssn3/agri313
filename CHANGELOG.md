# CHANGELOG — SmartAgri Analyze

## [1.1.0] — 2026-07-27 (۶ مرداد ۱۴۰۵)

### ویژگی‌های جدید 🎉
- **تاریخچه پروژه‌ها:** ذخیره خودکار هر تحلیل با نام، تاریخ، نوع طرح در localStorage
- **جستجو و مدیریت:** لیست پروژه‌های قبلی با جستجو، بازگشایی، مشاهده، و حذف
- **داده نمونه:** دکمه "تولید داده نمونه" برای هر ۵ طرح — داده‌های واقعی از:
  - Gomez & Gomez (Statistical Procedures for Agricultural Research)
  - Steel & Torrie (Principles and Procedures of Statistics)
  - Cochran & Cox (Experimental Designs)
- **نقشه راه امکانات:** جدول تعاملی ۲۵ امکان آینده با دسته‌بندی و فیلتر اولویت
- **Changelog خودکار:** سیستم bump version — هر `npm run build` نسخه را بالا می‌برد

### بهبودها 🔧
- پاکسازی مقادیر پیش‌فرض — DataEntryForm با فیلدهای خالی شروع می‌شود
- پیام‌های validation بهتر در فرم ورود داده
- نمایش تعداد پروژه‌های ذخیره‌شده در navbar
- طراحی modal نقشه راه با فیلتر دسته/اولویت
- دکمه شناور نقشه راه در پایین صفحه

### توسعه 👨‍💻
- `scripts/bump-version.mjs` برای مدیریت خودکار نسخه
- `DEPLOY.md` — راهنمای کامل deploy روی Windows/Railway/Ubuntu
- بهینه‌سازی tsconfig.server.json — فقط `server/` compile می‌شود
- ecosystem.config.cjs با memory limit 500M



## [1.0.0] — 2026-07-27 (۵ مرداد ۱۴۰۵)
- راه‌اندازی اولیه پروژه SmartAgri Analyze
- پشتیبانی از ۵ طرح آزمایشی: CRD، RCBD، LSD، فاکتوریل، کرت‌های خرد شده
- موتور ANOVA کامل با جداول F عددی دقیق (Incomplete Beta Function)
- مقایسه میانگین Duncan، Tukey HSD، LSD با compact letter display
- آزمون نرمالیته Shapiro-Wilk واقعی (Royston 1992)
- ماتریس همبستگی پیرسون و رگرسیون خطی
- تفسیر فارسی rule-based بدون AI
- Export به Excel و گزارش PDF قابل چاپ
- نمونه Excel برای هر طرح قابل دانلود
- Express backend با پنل ادمین stub
- Deploy آماده روی Railway و Ubuntu (Dockerfile + railway.toml)
- PM2 autostart روی Windows Server
