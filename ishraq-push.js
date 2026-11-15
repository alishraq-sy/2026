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
    if (opt && opt.umrah) { b.umrah = 1; b.code = opt.umrah.code; b.dev = opt.umrah.dev; }
    var r = await post(b); if (!r.ok) throw new Error("server");
    ls(TK, tok); return r;
  }
  async function disable() {
    var t = ls(TK); ls(TK, null);
    if (t) { try { await post({ action: "push_off", token: t }); } catch (e) {} }
  }
  // يُستدعى بعد دخول المعتمر: يضيف الوسم إن كانت الإشعارات مفعّلة أصلًا
  function tagUmrah(code, dev) {
    var t = ls(TK); if (!t || permission() !== "granted") return;
    var k = "ix_push_tag_" + code; if (ls(k)) return;
    post({ action: "push_reg", token: t, umrah: 1, code: code, dev: dev }).then(function (r) { if (r && r.ok) ls(k, "1"); }).catch(function () {});
  }
  window.ixPush = { supported: supported, permission: permission, on: on, enable: enable, disable: disable, tagUmrah: tagUmrah };
})();
