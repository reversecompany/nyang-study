// 매일 저녁 GitHub Actions가 실행. 구독자 전원에게 "깨우기" 푸시를 보낸다.
// 실제 문구는 학생 폰의 서비스워커(sw.js)가 공부 기록을 보고 고른다.
import webpush from 'web-push';

const subs = JSON.parse(process.env.SUBSCRIPTIONS || '[]');
webpush.setVapidDetails('https://reversecompany.github.io/nyang-study/', process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);

let ok = 0;
for (const sub of subs) {
  const who = (sub.name || '?') + ' ' + new URL(sub.endpoint).host;
  try {
    const r = await webpush.sendNotification(sub, JSON.stringify({ t: 'daily' }), { TTL: 4 * 3600, urgency: 'high' });
    console.log('OK ', who, r.statusCode); ok++;
  } catch (e) {
    console.log('ERR', who, e.statusCode, e.statusCode === 404 || e.statusCode === 410 ? '(구독 만료 — 알림 다시 연결 필요)' : e.body);
  }
}
console.log(`${ok}/${subs.length} sent`);
if (subs.length && !ok) process.exit(1);
