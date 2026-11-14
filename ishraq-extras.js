/* إشراق · ميزات الرئيسية: إنجازات اليوم + آية وحديث اليوم (كلها محلية) */
(function () {
  var host = document.getElementById("ix-extras");
  if (!host) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var today = new Date();
  var key = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var dayNum = Math.floor((today.getTime() - today.getTimezoneOffset() * 60000) / 86400000);

  /* ---------- الصلوات ---------- */
  var PR = [["fajr", "الفجر"], ["dhuhr", "الظهر"], ["asr", "العصر"], ["maghrib", "المغرب"], ["isha", "العشاء"]];
  var prayers = {};
  try { prayers = JSON.parse(ls.get("ix_prayers", "{}")) || {}; } catch (e) {}
  function done(d) { return (prayers[d] || []).length; }
  function streak() {
    var n = 0, d = new Date();
    if (done(fmt(d)) < 5) d.setDate(d.getDate() - 1); // اليوم لم يكتمل بعد: لا نكسر السلسلة
    while (done(fmt(d)) >= 5) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function fmt(d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function tasbeehToday() {
    try { var h = JSON.parse(ls.get("tasbeeh_history", "{}")) || {}; return h[today.toDateString()] || 0; } catch (e) { return 0; }
  }
  function goal() { return parseInt(ls.get("tasbeeh_daily_goal", "300")) || 300; }
  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 12); } catch (e) {} }

  /* ---------- تذكير الأذكار حسب الوقت ---------- */
  function azkarHint() {
    var h = today.getHours();
    if (ls.get("ix_azkar_dismiss_" + key, "") === "1") return "";
    if (h >= 4 && h < 11) return '<a class="x-hint" href="./azkar.html"><i class="bi bi-sunrise-fill"></i><span>حان وقت أذكار الصباح</span><b class="bi bi-chevron-left"></b></a>';
    if (h >= 15 && h < 20) return '<a class="x-hint" href="./azkar.html"><i class="bi bi-sunset-fill"></i><span>حان وقت أذكار المساء</span><b class="bi bi-chevron-left"></b></a>';
    return "";
  }

  var VERSES = [
    ["فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا", "الشرح 5-6"],
    ["أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", "الرعد 28"],
    ["فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", "البقرة 152"],
    ["وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", "الطلاق 3"],
    ["لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", "البقرة 286"],
    ["وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ", "آل عمران 139"],
    ["وَقُل رَّبِّ زِدْنِي عِلْمًا", "طه 114"]
  ];
  var HADITH = [
    ["إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى", "متفق عليه"],
    ["الدِّينُ النَّصِيحَةُ", "رواه مسلم"],
    ["لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", "متفق عليه"],
    ["مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", "متفق عليه"],
    ["تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", "رواه الترمذي"],
    ["خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", "رواه البخاري"],
    ["أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", "متفق عليه"],
    ["الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", "متفق عليه"],
    ["الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", "متفق عليه"]
  ];
  var v = VERSES[dayNum % VERSES.length], h = HADITH[dayNum % HADITH.length];

  function ring(p) {
    var c = 2 * Math.PI * 26, o = c * (1 - Math.min(1, p));
    return '<svg viewBox="0 0 64 64" class="x-ring"><circle cx="32" cy="32" r="26" fill="none" stroke="#ffffff14" stroke-width="7"/><circle cx="32" cy="32" r="26" fill="none" stroke="url(#xg)" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + o.toFixed(1) + '" transform="rotate(-90 32 32)"/></svg>';
  }

  function render() {
    var t = tasbeehToday(), g = goal(), dn = done(key), st = streak();
    var btns = PR.map(function (p) {
      var on = (prayers[key] || []).indexOf(p[0]) > -1;
      return '<button type="button" class="x-pr' + (on ? " on" : "") + '" data-p="' + p[0] + '" aria-pressed="' + on + '"><i class="bi ' + (on ? "bi-check-lg" : "bi-circle") + '"></i><span>' + p[1] + '</span></button>';
    }).join("");
    host.innerHTML =
      '<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="xg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ecd09a"/><stop offset="1" stop-color="#a97a33"/></linearGradient></defs></svg>' +
      '<h2 class="ix-h">إنجازات <span class="ol">اليوم</span></h2>' +
      azkarHint() +
      '<div class="x-card"><div class="x-stats">' +
        '<div class="x-st">' + ring(dn / 5) + '<b>' + dn + '/5</b><small>الصلوات</small></div>' +
        '<div class="x-st">' + ring(t / g) + '<b>' + Math.min(t, 999999) + '</b><small>تسبيح من ' + g + '</small></div>' +
      '</div><div class="x-prs">' + btns + '</div></div>' +
      '<div class="x-daily"><div class="x-d verse"><button type="button" class="x-cd" data-k="v" aria-label="بطاقة مشاركة"><i class="bi bi-image"></i></button><span class="tg">آية اليوم</span><p>' + v[0] + '</p><small>' + v[1] + '</small><button type="button" class="x-sh" data-t="' + (v[0] + " — " + v[1]).replace(/"/g, "&quot;") + '" aria-label="مشاركة"><i class="bi bi-share"></i></button></div>' +
      '<div class="x-d"><button type="button" class="x-cd" data-k="h" aria-label="بطاقة مشاركة"><i class="bi bi-image"></i></button><span class="tg">حديث اليوم</span><p>' + h[0] + '</p><small>' + h[1] + '</small><button type="button" class="x-sh" data-t="' + (h[0] + " — " + h[1]).replace(/"/g, "&quot;") + '" aria-label="مشاركة"><i class="bi bi-share"></i></button></div></div>';
  }
  render();

  host.addEventListener("click", function (e) {
    var b = e.target.closest(".x-pr");
    if (b) {
      var arr = prayers[key] || [], i = arr.indexOf(b.dataset.p);
      if (i > -1) arr.splice(i, 1); else arr.push(b.dataset.p);
      prayers[key] = arr;
      // نحتفظ بآخر 60 يوماً فقط
      var ks = Object.keys(prayers); if (ks.length > 60) delete prayers[ks[0]];
      ls.set("ix_prayers", JSON.stringify(prayers)); buzz(15); render(); return;
    }
    var cd = e.target.closest(".x-cd");
    if (cd && window.ixCard) { var q = cd.dataset.k === "v" ? v : h; window.ixCard.open({ text: q[0], ref: q[1], kind: cd.dataset.k === "v" ? "آية" : "حديث" }); return; }
    var s = e.target.closest(".x-sh");
    if (s) {
      var txt = s.dataset.t + "\n\nمن تطبيق إشراق";
      if (navigator.share) navigator.share({ text: txt }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { s.innerHTML = '<i class="bi bi-check2"></i>'; });
    }
  });
  // تحديث عدّاد التسبيح عند العودة للصفحة
  document.addEventListener("visibilitychange", function () { if (!document.hidden) render(); });
})();
