# Special Home

موقع تعريفي لشركة عقارات — موقع ثابت (HTML / CSS / JavaScript) بدون أي إطار عمل أو خطوة بناء.

## الصفحات

| الصفحة | الملف |
| --- | --- |
| الرئيسية | `index.html` |
| من نحن | `about.html` |
| المشاريع | `projects.html` |
| تفاصيل المشروع | `project-details.html` |
| المدونة | `blog.html` |
| تواصل معنا | `contact.html` |

## الملفات

```
Special Home/
├── index.html
├── about.html
├── projects.html
├── project-details.html
├── blog.html
├── contact.html
├── style.css          # التنسيقات الرئيسية
├── script.js          # السكربتات والتفاعلات
└── assets/
    ├── icons/         # أيقونات SVG (الأيقونات حاليًا inline داخل الصفحات)
    └── images/        # الصور المحلية (الصور الحالية من Unsplash مؤقتة)
```

## التشغيل محليًا

افتح أي صفحة مباشرة في المتصفح، أو شغّل XAMPP وافتح:

```
http://localhost/Special\ Home/index.html
```

## ملاحظات تقنية

- المكتبات الخارجية مستخدمة عبر CDN: Swiper، AOS، Three.js، خطوط Google.
- الصور الحالية روابط Unsplash مؤقتة؛ استبدلها بصور محلية في `assets/images/` (يفضّل WebP مع `loading="lazy"`).
- الموقع متجاوب مع الشاشات المختلفة (Responsive).
