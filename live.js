(function () {
  // نفس رابط Apps Script المستعمل بحملة العمرة (يلزم إضافة كود live-apps-script.gs إليه)
  var API = "https://script.google.com/macros/s/AKfycbxBSrv8Rwlre9Vy3LQguKKwsOfpFSKYPpKd5HYlyoSJwijtF6cyGFm2nGnbva7bcceKLg/exec";
  var consent = false, watchId = null, lastSend = 0, id = fxGet("ix_live_id", null), poll = null, map = null, markers = {};
  if (!id) { id = "p" + Math.random().toString(36).slice(2, 10); fxSet("ix_live_id", id); }
  function call(params) {
    var q = Object.keys(params).map(function (k) { return k + "=" + encodeURIComponent(params[k]); }).join("&");
    return fetch(API + "?" + q).then(function (r) { return r.json(); });
  }
  $("#lv-name").value = fxGet("ix_live_name", "") || ""; $("#lv-code").value = fxGet("ix_live_code", "") || "";
  document.addEventListener("click", function (e) {
    var m = e.target.closest("[data-m]"); if (!m) return;
    $$("#lv-t .fx-tab").forEach(function (x) { x.classList.toggle("on", x === m); });
    $("#lv-p").style.display = m.dataset.m === "p" ? "" : "none"; $("#lv-s").style.display = m.dataset.m === "s" ? "" : "none";
  });
  $("#lv-consent").onclick = function () { consent = !consent; this.classList.toggle("on", consent); };
  function send(pos) {
    var now = Date.now(); if (now - lastSend < 20000) return; lastSend = now;
    call({ action: "live_update", code: $("#lv-code").value.trim().toUpperCase(), id: id, name: $("#lv-name").value.trim(), lat: pos.coords.latitude, lng: pos.coords.longitude, acc: Math.round(pos.coords.accuracy || 0) })
      .then(function (r) { $("#lv-st").textContent = r && r.ok ? "آخر إرسال: " + new Date().toLocaleTimeString("ar") + " ✓" : "تعذّر الإرسال: " + ((r && r.error) || "تأكد من الرمز"); })
      .catch(function () { $("#lv-st").textContent = "لا يوجد اتصال، سنعيد المحاولة."; });
  }
  function stop(silent) {
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    var c = $("#lv-code").value.trim().toUpperCase(); if (c) call({ action: "live_stop", code: c, id: id }).catch(function () {});
    $("#lv-start").style.display = ""; $("#lv-stop").style.display = "none"; if (!silent) $("#lv-st").textContent = "أُوقفت المشاركة وحُذف موقعك من الخادم.";
  }
  $("#lv-start").onclick = function () {
    var n = $("#lv-name").value.trim(), c = $("#lv-code").value.trim().toUpperCase();
    if (!n || !c) { $("#lv-st").textContent = "اكتب اسمك ورمز المجموعة."; return; }
    if (!consent) { $("#lv-st").textContent = "يلزم الموافقة على المشاركة أولاً."; return; }
    if (!navigator.geolocation) { $("#lv-st").textContent = "جهازك لا يدعم تحديد الموقع."; return; }
    fxSet("ix_live_name", n); fxSet("ix_live_code", c);
    watchId = navigator.geolocation.watchPosition(send, function (er) { $("#lv-st").textContent = er.code === 1 ? "رُفض إذن الموقع. فعّله من إعدادات المتصفح." : "تعذّر تحديد موقعك."; }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 });
    try { if (navigator.wakeLock) navigator.wakeLock.request("screen").catch(function () {}); } catch (x) {}
    $("#lv-start").style.display = "none"; $("#lv-stop").style.display = ""; $("#lv-st").textContent = "جارٍ تحديد موقعك...";
  };
  $("#lv-stop").onclick = function () { stop(); };
  window.addEventListener("pagehide", function () { if (watchId !== null) stop(true); });

  // ===== المشرف =====
  function ago(ts) { var s = Math.max(0, Math.round((Date.now() - ts) / 1000)); return s < 60 ? "الآن" : "منذ " + Math.round(s / 60) + " د"; }
  function loadLeaflet(cb) {
    if (window.L) return cb(); var s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"; s.onload = cb; document.head.appendChild(s);
  }
  function refresh() {
    call({ action: "live_list", code: $("#lv-scode").value.trim().toUpperCase(), key: $("#lv-skey").value }).then(function (r) {
      if (!r || !r.ok) { $("#lv-sst").textContent = (r && r.error) || "رمز أو مفتاح غير صحيح"; return; }
      var a = r.people || []; $("#lv-sst").textContent = a.length ? "يظهر الآن " + a.length + " معتمر — يتجدّد كل 15 ثانية" : "لا أحد يشارك موقعه حالياً.";
      $("#lv-list").innerHTML = a.map(function (p) { return '<div class="fx-who"><i class="bi bi-person-fill" style="color:var(--a)"></i><b>' + fxEsc(p.name || "—") + '</b><small>' + ago(p.ts) + '</small><a class="fx-btn o" style="padding:5px 10px" target="_blank" rel="noopener" href="https://www.google.com/maps?q=' + p.lat + "," + p.lng + '"><i class="bi bi-geo-alt"></i></a></div>'; }).join("");
      loadLeaflet(function () {
        var box = $("#fx-map"); box.style.display = "";
        if (!map) { map = L.map("fx-map").setView([21.4225, 39.8262], 14); L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map); }
        var seen = {}, pts = [];
        a.forEach(function (p) { seen[p.id] = 1; pts.push([p.lat, p.lng]); if (markers[p.id]) markers[p.id].setLatLng([p.lat, p.lng]); else markers[p.id] = L.marker([p.lat, p.lng]).addTo(map); markers[p.id].bindTooltip(p.name || "", { permanent: true, direction: "top" }); });
        Object.keys(markers).forEach(function (k) { if (!seen[k]) { map.removeLayer(markers[k]); delete markers[k]; } });
        if (pts.length && !map._fitted) { map.fitBounds(pts, { padding: [30, 30], maxZoom: 17 }); map._fitted = 1; }
        setTimeout(function () { map.invalidateSize(); }, 100);
      });
    }).catch(function () { $("#lv-sst").textContent = "تعذّر الاتصال."; });
  }
  $("#lv-watch").onclick = function () { clearInterval(poll); refresh(); poll = setInterval(refresh, 15000); };
})();
