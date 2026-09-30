'use strict';
/* =========================================================
   냥공부 · 꾸미기 데이터 (2026-09-30 개편 2)
   - 방 테마(배경) / 방 가구(자리별 1개) / 테마 전용 장식 / 모양이 다른 액자
   - 그림은 전부 SVG. 여기 있는 것은 index.html의 꾸미기 탭·상점이 읽어 간다.
   - 아이템 id를 바꾸면 학생 기록이 끊기니 새 것은 끝에 추가할 것.
   ========================================================= */
const O = 'stroke="#5a4646" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
const T = 'stroke="#5a4646" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"';   // 잔선
const starPath = (cx, cy, R) => { let d = ''; for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, r = i%2 ? R*.45 : R; d += (i?'L':'M') + (cx+r*Math.cos(a)).toFixed(1) + ',' + (cy+r*Math.sin(a)).toFixed(1); } return d + 'Z'; };
const flowerSVG = (cx, cy, fill = '#ffd9e4') => Array.from({length:5}, (_,k) => { const a = k*72*Math.PI/180; return `<circle cx="${(cx+4*Math.sin(a)).toFixed(1)}" cy="${(cy-4*Math.cos(a)).toFixed(1)}" r="3.4" fill="${fill}" stroke="#5a4646" stroke-width="1"/>`; }).join('') + `<circle cx="${cx}" cy="${cy}" r="2.4" fill="#ffd35c" stroke="#5a4646" stroke-width="1"/>`;

/* ---------- 자리 ---------- */
const SLOT_N = {tl:'왼쪽 위', tr:'오른쪽 위', top:'위 가운데', bl:'왼쪽 아래', br:'오른쪽 아래', bottom:'아래 가운데'};
const RM_SLOT_N = {wallA:'벽 왼쪽', wallB:'벽 오른쪽', floorL:'바닥 왼쪽', floorR:'바닥 오른쪽'};
const RM_SLOTS = ['wallA', 'wallB', 'floorL', 'floorR'];
function slotLabel(sl){
  const has = k => sl.includes(k);
  if (has('tl') && has('tr')) return '위 전체';
  if (has('bottom') && has('bl')) return '아래 전체';
  return sl.map(k => SLOT_N[k]).join('·');
}

/* ---------- 테마 (season = 실제로 그 철인 기간 → 무료 선물이 열린다) ---------- */
const THEMES = [
  {id:'study',     n:'스터디룸'},
  {id:'play',      n:'놀이방'},
  {id:'chuseok',   n:'한가위',     season:[['2026-09-20','2026-10-10'], ['2027-09-08','2027-09-25']]},
  {id:'seol',      n:'설날',       season:[['2027-01-30','2027-02-14']]},
  {id:'xmas',      n:'크리스마스', season:[['2026-12-15','2026-12-31'], ['2027-12-15','2027-12-31']]},
  {id:'spring',    n:'벚꽃 봄',    season:[['2027-03-25','2027-04-15']]},
  {id:'halloween', n:'할로윈',     season:[['2026-10-20','2026-10-31'], ['2027-10-20','2027-10-31']]},
  {id:'suneung',   n:'수능 대박',  season:[['2026-11-01','2026-11-19']]},
  {id:'deco',      n:'액자 장식'},
  {id:'frame',     n:'액자'},
  {id:'color',     n:'색깔 방'},
];

