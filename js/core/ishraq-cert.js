/* شهادة تهنئة إتمام العمرة / الحج — A4 عرضية، خط عثماني (Amiri Quran)، ثلاثة ألوان، صورة / واتساب / PDF */
(function () {
  var W = 1754, H = 1240; // A4 عرضي بدقة 150dpi؛ التصدير يُضاعف إلى 300dpi
  var FF = "'Amiri Quran','Amiri','Traditional Arabic',serif";
  var JSPDF = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
  var THEMES = {
    dark:  { n: "داكن",  bg0: "#1d1910", bg1: "#09090a", acc: "#d6ac52", acc2: "#f0d99a", txt: "#f4ecd6", sub: "#cfc19c", pat: .07, line: "#d6ac52" },
    ivory: { n: "عاجي",  bg0: "#fbf5e4", bg1: "#eadcb6", acc: "#9a7424", acc2: "#b88a36", txt: "#2a2110", sub: "#6c5a33", pat: .09, line: "#9a7424" },
    gold:  { n: "ذهبي",  bg0: "#f4dc9a", bg1: "#c9993f", acc: "#4a3209", acc2: "#6b4a12", txt: "#1f1608", sub: "#47330d", pat: .10, line: "#4a3209" }
  };
  var KINDS = {
    umrah: { title: "شهادة تهنئة", what: "بمناسبة إتمام مناسك العمرة بفضل الله وتوفيقه", aya: "﴿ وَأَتِمُّوا۟ ٱلْحَجَّ وَٱلْعُمْرَةَ لِلَّهِ ﴾", dua: "تقبّل الله منك، وجعلها عمرةً مبرورةً، وسعياً مشكوراً، وذنباً مغفوراً", wa: "الحمد لله الذي بنعمته تتم الصالحات، أتممتُ عمرتي بفضل الله. تقبّل الله منا ومنكم." },
    hajj:  { title: "شهادة تهنئة", what: "بمناسبة إتمام مناسك الحج بفضل الله وتوفيقه", aya: "﴿ وَلِلَّهِ عَلَى ٱلنَّاسِ حِجُّ ٱلْبَيْتِ ﴾", dua: "حجّ مبرور، وسعي مشكور، وذنب مغفور، وتجارة لن تبور", wa: "الحمد لله الذي بنعمته تتم الصالحات، أتممتُ مناسك الحج بفضل الله. تقبّل الله منا ومنكم، حجٌّ مبرور وسعيٌ مشكور." }
  };
  var st = { kind: "umrah", theme: "dark", name: "" }, logo = null, box, cv, timer;

  function get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function loadLogo() { return new Promise(function (r) { if (logo) return r(logo); var i = new Image(); i.onload = function () { logo = i; r(i); }; i.onerror = function () { r(null); }; i.src = "./img/logo.png"; }); }
  function dates() {
    var d = new Date(), h = "", g = "";
    try { h = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "long", year: "numeric" }).format(d); } catch (e) {}
    try { g = new Intl.DateTimeFormat("ar-u-nu-latn", { day: "numeric", month: "long", year: "numeric" }).format(d); } catch (e) {}
    return { h: h, g: g };
  }

  function star(x, cx, cy, r, rot) { // نجمة ثمانية (مربعان متراكبان)
    x.beginPath();
    for (var k = 0; k < 2; k++) for (var i = 0; i < 4; i++) {
      var a = rot + k * Math.PI / 4 + i * Math.PI / 2, px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
      (i === 0 && k === 0) ? x.moveTo(px, py) : x.lineTo(px, py);
      if (i === 3) x.closePath();
    }
  }
  function star8(x, cx, cy, r) { // نجمة مدببة 8 رؤوس
    x.beginPath();
    for (var i = 0; i < 16; i++) { var a = -Math.PI / 2 + i * Math.PI / 8, rr = i % 2 ? r * .62 : r; var px = cx + rr * Math.cos(a), py = cy + rr * Math.sin(a); i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.closePath();
  }
  function fit(x, s, font, max, size) { x.font = font.replace("{s}", size); while (x.measureText(s).width > max && size > 30) { size -= 4; x.font = font.replace("{s}", size); } return size; }

  function draw(c, scale) {
    var T = THEMES[st.theme], K = KINDS[st.kind], x = c.getContext("2d");
    c.width = W * scale; c.height = H * scale; x.setTransform(scale, 0, 0, scale, 0, 0);
    x.direction = "rtl"; x.textAlign = "center"; x.textBaseline = "alphabetic";
    // الخلفية
    var g = x.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W * .72); g.addColorStop(0, T.bg0); g.addColorStop(1, T.bg1);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // نسيج النجوم
    x.save(); x.globalAlpha = T.pat; x.strokeStyle = T.acc; x.lineWidth = 1.4;
    for (var gy = 0; gy < H + 120; gy += 120) for (var gx = 0; gx < W + 120; gx += 120) { star(x, gx + ((gy / 120) % 2 ? 60 : 0), gy, 46, Math.PI / 8); x.stroke(); }
    x.restore();
    // علامة مائية للشعار
    if (logo) { var lw = 760, lh = lw * logo.height / logo.width; x.save(); x.globalAlpha = st.theme === "gold" ? .13 : .10; x.drawImage(logo, (W - lw) / 2, (H - lh) / 2 + 20, lw, lh); x.restore(); }
    // الإطارات
    x.strokeStyle = T.line; x.lineWidth = 8; x.strokeRect(38, 38, W - 76, H - 76);
    x.lineWidth = 2.4; x.strokeRect(62, 62, W - 124, H - 124);
    x.lineWidth = 1.2; x.strokeRect(74, 74, W - 148, H - 148);
    // زوايا: نجمة ثمانية
    [[62, 62], [W - 62, 62], [62, H - 62], [W - 62, H - 62]].forEach(function (p) {
      x.fillStyle = T.bg1; star(x, p[0], p[1], 46, Math.PI / 8); x.fill(); x.strokeStyle = T.line; x.lineWidth = 3; x.stroke();
      x.fillStyle = T.acc; star8(x, p[0], p[1], 24); x.fill();
    });
    // نجوم منتصف الأضلاع
    [[W / 2, 62], [W / 2, H - 62]].forEach(function (p) { x.fillStyle = T.bg1; x.fillRect(p[0] - 60, p[1] - 12, 120, 24); x.fillStyle = T.acc; star8(x, p[0], p[1], 20); x.fill(); });
    // النصوص
    x.fillStyle = T.acc; x.font = "400 54px " + FF; x.fillText("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", W / 2, 168);
    var ts = fit(x, K.title, "700 {s}px " + FF, 1100, 150);
    var tg = x.createLinearGradient(W / 2 - 400, 0, W / 2 + 400, 0); tg.addColorStop(0, T.acc); tg.addColorStop(.5, T.acc2); tg.addColorStop(1, T.acc);
    x.fillStyle = tg; x.font = "700 " + ts + "px " + FF; x.fillText(K.title, W / 2, 330);
    // فاصل
    var ly = 372; x.strokeStyle = T.acc; x.lineWidth = 2.5;
    x.beginPath(); x.moveTo(W / 2 - 360, ly); x.lineTo(W / 2 - 40, ly); x.moveTo(W / 2 + 40, ly); x.lineTo(W / 2 + 360, ly); x.stroke();
    x.fillStyle = T.acc; star8(x, W / 2, ly, 18); x.fill();
    x.fillStyle = T.sub; x.font = "400 54px " + FF; x.fillText("تتشرّف حملة الإشراق بتهنئة", W / 2, 470);
    var nm = (st.name || "").trim() || "ضيف الرحمن", ns = fit(x, nm, "700 {s}px " + FF, 1250, 140);
    x.fillStyle = T.txt; x.font = "700 " + ns + "px " + FF; x.fillText(nm, W / 2, 620);
    var ug = x.createLinearGradient(W / 2 - 520, 0, W / 2 + 520, 0); ug.addColorStop(0, "transparent"); ug.addColorStop(.5, T.acc); ug.addColorStop(1, "transparent");
    x.fillStyle = ug; x.fillRect(W / 2 - 520, 652, 1040, 3);
    x.fillStyle = T.sub; x.font = "400 54px " + FF; x.fillText(K.what, W / 2, 745);
    x.fillStyle = T.acc; x.font = "400 62px " + FF; x.fillText(K.aya, W / 2, 855);
    x.fillStyle = T.txt; var ds = fit(x, K.dua, "400 {s}px " + FF, 1300, 50); x.font = "400 " + ds + "px " + FF; x.fillText(K.dua, W / 2, 945);
    // التذييل: التاريخ — الختم — الإدارة
    var D = dates(), fy = 1085;
    x.fillStyle = T.sub; x.font = "400 38px " + FF;
    x.textAlign = "center"; x.fillText("حُرّرت في", 420, fy - 40); x.fillStyle = T.txt; x.font = "400 44px " + FF; x.fillText(D.h, 420, fy + 14); x.fillStyle = T.sub; x.font = "400 34px " + FF; x.fillText(D.g + " م", 420, fy + 62);
    x.fillStyle = T.sub; x.font = "400 38px " + FF; x.fillText("إدارة حملة الإشراق", W - 420, fy - 40);
    x.strokeStyle = T.acc; x.lineWidth = 2; x.beginPath(); x.moveTo(W - 600, fy + 20); x.lineTo(W - 240, fy + 20); x.stroke();
    x.fillStyle = T.txt; x.font = "400 44px " + FF; x.fillText("تقبّل الله منا ومنكم", W - 420, fy + 70);
    // الختم
    var sx = W / 2, sy = fy + 10, R = 92;
    x.save(); x.fillStyle = T.bg1; x.beginPath(); x.arc(sx, sy, R, 0, 7); x.fill();
    x.strokeStyle = T.acc; x.lineWidth = 5; x.beginPath(); x.arc(sx, sy, R, 0, 7); x.stroke();
    x.lineWidth = 1.6; x.beginPath(); x.arc(sx, sy, R - 12, 0, 7); x.stroke();
    x.fillStyle = T.acc; star8(x, sx, sy, R - 18); x.globalAlpha = .18; x.fill(); x.globalAlpha = 1;
    if (logo) { var sw = 118, sh = sw * logo.height / logo.width; x.drawImage(logo, sx - sw / 2, sy - sh / 2, sw, sh); }
    x.restore();
  }

  function paint() { if (cv) draw(cv, 1); }
  function sched() { clearTimeout(timer); timer = setTimeout(paint, 120); }
  function ready() { return Promise.all([loadLogo(), (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load("700 60px 'Amiri Quran'"), document.fonts.load("400 60px 'Amiri Quran'")]).catch(function () {}) : 0]); }
  function out(type, q) { var c = document.createElement("canvas"); draw(c, 2); return new Promise(function (r) { c.toBlob(r, type, q); }); }
  function fname() { return "ishraq-certificate-" + st.kind + ".png"; }
  function toast(m) { if (window.fxToast) return fxToast(m); if (window.toast) return window.toast(m); }

  function css() {
    if (document.getElementById("ixcert-css")) return;
    var s = document.createElement("style"); s.id = "ixcert-css";
    s.textContent = "#ixcert{position:fixed;inset:0;z-index:9990;display:none;background:rgba(0,0,0,.72);backdrop-filter:blur(3px);overflow:auto;direction:rtl;font-family:Tajawal,Cairo,sans-serif}#ixcert.on{display:block}" +
      "#ixcert .sh{max-width:880px;margin:18px auto;padding:16px;border-radius:24px;background:var(--c1,#17181a);color:var(--t,#f3ead2);border:1px solid color-mix(in srgb,var(--a,#d6ac52) 50%,transparent)}" +
      "#ixcert h3{font-family:'Reem Kufi',Cairo,sans-serif;font-size:1.15rem;color:var(--a2,#ecd09a);margin:0 0 12px;display:flex;justify-content:space-between;align-items:center}" +
      "#ixcert canvas{width:100%;height:auto;border-radius:10px;display:block;box-shadow:0 10px 30px rgba(0,0,0,.45)}" +
      "#ixcert input[type=text]{width:100%;padding:11px 14px;border-radius:14px;border:1px solid var(--c3,#2a2c30);background:var(--k,#0b0b0c);color:var(--t,#f3ead2);font:inherit;margin:12px 0 10px}" +
      "#ixcert .ch{display:flex;gap:8px;margin-bottom:12px}#ixcert .ch button{flex:1;padding:9px;border-radius:14px;border:1px solid var(--c3,#2a2c30);background:transparent;color:var(--t,#f3ead2);font:700 .9rem Tajawal,Cairo,sans-serif;cursor:pointer}#ixcert .ch button.on{background:linear-gradient(135deg,#ecd09a,#cf9f52);color:#1c1405;border-color:transparent}" +
      "#ixcert .ac{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}#ixcert .ac button{padding:11px 6px;border-radius:14px;border:0;font:700 .88rem Tajawal,Cairo,sans-serif;cursor:pointer;color:#1c1405;background:linear-gradient(135deg,#ecd09a,#cf9f52)}#ixcert .ac button.wa{background:#25d366;color:#06240f}#ixcert .ac button.pdf{background:transparent;color:var(--a2,#ecd09a);border:1px solid color-mix(in srgb,var(--a,#d6ac52) 60%,transparent)}#ixcert .ac button:disabled{opacity:.6}" +
      "#ixcert .x{background:transparent;border:0;color:var(--t,#f3ead2);font-size:1.4rem;cursor:pointer}";
    document.head.appendChild(s);
  }
  function build() {
    if (box) return; css();
    box = document.createElement("div"); box.id = "ixcert";
    box.innerHTML = '<div class="sh"><h3><span>شهادة التهنئة</span><button class="x" type="button" aria-label="إغلاق">✕</button></h3><canvas width="' + W + '" height="' + H + '"></canvas>' +
      '<input type="text" id="ixc-name" placeholder="اكتب الاسم الذي سيظهر على الشهادة" maxlength="60">' +
      '<div class="ch" id="ixc-th"></div>' +
      '<div class="ac"><button type="button" id="ixc-img">حفظ كصورة</button><button type="button" class="wa" id="ixc-wa">مشاركة واتساب</button><button type="button" class="pdf" id="ixc-pdf">تصدير PDF</button></div></div>';
    document.body.appendChild(box); cv = box.querySelector("canvas");
    box.querySelector(".x").onclick = close; box.onclick = function (e) { if (e.target === box) close(); };
    var th = box.querySelector("#ixc-th");
    Object.keys(THEMES).forEach(function (k) { var b = document.createElement("button"); b.type = "button"; b.textContent = THEMES[k].n; b.dataset.t = k; b.onclick = function () { st.theme = k; put("ix_cert_theme", k); mark(); paint(); }; th.appendChild(b); });
    box.querySelector("#ixc-name").oninput = function (e) { st.name = e.target.value; put("ix_cert_name", st.name); sched(); };
    box.querySelector("#ixc-img").onclick = function (e) { act(e.currentTarget, function () { return out("image/png").then(function (b) { return download(b, fname()); }); }); };
    box.querySelector("#ixc-wa").onclick = function (e) { act(e.currentTarget, share); };
    box.querySelector("#ixc-pdf").onclick = function (e) { act(e.currentTarget, pdf); };
  }
  function mark() { box.querySelectorAll("#ixc-th button").forEach(function (b) { b.classList.toggle("on", b.dataset.t === st.theme); }); }
  function act(b, fn) { b.disabled = true; Promise.resolve().then(fn).catch(function () { toast("تعذّرت العملية"); }).then(function () { b.disabled = false; }); }
  function download(blob, name) {
    var file = new File([blob], name, { type: blob.type });
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file] }).catch(function () {});
    var u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); toast("تم الحفظ");
  }
  function share() {
    return out("image/png").then(function (blob) {
      var file = new File([blob], fname(), { type: "image/png" }), text = KINDS[st.kind].wa;
      if (navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file], text: text }).catch(function () {});
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener"); return download(blob, fname());
    });
  }
  function lib() { return window.jspdf ? Promise.resolve() : new Promise(function (res, rej) { var s = document.createElement("script"); s.src = JSPDF; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function pdf() {
    return lib().then(function () { return out("image/jpeg", .92); }).then(function (blob) {
      return new Promise(function (r) { var f = new FileReader(); f.onload = function () { r(f.result); }; f.readAsDataURL(blob); });
    }).then(function (url) {
      var doc = new window.jspdf.jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
      doc.addImage(url, "JPEG", 0, 0, 297, 210); doc.save("ishraq-certificate-" + st.kind + ".pdf");
    });
  }
  function open(o) {
    o = o || {}; build();
    st.kind = KINDS[o.kind] ? o.kind : "umrah"; st.theme = THEMES[get("ix_cert_theme", "dark")] ? get("ix_cert_theme", "dark") : "dark";
    st.name = o.name || get("ix_cert_name", ""); box.querySelector("#ixc-name").value = st.name; mark();
    box.classList.add("on"); document.documentElement.style.overflow = "hidden";
    ready().then(paint);
  }
  function close() { if (box) box.classList.remove("on"); document.documentElement.style.overflow = ""; }
  window.ixCert = { open: open, close: close, _draw: function (c, s, o) { Object.assign(st, o || {}); return ready().then(function () { draw(c, s || 1); }); } };
})();
