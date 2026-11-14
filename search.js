(function () {
  var SURAHS = ["الفاتحة", "البقرة", "آل_عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"].map(function (n) { return n.replace(/_/g, " "); });
  var SRC = [["azkar.js", "الأذكار", "./azkar.html", "bi-moon-stars-fill", "#7b86e0"], ["adiya.js", "الأدعية", "./adiya.html", "bi-chat-heart", "#e07a9a"], ["awrad.js", "الأوراد", "./awrad.html", "bi-book-half", "#e0a23a"]];
  function norm(s) {
    return (s || "").replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "").replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim();
  }
  var items = [], ready = 0;
  SURAHS.forEach(function (n, i) { items.push({ k: norm(n), t: "سورة " + n, s: "السورة رقم " + (i + 1), href: "./surah-reader.html?surah=" + (i + 1), ic: "bi-book-fill", c: "#2eb5a4", g: "القرآن" }); });
  [["الختمة الذكية خطة ختم القرآن", "khatma", "bi-flag-fill"], ["البحث في القرآن بالكلمة", "qsearch", "bi-search-heart"], ["متتبع العبادات سنن ضحى وتر قيام صيام", "ibadat", "bi-check2-square"], ["حاسبة الزكاة", "zakat", "bi-calculator-fill"], ["الأربعون النووية رياض الصالحين حفظ", "nawawi", "bi-journal-bookmark-fill"], ["التحدي اليومي أسئلة دينية", "challenge", "bi-patch-question-fill"], ["أوسمتي إنجازات", "badges", "bi-trophy-fill"], ["المظهر والألوان ثيم رمضان", "themes", "bi-palette-fill"], ["تتبع المجموعة الموقع الحي", "live", "bi-broadcast"]].forEach(function (p) { items.push({ k: norm(p[0]), t: p[0].split(" ").slice(0, 2).join(" "), s: "صفحة في التطبيق", href: "./" + p[1] + ".html", ic: p[2], c: "#d6ac52", g: "الأدوات" }); });
  SRC.forEach(function (s) {
    fetch(s[0]).then(function (r) { return r.text(); }).then(function (txt) {
      var re = /text:\s*"((?:[^"\\]|\\.)*)"/g, m;
      while ((m = re.exec(txt))) { var t = m[1]; items.push({ k: norm(t).replace(/^بسم الله الرحمن الرحيم\.?\s*/, ""), t: t, s: s[1], href: s[2], ic: s[3], c: s[4], g: s[1] }); }
    }).catch(function () {}).then(function () { ready++; run(); });
  });
  fetch("asma.js").then(function (r) { return r.text(); }).then(function (txt) {
    var m = txt.match(/var N=(\[\[.*?\]\]);/s); if (!m) return;
    JSON.parse(m[1]).forEach(function (n, i) { items.push({ k: norm(n[0] + " " + n[1]), t: n[0], s: "من أسماء الله الحسنى — " + n[1], href: "./asma.html", ic: "bi-stars", c: "#d6ac52", g: "الأسماء" }); });
  }).catch(function () {});
  var inp = document.getElementById("gs-input"), out = document.getElementById("gs-out");
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function run() {
    var q = norm(inp.value);
    if (q.length < 2) { out.innerHTML = '<p class="gs-empty">اكتب كلمتين على الأقل للبحث.</p>'; return; }
    var res = items.filter(function (x) { return x.k.indexOf(q) > -1; }).slice(0, 40);
    if (!res.length) { out.innerHTML = '<p class="gs-empty">' + (ready < SRC.length ? "جاري التحميل..." : "ما في نتائج.") + "</p>"; return; }
    out.innerHTML = res.map(function (x) {
      var t = x.t.length > 140 ? x.t.slice(0, 140) + "…" : x.t;
      return '<a class="gs-r" style="--ac:' + x.c + '" href="' + x.href + '"><i class="bi ' + x.ic + '"></i><div><b>' + esc(t) + "</b><small>" + x.s + "</small></div></a>";
    }).join("");
  }
  inp.addEventListener("input", run); run();
  if (location.hash.length > 1) { inp.value = decodeURIComponent(location.hash.slice(1)); run(); }
})();
