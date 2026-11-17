/* إشراق · محرّك صور البطاقات: يرسم نفس بطاقة المعتمر (ذهبية + جسم عاجي + شعار شفاف) لتُحفظ كصورة مطابقة لما يظهر في الموقع.
   ixTicket.draw({ headR:[صغير, كبير], headL:[صغير, كبير], rows:[['#h','عنوان'] | [مفتاح, قيمة]], qr, qrNote, foot }) → Promise<canvas>
   ixTicket.save(canvas, name) → يحفظ/يشارك الصورة */
(function () {
  var LOGO = "./5b862b4281f64fd884b11984846f0e97.png", logoP = null;
  function loadImg(src) { return new Promise(function (r) { if (!src) return r(null); var i = new Image(); i.onload = function () { r(i); }; i.onerror = function () { r(null); }; i.src = src; }); }
  function logo() { return logoP || (logoP = loadImg(LOGO)); }
  function fonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all(["700 20px Tajawal", "400 16px Tajawal", "500 32px 'Reem Kufi'", "700 32px 'Reem Kufi'"].map(function (f) { return document.fonts.load(f).catch(function () {}); }));
  }
  function rr(x, a, y, w, h, r) { x.beginPath(); x.moveTo(a + r, y); x.arcTo(a + w, y, a + w, y + h, r); x.arcTo(a + w, y + h, a, y + h, r); x.arcTo(a, y + h, a, y, r); x.arcTo(a, y, a + w, y, r); x.closePath(); }

  async function draw(o) {
    await Promise.all([fonts(), logo()]);
    var lg = await logo(), S = 3, CW = 360, W = CW * S, R = 26 * S, PX = 20 * S, M = 24 * S, FF = "Tajawal, sans-serif", KF = "'Reem Kufi', Tajawal, sans-serif";
    var INK = "#16130a", CREAM = "#f7e9c9", MAXW = W - 2 * PX;
    var m = document.createElement("canvas").getContext("2d"); m.direction = "rtl";
    function wrap(txt, font, maxw) {
      m.font = font;
      return String(txt == null ? "" : txt).split("\n").flatMap(function (par) {
        var out = [], cur = "";
        par.split(/\s+/).filter(Boolean).forEach(function (w) { var t = cur ? cur + " " + w : w; if (cur && m.measureText(t).width > maxw) { out.push(cur); cur = w; } else cur = t; });
        if (cur) out.push(cur); return out.length ? out : [""];
      });
    }
    function fit(txt, weight, size, maxw, fam) { var s = size; m.font = weight + " " + s + "px " + (fam || FF); while (s > 11 * S && m.measureText(txt).width > maxw) { s -= S; m.font = weight + " " + s + "px " + (fam || FF); } return s; }

    var ops = [], y = 0;
    /* ---- الرأس ---- */
    var hasHead = o.headR || o.headL, headH = 0;
    if (hasHead) {
      headH = 94 * S;
      var L = o.headL, Rr = o.headR, lw = L ? Math.min(150 * S, (function () { m.font = "500 " + 32 * S + "px " + KF; return m.measureText(L[1]).width; })() + 4) : 0;
      if (Rr) {
        var rw = MAXW - lw - (L ? 14 * S : 0), sz = fit(Rr[1], 700, 20 * S, rw);
        ops.push({ t: Rr[0], font: "400 " + 12.5 * S + "px " + FF, color: INK + "b3", x: W - PX, y: 18 * S + 15 * S, align: "right" });
        ops.push({ t: Rr[1], font: "700 " + sz + "px " + FF, color: INK, x: W - PX, y: 18 * S + 15 * S + 8 * S + sz * 0.92, align: "right" });
      }
      if (L) {
        ops.push({ t: L[0], font: "400 " + 12.5 * S + "px " + FF, color: INK + "b3", x: PX, y: 18 * S + 15 * S, align: "left", ltr: 1 });
        ops.push({ t: L[1], font: "500 " + 32 * S + "px " + KF, color: INK, x: PX, y: 18 * S + 15 * S + 8 * S + 30 * S, align: "left", ltr: 1 });
      }
    }
    y = headH;
    /* ---- الجسم ---- */
    var bodyTop = y; y += 16 * S;
    (o.rows || []).forEach(function (r) {
      if (r[0] === "#h") {
        y += 6 * S; ops.push({ t: r[1], font: "700 " + 16 * S + "px " + FF, color: "#7a5a14", x: W - PX, y: y + 18 * S, align: "right" }); y += 24 * S;
        ops.push({ rule: y - 4 * S }); y += 6 * S; return;
      }
      if (!r[1] && r[1] !== 0) return;
      ops.push({ t: r[0], font: "700 " + 12.8 * S + "px " + FF, color: INK + "a6", x: W - PX, y: y + 16 * S, align: "right" }); y += 20 * S;
      wrap(r[1], "400 " + 16 * S + "px " + FF, MAXW).forEach(function (l) { y += 27 * S; ops.push({ t: l, font: "400 " + 16 * S + "px " + FF, color: INK, x: W - PX, y: y - 7 * S, align: "right", ltr: /^[+\d\s()-]+$/.test(l) ? 1 : 0 }); });
      y += 11 * S;
    });
    if (o.qr) {
      var qs = 180 * S; y += 8 * S;
      ops.push({ qr: o.qr, x: (W - qs) / 2, y: y + 10 * S, s: qs }); y += qs + 20 * S + 8 * S;
      if (o.qrNote) { wrap(o.qrNote, "400 " + 12.5 * S + "px " + FF, MAXW).forEach(function (l) { y += 20 * S; ops.push({ t: l, font: "400 " + 12.5 * S + "px " + FF, color: INK + "bf", x: W / 2, y: y - 5 * S, align: "center" }); }); y += 6 * S; }
    }
    if (o.foot !== false) { y += 6 * S; ops.push({ t: o.foot || "حملة الإشراق", font: "700 " + 13 * S + "px " + FF, color: "#7a5a14", x: W / 2, y: y + 14 * S, align: "center" }); y += 26 * S; }
    y += 10 * S;
    var H = y;

    /* ---- الرسم ---- */
    var c = document.createElement("canvas"); c.width = W + 2 * M; c.height = H + 2 * M;
    var x = c.getContext("2d"); x.direction = "rtl"; x.textBaseline = "alphabetic";
    x.fillStyle = "#0b0b0c"; x.fillRect(0, 0, c.width, c.height);
    // ظلّ ذهبي ناعم تحت البطاقة
    x.save(); x.shadowColor = "rgba(207,159,82,.45)"; x.shadowBlur = 40 * S / 2; x.shadowOffsetY = 14 * S / 2; rr(x, M, M, W, H, R); x.fillStyle = "#c09a43"; x.fill(); x.restore();
    x.save(); x.translate(M, M); rr(x, 0, 0, W, H, R); x.clip();
    // تدرّج 160 درجة
    var a = 160 * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a), len = Math.abs(W * dx) + Math.abs(H * dy), cx = W / 2, cy = H / 2;
    var g = x.createLinearGradient(cx - dx * len / 2, cy - dy * len / 2, cx + dx * len / 2, cy + dy * len / 2);
    g.addColorStop(0, "#ecc977"); g.addColorStop(.6, "#d6ac52"); g.addColorStop(1, "#c09a43"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    var rg = x.createRadialGradient(W * 1.05, -20 * S, 0, W * 1.05, -20 * S, 320 * S); rg.addColorStop(0, "rgba(255,255,255,.42)"); rg.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = rg; x.fillRect(0, 0, W, H);
    // جسم عاجي
    x.fillStyle = CREAM; x.fillRect(0, bodyTop, W, H - bodyTop);
    // شعار شفاف بشكل فني (زاوية الجسم) + نسخة صغيرة أخرى
    if (lg) {
      var lw2 = W * .82, lh2 = lw2 * lg.height / lg.width;
      x.save(); x.beginPath(); x.rect(0, bodyTop, W, H - bodyTop); x.clip();
      x.globalAlpha = .12; x.drawImage(lg, -lw2 * .3, bodyTop + (H - bodyTop - lh2) / 2, lw2, lh2);
      x.restore();
    }
    ops.forEach(function (p) {
      if (p.t != null) { x.direction = p.ltr ? "ltr" : "rtl"; x.font = p.font; x.fillStyle = p.color; x.textAlign = p.align; x.fillText(p.t, p.x, p.y); x.direction = "rtl"; }
      else if (p.rule) { x.fillStyle = "rgba(122,90,20,.35)"; x.fillRect(PX, p.rule, MAXW, 2 * S / 1.5); }
      else if (p.qr) { x.fillStyle = "#fff"; rr(x, p.x - 10 * S, p.y - 10 * S, p.s + 20 * S, p.s + 20 * S, 18 * S); x.fill(); x.imageSmoothingEnabled = false; x.drawImage(p.qr, p.x, p.y, p.s, p.s); x.imageSmoothingEnabled = true; }
    });
    if (hasHead) { // خط التمزيق المنقّط + فتحتا التذكرة
      x.strokeStyle = "rgba(22,19,10,.33)"; x.lineWidth = 2 * S / 1.5; x.setLineDash([7 * S / 1.5, 5 * S / 1.5]); x.beginPath(); x.moveTo(18 * S, headH); x.lineTo(W - 18 * S, headH); x.stroke(); x.setLineDash([]);
      x.globalCompositeOperation = "destination-out"; x.beginPath(); x.arc(0, headH, 11 * S, 0, 7); x.arc(W, headH, 11 * S, 0, 7); x.fill(); x.globalCompositeOperation = "source-over";
      // الفتحتان تُظهران خلفية الصفحة
      x.fillStyle = "#0b0b0c"; x.beginPath(); x.arc(0, headH, 11 * S, 0, 7); x.fill(); x.beginPath(); x.arc(W, headH, 11 * S, 0, 7); x.fill();
    }
    x.restore();
    return c;
  }

  async function save(c, name) {
    var blob = await new Promise(function (r) { c.toBlob(r, "image/png"); });
    var file = new File([blob], name, { type: "image/png" });
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    try { if (typeof toast === "function") toast("تم حفظ الصورة"); } catch (e) {}
  }
  window.ixTicket = { draw: draw, save: save, loadImg: loadImg };
})();
