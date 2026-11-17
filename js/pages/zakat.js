(function () {
  var tab = "gold", G = 85, S = 595;
  function v(id) { return parseFloat($("#" + id).value) || 0; }
  function fmt(n) { return n.toLocaleString("en-US", { maximumFractionDigits: 2 }); }
  function calc() {
    var pg = v("zk-pg"), ps = v("zk-ps"), base = 0, nis = 0;
    if (tab === "mal") { base = v("zk-cash") + v("zk-trade") + v("zk-due") - v("zk-debt"); nis = $("#zk-nb").value === "gold" ? G * pg : S * ps; }
    else if (tab === "gold") { base = v("zk-gg") * pg; nis = G * pg; }
    else { base = v("zk-sg") * ps; nis = S * ps; }
    $("#zk-st").textContent = "المال الخاضع للزكاة: " + fmt(Math.max(0, base)) + " · النصاب: " + fmt(nis);
    if (!nis) { $("#zk-res").textContent = "—"; $("#zk-sub").textContent = "أدخل سعر الغرام لحساب النصاب."; return; }
    if (base >= nis) { $("#zk-res").textContent = fmt(base * 0.025); $("#zk-sub").textContent = "زكاتك الواجبة (2.5%) إن تمّ الحول الهجري"; }
    else { $("#zk-res").textContent = "0"; $("#zk-sub").textContent = "لم يبلغ مالك النصاب، فلا زكاة عليك حالياً."; }
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-t]"); if (!b) return; tab = b.dataset.t;
    $$("#zk-t .fx-tab").forEach(function (x) { x.classList.toggle("on", x === b); });
    ["mal", "gold", "silver"].forEach(function (t) { $("#zk-" + t).style.display = t === tab ? "" : "none"; }); calc();
  });
  document.addEventListener("input", calc); document.addEventListener("change", calc);
  var saved = fxGet("ix_zakat_p", null); if (saved) { $("#zk-pg").value = saved.g; $("#zk-ps").value = saved.s; }
  $("#zk-src").textContent = "أدخل سعر الغرام يدوياً أو انتظر الجلب الآلي...";
  Promise.all([fetch("https://api.gold-api.com/price/XAU").then(function (r) { return r.json(); }), fetch("https://api.gold-api.com/price/XAG").then(function (r) { return r.json(); })]).then(function (a) {
    if (!a[0].price || !a[1].price) throw 0;
    var g = +(a[0].price / 31.1035).toFixed(2), s = +(a[1].price / 31.1035).toFixed(2);
    if (!$("#zk-pg").value) $("#zk-pg").value = g;
    if (!$("#zk-ps").value) $("#zk-ps").value = s;
    $("#zk-src").textContent = "السعر العالمي الحالي بالدولار: ذهب " + g + " · فضة " + s + " للغرام. عدّلها لعملتك إن لزم."; calc();
  }).catch(function () { $("#zk-src").textContent = "تعذّر جلب الأسعار تلقائياً، فاكتبها يدوياً."; });
  window.addEventListener("pagehide", function () { fxSet("ix_zakat_p", { g: $("#zk-pg").value, s: $("#zk-ps").value }); });
  calc();
})();
