'use strict';
/* =========================================================
   냥공부 · 사문 탭 — 개념 인출 훈련 + 자료 계산 드릴 + 예상 점수
   카드: samun_cards.json (마더텅 기출 OX 607제 · 수특 개념 체크 · 수특 용어 · 윤성훈 HOT 100)
   기록: S.sm (이 기기 localStorage, 냥공부 백업 코드에 같이 들어감)
   ========================================================= */
const SM = (() => {

/* ---------- 단원 (수특 2027 목차) + 수능 출제 비중 ----------
   w = 20문항 중 이 단원 문항 수. 2026학년도 6월·9월 모평 + 수능 60문항을 마더텅 단원 배치표로 센 값.
   f = 그 단원 문항 중 표·그래프 계산이 섞이는 비율(자료 드릴이 있는 단원만). */
const CH = [
  null,
  {n:'사회·문화 현상의 이해', u:'Ⅰ', w:2.0},
  {n:'연구 방법', u:'Ⅰ', w:0.9},
  {n:'자료 수집 방법', u:'Ⅰ', w:0.8, f:.35, drill:['exp']},
  {n:'탐구 태도와 연구 윤리', u:'Ⅰ', w:0.3},
  {n:'사회적 존재로서의 인간', u:'Ⅱ', w:2.0},
  {n:'사회 집단과 사회 조직', u:'Ⅱ', w:1.0},
  {n:'사회 구조와 일탈 행동', u:'Ⅱ', w:1.0},
  {n:'문화의 이해', u:'Ⅲ', w:2.0},
  {n:'현대 사회의 문화 양상', u:'Ⅲ', w:1.0},
  {n:'문화 변동', u:'Ⅲ', w:1.0},
  {n:'사회 불평등 현상의 이해', u:'Ⅳ', w:0.67},
  {n:'사회 이동과 계층 구조', u:'Ⅳ', w:1.0, f:.6, drill:['mob','struct']},
  {n:'다양한 사회 불평등', u:'Ⅳ', w:1.67, f:.6, drill:['pov','mix']},
  {n:'사회 복지와 복지 제도', u:'Ⅳ', w:1.0},
  {n:'사회 변동과 사회 운동', u:'Ⅴ', w:1.67},
  {n:'현대 사회의 변화', u:'Ⅴ', w:2.0, f:.5, drill:['pop']},
];
const WSUM = CH.slice(1).reduce((a,c)=>a+c.w,0);
/* 원점수 → 등급: 최근 수능 사회·문화 등급컷의 대략적인 값 (해마다 다름, 참고용) */
const CUTS = [[47,1],[43,2],[38,3],[31,4],[24,5],[18,6],[13,7],[10,8],[0,9]];
const PER_ROUND = 10, NEW_PER_ROUND = 5, GOAL_ROUNDS = 3;
const BOX_DAYS = [0, 1, 3, 7, 14, 30];

let CARDS = null, BYID = {}, loading = null;
function loadCards(){
  if (CARDS) return Promise.resolve(CARDS);
  if (loading) return loading;
  loading = fetch('samun_cards.json').then(r => r.json()).then(a => {
    CARDS = a; a.forEach(c => BYID[c.id] = c); return a;
  }).catch(e => { loading = null; throw e; });
  return loading;
}

/* ---------- 기록 ---------- */
function st(){
  if (!S.sm) S.sm = {c:{}, r:{}, d:{}, rounds:{}, hist:[]};
  return S.sm;
}
const now = () => Date.now();
function limitMs(c){ // 이 시간 안에 맞히면 "바로 떠올림"
  const len = (c.q||'').length + (c.o ? c.o.join('').length*.5 : 0);
  return Math.round(((c.t==='ox'?3:4) + len/11) * 1000);
}
function grade(c, ok, ms){
  const s = st(), k = s.c[c.id] || {b:0, n:0, w:0};
  const fast = ok && ms <= limitMs(c);
  const first = !k.n;
  k.n++; k.l = now(); k.ok = ok ? 1 : 0; k.f = fast ? 1 : 0;
  if (!ok){ k.w++; k.b = 0; k.due = now() + 10*60e3; }
  else if (fast){ k.b = Math.min(5, k.b + 1); k.due = now() + BOX_DAYS[k.b]*864e5 - 3*3600e3; }
  else { k.b = Math.max(1, k.b); k.due = now() + BOX_DAYS[k.b]*864e5 - 3*3600e3; }
  s.c[c.id] = k;
  const v = ok ? (fast ? 1 : .6) : 0;
  push(s.r, 'c'+c.ch, v, 30);
  if (first) push(s.r, 'f'+c.ch, v, 30);   // 처음 본 카드 정답률 = 아직 안 본 카드도 이 정도는 안다
  return {fast, v};
}
function push(o, k, v, n){ (o[k] = o[k] || []).push(v); if (o[k].length > n) o[k].shift(); }
const mean = (a, prior=.5, w=2) => ((a||[]).reduce((x,y)=>x+y,0) + prior*w) / ((a||[]).length + w);

/* ---------- 예상 점수 ---------- */
function recallOf(k){ // 본 카드: 상자 단계 → 지금 떠올릴 확률
  if (!k) return null;
  if (!k.ok) return .15;
  const base = [.45,.6,.75,.85,.92,.96][k.b] || .6;
  const over = Math.max(0, (now() - (k.due||now())) / 864e5); // 복습일 지난 만큼 조금씩 잊음
  return Math.max(.3, base - over*.02);
}
function chapterStats(){
  const s = st(), out = [];
  for (let ch = 1; ch < CH.length; ch++){
    const cards = CARDS.filter(c => c.ch === ch);
    const firstAcc = mean(s.r['f'+ch], .5, 3);
    let sum = 0, seen = 0, strong = 0;
    for (const c of cards){
      const r = recallOf(s.c[c.id]);
      if (r === null) sum += firstAcc; else { sum += r; seen++; if ((s.c[c.id].b||0) >= 3) strong++; }
    }
    const m = cards.length ? sum/cards.length : 0;
    const pC = .2 + .8*Math.pow(m, 1.5);                   // 개념이 m만큼 떠오를 때 5지선다 한 문항을 맞힐 확률
    const cf = CH[ch].f || 0;
    const dr = s.r['d'+ch] || [];
    const pD = .2 + .8*mean(dr, .35, 3);
    const p = (1-cf)*pC + cf*pD;
    const tries = (s.r['c'+ch]||[]).length + dr.length;
    out.push({ch, n:cards.length, seen, strong, m, p, tries, sure: tries >= 6});
  }
  return out;
}
function predict(){
  const cs = chapterStats();
  const raw = cs.reduce((a,c) => a + CH[c.ch].w/WSUM*20 * c.p * 2.5, 0);
  const sure = cs.filter(c=>c.sure).reduce((a,c)=>a+CH[c.ch].w,0) / WSUM;
  const score = Math.round(raw*2)/2;
  const g = CUTS.find(([s]) => score >= s)[1];
  return {score, grade:g, sure, cs};
}

/* ---------- 한 판 고르기 ---------- */
function pickRound(opt={}){
  const s = st(), t = now();
  let pool = CARDS.filter(c => !opt.ch || c.ch === opt.ch);
  if (opt.wrong) pool = pool.filter(c => s.c[c.id] && !s.c[c.id].ok);
  const due = pool.filter(c => s.c[c.id] && s.c[c.id].due <= t).sort((a,b) => s.c[a.id].due - s.c[b.id].due);
  const fresh = pool.filter(c => !s.c[c.id]);
  const cs = opt.ch ? null : chapterStats();
  const need = ch => cs ? CH[ch].w * (1.15 - cs[ch-1].m) : 1;       // 비중 크고 약한 단원 먼저
  const wpick = (arr, n) => {
    const a = arr.slice(), out = [];
    while (out.length < n && a.length){
      const tot = a.reduce((x,c)=>x+need(c.ch),0); let r = Math.random()*tot, i = 0;
      for (; i < a.length-1; i++){ r -= need(a[i].ch); if (r <= 0) break; }
      out.push(a.splice(i,1)[0]);
    }
    return out;
  };
  const drills = opt.wrong ? 0 : pickDrills(opt.ch);
  let slots = PER_ROUND - drills.length;
  let q = [];
  const nDue = opt.wrong ? slots : Math.min(due.length, Math.max(slots - NEW_PER_ROUND, Math.ceil(slots*.6)));
  q = q.concat(opt.wrong ? shuffle(pool).slice(0, slots) : due.slice(0, nDue));
  q = q.concat(wpick(fresh, slots - q.length));
  if (q.length < slots){ // 새 카드도 복습할 카드도 없으면: 오래된 순
    const rest = pool.filter(c => !q.includes(c)).sort((a,b) => (s.c[a.id]?.l||0) - (s.c[b.id]?.l||0));
    q = q.concat(rest.slice(0, slots - q.length));
  }
  q = shuffle(q).map(c => ({kind:'card', c}));
  drills.forEach(d => q.splice(Math.floor(Math.random()*(q.length+1)), 0, d));
  return q;
}
function pickDrills(onlyCh){
  const chs = CH.map((c,i)=>i).filter(i => i && CH[i].drill && (!onlyCh || onlyCh===i));
  if (!chs.length) return [];
  const n = onlyCh ? 4 : (Math.random() < .5 ? 1 : 2);
  const out = [];
  for (let i=0;i<n;i++){ const ch = pick(chs); out.push({kind:'drill', ch, d: DRILL[pick(CH[ch].drill)]()}); }
  return out;
}
function shuffle(a){ a = a.slice(); for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a; }
const R = (a,b) => a + Math.floor(Math.random()*(b-a+1));

/* ---------- 자료 계산 드릴: 숫자는 매번 새로 만들고, 정답은 코드가 계산 ---------- */
function numOpts(ans, cands, unit=''){
  const set = [ans]; for (const c of cands){ const v = Math.round(c*10)/10; if (!set.includes(v) && v >= 0) set.push(v); if (set.length>=4) break; }
  let d = 1; while (set.length < 4){ const v = Math.round((ans + d*(set.length%2?1:-1)*Math.max(2,Math.round(ans*.15)))*10)/10; if (v>=0 && !set.includes(v)) set.push(v); d++; }
  return {o: shuffle(set).map(v => v+unit), a: ans+unit};
}
const tbl = (head, rows) => `<table class="dt"><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map((x,i)=>i?`<td>${x}</td>`:`<th>${x}</th>`).join('')}</tr>`).join('')}</table>`;
const DRILL = {
  mob(){ // 세대 간 이동 표 (전체 자녀 대비 %)
    let cells; do { cells = Array.from({length:9}, () => R(2,20)); } while (false);
    const tot = cells.reduce((a,b)=>a+b,0); cells = cells.map(v => Math.round(v/tot*100));
    cells[4] += 100 - cells.reduce((a,b)=>a+b,0);
    const L = ['상층','중층','하층'], g = (p,c) => cells[p*3+c];
    const up = g(1,0)+g(2,0)+g(2,1), down = g(0,1)+g(0,2)+g(1,2), same = g(0,0)+g(1,1)+g(2,2);
    const kind = R(0,3);
    let q, ans, cands;
    if (kind===0){ q='부모와 비교해 <b>상승 이동</b>한 자녀는 전체의 몇 %인가?'; ans=up; cands=[down,same,up+g(1,1)]; }
    else if (kind===1){ q='부모와 비교해 <b>하강 이동</b>한 자녀는 전체의 몇 %인가?'; ans=down; cands=[up,same,down+g(1,1)]; }
    else if (kind===2){ q='<b>세대 간 이동이 일어나지 않은</b> 자녀는 전체의 몇 %인가?'; ans=same; cands=[up,down,100-up]; }
    else { const p=R(0,2); const row=g(p,0)+g(p,1)+g(p,2); ans=Math.round(g(p,p)/row*1000)/10;
      q=`부모가 <b>${L[p]}</b>인 자녀 중 부모와 <b>같은 계층</b>에 속한 자녀의 비율(%)은? (소수 첫째 자리)`; cands=[g(p,p), Math.round(g(p,p)/(g(0,p)+g(1,p)+g(2,p))*1000)/10, Math.round((row-g(p,p))/row*1000)/10]; }
    const {o,a} = numOpts(ans, cands, '%');
    return {q:'표는 갑국 자녀 세대의 부모 대비 계층 분포이다. (단위: 전체 자녀 대비 %)', html: tbl(['부모 \\ 자녀','상층','중층','하층'], L.map((l,p)=>[l,g(p,0),g(p,1),g(p,2)])) + `<p>${q}</p>`,
      o, a, x:`상승 이동 = 부모보다 자녀 계층이 높은 칸의 합 (${up}%), 하강 이동 = ${down}%, 이동 없음(대각선) = ${same}%. 조건부 비율은 '부모가 ○○인 자녀' 가로줄 합이 분모.`};
  },
  struct(){ // 계층 구조 유형
    const t = R(0,2); let v;
    if (t===0){ const hi=R(5,15), mid=R(hi+10,40); v=[hi, mid, 100-hi-mid]; }
    else if (t===1){ const mid=R(50,70), hi=R(10,100-mid-10); v=[hi, mid, 100-mid-hi]; }
    else { const mid=R(8,18), hi=R(25,45); v=[hi, mid, 100-mid-hi]; }
    const names=['피라미드형','다이아몬드형','모래시계형'];
    return {q:'다음 계층 구성 비율(%)이 나타내는 계층 구조는?', html: tbl(['','상층','중층','하층'], [['비율',...v]]),
      o: shuffle(names), a: names[t],
      x: '중층이 가장 많으면 다이아몬드형, 중층이 가장 적어 양쪽으로 쏠리면 모래시계형, 아래(하층)로 갈수록 많아지면 피라미드형.'};
  },
  pop(){ // 부양비·노령화 지수
    const young=R(8,20), old=R(10,30), work=100-young-old;
    const k = R(0,3);
    const f = v => Math.round(v*10)/10;
    const od=f(old/work*100), yd=f(young/work*100), td=f((old+young)/work*100), ai=f(old/young*100);
    const Q = [['노년 부양비',od,[yd,ai,old]],['유소년 부양비',yd,[od,td,young]],['총부양비',td,[od,yd,old+young]],['노령화 지수',ai,[od,f(young/old*100),td]]][k];
    const {o,a} = numOpts(Q[1], Q[2]);
    return {q:`갑국의 연령대별 인구 구성비(%)이다. <b>${Q[0]}</b>는? (소수 첫째 자리)`,
      html: tbl(['','0~14세','15~64세','65세 이상'], [['비율',young,work,old]]),
      o, a, x:`노년 부양비 = 65세 이상 ÷ 15~64세 × 100 (${od}), 유소년 부양비 = 0~14세 ÷ 15~64세 × 100 (${yd}), 총부양비 = 둘의 합 (${td}), 노령화 지수 = 65세 이상 ÷ 0~14세 × 100 (${ai}). 65세 이상 비율 ${old}% → ${old>=20?'초고령 사회':old>=14?'고령 사회':old>=7?'고령화 사회':'고령화 사회 이전'}.`};
  },
  pov(){ // 상대적 빈곤: 중위 소득 50% 미만
    const n = R(0,1) ? 7 : 9;
    let inc = Array.from({length:n}, () => R(8,60)*10).sort((a,b)=>a-b);
    const med = inc[(n-1)/2], line = med/2;
    const cnt = inc.filter(v => v < line).length;
    if (!cnt) inc[0] = Math.max(10, Math.floor(line/10)*10 - 10);
    const c2 = inc.filter(v => v < line).length;
    const shown = shuffle(inc);
    const {o,a} = numOpts(c2, [inc.filter(v=>v<=line).length+(inc.includes(line)?0:1), inc.filter(v=>v<inc.reduce((x,y)=>x+y,0)/n/2).length+1, c2+2], '가구');
    return {q:`갑국 가구 ${n}개의 월 소득(만 원)이다. 중위 소득의 50% 미만을 상대적 빈곤으로 볼 때, 상대적 빈곤 가구 수는?`,
      html: tbl(['가구',...shown.map((_,i)=>String.fromCharCode(65+i))], [['소득',...shown]]),
      o, a, x:`소득 순으로 줄 세우면 가운데(${(n+1)/2}번째)가 중위 소득 ${med}만 원 → 빈곤선 ${line}만 원. 이보다 적은 가구 = ${c2}가구. (평균 소득이 아니라 '중위' 소득!)`};
  },
  mix(){ // 가중 평균: 집단 비율 × 집단 내 비율
    const m = R(4,7)*10, pm = R(3,9)*10, pf = R(2,8)*10;
    const tot = Math.round((m*pm + (100-m)*pf)/100*10)/10;
    const {o,a} = numOpts(tot, [(pm+pf)/2, Math.round(m*pm/100*10)/10, pm-pf]);
    return {q:`갑국 근로자 중 남성은 ${m}%, 여성은 ${100-m}%이다. 남성 근로자 중 정규직은 ${pm}%, 여성 근로자 중 정규직은 ${pf}%이다. 전체 근로자 중 정규직 비율(%)은?`,
      html:'', o, a, x:`전체 = ${m}%×${pm}% + ${100-m}%×${pf}% = ${tot}%. 두 비율을 그냥 평균(${(pm+pf)/2}%)하면 틀린다 — 집단 크기가 다르면 가중 평균.`};
  },
  exp(){ // 실험 효과
    const b1=R(40,70), b2=b1+R(-5,5), g1=R(5,25), g2=R(0,10);
    const eff = g1-g2;
    const {o,a} = numOpts(eff, [g1, b1+g1-b2, g1+g2], '점');
    return {q:'독서 프로그램이 성적에 미치는 영향을 알아보는 실험 결과이다. 통제 집단의 변화까지 고려할 때, 프로그램의 순수 효과는?',
      html: tbl(['','사전 검사','사후 검사'], [['실험 집단',b1,b1+g1],['통제 집단',b2,b2+g2]]),
      o, a, x:`실험 집단 변화 ${g1}점 − 통제 집단 변화 ${g2}점 = ${eff}점. 독립 변인(프로그램)을 처치한 쪽이 실험 집단, 성적은 종속 변인.`};
  },
};

/* ---------- 화면 ---------- */
let game = null, timer = null;
const esc = s => String(s).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));

function render(){
  const box = $('#sm-body'); if (!box) return;
  if (!CARDS){ box.innerHTML = '<div class="card">카드 불러오는 중…</div>';
    loadCards().then(render).catch(()=>{ box.innerHTML = '<div class="card">카드를 못 불러왔어요. 인터넷 연결을 확인해 주세요.</div>'; }); return; }
  const s = st(), P = predict(), today = dayOf(), rounds = s.rounds[today] || 0;
  const wrongN = Object.values(s.c).filter(k => !k.ok).length;
  const dueN = CARDS.filter(c => s.c[c.id] && s.c[c.id].due <= now()).length;
  const seenN = Object.keys(s.c).length;
  const prev = s.hist.length ? s.hist[s.hist.length-1] : null;
  box.innerHTML = `
    <div class="card smscore">
      <div class="lbl">예상 점수 <span class="note">/ 50점</span></div>
      <div class="big"><b>${seenN ? P.score : '?'}</b><span class="gr">${seenN ? P.grade+'등급' : '측정 전'}</span></div>
      <div class="meter"><i style="width:${Math.round(P.sure*100)}%"></i></div>
      <p class="note">${seenN ? `단원 ${Math.round(P.sure*100)}% 측정 완료 · 풀수록 정확해져요` : '한 판만 풀면 첫 예상 점수가 나와요'}</p>
    </div>
    <button class="btn" id="sm-go">한 판 풀기 <small class="jua" style="font-size:15px;opacity:.85">· 10문제 약 4분</small></button>
    <div class="smday">${Array.from({length:GOAL_ROUNDS},(_,i)=>`<i class="${i<rounds?'on':''}"></i>`).join('')}
      <span>${rounds>=GOAL_ROUNDS ? `오늘 목표 끝! (${rounds}판)` : `오늘 ${rounds} / ${GOAL_ROUNDS}판`}</span></div>
    <div class="row">
      <button class="btn sub butter" id="sm-wrong" ${wrongN?'':'disabled'}>틀린 것만 (${wrongN})</button>
      <button class="btn sub mint" id="sm-drill">자료 계산 연습</button>
    </div>
    <p class="note" style="text-align:center;margin:10px 0 16px">복습할 카드 ${dueN}장 · 본 카드 ${seenN} / ${CARDS.length}장</p>
    <div class="card sec"><h3>단원별 <span class="note">— 눌러서 그 단원만 풀기</span></h3>
      ${P.cs.map(c => `<button class="smch" data-ch="${c.ch}">
        <span class="t"><em>${CH[c.ch].u}</em>${c.ch}. ${CH[c.ch].n}${CH[c.ch].w>=1.6?' <b class="hot">자주 나옴</b>':''}</span>
        <span class="tr"><i style="width:${c.tries?Math.round(c.m*100):0}%;background:${c.m>=.8?'var(--mint)':c.m>=.55?'var(--butter)':'var(--pink)'}"></i></span>
        <span class="v">${c.tries ? Math.round(c.m*100)+'%' : '—'}</span></button>`).join('')}
    </div>
    <p class="note" style="font-size:14px;line-height:1.5">출처: 2027 마더텅 수능기출 사회·문화 「기출 OX 607제」(정답·해설은 교재 정답표), 2027 EBS 수능특강 사회·문화 개념 체크·용어 정리, 윤성훈 사회문화 HOT 100.
      예상 점수는 2026학년도 6·9월 모평과 수능의 단원별 문항 수로 가중한 추정이고, 등급은 최근 수능의 대략적인 등급컷으로 바꾼 참고값이에요.</p>`;
  $('#sm-go').onclick = () => start({});
  $('#sm-wrong').onclick = () => start({wrong:true});
  $('#sm-drill').onclick = () => start({drillOnly:true});
  box.querySelectorAll('.smch').forEach(b => b.onclick = () => start({ch:+b.dataset.ch}));
}

function start(opt){
  unlockAudio && unlockAudio();
  loadCards().then(() => {
    let q;
    if (opt.drillOnly){ q = []; for (let i=0;i<6;i++){ const chs=[3,12,13,16], ch=pick(chs); q.push({kind:'drill', ch, d:DRILL[pick(CH[ch].drill)]()}); } }
    else q = pickRound(opt);
    if (!q.length){ toast('풀 카드가 없어요'); return; }
    const retry = [];
    game = {q, i:0, t0:now(), res:[], retry, opt, before: predict().score};
    $('#quiz').classList.add('on'); document.body.style.overflow='hidden';
    catPic('normal'); $('#qz-cat').className='qzcat';
    showQ();
  }).catch(() => toast('카드를 못 불러왔어요'));
}

function catPic(kind){ try{ $('#qz-cat').style.backgroundImage = `url(${photoUrl(pick(PHOTOS[kind]))})`; }catch(e){} }

function showQ(){
  const g = game, it = g.q[g.i];
  const total = g.q.length;
  $('#qz-prog').innerHTML = g.q.map((_,i)=>`<i class="${i<g.i?(g.res[i]?.ok?'ok':'no'):i===g.i?'cur':''}"></i>`).join('');
  const tag = CH[it.kind==='card'?it.c.ch:it.ch];
  $('#qz-tag').textContent = (it.kind==='drill'?'자료 계산 · ':'') + tag.n;
  $('#qz-fb').className = 'qzfb'; $('#qz-fb').innerHTML = '';
  let html = '', opts = [];
  if (it.kind === 'card'){
    const c = it.c;
    const lines = c.q.split('\n');
    const bl = t => esc(t).replace(/\(\s*\)/g,'<span class="blank"></span>').replace(/\( ([①②③]) \)/g,'<span class="blank n">$1</span>');
    html = lines.length > 1 ? `<p class="qzlead">${bl(lines[0])}</p><p>${bl(lines.slice(1).join(' '))}</p>` : `<p>${bl(c.q)}</p>`;
    if (c.t === 'ox') opts = ['O','X']; else opts = shuffle(c.o);
    it.lim = limitMs(c);
  } else {
    html = `<p class="qzlead">${it.d.q}</p>${it.d.html}`;
    opts = it.d.o; it.lim = 45000;
  }
  $('#qz-q').innerHTML = html;
  const box = $('#qz-o');
  box.className = 'qzo' + (opts.length===2 && opts[0]==='O' ? ' ox' : '');
  const multi = it.kind==='card' && /\( ② \)|\(\s*\)[^(]*\(\s*\)/.test(it.c.q);
  const lab = o => multi && o.includes(', ') ? o.split(', ').map((p,i)=>`<em class="bn">${'①②③'[i]}</em>${esc(p)}`).join('<span class="sp"></span>') : esc(o);
  box.innerHTML = opts.map(o => `<button class="qzb" data-v="${esc(o)}">${o==='O'?'<span class="oxo">O</span>':o==='X'?'<span class="oxx">X</span>':lab(o)}</button>`).join('');
  box.querySelectorAll('.qzb').forEach(b => b.onclick = () => answer(b.dataset.v, b));
  it.t0 = now();
  const bar = $('#qz-time'); bar.style.transition='none'; bar.style.width='100%'; bar.classList.remove('late');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ bar.style.transition=`width ${it.lim}ms linear`; bar.style.width='0%'; }));
  clearTimeout(timer); timer = setTimeout(()=>bar.classList.add('late'), it.lim);
}

function answer(v, btn){
  const g = game, it = g.q[g.i]; if (it.done) return; it.done = true;
  clearTimeout(timer);
  const ms = now() - it.t0;
  let ok, right, exp = '', src = '';
  if (it.kind === 'card'){
    const c = it.c;
    right = c.t === 'ox' ? (c.a ? 'O' : 'X') : c.a;
    ok = v === right;
    const r = grade(c, ok, ms); it.fast = r.fast;
    if (c.t === 'ox') exp = c.a ? '옳은 문장이에요.' + (c.x ? '<br>' + esc(c.x) : '') : (c.x ? `틀린 문장 → <b>${esc(c.x)}</b>` : '틀린 문장이에요.');
    else exp = (ok ? '' : `정답: <b>${esc(c.a)}</b>`) + (c.x ? (ok ? '' : '<br>') + esc(c.x) : '');
    src = c.s.join(' · ');
    if (!ok) g.retry.push(c);
  } else {
    right = it.d.a; ok = v === right; it.fast = ok && ms <= it.lim;
    push(st().r, 'd'+it.ch, ok ? 1 : 0, 30);
    exp = (ok ? '' : `정답: <b>${esc(right)}</b><br>`) + it.d.x;
    src = '자료 계산 (숫자는 매번 새로 만들어요)';
  }
  g.res[g.i] = {ok, fast: it.fast};
  $('#qz-o').querySelectorAll('.qzb').forEach(b => {
    if (b.dataset.v === right) b.classList.add('right');
    else if (b === btn) b.classList.add('wrong');
    b.disabled = true;
  });
  $('#qz-time').style.transition='none';
  const fb = $('#qz-fb');
  const head = ok ? (it.fast ? pick(['바로 떠올렸다!','번개 인출!','완벽해!','이게 실력이지']) : pick(['정답! 조금만 더 빨리','맞았어, 다음엔 더 빨리 떠올려 보자']))
                  : pick(['괜찮아, 지금 외우면 돼','여기서 틀린 게 수능에서 맞는 거야','이거 곧 다시 나올 거야']);
  fb.className = 'qzfb on ' + (ok ? 'ok' : 'no');
  fb.innerHTML = `<div class="h">${head}</div>${exp?`<div class="x">${exp}</div>`:''}<div class="s">${esc(src)}</div>
    <button class="btn ${ok?'mint':''}" id="qz-next" style="${ok?'color:var(--ink)':''}">${g.i+1<g.q.length?'다음':'결과 보기'}</button>`;
  $('#qz-next').onclick = next;
  requestAnimationFrame(() => fb.scrollIntoView({behavior:'smooth', block:'end'}));
  if (ok) { try{ chime(); }catch(e){} }
  $('#qz-cat').className = 'qzcat ' + (ok ? 'yay' : 'hm');
  catPic(ok ? 'happy' : 'tired');
  if (ok && it.fast && it.kind==='card' && it.c.t==='ox') { g.auto = setTimeout(next, 1300); }
  save();
}

function next(){
  clearTimeout(game.auto);
  const g = game; if (!g) return;
  // 틀린 카드는 판 끝에 한 번 더 (같은 판 안에서 바로잡기)
  if (g.i+1 >= g.q.length && g.retry.length && !g.retried){
    g.retried = true;
    g.retry.slice(0,5).forEach(c => g.q.push({kind:'card', c, again:true}));
    g.retry = [];
  }
  g.i++;
  if (g.i >= g.q.length) return finish();
  showQ();
}

function finish(){
  const g = game; game = null;
  $('#quiz').classList.remove('on'); document.body.style.overflow='';
  const main = g.res.slice(0, g.q.filter(x=>!x.again).length);
  const ok = main.filter(r=>r.ok).length, fast = main.filter(r=>r.fast).length, n = main.length;
  const s = st(), d = dayOf();
  s.rounds[d] = (s.rounds[d]||0) + 1;
  const P = predict();
  s.hist.push({d, sc:P.score}); if (s.hist.length > 120) s.hist.shift();
  const mins = Math.max(1, Math.round((now()-g.t0)/60000));
  const before = studyDays().length;
  S.sessions.push({d, s:'soc', m:mins, t:now(), h:'quiz'});
  const churu = 1 + (ok >= n*.8 ? 1 : 0);
  S.churu += churu;
  save(); renderAll(); render();
  const diff = Math.round((P.score - g.before)*2)/2;
  const line = ok === n ? pick(['전부 맞았어! {cat이} 꼬리를 멈추질 않아','만점이야, {me} 진짜 멋있다'])
             : ok >= n*.7 ? pick(['거의 다 맞았어! 틀린 건 금방 다시 나와','{me} 머릿속에 개념이 쌓이는 중'])
             : pick(['틀린 만큼 외운 거야. 한 판 더 하면 확 달라져','괜찮아, 처음은 원래 이래. {cat이} 옆에 있을게']);
  const after = studyDays().length;
  openModal(`${miniCat()}<p class="rewardnum">${ok} / ${n}</p>
    <p class="note" style="margin:-4px 0 8px">바로 떠올린 것 ${fast}개 · 츄르 +${churu}</p>
    <p class="line">${fmt(line)}</p>
    <p class="note">예상 점수 <b>${P.score}점</b> (${P.grade}등급)${diff > 0 ? ` · <b style="color:#3fa585">+${diff}</b>` : ''}</p>
    ${after>before?`<p class="note">오늘 발자국 도장 쾅! 함께한 날 ${after}일째</p>`:''}
    <br><div class="row" style="margin:0"><button class="btn sub ghost" id="sm-done">그만</button><button class="btn sub" id="sm-again" style="color:#fff">한 판 더</button></div>`);
  $('#sm-done').onclick = () => { closeModal(); checkUnlock(); };
  $('#sm-again').onclick = () => { closeModal(); start(g.opt); };
}

function quit(){
  if (!game) return;
  const g = game; clearTimeout(timer); clearTimeout(g.auto);
  game = null; $('#quiz').classList.remove('on'); document.body.style.overflow='';
  save(); render();
  if (g.res.filter(Boolean).length >= 3) toast('푼 문제는 다 기록했어요');
}

return {render, start, quit, predict:()=>CARDS?predict():null, loadCards, _DRILL:DRILL, _CH:CH};
})();
