/* إشراق — بطاقات المشاركة: تحويل آية/حديث/ذكر/اسم إلى صورة بهوية إشراق */
(function () {
  "use strict";
  var LOGO = "./5b862b4281f64fd884b11984846f0e97.png";
  var STYLES = {
    night: { n: "ليلي", bg1: "#26262a", bg2: "#0b0b0c", gold: "#d6ac52", gold2: "#ecd09a", ink: "#f6ecd2", mut: "#a9a69b", frame: "#d6ac52", orn: "#ecd09a" },
    ivory: { n: "عاجي", bg1: "#fffdf6", bg2: "#efe3c4", gold: "#a8782a", gold2: "#8a5f1c", ink: "#2a2114", mut: "#6f6350", frame: "#b98a3a", orn: "#a8782a" },
    gold: { n: "ذهبي", bg1: "#f3d890", bg2: "#b9852a", gold: "#2a1c05", gold2: "#2a1c05", ink: "#1c1405", mut: "#4a3410", frame: "#2a1c05", orn: "#2a1c05" }
  };
  var RATIOS = { post: { n: "منشور", w: 1080, h: 1350 }, story: { n: "ستوري", w: 1080, h: 1920 }, sq: { n: "مربع", w: 1080, h: 1080 } };
  var st = { text: "", ref: "", kind: "", title: "", style: "night", ratio: "post" };
  var logoImg = null, ov = null, cv = null;

  function loadLogo() {
    return new Promise(function (res) {
      if (logoImg) return res(logoImg);
      var i = new Image();
      i.onload = function () { logoImg = i; res(i); };
      i.onerror = function () { res(null); };
      i.src = LOGO;
    });
  }
  function fonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var p = Promise.all([
      document.fonts.load('400 40px "Amiri Quran"'), document.fonts.load('400 40px "Amiri"'),
      document.fonts.load('700 40px "Amiri"'), document.fonts.load('700 30px "Tajawal"'), document.fonts.load('700 30px "Reem Kufi"')
    ]).catch(function () {});
    return Promise.race([p, new Promise(function (r) { setTimeout(r, 1800); })]);
  }

  function wrap(ctx, text, maxW) {
    var words = String(text).replace(/\s+/g, " ").trim().split(" "), lines = [], cur = "";
    words.forEach(function (w) {
      var t = cur ? cur + " " + w : w;
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    });
    if (cur) lines.push(cur);
    return lines;
  }

  function petal(ctx, r) {
    ctx.beginPath(); ctx.moveTo(0, -r);
    ctx.bezierCurveTo(r * .15, -r * .72, r * .15, -r * .52, 0, -r * .34);
    ctx.bezierCurveTo(-r * .15, -r * .52, -r * .15, -r * .72, 0, -r);
    ctx.stroke();
  }
  function mandala(ctx, cx, cy, R, color, alpha) {
    ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R * .34, 0, 7); ctx.stroke();
    for (var i = 0; i < 16; i++) { ctx.save(); ctx.rotate(i * Math.PI / 8); petal(ctx, R * .96); ctx.restore(); }
    for (var j = 0; j < 8; j++) { ctx.save(); ctx.rotate(j * Math.PI / 4 + Math.PI / 8); petal(ctx, R * .6); ctx.restore(); }
    ctx.restore();
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function draw(canvas) {
    var S = STYLES[st.style], R = RATIOS[st.ratio], W = R.w, H = R.h;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");
    ctx.direction = "rtl"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var g = ctx.createRadialGradient(W / 2, H * .38, 60, W / 2, H * .45, Math.max(W, H) * .8);
    g.addColorStop(0, S.bg1); g.addColorStop(1, S.bg2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    mandala(ctx, W / 2, H / 2, Math.min(W, H) * .62, S.orn, st.style === "night" ? .07 : .09);
    // إطار مزدوج
    ctx.strokeStyle = S.frame; ctx.lineWidth = 3; ctx.globalAlpha = .9; rr(ctx, 40, 40, W - 80, H - 80, 36); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.globalAlpha = .5; rr(ctx, 58, 58, W - 116, H - 116, 26); ctx.stroke(); ctx.globalAlpha = 1;

    var y = 150;
    if (logoImg) {
      var lw = 190, lh = lw * logoImg.height / logoImg.width;
      if (st.style === "gold") { ctx.globalAlpha = .9; }
      ctx.drawImage(logoImg, W / 2 - lw / 2, y - 40, lw, lh); ctx.globalAlpha = 1; y += lh;
    } else { ctx.fillStyle = S.gold2; ctx.font = '700 70px "Reem Kufi",Cairo,sans-serif'; ctx.fillText("إشراق", W / 2, y + 20); y += 90; }

    // وسم النوع
    if (st.kind) {
      ctx.font = '700 34px "Tajawal",Cairo,sans-serif';
      var kw = ctx.measureText(st.kind).width + 70;
      ctx.fillStyle = S.gold; ctx.globalAlpha = .16; rr(ctx, W / 2 - kw / 2, y + 22, kw, 62, 31); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = S.gold2; ctx.fillText(st.kind, W / 2, y + 54);
      y += 110;
    } else y += 30;
    ctx.fillStyle = S.orn; ctx.font = '40px "Amiri",serif'; ctx.globalAlpha = .9; ctx.fillText("۞", W / 2, y + 12); ctx.globalAlpha = 1; y += 60;

    if (st.title) {
      ctx.fillStyle = S.gold2; ctx.font = '500 ' + (st.title.length > 12 ? 96 : 140) + 'px "Reem Kufi","Amiri",serif';
      ctx.fillText(st.title, W / 2, y + 70); y += 190;
    }
    // الجسم: نضبط حجم الخط ليتسع
    var fam = '"Amiri Quran","Amiri",serif';
    var footH = 300, boxTop = y, boxH = H - footH - boxTop, maxW = W - 230, size = 78, lines;
    for (; size >= 30; size -= 2) {
      ctx.font = "400 " + size + "px " + fam;
      lines = wrap(ctx, st.text, maxW);
      if (lines.length * size * 1.85 <= boxH) break;
    }
    var lh2 = size * 1.85, total = lines.length * lh2, ty = boxTop + (boxH - total) / 2 + lh2 / 2;
    ctx.fillStyle = S.ink;
    lines.forEach(function (l, i) { ctx.fillText(l, W / 2, ty + i * lh2); });

    // المصدر
    var fy = H - footH + 70;
    if (st.ref) {
      ctx.fillStyle = S.gold2; ctx.font = '700 40px "Tajawal",Cairo,sans-serif';
      var refLines = wrap(ctx, st.ref, maxW);
      refLines.slice(0, 2).forEach(function (l, i) { ctx.fillText(l, W / 2, fy + i * 54); });
    }
    ctx.fillStyle = S.mut; ctx.font = '400 30px "Tajawal",Cairo,sans-serif';
    ctx.fillText("نُشرِقُ بروحِك.. ونَسمو بقلبِك", W / 2, H - 150);
    ctx.fillStyle = S.gold; ctx.font = '700 32px "Reem Kufi",Cairo,sans-serif'; ctx.fillText("تطبيق إشراق", W / 2, H - 105);
  }

  function css() {
    if (document.getElementById("ixcard-css")) return;
    var s = document.createElement("style"); s.id = "ixcard-css";
    s.textContent =
      "#ixcard{position:fixed;inset:0;z-index:5000;background:#000c;display:none;align-items:flex-end;justify-content:center;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}" +
      "#ixcard.on{display:flex}" +
      "#ixcard .sh{width:min(560px,100%);max-height:94vh;overflow:auto;background:#121214;border:1px solid #d6ac5255;border-bottom:0;border-radius:28px 28px 0 0;padding:14px 16px calc(18px + env(safe-area-inset-bottom,0px));color:#f1efe9;font-family:Tajawal,Cairo,sans-serif;direction:rtl}" +
      "#ixcard .gr{width:44px;height:5px;border-radius:9px;background:#3a3b40;margin:0 auto 10px}" +
      "#ixcard .hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}#ixcard .hd b{color:#edcea0;font-size:1.05rem}" +
      "#ixcard .x{width:38px;height:38px;border-radius:12px;border:1px solid #2b2d31;background:#17181a;color:#f1efe9}" +
      "#ixcard .pv{display:grid;place-items:center;background:#0b0b0c;border-radius:18px;padding:10px;border:1px solid #232428}" +
      "#ixcard canvas{max-width:100%;max-height:52vh;border-radius:12px;box-shadow:0 10px 30px #000a}" +
      "#ixcard .rw{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;align-items:center}#ixcard .rw small{color:#8f9197;min-width:48px}" +
      "#ixcard .ch{padding:7px 16px;border-radius:999px;border:1px solid #2b2d31;background:#17181a;color:#c9c6bb;font-size:.88rem}" +
      "#ixcard .ch.on{background:linear-gradient(135deg,#ecd09a,#cf9f52);color:#1c1405;border-color:transparent;font-weight:700}" +
      "#ixcard .acts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}" +
      "#ixcard .btn1{padding:13px;border-radius:16px;border:0;font-weight:800;font-size:1rem;background:linear-gradient(135deg,#ecd09a,#cf9f52);color:#1c1405}" +
      "#ixcard .btn2{padding:13px;border-radius:16px;border:1px solid #d6ac5288;background:transparent;color:#edcea0;font-weight:700;font-size:1rem}";
    document.head.appendChild(s);
  }

  function build() {
    if (ov) return;
    css();
    ov = document.createElement("div"); ov.id = "ixcard"; ov.setAttribute("aria-hidden", "true");
    var sc = Object.keys(STYLES).map(function (k) { return '<button type="button" class="ch" data-s="' + k + '">' + STYLES[k].n + "</button>"; }).join("");
    var rc = Object.keys(RATIOS).map(function (k) { return '<button type="button" class="ch" data-r="' + k + '">' + RATIOS[k].n + "</button>"; }).join("");
    ov.innerHTML = '<div class="sh" role="dialog" aria-label="بطاقة مشاركة"><div class="gr"></div>' +
      '<div class="hd"><b>بطاقة المشاركة</b><button class="x" type="button" aria-label="إغلاق"><i class="bi bi-x-lg"></i></button></div>' +
      '<div class="pv"><canvas></canvas></div>' +
      '<div class="rw"><small>النمط</small>' + sc + '</div><div class="rw"><small>المقاس</small>' + rc + "</div>" +
      '<div class="acts"><button class="btn1" type="button" data-a="share"><i class="bi bi-share-fill"></i> مشاركة</button><button class="btn2" type="button" data-a="save"><i class="bi bi-download"></i> حفظ الصورة</button></div></div>';
    document.body.appendChild(ov);
    cv = ov.querySelector("canvas");
    ov.addEventListener("click", function (e) {
      if (e.target === ov || e.target.closest(".x")) return close();
      var s = e.target.closest("[data-s]"), r = e.target.closest("[data-r]"), a = e.target.closest("[data-a]");
      if (s) { st.style = s.dataset.s; try { localStorage.setItem("ixcard_style", st.style); } catch (x) {} render(); }
      if (r) { st.ratio = r.dataset.r; try { localStorage.setItem("ixcard_ratio", st.ratio); } catch (x) {} render(); }
      if (a) out(a.dataset.a);
    });
  }
  function render() {
    ov.querySelectorAll("[data-s]").forEach(function (b) { b.classList.toggle("on", b.dataset.s === st.style); });
    ov.querySelectorAll("[data-r]").forEach(function (b) { b.classList.toggle("on", b.dataset.r === st.ratio); });
    draw(cv);
  }
  function close() { ov.classList.remove("on"); ov.setAttribute("aria-hidden", "true"); document.documentElement.style.overflow = ""; }
  function out(mode) {
    cv.toBlob(function (blob) {
      if (!blob) return;
      var file; try { file = new File([blob], "ishraq-card.png", { type: "image/png" }); } catch (e) {}
      if (mode === "share" && file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], text: st.text + (st.ref ? "\n" + st.ref : "") + "\n\nمن تطبيق إشراق" }).catch(function () {});
        return;
      }
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "ishraq-card.png";
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }, "image/png");
  }

  function open(o) {
    o = o || {};
    st.text = String(o.text || "").replace(/\s+/g, " ").trim();
    st.ref = o.ref || ""; st.kind = o.kind || ""; st.title = o.title || "";
    if (!st.text && !st.title) return;
    try { st.style = localStorage.getItem("ixcard_style") || st.style; st.ratio = localStorage.getItem("ixcard_ratio") || st.ratio; } catch (e) {}
    if (!STYLES[st.style]) st.style = "night"; if (!RATIOS[st.ratio]) st.ratio = "post";
    build();
    ov.classList.add("on"); ov.setAttribute("aria-hidden", "false"); document.documentElement.style.overflow = "hidden";
    Promise.all([fonts(), loadLogo()]).then(render);
    try { if (navigator.vibrate) navigator.vibrate(10); } catch (e) {}
  }

  window.ixCard = { open: open };
  // من عنصر نصّي في الصفحة: ixCardFrom('quran') يقرأ #quran-text و #quran-ref
  window.ixCardFrom = function (k, kind) {
    var t = document.getElementById(k + "-text"), r = document.getElementById(k + "-ref");
    open({ text: t ? t.textContent : "", ref: r ? r.textContent : "", kind: kind || (k === "quran" ? "آية" : "حديث") });
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ixcard]");
    if (!b) return;
    e.preventDefault();
    open({ text: b.dataset.text, ref: b.dataset.ref, kind: b.dataset.kind });
  });
})();
