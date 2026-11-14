/* إشراق · أذكار الوقت + سنن اليوم (الرئيسية) */
(function () {
  var host = document.getElementById("ix-time"); if (!host) return;
  function g(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function wall() { try { if (typeof wallNow === "function") return wallNow(); } catch (e) {} return new Date(); }
  function timings() { try { var c = JSON.parse(g("eshraq_prayer_timings_cache") || "null"); return c && c.timings ? c.timings : null; } catch (e) { return null; } }
  function at(base, hhmm, def) { var s = hhmm || def; var p = String(s).split(":"); var d = new Date(base.getTime()); d.setHours(+p[0], +p[1], 0, 0); return d; }
  function hij(d) {
    try {
      var p = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric" }).formatToParts(d), o = {};
      p.forEach(function (x) { o[x.type] = parseInt(x.value, 10); });
      var adj = parseInt(g("ix_hijri_adj") || "0", 10) || 0, dd = o.day + adj, mm = o.month;
      if (dd < 1) { dd += 30; mm = mm === 1 ? 12 : mm - 1; } else if (dd > 30) { dd -= 30; mm = mm === 12 ? 1 : mm + 1; }
      return { d: dd, m: mm };
    } catch (e) { return { d: 0, m: 0 }; }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- أذكار الوقت ---------- */
  function zikr(now) {
    var T = timings() || {}, F = at(now, T.Fajr, "05:00"), S = at(now, T.Sunrise, "06:20"), D = at(now, T.Dhuhr, "12:00"), A = at(now, T.Asr, "15:30"), M = at(now, T.Maghrib, "18:00"), I = at(now, T.Isha, "19:30");
    var after = function (t, m) { return now >= t && now < new Date(t.getTime() + m * 60000); };
    var r;
    if (now < F) r = ["istiqaz", "أذكار الاستيقاظ", "قبل الفجر: وقت قيام وابتهال، وأذكار الاستيقاظ", "bi-moon-stars-fill"];
    else if (after(F, 25) || after(D, 25) || after(A, 25) || after(M, 25) || after(I, 25)) r = ["salah", "أذكار بعد الصلاة", "أنت الآن بعد الصلاة: التسبيح والتحميد والتكبير", "bi-hand-thumbs-up-fill"];
    else if (now < D) r = ["sabah", "أذكار الصباح", "وقتها من الفجر إلى الضحى، فاحرص عليها", "bi-brightness-high-fill"];
    else if (now < A) r = ["mutafarriqa", "أذكار متفرقة", "وقت الظهيرة: أكثر من الصلاة على النبي ﷺ والاستغفار", "bi-stars"];
    else if (now < I.getTime() + 3600000) r = ["masaa", "أذكار المساء", "وقتها من العصر إلى المغرب، ويجزئ بعده", "bi-sunset-fill"];
    else r = ["sleep", "أذكار النوم", "قبل أن تنام: آية الكرسي والمعوّذات وأذكار النوم", "bi-moon-fill"];
    return r;
  }

  /* ---------- سنن اليوم ---------- */
  function sunan(now) {
    var o = [], dow = now.getDay(), h = hij(now), T = timings() || {};
    if (dow === 5) {
      o.push(["bi-book-half", "سورة الكهف", "تُقرأ يوم الجمعة وتنوّر لك ما بين الجمعتين", "quran"]);
      o.push(["bi-heart-fill", "الصلاة على النبي ﷺ", "أكثِر منها في يوم الجمعة وليلتها", ""]);
      o.push(["bi-hourglass-split", "ساعة الإجابة", "التمسها بعد العصر إلى غروب الشمس", ""]);
    }
    if (dow === 1 || dow === 4) o.push(["bi-droplet-half", "صيام " + (dow === 1 ? "الاثنين" : "الخميس"), "تُعرض الأعمال فيه، فيُسنّ أن تكون صائماً", "ibadat"]);
    if (h.d >= 13 && h.d <= 15 && h.m !== 12 && h.m !== 9) o.push(["bi-brightness-alt-high", "الأيام البيض", "صيام ثلاثة أيام من كل شهر هجري (13-14-15)", "ibadat"]);
    if (h.m === 1 && (h.d === 9 || h.d === 10)) o.push(["bi-calendar-heart", h.d === 10 ? "يوم عاشوراء" : "تاسوعاء", "صيامه يكفّر السنة الماضية، ويُستحب صيام يوم قبله أو بعده", "ibadat"]);
    if (h.m === 12 && h.d <= 9) o.push(["bi-sunrise-fill", "العشر من ذي الحجة", "أحب الأيام إلى الله للعمل الصالح: أكثر من الذكر والتكبير والصيام", ""]);
    if (h.m === 12 && h.d === 9) o.push(["bi-geo-alt-fill", "يوم عرفة", "صيامه لغير الحاج يكفّر سنتين، وخير الدعاء دعاء يوم عرفة", ""]);
    if (h.m === 12 && h.d === 10) o.push(["bi-moon-stars", "يوم عيد الأضحى", "صلاة العيد والتكبير والأضحية وصلة الأرحام", ""]);
    if (h.m === 12 && h.d >= 11 && h.d <= 13) o.push(["bi-cup-hot", "أيام التشريق", "أيام أكل وشرب وذكر لله؛ لا يُصام فيها", ""]);
    if (h.m === 9) o.push(["bi-moon-fill", "شهر رمضان", h.d >= 21 ? "العشر الأواخر: تحرَّ ليلة القدر وأكثر من الدعاء" : "الصيام والقيام وتلاوة القرآن", "ibadat"]);
    if (h.m === 10 && h.d >= 2) o.push(["bi-6-circle", "ستٌّ من شوال", "من صام رمضان وأتبعه ستاً من شوال فكأنما صام الدهر", "ibadat"]);
    if (h.m === 8) o.push(["bi-calendar2-week", "شعبان", "كان النبي ﷺ يكثر من الصيام فيه استعداداً لرمضان", "ibadat"]);
    // سنن يومية حسب الوقت
    var S = at(now, T.Sunrise, "06:20"), D = at(now, T.Dhuhr, "12:00"), I = at(now, T.Isha, "19:30"), F = at(now, T.Fajr, "05:00");
    if (now >= new Date(S.getTime() + 15 * 60000) && now < new Date(D.getTime() - 15 * 60000)) o.push(["bi-brightness-high", "صلاة الضحى", "ركعتان فأكثر، وهي صدقة عن كل مفصل", "ibadat"]);
    if (now >= I || now < F) o.push(["bi-moon", "الوتر وقيام الليل", "اختم صلاة ليلك بالوتر، والثلث الأخير وقت إجابة", "ibadat"]);
    return o.slice(0, 5);
  }

  var now = wall(), z = zikr(now), s = sunan(now);
  var html = '<div class="ix-lab rv">الآن في إشراق</div><h2 class="ix-h rv">سنن <span class="ol">وأذكار الوقت</span></h2>' +
    '<a class="tm-zk rv" href="./azkar.html?cat=' + z[0] + '"><i class="bi ' + z[3] + ' tm-bg"></i><span class="tm-k">الآن</span><b>' + z[1] + '</b><small>' + z[2] + '</small><span class="tm-go">اقرأ الآن <i class="bi bi-arrow-left"></i></span></a>';
  if (s.length) {
    html += '<div class="tm-list rv">' + s.map(function (x) {
      var href = x[3] === "quran" ? "./surah-reader.html?surah=18" : x[3] === "ibadat" ? "./ibadat.html" : "";
      return (href ? '<a href="' + href + '"' : "<div") + ' class="tm-it"><i class="bi ' + x[0] + '"></i><span><b>' + esc(x[1]) + "</b><small>" + esc(x[2]) + "</small></span>" + (href ? '<i class="bi bi-chevron-left tm-ch"></i></a>' : "</div>");
    }).join("") + "</div>";
  }
  host.innerHTML = html; host.style.display = ""; host.querySelectorAll(".rv").forEach(function (e) { e.classList.add("on"); });
})();
