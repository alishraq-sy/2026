// --- مواقيت الصلاة لـ إشراق (سوريا · مكة · المدينة) --- //
// الإعدادات كلها من صفحة الإعدادات: المدينة، طريقة الحساب، العصر، وتعديل الدقائق لكل صلاة.

const DEFAULT_LAT = 33.5138; // دمشق إن تعذّر تحديد الموقع
const DEFAULT_LNG = 36.2765;
const IQAMA_OFFSET_MINUTES = 15;

// المدن المتاحة في الإعدادات (المفتاح محفوظ بـ eshraq_prayer_city)
const PRAYER_CITIES = {
  damascus: { n: 'دمشق، سوريا', lat: 33.5138, lng: 36.2765 },
  aleppo: { n: 'حلب، سوريا', lat: 36.2021, lng: 37.1343 },
  homs: { n: 'حمص، سوريا', lat: 34.7324, lng: 36.7137 },
  hama: { n: 'حماة، سوريا', lat: 35.1318, lng: 36.7578 },
  latakia: { n: 'اللاذقية، سوريا', lat: 35.5317, lng: 35.7915 },
  tartus: { n: 'طرطوس، سوريا', lat: 34.8890, lng: 35.8866 },
  idlib: { n: 'إدلب، سوريا', lat: 35.9306, lng: 36.6339 },
  raqqa: { n: 'الرقة، سوريا', lat: 35.9528, lng: 39.0079 },
  deir: { n: 'دير الزور، سوريا', lat: 35.3359, lng: 40.1408 },
  hasakah: { n: 'الحسكة، سوريا', lat: 36.5024, lng: 40.7477 },
  daraa: { n: 'درعا، سوريا', lat: 32.6189, lng: 36.1021 },
  suwayda: { n: 'السويداء، سوريا', lat: 32.7090, lng: 36.5663 },
  makkah: { n: 'مكة المكرمة، السعودية', lat: 21.4225, lng: 39.8262 },
  madinah: { n: 'المدينة المنورة، السعودية', lat: 24.4672, lng: 39.6111 }
};
const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

let prayerTimings = null;
let prayerTZ = null;      // المنطقة الزمنية لموقع المواقيت (قد تختلف عن توقيت الجهاز)
let prayerDay = '';       // اليوم الذي جُلبت له المواقيت
let countdownInterval = null;
let lastCoords = null;

// الوقت «الجداري» في منطقة المواقيت: يحمي من اختلاف توقيت الجهاز عن موقع الصلاة
function wallNow() {
  if (!prayerTZ) return new Date();
  try { return new Date(new Date().toLocaleString('en-US', { timeZone: prayerTZ })); } catch (e) { return new Date(); }
}

function prayerCfg() {
  const ls = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  let tune = {};
  try { tune = JSON.parse(ls('eshraq_prayer_tune', '{}')) || {}; } catch (e) {}
  return { city: ls('eshraq_prayer_city', 'auto'), method: ls('eshraq_prayer_method', 'auto'), school: ls('eshraq_prayer_school', '0'), tune };
}

// أم القرى للسعودية، ورابطة العالم الإسلامي لسوريا (يمكن تغييرها من الإعدادات)
function resolveMethod(cfg, lat, lng) {
  if (cfg.method !== 'auto') return cfg.method;
  return (lat < 32.2 && lng > 34 && lng < 56) ? '4' : '3';
}

document.addEventListener('DOMContentLoaded', () => {
  initPrayerSystem();
  const refreshBtn = document.getElementById('btn-refresh-location');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      document.getElementById('user-location').innerText = "جاري تحديث الموقع...";
      getUserLocation();
    });
  }
});

function initPrayerSystem() { getUserLocation(); }

function setLocName(t) { const el = document.getElementById('user-location'); if (el) el.innerText = t; }

// 1. الموقع: المدينة المختارة بالإعدادات، أو GPS عند الاختيار «تلقائي»
function getUserLocation() {
  const cfg = prayerCfg();
  const c = PRAYER_CITIES[cfg.city];
  if (c) { setLocName(c.n); fetchPrayerTimes(c.lat, c.lng); return; }
  if (!navigator.geolocation) { setLocName("دمشق، سوريا (افتراضي)"); fetchPrayerTimes(DEFAULT_LAT, DEFAULT_LNG); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => { fetchLocationName(pos.coords.latitude, pos.coords.longitude); fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude); },
    () => { setLocName("دمشق، سوريا (افتراضي)"); fetchPrayerTimes(DEFAULT_LAT, DEFAULT_LNG); },
    { timeout: 10000, maximumAge: 600000 }
  );
}

