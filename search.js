(function () {
  var SURAHS = ["الفاتحة", "البقرة", "آل_عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"].map(function (n) { return n.replace(/_/g, " "); });
  var SRC = [["azkar.js", "الأذكار", "./azkar.html", "bi-moon-stars-fill", "#7b86e0"], ["adiya.js", "الأدعية", "./adiya.html", "bi-chat-heart", "#e07a9a"], ["awrad.js", "الأوراد", "./awrad.html", "bi-book-half", "#e0a23a"]];
  function norm(s) {
    return (s || "").replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "").replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim();
  }
  var items = [], ready = 0;
  SURAHS.forEach(function (n, i) { items.push({ k: norm(n), t: "سورة " + n, s: "السورة رقم " + (i + 1), href: "./surah-reader.html?surah=" + (i + 1), ic: "bi-book-fill", c: "#2eb5a4", g: "القرآن" }); });
  [["الختمة الذكية خطة ختم القرآن", "khatma", "bi-flag-fill"], ["البحث في القرآن بالكلمة", "qsearch", "bi-search-heart"], ["متتبع العبادات سنن ضحى وتر قيام صيام", "ibadat", "bi-check2-square"], ["حاسبة الزكاة", "zakat", "bi-calculator-fill"], ["بدون إنترنت تحميل القرآن أوفلاين", "offline", "bi-cloud-arrow-down-fill"], ["الأربعون النووية رياض الصالحين حفظ الحديث", "hadith", "bi-journal-bookmark-fill"], ["التحدي اليومي أسئلة دينية", "challenge", "bi-patch-question-fill"], ["المظهر والألوان ثيم رمضان", "themes", "bi-palette-fill"]].forEach(function (p) { items.push({ k: norm(p[0]), t: p[0].split(" ").slice(0, 2).join(" "), s: "صفحة في التطبيق", href: "./" + p[1] + ".html", ic: p[2], c: "#d6ac52", g: "الأدوات" }); });
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
    if (!res.length) { out.innerHTML = '<p class="gs-empty">' + (ready < SRC.length ? "جاري التحميل..." : "ما في نتائج في الأقسام.") + "</p>"; return; }
    out.innerHTML = res.map(function (x) {
      var t = x.t.length > 140 ? x.t.slice(0, 140) + "…" : x.t;
      return '<a class="gs-r" style="--ac:' + x.c + '" href="' + x.href + '"><i class="bi ' + x.ic + '"></i><div><b>' + esc(t) + "</b><small>" + x.s + "</small></div></a>";
    }).join("");
  }
  // ---- آيات القرآن (من فهرس alquran.cloud، تحتاج إنترنت) ----
  var ayBox = document.createElement("div"); ayBox.id = "gs-ayat"; out.parentNode.insertBefore(ayBox, out.nextSibling);
  var ayTm = null, aySeq = 0, ayCache = {};
  function ayStrip(t) { return (t || "").replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "").replace(/\s+/g, " ").trim(); }
  function ayFetch(q) {
    return fetch("https://api.alquran.cloud/v1/search/" + encodeURIComponent(q) + "/all/quran-simple").then(function (r) { return r.json(); }).then(function (j) { return (j && j.data && j.data.matches) || []; }).catch(function () { return null; });
  }
  function ayatSearch(q) {
    var k = ayStrip(q); if (ayCache[k]) return Promise.resolve(ayCache[k]);
    return ayFetch(k).then(function (m) {
      if (m && m.length) return m;
      var n = k.replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي"); // محاولة ثانية بتوحيد الألف والياء
      return n !== k ? ayFetch(n) : m;
    }).then(function (m) { if (m === null) throw new Error("net"); ayCache[k] = m; return m; });
  }
  function ayRun() {
    clearTimeout(ayTm); var q = inp.value.trim();
    if (norm(q).length < 3) { ayBox.innerHTML = ""; aySeq++; return; }
    ayTm = setTimeout(function () {
      var my = ++aySeq; ayBox.innerHTML = '<p class="gs-empty">جارٍ البحث في آيات القرآن…</p>';
      ayatSearch(q).then(function (m) {
        if (my !== aySeq) return;
        if (!m.length) { ayBox.innerHTML = ""; return; }
        var surahs = {}; m.forEach(function (x) { surahs[x.surah.number] = 1; });
        ayBox.innerHTML = '<p class="gs-empty" style="text-align:right;margin:14px 4px 6px"><b>آيات من القرآن</b> — وردت في ' + m.length + " آية من " + Object.keys(surahs).length + " سورة</p>" +
          m.slice(0, 15).map(function (x) {
            var nm = String(x.surah.name || "").replace(/^سورة\s*/, ""), t = x.text.length > 160 ? x.text.slice(0, 160) + "…" : x.text;
            return '<a class="gs-r" style="--ac:#2eb5a4" href="./surah-reader.html?surah=' + x.surah.number + "&ayah=" + x.numberInSurah + '"><i class="bi bi-book-fill"></i><div><b>' + esc(t) + "</b><small>سورة " + esc(nm) + " — آية " + x.numberInSurah + "</small></div></a>";
          }).join("") + (m.length > 15 ? '<a class="gs-r" style="--ac:#2eb5a4" href="./qsearch.html"><i class="bi bi-search-heart"></i><div><b>عرض كل الآيات (' + m.length + ')</b><small>البحث في القرآن بالكلمة</small></div></a>' : "");
      }).catch(function () { if (my === aySeq) ayBox.innerHTML = '<p class="gs-empty">تعذّر البحث في الآيات الآن، تحقق من الإنترنت.</p>'; });
    }, 450);
  }
  inp.addEventListener("input", function () { run(); ayRun(); }); run(); ayRun();
  if (location.hash.length > 1) { inp.value = decodeURIComponent(location.hash.slice(1)); run(); ayRun(); }
})();
