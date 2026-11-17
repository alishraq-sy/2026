(function () {
  var LV = ["سهل", "متوسط", "صعب"], K = "ix_chal", S = fxGet(K, { days: {}, ok: 0, all: 0, perfect: 0 }), SEEN = "ix_chal_seen", SET = "ix_chal_set";
  var cur = [], i = 0, score = 0, daily = false, locked = false;
  function shuffle(a) { for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
  // يختار أسئلة لم تظهر للمستخدم بعد؛ وإذا نفدت أسئلة مستوى ما يبدأ دورة جديدة له فقط
  function pick(level, n) {
    var seen = fxGet(SEEN, {}), pool = [];
    CQ.forEach(function (q, k) { if (q[0] === level && !seen[k]) pool.push(k); });
    if (pool.length < n) { CQ.forEach(function (q, k) { if (q[0] === level) delete seen[k]; }); pool = []; CQ.forEach(function (q, k) { if (q[0] === level) pool.push(k); }); }
    var ch = shuffle(pool).slice(0, n); ch.forEach(function (k) { seen[k] = 1; }); fxSet(SEEN, seen); return ch;
  }
  function build(idxs) { return idxs.map(function (k) { var q = CQ[k], o = shuffle(q.slice(2)); return [q[0], q[1], o, o.indexOf(q[2])]; }); }
  function dailySet() {
    var s = fxGet(SET, null), t = fxDay();
    if (s && s.day === t) return s.idx;
    var idx = pick(0, 2).concat(pick(1, 2), pick(2, 1)); fxSet(SET, { day: t, idx: idx }); return idx;
  }
  function home() {
    $("#ch-home").style.display = ""; $("#ch-play").style.display = "none"; $("#ch-end").style.display = "none";
    var t = S.days[fxDay()];
    $("#ch-st").textContent = t ? "أنجزت تحدي اليوم" : "أسئلة اليوم";
    $("#ch-sc").textContent = t ? t.s + " / 5" : "5 أسئلة";
    $("#ch-go").innerHTML = t ? '<i class="bi bi-arrow-repeat"></i> تدرّب بأسئلة جديدة' : '<i class="bi bi-play-fill"></i> ابدأ تحدي اليوم';
    var seen = Object.keys(fxGet(SEEN, {})).length;
    $("#ch-stats").innerHTML = '<div class="fx-stat"><b>' + Object.keys(S.days).length + '</b><span>يوم شاركت فيه</span></div><div class="fx-stat"><b>' + S.ok + '</b><span>إجابة صحيحة</span></div><div class="fx-stat"><b>' + (S.all ? Math.round(S.ok / S.all * 100) : 0) + '%</b><span>نسبة الصواب</span></div><div class="fx-stat"><b>' + seen + ' / ' + CQ.length + '</b><span>سؤالاً مرّ عليك</span></div>';
  }
  function start(qs, isDaily) { cur = qs; i = 0; score = 0; daily = isDaily; $("#ch-home").style.display = "none"; $("#ch-end").style.display = "none"; $("#ch-play").style.display = ""; ask(); }
  function ask() {
    var q = cur[i]; locked = false;
    $("#ch-lv").textContent = LV[q[0]]; $("#ch-n").textContent = (i + 1) + " / " + cur.length; $("#ch-bar").style.width = (i / cur.length * 100) + "%";
    $("#ch-q").textContent = q[1]; $("#ch-next").style.display = "none";
    $("#ch-o").innerHTML = q[2].map(function (o, k) { return '<button type="button" class="fx-o" data-k="' + k + '">' + fxEsc(o) + "</button>"; }).join("");
  }
  function end() {
    $("#ch-play").style.display = "none"; $("#ch-end").style.display = "";
    $("#ch-res").textContent = score + " / " + cur.length;
    $("#ch-msg").textContent = score === cur.length ? "ما شاء الله! نتيجة كاملة" : score >= cur.length / 2 ? "أحسنت، واصل" : "لا بأس، التعلّم رحلة. جرّب مجدداً";
    if (daily && !S.days[fxDay()]) S.days[fxDay()] = { s: score };
    if (score === cur.length && cur.length >= 5) S.perfect++;
    fxSet(K, S);
  }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-k]");
    if (o && !locked) {
      locked = true; var q = cur[i], k = +o.dataset.k, ok = k === q[3];
      $$("#ch-o .fx-o").forEach(function (b, j) { if (j === q[3]) b.classList.add("ok"); else if (j === k) b.classList.add("no"); });
      S.all++; if (ok) { S.ok++; score++; } fxSet(K, S);
      $("#ch-next").style.display = ""; $("#ch-next").textContent = i === cur.length - 1 ? "عرض النتيجة" : "التالي"; return;
    }
    var l = e.target.closest("[data-l]"); if (l) start(build(pick(+l.dataset.l, 5)), false);
  });
  $("#ch-next").onclick = function () { if (i === cur.length - 1) end(); else { i++; ask(); } };
  $("#ch-go").onclick = function () {
    var done = !!S.days[fxDay()];
    start(done ? build(pick(1, 3).concat(pick(2, 2))) : build(dailySet()), !done);
  };
  $("#ch-back").onclick = home;
  $("#ch-share").onclick = function () { if (window.ixCard) ixCard.open({ text: "أجبت على " + score + " من " + cur.length + " أسئلة دينية في تحدي إشراق اليومي", ref: "تطبيق إشراق", kind: "تحدّي اليوم" }); };
  home();
})();
