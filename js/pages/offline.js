(function () {
  var CACHE = "ishraq-offline", KEY = "ix_offline_quran", dl = $("#of-dl"), rm = $("#of-rm"), bar = $("#of-bar"), st = $("#of-st"), busy = false;
  function status() {
    var t = fxGet(KEY, null);
    st.textContent = t ? "تم تحميل القرآن كاملاً بتاريخ " + new Date(t).toLocaleDateString("ar") + " ✓" : "لم يُحمَّل بعد.";
    bar.style.width = t ? "100%" : "0%"; rm.style.display = t ? "" : "none"; dl.textContent = ""; dl.innerHTML = t ? '<i class="bi bi-arrow-repeat"></i> تحديث التنزيل' : '<i class="bi bi-cloud-arrow-down-fill"></i> تحميل القرآن للاستخدام بدون إنترنت';
  }
  if (!("caches" in window)) { dl.disabled = true; st.textContent = "متصفحك لا يدعم التخزين بدون إنترنت."; }
  caches.keys().then(function (ks) { var n = 0; return Promise.all(ks.filter(function (k) { return k.indexOf("ishraq-cache") === 0; }).map(function (k) { return caches.open(k).then(function (c) { return c.keys(); }).then(function (r) { n += r.length; }); })).then(function () { $("#of-core").textContent = n > 5 ? "جاهز: " + n + " ملفاً محفوظاً على جهازك" : "افتح الصفحات الرئيسية مرة واحدة وهو متصل ليحفظها."; }); });
  if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (e) { $("#of-quota").textContent = Math.round((e.quota - e.usage) / 1048576) + " ميغابايت"; });
  dl.onclick = function () {
    if (busy) return; busy = true; dl.disabled = true;
    caches.open(CACHE).then(function (c) {
      var urls = ["https://api.alquran.cloud/v1/surah"]; for (var i = 1; i <= 114; i++) urls.push("https://api.alquran.cloud/v1/surah/" + i);
      var done = 0, fail = 0, idx = 0;
      function worker() {
        if (idx >= urls.length) return Promise.resolve();
        var u = urls[idx++];
        return fetch(u).then(function (r) { if (!r.ok) throw 0; return c.put(u, r); }).catch(function () { fail++; }).then(function () { done++; bar.style.width = Math.round(done / urls.length * 100) + "%"; st.textContent = "جارٍ التحميل... " + done + " / " + urls.length; return worker(); });
      }
      return Promise.all([worker(), worker(), worker(), worker()]).then(function () {
        if (fail) { st.textContent = "تعذّر تحميل " + fail + " ملفاً. تأكد من الاتصال وأعد المحاولة."; } else { fxSet(KEY, Date.now()); status(); fxToast("اكتمل التحميل"); }
      });
    }).catch(function () { st.textContent = "تعذّر التخزين."; }).then(function () { busy = false; dl.disabled = false; });
  };
  rm.onclick = function () { ixAsk("حذف نصوص القرآن المحمّلة؟", { danger: 1, ok: "حذف" }).then(function (ok) { if (ok) caches.delete(CACHE).then(function () { try { localStorage.removeItem(KEY); } catch (e) {} status(); }); }); };
  status();
})();
