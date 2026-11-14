/**
 * إشراق · تتبع المجموعة الحيّ
 * الصق هذا الملف كاملاً في مشروع Apps Script (ملف جديد مثلاً live.gs)، ثم:
 * 1) داخل doGet(e) الموجودة عندك، أضف بأول سطر:
 *      var lv = liveHandle_(e); if (lv) return lv;
 * 2) من Project Settings ← Script properties أضف:  LIVE_SUP_KEY = (كلمة سر المشرفين)
 * 3) Deploy ← Manage deployments ← Edit ← New version ← Deploy.
 * تُحفظ المواقع بورقة اسمها Live وتُعتبر منتهية بعد 10 دقائق من آخر تحديث.
 */
function liveHandle_(e) {
  var p = (e && e.parameter) || {}, a = p.action;
  if (a !== 'live_update' && a !== 'live_stop' && a !== 'live_list') return null;
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName('Live');
    if (!sh) { sh = ss.insertSheet('Live'); sh.appendRow(['code', 'id', 'name', 'lat', 'lng', 'acc', 'ts']); }
    var code = String(p.code || '').trim().toUpperCase();
    if (!code) return liveOut_({ ok: false, error: 'رمز المجموعة مطلوب' });
    var rows = sh.getDataRange().getValues(), now = Date.now(), i;
    if (a === 'live_update') {
      var lat = parseFloat(p.lat), lng = parseFloat(p.lng);
      if (!p.id || isNaN(lat) || isNaN(lng)) return liveOut_({ ok: false, error: 'بيانات ناقصة' });
      var rec = [code, p.id, String(p.name || '').slice(0, 40), lat, lng, parseInt(p.acc, 10) || 0, now];
      for (i = 1; i < rows.length; i++) if (rows[i][1] === p.id) { sh.getRange(i + 1, 1, 1, 7).setValues([rec]); return liveOut_({ ok: true }); }
      sh.appendRow(rec); return liveOut_({ ok: true });
    }
    if (a === 'live_stop') {
      for (i = rows.length - 1; i >= 1; i--) if (rows[i][1] === p.id) sh.deleteRow(i + 1);
      return liveOut_({ ok: true });
    }
    // live_list: للمشرف فقط
    var key = PropertiesService.getScriptProperties().getProperty('LIVE_SUP_KEY');
    if (!key || p.key !== key) return liveOut_({ ok: false, error: 'مفتاح المشرف غير صحيح' });
    var people = [];
    for (i = 1; i < rows.length; i++) {
      if (now - rows[i][6] > 600000) { sh.deleteRow(i + 1); rows.splice(i, 1); i--; continue; } // تنظيف المنتهي
      if (rows[i][0] === code) people.push({ id: rows[i][1], name: rows[i][2], lat: rows[i][3], lng: rows[i][4], acc: rows[i][5], ts: rows[i][6] });
    }
    return liveOut_({ ok: true, people: people });
  } finally { lock.releaseLock(); }
}
function liveOut_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
