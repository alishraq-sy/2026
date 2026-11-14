(function () {
  var K = "ix_khatma", TOTAL = 604, st = fxGet(K, null), sel = 30;
  var OPTS = [7, 10, 15, 20, 30, 60];
  function today() { return fxDay(); }
  function daysBetween(a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5); }
  function juz(p) { return Math.min(30, Math.floor(p / 20.13) + 1); }
  function save() { fxSet(K, st); }
  function dayInfo() {
    var t = today();
    if (!st.base || st.base.day !== t) { st.base = { day: t, page: st.page }; save(); }
    var elapsed = daysBetween(st.start, t), left = Math.max(1, st.days - elapsed);
    var per = Math.max(1, Math.ceil((TOTAL - st.base.page) / left));
    return { elapsed: elapsed, left: left, per: per, from: st.base.page + 1, to: Math.min(TOTAL, st.base.page + per) };
  }
  function render() {
    $("#kh-setup").style.display = st ? "none" : "";
    $("#kh-dash").style.display = st ? "" : "none";
    if (!st) {
      $("#kh-opts").innerHTML = OPTS.map(function (d) { return '<button type="button" class="fx-tab' + (d === sel ? " on" : "") + '" data-d="' + d + '">' + d + ' يوم</button>'; }).join("");
      return;
    }
    var i = dayInfo(), pct = Math.round(st.page / TOTAL * 100);
    $("#kh-bar").style.width = pct + "%";
    $("#kh-pg").textContent = st.page; $("#kh-left").textContent = i.left;
    var done = st.page >= i.to;
    if (st.page >= TOTAL) {
      $("#kh-today").textContent = "ما شاء الله، ختمتَ!"; $("#kh-today-sub").textContent = "تقبّل الله منك وبارك فيك";
      $("#kh-done").style.display = "none";
      if (!st.counted) { st.counted = 1; save(); fxSet("ix_khatma_done", (fxGet("ix_khatma_done", 0) || 0) + 1); }
    } else {
      $("#kh-today").textContent = "ص " + i.from + " ← ص " + i.to;
      $("#kh-today-sub").textContent = (i.to - i.from + 1) + " صفحة · الجزء " + juz(i.from) + (done ? " · أتممتَ وردك اليوم ✓" : "");
      $("#kh-done").style.display = done ? "none" : "";
    }
    var plannedByNow = Math.min(TOTAL, Math.round(TOTAL / st.days * (i.elapsed)));
    var lag = plannedByNow - st.page;
    $("#kh-note").textContent = lag > 15 ? "تأخّرت قرابة " + lag + " صفحة عن الخطة الأصلية، فأعدنا توزيع الباقي ليصير " + i.per + " صفحة يومياً." : (lag < -15 ? "أنت متقدّم على الخطة، بارك الله فيك." : "أنت ماشٍ على الخطة. المتوقّع " + i.per + " صفحة يومياً.");
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-d]"); if (b) { sel = +b.dataset.d; $("#kh-custom").value = ""; render(); }
  });
  $("#kh-start").onclick = function () {
    var c = parseInt($("#kh-custom").value, 10), d = c >= 3 && c <= 365 ? c : sel;
    st = { start: today(), days: d, page: 0, base: null }; save(); render();
  };
  $("#kh-done").onclick = function () { var i = dayInfo(); st.page = Math.max(st.page, i.to); save(); render(); fxToast("تقبّل الله"); };
  $("#kh-setb").onclick = function () { var v = parseInt($("#kh-set").value, 10); if (!(v >= 0 && v <= TOTAL)) return; st.page = v; st.counted = 0; save(); render(); $("#kh-set").value = ""; };
  $("#kh-reset").onclick = function () { if (confirm("إلغاء الخطة الحالية؟")) { st = null; try { localStorage.removeItem(K); } catch (e) {} render(); } };
  render();
})();
