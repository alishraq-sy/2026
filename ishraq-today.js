/* إشراق · الرئيسية: عدّاد رمضان + اسم اليوم من أسماء الله الحسنى */
(function () {
  "use strict";
  var AR = "٠١٢٣٤٥٦٧٨٩";
  function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[d]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function adj() { try { var v = parseInt(localStorage.getItem("ix_hijri_adj"), 10); return isNaN(v) ? 0 : v; } catch (e) { return 0; } }
  var F; try { F = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }); } catch (e) { F = null; }
  function H(d) {
    if (!F) return null;
    var o = {}; F.formatToParts(new Date(d.getTime() + adj() * 864e5)).forEach(function (p) { o[p.type] = parseInt(p.value, 10); });
    return { y: o.year, m: o.month, d: o.day };
  }
  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function wall() { try { if (typeof wallNow === "function") return wallNow(); } catch (e) {} return new Date(); }
  function timings() {
    try { var c = JSON.parse(localStorage.getItem("eshraq_prayer_timings_cache") || "null"); return c && c.timings ? c.timings : null; } catch (e) { return null; }
  }
  function at(base, hhmm) { if (!hhmm) return null; var p = String(hhmm).split(":"); var d = new Date(base.getTime()); d.setHours(+p[0], +p[1], 0, 0); return d; }
  function hms(ms) {
    if (ms < 0) ms = 0; var s = Math.floor(ms / 1000);
    return pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s % 3600 / 60)) + ":" + pad(s % 60);
  }

  /* ---------- رمضان ---------- */
  var rh = document.getElementById("ix-ramadan");
  function ramadanInfo() {
    var t = midnight(new Date()), h = H(t); if (!h) return null;
    if (h.m === 9) {
      var s = t, k = 0; while (k++ < 32) { var p = addDays(s, -1), hp = H(p); if (hp && hp.m === 9) s = p; else break; }
      var e = t; k = 0; while (k++ < 32) { var n = addDays(e, 1), hn = H(n); if (hn && hn.m === 9) e = n; else break; }
      return { during: true, day: h.d, len: H(e).d, year: h.y, start: s };
    }
    for (var i = 1; i <= 400; i++) {
      var d = addDays(t, i), hh = H(d);
      if (hh && hh.m === 9 && hh.d === 1) return { during: false, days: i, year: hh.y, start: d };
    }
    return null;
  }
  var info = null, tick = null;
  function crescent() { return '<svg class="rm-moon" viewBox="0 0 64 64" aria-hidden="true"><path d="M44 8a26 26 0 1 0 12 46A22 22 0 0 1 44 8Z" fill="currentColor"/><path d="M50 14l1.6 4.2 4.4.2-3.5 2.8 1.2 4.3-3.7-2.5-3.7 2.5 1.2-4.3-3.5-2.8 4.4-.2z" fill="currentColor" opacity=".9"/></svg>'; }
  function renderRamadan() {
    if (!rh) return; info = ramadanInfo(); if (!info) { rh.style.display = "none"; return; }
    var h = "";
    if (info.during) {
      var pct = Math.round(info.day / info.len * 100), late = info.day >= 20;
      h = '<div class="rm-card during">' + crescent() +
        '<div class="rm-hd"><small>رمضان ' + ar(info.year) + ' هـ</small><b>اليوم ' + ar(info.day) + ' من ' + ar(info.len) + '</b></div>' +
        '<div class="rm-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="rm-nx"><span id="rm-lbl">—</span><strong id="rm-cd" dir="ltr">--:--:--</strong></div>' +
        '<div class="rm-two"><div><small>السحور / الإمساك</small><b id="rm-f">--:--</b></div><div><small>الإفطار</small><b id="rm-m">--:--</b></div></div>' +
        (late ? '<p class="rm-tip"><i class="bi bi-stars"></i> العشر الأواخر — تحرَّ ليلة القدر في الليالي الوترية</p>' : '') + '</div>';
    } else {
      var dt; try { dt = info.start.toLocaleDateString("ar", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { dt = ""; }
      h = '<div class="rm-card">' + crescent() +
        '<div class="rm-hd"><small>يفصلنا عن رمضان ' + ar(info.year) + ' هـ</small></div>' +
        '<div class="rm-big"><b>' + ar(info.days) + '</b><span>' + (info.days === 1 ? "يوم" : info.days === 2 ? "يومان" : info.days <= 10 ? "أيام" : "يوماً") + '</span></div>' +
        '<p class="rm-tip">الموعد المتوقع: ' + dt + ' <small>(بحسب تقويم أم القرى، وقد يختلف يوماً برؤية الهلال)</small></p>' +
        (info.days <= 30 ? '<p class="rm-tip"><i class="bi bi-heart"></i> اللهم بلّغنا رمضان</p>' : '') + '</div>';
    }
    rh.innerHTML = h; rh.style.display = "";
    clearInterval(tick); if (info.during) { tickRamadan(); tick = setInterval(tickRamadan, 1000); }
  }
  function tickRamadan() {
    var T = timings(), now = wall(), f = T && at(now, T.Fajr), m = T && at(now, T.Maghrib);
    var $f = document.getElementById("rm-f"), $m = document.getElementById("rm-m"), $l = document.getElementById("rm-lbl"), $c = document.getElementById("rm-cd");
    if (!$c) return;
    if (!f || !m) { $l.textContent = "افتح التطبيق مرة لتحميل المواقيت"; $c.textContent = "--:--:--"; return; }
    $f.textContent = T.Fajr; $m.textContent = T.Maghrib;
    if (now < f) { $l.textContent = "يبدأ الصيام (الفجر) بعد"; $c.textContent = hms(f - now); }
    else if (now < m) { $l.textContent = "الإفطار بعد"; $c.textContent = hms(m - now); }
    else { var f2 = new Date(f.getTime() + 864e5); $l.textContent = "السحور / الفجر بعد"; $c.textContent = hms(f2 - now); }
  }

  /* ---------- اسم اليوم ---------- */
  var ah = document.getElementById("ix-asma");
  function renderAsma() {
    if (!ah || !window.IX_ASMA) { if (ah) ah.style.display = "none"; return; }
    var d = new Date(), dn = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5), n = window.IX_ASMA[dn % 99];
    ah.innerHTML = '<a class="as-today" href="./asma.html"><span class="as-k"><i class="bi bi-stars"></i> اسم اليوم من أسماء الله الحسنى</span><b>' + n[0] + '</b><small>' + n[1] + '</small></a>';
  }
  renderRamadan(); renderAsma();
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { renderRamadan(); } });
})();

/* إحصاءات كروت الرئيسية: العبادات والتحدي */
(function () {
  function g(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function day() { var d = new Date(), m = d.getMonth() + 1, x = d.getDate(); return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (x < 10 ? "0" : "") + x; }
  var t = day(), custom = g("ix_ibadat_items", []), total = 7 + custom.length, rec = g("ix_ibadat", {})[t] || {}, n = Object.keys(rec).filter(function (k) { return rec[k]; }).length;
  var e1 = document.getElementById("hx-ib-t"), b = document.getElementById("hx-ib-bar");
  if (e1) { e1.textContent = n ? "أتممت " + n + " من " + total + " عبادات اليوم" : "ابدأ يومك بأول عبادة"; if (b) b.style.width = Math.min(100, n / total * 100) + "%"; }
  var c = g("ix_chal", { days: {} }), e2 = document.getElementById("hx-ch-t");
  if (e2) e2.textContent = c.days && c.days[t] ? "نتيجتك اليوم " + c.days[t].s + " / 5 — تدرّب أكثر" : "أسئلة اليوم بانتظارك";
})();