// 2. اسم المدينة التقريبي (للـ GPS فقط)
function fetchLocationName(lat, lng) {
  fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`)
    .then(res => res.json())
    .then(data => {
      const city = data.city || data.locality || data.principalSubdivision || "موقعك الحالي";
      setLocName(`${city}${data.countryName ? '، ' + data.countryName : ''}`);
    })
    .catch(() => setLocName("موقعك الحالي"));
}

// تنظيف نص الوقت («05:12 (EET)» → «05:12») وتطبيق تعديل الدقائق
function cleanTime(t) { const m = String(t || '').match(/(\d{1,2}):(\d{2})/); return m ? m[1].padStart(2, '0') + ':' + m[2] : ''; }
function shiftTime(t, min) {
  if (!t || !min) return t;
  const [h, m] = t.split(':').map(Number);
  const x = ((h * 60 + m + min) % 1440 + 1440) % 1440;
  return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0');
}
function buildTimings(raw, tune) {
  const out = {};
  PRAYER_KEYS.forEach(k => { out[k] = shiftTime(cleanTime(raw[k]), parseInt(tune[k]) || 0); });
  return out;
}

function showHijri(h) {
  try {
    document.getElementById('hijri-date').innerText = `${h.day} ${h.month.ar} ${h.year} هـ`;
    document.getElementById('gregorian-date').innerText = `${wallNow().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })} م`;
  } catch (e) {}
}

function applyTimings(raw, tz, hijri, stale) {
  const cfg = prayerCfg();
  prayerTZ = tz || null;
  prayerTimings = buildTimings(raw, cfg.tune);
  prayerDay = wallNow().toDateString();
  // نخزّن المواقيت (بعد التعديل) ليستخدمها فحص الإشعارات في باقي الصفحات
  try { localStorage.setItem('eshraq_prayer_timings_cache', JSON.stringify({ date: new Date().toDateString(), timings: prayerTimings })); } catch (e) {}
  if (hijri) showHijri(hijri);
  updatePrayerGridUI(prayerTimings);
  startCountdownLogic();
}

// 3. المواقيت من Aladhan مع تخزين محلي للعمل بدون إنترنت
function fetchPrayerTimes(lat, lng) {
  lastCoords = { lat, lng };
  const cfg = prayerCfg();
  const method = resolveMethod(cfg, lat, lng);
  const d = new Date(), dd = String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear();
  const key = `${lat.toFixed(2)},${lng.toFixed(2)},${method},${cfg.school}`;
  const url = `https://api.aladhan.com/v1/timings/${dd}?latitude=${lat}&longitude=${lng}&method=${method}&school=${cfg.school}`;

  fetch(url)
    .then(res => res.json())
    .then(response => {
      if (!response || !response.data) throw new Error('bad response');
      const raw = {}; PRAYER_KEYS.forEach(k => { raw[k] = cleanTime(response.data.timings[k]); });
      try { localStorage.setItem('eshraq_prayer_raw', JSON.stringify({ key, day: dd, raw, tz: response.data.meta && response.data.meta.timezone, hijri: response.data.date.hijri })); } catch (e) {}
      applyTimings(raw, response.data.meta && response.data.meta.timezone, response.data.date.hijri);
    })
    .catch(err => {
      console.error("خطأ في جلب مواقيت الصلاة:", err);
      // دون إنترنت: آخر مواقيت محفوظة لنفس الموقع والإعدادات (فرق الدقائق بين يوم وآخر بسيط)
      try {
        const c = JSON.parse(localStorage.getItem('eshraq_prayer_raw') || 'null');
        if (c && c.key === key) applyTimings(c.raw, c.tz, c.day === dd ? c.hijri : null, true);
      } catch (e) {}
    });
}

// 4. تحديث شبكة أوقات الصلوات (تنسيق 12 ساعة)
function updatePrayerGridUI(timings) {
  const map = {
    'Fajr': 'p-fajr',
    'Sunrise': 'p-sunrise',
    'Dhuhr': 'p-dhuhr',
    'Asr': 'p-asr',
    'Maghrib': 'p-maghrib',
    'Isha': 'p-isha'
  };

  for (let key in map) {
    const el = document.getElementById(map[key]);
    if (el && timings[key]) {
      const timeSpan = el.querySelector('.p-time');
      if (timeSpan) {
        timeSpan.innerText = format12Hour(timings[key]);
      }
    }
  }
}

