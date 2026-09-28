// 냥공부 동기화 서버 — 폰·컴퓨터 어디서 열어도 같은 기록이 보이게.
// 기기 연결 코드(ny-로 시작하는 무작위 12자)마다 따로 저장한다. 앱 기록(gzip+base64)을 8000자씩 쪼개 스크립트 속성에 둔다.
//   GET  ?action=load&k=코드              → {upd, data}
//   POST {k, upd, data[, force]} (text/plain) → {ok} / 서버가 더 최신이면 {ok:false, stale:true, upd}
var P = PropertiesService.getScriptProperties();
var KEY_RE = /^ny-[a-z0-9]{12}$/;
var CH = 8000;

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'load' && KEY_RE.test(p.k || '')) {
    return out({ upd: Number(P.getProperty(p.k + '_upd') || 0), data: load_(p.k) });
  }
  return out({ ok: true, app: 'nyang-sync' });
}

function doPost(e) {
  var b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false }); }
  if (!KEY_RE.test(b.k || '') || typeof b.data !== 'string' || b.data.length > 400000) return out({ ok: false });
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var cur = Number(P.getProperty(b.k + '_upd') || 0);
    if (Number(b.upd) < cur && !b.force) return out({ ok: false, stale: true, upd: cur });
    save_(b.k, b.data);
    P.setProperty(b.k + '_upd', String(Number(b.upd) || Date.now()));
    return out({ ok: true, upd: Number(b.upd) });
  } finally {
    lock.releaseLock();
  }
}

function save_(k, s) {
  var n = Math.max(1, Math.ceil(s.length / CH)), o = {};
  o[k + '_n'] = String(n);
  for (var i = 0; i < n; i++) o[k + '_' + i] = s.slice(i * CH, (i + 1) * CH);
  P.setProperties(o);
}

function load_(k) {
  var n = Number(P.getProperty(k + '_n') || 0), s = '';
  for (var i = 0; i < n; i++) s += P.getProperty(k + '_' + i) || '';
  return s;
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
