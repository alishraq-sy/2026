(function () {
  var inp = $("#qs-q"), info = $("#qs-info"), list = $("#qs-list"), more = $("#qs-more"), res = [], shown = 0, kw = "", tm = null;
  function strip(s) { return s.replace(/[ً-ٰٟۖ-ۭـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه"); }
  function hl(text) {
    var k = strip(kw).trim(), out = "", s = strip(text), i = 0, j;
    if (!k) return fxEsc(text);
    while ((j = s.indexOf(k, i)) > -1) { out += fxEsc(text.slice(i, j)) + '<mark class="fx-hl">' + fxEsc(text.slice(j, j + k.length)) + "</mark>"; i = j + k.length; }
    return out + fxEsc(text.slice(i));
  }
  function draw() {
    var part = res.slice(shown, shown + 25);
    list.insertAdjacentHTML("beforeend", part.map(function (m) {
      var ref = "سورة " + m.surah.name.replace(/^سورة\s*/, "") + " - آية " + m.numberInSurah;
      return '<div class="fx-item"><div class="fx-ar">' + hl(m.text) + '</div><div class="fx-row" style="margin-top:8px"><span class="fx-pill">' + fxEsc(ref) + '</span>' +
        '<a class="fx-btn o" style="flex:none;padding:6px 12px" href="./surah-reader.html?surah=' + m.surah.number + '&ayah=' + m.numberInSurah + '">افتح</a>' +
        '<button type="button" class="fx-btn o" style="flex:none;padding:6px 12px" data-ixcard data-kind="آية" data-ref="' + fxEsc(ref) + '" data-text="' + fxEsc(m.text) + '"><i class="bi bi-image"></i></button></div></div>';
    }).join(""));
    shown += part.length; more.style.display = shown < res.length ? "" : "none";
  }
  function run() {
    kw = inp.value.trim(); list.innerHTML = ""; res = []; shown = 0; more.style.display = "none";
    if (kw.length < 2) { info.textContent = "اكتب كلمتين على الأقل."; return; }
    info.textContent = "جارٍ البحث...";
    fetch("https://api.alquran.cloud/v1/search/" + encodeURIComponent(strip(kw)) + "/all/quran-simple").then(function (r) { return r.json(); }).then(function (j) {
      if (inp.value.trim() !== kw) return;
      res = (j && j.data && j.data.matches) || [];
      if (!res.length) { info.textContent = "لا توجد نتائج لهذه الكلمة."; return; }
      var surahs = {}; res.forEach(function (m) { surahs[m.surah.number] = 1; });
      info.textContent = "وردت في " + res.length + " آية من " + Object.keys(surahs).length + " سورة";
      fxSet("ix_stat_search", (fxGet("ix_stat_search", 0) || 0) + 1);
      draw();
    }).catch(function () { info.textContent = "تعذّر الاتصال. تحقق من الإنترنت وأعد المحاولة."; });
  }
  inp.addEventListener("input", function () { clearTimeout(tm); tm = setTimeout(run, 500); });
  inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { clearTimeout(tm); run(); } });
  more.onclick = draw;
})();