/* ---------- 방 테마 (배경: 벽 무늬 + 바닥 + 러그) ---------- */
const grid = (c, s) => `repeating-linear-gradient(0deg,${c} 0 1px,transparent 1px ${s}px),repeating-linear-gradient(90deg,${c} 0 1px,transparent 1px ${s}px)`;
const ROOMS_NEW = [
  {id:'study',    theme:'study',    n:'스터디룸',   cost:25, wall:`${grid('rgba(110,145,200,.16)',26)},#eaf2fc`, f1:'#ecd7b3', f2:'#e2caa0', bd:'#cbad7f', rug:'#a9c8ee'},
  {id:'playroom', theme:'play',     n:'캣카페 놀이방', cost:25, wall:'repeating-linear-gradient(90deg,#fbeedd 0 26px,#f8e3cc 26px 52px)', f1:'#f3dcbc', f2:'#ebd0aa', bd:'#d8b98a', rug:'#ffc9a8'},
  {id:'hanok',    theme:'chuseok',  n:'한옥 한가위', cost:35, wall:`${grid('rgba(150,105,55,.22)',44)},#f7ecd3`, f1:'#dcb884', f2:'#d2ab76', bd:'#b98d55', rug:'#c2503f'},
  {id:'seolroom', theme:'seol',     n:'설날 방',    cost:35, wall:'radial-gradient(circle,#ffd0cf 0 4px,transparent 5px) 0 0/34px 34px,#fff1ec', f1:'#f4d9c2', f2:'#edccb0', bd:'#dcb89a', rug:'#d95a5a'},
  {id:'xmasroom', theme:'xmas',     n:'크리스마스 방', cost:45, wall:'radial-gradient(circle,#fff 0 2px,transparent 3px) 0 0/28px 28px,radial-gradient(circle,rgba(255,255,255,.7) 0 1.5px,transparent 2.5px) 14px 14px/28px 28px,#2f6d57', f1:'#f6f9fb', f2:'#e4edf3', bd:'#cbdbe6', rug:'#c94a4a'},
  {id:'sakuraroom',theme:'spring',  n:'벚꽃 방',    cost:35, wall:'radial-gradient(circle,#fff 0 3px,transparent 4px) 0 0/30px 30px,radial-gradient(circle,#ffd3e0 0 4px,transparent 5px) 15px 15px/30px 30px,#ffeef4', f1:'#f9dde6', f2:'#f3d0dc', bd:'#eebfce', rug:'#fff'},
  {id:'halloroom',theme:'halloween',n:'할로윈 방',  cost:40, wall:'radial-gradient(circle,rgba(255,158,61,.5) 0 3px,transparent 4px) 0 0/30px 30px,#2c2140', f1:'#3d2d58', f2:'#33264b', bd:'#4b3969', rug:'#e8833a'},
  {id:'daebak',   theme:'suneung',  n:'수능 대박 방', cost:30, wall:'radial-gradient(circle,#ffd35c 0 2px,transparent 3px) 0 0/26px 26px,#fff5d0', f1:'#f7e4a8', f2:'#f1d992', bd:'#e3c26c', rug:'#ffb84d'},
];

/* ---------- 방 가구·벽 장식 (자리마다 1개 — 같은 자리엔 하나만 놓인다) ----------
   need = 함께한 날 N일이면 선물로 받음 · free = 그 테마 철에 무료 선물 · cost = 츄르 */
