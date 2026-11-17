# Ishraq

## بنية الملفات

```
/                 صفحات HTML + sw.js + manifest.json (يجب أن تبقى بالجذر)
├─ css/           style, ishraq-ui, ishraq-app, ishraq-light, ishraq-feat, ishraq-desktop (لابتوب ≥992px)
├─ js/
│  ├─ core/       الأساس المشترك بين الصفحات (theme, ui, app, guard, push, prayer, auth…)
│  ├─ pages/      سكربت كل صفحة (quran, azkar, settings, tasbeeh…)
│  ├─ umrah/      بوابة العمرة والإدارة (umrah, umrah-ui, admin, sheikh, ishraq-ticket)
│  └─ data/       بيانات ثابتة (challenge-data)
└─ img/           الشعار (logo.png) والأيقونات والصور
```
