/* إشراق · حارس الصفحات: لا تُعرض أي صفحة لغير المسجَّل دخوله (Firebase Auth).
   تُستثنى صفحات الحجز والمعتمر (umrah) وتسجيل الدخول. يُحمَّل أول شيء في <head>.
   - إن كان الجهاز دخل سابقًا نعرض الصفحة فورًا ونتحقق بالخلفية (بلا وميض، ويعمل بدون إنترنت).
   - وإلا تُخفى الصفحة حتى يتأكد الدخول، وإلا نحوّل إلى login.html?next=هذه_الصفحة. */
(function () {
  var KEY = "ix_authed", V = "12.5.0";
  var CFG = { apiKey: "AIzaSyD3RQ2jrXcJOUqmhUrGuBQ6R8kZ2sSLOr0", authDomain: "alishraq-fe305.firebaseapp.com", projectId: "alishraq-fe305", storageBucket: "alishraq-fe305.firebasestorage.app", messagingSenderId: "816905605188", appId: "1:816905605188:web:639252ce9ef899bd622c11", measurementId: "G-X6NV8MT549" };
  var page = (location.pathname.split("/").pop() || "index.html") + location.search + location.hash, seen = false;
  try { seen = localStorage.getItem(KEY) === "1"; } catch (e) {}
  var st = null;
  if (!seen) { st = document.createElement("style"); st.textContent = "html{visibility:hidden!important}"; (document.head || document.documentElement).appendChild(st); }
  function reveal() { if (st && st.parentNode) st.parentNode.removeChild(st); st = null; }
  function deny() { try { localStorage.removeItem(KEY); } catch (e) {} location.replace("./login.html?next=" + encodeURIComponent(page)); }
  Promise.all([import("https://www.gstatic.com/firebasejs/" + V + "/firebase-app.js"), import("https://www.gstatic.com/firebasejs/" + V + "/firebase-auth.js")]).then(function (m) {
    var app; try { app = m[0].getApp(); } catch (e) { app = m[0].initializeApp(CFG); }
    m[1].onAuthStateChanged(m[1].getAuth(app), function (u) {
      if (u) { try { localStorage.setItem(KEY, "1"); } catch (e) {} reveal(); } else deny();
    });
  }).catch(function () { if (seen) reveal(); else deny(); }); // بلا إنترنت: نثق بآخر دخول ناجح على هذا الجهاز
})();
