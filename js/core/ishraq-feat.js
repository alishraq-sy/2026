/* إشراق · أدوات مشتركة للميزات الجديدة */
(function () {
  var W = window;
  W.$ = W.$ || function (s, r) { return (r || document).querySelector(s); };
  W.$$ = W.$$ || function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  W.fxGet = function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  W.fxSet = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  W.fxDay = function (d) { d = d || new Date(); var m = d.getMonth() + 1, x = d.getDate(); return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (x < 10 ? "0" : "") + x; };
  W.fxHijri = function (d) {
    try { var p = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }).formatToParts(d || new Date()), o = {};
      p.forEach(function (x) { o[x.type] = parseInt(x.value, 10); });
      var adj = parseInt(localStorage.getItem("ix_hijri_adj") || "0", 10) || 0;
      var dd = o.day + adj; if (dd < 1) dd += 30; if (dd > 30) dd -= 30;
      return { d: dd, m: o.month, y: o.year };
    } catch (e) { return { d: 1, m: 1, y: 1447 }; }
  };
  W.fxEsc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  W.fxSeed = function (n) { var x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); };
  W.fxToast = function (t) {
    var e = document.createElement("div"); e.textContent = t;
    e.style.cssText = "position:fixed;bottom:96px;left:50%;transform:translateX(-50%);background:#1b1c1f;color:#f6e7bf;border:1px solid #d6ac52;padding:10px 18px;border-radius:14px;z-index:9000;font:600 .88rem Tajawal,sans-serif";
    document.body.appendChild(e); setTimeout(function () { e.remove(); }, 2200);
  };
})();
