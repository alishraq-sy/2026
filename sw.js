const CACHE_NAME = 'ishraq-cache-v38';
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
  './style.css',
  './ishraq-ui.css',
  './ishraq-app.css',
  './ishraq-app.js',
  './ishraq-light.css',
  './ishraq-theme.js',
  './ishraq-extras.js',
  './umrah-ui.js',
  './calendar.html',
  './calendar.js',
  './search.html',
  './search.js',
  './ishraq-ui.js',
  './manifest.json',
  './admin.js',
  './main.js',
  './umrah.js',
  './prayer.js',
  './qibla.js',
  './quran.js',
  './surah-reader.js',
  './tasbeeh.js',
  './matwaf.js',
  './settings.js',
  './azkar.js',
  './asma.html',
  './hadith.html',
  './khatma.html',
  './khatma.js',
  './qsearch.html',
  './qsearch.js',
  './ibadat.html',
  './ibadat.js',
  './zakat.html',
  './zakat.js',
  './challenge.html',
  './challenge.js',
  './challenge-data.js',
  './hadith.js',
  './themes.html',
  './themes.js',
  './offline.html',
  './offline.js',
  './ishraq-time.js',
  './ishraq-feat.css',
  './ishraq-feat.js',
  './ishraq-cert.js',
  './ishraq-ticket.js',
  './ishraq-push.js',
  './ramadan.html',
  './asma.js',
  './ishraq-share.js',
  './ishraq-today.js',
  './awrad.js',
  './adiya.js',
  './favorites.js',
  './login.js',
  './firebase-config.js',
  './app-icon.png',
  './5b862b4281f64fd884b11984846f0e97.png'
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
  const title = d.title || 'إشراق', opts = { body: d.body || '', icon: './app-icon.png', badge: './app-icon.png', dir: 'rtl', lang: 'ar', tag: d.tag || undefined, data: { url: d.url || './index.html' } };
  event.waitUntil(self.registration.showNotification(title, opts));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || './index.html', self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) { if (c.url === url && 'focus' in c) return c.focus(); }
    return self.clients.openWindow(url);
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
  if (['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'].includes(url.hostname)) {
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
