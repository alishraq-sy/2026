/* إشراق · إشعارات حقيقية عبر Firebase Cloud Messaging
   ixPush.supported() · ixPush.permission() · ixPush.on() · ixPush.enable({umrah:{code,dev}}) · ixPush.disable() */
(function () {
  var API = "https://script.google.com/macros/s/AKfycbxBSrv8Rwlre9Vy3LQguKKwsOfpFSKYPpKd5HYlyoSJwijtF6cyGFm2nGnbva7bcceKLg/exec";
  var VAPID = "BJbW2pdm_HXzDkdr3VL6N412zCoybT3oC9b7JLXkSDhVeiurYRP1qLHTAluJNLeKucnJG52PpaMkAeTOOhO5CPY";
  var CFG = { apiKey: "AIzaSyD3RQ2jrXcJOUqmhUrGuBQ6R8kZ2sSLOr0", authDomain: "alishraq-fe305.firebaseapp.com", projectId: "alishraq-fe305", storageBucket: "alishraq-fe305.firebasestorage.app", messagingSenderId: "816905605188", appId: "1:816905605188:web:639252ce9ef899bd622c11" };
  var V = "12.5.0", TK = "ix_push_tok";
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function post(b) { return fetch(API, { method: "POST", body: JSON.stringify(b) }).then(function (r) { return r.json(); }); }
  function supported() { return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window; }
  function permission() { return supported() ? Notification.permission : "unsupported"; }
  function on() { return supported() && Notification.permission === "granted" && !!ls(TK); }

  async function getTok() {
    var A = await import("https://www.gstatic.com/firebasejs/" + V + "/firebase-app.js");
    var M = await import("https://www.gstatic.com/firebasejs/" + V + "/firebase-messaging.js");
    var app = A.getApps().filter(function (a) { return a.name === "push"; })[0] || A.initializeApp(CFG, "push");
    var reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register("./sw.js")); await navigator.serviceWorker.ready;
    return M.getToken(M.getMessaging(app), { vapidKey: VAPID, serviceWorkerRegistration: reg });
  }
  // umrah: {code, dev} لإضافة وسم معتمري الحملة (يتحقق الخادم من الرمز)
  async function enable(opt) {
    if (!supported()) throw new Error("unsupported");
    var perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error("denied");
    var tok = await getTok(); if (!tok) throw new Error("no-token");
    var b = { action: "push_reg", token: tok };
    var um = (opt && opt.umrah) || jget("ix_push_umr", null);
    if (um && um.code) { b.umrah = 1; b.code = um.code; b.dev = um.dev; ls("ix_push_umr", JSON.stringify({ code: um.code, dev: um.dev })); }
    var r = await post(b); if (!r.ok) throw new Error("server");
    if (um && r.tags && r.tags.indexOf("umrah") >= 0) ls("ix_push_tag_" + um.code, tok);
    ls(TK, tok); if (prefs().length) { try { await sync(true); } catch (e) {} } return r;
  }
  async function disable() {
    var t = ls(TK); ls(TK, null); ls(PK, null); ls(SIG, null);
    if (t) { try { await post({ action: "push_off", token: t }); } catch (e) {} }
  }
  // يُستدعى بعد دخول المعتمر: يضيف وسم المعتمرين لهذا الجهاز (يُعاد إن تغيّر التوكن أو حُذف الصف أو رفض الخادم سابقًا)
  function tagUmrah(code, dev) {
    ls("ix_push_umr", JSON.stringify({ code: code, dev: dev }));
    var t = ls(TK); if (!t || permission() !== "granted") return;
    var k = "ix_push_tag_" + code; if (ls(k) === t) return;
    post({ action: "push_reg", token: t, umrah: 1, code: code, dev: dev }).then(function (r) { if (r && r.ok && r.tags && r.tags.indexOf("umrah") >= 0) ls(k, t); }).catch(function () {});
  }
  /* ===== تنبيهات الصلاة والأذكار المجدولة من الخادم =====
     المفاتيح: ad أذان · pre قبل الصلاة بـ10د · fast صيام الاثنين والخميس · am/pm/sl أذكار · sal صلاة على النبي · kahf الكهف */
  var PK = "ix_push_prefs", SIG = "ix_push_sig";
  var CITY = { damascus: [33.5138, 36.2765], aleppo: [36.2021, 37.1343], homs: [34.7324, 36.7137], hama: [35.1318, 36.7578], latakia: [35.5317, 35.7915], tartus: [34.8890, 35.8866], idlib: [35.9306, 36.6339], raqqa: [35.9528, 39.0079], deir: [35.3359, 40.1408], hasakah: [36.5024, 40.7477], daraa: [32.6189, 36.1021], suwayda: [32.7090, 36.5663], makkah: [21.4225, 39.8262], madinah: [24.4672, 39.6111] };
  function jget(k, d) { try { return JSON.parse(ls(k)) || d; } catch (e) { return d; } }
  function prefs() { var o = jget(PK, {}), a = []; for (var k in o) if (o[k]) a.push(k); return a; }
  function pref(k) { return !!jget(PK, {})[k]; }
  function setPref(k, v) { var o = jget(PK, {}); if (v) o[k] = 1; else delete o[k]; ls(PK, JSON.stringify(o)); }
  function geo() { return new Promise(function (res) { if (!navigator.geolocation) return res(null); navigator.geolocation.getCurrentPosition(function (p) { res([p.coords.latitude, p.coords.longitude]); }, function () { res(null); }, { timeout: 8000, maximumAge: 3600000 }); }); }
  // الموقع: مدينة مختارة ← آخر مواقيت جُلبت ← GPS ← دمشق
  async function place() {
    var city = ls("eshraq_prayer_city") || "auto", c = CITY[city];
    if (c) return { lat: c[0], lng: c[1] };
    try { var raw = JSON.parse(ls("eshraq_prayer_raw")); var k = String(raw.key).split(","); if (isFinite(+k[0]) && isFinite(+k[1])) return { lat: +k[0], lng: +k[1] }; } catch (e) {}
    var g = await geo(); if (g) return { lat: Math.round(g[0] * 100) / 100, lng: Math.round(g[1] * 100) / 100 };
    return { lat: 33.51, lng: 36.28, approx: true };
  }
  function cfg() {
    var tz = "Asia/Damascus"; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || tz; } catch (e) {}
    return { tz: tz, method: ls("eshraq_prayer_method") || "auto", school: ls("eshraq_prayer_school") || "0", tune: jget("eshraq_prayer_tune", {}), city: ls("eshraq_prayer_city") || "auto" };
  }
  function sig(p) { var c = cfg(); return JSON.stringify([prefs(), c, p && p.lat, p && p.lng, (jget("ix_push_umr", null) || {}).code]); }
  // يرسل الموقع والتفضيلات للخادم (force=true للإرسال دائمًا)
  async function sync(force) {
    var t = ls(TK); if (!t || permission() !== "granted") return null;
    var p = await place(), s = sig(p);
    if (!force && ls(SIG) === s) return { ok: true, same: 1 };
    var c = cfg(), q = { action: "push_prefs", token: t, lat: p.lat, lng: p.lng, tz: c.tz, method: c.method, school: c.school, tune: c.tune, prefs: prefs() };
    var um = jget("ix_push_umr", null); if (um && um.code) { q.umrah = 1; q.code = um.code; q.dev = um.dev; }
    var r = await post(q);
    if (r && r.ok) ls(SIG, s);
    return { ok: !!(r && r.ok), approx: !!p.approx };
  }
  function autoSync() {
    if (!on()) return;
    var go = function () { sync().catch(function () {}); };
    setTimeout(go, 4000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) go(); });
    if (document.getElementById("serverPushToggle")) setInterval(function () { if (!document.hidden) go(); }, 5000); // صفحة الإعدادات: التقط تغيير المدينة/الطريقة فورًا
  }
  if (document.readyState !== "loading") autoSync(); else document.addEventListener("DOMContentLoaded", autoSync);
  // أول زيارة بعد تسجيل الدخول: بعد 30 ثانية نعرض نافذة لتفعيل كل الإشعارات (مرة واحدة فقط لكل جهاز)
  var ALL = ["ad", "pre", "fast", "am", "pm", "sl", "sal", "kahf"];
  async function enableAll() {
    if (!on()) await enable();
    ALL.forEach(function (k) { setPref(k, true); });
    return sync(true);
  }
  function firstPrompt() {
    if (!document.getElementById("p-fajr") || !window.ixNotice) return; // الرئيسية فقط
    if (ls("ix_authed") !== "1" || ls("ix_push_prompted") || !supported() || permission() === "denied" || on()) return;
    setTimeout(function () {
      if (ls("ix_push_prompted") || on() || permission() === "denied") return;
      ls("ix_push_prompted", "1");
      window.ixNotice({ title: "فعّل إشعارات إشراق", icon: "bi-bell-fill", msg: "لتصلك تنبيهات الأذان، وقبل الصلاة بعشر دقائق، وأذكار الصباح والمساء والنوم، والصلاة على النبي ﷺ، وصيام الاثنين والخميس، وسورة الكهف — حتى والتطبيق مغلق.\nيمكنك تعديلها أو إيقافها من الإعدادات.", btns: [{ t: "ليس الآن", v: false }, { t: "تفعيل كل الإشعارات", v: true, c: "p" }] }).then(function (v) {
        if (!v) return;
        enableAll().then(function () { window.alert("تم تفعيل كل الإشعارات ✅"); }).catch(function (e) { window.alert(e && e.message === "denied" ? "لم يُسمح بالإشعارات. فعّلها من إعدادات المتصفح لهذا الموقع." : "تعذّر التفعيل الآن، يمكنك التفعيل لاحقًا من الإعدادات."); });
      });
    }, 30000);
  }
  if (document.readyState !== "loading") firstPrompt(); else document.addEventListener("DOMContentLoaded", firstPrompt);
  window.ixPush = { supported: supported, permission: permission, on: on, enable: enable, disable: disable, tagUmrah: tagUmrah, prefs: prefs, pref: pref, setPref: setPref, sync: sync, enableAll: enableAll };
})();
