/* إشراق · تبديل الثيم (داكن / فاتح) — يُحمَّل بالـ head ليُطبَّق قبل الرسم فلا يحدث وميض */
(function () {
  var KEY = "ix_theme", root = document.documentElement;
  function get() { try { return localStorage.getItem(KEY) === "light" ? "light" : "dark"; } catch (e) { return "dark"; } }
  function apply(t) {
    root.setAttribute("data-theme", t);
    root.setAttribute("data-bs-theme", t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "light" ? "#f6efdd" : "#0b0b0c");
    var btns = document.querySelectorAll("[data-ix-theme]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].innerHTML = '<i class="bi ' + (t === "light" ? "bi-moon-stars-fill" : "bi-sun-fill") + '"></i>';
      btns[i].setAttribute("aria-label", t === "light" ? "الثيم الداكن" : "الثيم الفاتح");
      btns[i].setAttribute("title", t === "light" ? "الثيم الداكن" : "الثيم الفاتح");
    }
    var sel = document.querySelectorAll("[data-theme-set]");
    for (var j = 0; j < sel.length; j++) sel[j].classList.toggle("on", sel[j].getAttribute("data-theme-set") === t);
  }
  function set(t) { try { localStorage.setItem(KEY, t); } catch (e) {} apply(t); }
  window.ixTheme = { get: get, set: set, toggle: function () { set(get() === "light" ? "dark" : "light"); } };
  apply(get());

  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.querySelector(".app-bar .in");
    var b = document.createElement("button");
    b.type = "button"; b.setAttribute("data-ix-theme", ""); b.className = "ab ix-theme-btn";
    if (bar && bar.firstElementChild) {
      var first = bar.firstElementChild, grp = document.createElement("div");
      grp.className = "grp"; bar.insertBefore(grp, first); grp.appendChild(first); grp.appendChild(b);
    } else { b.className = "ix-theme-fab"; document.body.appendChild(b); }
    apply(get());
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-ix-theme]")) window.ixTheme.toggle();
    var s = e.target.closest("[data-theme-set]");
    if (s) window.ixTheme.set(s.getAttribute("data-theme-set"));
  });
  window.addEventListener("storage", function (e) { if (e.key === KEY) apply(get()); });
})();

/* ألوان التمييز + ثيم رمضان (تُطبَّق قبل الرسم على كل الصفحات) */
(function () {
  var root = document.documentElement, HUE = { gold: 0, emerald: 100, turq: 140, violet: 230, ruby: -50, copper: -20 };
  function rd(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function isRamadan() {
    try {
      var p = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { month: "numeric" }).formatToParts(new Date());
      for (var i = 0; i < p.length; i++) if (p[i].type === "month") return parseInt(p[i].value, 10) === 9;
    } catch (e) {}
    return false;
  }
  function apply() {
    var a = rd("ix_accent", "gold"); if (!(a in HUE)) a = "gold";
    if (a === "gold") { root.removeAttribute("data-accent"); root.style.removeProperty("--ix-hue"); }
    else { root.setAttribute("data-accent", a); root.style.setProperty("--ix-hue", HUE[a] + "deg"); }
    var r = rd("ix_ramadan", "off");
    if (r === "on" || (r === "auto" && isRamadan())) root.setAttribute("data-ramadan", "1"); else root.removeAttribute("data-ramadan");
  }
  window.ixAccent = {
    get: function () { return rd("ix_accent", "gold"); }, set: function (a) { try { localStorage.setItem("ix_accent", a); } catch (e) {} apply(); },
    getRamadan: function () { return rd("ix_ramadan", "off"); }, setRamadan: function (v) { try { localStorage.setItem("ix_ramadan", v); } catch (e) {} apply(); }
  };
  apply();
})();

