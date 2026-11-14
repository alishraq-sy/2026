document.addEventListener("DOMContentLoaded", () => {
  // ===== بيانات الأذكار =====
  const categories = [
    {
      id: "sabah",
      title: "أذكار الصباح",
      icon: "bi-sunrise-fill",
      items: [
        { text: "آيَةُ الْكُرْسِيِّ: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", count: 1, source: "من حافظ عليها حين يصبح أُجير من الجن حتى يمسي" },
        { text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", count: 3, source: "سورة الإخلاص" },
        { text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِنْ شَرِّ مَا خَلَقَ، وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ", count: 3, source: "سورة الفلق" },
        { text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَٰهِ النَّاسِ، مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ", count: 3, source: "سورة الناس" },
        { text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ", count: 1 },
        { text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", count: 1, source: "سيد الاستغفار" },
        { text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ", count: 3 },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي", count: 1 },
        { text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", count: 7 },
        { text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", count: 3 },
        { text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا", count: 3 },
        { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100 },
        { text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", count: 10 },
        { text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", count: 100 }
      ]
    },
    {
      id: "masaa",
      title: "أذكار المساء",
      icon: "bi-moon-stars-fill",
      items: [
        { text: "آيَةُ الْكُرْسِيِّ: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", count: 1 },
        { text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", count: 3, source: "سورة الإخلاص" },
        { text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِنْ شَرِّ مَا خَلَقَ، وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ", count: 3, source: "سورة الفلق" },
        { text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَٰهِ النَّاسِ، مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَالنَّاسِ", count: 3, source: "سورة الناس" },
        { text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ", count: 1 },
        { text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", count: 1, source: "سيد الاستغفار" },
        { text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ", count: 3 },
        { text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", count: 7 },
        { text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", count: 3 },
        { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ", count: 1 },
        { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100 },
        { text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", count: 100 }
      ]
    },
    {
      id: "salah",
      title: "أذكار بعد الصلاة",
      icon: "bi-person-arms-up",
      items: [
        { text: "أَسْتَغْفِرُ اللَّهَ (ثلاثاً)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", count: 1 },
        { text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ", count: 1 },
        { text: "سُبْحَانَ اللَّهِ", count: 33 },
        { text: "الْحَمْدُ لِلَّهِ", count: 33 },
        { text: "اللَّهُ أَكْبَرُ", count: 33 },
        { text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ (تكملة المئة)", count: 1 },
        { text: "آيَةُ الْكُرْسِيِّ كاملة", count: 1, source: "من قرأها دبر كل صلاة لم يمنعه من دخول الجنة إلا أن يموت" }
      ]
    },
    {
      id: "sleep",
      title: "أذكار النوم",
      icon: "bi-cloud-moon-fill",
      items: [
        { text: "آيَةُ الْكُرْسِيِّ كاملة، ثم: لَنْ يَزَالَ عَلَيْكَ مِنَ اللَّهِ حَافِظٌ وَلَا يَقْرَبُكَ شَيْطَانٌ حَتَّىٰ تُصْبِحَ", count: 1 },
        { text: "قراءة سورتي الفلق والناس مع نفث في الكفين ومسح ما استطعت من الجسد", count: 1, source: "كان النبي ﷺ يفعله عند منامه كل ليلة" },
        { text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", count: 1 },
        { text: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ", count: 1 },
        { text: "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْأَرْضِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَىٰ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ ذِي شَرٍّ أَنْتَ آخِذٌ بِنَاصِيَتِهِ", count: 1 },
        { text: "سُبْحَانَ اللَّهِ", count: 33 },
        { text: "الْحَمْدُ لِلَّهِ", count: 33 },
        { text: "اللَّهُ أَكْبَرُ", count: 34 },
        { text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", count: 3 }
      ]
    },
    {
      id: "istiqaz",
      title: "أذكار الاستيقاظ",
      icon: "bi-sun-fill",
      items: [
        { text: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", count: 1 },
        { text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفِرْ لِي", count: 1 }
      ]
    },
    {
      id: "mutafarriqa",
      title: "أذكار متفرقة",
      icon: "bi-collection-fill",
      items: [
        { text: "بِسْمِ اللَّهِ", count: 1, source: "عند بدء الطعام" },
        { text: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ", count: 1, source: "بعد الطعام" },
        { text: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", count: 1, source: "عند الخروج من المنزل" },
        { text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ", count: 1, source: "عند الخروج من المنزل" },
        { text: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا", count: 1, source: "عند دخول المنزل" }
      ]
    }
  ];

  const container = document.getElementById("zikr-container");
  const tabsBar = document.getElementById("category-tabs");
  const progressNote = document.getElementById("progress-note");
  const fontIncreaseBtn = document.getElementById("font-increase-btn");
  const fontDecreaseBtn = document.getElementById("font-decrease-btn");
  const resetBtn = document.getElementById("reset-category-btn");

  let activeCategoryId = categories[0].id;
  let currentFontSize = parseFloat(localStorage.getItem("eshraq_font_size")) || 1.6;

  function getFontFamilyCss() {
    return localStorage.getItem("eshraq_font_family") === "uthmani"
      ? "'Amiri Quran', 'Traditional Arabic', serif"
      : "'Amiri', 'Traditional Arabic', serif";
  }

  function todayKey() {
    return new Date().toDateString();
  }

  function getCounters(catId) {
    const raw = localStorage.getItem(`eshraq_azkar_counts_${catId}`);
    const saved = raw ? JSON.parse(raw) : null;
    if (saved && saved.date === todayKey()) return saved.counts;
    return {};
  }

  function saveCounters(catId, counts) {
    localStorage.setItem(`eshraq_azkar_counts_${catId}`, JSON.stringify({ date: todayKey(), counts }));
  }

  function renderTabs() {
    tabsBar.innerHTML = categories.map(cat => `
      <button class="btn btn-gold-outline btn-sm rounded-pill px-3 ${cat.id === activeCategoryId ? 'active-tab' : ''}" data-cat="${cat.id}">
        <i class="bi ${cat.icon} me-1"></i> ${cat.title}
      </button>
    `).join("");

    tabsBar.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        activeCategoryId = btn.getAttribute("data-cat");
        renderTabs();
        renderCategory();
      });
    });
  }

  function updateProgressNote(cat, counters) {
    const done = cat.items.filter((item, i) => (counters[i] ?? item.count) <= 0).length;
    progressNote.textContent = `${done} / ${cat.items.length} تم إنجازها`;
  }

  function renderCategory() {
    const cat = categories.find(c => c.id === activeCategoryId);
    if (!cat) return;
    const counters = getCounters(cat.id);

    container.innerHTML = cat.items.map((item, index) => {
      const remaining = counters[index] ?? item.count;
      const isDone = remaining <= 0;
      return `
        <div class="zikr-card ${isDone ? 'done' : ''}" data-index="${index}">
          <div class="d-flex align-items-start gap-3">
            <button class="zikr-count-btn" data-index="${index}" title="اضغط للعد">
              ${isDone ? '<i class="bi bi-check-lg"></i>' : remaining}
            </button>
            <div class="flex-grow-1">
              <p class="zikr-text mb-2" style="font-size: ${currentFontSize}rem; font-family: ${getFontFamilyCss()};">${item.text}</p>
              ${item.source ? `<div class="zikr-source gold mb-2"><i class="bi bi-info-circle me-1"></i>${item.source}</div>` : ""}
              <div class="zikr-actions d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-light border-0 copy-btn" data-index="${index}" title="نسخ">
                  <i class="bi bi-copy"></i> نسخ
                </button>
                <button type="button" class="btn btn-sm btn-outline-light border-0 text-success share-btn" data-index="${index}" title="مشاركة عبر واتساب">
                  <i class="bi bi-whatsapp"></i> مشاركة
                </button>
                <button type="button" class="btn btn-sm btn-outline-light border-0 fav-btn" data-index="${index}" title="إضافة للمفضلة">
                  <i class="bi bi-star"></i> مفضلة
                </button>
                <button type="button" class="btn btn-sm btn-outline-light border-0 card-btn" data-index="${index}" title="بطاقة صورة">
                  <i class="bi bi-image"></i> بطاقة
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    updateProgressNote(cat, counters);
    bindCardEvents(cat);
  }

  function bindCardEvents(cat) {
    container.querySelectorAll(".zikr-count-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"));
        const counters = getCounters(cat.id);
        const current = counters[index] ?? cat.items[index].count;
        if (current > 0) {
          counters[index] = current - 1;
          saveCounters(cat.id, counters);
          if (navigator.vibrate) navigator.vibrate(30);
          renderCategory();
        }
      });
    });

    container.querySelectorAll(".card-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const item = cat.items[btn.dataset.index];
        if (window.ixCard && item) window.ixCard.open({ text: item.text, ref: item.source || cat.title, kind: "ذكر" });
      });
    });
    container.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const item = cat.items[index];
        navigator.clipboard.writeText(item.text).then(() => alert("تم نسخ الذكر بنجاح!"));
      });
    });

    container.querySelectorAll(".share-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const item = cat.items[index];
        const fullText = `${item.text}\n[${cat.title} - تطبيق إشراق 🌙]`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');
      });
    });

    container.querySelectorAll(".fav-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.getAttribute("data-index");
        const item = cat.items[index];
        addAzkarFavorite(cat.title, item.text);
      });
    });
  }

  if (fontIncreaseBtn) {
    fontIncreaseBtn.addEventListener("click", () => {
      if (currentFontSize < 2.4) {
        currentFontSize += 0.1;
        localStorage.setItem("eshraq_font_size", currentFontSize);
        renderCategory();
      }
    });
  }

  if (fontDecreaseBtn) {
    fontDecreaseBtn.addEventListener("click", () => {
      if (currentFontSize > 1.1) {
        currentFontSize -= 0.1;
        localStorage.setItem("eshraq_font_size", currentFontSize);
        renderCategory();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(`eshraq_azkar_counts_${activeCategoryId}`);
      renderCategory();
    });
  }

  // ===== وضع البطاقات: ذكر واحد بكل شاشة، عدّ بالنقر وانتقال بالسحب =====
  const deckBtn = document.getElementById("zk-cards-btn");
  let deck = null, dIdx = 0, dCat = null, dStart = null, dMoved = false;
  const buzzD = ms => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };

  function deckBuild() {
    if (deck) return;
    deck = document.createElement("div"); deck.id = "zk-deck"; deck.setAttribute("aria-hidden", "true");
    deck.innerHTML = '<div class="zd-top"><button type="button" class="zd-x" aria-label="إغلاق"><i class="bi bi-x-lg"></i></button><div class="zd-ttl"><b id="zd-title"></b><small id="zd-prog"></small></div><button type="button" class="zd-x" id="zd-img" aria-label="بطاقة صورة"><i class="bi bi-image"></i></button></div>' +
      '<div class="zd-bar"><i id="zd-barfill"></i></div>' +
      '<div class="zd-stage" id="zd-stage"><div class="zd-card" id="zd-card"><div class="zd-txt" id="zd-txt"></div><div class="zd-src" id="zd-src"></div></div></div>' +
      '<div class="zd-hint" id="zd-hint">اضغط للعدّ · اسحب للتنقّل</div>' +
      '<div class="zd-bot"><button type="button" class="zd-nav" id="zd-prev" aria-label="السابق"><i class="bi bi-chevron-right"></i></button>' +
      '<button type="button" class="zd-count" id="zd-count" aria-label="عدّ"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="bg"/><circle cx="50" cy="50" r="44" class="fg" id="zd-ring"/></svg><b id="zd-num">0</b></button>' +
      '<button type="button" class="zd-nav" id="zd-next" aria-label="التالي"><i class="bi bi-chevron-left"></i></button></div>' +
      '<div class="zd-fin" id="zd-fin"><div class="zd-star">۞</div><h2>تقبّل الله منك</h2><p>أتممتَ <span id="zd-finname"></span> بحمد الله</p><button type="button" class="zd-go" id="zd-close2">إغلاق</button></div>';
    document.body.appendChild(deck);
    const stage = deck.querySelector("#zd-stage");
    deck.querySelector(".zd-x").onclick = deckClose;
    deck.querySelector("#zd-close2").onclick = deckClose;
    deck.querySelector("#zd-prev").onclick = () => deckGo(dIdx - 1);
    deck.querySelector("#zd-next").onclick = () => deckGo(dIdx + 1);
    deck.querySelector("#zd-count").onclick = deckTap;
    deck.querySelector("#zd-img").onclick = () => { const it = dCat.items[dIdx]; if (window.ixCard && it) window.ixCard.open({ text: it.text, ref: it.source || dCat.title, kind: "ذكر" }); };
    stage.addEventListener("pointerdown", e => { dStart = { x: e.clientX, y: e.clientY }; dMoved = false; });
    stage.addEventListener("pointermove", e => { if (dStart && Math.abs(e.clientX - dStart.x) > 12) dMoved = true; });
    stage.addEventListener("pointerup", e => {
      if (!dStart) return; const dx = e.clientX - dStart.x, dy = e.clientY - dStart.y; dStart = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) { deckGo(dx < 0 ? dIdx + 1 : dIdx - 1); return; }
      if (!dMoved && Math.abs(dy) < 10) deckTap();
    });
    stage.addEventListener("pointercancel", () => { dStart = null; });
    document.addEventListener("keydown", e => { if (!deck.classList.contains("on")) return; if (e.key === "Escape") deckClose(); if (e.key === "ArrowLeft") deckGo(dIdx + 1); if (e.key === "ArrowRight") deckGo(dIdx - 1); if (e.key === " " || e.key === "Enter") { e.preventDefault(); deckTap(); } });
  }
  function deckOpen() {
    deckBuild();
    dCat = categories.find(c => c.id === activeCategoryId); if (!dCat) return;
    const cn = getCounters(dCat.id);
    dIdx = Math.max(0, dCat.items.findIndex((it, i) => (cn[i] ?? it.count) > 0));
    deck.querySelector("#zd-title").textContent = dCat.title;
    deck.classList.remove("fin"); deck.classList.add("on"); deck.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    deckShow(0);
  }
  function deckClose() { deck.classList.remove("on"); deck.setAttribute("aria-hidden", "true"); document.documentElement.style.overflow = ""; renderCategory(); }
  function deckShow(dir) {
    const it = dCat.items[dIdx], cn = getCounters(dCat.id), rem = cn[dIdx] ?? it.count, total = it.count;
    const card = deck.querySelector("#zd-card");
    deck.querySelector("#zd-txt").textContent = it.text;
    deck.querySelector("#zd-txt").style.fontFamily = getFontFamilyCss();
    deck.querySelector("#zd-src").textContent = it.source || "";
    deck.querySelector("#zd-prog").textContent = `${dIdx + 1} / ${dCat.items.length}`;
    deck.querySelector("#zd-barfill").style.width = ((dIdx + 1) / dCat.items.length * 100) + "%";
    card.classList.toggle("done", rem <= 0);
    deck.querySelector("#zd-txt").scrollTop = 0;
    deckRing(rem, total);
    if (dir) { card.classList.remove("in-l", "in-r"); void card.offsetWidth; card.classList.add(dir > 0 ? "in-l" : "in-r"); }
  }
  function deckRing(rem, total) {
    const c = 2 * Math.PI * 44, p = total > 0 ? Math.max(0, Math.min(1, 1 - rem / total)) : 1;
    const r = deck.querySelector("#zd-ring"); r.style.strokeDasharray = c; r.style.strokeDashoffset = c * (1 - p);
    deck.querySelector("#zd-num").innerHTML = rem <= 0 ? '<i class="bi bi-check-lg"></i>' : rem;
  }
  function deckGo(n) {
    if (n < 0) { buzzD(8); return; }
    if (n >= dCat.items.length) { deckFinish(); return; }
    const dir = n > dIdx ? 1 : -1; dIdx = n; deckShow(dir);
  }
  function deckTap() {
    const it = dCat.items[dIdx], cn = getCounters(dCat.id), rem = cn[dIdx] ?? it.count;
    if (rem <= 0) { deckGo(dIdx + 1); return; }
    cn[dIdx] = rem - 1; saveCounters(dCat.id, cn);
    deckRing(cn[dIdx], it.count); buzzD(cn[dIdx] <= 0 ? [25, 40, 25] : 8);
    const b = deck.querySelector("#zd-count"); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
    if (cn[dIdx] <= 0) { deck.querySelector("#zd-card").classList.add("done"); setTimeout(() => { if (deck.classList.contains("on") && !deck.classList.contains("fin")) deckGo(dIdx + 1); }, 520); }
  }
  function deckFinish() {
    const cn = getCounters(dCat.id), left = dCat.items.filter((it, i) => (cn[i] ?? it.count) > 0).length;
    if (left > 0) { const j = dCat.items.findIndex((it, i) => (cn[i] ?? it.count) > 0); dIdx = j; deckShow(-1); buzzD(30); return; }
    deck.querySelector("#zd-finname").textContent = dCat.title;
    deck.classList.add("fin"); buzzD([30, 50, 30, 50, 60]);
  }
  if (deckBtn) deckBtn.addEventListener("click", deckOpen);

  renderTabs();
  renderCategory();
});
