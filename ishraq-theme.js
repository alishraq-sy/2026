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
