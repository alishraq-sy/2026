/* إشراق · صفحة المعتمر: إجراءات سريعة + مناسك وتجهيزات (يعتمد على متغيرات umrah.js: me, role) */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var qa = $("quickActs"), rb = $("ritesBox");
  if (!qa || !rb) return;

  var STAGES = ["الإحرام ونيّة العمرة", "الطواف (7 أشواط)", "ركعتا الطواف", "السعي (7 أشواط)", "الحلق أو التقصير"];
  var STAGE_MIN = [2, 3, 4, 5, 0]; // أقل مرحلة في المطوّف تعني أن الخطوة تمّت (0 = يدوية)
  var GEAR = ["جواز السفر والتصريح", "ثياب الإحرام (للرجال)", "حذاء مريح", "أدويتي الشخصية", "شاحن وبطارية احتياطية", "زجاجة ماء", "حقيبة صغيرة خفيفة", "مظلة أو قبعة"].map(function (t) { return { t: t, on: 0 }; });

  function pid() { try { return (me && me.PilgrimNo) ? String(me.PilgrimNo) : "x"; } catch (e) { return "x"; } }
  function load() { try { return JSON.parse(localStorage.getItem("ix_rites_" + pid())) || {}; } catch (e) { return {}; } }
  function store(d) { try { localStorage.setItem("ix_rites_" + pid(), JSON.stringify(d)); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function url(s) { return /^https?:/i.test(s || ""); }
  function buzz(n) { try { if (navigator.vibrate) navigator.vibrate(n || 12); } catch (e) {} }

  /* ---------- الإجراءات السريعة ---------- */
  function buildQuick() {
    var on = typeof me !== "undefined" && me;
    qa.classList.toggle("d-none", !on);
    if (!on) { qa.innerHTML = ""; return; }
    var a = [];
    if (role === "pilgrim") {
      a.push('<button type="button" class="qa sos" id="lostBtn" data-q="lost"><i class="bi bi-exclamation-triangle-fill"></i><span>أنا تائه</span></button>');
      a.push('<button type="button" class="qa late" id="lateBtn" data-q="late"><i class="bi bi-person-walking"></i><span>في الطريق للباص</span></button>');
      if (me.Supervisor_Phone) a.push('<a class="qa" href="tel:' + esc(String(me.Supervisor_Phone).replace(/[^\d+]/g, "")) + '"><i class="bi bi-telephone-fill"></i><span>اتصال بالمشرف</span></a>');
      a.push('<a class="qa" href="./matwaf.html"><i class="bi bi-signpost-2-fill"></i><span>المطوّف</span></a>');
      if (url(me.Bus_Location)) a.push('<a class="qa" href="' + esc(me.Bus_Location) + '" target="_blank" rel="noopener"><i class="bi bi-bus-front-fill"></i><span>الباص</span></a>');
      if (url(me.Makkah_Location)) a.push('<a class="qa" href="' + esc(me.Makkah_Location) + '" target="_blank" rel="noopener"><i class="bi bi-buildings-fill"></i><span>فندق مكة</span></a>');
      if (url(me.Madinah_Location)) a.push('<a class="qa" href="' + esc(me.Madinah_Location) + '" target="_blank" rel="noopener"><i class="bi bi-building-fill"></i><span>فندق المدينة</span></a>');
      if (me.Makkah_WiFi || me.Madinah_WiFi) a.push('<button type="button" class="qa" data-q="wifi"><i class="bi bi-wifi"></i><span>الواي فاي</span></button>');
    } else {
      if (role === "admin") a.push('<a class="qa" href="./scan.html"><i class="bi bi-qr-code-scan"></i><span>مسح الحضور</span></a>');
      a.push('<a class="qa" href="./matwaf.html"><i class="bi bi-signpost-2-fill"></i><span>المطوّف</span></a>');
      if (role === "admin") {
        a.push('<button type="button" class="qa" data-go="adm:ppl"><i class="bi bi-people-fill"></i><span>المعتمرون</span></button>');
        a.push('<button type="button" class="qa sos" data-go="adm:lost"><i class="bi bi-exclamation-triangle-fill"></i><span>التائهون</span></button>');
      }
    }
    qa.innerHTML = a.join("");
  }
  qa.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]"); if (g) { buzz(12); setView(g.dataset.go); return; }
    var b = e.target.closest("[data-q]"); if (!b) return; buzz(15);
    if (b.dataset.q === "lost" && typeof lostPress === "function") lostPress();
    if (b.dataset.q === "late" && typeof latePress === "function") latePress();
    if (b.dataset.q === "wifi") {
      var w = me.Makkah_WiFi || me.Madinah_WiFi;
      if (typeof copyText === "function") copyText(w);
    }
  });

  /* ---------- المناسك والتجهيزات ---------- */
  function mw() { // حالة المطوّف
    var g = function (k, d) { try { var v = parseInt(localStorage.getItem(k)); return isNaN(v) ? d : v; } catch (e) { return d; } };
    var mode = "umrah"; try { mode = localStorage.getItem("mutawwif_mode") || "umrah"; } catch (e) {}
    return { mode: mode, stage: g("mutawwif_stage", 1), lap: g("mutawwif_lap", 1) };
  }
  function laps(st, k) { // k: المرحلة التي فيها الأشواط (2 طواف، 4 سعي)
    if (st.mode !== "umrah") return 0;
    if (st.stage > k) return 7;
    if (st.stage === k) return Math.max(0, Math.min(7, st.lap - 1));
    return 0;
  }
  function counter(label, n) {
    return '<div class="rt-cnt"><div class="rt-ch"><b>' + label + '</b><small>' + (n >= 7 ? "تمّ بحمد الله ✓" : "أتممت " + n + " من 7") + '</small></div>' +
      '<div class="rt-dots">' + [1, 2, 3, 4, 5, 6, 7].map(function (i) { return '<i class="' + (i <= n ? "on" : "") + '"></i>'; }).join("") + '</div></div>';
  }
  function gearList(d) { return Array.isArray(d.gear) ? d.gear : GEAR; }
  function buildRites() {
    var on = typeof me !== "undefined" && me && role === "pilgrim";
    rb.classList.toggle("d-none", !on);
    if (!on) return;
    var d = load(), m = mw(), man = d.s || [], gear = gearList(d), done = 0;
    var items = STAGES.map(function (s, i) {
      var auto = STAGE_MIN[i] > 0 && m.mode === "umrah";
      var ok = auto ? m.stage >= STAGE_MIN[i] : man.indexOf(i) > -1;
      if (ok) done++;
      var ic = '<i class="bi ' + (ok ? "bi-check-circle-fill" : "bi-circle") + '"></i>';
      return auto ? '<div class="rt-it' + (ok ? " on" : "") + '">' + ic + esc(s) + '<em>من المطوّف</em></div>'
        : '<button type="button" class="rt-it' + (ok ? " on" : "") + '" data-s="' + i + '">' + ic + esc(s) + '</button>';
    }).join("");
    var gd = gear.map(function (x, i) {
      return '<div class="rt-g"><button type="button" class="rt-it' + (x.on ? " on" : "") + '" data-g="' + i + '"><i class="bi ' + (x.on ? "bi-check-square-fill" : "bi-square") + '"></i>' + esc(x.t) + '</button>' +
        '<button type="button" class="rt-x" data-x="' + i + '" aria-label="حذف"><i class="bi bi-x-lg"></i></button></div>';
    }).join("");
    rb.innerHTML = '<h2><i class="bi bi-check2-square ms-2"></i>مناسكي وتجهيزاتي</h2>' +
      '<div class="rt-bar"><span style="width:' + Math.round(done / STAGES.length * 100) + '%"></span></div><small class="rt-sub">أنجزت ' + done + ' من ' + STAGES.length + ' · تتحدّث تلقائيًا من صفحة المطوّف</small>' +
      '<div class="rt-list">' + items + '</div>' +
      counter("الطواف", laps(m, 2)) + counter("السعي", laps(m, 4)) +
      (done === STAGES.length ? '<button type="button" class="rt-ach" data-ach="1"><i class="bi bi-award-fill"></i>بطاقة الإنجاز — تقبّل الله عمرتك</button>' : '') +
      '<a class="rt-go" href="./matwaf.html"><i class="bi bi-signpost-2-fill"></i>تابع في المطوّف</a>' +
      '<div class="rt-h">قائمة التجهيزات</div><div class="rt-list">' + gd + '</div>' +
      '<form class="rt-add" id="rtAdd"><input id="rtNew" maxlength="40" placeholder="أضف تجهيزًا..." autocomplete="off"><button type="submit" aria-label="إضافة"><i class="bi bi-plus-lg"></i></button></form>' +
      '<button type="button" class="rt-reset" data-r="1">إعادة القوائم لوضعها الأصلي</button>';
  }
  rb.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.ach) { achieve(b); return; }
    var d = load(); d.s = d.s || []; d.gear = gearList(d).map(function (x) { return { t: x.t, on: x.on }; });
    if (b.dataset.s != null) { var i = +b.dataset.s, p = d.s.indexOf(i); if (p > -1) d.s.splice(p, 1); else d.s.push(i); }
    else if (b.dataset.g != null) { var x = d.gear[+b.dataset.g]; if (x) x.on = x.on ? 0 : 1; }
    else if (b.dataset.x != null) { d.gear.splice(+b.dataset.x, 1); }
    else if (b.dataset.r) { if (!confirm("إعادة القوائم لوضعها الأصلي؟")) return; d = {}; }
    else return;
    store(d); buzz(14); buildRites();
  });
  function achieve(btn) {
    if (typeof makeImage !== "function" || typeof saveCanvas !== "function") return;
    btn.disabled = true;
    var date = new Date().toLocaleDateString("ar", { day: "numeric", month: "long", year: "numeric" });
    makeImage({
      title: "تقبّل الله عمرتك",
      sub: me.Name || "",
      rows: [["أتممتُ بحمد الله", "الإحرام · الطواف · السعي · الحلق أو التقصير"], ["التاريخ", date], ["الدعاء", "اللهم اجعلها عمرة مبرورة وسعيًا مشكورًا وذنبًا مغفورًا"]],
      qrNote: "حملة الإشراق للعمرة"
    }).then(function (c) { return saveCanvas(c, "ishraq-umrah-" + pid() + ".png"); })
      .catch(function () { if (typeof toast === "function") toast("تعذّر إنشاء البطاقة"); })
      .then(function () { btn.disabled = false; });
  }
  rb.addEventListener("submit", function (e) {
    e.preventDefault();
    var inp = $("rtNew"), t = (inp.value || "").trim(); if (!t) return;
    var d = load(); d.gear = gearList(d).map(function (x) { return { t: x.t, on: x.on }; });
    d.gear.push({ t: t, on: 0 }); store(d); buzz(14); buildRites();
  });

  /* ---------- العرض: الرئيسية + أقسام «المزيد» الخاصة بالمستخدم ---------- */
  var view = "home", tb = $("umrah-tabs-btn");
  var ICON = { bus: "bi-bus-front-fill", sup: "bi-people-fill", hotel: "bi-building-fill", prog: "bi-calendar-event", rites: "bi-check2-square", ask: "bi-chat-dots", fatwa: "bi-question-circle", rate: "bi-star", admin: "bi-speedometer2", sheikh: "bi-book" };
  var TOP = ["pilgrimBox", "quickActs", "nextBox", "lostBox", "notifyBar"];
  function visible(el) { return el && !el.classList.contains("d-none"); }
  function sections() { // أقسام المستخدم الحالي فقط
    if (typeof me === "undefined" || !me) return [];
    var list = [];
    if (role === "admin") list = (typeof ADM_TABS !== "undefined" ? ADM_TABS : [["today", "لوحة المشرف", "bi-speedometer2"]]).map(function (t) { return ["adm:" + t[0], t[1], t[2]]; }).concat([["prog", "برنامج الرحلة"]]);
    else if (role === "sheikh") list = [["sheikh", "لوحة الشيخ"], ["prog", "برنامج الرحلة"]];
    else {
      var has = { bus: visible($("busBox")), sup: visible($("mySupBox")), hotel: visible($("hotelBox")) };
      list = (typeof TABS !== "undefined" ? TABS : []).filter(function (t) { return t[0] !== "all" && has[t[0]] !== false; });
    }
    return list;
  }
  function applyView() {
    var logged = typeof me !== "undefined" && me, secs = sections();
    if (view !== "home" && !secs.some(function (s) { return s[0] === view; })) view = "home";
    if (!logged) view = "home";
    TOP.forEach(function (id) { var e = $(id); if (e) e.classList.toggle("uv-off", view !== "home"); });
    document.querySelectorAll("[data-sec]").forEach(function (e) { e.classList.toggle("uv-off", view === "home" || e.dataset.sec !== (view.indexOf("adm:") === 0 ? "admin" : view)); });
    tb.classList.toggle("d-none", !(logged && secs.length));
    var head = $("uSecHead");
    if (!head) { head = document.createElement("div"); head.id = "uSecHead"; head.className = "u-sechead"; $("app").insertBefore(head, $("app").firstChild); }
    var cur = secs.filter(function (s) { return s[0] === view; })[0];
    head.classList.toggle("uv-off", view === "home");
    head.innerHTML = cur ? '<button type="button" data-home aria-label="الرئيسية"><i class="bi bi-chevron-right"></i></button><b>' + esc(cur[1]) + "</b>" : "";
  }
  function setView(v) { view = v; applyView(); if (v.indexOf("adm:") === 0 && typeof admGo === "function") admGo(v.slice(4)); window.scrollTo(0, 0); }
  var sh = document.createElement("div"); sh.id = "ix-utabs"; sh.setAttribute("aria-hidden", "true");
  sh.style.cssText = ""; sh.className = "ix-sheet-wrap";
  document.body.appendChild(sh);
  function openSheet() {
    var secs = sections();
    sh.innerHTML = '<div class="sheet" role="dialog" aria-label="المزيد"><div class="grab"></div><div class="m-h"><b>المزيد</b><button class="m-x" type="button" data-close aria-label="إغلاق"><i class="bi bi-x-lg"></i></button></div><div class="m-list">' +
      '<button type="button" class="m-row back' + (view === "home" ? " on" : "") + '" data-v="home"><i class="bi bi-house-door-fill"></i>الرئيسية</button>' +
      secs.map(function (s) { return '<button type="button" class="m-row' + (view === s[0] ? " on" : "") + '" data-v="' + s[0] + '" style="--ac:#d6ac52"><i class="bi ' + (s[2] || ICON[s[0]] || "bi-circle") + '"></i>' + esc(s[1]) + '<span class="ch bi bi-chevron-left"></span></button>'; }).join("") +
      "</div></div>";
    sh.classList.add("on"); sh.setAttribute("aria-hidden", "false");
  }
  function closeSheet() { sh.classList.remove("on"); sh.setAttribute("aria-hidden", "true"); }
  tb.addEventListener("click", function () { buzz(10); openSheet(); });
  sh.addEventListener("click", function (e) {
    if (e.target === sh || e.target.closest("[data-close]")) return closeSheet();
    var r = e.target.closest("[data-v]"); if (r) { closeSheet(); setView(r.dataset.v); }
  });
  document.addEventListener("click", function (e) { if (e.target.closest("[data-home]")) setView("home"); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });

  function all() { buildQuick(); buildRites(); applyView(); }
  var mo = new MutationObserver(function () { clearTimeout(all.t); all.t = setTimeout(all, 60); });
  mo.observe($("ticket"), { childList: true });
  mo.observe($("app"), { attributes: true, attributeFilter: ["class"] });
  all();
  // عند العودة من صفحة المطوّف نحدّث الأشواط فورًا
  window.addEventListener("pageshow", buildRites); window.addEventListener("focus", buildRites); window.addEventListener("storage", buildRites);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) buildRites(); });
})();
