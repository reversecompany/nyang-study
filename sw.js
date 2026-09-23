/* 냥공부 서비스워커
   - 오프라인에서도 열리게 앱 껍데기를 캐시
   - 서버(GitHub Actions)는 "깨우기" 푸시만 보낸다. 무슨 말을 할지는
     기기에 저장된 공부 기록(state.json)을 보고 여기서 고른다. */
const VER = 'nyang-v5';
const SHELL = ['./', 'index.html', 'samun.js', 'samun_cards.json', 'manifest.json', 'icons/icon-192.png', 'icons/icon-180.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(
    ks.filter(k => k !== VER && k !== 'nyang-state' && k !== 'nyang-fonts').map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.hostname.includes('fonts.g') || u.hostname === 'i.pinimg.com') {   // 폰트·고양이 사진: 캐시 우선
    e.respondWith(caches.open('nyang-fonts').then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const r = await fetch(e.request); c.put(e.request, r.clone()); return r;
    }));
    return;
  }
  if (u.origin !== location.origin) return;
  e.respondWith(                                    // 앱: 네트워크 우선(업데이트 반영), 실패 시 캐시
    fetch(e.request).then(r => {
      const cp = r.clone(); caches.open(VER).then(c => c.put(e.request, cp)); return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});

/* ---------- 알림 문구 ---------- */
const z = n => String(n).padStart(2, '0');
function dayOf(ts = Date.now()) { const d = new Date(ts - 4 * 3600e3); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
function kToDate(k) { const [a, b, c] = k.split('-').map(Number); return new Date(a, b - 1, c); }
function diffDays(a, b) { return Math.round((kToDate(b) - kToDate(a)) / 864e5); }
function hasBatchim(w) { const c = w.charCodeAt(w.length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; }
const JOSA = { '이야': ['이야', '야'], '이': ['이', '가'], '은': ['은', '는'], '을': ['을', '를'], '야': ['아', '야'], '랑': ['이랑', '랑'] };
const pick = a => a[Math.floor(Math.random() * a.length)];

const N = {
  done:   ['오늘도 해냈네, {me}. {cat}{이} 골골송 부르는 중', '오늘 발자국 도장 예쁘게 찍혔어. 푹 쉬어, {me}', '{me} 오늘 진짜 멋있었어. 내일도 옆에 있을게'],
  rest:   ['오늘은 쉼표 찍은 날. 푹 쉬고 내일 보자', '잘 쉬는 것도 공부야. {cat}{이} 옆에서 같이 뒹구는 중'],
  first:  ['{cat}{이} 첫 발자국 도장을 기다리고 있어. 딱 1분만 같이 할래?', '{me}{야}, 우리 첫 공부 해볼까? 5분이면 충분해'],
  normal: ['{me}{야}, 오늘 딱 5분만 같이 할래?', '오늘 도장 칸이 비어 있어. 같이 채우러 가자', '책만 펴도 칭찬해줄게. 들어와 볼래?', '{cat}{이} 츄르 들고 기다리는 중…'],
  tired:  ['{cat}{이} 하품하면서 기다리는 중… 5분이면 기운 날 거야', '보고 싶었어, {me}. 잠깐만 얼굴 보여줄래?'],
  sleep:  ['{cat}{이} {me} 꿈 꾸면서 자고 있어. 살짝 깨워줄래?', '다시 오는 게 제일 어려운 거 알아. 1분만 같이 앉아 있자', '{cat}{이} 문 앞에서 기다리다 잠들었어'],
};
function fmt(t, s) {
  return t.replace(/\{(me|cat)\}\{(이야|이|은|을|야|랑)\}/g, (_, k, j) => { const w = s[k]; return w + JOSA[j][hasBatchim(w) ? 0 : 1]; })
          .replace(/\{(me|cat)\}/g, (_, k) => s[k]);
}

async function compose() {
  let s = { me: '친구', cat: '모찌', days: [], rests: [] };
  try { const r = await (await caches.open('nyang-state')).match('state.json'); if (r) s = Object.assign(s, await r.json()); } catch (e) {}
  const t = dayOf();
  let bank;
  if (s.days.includes(t)) bank = 'done';
  else if (s.rests.includes(t)) bank = 'rest';
  else {
    const last = [...s.days, ...s.rests].sort().pop();
    if (!last) bank = 'first';
    else { const d = diffDays(last, t); bank = d <= 1 ? 'normal' : d === 2 ? 'tired' : 'sleep'; }
  }
  return { title: s.cat, body: fmt(pick(N[bank]), s) };
}

self.addEventListener('push', e => {
  e.waitUntil(compose().then(({ title, body }) =>
    self.registration.showNotification(title, {
      body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'nyang-daily', data: { url: './?from=push' }
    })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow(e.notification.data?.url || './');
  }));
});
