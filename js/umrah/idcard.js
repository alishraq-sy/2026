/* مولّد بطاقة المعتمر: يرسم المعلومات فوق تصميم img/pilgrim-card.jpg (1049×1500) ثم يخرجها صورة أو PDF.
   الإحداثيات مقاسة على التصميم نفسه. لتعديل مكان أي خانة غيّر الأرقام في BOX فقط. */
(function () {
  const W = 1049, H = 1500, NAVY = '#0b2a5b', FF = 'Cairo, Tajawal, sans-serif', EMERGENCY = '+966551771250';
  // x1,x2 = حدود مساحة النص داخل الخانة البيضاء، y = منتصفها، size = أكبر حجم خط، ltr = أرقام/لاتيني
  const BOX = {
    name:  { x1: 45,  x2: 718, y: 615, size: 48 },
    nat:   { x1: 40,  x2: 232, y: 706, size: 30 },
    no:    { x1: 512, x2: 724, y: 707, size: 34, ltr: true },
    mk:    { x1: 512, x2: 902, y: 810, size: 44 },
    md:    { x1: 512, x2: 902, y: 922, size: 44 },
    sup:   { x1: 138, x2: 664, y: 1016, size: 44, ltr: true },
    mgr:   { x1: 138, x2: 664, y: 1096, size: 44, ltr: true },
    emg:   { x1: 60,  x2: 640, y: 1180, size: 46, ltr: true },
  };
  const QR = { cx: 158, cy: 1366, size: 250 }; // يسار الشريط السفلي (قبل الخط الفاصل عند x≈315)
  let tpl = null;
  const loadTpl = () => tpl || (tpl = new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = './img/pilgrim-card.jpg'; }));
  const T = v => String(v == null ? '' : v).trim();
  const fonts = () => Promise.all([document.fonts.load('700 30px Cairo', 'ابجد0123'), document.fonts.load('900 30px Cairo', 'ابجد0123')]).catch(() => {});

  // نفس محتوى QR الموجود في بطاقة المعتمر داخل التطبيق
  function payload(p) {
    const L = ['UMRAH:' + T(p.PilgrimNo), 'المعتمر: ' + T(p.Name)];
    [['مكة', 'Makkah'], ['المدينة', 'Madinah']].forEach(([n, k]) => {
      if (T(p[k + '_Hotel'])) L.push(`فندق ${n}: ${T(p[k + '_Hotel'])}${T(p[k + '_Room']) ? ' (غرفة ' + T(p[k + '_Room']) + ')' : ''}`);
      if (/^https?:\/\//i.test(T(p[k + '_Location']))) L.push(T(p[k + '_Location']));
    });
    if (T(p.Supervisor_Name) || T(p.Supervisor_Phone)) L.push('المشرف: ' + [T(p.Supervisor_Name), T(p.Supervisor_Phone)].filter(Boolean).join(' - '));
    return L.join('\n');
  }
  function text(x, s, b) {
    s = T(s); if (!s) return;
    const w = b.x2 - b.x1; let size = b.size;
    x.direction = b.ltr ? 'ltr' : 'rtl'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = NAVY;
    for (; size > 14; size -= 1) { x.font = `700 ${size}px ${FF}`; if (x.measureText(s).width <= w) break; }
    x.textBaseline = 'alphabetic'; // نقيس ارتفاع حروف مرجعية بلا ذيول كي تتوسّط كل النصوص عموديًا بنفس الطريقة
    const cy = x.measureText('الأ0H').actualBoundingBoxAscent / 2;
    x.fillText(s, (b.x1 + b.x2) / 2, b.y + cy);
  }
  function drawQR(x, p) {
    try {
      if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
      const q = qrcode(0, 'M'); q.addData(payload(p)); q.make();
      const n = q.getModuleCount(), pad = 12, cell = Math.floor((QR.size - 2 * pad) / n), sz = cell * n, box = QR.size, off = (box - sz) / 2;
      const bx = QR.cx - box / 2, by = QR.cy - box / 2;
      x.fillStyle = '#fff'; x.beginPath(); x.roundRect ? x.roundRect(bx, by, box, box, 14) : x.rect(bx, by, box, box); x.fill();
      x.fillStyle = '#000';
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) x.fillRect(bx + off + c * cell, by + off + r * cell, cell, cell);
    } catch (e) {}
  }
  async function canvas(p) {
    const [img] = await Promise.all([loadTpl(), fonts()]);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0, W, H);
    text(x, p.Name, BOX.name); text(x, p.Nationality, BOX.nat); text(x, p.PilgrimNo, BOX.no);
    text(x, p.Makkah_Hotel, BOX.mk); text(x, p.Madinah_Hotel, BOX.md);
    text(x, p.Supervisor_Phone, BOX.sup); text(x, p.Manager_Phone, BOX.mgr); text(x, EMERGENCY, BOX.emg);
    drawQR(x, p);
    return c;
  }
  const blob = (c, t = 'image/png', q) => new Promise(r => c.toBlob(r, t, q));
  async function savePNG(p) {
    const b = await blob(await canvas(p)), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = 'بطاقة-' + (T(p.PilgrimNo) || 'معتمر') + '.png';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  // PDF: بطاقتان بالعرض × بطاقتان بالطول، كل بطاقة 13.4 × 19.1 سم ⇒ تتسع في صفحة A3
  async function savePDF(list, progress) {
    const CW = 134, CH = 191, GX = 8, GY = 8, PW = 297, PH = 420, per = 4;
    const x0 = (PW - 2 * CW - GX) / 2, y0 = (PH - 2 * CH - GY) / 2;
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a3', compress: true });
    const pages = Math.ceil(list.length / per);
    for (let pg = 0; pg < pages; pg++) {
      if (pg) doc.addPage();
      for (let i = 0; i < per; i++) {
        const p = list[pg * per + i]; if (!p) break;
        const c = await canvas(p), col = i % 2, row = Math.floor(i / 2);
        doc.addImage(c.toDataURL('image/jpeg', 0.9), 'JPEG', x0 + col * (CW + GX), y0 + row * (CH + GY), CW, CH);
      }
      if (progress) progress(pg + 1, pages);
      await new Promise(r => setTimeout(r));
    }
    doc.save('بطاقات-المعتمرين.pdf');
  }
  window.ixCard = { canvas, savePNG, savePDF, payload };
})();