const bat = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-10 0 Q-7 -7 0 -2 Q7 -7 10 0 Q7 -1 5 5 Q0 0 -5 5 Q-7 -1 -10 0Z" fill="#3b3440" ${T}/><path d="M-3 -3 L-2 -7 L0 -3 L2 -7 L3 -3Z" fill="#3b3440" ${T}/></g>`;
const RM_ITEMS = [
  {id:'window', n:'창문', slot:'wallB', theme:'study', cost:0, w:70, svg:`<svg viewBox="0 0 84 70"><rect x="4" y="4" width="76" height="62" rx="10" fill="#fff" ${O}/><rect x="11" y="11" width="62" height="48" rx="5" fill="#cfeafe"/><path d="M42 11 V59 M11 35 H73" stroke="#fff" stroke-width="5"/><ellipse cx="26" cy="24" rx="9" ry="3.6" fill="#fff"/><ellipse cx="33" cy="22" rx="6" ry="3.4" fill="#fff"/></svg>`},
  {id:'clock', n:'벽시계', slot:'wallA', theme:'study', cost:12, w:38, svg:`<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" fill="#fff" ${O}/>${[0,1,2,3,4,5,6,7,8,9,10,11].map(i => { const a = i*Math.PI/6; return `<path d="M${(22+14.5*Math.sin(a)).toFixed(1)} ${(22-14.5*Math.cos(a)).toFixed(1)} L${(22+16.5*Math.sin(a)).toFixed(1)} ${(22-16.5*Math.cos(a)).toFixed(1)}" stroke="#5a4646" stroke-width="1.6" stroke-linecap="round"/>`; }).join('')}<path d="M22 22 V11 M22 22 L29 26" ${O}/><circle cx="22" cy="22" r="2" fill="#ff8fab"/></svg>`},
  {id:'shelf', n:'책장', slot:'floorL', theme:'study', cost:20, w:58, svg:`<svg viewBox="0 0 60 90"><rect x="4" y="3" width="52" height="85" rx="4" fill="#dcae72" ${O}/>${[8,34,60].map(y => `<rect x="9" y="${y}" width="42" height="22" rx="2" fill="#f7e6c8" ${T}/>`).join('')}${[[12,12,6,18,'#ffb3c6'],[19,14,6,16,'#ffd35c'],[26,11,7,19,'#fff'],[35,13,5,17,'#ffb3c6'],[13,40,7,16,'#fff'],[21,38,6,18,'#ffd35c'],[28,42,8,14,'#ffb3c6'],[40,39,6,17,'#fff'],[12,66,6,16,'#ffd35c'],[19,64,8,18,'#ffb3c6'],[29,68,6,14,'#fff']].map(([x,y,w,h,c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="${c}" ${T}/>`).join('')}</svg>`},
  {id:'desk', n:'책상', slot:'floorR', theme:'study', cost:25, w:92, svg:`<svg viewBox="0 0 100 74"><rect x="10" y="46" width="8" height="26" fill="#c89358" ${O}/><rect x="82" y="46" width="8" height="26" fill="#c89358" ${O}/><rect x="4" y="36" width="92" height="10" rx="3" fill="#dcae72" ${O}/><rect x="10" y="27" width="30" height="9" rx="1" fill="#ffb3c6" ${T}/><rect x="13" y="18" width="24" height="9" rx="1" fill="#ffd35c" ${T}/><path d="M78 36 L74 20 L62 12" fill="none" ${O}/><path d="M52 14 L66 6 L70 18Z" fill="#ffd35c" ${O}/><ellipse cx="79" cy="35" rx="9" ry="2.5" fill="#f7e6c8" ${T}/></svg>`},
  {id:'tower', n:'캣타워', slot:'floorL', theme:'play', cost:45, need:30, w:68, svg:`<svg viewBox="0 0 70 112"><rect x="6" y="100" width="58" height="10" rx="3" fill="#f0d9b0" ${O}/><rect x="28" y="32" width="14" height="68" fill="#e8c99a" ${O}/>${[42,52,62,72,82,92].map(y => `<path d="M28 ${y} H42" ${T}/>`).join('')}<rect x="2" y="62" width="34" height="8" rx="3" fill="#ffb3c6" ${O}/><rect x="36" y="44" width="32" height="8" rx="3" fill="#ffb3c6" ${O}/><rect x="12" y="4" width="46" height="30" rx="9" fill="#f7e6c8" ${O}/><ellipse cx="35" cy="22" rx="8" ry="9" fill="#5a4646"/><path d="M10 70 V80" ${T}/><circle cx="10" cy="85" r="5" fill="#ffd35c" ${O}/></svg>`},
  {id:'box', n:'박스', slot:'floorR', theme:'play', cost:12, need:7, w:70, svg:`<svg viewBox="0 0 72 48"><path d="M4 16 H68 L64 45 H8Z" fill="#e3bd8a" ${O}/><path d="M4 16 L16 6 L36 12 L56 6 L68 16Z" fill="#edcfa3" ${O}/><rect x="31" y="16" width="10" height="14" fill="#f7e6c8" ${T}/><path d="M28 45 V36 a8 8 0 0 1 16 0 V45Z" fill="#5a4646"/></svg>`},
  {id:'cushion', n:'방석', slot:'floorR', theme:'play', cost:12, need:14, w:66, svg:`<svg viewBox="0 0 72 30"><ellipse cx="36" cy="20" rx="32" ry="9" fill="#ffc9d8" ${O}/><ellipse cx="36" cy="15" rx="29" ry="8" fill="#ffe3ea" ${O}/><circle cx="36" cy="15" r="2.2" fill="#ff8fab"/></svg>`},
  {id:'plant', n:'화분', slot:'floorR', theme:'play', cost:12, need:21, w:44, svg:`<svg viewBox="0 0 48 72"><ellipse cx="24" cy="26" rx="6" ry="16" fill="#8fdcc2" ${O}/><ellipse cx="14" cy="30" rx="5.5" ry="14" transform="rotate(-32 14 30)" fill="#6bc6a5" ${O}/><ellipse cx="34" cy="30" rx="5.5" ry="14" transform="rotate(32 34 30)" fill="#6bc6a5" ${O}/><path d="M12 46 H36 L33 69 H15Z" fill="#f0b28c" ${O}/><rect x="9" y="40" width="30" height="7" rx="2.5" fill="#f5c4a4" ${O}/></svg>`},
  // 한가위
  {id:'moon', n:'보름달', slot:'wallB', theme:'chuseok', cost:25, w:56, svg:`<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#fff8d6" opacity=".7"/><circle cx="30" cy="30" r="20" fill="#fff0a8" ${O}/><circle cx="24" cy="26" r="4" fill="#f4dc82"/><circle cx="36" cy="35" r="5.5" fill="#f4dc82"/><circle cx="35" cy="22" r="2.6" fill="#f4dc82"/></svg>`},
  {id:'songpyeon', n:'송편 상', slot:'floorR', theme:'chuseok', cost:20, free:1, w:84, svg:`<svg viewBox="0 0 92 54"><rect x="6" y="36" width="80" height="6" rx="3" fill="#dcae72" ${O}/><rect x="12" y="42" width="6" height="11" fill="#c89358" ${O}/><rect x="74" y="42" width="6" height="11" fill="#c89358" ${O}/><ellipse cx="46" cy="34" rx="31" ry="6.5" fill="#fff" ${O}/>${[[31,'#ffd9e4'],[49,'#cfeed8']].map(([x,c]) => `<path d="M${x-9} 25 a9 9 0 0 1 18 0Z" fill="${c}" ${T}/>`).join('')}${[[22,'#fff'],[40,'#ffe7a8'],[58,'#ffd9e4'],[74,'#fff']].map(([x,c]) => `<path d="M${x-9} 33 a9 9 0 0 1 18 0Z" fill="${c}" ${T}/>`).join('')}</svg>`},
  {id:'screen', n:'병풍', slot:'floorL', theme:'chuseok', cost:30, w:88, svg:`<svg viewBox="0 0 96 92"><polygon points="4,14 32,10 32,84 4,88" fill="#f7e6c8" ${O}/><polygon points="32,10 62,16 62,90 32,84" fill="#f7e6c8" ${O}/><polygon points="62,16 92,12 92,86 62,90" fill="#f7e6c8" ${O}/><circle cx="47" cy="38" r="9" fill="#e0575f" ${T}/><path d="M6 76 L18 56 L30 74Z" fill="#8fc7a6" ${T}/><path d="M64 80 L78 58 L90 78Z" fill="#8fc7a6" ${T}/><path d="M34 74 Q47 66 60 76" fill="none" ${T}/></svg>`},
  {id:'lantern', n:'청사초롱', slot:'wallA', theme:'chuseok', cost:18, w:32, svg:`<svg viewBox="0 0 36 70"><path d="M18 0 V8" ${O}/><rect x="9" y="8" width="18" height="6" rx="2" fill="#a86f45" ${O}/><path d="M7 14 H29 L32 44 H4Z" fill="#e0575f" ${O}/><rect x="6" y="26" width="24" height="5" fill="#ffd35c" ${T}/><rect x="7" y="44" width="22" height="5" rx="2" fill="#a86f45" ${O}/><path d="M13 49 V62 M18 49 V67 M23 49 V62" stroke="#ffd35c" stroke-width="2.6" stroke-linecap="round"/></svg>`},
  // 설날
  {id:'magpie', n:'까치', slot:'wallB', theme:'seol', cost:25, w:70, svg:`<svg viewBox="0 0 72 58"><path d="M2 50 Q30 44 70 50" fill="none" stroke="#8a5a35" stroke-width="4" stroke-linecap="round"/><path d="M58 47 L66 38 M46 46 L50 38" stroke="#8a5a35" stroke-width="2.5" stroke-linecap="round"/><path d="M44 34 L68 27 L66 34 L48 41Z" fill="#3b3440" ${O}/><ellipse cx="34" cy="34" rx="18" ry="11" fill="#3b3440" ${O}/><ellipse cx="30" cy="38" rx="11" ry="6" fill="#fff"/><path d="M38 29 q8 -2 12 4 q-8 4 -12 -4z" fill="#fff" ${T}/><circle cx="19" cy="27" r="9" fill="#3b3440" ${O}/><path d="M11 27 L3 29 L11 32Z" fill="#ffd35c" ${T}/><circle cx="16" cy="25" r="1.8" fill="#fff"/><path d="M30 44 V49 M36 44 V49" stroke="#ffd35c" stroke-width="2.4" stroke-linecap="round"/></svg>`},
  {id:'pouch', n:'복주머니', slot:'wallA', theme:'seol', cost:15, free:1, w:38, svg:`<svg viewBox="0 0 44 54"><path d="M22 0 V8" ${O}/><path d="M12 14 Q22 8 32 14 Q44 24 40 40 Q36 52 22 52 Q8 52 4 40 Q0 24 12 14Z" fill="#e0575f" ${O}/><path d="M12 14 Q22 22 32 14" fill="none" stroke="#ffd35c" stroke-width="3" stroke-linecap="round"/><text x="22" y="42" font-size="17" text-anchor="middle" fill="#ffd35c" font-family="Jua,sans-serif">복</text></svg>`},
  {id:'kite', n:'연', slot:'wallA', theme:'seol', cost:18, w:40, svg:`<svg viewBox="0 0 44 66"><path d="M22 2 L40 24 L22 46 L4 24Z" fill="#ffb3c6" ${O}/><path d="M22 2 V46 M4 24 H40" ${T}/><path d="M22 46 Q16 52 22 56 Q28 60 22 64" fill="none" stroke="#ff8fab" stroke-width="2.4" stroke-linecap="round"/><path d="M22 54 l-5 -3 v6z M22 54 l5 -3 v6z" fill="#ffd35c"/></svg>`},
  {id:'ddeok', n:'떡국 상', slot:'floorR', theme:'seol', cost:20, w:78, svg:`<svg viewBox="0 0 84 52"><rect x="6" y="42" width="72" height="6" rx="3" fill="#dcae72" ${O}/><path d="M18 22 H66 Q62 42 42 42 Q22 42 18 22Z" fill="#fff" ${O}/><ellipse cx="42" cy="22" rx="24" ry="5.5" fill="#fff2cf" ${O}/>${[[30,22],[40,24],[52,22],[46,20],[36,20]].map(([x,y]) => `<ellipse cx="${x}" cy="${y}" rx="4.6" ry="2.6" fill="#fff" ${T}/>`).join('')}<path d="M36 21 h6 M48 23 h6" stroke="#ffd35c" stroke-width="2.2" stroke-linecap="round"/><path d="M34 12 q-3 -4 0 -7 M44 12 q-3 -4 0 -7 M54 12 q-3 -4 0 -7" fill="none" stroke="#d9c6cf" stroke-width="2" stroke-linecap="round"/></svg>`},
  // 크리스마스
  {id:'tree', n:'트리', slot:'floorL', theme:'xmas', cost:35, free:1, w:66, svg:`<svg viewBox="0 0 72 112"><rect x="30" y="92" width="12" height="16" fill="#a86f45" ${O}/><polygon points="36,26 16,58 56,58" fill="#5bb07a" ${O}/><polygon points="36,14 20,42 52,42" fill="#6cc08a" ${O}/><polygon points="36,44 8,94 64,94" fill="#4ea56e" ${O}/><path d="${starPath(36,10,8)}" fill="#ffd35c" ${O}/>${[[30,36,'#e0575f'],[42,52,'#ffd35c'],[22,76,'#fff'],[47,80,'#e0575f'],[35,68,'#ffd35c'],[30,88,'#fff']].map(([x,y,c]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${c}" ${T}/>`).join('')}<path d="M18 62 Q36 72 54 60" fill="none" stroke="#fff" stroke-width="2.2" stroke-dasharray="3 4" stroke-linecap="round"/></svg>`},
  {id:'stocking', n:'크리스마스 양말', slot:'wallA', theme:'xmas', cost:15, w:34, svg:`<svg viewBox="0 0 40 56"><path d="M20 0 V6" ${O}/><path d="M10 8 H29 V28 Q29 36 37 40 Q37 52 24 52 Q10 52 10 38Z" fill="#e0575f" ${O}/><rect x="8" y="5" width="23" height="9" rx="4" fill="#fff" ${O}/><circle cx="19" cy="30" r="2.4" fill="#fff"/><circle cx="23" cy="40" r="2.4" fill="#fff"/></svg>`},
  {id:'snowwin', n:'눈 오는 창', slot:'wallB', theme:'xmas', cost:25, w:62, svg:`<svg viewBox="0 0 64 56"><rect x="3" y="3" width="58" height="50" rx="6" fill="#fff" ${O}/><rect x="9" y="9" width="46" height="38" rx="3" fill="#a9c6e8"/><path d="M32 9 V47 M9 28 H55" stroke="#fff" stroke-width="4"/>${[[15,16],[24,22],[40,15],[48,24],[19,36],[38,38],[47,42],[29,12],[12,26]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="1.7" fill="#fff"/>`).join('')}</svg>`},
  {id:'gifts', n:'선물 더미', slot:'floorR', theme:'xmas', cost:20, w:82, svg:`<svg viewBox="0 0 88 60"><rect x="4" y="22" width="38" height="34" fill="#e0575f" ${O}/><rect x="19" y="22" width="8" height="34" fill="#fff" ${T}/><path d="M23 22 q-10 -12 -14 -4 q4 6 14 4 q10 2 14 -4 q-4 -8 -14 4Z" fill="#fff" ${T}/><rect x="46" y="32" width="30" height="24" fill="#ffd35c" ${O}/><rect x="57" y="32" width="8" height="24" fill="#ffb3c6" ${T}/><rect x="52" y="16" width="20" height="16" fill="#8fdcc2" ${O}/><rect x="59" y="16" width="6" height="16" fill="#fff" ${T}/></svg>`},
  // 벚꽃 봄
  {id:'sakuratree', n:'벚나무', slot:'floorL', theme:'spring', cost:35, free:1, w:88, svg:`<svg viewBox="0 0 96 120"><path d="M42 116 Q44 84 40 62 L54 62 Q52 86 56 116Z" fill="#8a5a35" ${O}/><path d="M46 72 Q30 58 22 46 M50 68 Q66 54 76 42" fill="none" stroke="#8a5a35" stroke-width="5" stroke-linecap="round"/>${[[48,34,22],[26,46,16],[72,44,17],[38,18,14],[60,20,15]].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffc2d4" ${T}/>`).join('')}${[[44,28,9],[66,36,7],[26,42,6],[54,16,6]].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffe0ea"/>`).join('')}${[[14,96],[80,104],[30,110],[70,90]].map(([x,y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="1.8" fill="#ffc2d4"/>`).join('')}</svg>`},
  {id:'lunch', n:'벚꽃 도시락', slot:'floorR', theme:'spring', cost:15, w:66, svg:`<svg viewBox="0 0 72 46"><rect x="2" y="30" width="68" height="14" rx="3" fill="#ffd0de" ${O}/><path d="M2 37 H70 M14 30 V44 M30 30 V44 M46 30 V44 M62 30 V44" stroke="#fff" stroke-width="2" opacity=".8"/><rect x="10" y="8" width="52" height="26" rx="5" fill="#fff" ${O}/><path d="M36 8 V34 M10 21 H62" ${T}/><circle cx="23" cy="15" r="5" fill="#fff" ${T}/><circle cx="49" cy="15" r="4.5" fill="#3b3440" ${T}/><circle cx="49" cy="15" r="2" fill="#fff"/><ellipse cx="23" cy="28" rx="6" ry="3.6" fill="#ffd35c" ${T}/><circle cx="49" cy="28" r="3.6" fill="#ffb3c6" ${T}/></svg>`},
  // 할로윈
  {id:'pumpkin', n:'호박 등', slot:'floorR', theme:'halloween', cost:15, free:1, w:54, svg:`<svg viewBox="0 0 60 56"><ellipse cx="18" cy="34" rx="14" ry="19" fill="#ee8028" ${O}/><ellipse cx="42" cy="34" rx="14" ry="19" fill="#ee8028" ${O}/><ellipse cx="30" cy="34" rx="16" ry="20" fill="#f5923a" ${O}/><path d="M28 15 Q28 6 34 5 L36 10 Q32 10 32 16Z" fill="#6bb08a" ${O}/><path d="M20 30 L26 30 L23 25Z M34 30 L40 30 L37 25Z" fill="#ffe27a" ${T}/><path d="M20 39 L24 43 L28 39 L32 43 L36 39 L40 43" fill="none" stroke="#ffe27a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg>`},
  {id:'bats', n:'박쥐 가랜드', slot:'wallA', theme:'halloween', cost:15, w:72, svg:`<svg viewBox="0 0 76 36"><path d="M2 4 Q38 16 74 4" fill="none" stroke="#8b7aa8" stroke-width="2"/>${bat(16,18,.9)}${bat(38,26,1.1)}${bat(60,18,.9)}</svg>`},
  // 수능 대박
  {id:'mochi', n:'찹쌀떡·엿', slot:'floorR', theme:'suneung', cost:15, free:1, w:70, svg:`<svg viewBox="0 0 76 46"><ellipse cx="38" cy="34" rx="34" ry="8" fill="#fff" ${O}/>${[[22,25],[54,26],[38,21]].map(([x,y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="9" fill="#fff" ${O}/><circle cx="${x-4}" cy="${y-2}" r="1.4" fill="#ffc2d4"/><circle cx="${x+3}" cy="${y+2}" r="1.4" fill="#ffc2d4"/>`).join('')}<rect x="58" y="31" width="13" height="8" rx="2" transform="rotate(-8 64 35)" fill="#e6b04a" ${T}/></svg>`},
  {id:'banner', n:'수능 대박 현수막', slot:'wallA', theme:'suneung', cost:20, w:90, svg:`<svg viewBox="0 0 96 40"><path d="M8 0 V9 M88 0 V9" ${O}/><rect x="2" y="9" width="92" height="28" rx="3" fill="#ffd35c" ${O}/><text x="48" y="29" font-size="15" text-anchor="middle" fill="#e0575f" font-family="Jua,sans-serif">수능 대박!</text></svg>`},
];

/* ---------- 테마 전용 고양이(액자) 장식 ---------- */
const stripes = (dir, colors, n = colors.length, W = 13, H = 8) => colors.map((c, i) => {
  const x1 = -W*i/n, x2 = -W*(i+1)/n, h1 = H/W*Math.abs(x1), h2 = H/W*Math.abs(x2);
  return `<polygon points="${x1*dir},${-h1} ${x2*dir},${-h2} ${x2*dir},${h2} ${x1*dir},${h1}" fill="${c}" stroke="#5a4646" stroke-width=".8"/>`;
}).join('');
const SD = ['#e0575f', '#ffd35c', '#5aa2e8', '#4db888'];
const ACC_NEW = [
  {id:'santa', n:'산타 모자', slot:['top'], cost:25, theme:'xmas', pc:'#ffe3ea', pos:'left:50%;top:-31px;width:66px;margin-left:-33px',
   svg:`<svg viewBox="0 0 64 44"><path d="M8 34 C10 14 28 6 40 10 C48 12 54 18 58 28 L58 34Z" fill="#e0464f" ${O}/><circle cx="58" cy="27" r="6" fill="#fff" ${O}/><rect x="4" y="31" width="52" height="10" rx="5" fill="#fff" ${O}/></svg>`},
  {id:'snowpin', n:'눈송이 핀', slot:['tl'], cost:15, theme:'xmas', pc:'#e8f2fb', pos:'left:-12px;top:-12px;width:32px',
   svg:`<svg viewBox="-12 -12 24 24"><g fill="none" stroke-linecap="round"><path d="M0 -10 V10 M-8.7 -5 L8.7 5 M-8.7 5 L8.7 -5" stroke="#5a4646" stroke-width="3.6"/><path d="M0 -10 V10 M-8.7 -5 L8.7 5 M-8.7 5 L8.7 -5" stroke="#dff1ff" stroke-width="1.8"/></g><circle r="2.6" fill="#fff" ${T}/></svg>`},
  {id:'bunny', n:'달토끼 귀', slot:['top'], cost:25, theme:'chuseok', pc:'#fff5f8', pos:'left:50%;top:-40px;width:70px;margin-left:-35px',
   svg:`<svg viewBox="0 0 70 46"><ellipse cx="22" cy="22" rx="8" ry="19" transform="rotate(-14 22 24)" fill="#fff" ${O}/><ellipse cx="22" cy="24" rx="4" ry="13" transform="rotate(-14 22 24)" fill="#ffb8c8"/><ellipse cx="48" cy="22" rx="8" ry="19" transform="rotate(14 48 24)" fill="#fff" ${O}/><ellipse cx="48" cy="24" rx="4" ry="13" transform="rotate(14 48 24)" fill="#ffb8c8"/></svg>`},
  {id:'saekdong', n:'색동 리본', slot:['tr'], cost:20, theme:'chuseok', pc:'#fff2cf', pos:'right:-15px;top:-14px;width:46px',
   svg:`<svg viewBox="-14 -10 28 20">${stripes(1, SD)}${stripes(-1, SD)}<rect x="-3.4" y="-3.4" width="6.8" height="6.8" rx="1.6" fill="#e0575f" ${T}/></svg>`},
  {id:'luckpouch', n:'복주머니 장식', slot:['bl'], cost:15, theme:'seol', pc:'#ffe3ea', pos:'left:-8px;bottom:-22px;width:28px',
   svg:`<svg viewBox="0 0 30 44"><path d="M15 0 V8" ${O}/><path d="M8 12 Q15 7 22 12 Q30 20 27 30 Q24 41 15 41 Q6 41 3 30 Q0 20 8 12Z" fill="#e0575f" ${O}/><path d="M8 12 Q15 18 22 12" fill="none" stroke="#ffd35c" stroke-width="2.6" stroke-linecap="round"/><circle cx="15" cy="29" r="3.4" fill="#ffd35c" ${T}/></svg>`},
  {id:'sakurapin', n:'벚꽃 핀', slot:['tl'], cost:15, theme:'spring', pc:'#ffe3ea', pos:'left:-14px;top:-12px;width:38px',
   svg:`<svg viewBox="0 0 34 26">${flowerSVG(10,14,'#ffc2d4')}${flowerSVG(24,10,'#ffe0ea')}${flowerSVG(21,20,'#ffc2d4')}</svg>`},
  {id:'witch', n:'마녀 모자', slot:['top'], cost:25, theme:'halloween', pc:'#efe8ff', pos:'left:50%;top:-40px;width:58px;margin-left:-29px',
   svg:`<svg viewBox="0 0 60 48"><ellipse cx="30" cy="41" rx="28" ry="6" fill="#3b3440" ${O}/><path d="M14 41 L30 3 L46 41Z" fill="#3b3440" ${O}/><path d="M17 33 H43 L45 39 H15Z" fill="#b79cf0" ${T}/><rect x="26" y="33" width="8" height="6" fill="#ffd35c" ${T}/></svg>`},
  {id:'pumpkinpin', n:'호박 핀', slot:['tr'], cost:15, theme:'halloween', pc:'#fff2cf', pos:'right:-12px;top:-12px;width:32px',
   svg:`<svg viewBox="0 0 30 28"><ellipse cx="9" cy="17" rx="7" ry="9" fill="#ee8028" ${T}/><ellipse cx="21" cy="17" rx="7" ry="9" fill="#ee8028" ${T}/><ellipse cx="15" cy="17" rx="8" ry="10" fill="#f5923a" ${T}/><path d="M14 8 Q14 2 18 2 L19 5 Q16 5 16 9Z" fill="#6bb08a" ${T}/></svg>`},
  {id:'pencil', n:'합격 연필 핀', slot:['tr'], cost:15, theme:'suneung', pc:'#fff2cf', pos:'right:-15px;top:-10px;width:50px;transform:rotate(-32deg)',
   svg:`<svg viewBox="0 0 48 16"><rect x="2" y="3" width="8" height="10" rx="2" fill="#ffb3c6" ${T}/><rect x="10" y="3" width="4" height="10" fill="#c9ccd6" ${T}/><rect x="14" y="3" width="24" height="10" fill="#ffd35c" ${T}/><path d="M38 3 L47 8 L38 13Z" fill="#f2d3a4" ${T}/><path d="M44 6.4 L47 8 L44 9.6Z" fill="#5a4646"/></svg>`},
];

/* ---------- 모양이 다른 액자 (r 모서리 · rr 바깥테두리 모서리 · clip 모양 자르기 · bw 테두리 굵기 · after 위에 얹는 무늬) ---------- */
const pct = v => (v*100).toFixed(1) + '%';
const polyStr = pts => 'polygon(' + pts.map(([x, y]) => pct(x) + ' ' + pct(y)).join(',') + ')';
const heartPoly = () => polyStr(Array.from({length:60}, (_, i) => { const t = i/60*Math.PI*2, x = 16*Math.pow(Math.sin(t), 3), y = -(13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t)); return [.5 + x/36, .5 + (y - 2.5)/34]; }));
const wavyPoly = (n, base, amp, sharp) => polyStr(Array.from({length:n*8}, (_, i) => { const a = i/(n*8)*Math.PI*2, w = sharp ? Math.abs(Math.sin(n*a/2)) : Math.cos(n*a); return [.5 + (base + amp*w)*Math.cos(a), .5 + (base + amp*w)*Math.sin(a)]; }));
const hexPoly = () => polyStr(Array.from({length:6}, (_, i) => { const a = Math.PI/6 + i*Math.PI/3; return [.5 + .5*Math.cos(a), .5 + .5*Math.sin(a)]; }));
const FRAMES_NEW = [
  {id:'circle', n:'동그란 액자',   cost:25, bd:'#fff', bg:'#fff5f8', tape:'transparent', r:'50%', rr:'50%', ring:'#ffc2d4'},
  {id:'arch',   n:'아치 액자',     cost:25, bd:'#fff', bg:'#fff5f8', tape:'transparent', r:'50% 50% 10% 10% / 42% 42% 10% 10%', rr:'50% 50% 14% 14% / 44% 44% 14% 14%', ring:'#f3d6b8'},
  {id:'heart',  n:'하트 액자',     cost:35, bd:'#fff', bg:'#fff5f8', tape:'transparent', r:'0', rr:'0', clip:heartPoly(), ring:'#ffb3c6', bw:'6px'},
  {id:'petal',  n:'꽃잎 액자',     cost:35, bd:'#fff', bg:'#fff5f8', tape:'transparent', r:'0', rr:'0', clip:wavyPoly(8, .40, .085, false), ring:'#ffc2d4', bw:'6px'},
  {id:'badge',  n:'뱃지 액자',     cost:30, bd:'#fff', bg:'#fff5f8', tape:'transparent', r:'0', rr:'0', clip:wavyPoly(14, .445, .05, true), ring:'#ffd35c', bw:'6px'},
  {id:'hex',    n:'육각 액자',     cost:25, bd:'#fff', bg:'#f4efff', tape:'transparent', r:'0', rr:'0', clip:hexPoly(), ring:'#d5c7ff', bw:'6px'},
  {id:'window', n:'창문 액자',     cost:25, bd:'#fff', bg:'#eaf2fc', tape:'transparent', r:'12%', rr:'16%', ring:'#c9925a', after:'linear-gradient(#fff,#fff) center/4px 100% no-repeat,linear-gradient(#fff,#fff) center/100% 4px no-repeat'},
  {id:'museum', n:'미술관 액자',   cost:30, bd:'#f4ece0', bg:'#f4ece0', tape:'transparent', r:'3%', rr:'6%', ring:'#3b3440', bw:'13px'},
  {id:'film',   n:'필름 액자',     cost:25, bd:'#2b2730', bg:'#2b2730', tape:'transparent', r:'4%', rr:'8%', bw:'10px', ring:'repeating-linear-gradient(180deg,#f4f1ea 0 7px,transparent 7px 14px) 4px 0/6px 100% no-repeat,repeating-linear-gradient(180deg,#f4f1ea 0 7px,transparent 7px 14px) calc(100% - 4px) 0/6px 100% no-repeat,#2b2730'},
  {id:'saekdong',theme:'chuseok', n:'색동 액자', cost:25, bd:'#fff', bg:'#fff9ef', tape:'transparent', r:'10%', rr:'14%', ring:'repeating-linear-gradient(90deg,#e0575f 0 9px,#ffd35c 9px 18px,#5aa2e8 18px 27px,#fff 27px 36px,#4db888 36px 45px)'},
  {id:'candy',  theme:'xmas',    n:'사탕 액자', cost:25, bd:'#fff', bg:'#fff5f8', tape:'transparent', r:'14%', rr:'20%', ring:'repeating-linear-gradient(45deg,#e0464f 0 8px,#fff 8px 16px)'},
  {id:'spooky', theme:'halloween',n:'으스스 액자', cost:25, bd:'#5b4680', bg:'#2c2140', tape:'transparent', r:'12%', rr:'18%', ring:'radial-gradient(circle,#ff9e3d 0 2px,transparent 3px) 0 0/14px 14px,#3b2c55'},
];