/* ===== نوافذ حوار إشراق: بديل أنيق لـ alert / confirm ===== */
(function () {
  var css = "#ixd{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.62);backdrop-filter:blur(3px);direction:rtl;font-family:Tajawal,Cairo,sans-serif}" +
    "#ixd.on{display:flex}#ixd .bx{width:100%;max-width:360px;border-radius:26px;padding:26px 22px 18px;text-align:center;background:var(--c1,#17181a);color:var(--t,#f3ead2);border:1px solid color-mix(in srgb,var(--a,#d6ac52) 55%,transparent);box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 0 6px color-mix(in srgb,var(--a,#d6ac52) 8%,transparent);animation:ixdIn .22s ease}" +
    "@keyframes ixdIn{from{transform:scale(.92) translateY(10px);opacity:0}to{transform:none;opacity:1}}" +
    "#ixd .ic{width:56px;height:56px;border-radius:50%;margin:0 auto 14px;display:grid;place-items:center;font-size:1.6rem;color:var(--a,#d6ac52);background:color-mix(in srgb,var(--a,#d6ac52) 14%,transparent);border:1px solid color-mix(in srgb,var(--a,#d6ac52) 45%,transparent)}" +
    "#ixd .tt{font-family:'Reem Kufi',Cairo,sans-serif;font-size:1.15rem;color:var(--a2,#ecd09a);margin-bottom:8px}" +
    "#ixd .ms{font-size:.95rem;line-height:1.9;color:var(--t,#f3ead2);white-space:pre-line;margin-bottom:18px;word-break:break-word}" +
    "#ixd .bt{display:flex;gap:10px}#ixd button{flex:1;padding:11px 14px;border-radius:14px;font:700 .92rem Tajawal,Cairo,sans-serif;cursor:pointer;border:1px solid color-mix(in srgb,var(--a,#d6ac52) 55%,transparent);background:transparent;color:var(--a2,#ecd09a)}" +
    "#ixd button.p{background:linear-gradient(135deg,#ecd09a,#cf9f52);color:#1c1405;border-color:transparent}#ixd button.d{background:linear-gradient(135deg,#e08a82,#bf4f48);color:#fff;border-color:transparent}";
  var st = document.createElement("style"); st.textContent = css; (document.head || document.documentElement).appendChild(st);
  var q = [], busy = false, box;
  function ensure() {
    if (box) return; box = document.createElement("div"); box.id = "ixd";
    box.innerHTML = '<div class="bx" role="dialog" aria-modal="true"><div class="ic"><i class="bi"></i></div><div class="tt"></div><div class="ms"></div><div class="bt"></div></div>';
    document.body.appendChild(box);
  }
  function next() {
    if (busy || !q.length) return; busy = true; ensure();
    var o = q.shift(), b = box.querySelector(".bx");
    b.querySelector(".ic i").className = "bi " + (o.icon || "bi-stars"); b.querySelector(".tt").textContent = o.title || "إشراق"; b.querySelector(".ms").textContent = o.msg;
    var bt = b.querySelector(".bt"); bt.innerHTML = "";
    o.btns.forEach(function (x) { var e = document.createElement("button"); e.type = "button"; e.textContent = x.t; e.className = x.c || ""; e.onclick = function () { box.classList.remove("on"); busy = false; o.done(x.v); setTimeout(next, 30); }; bt.appendChild(e); });
    box.classList.add("on"); var f = bt.querySelector(".p,.d") || bt.querySelector("button"); if (f) f.focus();
  }
  function whenReady(fn) { if (document.body) fn(); else document.addEventListener("DOMContentLoaded", fn); }
  window.ixAsk = function (msg, opt) {
    opt = opt || {};
    return new Promise(function (res) { q.push({ msg: String(msg), title: opt.title || "تأكيد", icon: opt.danger ? "bi-exclamation-triangle" : "bi-question-circle", btns: [{ t: opt.cancel || "إلغاء", v: false }, { t: opt.ok || "تأكيد", v: true, c: opt.danger ? "d" : "p" }], done: res }); whenReady(next); });
  };
  // نافذة بأزرار مخصّصة: ixNotice({title,msg,icon,btns:[{t,v,c}]}) → Promise بقيمة الزر المضغوط
  window.ixNotice = function (o) { return new Promise(function (res) { q.push({ msg: String(o.msg || ""), title: o.title || "إشراق", icon: o.icon || "bi-bell-fill", btns: o.btns || [{ t: "إغلاق", v: true, c: "p" }], done: res }); whenReady(next); }); };
  // إشعار نُقر عليه: يظهر نصّه في نافذة مع زر إغلاق (وزر فتح إن كان رابطه صفحة أخرى)
  function showNotif(n) {
    if (!n) return; var go = false;
    try { var t = new URL(n.u || "./index.html", location.href); go = t.pathname !== location.pathname || t.search !== location.search; } catch (e) {}
    var btns = [{ t: "إغلاق", v: false, c: go ? "" : "p" }]; if (go) btns.push({ t: "فتح", v: true, c: "p" });
    window.ixNotice({ title: n.t || "إشراق", msg: n.b || "", icon: "bi-bell-fill", btns: btns }).then(function (v) { if (v && go) location.href = n.u; });
  }
  try {
    var qs = new URLSearchParams(location.search), raw = qs.get("ixn");
    if (raw) { qs.delete("ixn"); var s = qs.toString(); try { history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash); } catch (e) {} var n0; try { n0 = JSON.parse(raw); } catch (e) {} if (n0) showNotif(n0); }
    if (navigator.serviceWorker) navigator.serviceWorker.addEventListener("message", function (e) { if (e.data && e.data.type === "ix-notif") showNotif({ t: e.data.title, b: e.data.body, u: e.data.url }); });
  } catch (e) {}
  window.alert = function (msg) { q.push({ msg: String(msg), title: "إشراق", icon: "bi-stars", btns: [{ t: "حسناً", v: true, c: "p" }], done: function () {} }); whenReady(next); };
})();
