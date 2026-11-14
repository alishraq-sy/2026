/* إشراق · قائمة «المزيد» المشتركة + تسجيل الخروج */
(function () {
  if (!document.body.classList.contains("app")) return;
  var more = document.createElement("div");
  more.id = "ix-more";
  more.setAttribute("aria-hidden", "true");
  more.innerHTML =
    '<div class="sheet" role="dialog" aria-label="المزيد">' +
      '<div class="grab"></div>' +
      '<div class="m-h"><b>المزيد</b><button class="m-x" id="ix-more-x" type="button" aria-label="إغلاق"><i class="bi bi-x-lg"></i></button></div>' +
      '<a class="m-umrah" href="./umrah.html">' +
        '<img class="bg" src="./ibrahim-photo.png" alt="" />' +
        '<span class="bd">حملة الإشراق للعمرة</span>' +
        '<h3>أهلًا بمعتمري حملة الإشراق</h3>' +
        '<p>بطاقتك الخاصة، برنامج الرحلة، تقييمك واستفساراتك، كلها بمكان واحد.</p>' +
        '<span class="go">ادخل إلى رحلتك <i class="bi bi-arrow-left"></i></span>' +
        '<span class="si" data-href="./Ibrahim-alamary-main/index.html">احجز مقعدك الآن</span>' +
      '</a>' +
      '<div class="m-list">' +
        '<a class="m-row" style="--ac:#6aa8f0" href="./search.html"><i class="bi bi-search"></i>بحث شامل<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#4fb99f" href="./calendar.html"><i class="bi bi-calendar3"></i>التقويم الهجري<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#c98a5a" href="./hadith.html"><i class="bi bi-journal-text"></i>الحديث<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#7b86e0" href="./azkar.html"><i class="bi bi-moon-stars-fill"></i>الأذكار<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#e0a23a" href="./ramadan.html"><i class="bi bi-moon-stars"></i>رمضان<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#d6ac52" href="./asma.html"><i class="bi bi-stars"></i>أسماء الله الحسنى<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#e0a23a" href="./khatma.html"><i class="bi bi-flag-fill"></i>الختمة الذكية<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#4fb99f" href="./ibadat.html"><i class="bi bi-check2-square"></i>متتبع العبادات<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#d6ac52" href="./zakat.html"><i class="bi bi-calculator-fill"></i>حاسبة الزكاة<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#e07a9a" href="./challenge.html"><i class="bi bi-patch-question-fill"></i>التحدي اليومي<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#9aa0aa" href="./themes.html"><i class="bi bi-palette-fill"></i>المظهر والألوان<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#e0a23a" href="./awrad.html"><i class="bi bi-book-half"></i>الأوراد<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#e07a9a" href="./adiya.html"><i class="bi bi-chat-heart"></i>الأدعية<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#d6ac52" href="./favorites.html"><i class="bi bi-star-fill"></i>المفضلة<span class="ch bi bi-chevron-left"></span></a>' +
        '<a class="m-row" style="--ac:#9aa0aa" href="./settings.html"><i class="bi bi-gear-fill"></i>الإعدادات<span class="ch bi bi-chevron-left"></span></a>' +
        '<button class="m-row out" id="ix-more-logout" type="button"><i class="bi bi-box-arrow-right"></i>تسجيل الخروج</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(more);

  // رابط «احجز مقعدك الآن» داخل بطاقة هي نفسها رابط: نتعامل معه يدوياً
  var si = more.querySelector(".si");
  si.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); location.href = si.getAttribute("data-href"); });

  // زر الرجوع: يرجع للصفحة السابقة إذا كانت من الموقع نفسه
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ix-back]");
    if (b && history.length > 1 && document.referrer && document.referrer.indexOf(location.host) > -1) { e.preventDefault(); history.back(); }
  });
  // اهتزاز خفيف عند اللمس (إن كان مدعوماً)
  document.addEventListener("click", function (e) {
    if (e.target.closest(".nav-item-bottom,.ix-tile,.m-row,.app-bar .ab")) { try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) {} }
  }, true);
  function open(e) { if (e) e.preventDefault(); more.classList.add("on"); more.setAttribute("aria-hidden", "false"); }
  function close() { more.classList.remove("on"); more.setAttribute("aria-hidden", "true"); }
  document.addEventListener("click", function (e) { if (e.target.closest("[data-ix-more]")) open(e); });
  more.addEventListener("click", function (e) { if (e.target === more) close(); });
  document.getElementById("ix-more-x").addEventListener("click", close);
  addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  document.getElementById("ix-more-logout").addEventListener("click", function () {
    var go = function () { location.replace("./login.html"); };
    Promise.all([
      import("https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js")
    ]).then(function (m) {
      var app = m[0].getApps().length ? m[0].getApp() : m[0].initializeApp({
        apiKey: "AIzaSyD3RQ2jrXcJOUqmhUrGuBQ6R8kZ2sSLOr0", authDomain: "alishraq-fe305.firebaseapp.com", projectId: "alishraq-fe305",
        storageBucket: "alishraq-fe305.firebasestorage.app", messagingSenderId: "816905605188", appId: "1:816905605188:web:639252ce9ef899bd622c11"
      });
      return m[1].signOut(m[1].getAuth(app));
    }).then(go).catch(function (err) { console.error("Logout error:", err); go(); });
  });
})();
