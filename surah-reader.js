document.addEventListener("DOMContentLoaded", () => {

  const ayahsContainer = document.getElementById("ayahs-container");

  const surahTopTitle = document.getElementById("surah-top-title");

  const toggleLayoutBtn = document.getElementById("toggle-layout-btn");

  const fontIncreaseBtn = document.getElementById("font-increase-btn");

  const fontDecreaseBtn = document.getElementById("font-decrease-btn");

  const fontSizeIndicator = document.getElementById("font-size-indicator");

  const toggleFontFamilyBtn = document.getElementById("toggle-font-family-btn");

  const focusModeBtn = document.getElementById("focus-mode-btn");



  const urlParams = new URLSearchParams(window.location.search);

  const surahNumber = urlParams.get("surah") || 1;



  let currentSurahName = "";

  let ayahsList = [];

  let hasAutoScrolled = false;



  // حالة العرض وحجم الخط ونوع الخط المحفوظة بالذاكرة المحلية

  let isMushafMode = localStorage.getItem("eshraq_mushaf_mode") === "true";

  let currentFontSize = parseFloat(localStorage.getItem("eshraq_font_size")) || 1.6;

  let isUthmaniFont = localStorage.getItem("eshraq_font_family") === "uthmani";

  let isFocusMode = localStorage.getItem("eshraq_focus_mode") === "true";



  function getFontFamilyCss() {

    return isUthmaniFont

      ? "'Amiri Quran', 'Traditional Arabic', serif"

      : "'Amiri', 'Traditional Arabic', serif";

  }



  function updateFontIndicator() {

    if (fontSizeIndicator) {

      fontSizeIndicator.textContent = Math.round((currentFontSize / 1.6) * 100) + "%";

    }

  }



  function updateFontFamilyButtonText() {

    if (toggleFontFamilyBtn) {

      toggleFontFamilyBtn.innerHTML = isUthmaniFont

        ? `<i class="bi bi-fonts"></i> الخط العادي`

        : `<i class="bi bi-fonts"></i> الرسم العثماني`;

    }

  }



  function updateFocusModeButton() {

    if (focusModeBtn) {

      focusModeBtn.innerHTML = isFocusMode

        ? `<i class="bi bi-fullscreen-exit"></i>`

        : `<i class="bi bi-arrows-fullscreen"></i>`;

    }

    document.body.classList.toggle("focus-reading-mode", isFocusMode);

  }



  updateToggleButtonText();

  updateFontIndicator();

  updateFontFamilyButtonText();

  updateFocusModeButton();



  // ===== تسجيل آخر 5 سور تمت قراءتها (لعرضها بصفحة فهرس القرآن) =====
  function recordRecentSurah(number, name) {
    let recent = JSON.parse(localStorage.getItem("eshraq_recent_surahs")) || [];
    recent = recent.filter(r => r.number != number); // إزالة التكرار إن وجد
    recent.unshift({ number, name });
    recent = recent.slice(0, 5);
    localStorage.setItem("eshraq_recent_surahs", JSON.stringify(recent));
  }

  // ===== تتبع الختمة: تسجيل الآية كمقروءة (لمرة واحدة فقط لكل آية) =====
  function markAyahAsRead(surahNum, ayahNum) {
    const key = `${surahNum}:${ayahNum}`;
    let readAyahs = JSON.parse(localStorage.getItem("eshraq_read_ayahs")) || [];
    if (readAyahs.includes(key)) return; // مُسجّلة سابقاً، لا نكررها بالإحصائية

    readAyahs.push(key);
    localStorage.setItem("eshraq_read_ayahs", JSON.stringify(readAyahs));

    const monthKey = new Date().toISOString().slice(0, 7);
    let monthlyLog = JSON.parse(localStorage.getItem("eshraq_monthly_read_log")) || {};
    monthlyLog[monthKey] = (monthlyLog[monthKey] || 0) + 1;
    localStorage.setItem("eshraq_monthly_read_log", JSON.stringify(monthlyLog));
  }

  // ===== الرابط المباشر لآية معينة (?ayah=N) =====
  function handleDeepLinkAyah() {
    const targetAyah = urlParams.get("ayah");
    if (!targetAyah) return;
    setTimeout(() => {
      const target = document.querySelector(`[data-ayahnum="${targetAyah}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("active-ayah");
        setTimeout(() => target.classList.remove("active-ayah"), 3000);
      }
      hasAutoScrolled = true; // نمنع السكرول التلقائي لآخر موضع محفوظ من مزاحمة هذا الرابط المباشر
    }, 300);
  }

  async function fetchSurahData() {

    try {

      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);

      const data = await response.json();

     

      if (data.code === 200) {

        const surah = data.data;

        currentSurahName = surah.name;

        ayahsList = surah.ayahs;

       

        if (surahTopTitle) {

          surahTopTitle.textContent = `${surah.name} (${surah.englishName})`;

        }

       

        renderAyahs();

        localStorage.setItem("eshraq_last_surah", JSON.stringify({ number: surahNumber, name: surah.name }));

        recordRecentSurah(surahNumber, surah.name);
        handleDeepLinkAyah();

       

        // حفظ موضع القراءة تلقائياً عند فتح السورة

        saveReadingProgress(surahNumber, surah.name, 1);



      } else {

        ayahsContainer.innerHTML = `<div class="text-center text-danger py-4">تعذر جلب الآيات.</div>`;

      }

    } catch (error) {

      console.error("Error fetching surah:", error);

      ayahsContainer.innerHTML = `<div class="text-center text-danger py-4">تحقق من اتصالك بالإنترنت.</div>`;

    }

  }



  
function getCleanAyahText(ayah, index) {
    let text = ayah.text || "";

    // 1. سورة الفاتحة (1): الآية الأولى هي البسملة نفسها، نتركها كما هي
    if (surahNumber === 1 && index === 0) {
        return text;
    }

    // 2. سورة التوبة (9): لا تحتوي على بسملة، نترك النص كما هو
    if (surahNumber === 9) {
        return text;
    }

    // 3. لبقية السور، إذا كانت الآية الأولى
    if (index === 0) {
        // نقوم بإزالة أي تشكيل أو رموز عثمانية لتحويل النص إلى شكل قياسي نظيف للفحص
        // أو نقوم بحذف الكلمات الأربع الأولى مباشرة إذا كانت تبدأ بالبسملة
        let words = text.trim().split(/\s+/);
        
        // التحقق مما إذا كانت الكلمات الأولى تمثل البسملة (بناءً على أول حرفين أو شكل الكلمة)
        if (words.length > 4) {
          
            // نتحقق من الكلمة الأولى إذا كانت تبدأ بـ "بسم" أو "بِسْم" أو "بِسۡمِ"
            let firstWord = words[0];
            if (firstWord.includes("بسم") || firstWord.includes("بِسْم") || firstWord.includes("بِسۡمِ")) {
                // غالباً البسملة تتكون من 4 كلمات (بسم الله الرحمن الرحيم)
                // نحذف اول 4 كلمات ونعيد دمج ما تبقى
                words = words.slice(4);
                text = words.join(" ");
            }
        }
    }

    return text;
}



  function renderAyahs() {

    if (isMushafMode) {

      renderMushafLayout();

    } else {

      renderStandardLayout();

    }

  }



  // الشكل الأول: القائمة العادية

  function renderStandardLayout() {

    if (!ayahsContainer) return;

   

    ayahsContainer.innerHTML = ayahsList.map((ayah, index) => {

      const text = getCleanAyahText(ayah, index);

      return `

        <div class="ayah-item mb-4 pb-3 border-bottom border-gold-subtle position-relative text-center" data-ayahnum="${ayah.numberInSurah}">

          <p class="ayah-text mb-3" style="font-size: ${currentFontSize}rem !important; line-height: 2.2; font-family: ${getFontFamilyCss()};">

            ${text} <span class="badge rounded-pill border border-gold text-gold ms-2" style="border-color: #edcea0 !important; color: #edcea0; font-family: 'Tajawal', sans-serif; font-size: 1rem;">(${ayah.numberInSurah})</span>

          </p>

          <div class="d-flex justify-content-start gap-2">

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 copy-btn" data-index="${index}" title="نسخ الآية">

              <i class="bi bi-copy"></i> نسخ

            </button>

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 text-success share-btn" data-index="${index}" title="مشاركة عبر واتساب">

              <i class="bi bi-whatsapp"></i> مشاركة

            </button>

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 fav-btn" data-index="${index}" title="إضافة للمفضلة">

              <i class="bi bi-star"></i> مفضلة

            </button>

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 bookmark-btn" data-index="${index}" title="إضافة علامة مرجعية">

              <i class="bi bi-bookmark-plus"></i> علامة

            </button>

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 tafsir-btn" data-index="${index}" title="عرض تفسير مختصر">

              <i class="bi bi-chat-square-text"></i> تفسير

            </button>

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 card-btn" data-index="${index}" title="بطاقة صورة">

              <i class="bi bi-image"></i> بطاقة

            </button>

            <button type="button" class="btn btn-sm btn-outline-light border-0 opacity-75 link-btn" data-index="${index}" title="نسخ رابط هذه الآية">

              <i class="bi bi-link-45deg"></i> رابط

            </button>

          </div>

        </div>

      `;

    }).join("");



    bindEvents();

    setupScrollTracking();

    tryAutoScrollToSavedPosition();
    if (typeof hzApply === "function" && hz && hz.on) { hzApply(); }

  }



  // الشكل الثاني: طريقة المصحف الشريف المتصل

  function renderMushafLayout() {

    if (!ayahsContainer) return;



    let fullMushafText = "";

    ayahsList.forEach((ayah, index) => {

      const text = getCleanAyahText(ayah, index);

      fullMushafText += `<span class="mushaf-ayah-unit" data-ayahnum="${ayah.numberInSurah}">${text} <span class="text-gold" style="font-family: ${getFontFamilyCss()}; font-size: ${currentFontSize}rem;">﴿${ayah.numberInSurah}﴾</span></span> `;

    });



    ayahsContainer.innerHTML = `

      <div class="mushaf-box p-4 rounded bg-dark bg-opacity-25 border border-gold-subtle" style="direction: rtl; text-align: justify;">

        <p class="mushaf-paragraph" style="font-family: ${getFontFamilyCss()}; font-size: ${currentFontSize}rem; line-height: 2.7; color: #f8f9fa; letter-spacing: 0.3px;">

          ${fullMushafText}

        </p>

      </div>

    `;



    tryAutoScrollToSavedPosition();

  }



  // ===== تتبع مكان القراءة والرجوع له تلقائياً =====

  let scrollSaveTimeout = null;

  function setupScrollTracking() {

    const observer = new IntersectionObserver((entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          const ayahNum = entry.target.getAttribute("data-ayahnum");

          if (!ayahNum) return;

          clearTimeout(scrollSaveTimeout);

          scrollSaveTimeout = setTimeout(() => {

            localStorage.setItem(`eshraq_surah_scroll_${surahNumber}`, ayahNum);

            saveReadingProgress(surahNumber, currentSurahName, ayahNum);

            markAyahAsRead(surahNumber, ayahNum);

          }, 600);

        }

      });

    }, { threshold: 0.6 });



    document.querySelectorAll(".ayah-item").forEach(el => observer.observe(el));

  }



  function tryAutoScrollToSavedPosition() {

    if (hasAutoScrolled) return;

    const savedAyah = localStorage.getItem(`eshraq_surah_scroll_${surahNumber}`);

    if (!savedAyah || savedAyah === "1") { hasAutoScrolled = true; return; }



    setTimeout(() => {

      const target = document.querySelector(`[data-ayahnum="${savedAyah}"]`);

      if (target) {

        target.scrollIntoView({ behavior: "auto", block: "center" });

      }

      hasAutoScrolled = true;

    }, 150);

  }



function bindEvents() {

    document.querySelectorAll(".copy-btn").forEach(btn => {

      btn.addEventListener("click", (e) => {

        const index = e.currentTarget.getAttribute("data-index");

        const ayah = ayahsList[index];

        const text = getCleanAyahText(ayah, parseInt(index));

       

        // ⭐ تحديث موضع القراءة فوراً عند نسخ الآية

        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);



        const fullText = `"${text}" [سورة ${currentSurahName} - الآية ${ayah.numberInSurah}]`;

        navigator.clipboard.writeText(fullText).then(() => alert("تم نسخ الآية بنجاح!"));

      });

    });



    document.querySelectorAll(".share-btn").forEach(btn => {

      btn.addEventListener("click", (e) => {

        const index = e.currentTarget.getAttribute("data-index");

        const ayah = ayahsList[index];

        const text = getCleanAyahText(ayah, parseInt(index));

       

        // ⭐ تحديث موضع القراءة فوراً عند مشاركة الآية

        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);



        const fullText = `"${text}" \n[سورة ${currentSurahName} - الآية ${ayah.numberInSurah}]\nمشاركة عبر تطبيق إشراق 🌙`;

        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');

      });

    });



    document.querySelectorAll(".fav-btn").forEach(btn => {

      btn.addEventListener("click", (e) => {

        const index = e.currentTarget.getAttribute("data-index");

        const ayah = ayahsList[index];

       

        // ⭐ تحديث موضع القراءة فوراً عند إضافة الآية للمفضلة

        saveReadingProgress(surahNumber, currentSurahName, ayah.numberInSurah);



        toggleFavorite(ayah, currentSurahName, parseInt(index));

      });

    });

    document.querySelectorAll(".bookmark-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        const text = getCleanAyahText(ayah, parseInt(index));
        addBookmark(surahNumber, currentSurahName, ayah.numberInSurah, text);
      });
    });

    document.querySelectorAll(".tafsir-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        showTafsir(ayah.numberInSurah);
      });
    });

    document.querySelectorAll(".card-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.getAttribute("data-index"));
        const ayah = ayahsList[index];
        if (window.ixCard && ayah) window.ixCard.open({ text: getCleanAyahText(ayah, index), ref: `سورة ${currentSurahName} - الآية ${ayah.numberInSurah}`, kind: "آية" });
      });
    });
    document.querySelectorAll(".link-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const ayah = ayahsList[index];
        const url = `${window.location.origin}${window.location.pathname}?surah=${surahNumber}&ayah=${ayah.numberInSurah}`;
        navigator.clipboard.writeText(url).then(() => alert("تم نسخ رابط الآية بنجاح!"));
      });
    });
  }

  // ===== وضع الحفظ: إخفاء كلمات + تكرار آية/مقطع بصوت كل آية على حدة =====
  // [id, الاسم, مجلدات everyayah (بالترتيب), معرّف islamic.network]
  const HZ_RECITERS = [
    ["alafasy", "العفاسي", ["Alafasy_128kbps"], "ar.alafasy"],
    ["husary", "الحصري", ["Husary_128kbps", "Husary_64kbps"], "ar.husary"],
    ["husary_m", "الحصري (معلّم)", ["Husary_Muallim_128kbps"], ""],
    ["minshawi", "المنشاوي", ["Minshawy_Murattal_128kbps"], "ar.minshawi"],
    ["minshawi_m", "المنشاوي (معلّم)", ["Minshawy_Teacher_128kbps"], ""],
    ["abdulbasit", "عبد الباسط", ["Abdul_Basit_Murattal_64kbps", "Abdul_Basit_Murattal_192kbps", "Abdul_Basit_Mujawwad_128kbps"], "ar.abdulbasit"],
    ["sudais", "السديس", ["Abdurrahmaan_As-Sudais_192kbps", "Abdurrahmaan_As-Sudais_64kbps"], "ar.abdurrahmaansudais"],
    ["shuraym", "الشريم", ["Saood_ash-Shuraym_128kbps", "Saood_ash-Shuraym_64kbps"], "ar.saoodshuraym"]
  ];
  const hz = { on: false, from: 1, to: 0, rep: 3, loops: 3, rec: "ar.alafasy", hide: "all", cur: 0, r: 0, l: 0, paused: false, reveal: false };
  try { Object.assign(hz, JSON.parse(localStorage.getItem("ix_hifz") || "{}"), { on: false, paused: false, reveal: false }); } catch (e) {}
  if (hz.hide === "half") hz.hide = "all";
  if (!HZ_RECITERS.some(r => r[0] === hz.rec)) hz.rec = "alafasy";
  const hzBR = {}; let hzTry = 0;
  let hzAudio = null, hzSheet = null, hzBar = null;

  function hzSave() { try { localStorage.setItem("ix_hifz", JSON.stringify({ rep: hz.rep, loops: hz.loops, rec: hz.rec, hide: hz.hide })); } catch (e) {} }

  function hzApply() {
    if (!hz.on || !ayahsContainer) return;
    ayahsContainer.classList.toggle("hz-reveal", hz.reveal);
    ayahsContainer.querySelectorAll(".ayah-item").forEach(item => {
      const n = parseInt(item.dataset.ayahnum), idx = n - 1;
      const inRange = n >= hz.from && n <= hz.to;
      item.classList.toggle("hz-dim", !inRange);
      item.classList.toggle("hz-cur", n === hz.cur);
      if (!inRange || hz.hide === "none") return;
      const p = item.querySelector(".ayah-text"); if (!p || p.dataset.hz) return;
      const badge = p.querySelector(".badge"), ayah = ayahsList[idx]; if (!ayah) return;
      const words = getCleanAyahText(ayah, idx).split(/\s+/).filter(Boolean);
      p.innerHTML = words.map((w, i) => {
        const hide = hz.hide === "all";
        return `<span class="hz-w${hide ? " h" : ""}">${w}</span>`;
      }).join(" ") + " " + (badge ? badge.outerHTML : "");
      p.dataset.hz = "1";
    });
  }

  function hzUI() {
    if (hzSheet) return;
    hzSheet = document.createElement("div"); hzSheet.id = "hz-sheet";
    hzSheet.innerHTML = '<div class="hz-sh"><div class="hz-gr"></div><div class="hz-hd"><b><i class="bi bi-mortarboard-fill"></i> وضع الحفظ</b><button type="button" class="hz-x" aria-label="إغلاق"><i class="bi bi-x-lg"></i></button></div>' +
      '<div class="hz-row"><label>من آية</label><select id="hz-from"></select><label>إلى آية</label><select id="hz-to"></select></div>' +
      '<div class="hz-row"><label>تكرار كل آية</label><span class="hz-chs" data-k="rep">' + [1, 3, 5, 10].map(n => `<button type="button" class="hz-ch" data-v="${n}">${n}</button>`).join("") + '</span></div>' +
      '<div class="hz-row"><label>تكرار المقطع</label><span class="hz-chs" data-k="loops">' + [1, 3, 5, 0].map(n => `<button type="button" class="hz-ch" data-v="${n}">${n === 0 ? "∞" : n}</button>`).join("") + '</span></div>' +
      '<div class="hz-row"><label>إخفاء الكلمات</label><span class="hz-chs" data-k="hide"><button type="button" class="hz-ch" data-v="none">بدون</button><button type="button" class="hz-ch" data-v="all">كلها</button></span></div>' +
      '<div class="hz-row"><label>القارئ</label><span class="hz-chs" data-k="rec">' + HZ_RECITERS.map(r => `<button type="button" class="hz-ch" data-v="${r[0]}">${r[1]}</button>`).join("") + '</span></div>' +
      '<p class="hz-note">استمع للآية، ثم رددها من الذاكرة. اضغط على أي كلمة مخفية لإظهارها.</p>' +
      '<button type="button" class="hz-go" id="hz-go"><i class="bi bi-play-fill"></i> ابدأ الحفظ</button></div>';
    document.body.appendChild(hzSheet);
    hzBar = document.createElement("div"); hzBar.id = "hz-bar"; hzBar.className = "d-none";
    hzBar.innerHTML = '<div class="hz-st"><b id="hz-t1">—</b><small id="hz-t2"></small></div><div class="hz-bt">' +
      '<button type="button" data-a="prev" aria-label="السابقة"><i class="bi bi-skip-forward-fill"></i></button>' +
      '<button type="button" data-a="pp" aria-label="إيقاف مؤقت"><i class="bi bi-pause-fill"></i></button>' +
      '<button type="button" data-a="next" aria-label="التالية"><i class="bi bi-skip-backward-fill"></i></button>' +
      '<button type="button" data-a="eye" aria-label="إظهار الكلمات"><i class="bi bi-eye-fill"></i></button>' +
      '<button type="button" data-a="stop" aria-label="إنهاء"><i class="bi bi-stop-fill"></i></button></div>';
    document.body.appendChild(hzBar);
    hzSheet.addEventListener("click", e => {
      if (e.target === hzSheet || e.target.closest(".hz-x")) return hzClose();
      const c = e.target.closest(".hz-ch"); if (c) { const k = c.parentNode.dataset.k; hz[k] = (k === "rep" || k === "loops") ? parseInt(c.dataset.v) : c.dataset.v; hzMark(); return; }
      if (e.target.closest("#hz-go")) hzStart();
    });
    hzBar.addEventListener("click", e => {
      const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a;
      if (a === "stop") hzStop(); else if (a === "pp") hzTogglePause(); else if (a === "eye") { hz.reveal = !hz.reveal; ayahsContainer.classList.toggle("hz-reveal", hz.reveal); b.innerHTML = `<i class="bi bi-eye${hz.reveal ? "-slash" : ""}-fill"></i>`; }
      else if (a === "next") hzGo(hz.cur + 1); else if (a === "prev") hzGo(hz.cur - 1);
    });
    ayahsContainer.addEventListener("click", e => { const w = e.target.closest(".hz-w.h"); if (w && hz.on) { w.classList.toggle("shown"); } });
  }
  function hzMark() {
    hzSheet.querySelectorAll(".hz-chs").forEach(g => g.querySelectorAll(".hz-ch").forEach(c => {
      const k = g.dataset.k, v = (k === "rep" || k === "loops") ? parseInt(c.dataset.v) : c.dataset.v;
      c.classList.toggle("on", hz[k] === v);
    }));
  }
  function hzOpen() {
    if (!ayahsList.length) return;
    hzUI();
    const n = ayahsList.length, opts = ayahsList.map(a => `<option value="${a.numberInSurah}">${a.numberInSurah}</option>`).join("");
    const f = hzSheet.querySelector("#hz-from"), t = hzSheet.querySelector("#hz-to");
    f.innerHTML = t.innerHTML = opts;
    if (!(hz.from >= 1 && hz.from <= n)) hz.from = 1;
    if (!(hz.to >= hz.from && hz.to <= n)) hz.to = Math.min(n, hz.from + 6);
    f.value = hz.from; t.value = hz.to;
    f.onchange = () => { hz.from = parseInt(f.value); if (hz.to < hz.from) { hz.to = hz.from; t.value = hz.to; } };
    t.onchange = () => { hz.to = parseInt(t.value); if (hz.to < hz.from) { hz.from = hz.to; f.value = hz.from; } };
    hzMark(); hzSheet.classList.add("on");
  }
  function hzClose() { if (hzSheet) hzSheet.classList.remove("on"); }

  function hzStart() {
    hzSave(); hzClose();
    if (typeof stopAudioPlayback === "function") stopAudioPlayback();
    if (isMushafMode) { isMushafMode = false; localStorage.setItem("eshraq_mushaf_mode", "false"); if (typeof updateToggleButtonText === "function") updateToggleButtonText(); }
    hz.on = true; hz.paused = false; hz.reveal = false; hz.l = 1;
    hzAudio = hzAudio || new Audio();
    hzAudio.onended = hzEnded;
    hzAudio.onplaying = () => { hzBR[hz.rec] = hzTry; };
    hzAudio.onerror = () => {
      if (!hz.on || !hzAudio.getAttribute("src")) return;
      if (hzTry < hzCands(hz.cur).length - 1) { hzTry++; hzAudio.src = hzUrl(hz.cur); hzAudio.play().catch(() => {}); return; }
      hz.paused = true; hzStatus("تعذّر تحميل الصوت — جرّب قارئاً آخر أو تحقق من الاتصال"); hzPP();
    };
    document.body.classList.add("hz-on");
    renderAyahs();
    hzBar.classList.remove("d-none");
    hzBar.querySelector('[data-a="eye"]').innerHTML = '<i class="bi bi-eye-fill"></i>';
    hzGo(hz.from, true);
  }
  function hzCands(n) {
    const a = ayahsList[n - 1]; if (!a) return [];
    const r = HZ_RECITERS.find(x => x[0] === hz.rec) || HZ_RECITERS[0];
    const p3 = v => String(v).padStart(3, "0");
    const out = r[2].map(f => `https://everyayah.com/data/${f}/${p3(surahNumber)}${p3(n)}.mp3`);
    if (r[3]) [128, 192, 64].forEach(b => out.push(`https://cdn.islamic.network/quran/audio/${b}/${r[3]}/${a.number}.mp3`));
    return out;
  }
  function hzUrl(n) { return hzCands(n)[hzTry] || ""; }
  function hzGo(n, fresh) {
    if (!hz.on) return;
    n = Math.max(hz.from, Math.min(hz.to, n));
    hz.cur = n; hz.r = 1;
    hzPlay();
  }
  function hzPlay() {
    hzTry = hzBR[hz.rec] || 0; const u = hzUrl(hz.cur); if (!u) return;
    hzAudio.src = u; hz.paused = false; hzPP();
    hzAudio.play().catch(() => {});
    hzApplyCur(); hzStatus();
  }
  function hzApplyCur() {
    hzApply();
    const el = ayahsContainer.querySelector(`.ayah-item[data-ayahnum="${hz.cur}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    ayahsContainer.querySelectorAll(".ayah-item").forEach(i => i.classList.toggle("hz-cur", parseInt(i.dataset.ayahnum) === hz.cur));
  }
  function hzEnded() {
    if (!hz.on) return;
    if (hz.r < hz.rep) { hz.r++; hzAudio.currentTime = 0; hzAudio.play().catch(() => {}); hzStatus(); return; }
    if (hz.cur < hz.to) { hz.cur++; hz.r = 1; hzPlay(); return; }
    if (hz.loops === 0 || hz.l < hz.loops) { hz.l++; hz.cur = hz.from; hz.r = 1; hzPlay(); return; }
    hzStatus("ما شاء الله، أتممت المقطع 🌿"); hz.paused = true; hzPP();
  }
  function hzStatus(msg) {
    if (!hzBar) return;
    hzBar.querySelector("#hz-t1").textContent = msg || `الآية ${hz.cur}`;
    hzBar.querySelector("#hz-t2").textContent = msg ? "" : `تكرار ${hz.r}/${hz.rep} · المقطع ${hz.l}/${hz.loops === 0 ? "∞" : hz.loops}`;
  }
  function hzPP() { const b = hzBar && hzBar.querySelector('[data-a="pp"]'); if (b) b.innerHTML = `<i class="bi bi-${hz.paused ? "play" : "pause"}-fill"></i>`; }
  function hzTogglePause() {
    if (!hzAudio) return;
    if (hz.paused) { hz.paused = false; if (hzAudio.ended || !hzAudio.src) hzEnded(); else hzAudio.play().catch(() => {}); }
    else { hz.paused = true; hzAudio.pause(); }
    hzPP();
  }
  function hzStop() {
    hz.on = false; hz.paused = true;
    if (hzAudio) { hzAudio.pause(); hzAudio.removeAttribute("src"); }
    if (hzBar) hzBar.classList.add("d-none");
    document.body.classList.remove("hz-on");
    ayahsContainer.classList.remove("hz-reveal");
    renderAyahs();
  }
  const hzBtn = document.getElementById("hifz-btn");
  if (hzBtn) hzBtn.addEventListener("click", hzOpen);
  window.hzApply = hzApply;

  // ===== علامة مرجعية =====
  function addBookmark(surahNum, surahName, ayahNum, text) {
    let bookmarks = JSON.parse(localStorage.getItem("eshraq_bookmarks")) || [];
    const exists = bookmarks.some(b => b.surahNumber == surahNum && b.ayahNum === ayahNum);
    if (exists) {
      alert("هذه الآية محفوظة بالفعل ضمن علاماتك المرجعية.");
      return;
    }
    bookmarks.push({ surahNumber: surahNum, surahName, ayahNum, text, date: new Date().toLocaleDateString('ar-EG') });
    localStorage.setItem("eshraq_bookmarks", JSON.stringify(bookmarks));
    alert("تمت إضافة علامة مرجعية بنجاح! 🔖");
  }

  // ===== تفسير مختصر (التفسير الميسر) =====
  async function showTafsir(ayahNum) {
    const modalElement = document.getElementById("tafsir-modal");
    const body = document.getElementById("tafsir-modal-body");
    if (!modalElement || !body) return;

    const modal = new bootstrap.Modal(modalElement);
    body.innerHTML = `<div class="text-center py-3"><div class="spinner-border text-gold" style="color:#edcea0;"></div></div>`;
    modal.show();

    async function tryFetchTafsir(editionSlug) {
      const response = await fetch(`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${editionSlug}/${surahNumber}/${ayahNum}.json`);
      if (!response.ok) throw new Error("not ok");
      const data = await response.json();
      // الشكل الدقيق للاستجابة قد يختلف قليلاً، نتعامل معه بمرونة
      return data?.text || data?.data?.text || (typeof data === "string" ? data : null);
    }

    try {
      let tafsirText = null;
      let sourceLabel = "التفسير الميسر";
      try {
        tafsirText = await tryFetchTafsir("ar-tafsir-muyassar");
      } catch (e) {
        // خطة بديلة: لو تفسير الميسر غير متوفر لهذه الآية تحديداً، نجرب تفسير ابن كثير
        tafsirText = await tryFetchTafsir("ar-tafsir-ibn-kathir");
        sourceLabel = "تفسير ابن كثير";
      }

      body.innerHTML = tafsirText
        ? `<p class="zikr-text" style="font-size: 1.1rem;">${tafsirText}</p><div class="zikr-source gold mt-2">${sourceLabel}</div>`
        : `<p class="text-center text-light opacity-75">تعذر العثور على تفسير لهذه الآية.</p>`;
    } catch (error) {
      body.innerHTML = `<p class="text-center text-danger">تعذر تحميل التفسير، تحقق من الاتصال بالإنترنت.</p>`;
    }
  }



  function updateToggleButtonText() {

    if (toggleLayoutBtn) {

      if (isMushafMode) {

        toggleLayoutBtn.innerHTML = `<i class="bi bi-list-task"></i> العرض العادي`;

      } else {

        toggleLayoutBtn.innerHTML = `<i class="bi bi-book"></i> شكل المصحف الشريف`;

      }

    }

  }



  if (toggleLayoutBtn) {

    toggleLayoutBtn.addEventListener("click", () => {

      isMushafMode = !isMushafMode;

      localStorage.setItem("eshraq_mushaf_mode", isMushafMode);

      updateToggleButtonText();

      renderAyahs();

    });

  }



  if (toggleFontFamilyBtn) {

    toggleFontFamilyBtn.addEventListener("click", () => {

      isUthmaniFont = !isUthmaniFont;

      localStorage.setItem("eshraq_font_family", isUthmaniFont ? "uthmani" : "amiri");

      updateFontFamilyButtonText();

      renderAyahs();

    });

  }



  if (focusModeBtn) {

    focusModeBtn.addEventListener("click", () => {

      isFocusMode = !isFocusMode;

      localStorage.setItem("eshraq_focus_mode", isFocusMode);

      updateFocusModeButton();

    });

  }



  if (fontIncreaseBtn) {

    fontIncreaseBtn.addEventListener("click", () => {

      if (currentFontSize < 2.6) {

        currentFontSize += 0.2;

        localStorage.setItem("eshraq_font_size", currentFontSize);

        updateFontIndicator();

        renderAyahs();

      }

    });

  }



  if (fontDecreaseBtn) {

    fontDecreaseBtn.addEventListener("click", () => {

      if (currentFontSize > 1.2) {

        currentFontSize -= 0.2;

        localStorage.setItem("eshraq_font_size", currentFontSize);

        updateFontIndicator();

        renderAyahs();

      }

    });

  }



  // ===== تشغيل تلاوة السورة كاملة مع اختيار القارئ =====
  // ملاحظة مهمة: المصدر السابق (cdn.islamic.network) تبيّن أنه غير موثوق لأغلب
  // القراء (ملفات ناقصة لبعضهم رغم ظهوره بالفهرس). استبدلناه بمكتبة mp3quran.net
  // وهي المصدر الأساسي الرسمي والأكثر اعتمادية، وتم التحقق يدوياً من كل رابط قارئ.
  const RECITERS = [
    { id: "afs", name: "مشاري العفاسي", g: "تلاوات مرتّلة", server: "https://server8.mp3quran.net/afs/" },
    { id: "maher", name: "ماهر المعيقلي", g: "تلاوات مرتّلة", server: "https://server12.mp3quran.net/maher/" },
    { id: "sds", name: "عبدالرحمن السديس", g: "تلاوات مرتّلة", server: "https://server11.mp3quran.net/sds/" },
    { id: "yasser", name: "ياسر الدوسري", g: "تلاوات مرتّلة", server: "https://server11.mp3quran.net/yasser/" },
    { id: "basit", name: "عبد الباسط عبد الصمد", g: "تلاوات مرتّلة", server: "https://server7.mp3quran.net/basit/" },
    { id: "husr", name: "محمود خليل الحصري", g: "تلاوات مرتّلة", server: "https://server13.mp3quran.net/husr/" },
    { id: "minsh", name: "محمد صديق المنشاوي", g: "تلاوات مرتّلة", server: "https://server10.mp3quran.net/minsh/" },
    { id: "husr_m", name: "الحصري — المصحف المعلّم", g: "للتحفيظ والتعليم", server: "https://server13.mp3quran.net/husr/Almusshaf-Al-Mo3lim/" },
    { id: "minsh_m", name: "المنشاوي — المصحف المعلّم", g: "للتحفيظ والتعليم", server: "https://server10.mp3quran.net/minsh/Almusshaf-Al-Mo3lim/" }
  ];
  // إضافة قراء التحفيظ المتاحين فعلياً من مكتبة mp3quran (تُجلب عند التشغيل وتُخزَّن)
  function mergeTeachers(list) {
    (list || []).forEach(rc => (rc.moshaf || []).forEach(m => {
      if (!/المعلم|معلم|تحفيظ|تعليم/.test(m.name || "")) return;
      if (!m.server || RECITERS.some(r => r.server === m.server)) return;
      RECITERS.push({ id: "mq" + m.id, name: rc.name + " — " + (m.name || "").replace(/^.*?(المصحف المعلم)/, "$1"), g: "للتحفيظ والتعليم", server: m.server.replace(/\/?$/, "/") });
    }));
  }
  try { mergeTeachers(JSON.parse(localStorage.getItem("ix_mq_teach") || "[]")); } catch (e) {}


  const audioEl = document.getElementById("surah-audio");
  const audioPlayBtn = document.getElementById("audio-play-btn");
  const audioProgressWrap = document.getElementById("audio-progress-wrap");
  const audioReciterLabel = document.getElementById("audio-reciter-label");
  const audioStopBtn = document.getElementById("audio-stop-btn");
  const audioSeek = document.getElementById("audio-seek");
  const audioVolume = document.getElementById("audio-volume");
  const audioCurrentTime = document.getElementById("audio-current-time");
  const audioTotalTime = document.getElementById("audio-total-time");
  const reciterSelect = document.getElementById("reciter-select");

  let isAudioPlaying = false;
  // معرّف القارئ المخزّن سابقاً قد يكون بصيغة قديمة (مثل ar.alafasy) من نسخة سابقة من التطبيق،
  // لذلك نطابقه بأمان مع القائمة الجديدة، ونرجع للعفاسي كافتراضي إن لم نجده
  const savedReciterRaw = localStorage.getItem("eshraq_reciter") || "afs";
  let selectedReciterId = RECITERS.some(r => r.id === savedReciterRaw) ? savedReciterRaw : "afs";
  let loadedReciterId = null; // القارئ المحمّل فعلياً بعنصر الصوت حالياً
  let loadedSurahNumber = null;

  function getSelectedReciter() {
    return RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];
  }

  function reciterFromId(id) { return RECITERS.find(r => r.id === id); }
  function setReciter(id) {
    stopAudioPlayback();
    selectedReciterId = id;
    localStorage.setItem("eshraq_reciter", id);
    if (audioReciterLabel) audioReciterLabel.textContent = getSelectedReciter().name;
    buildReciterUI();
  }
  let rcBtn = null, rcSheet = null;
  function buildReciterUI() {
    if (!reciterSelect) return;
    reciterSelect.innerHTML = RECITERS.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
    reciterSelect.value = selectedReciterId;
    reciterSelect.style.display = "none";
    if (!rcBtn) {
      rcBtn = document.createElement("button");
      rcBtn.type = "button"; rcBtn.className = "rc-btn"; rcBtn.setAttribute("aria-label", "اختيار القارئ");
      reciterSelect.parentNode.insertBefore(rcBtn, reciterSelect);
      rcSheet = document.createElement("div"); rcSheet.id = "rc-sheet";
      document.body.appendChild(rcSheet);
      rcBtn.addEventListener("click", () => rcSheet.classList.add("on"));
      rcSheet.addEventListener("click", e => {
        if (e.target === rcSheet || e.target.closest("[data-x]")) { rcSheet.classList.remove("on"); return; }
        const it = e.target.closest("[data-id]"); if (!it) return;
        rcSheet.classList.remove("on");
        if (it.dataset.id !== selectedReciterId) setReciter(it.dataset.id);
      });
    }
    rcBtn.innerHTML = '<i class="bi bi-mic-fill"></i><span>' + getSelectedReciter().name + '</span><i class="bi bi-chevron-down"></i>';
    const groups = {}; RECITERS.forEach(r => (groups[r.g || "القرّاء"] = groups[r.g || "القرّاء"] || []).push(r));
    rcSheet.innerHTML = '<div class="rc-box"><div class="rc-hd"><b>اختر القارئ</b><button type="button" data-x aria-label="إغلاق"><i class="bi bi-x-lg"></i></button></div><div class="rc-body">' +
      Object.keys(groups).map(g => `<div class="rc-g">${g}</div>` + groups[g].map(r => `<button type="button" class="rc-it${r.id === selectedReciterId ? " on" : ""}" data-id="${r.id}"><span>${r.name}</span>${r.id === selectedReciterId ? '<i class="bi bi-check-lg"></i>' : ""}</button>`).join("")).join("") + '</div></div>';
    if (audioReciterLabel) audioReciterLabel.textContent = getSelectedReciter().name;
  }
  buildReciterUI();
  if (!localStorage.getItem("ix_mq_teach_t") || Date.now() - +localStorage.getItem("ix_mq_teach_t") > 7 * 864e5) {
    fetch("https://mp3quran.net/api/v3/reciters?language=ar").then(r => r.json()).then(j => {
      const keep = (j.reciters || []).map(rc => ({ name: rc.name, moshaf: (rc.moshaf || []).filter(m => /المعلم|معلم|تحفيظ|تعليم/.test(m.name || "")).map(m => ({ id: m.id, name: m.name, server: m.server })) })).filter(rc => rc.moshaf.length);
      localStorage.setItem("ix_mq_teach", JSON.stringify(keep)); localStorage.setItem("ix_mq_teach_t", String(Date.now()));
      mergeTeachers(keep); buildReciterUI();
    }).catch(() => {});
  }

  function loadAndPlayFullSurah() {
    if (!audioEl) return;
    const reciter = getSelectedReciter();
    const surahPadded = String(surahNumber).padStart(3, "0");
    const audioUrl = `${reciter.server}${surahPadded}.mp3`;
    audioEl.src = audioUrl;
    loadedReciterId = selectedReciterId;
    loadedSurahNumber = surahNumber;
    audioEl.play();

    const downloadLink = document.getElementById("download-audio-link");
    if (downloadLink) {
      downloadLink.href = audioUrl;
      downloadLink.download = `${currentSurahName || 'سورة'}-${reciter.name}.mp3`;
      downloadLink.classList.remove("d-none");
    }
  }

  // ===== التشغيل التلقائي المتسلسل (Playlist) للانتقال تلقائياً للسورة التالية =====
  const autoAdvanceBtn = document.getElementById("auto-advance-btn");
  let autoAdvanceEnabled = localStorage.getItem("eshraq_auto_advance") === "true";

  function updateAutoAdvanceButton() {
    if (!autoAdvanceBtn) return;
    autoAdvanceBtn.innerHTML = autoAdvanceEnabled
      ? `<i class="bi bi-skip-forward-fill"></i> تشغيل تلقائي: يعمل`
      : `<i class="bi bi-skip-forward"></i> تشغيل تلقائي: متوقف`;
    autoAdvanceBtn.classList.toggle("btn-gold-solid", autoAdvanceEnabled);
    autoAdvanceBtn.classList.toggle("btn-gold-outline", !autoAdvanceEnabled);
  }
  updateAutoAdvanceButton();

  if (autoAdvanceBtn) {
    autoAdvanceBtn.addEventListener("click", () => {
      autoAdvanceEnabled = !autoAdvanceEnabled;
      localStorage.setItem("eshraq_auto_advance", autoAdvanceEnabled);
      updateAutoAdvanceButton();
    });
  }

  function stopAudioPlayback() {
    if (audioEl) {
      audioEl.pause();
      audioEl.removeAttribute("src");
    }
    isAudioPlaying = false;
    loadedReciterId = null;
    loadedSurahNumber = null;
    if (audioProgressWrap) audioProgressWrap.classList.add("d-none");
    if (audioPlayBtn) audioPlayBtn.innerHTML = `<i class="bi bi-play-fill"></i> استماع للسورة`;
    if (audioSeek) audioSeek.value = 0;
    if (audioCurrentTime) audioCurrentTime.textContent = "00:00";
    if (audioTotalTime) audioTotalTime.textContent = "00:00";
  }

  if (audioPlayBtn && audioEl) {
    audioPlayBtn.addEventListener("click", () => {
      if (isAudioPlaying) {
        // إيقاف مؤقت فقط - لا نلمس src أبداً حتى لا يعيد التشغيل من الصفر
        audioEl.pause();
        return;
      }

      if (audioProgressWrap) audioProgressWrap.classList.remove("d-none");

      const sameFileAlreadyLoaded = loadedReciterId === selectedReciterId && loadedSurahNumber === surahNumber && audioEl.src;
      if (sameFileAlreadyLoaded) {
        // استئناف من نفس النقطة التي توقفنا عندها بالضبط (لا نعيد ضبط src)
        audioEl.play();
      } else {
        loadAndPlayFullSurah();
      }
    });

    audioEl.addEventListener("play", () => {
      isAudioPlaying = true;
      audioPlayBtn.innerHTML = `<i class="bi bi-pause-fill"></i> إيقاف مؤقت`;
    });

    audioEl.addEventListener("pause", () => {
      isAudioPlaying = false;
      if (audioEl.src) {
        audioPlayBtn.innerHTML = `<i class="bi bi-play-fill"></i> متابعة الاستماع`;
      }
    });

    const ppBtn = document.getElementById("audio-pp-btn");
    const syncPP = () => {
      if (!ppBtn) return;
      const playing = !audioEl.paused && !audioEl.ended;
      ppBtn.innerHTML = `<i class="bi ${playing ? "bi-pause-fill" : "bi-play-fill"}"></i>`;
      ppBtn.title = ppBtn.ariaLabel = playing ? "إيقاف مؤقت" : "متابعة";
    };
    audioEl.addEventListener("play", syncPP);
    audioEl.addEventListener("pause", syncPP);
    audioEl.addEventListener("playing", syncPP);
    if (ppBtn) ppBtn.addEventListener("click", () => { if (audioEl.paused) audioEl.play(); else audioEl.pause(); });

    audioEl.addEventListener("ended", () => {
      if (autoAdvanceEnabled && surahNumber < 114) {
        const nextSurah = parseInt(surahNumber) + 1;
        localStorage.setItem("eshraq_auto_advance_continue", "true");
        window.location.href = `surah-reader.html?surah=${nextSurah}`;
      } else {
        stopAudioPlayback();
      }
    });

    audioEl.addEventListener("error", () => {
      if (!audioEl.src) return;
      stopAudioPlayback();
      alert("تعذر تحميل التلاوة الصوتية، تحقق من الاتصال بالإنترنت.");
    });
  }

  if (audioStopBtn) {
    audioStopBtn.addEventListener("click", stopAudioPlayback);
  }

  // ===== شريط التقدّم (تقريب/ترجيع) والتحكم بمستوى الصوت =====

  function formatAudioTime(seconds) {

    if (!isFinite(seconds) || seconds < 0) return "0:0";

    const m = String(Math.floor(seconds / 60)).padStart(2, "0");

    const s = String(Math.floor(seconds % 60)).padStart(2, "0");

    return `${m}:${s}`;

  }



  if (audioEl) {

    // استرجاع مستوى الصوت المحفوظ من قبل (إن وجد)

    const savedVolume = parseFloat(localStorage.getItem("eshraq_audio_volume"));

    audioEl.volume = isFinite(savedVolume) ? savedVolume : 1;

    if (audioVolume) audioVolume.value = audioEl.volume;



    audioEl.addEventListener("loadedmetadata", () => {

      if (audioSeek) audioSeek.max = Math.floor(audioEl.duration) || 100;

      if (audioTotalTime) audioTotalTime.textContent = formatAudioTime(audioEl.duration);

    });



    audioEl.addEventListener("timeupdate", () => {

      if (audioCurrentTime) audioCurrentTime.textContent = formatAudioTime(audioEl.currentTime);

      // نتجنب تحديث شريط السحب أثناء إمساك المستخدم له حتى لا "يقفز" من تحت إصبعه

      if (audioSeek && document.activeElement !== audioSeek) {

        audioSeek.value = Math.floor(audioEl.currentTime);

      }

    });



    if (audioSeek) {

      audioSeek.addEventListener("input", () => {

        audioEl.currentTime = audioSeek.value;

      });

    }



    if (audioVolume) {

      audioVolume.addEventListener("input", () => {

        audioEl.volume = parseFloat(audioVolume.value);

        localStorage.setItem("eshraq_audio_volume", audioEl.volume);

      });

    }

  }



  fetchSurahData().then(() => {
    if (localStorage.getItem("eshraq_auto_advance_continue") === "true") {
      localStorage.removeItem("eshraq_auto_advance_continue");
      if (audioProgressWrap) audioProgressWrap.classList.remove("d-none");
      loadAndPlayFullSurah();
    }
  });

});



// حفظ موضع القراءة الحالي وتحديثه فوراً

function saveReadingProgress(surahNum, surahName, ayahNum) {

  const cleanName = surahName.replace(/^(سُورَةُ|سورة)\s*/, "").trim();

  const progress = {

    surahNumber: parseInt(surahNum),

    surahName: cleanName,

    ayahNumber: parseInt(ayahNum),

    date: new Date().toLocaleDateString('ar-SY')

  };

  localStorage.setItem("eshraq_last_progress", JSON.stringify(progress));

}



function toggleFavorite(ayah, surahName, index) {

  let favorites = JSON.parse(localStorage.getItem("eshraq_favorites")) || [];

  const existingIndex = favorites.findIndex(fav => fav.surahName === surahName && fav.ayahNum === ayah.numberInSurah);



  if (existingIndex > -1) {

    favorites.splice(existingIndex, 1);

    alert("تمت إزالة الآية من المفضلة.");

  } else {

    favorites.push({

      surahName: surahName,

      ayahNum: ayah.numberInSurah,

      text: ayah.text

    });

    alert("تمت إضافة الآية إلى المفضلة بنجاح! ⭐");

  }



  localStorage.setItem("eshraq_favorites", JSON.stringify(favorites));

}