// 5. منطق الحساب والعداد التنازلي للصلاة القادمة والإقامة
function startCountdownLogic() {
  if (countdownInterval) clearInterval(countdownInterval);

  updateCountdown(); // تشغيل فوري أول مرة
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  if (!prayerTimings) return;

  const now = wallNow();
  if (prayerDay && prayerDay !== now.toDateString() && lastCoords) { prayerDay = now.toDateString(); fetchPrayerTimes(lastCoords.lat, lastCoords.lng); }
  const list = [
    { name: 'صلاة الفجر', key: 'Fajr', id: 'p-fajr' },
    { name: 'الشروق', key: 'Sunrise', id: 'p-sunrise' },
    { name: 'صلاة الظهر', key: 'Dhuhr', id: 'p-dhuhr' },
    { name: 'صلاة العصر', key: 'Asr', id: 'p-asr' },
    { name: 'صلاة المغرب', key: 'Maghrib', id: 'p-maghrib' },
    { name: 'صلاة العشاء', key: 'Isha', id: 'p-isha' }
  ];

  // فحص كل صلاة (ما عدا الشروق) لإرسال إشعار عند حلول وقتها
  ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(key => {
    const item = list.find(p => p.key === key);
    checkPrayerTimeForNotification(item.name, prayerTimings[key]);
  });

  let nextPrayer = null;
  let nextPrayerDate = null;
  let activeId = '';

  for (let item of list) {
    const pDate = parsePrayerTime(prayerTimings[item.key]);
    if (pDate > now) {
      nextPrayer = item;
      nextPrayerDate = pDate;
      activeId = item.id;
      break;
    }
  }

  // إذا انتهت جميع صلوات اليوم -> الصلاة القادمة هي فجر الغد
  if (!nextPrayer) {
    nextPrayer = list[0];
    nextPrayerDate = parsePrayerTime(prayerTimings['Fajr']);
    nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
    activeId = list[0].id;
  }

  // تمييز الكارت النشط وإزالة التمييز عن البقية
  document.querySelectorAll('.p-item').forEach(el => el.classList.remove('active'));
  const activeCard = document.getElementById(activeId);
  if (activeCard) activeCard.classList.add('active');

  // تحديث بيانات الصلاة القادمة بصدر الصفحة
  document.getElementById('next-prayer-name').innerText = nextPrayer.name;
  document.getElementById('next-prayer-time').innerText = `موعد الأذان: ${format12Hour(prayerTimings[nextPrayer.key])}`;

  // حساب العداد التنازلي
  const diffMs = nextPrayerDate - now;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  document.getElementById('cd-hours').innerText = String(hours).padStart(2, '0');
  document.getElementById('cd-minutes').innerText = String(minutes).padStart(2, '0');
  document.getElementById('cd-seconds').innerText = String(seconds).padStart(2, '0');

  // فحص وقت الإقامة (إذا كانت الصلاة حانت قبل أقل من 15 دقيقة)
  checkIqamaTime(now);
}

// فحص منطق الإقامة
function checkIqamaTime(now) {
  const iqamaContainer = document.getElementById('iqama-container');
  const iqamaTimer = document.getElementById('iqama-timer');
  if (!iqamaContainer || !iqamaTimer) return;

  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  let isIqamaActive = false;

  for (let pKey of prayers) {
    const pDate = parsePrayerTime(prayerTimings[pKey]);
    const iqamaEndDate = new Date(pDate.getTime() + IQAMA_OFFSET_MINUTES * 60000);

    if (now >= pDate && now < iqamaEndDate) {
      isIqamaActive = true;
      const remMs = iqamaEndDate - now;
      const remMin = Math.floor(remMs / 60000);
      const remSec = Math.floor((remMs % 60000) / 1000);

      iqamaTimer.innerText = `${String(remMin).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
      break;
    }
  }

  if (isIqamaActive) {
    iqamaContainer.classList.remove('d-none');
  } else {
    iqamaContainer.classList.add('d-none');
  }
}

// أدوات مساعدة للأوقات
function parsePrayerTime(timeStr) {
  const [h, m] = timeStr.split(':');
  const d = wallNow();
  d.setHours(parseInt(h), parseInt(m), 0, 0);
  return d;
}

function format12Hour(timeStr) {
  const [h, m] = cleanTime(timeStr).split(':');
  let hours = parseInt(h);
  const ampm = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${m} ${ampm}`;
}
// التحقق من حالة تفعيل إشعارات الصلاة من الـ LocalStorage عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('prayerNotificationsToggle');
    if (toggleSwitch) {
        toggleSwitch.checked = localStorage.getItem('prayer_notifications_enabled') === 'true';
    }
});

// دالة إرسال الإشعار النظامي للمتصفح
// ملاحظة: نستخدم الدالة الموحّدة showAppNotification (من main.js) لأنها تمر عبر
// الـ Service Worker، وهذا ضروري لعمل الإشعارات على متصفحات الهاتف (أندرويد خصوصاً)
function showNotification(title, bodyText) {
    if (typeof showAppNotification === "function") {
        showAppNotification(title, {
            body: bodyText,
            icon: "./5b862b4281f64fd884b11984846f0e97.png"
        });
    } else if (Notification.permission === "granted") {
        // احتياطي فقط لو تعذر تحميل main.js لأي سبب
        try { new Notification(title, { body: bodyText }); } catch (e) {}
    }
}

// دالة المراقبة والمقارنة (تُستدعى مع كل تحديث للوقت بدقائق المواقيت)
let lastNotifiedMinute = "";

function checkPrayerTimeForNotification(prayerName, prayerTimeString) {
    const isEnabled = localStorage.getItem('prayer_notifications_enabled') === 'true';
    if (!isEnabled) return;

    const now = wallNow();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    // التأكد أن الوقت تطابق وأننا لم نرسل إشعاراً لهذه الصلاة في نفس الدقيقة
    if (prayerTimeString === currentTimeStr && lastNotifiedMinute !== currentTimeStr) {
        showNotification("حين وقت الصلاة 🕌", `حان الآن موعد أذان صلاة ${prayerName} حسب إحداثيات موقعك.`);
        lastNotifiedMinute = currentTimeStr;
    }
}