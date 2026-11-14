(function () {
  var ib = fxGet("ix_ibadat", {}), ch = fxGet("ix_chal", { days: {}, ok: 0, perfect: 0 }), mem = fxGet("ix_nawawi_mem", { n40: [], riyad: [] }), kh = fxGet("ix_khatma", null);
  var days = Object.keys(ib).filter(function (k) { return Object.keys(ib[k]).length; }).sort();
  function total(item) { return days.filter(function (k) { return ib[k][item]; }).length; }
  function streak() { // أطول تتابع أيام
    var best = 0, run = 0, prev = null;
    days.forEach(function (k) { var t = new Date(k + "T12:00:00").getTime(); run = prev && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1; prev = t; best = Math.max(best, run); });
    return best;
  }
  var B = [
    ["bi-flag-fill", "بداية الطريق", "سجّل أول يوم عبادة في المتتبع", days.length, 1],
    ["bi-calendar-check", "ثبات أسبوع", "سبعة أيام متتالية من العبادة", streak(), 7],
    ["bi-calendar-heart", "ثبات شهر", "ثلاثون يوماً متتالية", streak(), 30],
    ["bi-moon-stars-fill", "قائم الليل", "10 أيام قيام ليل", total("qiyam"), 10],
    ["bi-brightness-high-fill", "صاحب الضحى", "10 أيام من صلاة الضحى", total("duha"), 10],
    ["bi-droplet-half", "الصائم", "10 أيام صيام تطوّع", total("siyam"), 10],
    ["bi-heart-fill", "المتصدّق", "10 أيام صدقة", total("sadaqa"), 10],
    ["bi-book-fill", "صاحب الورد", "20 يوماً من ورد القرآن", total("wird"), 20],
    ["bi-trophy-fill", "ختم القرآن", "أتمّ ختمة من خطة الختمة الذكية", fxGet("ix_khatma_done", 0), 1],
    ["bi-bookmark-star-fill", "الحافظ", "احفظ 5 أحاديث", (mem.n40 || []).length + (mem.riyad || []).length, 5],
    ["bi-mortarboard-fill", "حافظ الأربعين", "احفظ الأربعين النووية كلها", (mem.n40 || []).length, 40],
    ["bi-search", "الباحث", "ابحث في القرآن 10 مرات", fxGet("ix_stat_search", 0), 10],
    ["bi-patch-question-fill", "المجتهد", "أجب 50 إجابة صحيحة بالتحدي اليومي", ch.ok || 0, 50],
    ["bi-stars", "النتيجة الكاملة", "حقّق 5/5 بالتحدي اليومي", ch.perfect || 0, 1]
  ];
  var got = B.filter(function (b) { return b[3] >= b[4]; }).length;
  $("#bd-n").textContent = got + " / " + B.length;
  $("#bd-grid").innerHTML = B.map(function (b, i) { var on = b[3] >= b[4]; return '<button type="button" class="fx-b' + (on ? " on" : "") + '" data-i="' + i + '"><i class="bi ' + b[0] + '"></i><b>' + b[1] + "</b><small>" + Math.min(b[3], b[4]) + " / " + b[4] + "</small></button>"; }).join("");
  var cur = 0;
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-i]"); if (t) {
      cur = +t.dataset.i; var b = B[cur], on = b[3] >= b[4];
      $("#bd-i").innerHTML = '<i class="bi ' + b[0] + '" style="color:' + (on ? "var(--a)" : "var(--m)") + '"></i>'; $("#bd-t").textContent = b[1]; $("#bd-d").textContent = b[2];
      $("#bd-b").style.width = Math.min(100, b[3] / b[4] * 100) + "%"; $("#bd-p").textContent = on ? "مبارك، حصلت على هذا الوسام" : "تقدّمك: " + b[3] + " من " + b[4];
      $("#bd-sh").style.display = on ? "" : "none"; $("#bd-sheet").classList.add("on"); return;
    }
    if (e.target.id === "bd-sheet") $("#bd-sheet").classList.remove("on");
  });
  $("#bd-x").onclick = function () { $("#bd-sheet").classList.remove("on"); };
  $("#bd-sh").onclick = function () { var b = B[cur]; $("#bd-sheet").classList.remove("on"); if (window.ixCard) ixCard.open({ text: b[1] + " — " + b[2], ref: "تطبيق إشراق", kind: "وسام" }); };
})();
