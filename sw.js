const CACHE_NAME = 'ishraq-cache-v49';
const assetsToCache = [
  './',
  './index.html',
  './umrah-login.html',
  './umrah.html',
  './quran.html',
  './surah-reader.html',
  './tasbeeh.html',
  './qibla.html',
  './matwaf.html',
  './settings.html',
  'scan.html',
  './azkar.html',
  './awrad.html',
  './adiya.html',
  './favorites.html',
  './login.html',
  './css/style.css',
  './css/ishraq-ui.css',
  './css/ishraq-app.css',
  './js/core/ishraq-app.js',
  './css/ishraq-light.css',
  './css/ishraq-desktop.css',
  './js/core/ishraq-theme.js',
  './js/core/ishraq-extras.js',
  './js/umrah/umrah-ui.js',
  './calendar.html',
  './js/pages/calendar.js',
  './search.html',
  './js/pages/search.js',
  './js/core/ishraq-ui.js',
  './manifest.json',
  './js/umrah/admin.js',
  './js/core/main.js',
  './js/umrah/umrah.js',
  './js/core/prayer.js',
  './js/pages/qibla.js',
  './js/pages/quran.js',
  './js/pages/surah-reader.js',
  './js/pages/tasbeeh.js',
  './js/pages/matwaf.js',
  './js/pages/settings.js',
  './js/pages/azkar.js',
  './asma.html',
  './hadith.html',
  './khatma.html',
  './js/pages/khatma.js',
  './qsearch.html',
  './js/pages/qsearch.js',
  './ibadat.html',
  './js/pages/ibadat.js',
  './zakat.html',
  './js/pages/zakat.js',
  './challenge.html',
  './js/pages/challenge.js',
  './js/data/challenge-data.js',
  './js/pages/hadith.js',
  './themes.html',
  './js/pages/themes.js',
  './offline.html',
  './js/pages/offline.js',
  './js/core/ishraq-time.js',
  './css/ishraq-feat.css',
  './js/core/ishraq-feat.js',
  './js/core/ishraq-cert.js',
  './js/umrah/ishraq-ticket.js',
  './js/core/ishraq-push.js',
  './js/core/ishraq-guard.js',
  './ramadan.html',
  './js/pages/asma.js',
  './js/core/ishraq-share.js',
  './js/core/ishraq-today.js',
  './js/pages/awrad.js',
  './js/pages/adiya.js',
  './js/pages/favorites.js',
  './img/app-icon.png',
  './img/logo.png',
  './img/icon-192.png',
  './img/icon-512.png'
];

// تثبيت الكاش وتخزين الملفات
// نستخدم cache.add لكل ملف على حدة (بدل addAll) حتى لا يفشل التثبيت بالكامل
// في حال كان أحد الملفات (مثل صورة) غير موجود فعلياً على السيرفر
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        assetsToCache.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('تعذر تخزين الملف في الكاش (تحقق من وجوده على السيرفر):', url, err);
          })
        )
      );
    })
  );
});

// تفعيل الخدمة وحذف الكاش القديم إن وجد
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== 'ishraq-offline' && key !== 'ishraq-ext') {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// ===== إشعارات Firebase (رسائل data فقط: نحن نعرض الإشعار) =====
self.addEventListener('push', (event) => {
  let p = {}; try { p = event.data ? event.data.json() : {}; } catch (e) { try { p = { data: { title: 'إشراق', body: event.data.text() } }; } catch (_) {} }
  const d = p.data || p.notification || p || {};
  const title = d.title || 'إشراق', opts = { body: d.body || '', icon: './img/app-icon.png', badge: './img/app-icon.png', dir: 'rtl', lang: 'ar', tag: d.tag ? d.tag + '-' + Date.now() : undefined, renotify: !!d.tag, data: { url: d.url || './index.html' } };
  event.waitUntil(self.registration.showNotification(title, opts));
});
self.addEventListener('notificationclick', (event) => {
  const n = event.notification; n.close();
  const u = (n.data && n.data.url) || './index.html', abs = new URL(u, self.registration.scope).href;
  const msg = { type: 'ix-notif', title: n.title || 'إشراق', body: n.body || '', url: u };
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const c = list.find((x) => 'focus' in x);
    if (c) { c.postMessage(msg); return c.focus(); }  // التطبيق مفتوح: نعرض النافذة فوقه
    // مغلق: نفتح الصفحة المقصودة ونمرّر نص الإشعار لتعرضه في نافذة
    return self.clients.openWindow(abs + (abs.indexOf('?') < 0 ? '?' : '&') + 'ixn=' + encodeURIComponent(JSON.stringify({ t: msg.title, b: msg.body, u })));
  }));
});

// جلب الملفات: نجرب الشبكة أولاً دائماً (لضمان وصول أي تحديث فوراً)، ونرجع للكاش فقط عند انقطاع الإنترنت
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // لا نتدخل في: الطلبات غير GET (مثل تسجيل الدخول وإرسال البيانات)،
  // ولا في الطلبات الخارجية (Firebase وGoogle Apps Script وخطوط Google وغيرها)،
  // ولا في صفحات منصة المعتمر (مجلد umrah-platform) لأنها تدير نفسها.
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  // القرآن (alquran.cloud): الشبكة أولاً، وعند انقطاعها نقرأ من التنزيلات المحفوظة
  if (url.hostname === 'api.alquran.cloud') {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok && !url.pathname.includes('/search/')) { const c = res.clone(); caches.open('ishraq-offline').then((ch) => ch.put(req, c)); }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }
  // الخطوط والمكتبات الخارجية: نخزنها عند أول استعمال لتعمل بدون إنترنت
  if (['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'www.gstatic.com'].includes(url.hostname)) {
    event.respondWith(
      caches.open('ishraq-ext').then((ch) => ch.match(req).then((hit) => {
        const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) ch.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      }))
    );
    return;
  }
  if (url.origin !== self.location.origin || url.pathname.includes('/umrah-platform/')) return;

  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        // كل مرة ننجح فيها بجلب نسخة من الشبكة، نحدّث الكاش بها لتبقى نسخة الأوفلاين محدثة
        if (networkResponse && networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // ما في اتصال بالإنترنت: نرجع لآخر نسخة محفوظة بالكاش
        return caches.match(req);
      })
  );
});
