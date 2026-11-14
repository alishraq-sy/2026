(function () {
  var K = "ix_ibadat", data = fxGet(K, {}), cur = new Date(), view = new Date(cur.getFullYear(), cur.getMonth(), 1), selDay = fxDay();
  var ITEMS = [["sunan", "السنن الرواتب", "اثنتا عشرة ركعة في اليوم والليلة"], ["duha", "صلاة الضحى", "ركعتان فأكثر"], ["witr", "الوتر", "ختام صلاة الليل"], ["qiyam", "قيام الليل", "ولو ركعتين"], ["siyam", "الصيام", "تطوّع أو قضاء"], ["wird", "ورد القرآن", "تلاوة اليوم"], ["sadaqa", "صدقة", "ولو بالقليل"]];
  var MN = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"];
  var DN = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
  function cnt(k) { var d = data[k]; if (!d) return 0; return ITEMS.filter(function (i) { return d[i[0]]; }).length; }
  function lvl(n) { return n === 0 ? "" : n <= 1 ? "l1" : n <= 3 ? "l2" : n <= 5 ? "l3" : "l4"; }
  function grid() {
    $("#ib-month").textContent = MN[view.getMonth()] + " " + view.getFullYear();
    $("#ib-head").innerHTML = DN.map(function (d) { return "<span>" + d.slice(0, 2) + "</span>"; }).join("");
    var first = view.getDay(), n = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), h = "", t = fxDay();
    for (var i = 0; i < first; i++) h += '<div class="fx-hc e"></div>';
    for (var d = 1; d <= n; d++) {
      var k = fxDay(new Date(view.getFullYear(), view.getMonth(), d));
      h += '<button type="button" class="fx-hc ' + lvl(cnt(k)) + (k === t ? " td" : "") + (k === selDay ? " sel" : "") + '" data-k="' + k + '">' + d + "</button>";
    }
    $("#ib-grid").innerHTML = h;
    var tot = {}, days = 0; ITEMS.forEach(function (i) { tot[i[0]] = 0; });
    for (var d2 = 1; d2 <= n; d2++) { var kk = fxDay(new Date(view.getFullYear(), view.getMonth(), d2)); if (cnt(kk)) days++; ITEMS.forEach(function (i) { if (data[kk] && data[kk][i[0]]) tot[i[0]]++; }); }
    var best = 0, run = 0; for (var d3 = 1; d3 <= n; d3++) { if (cnt(fxDay(new Date(view.getFullYear(), view.getMonth(), d3)))) { run++; best = Math.max(best, run); } else run = 0; }
    $("#ib-stats").innerHTML = '<div class="fx-stat"><b>' + days + '</b><span>يوم فيه عبادة</span></div><div class="fx-stat"><b>' + best + '</b><span>أطول تتابع بالأيام</span></div>' +
      ITEMS.map(function (i) { return '<div class="fx-stat"><b>' + tot[i[0]] + '</b><span>' + i[1] + "</span></div>"; }).join("");
  }
  function list() {
    var dt = new Date(selDay + "T12:00:00"), hj = fxHijri(dt), dow = dt.getDay(), hint = [];
    $("#ib-day").textContent = (selDay === fxDay() ? "اليوم" : "يوم") + " · " + DN[dow] + " " + dt.getDate() + " " + MN[dt.getMonth()];
    if (dow === 1 || dow === 4) hint.push("يوم " + (dow === 1 ? "الاثنين" : "الخميس") + " — يُسنّ صيامه.");
    if (hj.d >= 13 && hj.d <= 15 && hj.m !== 12) hint.push("من الأيام البيض (13 و14 و15 من الشهر الهجري) — يُسنّ صيامها.");
    if (hj.m === 9) hint.push("شهر رمضان المبارك.");
    $("#ib-hint").textContent = hint.join(" ") || "اضغط على كل عبادة أتممتها.";
    var d = data[selDay] || {};
    $("#ib-list").innerHTML = ITEMS.map(function (i) { return '<button type="button" class="fx-chk' + (d[i[0]] ? " on" : "") + '" data-i="' + i[0] + '"><span class="bx"><i class="bi bi-check-lg"></i></span><span>' + i[1] + "<small>" + i[2] + "</small></span></button>"; }).join("");
  }
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-k]"); if (c) { selDay = c.dataset.k; grid(); list(); return; }
    var b = e.target.closest("[data-i]"); if (b) { var d = data[selDay] = data[selDay] || {}; d[b.dataset.i] = d[b.dataset.i] ? 0 : 1; if (!cnt(selDay)) delete data[selDay]; fxSet(K, data); grid(); list(); }
  });
  $("#ib-prev").onclick = function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); grid(); };
  $("#ib-next").onclick = function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); grid(); };
  grid(); list();
})();
