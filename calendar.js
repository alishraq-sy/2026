(function () {
  var MN = ["محرّم","صفر","ربيع الأول","ربيع الآخر","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوّال","ذو القعدة","ذو الحجة"];
  var DOW = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
  var F = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "numeric", year: "numeric" });
  var G = new Intl.DateTimeFormat("ar", { month: "long", year: "numeric" });
  var ADJ = "ix_hijri_adj";
  function adj() { try { var v = parseInt(localStorage.getItem(ADJ), 10); return isNaN(v) ? 0 : Math.max(-3, Math.min(3, v)); } catch (e) { return 0; } }
  function H(d) { var o = {}; F.formatToParts(new Date(d.getTime() + adj() * 864e5)).forEach(function (p) { if (p.type !== "literal") o[p.type] = parseInt(p.value, 10); }); return { y: o.year, m: o.month, d: o.day }; }
  function noon(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12); }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  var EV = [[1,1,"رأس السنة الهجرية"],[10,1,"يوم عاشوراء"],[12,3,"المولد النبوي"],[27,7,"الإسراء والمعراج"],[15,8,"ليلة النصف من شعبان"],[1,9,"أول رمضان"],[27,9,"ليلة السابع والعشرين من رمضان"],[1,10,"عيد الفطر"],[9,12,"يوم عرفة"],[10,12,"عيد الأضحى"]];

  var today = noon(new Date()), th = H(today);
  var view = { y: th.y, m: th.m };

  function firstOf(y, m) {   // أول يوم ميلادي يقابل 1 من الشهر الهجري
    var g = addDays(today, Math.round((((y - th.y) * 12 + (m - th.m)) * 29.53) - th.d + 1));
    for (var i = 0; i < 60; i++) {
      var h = H(g);
      if (h.y === y && h.m === m && h.d === 1) return g;
      var diff = ((h.y - y) * 12 + (h.m - m)) * 30 + (h.d - 1);
      g = addDays(g, diff > 0 ? -Math.max(1, Math.min(diff, 5)) : Math.max(1, Math.min(-diff, 5)));
    }
    return g;
  }
  var MODE_K = "ix_cal_mode", mode = "h"; try { mode = localStorage.getItem(MODE_K) === "g" ? "g" : "h"; } catch (e) {}
  var gv = { y: today.getFullYear(), m: today.getMonth() };           // العرض الميلادي (m: 0-11)
  var GM = new Intl.DateTimeFormat("ar-u-ca-gregory-nu-latn", { month: "long", year: "numeric" });
  function renderG() {   // تقويم ميلادي صِرف: بلا مناسبات ولا تواريخ هجرية
    var first = new Date(gv.y, gv.m, 1, 12), n = new Date(gv.y, gv.m + 1, 0).getDate(), lead = (first.getDay() + 1) % 7, html = "", i;
    document.getElementById("cal-month").textContent = GM.format(first);
    document.getElementById("cal-greg").textContent = "التقويم الميلادي";
    for (i = 0; i < lead; i++) html += "<span></span>";
    for (i = 1; i <= n; i++) {
      var c = new Date(gv.y, gv.m, i, 12), isT = c.getTime() === today.getTime();
      html += '<div class="cd' + (isT ? " today" : "") + (c.getDay() === 5 ? " fri" : "") + '"><b>' + i + "</b></div>";
    }
    document.getElementById("cal-days").innerHTML = html;
  }
  function applyMode() {
    var g = mode === "g", q = function (s) { return document.querySelector(s); };
    q("#cal-mh").classList.toggle("on", !g); q("#cal-mg").classList.toggle("on", g);
    document.getElementById("cal-ttl").textContent = g ? "الميلادي" : "الهجري";
    [".cal-adj", "#cal-evh", "#cal-events", ".cal-note"].forEach(function (s) { var e = q(s); if (e) e.style.display = g ? "none" : ""; });
    render();
  }
  function setMode(m) { mode = m; try { localStorage.setItem(MODE_K, m); } catch (e) {} applyMode(); }
  function render() {
    if (mode === "g") return renderG();
    var f = firstOf(view.y, view.m), cells = [], d = f;
    while (H(d).m === view.m && cells.length < 31) { cells.push(d); d = addDays(d, 1); }
    document.getElementById("cal-month").textContent = MN[view.m - 1] + " " + view.y;
    document.getElementById("cal-greg").textContent = G.format(cells[0]) + " – " + G.format(cells[cells.length - 1]);
    var lead = (cells[0].getDay() + 1) % 7, html = "";
    for (var i = 0; i < lead; i++) html += "<span></span>";
    cells.forEach(function (c) {
      var h = H(c), isT = c.getTime() === today.getTime(), ev = EV.some(function (e) { return e[0] === h.d && e[1] === h.m; });
      html += '<div class="cd' + (isT ? " today" : "") + (c.getDay() === 5 ? " fri" : "") + '"><b>' + h.d + "</b><small>" + c.getDate() + "</small>" + (ev ? '<i class="dot"></i>' : "") + "</div>";
    });
    document.getElementById("cal-days").innerHTML = html;
  }
  document.getElementById("cal-dow").innerHTML = DOW.map(function (n) { return "<em>" + n.slice(0, 3) + "</em>"; }).join("");
  document.getElementById("cal-next").onclick = function () { if (mode === "g") { gv.m++; if (gv.m > 11) { gv.m = 0; gv.y++; } return render(); } view.m++; if (view.m > 12) { view.m = 1; view.y++; } render(); };
  document.getElementById("cal-prev").onclick = function () { if (mode === "g") { gv.m--; if (gv.m < 0) { gv.m = 11; gv.y--; } return render(); } view.m--; if (view.m < 1) { view.m = 12; view.y--; } render(); };
  document.getElementById("cal-mh").onclick = function () { setMode("h"); };
  document.getElementById("cal-mg").onclick = function () { setMode("g"); };
  function showAdj() {
    var v = adj(), el = document.getElementById("cal-adj-val");
    if (el) el.textContent = (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v);
  }
  function setAdj(n) {
    n = Math.max(-3, Math.min(3, n));
    try { localStorage.setItem(ADJ, String(n)); } catch (e) {}
    th = H(today); view = { y: th.y, m: th.m }; showAdj(); render();
  }
  document.getElementById("cal-adj-plus").onclick = function () { setAdj(adj() + 1); };
  document.getElementById("cal-adj-minus").onclick = function () { setAdj(adj() - 1); };
  showAdj();
  document.getElementById("cal-today").onclick = function () { view = { y: th.y, m: th.m }; gv = { y: today.getFullYear(), m: today.getMonth() }; render(); };
  applyMode();

  // المناسبات القادمة: نمشي يوماً بيوم حتى 400 يوم
  var found = {}, i, g, h;
  for (i = 0; i < 400; i++) {
    g = addDays(today, i); h = H(g);
    EV.forEach(function (e, k) { if (!found[k] && e[0] === h.d && e[1] === h.m) found[k] = { n: i, g: g, t: e[2], h: h }; });
  }
  var list = Object.keys(found).map(function (k) { return found[k]; }).sort(function (a, b) { return a.n - b.n; }).slice(0, 6);
  var GD = new Intl.DateTimeFormat("ar", { weekday: "long", day: "numeric", month: "long" });
  document.getElementById("cal-events").innerHTML = list.map(function (e) {
    return '<div class="ev-row"><div><b>' + e.t + "</b><small>" + e.h.d + " " + MN[e.h.m - 1] + " · " + GD.format(e.g) + '</small></div><span>' + (e.n === 0 ? "اليوم" : "بعد " + e.n + " يوم") + "</span></div>";
  }).join("");
})();
