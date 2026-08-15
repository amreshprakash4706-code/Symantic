/**
 * SYMANTIC — Production Frontend
 * Modular, accessible, performant, XSS-safe
 */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function debounce(fn, wait=160){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>fn.apply(this,a),wait);};}
function throttle(fn, limit=100){let inT;return function(...a){if(!inT){fn.apply(this,a);inT=true;setTimeout(()=>inT=false,limit);}};}
function safeJSONParse(k,f){try{const r=localStorage.getItem(k);return r?JSON.parse(r):f;}catch{return f;}}
function safeJSONSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){console.warn(e);}}

let savedArticles = safeJSONParse('symantic_saved', []);
let currentLiveFilter = 'all';
let accuracyChartInstance = null;
let currentTheme = localStorage.getItem('symantic_theme') || 'dark';
let lastFocusedElement = null;
let chatBusy = false;
let openModalCount = 0;
let chatHistory = []; // for multi-turn context


function lockBodyScroll() {
  openModalCount += 1;
  if (openModalCount === 1) {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
}
function unlockBodyScroll() {
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
}

function updateAuthUI() {
  const user = safeJSONParse('symantic_user', null);
  const loginBtns = $$('button[onclick*="showLoginModal"]');
  const trialBtns = $$('button[onclick*="showSubscribeModal"]');
  if (user && user.loggedIn) {
    loginBtns.forEach(b => {
      b.textContent = user.pro ? 'Pro Member' : (user.name || 'Account');
      b.onclick = () => showToast(user.pro ? 'You have full Pro access.' : 'Upgrade to Pro for unlimited insights.', 'info');
    });
    if (user.pro) {
      trialBtns.forEach(b => {
        b.textContent = 'Pro Active';
        b.classList.add('opacity-80');
        b.onclick = () => showToast('Your Pro trial is active. Enjoy unlimited access.');
      });
    }
  }
}

function initializeTailwind() {
  if (typeof tailwind !== 'undefined') {
    tailwind.config = { theme: { extend: { fontFamily: { display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'] } } } };
  }
}

function init() {
  initializeTailwind();
  applyTheme();
  updateAuthUI();
  initLiveFeed();
  initNewsSection();
  initChat();
  initQuickPrompts();
  initAccuracyChart();
  initPredictions();
  initBackToTop();
  initScrollProgress();
  initTiltCards();
  initButtonRipples();
  updateSavedCount();
  initCommandPaletteKeyboard();
  initModalFocusTraps();
  initMetricKeyboard();

  setInterval(() => { if (document.hidden) return; if (Math.random() > 0.75) addLiveUpdate(true); }, 19500);
  setInterval(() => {
    if (document.hidden) return;
    if (Math.random() > 0.88) {
      const metrics = $$('#intelligence .metric-card');
      if (!metrics.length) return;
      const m = metrics[Math.floor(Math.random()*metrics.length)];
      const n = m.querySelector('.metric-value');
      if (!n) return;
      // Skip structured metrics that contain nested spans (accuracy, readtime)
      if (n.querySelector('span')) return;
      let val = parseFloat(n.textContent.replace(/[^0-9.]/g,''));
      if (isNaN(val) || val <= 50) return;
      const nv = val + (Math.random()>0.5?0.8:-0.5);
      if (n.textContent.includes('.')) n.textContent = nv.toFixed(1);
      else if (val > 1000) n.textContent = Math.round(nv).toLocaleString();
    }
  }, 24000);

  setTimeout(() => {
    const tip = document.createElement('div');
    tip.setAttribute('role','status'); tip.setAttribute('aria-live','polite');
    tip.style.cssText = 'position:fixed;bottom:22px;right:22px;background:rgba(255,255,255,0.05);color:#64748b;font-size:10px;padding:5px 13px;border-radius:9999px;border:1px solid rgba(255,255,255,0.08);z-index:50;pointer-events:none';
    tip.innerHTML = 'Press <span class="font-mono text-white/60">⌘K</span> for command palette';
    document.body.appendChild(tip);
    setTimeout(() => tip.remove(), 6200);
  }, 9800);
}


function initMetricKeyboard() {
  $$('#intelligence .metric-card').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

function initScrollProgress() {
  const p = $('#scroll-progress'); if (!p) return;
  window.addEventListener('scroll', throttle(() => {
    const st = window.scrollY, dh = document.documentElement.scrollHeight - window.innerHeight;
    p.style.width = (dh>0 ? (st/dh)*100 : 0) + '%';
  }, 32), {passive:true});
}

function initTiltCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) return;
  $$('.premium-card, .prediction-card, .news-card, .tilt-card').forEach(card => {
    let raf=null;
    card.addEventListener('mousemove', e => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX-r.left)/r.width)*100, y=((e.clientY-r.top)/r.height)*100;
        card.style.transform = `perspective(1200px) rotateX(${(50-y)/14}deg) rotateY(${(x-50)/14}deg)`;
      });
    }, {passive:true});
    card.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
      card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0)';
      setTimeout(() => card.style.transition = 'transform 0.4s cubic-bezier(0.23,1,0.32,1)', 600);
    });
  });
}

function initButtonRipples() {
  $$('.gaming-btn, .premium-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const c = document.createElement('span'), d = Math.max(btn.clientWidth, btn.clientHeight), r = d/2;
      c.style.width = c.style.height = d+'px'; c.style.left = (e.offsetX-r)+'px'; c.style.top = (e.offsetY-r)+'px';
      c.classList.add('ripple');
      const ex = btn.getElementsByClassName('ripple')[0]; if (ex) ex.remove();
      btn.appendChild(c); setTimeout(() => c.remove(), 650);
    });
  });
}

function initBackToTop() {
  const btn = $('.back-to-top'); if (!btn) return;
  window.addEventListener('scroll', throttle(() => {
    if (window.scrollY > 650) { btn.classList.remove('hidden'); btn.classList.add('flex'); }
    else { btn.classList.remove('flex'); btn.classList.add('hidden'); }
  }, 100), {passive:true});
}

function initAccuracyChart() {
  const ctx = $('#accuracyChart'); if (!ctx || typeof Chart === 'undefined') return;
  if (accuracyChartInstance) accuracyChartInstance.destroy();
  accuracyChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels: ['Jan 27','Jan 28','Jan 29','Jan 30','Jan 31','Feb 1','Feb 2'], datasets: [{ label: 'AI Accuracy %', data: [92.4,93.1,91.9,94.5,93.8,94.6,94.7], borderColor: '#00f5ff', backgroundColor: 'rgba(0,245,255,0.08)', borderWidth: 3.5, tension: 0.38, fill: true, pointBackgroundColor: '#00f5ff', pointBorderColor: '#050507', pointBorderWidth: 2.5, pointRadius: 4.5 }] },
    options: { responsive: true, maintainAspectRatio: false, interaction: {mode:'index',intersect:false}, plugins: { legend:{display:false}, tooltip:{ backgroundColor:'#111114', borderColor:'#00f5ff', borderWidth:1, displayColors:false, callbacks:{label:c=>c.raw+'%'} } }, scales: { x:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#64748b',font:{size:11}}}, y:{min:89,max:96,grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#64748b',font:{size:11},callback:v=>v+'%'}} } }
  });
}

let liveFeedItems = [
  {id:1,time:'just now',type:'news',text:'Esports World Cup 2026 officially opens in Paris — $30M prize pool',confidence:null},
  {id:2,time:'47s ago',type:'prediction',text:'Halo: Campaign Evolved — 89% confidence for July 28 launch',confidence:89},
  {id:3,time:'3m ago',type:'patch',text:'Apex Legends mid-season update live — new legend + balance changes',confidence:82},
  {id:4,time:'11m ago',type:'news',text:"Assassin's Creed Black Flag Resynced reviews are overwhelmingly positive",confidence:null},
  {id:5,time:'19m ago',type:'prediction',text:'Black Myth: Wukong 2 still 96% likely for TGA 2026 reveal',confidence:96},
  {id:6,time:'27m ago',type:'news',text:'T1 and Gen.G advance to MSI 2026 semi-finals after dominant series',confidence:null},
  {id:7,time:'41m ago',type:'prediction',text:'Valorant Champions 2026 favorite shift after patch 9.04 — 78% confidence',confidence:78},
  {id:8,time:'1h ago',type:'patch',text:'CS2 major update improves sub-tick and anti-cheat detection rates',confidence:88},
];

function initLiveFeed() {
  const c = $('#live-feed-list'); if (!c) return;
  c.innerHTML = ''; liveFeedItems.forEach(i => c.appendChild(createLiveItem(i)));
}

function createLiveItem(item) {
  const div = document.createElement('div');
  div.className = 'live-item px-7 py-[18px] flex items-start gap-x-4 group border-l-2 border-transparent hover:border-[#00f5ff]/40 cursor-pointer';
  div.dataset.type = item.type; div.dataset.id = item.id; div.setAttribute('role','listitem'); div.tabIndex = 0;
  let icon='', badge='';
  if (item.type==='prediction'){ icon='<i class="fa-solid fa-brain text-[#7c3aed] mt-0.5" aria-hidden="true"></i>'; badge=`<span class="text-[10px] font-mono px-2.5 py-px rounded bg-[#7c3aed]/10 text-[#7c3aed]">${item.confidence}%</span>`; }
  else if (item.type==='news'){ icon='<i class="fa-solid fa-newspaper text-[#00f5ff] mt-0.5" aria-hidden="true"></i>'; badge='<span class="text-[10px] px-2.5 py-px rounded bg-red-500/10 text-red-400">LIVE</span>'; }
  else { icon='<i class="fa-solid fa-sync text-emerald-400 mt-0.5" aria-hidden="true"></i>'; badge='<span class="text-[10px] px-2.5 py-px rounded bg-emerald-400/10 text-emerald-400">PATCH</span>'; }
  div.innerHTML = `<div class="mt-0.5 flex-shrink-0">${icon}</div><div class="flex-1 min-w-0"><div class="flex items-center justify-between gap-x-3"><div class="font-medium text-[14px] pr-3 leading-snug">${escapeHTML(item.text)}</div><div class="flex-shrink-0 flex items-center gap-x-2.5">${badge}<span class="font-mono text-xs text-white/40 tabular-nums">${escapeHTML(item.time)}</span></div></div></div>`;
  const open = () => showLiveDetail(item);
  div.addEventListener('click', open);
  div.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' '){e.preventDefault();open();} });
  return div;
}

function showLiveDetail(item) {
  lastFocusedElement = document.activeElement;
  lockBodyScroll();
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/90 z-[130] flex items-center justify-center p-6';
  modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true');
  const typeLabel = item.type === 'prediction' ? 'PREDICTION' : item.type === 'patch' ? 'PATCH' : 'NEWS';
  const conf = item.confidence ? `<div class="mt-5"><div class="flex justify-between text-sm mb-2"><span class="text-white/60">Confidence</span><span class="font-mono text-emerald-400 font-bold">${item.confidence}%</span></div><div class="h-1.5 bg-white/10 rounded-full overflow-hidden"><div class="confidence-bar" style="width:${item.confidence}%"></div></div></div>` : '';
  modal.innerHTML = `<div class="glass max-w-lg w-full border border-white/10 rounded-3xl p-9" role="document"><div class="flex items-center justify-between"><span class="px-3.5 py-1 text-[10px] font-bold tracking-widest rounded-2xl bg-white/10 text-white/80">${typeLabel}</span><span class="font-mono text-xs text-white/40">${escapeHTML(item.time)}</span></div><h3 class="text-2xl font-bold tracking-tight mt-5 leading-snug">${escapeHTML(item.text)}</h3>${conf}<p class="mt-6 text-sm text-white/70 leading-relaxed">Symantic models continuously scan social signals, official channels, betting markets, and match telemetry. This item was surfaced because it crossed our internal significance threshold.</p><div class="mt-8 flex gap-3"><button type="button" class="live-ask flex-1 py-3.5 bg-white text-black font-bold rounded-3xl active:scale-[0.985]">Ask AI about this</button><button type="button" class="live-close flex-1 py-3.5 border border-white/20 hover:bg-white/5 rounded-3xl font-semibold text-sm">Close</button></div></div>`;
  const close = () => { modal.remove(); document.removeEventListener('keydown',onKey); unlockBodyScroll(); if(lastFocusedElement) lastFocusedElement.focus(); };
  const onKey = e => { if(e.key==='Escape') close(); };
  modal.addEventListener('click', e => { if(e.target===modal) close(); });
  modal.querySelector('.live-close').addEventListener('click', close);
  modal.querySelector('.live-ask').addEventListener('click', () => {
    close();
    $('#ai')?.scrollIntoView({behavior:'smooth'});
    setTimeout(() => { const i=$('#chat-input'); if(i){ i.value = `Tell me more about: ${item.text}`; sendChatMessage(); } }, 700);
  });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(modal);
}

function filterLiveFeed(type) {
  currentLiveFilter = type;
  $$('.filter-tab').forEach(t => t.classList.remove('active'));
  const a = $('#filter-'+type); if (a) a.classList.add('active');
  const list = $('#live-feed-list');
  if (!list) return;
  let visible = 0;
  for (const item of list.children) {
    if (item.classList.contains('live-empty')) continue;
    const show = type === 'all' || item.dataset.type === type;
    item.style.display = show ? '' : 'none';
    if (show) visible += 1;
  }
  let empty = list.querySelector('.live-empty');
  if (visible === 0) {
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'live-empty px-7 py-12 text-center text-sm text-white/50';
      empty.textContent = 'No items in this category right now.';
      list.appendChild(empty);
    }
  } else if (empty) {
    empty.remove();
  }
}

function addLiveUpdate(silent=false) {
  const c = $('#live-feed-list'); if (!c) return;
  const pool = [
    {id:Date.now(),time:'just now',type:'prediction',text:'Elden Ring Nightreign sales exceed expectations — 92% confidence',confidence:92},
    {id:Date.now()+1,time:'just now',type:'news',text:'Major esports org announces new partnership with Symantic',confidence:null},
    {id:Date.now()+2,time:'just now',type:'patch',text:'Apex Legends Season 22 balance changes revealed early',confidence:81},
    {id:Date.now()+3,time:'just now',type:'prediction',text:'GTA VI PC version now 91% likely for 2026 window',confidence:91},
    {id:Date.now()+4,time:'just now',type:'news',text:'Riot confirms next Valorant Champions location — community reaction mixed',confidence:null},
    {id:Date.now()+5,time:'just now',type:'patch',text:'Overwatch 2 mid-season balance pass targets tank identity',confidence:76},
  ];
  const item = pool[Math.floor(Math.random()*pool.length)];
  const el = createLiveItem(item);
  el.style.opacity='0'; el.style.transform='translateY(-18px)';
  c.insertBefore(el, c.firstChild);
  while (c.children.length>12) c.removeChild(c.lastChild);
  requestAnimationFrame(() => { el.style.transition='all 0.5s cubic-bezier(0.23,1,0.32,1)'; el.style.opacity='1'; el.style.transform='translateY(0)'; });
  if (currentLiveFilter!=='all' && el.dataset.type!==currentLiveFilter) el.style.display='none';
  if (!silent) showToast('New live intelligence received','success');
}

let predictionsData = [
  {id:1,title:'Black Myth: Wukong 2 Announcement',confidence:98,date:'TGA 2026',category:'Rumor'},
  {id:2,title:'GTA VI Trailer 2 Release',confidence:87,date:'Before March 2026',category:'Prediction'},
  {id:3,title:'Valorant Patch 9.04 Meta Shift',confidence:91,date:'Mid February',category:'Patch'},
  {id:4,title:'Elden Ring Nightreign Sales',confidence:92,date:'Q1 2026',category:'Prediction'},
  {id:5,title:'T1 Wins Worlds 2027',confidence:71,date:'Late 2027',category:'Esports'},
  {id:6,title:'Halo: Campaign Evolved Launch',confidence:89,date:'July 28 2026',category:'Prediction'},
  {id:7,title:'CS2 Major Winner Prediction',confidence:74,date:'Q4 2026',category:'Esports'},
  {id:8,title:'Apex Legends New Legend Impact',confidence:83,date:'Current Season',category:'Patch'},
];

function initPredictions(){ renderPredictions(predictionsData); }

function renderPredictions(data) {
  const grid = $('#predictions-grid'); if (!grid) return;
  grid.innerHTML = '';
  data.forEach(pred => {
    const card = document.createElement('div');
    card.className = 'glass border border-white/10 rounded-3xl p-7 prediction-card cursor-pointer';
    card.setAttribute('role','button'); card.tabIndex=0;
    card.setAttribute('aria-label',`Prediction: ${pred.title}, ${pred.confidence}% confidence`);
    const cat = pred.category==='Esports'?'bg-violet-400/10 text-violet-400':pred.category==='Patch'?'bg-emerald-400/10 text-emerald-400':'bg-orange-400/10 text-orange-400';
    card.innerHTML = `<div class="flex justify-between items-start mb-5"><span class="px-3.5 py-1 text-[10px] font-bold tracking-widest rounded-2xl ${cat}">${escapeHTML(pred.category)}</span><span class="text-xs text-white/40 font-mono">${escapeHTML(pred.date)}</span></div><div class="font-semibold text-[15.5px] leading-snug tracking-tight mb-5">${escapeHTML(pred.title)}</div><div class="mb-2 flex justify-between text-xs"><span class="text-white/60">AI Confidence</span><span class="font-mono text-emerald-400 font-semibold">${pred.confidence}%</span></div><div class="h-1.5 bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow="${pred.confidence}" aria-valuemin="0" aria-valuemax="100"><div class="confidence-bar" style="width:${pred.confidence}%"></div></div>`;
    const open = () => showPredictionModal(pred);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();open();} });
    grid.appendChild(card);
  });
}

function showPredictionModal(pred) {
  lastFocusedElement = document.activeElement;
  lockBodyScroll();
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/90 z-[130] flex items-center justify-center p-6';
  modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-labelledby','pred-modal-title');
  const cat = pred.category==='Esports'?'bg-violet-400/10 text-violet-400':pred.category==='Patch'?'bg-emerald-400/10 text-emerald-400':'bg-orange-400/10 text-orange-400';
  modal.innerHTML = `<div class="glass max-w-lg w-full border border-white/10 rounded-3xl p-9" role="document"><div class="flex justify-between items-start"><span class="px-4 py-1 text-xs font-bold tracking-widest rounded-3xl ${cat}">${escapeHTML(pred.category)}</span><span class="text-xs text-white/40 font-mono">${escapeHTML(pred.date)}</span></div><h3 id="pred-modal-title" class="text-3xl font-bold tracking-tighter mt-6">${escapeHTML(pred.title)}</h3><div class="mt-8"><div class="flex justify-between text-sm mb-2.5"><span class="text-white/60">AI Confidence</span><span class="font-mono text-emerald-400 font-bold text-lg">${pred.confidence}%</span></div><div class="h-2 bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow="${pred.confidence}" aria-valuemin="0" aria-valuemax="100"><div class="confidence-bar" style="width:${pred.confidence}%"></div></div></div><div class="mt-7 text-sm text-white/70 leading-relaxed">Our model analyzed thousands of data points including social sentiment, betting odds, historical patterns, and insider signals. This prediction carries a <strong>${pred.confidence}% confidence score</strong>.</div><div class="mt-9 flex gap-3"><button type="button" class="pred-watchlist flex-1 py-3.5 border border-white/20 hover:bg-white/5 rounded-3xl font-semibold text-sm">Add to Watchlist</button><button type="button" class="pred-ask-ai flex-1 py-3.5 bg-white text-black font-bold rounded-3xl active:scale-[0.985]">Ask AI about this</button></div></div>`;
  const close = () => { modal.remove(); document.removeEventListener('keydown',onKey); unlockBodyScroll(); if(lastFocusedElement) lastFocusedElement.focus(); };
  const onKey = e => { if(e.key==='Escape') close(); };
  modal.addEventListener('click', e => { if(e.target===modal) close(); });
  modal.querySelector('.pred-watchlist').addEventListener('click', () => { close(); showToast('Added to watchlist'); });
  modal.querySelector('.pred-ask-ai').addEventListener('click', () => { close(); $('#ai')?.scrollIntoView({behavior:'smooth'}); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(modal);
  modal.querySelector('.pred-ask-ai')?.focus();
}

function refreshPredictions() {
  const grid = $('#predictions-grid'); if (!grid) return;
  grid.style.transition='opacity 0.2s'; grid.style.opacity='0.25';
  setTimeout(() => {
    predictionsData.forEach(p => { p.confidence = Math.round(Math.max(68, Math.min(98, p.confidence + (Math.random()-0.5)*5))); });
    renderPredictions(predictionsData);
    grid.style.opacity='1';
    showToast('Predictions refreshed with latest model output','success');
  }, 280);
}

// News data and functions (full feature set preserved)
let newsData = [
  {id:1,category:'esports',title:'Esports World Cup 2026 opens in Paris with record $30M prize pool',time:'just now',summary:'Team Falcons leads early as top clubs battle in the biggest esports event of the year.',full:'The Esports World Cup 2026 has officially kicked off in Paris. With a record $30M prize pool and strong participation from Team Falcons, Vitality, and AG.AL, this is shaping up to be the most competitive EWC to date across multiple titles.',score:'9.7',tag:'ESPORTS'},
  {id:2,category:'review',title:"Review: Assassin's Creed Black Flag Resynced — A triumphant return",time:'2h ago',summary:'Ubisoft delivers a stunning modern take on the beloved pirate epic with refined combat and visuals.',full:"Assassin's Creed Black Flag Resynced launches July 9 across PC, PS5, and Xbox Series. The remake brings the legendary pirate adventure into 2026 with gorgeous visuals, significantly improved naval combat, and a deeper story experience that fans have been waiting for.",score:'9.4',tag:'REVIEW'},
  {id:3,category:'patch',title:'Apex Legends mid-season update brings new legend and major balance changes',time:'5h ago',summary:'Respawn introduces fresh content that is already reshaping the competitive meta.',full:"The latest Apex Legends update adds a brand new legend, significant map updates to World's Edge, and balance adjustments across multiple characters. The community is reacting with excitement and heated discussion.",score:'8.1',tag:'PATCH'},
  {id:4,category:'rumor',title:'Halo: Campaign Evolved expected July 28 with new story missions',time:'today',summary:'343 Industries teases major additions to the classic Halo Combat Evolved experience.',full:'Reliable sources indicate Halo: Campaign Evolved will launch on July 28 with a full visual and gameplay remake of the original campaign plus several brand new story missions and modernized features.',score:'8.9',tag:'RUMOR'},
  {id:5,category:'esports',title:'MSI 2026: T1 and Gen.G advance in dramatic League of Legends bracket',time:'yesterday',summary:'High-level play continues as favorites secure key victories at Mid-Season Invitational.',full:'T1 and Gen.G have advanced from the MSI 2026 bracket stage after thrilling series. The tournament is delivering some of the highest-level League of Legends seen all year as teams fight for the mid-season crown.',score:'9.2',tag:'ESPORTS'},
  {id:6,category:'review',title:'Review: Rhythm Heaven Groove delivers pure rhythm joy on Switch',time:'yesterday',summary:"Nintendo's latest rhythm game is already being called one of the best in the series.",full:'Rhythm Heaven Groove launched July 2 on Nintendo Switch and is receiving universal praise for its perfect timing, charming presentation, and incredibly addictive gameplay loop. A must-play for rhythm fans.',score:'9.0',tag:'REVIEW'},
  {id:7,category:'patch',title:'Valorant Patch 9.04 live — Major Jett and Viper meta shakeup',time:'2d ago',summary:'Riot pushes significant agent changes that are already reshaping ranked and pro play.',full:'The new Valorant patch introduces major tweaks to Jett and Viper along with new agent abilities. Pros and ranked players worldwide are rapidly adapting to the completely shifted meta.',score:'8.3',tag:'PATCH'},
  {id:8,category:'rumor',title:'Black Myth: Wukong 2 still on track for major TGA 2026 reveal',time:'2d ago',summary:'Development sources confirm the sequel remains targeted for a big end-of-year announcement.',full:'Despite the busy summer release calendar, multiple reliable sources indicate Black Myth: Wukong 2 is still on track for a major The Game Awards 2026 reveal with significant gameplay footage expected.',score:'9.5',tag:'RUMOR'},
];
let visibleNewsCount = 6;

function getTagColor(tag) {
  if (tag==='ESPORTS') return 'bg-violet-400/10 text-violet-400';
  if (tag==='PATCH') return 'bg-emerald-400/10 text-emerald-400';
  if (tag==='RUMOR') return 'bg-orange-400/10 text-orange-400';
  return 'bg-sky-400/10 text-sky-400';
}

function initNewsSection() {
  renderNews(newsData.slice(0, visibleNewsCount));
  const si = $('#news-search'); if (si) si.addEventListener('input', debounce(filterNews, 160));
  const fs = $('#news-filter'); if (fs) fs.addEventListener('change', filterNews);
}

function renderNews(arr) {
  const grid = $('#news-grid'); if (!grid) return;
  grid.innerHTML = '';
  if (!arr.length) {
    const empty = document.createElement('div');
    empty.className = 'col-span-full text-center py-16 text-white/50';
    empty.innerHTML = '<i class="fa-solid fa-newspaper text-3xl mb-4 opacity-40" aria-hidden="true"></i><p class="text-sm">No stories match your filters.</p><button type="button" class="mt-4 text-[#00f5ff] text-sm underline" id="reset-filters-btn">Clear filters</button>';
    grid.appendChild(empty);
    $('#reset-filters-btn')?.addEventListener('click', resetNewsView);
    return;
  }
  arr.forEach(item => {
    const isSaved = savedArticles.some(a => a.id===item.id);
    const card = document.createElement('div');
    card.className = 'news-card glass border border-white/10 rounded-3xl p-7 flex flex-col cursor-pointer premium-card';
    card.setAttribute('role','article');
    card.innerHTML = `<div class="flex justify-between items-start"><span class="news-tag px-3.5 py-1 text-[10px] font-bold tracking-widest rounded-2xl cursor-pointer hover:opacity-80 transition-opacity ${getTagColor(item.tag)}">${escapeHTML(item.tag)}</span><div class="flex items-center gap-x-2"><span class="text-xs text-white/40 font-mono">${escapeHTML(item.time)}</span><button type="button" class="news-bookmark text-white/40 hover:text-red-400 transition-colors ${isSaved?'saved':''}" aria-label="${isSaved?'Remove from saved':'Save article'}" data-id="${item.id}"><i class="fa-${isSaved?'solid':'regular'} fa-bookmark" aria-hidden="true"></i></button></div></div><div class="mt-5 font-semibold text-[15.5px] leading-snug tracking-[-0.2px] flex-1">${escapeHTML(item.title)}</div><div class="mt-3.5 text-sm text-white/60 line-clamp-2">${escapeHTML(item.summary)}</div><div class="flex items-center justify-between mt-auto pt-6 border-t border-white/10 text-xs"><div class="flex items-center gap-x-1.5"><span class="font-mono text-emerald-400 font-semibold">${escapeHTML(item.score)}</span><span class="text-white/40">/10</span></div><div class="text-[#00f5ff] flex items-center gap-x-1 text-xs font-medium">READ FULL ANALYSIS <i class="fa-solid fa-arrow-right-long ml-px" aria-hidden="true"></i></div></div>`;
    card.addEventListener('click', e => { if (e.target.closest('.news-bookmark')||e.target.closest('.news-tag')) return; showArticleModal(item); });
    card.querySelector('.news-tag')?.addEventListener('click', e => { e.stopPropagation(); applyCategoryFilter(item.category); });
    card.querySelector('.news-bookmark')?.addEventListener('click', e => { e.stopPropagation(); toggleBookmark(item.id, e.currentTarget); });
    grid.appendChild(card);
  });
}

function applyCategoryFilter(cat) {
  const s = $('#news-filter'); if (s) { s.value = cat; filterNews(); }
  $('#news')?.scrollIntoView({behavior:'smooth',block:'center'});
}

function filterNews() {
  const term = ($('#news-search')?.value||'').toLowerCase().trim();
  const fv = $('#news-filter')?.value||'';
  let f = newsData;
  if (fv) f = f.filter(i => i.category===fv);
  if (term) f = f.filter(i => i.title.toLowerCase().includes(term)||i.summary.toLowerCase().includes(term)||i.tag.toLowerCase().includes(term));
  renderNews(f.slice(0, visibleNewsCount));
  const btn = $('#load-more-btn'); if (btn) btn.style.display = visibleNewsCount >= f.length ? 'none' : '';
}

function loadMoreNews() { visibleNewsCount += 3; filterNews(); }

function toggleBookmark(id, el) {
  const art = newsData.find(a => a.id===id); if (!art) return;
  const idx = savedArticles.findIndex(a => a.id===id);
  if (idx > -1) {
    savedArticles.splice(idx,1); el.classList.remove('saved');
    el.innerHTML = '<i class="fa-regular fa-bookmark" aria-hidden="true"></i>'; el.setAttribute('aria-label','Save article');
    showToast('Removed from reading list','info');
  } else {
    savedArticles.push(art); el.classList.add('saved');
    el.innerHTML = '<i class="fa-solid fa-bookmark" aria-hidden="true"></i>'; el.setAttribute('aria-label','Remove from saved');
    showToast('Saved to reading list','success');
  }
  safeJSONSet('symantic_saved', savedArticles); updateSavedCount();
}

function updateSavedCount() {
  const c = $('#saved-count'), t = $('#saved-count-text'); if (!c||!t) return;
  if (savedArticles.length > 0) { c.style.display='flex'; t.textContent = savedArticles.length+' saved'; }
  else c.style.display='none';
}

function showSavedArticles() {
  if (!savedArticles.length) return;
  const grid = $('#news-grid'); if (!grid) return;
  grid.innerHTML = '';
  savedArticles.forEach(item => {
    const card = document.createElement('div');
    card.className = 'news-card glass border border-white/10 rounded-3xl p-7 flex flex-col cursor-pointer premium-card';
    card.innerHTML = `<div class="flex justify-between items-start"><span class="px-3.5 py-1 text-[10px] font-bold tracking-widest rounded-2xl ${getTagColor(item.tag)}">${escapeHTML(item.tag)}</span><div class="flex items-center gap-x-2"><span class="text-xs text-white/40 font-mono">${escapeHTML(item.time)}</span><button type="button" class="news-bookmark saved text-red-400" data-id="${item.id}" aria-label="Remove from saved"><i class="fa-solid fa-bookmark" aria-hidden="true"></i></button></div></div><div class="mt-5 font-semibold text-[15.5px] leading-snug tracking-[-0.2px] flex-1">${escapeHTML(item.title)}</div><div class="mt-3.5 text-sm text-white/60 line-clamp-2">${escapeHTML(item.summary)}</div><div class="flex items-center justify-between mt-auto pt-6 border-t border-white/10 text-xs"><div class="flex items-center gap-x-1.5"><span class="font-mono text-emerald-400 font-semibold">${escapeHTML(item.score)}</span><span class="text-white/40">/10</span></div><div class="text-[#00f5ff] flex items-center gap-x-1 text-xs font-medium">READ FULL ANALYSIS <i class="fa-solid fa-arrow-right-long ml-px" aria-hidden="true"></i></div></div>`;
    card.addEventListener('click', e => { if (!e.target.closest('.news-bookmark')) showArticleModal(item); });
    card.querySelector('.news-bookmark')?.addEventListener('click', e => { e.stopPropagation(); toggleBookmark(item.id, e.currentTarget); showSavedArticles(); });
    grid.appendChild(card);
  });
  const msg = document.createElement('div');
  msg.className = 'col-span-full text-center py-5 text-sm text-white/50';
  msg.innerHTML = `Showing your <span class="font-medium text-white/70">${savedArticles.length} saved articles</span>. <button type="button" class="underline hover:text-white/70 cursor-pointer" id="reset-news-btn">Show all news</button>`;
  grid.appendChild(msg);
  $('#reset-news-btn')?.addEventListener('click', resetNewsView);
}

function resetNewsView() {
  visibleNewsCount = 6;
  if ($('#news-search')) $('#news-search').value = '';
  if ($('#news-filter')) $('#news-filter').value = '';
  renderNews(newsData.slice(0, visibleNewsCount));
}

function showArticleModal(article) {
  lastFocusedElement = document.activeElement;
  const modal = $('#article-modal'), content = $('#article-modal-content');
  if (!modal || !content) return;
  lockBodyScroll();
  const isSaved = savedArticles.some(a => a.id===article.id);
  content.innerHTML = `<div class="flex justify-between items-start"><span class="px-4 py-1 text-xs font-bold tracking-[1.5px] rounded-3xl ${getTagColor(article.tag)}">${escapeHTML(article.tag)}</span><span class="text-xs text-white/40 font-mono">${escapeHTML(article.time)}</span></div><h3 class="text-3xl font-bold tracking-tighter mt-5 pr-6" id="article-modal-title">${escapeHTML(article.title)}</h3><div class="flex items-center gap-x-2 mt-5"><div class="px-3.5 py-px text-sm bg-emerald-400/10 text-emerald-400 rounded-2xl font-medium">Symantic Score: ${escapeHTML(article.score)}/10</div><div class="text-xs text-white/50">• 100% data-backed • No publisher influence</div></div><div class="prose prose-invert mt-8 text-[15px] text-white/80 leading-relaxed">${escapeHTML(article.full)}</div><div class="mt-9 pt-6 border-t border-white/10 flex items-center justify-between text-xs"><div class="flex items-center gap-x-3"><button type="button" id="modal-bookmark-btn" class="flex items-center gap-x-2 px-5 py-2.5 rounded-2xl border border-white/20 hover:bg-white/5 transition-colors ${isSaved?'text-red-400 border-red-400/30':''}"><i class="fa-${isSaved?'solid':'regular'} fa-bookmark" aria-hidden="true"></i><span>${isSaved?'Saved':'Save for later'}</span></button><button type="button" id="modal-share-btn" class="flex items-center gap-x-2 px-5 py-2.5 rounded-2xl border border-white/20 hover:bg-white/5 transition-colors"><i class="fa-solid fa-link" aria-hidden="true"></i> <span>Share</span></button></div><button type="button" onclick="hideArticleModal()" class="px-6 py-2.5 text-xs font-bold border border-white/20 rounded-3xl hover:bg-white/5">CLOSE</button></div>`;
  modal.setAttribute('aria-labelledby','article-modal-title');
  modal.classList.remove('hidden'); modal.classList.add('flex');
  $('#modal-bookmark-btn')?.addEventListener('click', function(){ toggleBookmarkFromModal(article.id, this); });
  $('#modal-share-btn')?.addEventListener('click', () => navigator.clipboard?.writeText(window.location.href).then(()=>showToast('Link copied to clipboard')));
  modal.querySelector('button')?.focus();
}

function toggleBookmarkFromModal(id, btn) {
  const art = newsData.find(a => a.id===id); if (!art) return;
  const idx = savedArticles.findIndex(a => a.id===id);
  const icon = btn.querySelector('i'), text = btn.querySelector('span');
  if (idx > -1) {
    savedArticles.splice(idx,1); btn.classList.remove('text-red-400','border-red-400/30');
    icon.classList.replace('fa-solid','fa-regular'); text.textContent = 'Save for later';
  } else {
    savedArticles.push(art); btn.classList.add('text-red-400','border-red-400/30');
    icon.classList.replace('fa-regular','fa-solid'); text.textContent = 'Saved';
  }
  safeJSONSet('symantic_saved', savedArticles); updateSavedCount(); setTimeout(filterNews, 280);
}

function hideArticleModal() {
  const m = $('#article-modal'); if (!m) return;
  m.classList.remove('flex'); m.classList.add('hidden');
  unlockBodyScroll();
  if (lastFocusedElement) lastFocusedElement.focus();
}

function bumpMetric(el, base, inc) {
  if (!el) return;
  const n = el.querySelector('.metric-value'); if (!n) return;
  const hasSuffix = !!n.querySelector('span');
  const suffixHTML = hasSuffix ? n.querySelector('span').outerHTML : '';
  const isF = base % 1 !== 0;
  let cur = parseFloat(n.textContent.replace(/[^0-9.]/g,'')) || base;
  const nv = cur + inc;
  const start = performance.now();
  function setVal(v) {
    if (hasSuffix) {
      const num = isF ? v.toFixed(1) : (base > 1000 ? Math.round(v).toLocaleString() : Math.round(v));
      n.innerHTML = num + suffixHTML;
    } else if (isF) n.textContent = v.toFixed(1);
    else if (base > 1000) n.textContent = Math.round(v).toLocaleString();
    else n.textContent = Math.round(v);
  }
  (function anim(now) {
    const p = Math.min((now-start)/680,1), e = 1-Math.pow(1-p,3), v = cur+(nv-cur)*e;
    setVal(v);
    if (p<1) requestAnimationFrame(anim); else setVal(nv);
  })(start);
  el.style.transform = 'scale(0.96)'; setTimeout(()=>el.style.transform='scale(1)',140);
  if (Math.random()>0.6) setTimeout(()=>showToast('Metric updated with latest live data'),720);
}

function refreshDashboard() {
  $$('#intelligence .metric-card').forEach((card,i) => {
    setTimeout(() => {
      const n = card.querySelector('.metric-value'); if (!n) return;
      let val = parseFloat(n.textContent.replace(/[^0-9.]/g,'')); if (isNaN(val)) return;
      const var_ = val*(0.012+Math.random()*0.028);
      const nv = val + (Math.random()>0.5?var_:-var_*0.55);
      n.style.transitionDuration='0ms'; n.style.transform='translateY(-6px)';
      setTimeout(() => {
        if (n.textContent.includes('.')) n.textContent=nv.toFixed(1); else if (val>1000) n.textContent=Math.round(nv).toLocaleString(); else n.textContent=Math.round(nv);
        n.style.transitionDuration='280ms'; n.style.transform='translateY(0)';
      },30);
    }, i*70);
  });
  setTimeout(() => {
    if (accuracyChartInstance) {
      accuracyChartInstance.data.datasets[0].data = accuracyChartInstance.data.datasets[0].data.map(v => Math.max(90,Math.min(96,v+(Math.random()-0.5)*0.55)));
      accuracyChartInstance.update('none');
    }
  },450);
  showToast('Dashboard refreshed with latest live data','success');
}

function initChat() {
  const c = $('#chat-messages'); if (!c) return;
  c.innerHTML = `<div class="flex gap-x-3.5"><div class="w-9 h-9 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#00f5ff] to-[#7c3aed] flex items-center justify-center ring-1 ring-white/20" aria-hidden="true"><i class="fa-solid fa-robot text-xs text-black"></i></div><div class="max-w-[82%]"><div class="text-xs text-white/50 mb-px">SYMANTIC AI • just now</div><div class="bg-white/5 px-5 py-3.5 rounded-3xl text-sm">Hey. I'm Symantic AI — your gaming intelligence co-pilot. Ask me anything about predictions, patches, meta, or esports. I stay data-driven and zero-hype.</div></div></div>`;
}

function initQuickPrompts() {
  const c = $('#quick-prompts'); if (!c) return;
  const prompts = [
    {text:'GTA VI release date?',query:'When is GTA VI releasing?'},
    {text:'Valorant meta right now',query:"What's the current Valorant meta and best agents?"},
    {text:'Black Myth Wukong 2 prediction',query:'Black Myth Wukong 2 announcement prediction'},
    {text:'Best FPS game 2026',query:'What is the best FPS game right now?'},
  ];
  c.innerHTML = prompts.map(p => `<button type="button" data-query="${escapeHTML(p.query)}" class="quick-prompt px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/80 text-xs transition-all active:scale-[0.985]">${escapeHTML(p.text)}</button>`).join('');
  c.addEventListener('click', e => { const b=e.target.closest('.quick-prompt'); if(b) quickPrompt(b.dataset.query); });
}

function showTypingIndicator() {
  const c = $('#chat-messages'); if (!c) return;
  const t = document.createElement('div'); t.id='typing-indicator'; t.className='flex gap-x-3.5'; t.setAttribute('aria-live','polite');
  t.innerHTML = `<div class="w-9 h-9 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#00f5ff] to-[#7c3aed] flex items-center justify-center ring-1 ring-white/20" aria-hidden="true"><i class="fa-solid fa-robot text-xs text-black"></i></div><div class="bg-white/5 px-5 py-3.5 rounded-3xl"><div class="thinking-dots" aria-label="AI is thinking"><span></span><span></span><span></span></div></div>`;
  c.appendChild(t); c.scrollTop = c.scrollHeight;
}
function removeTypingIndicator() { $('#typing-indicator')?.remove(); }

const LOCAL_KNOWLEDGE = {
  'gta': `GTA VI is currently scheduled for Fall 2025 on PS5 and Xbox Series X|S, with PC expected 2026. Rockstar has not delayed the window as of mid-2026. Trailer 2 is widely expected before the end of Q1 2026. Our models give 87% confidence for a Spring 2026 trailer and 94% for a 2025 console launch window holding. Map leaks and performance data point to a massive Vice City-inspired open world with dual protagonists.`,
  'valorant': `Current Valorant meta (Patch 9.04+) favors controllers and initiators. Viper and Omen remain strong on maps with heavy site control. Jett received significant nerfs to mobility, shifting duelists toward Raze and Neon in pro play. Best agents right now: Viper, Sova, Raze, Killjoy, Omen. Ranked ladder shows higher win rates for compositions with two controllers. Expect further balance adjustments mid-season.`,
  'wukong': `Black Myth: Wukong 2 remains on track for a major reveal at The Game Awards 2026 with 96% model confidence. Development sources and social signal velocity support a late-2026 announcement and 2027 release window. The first game's commercial success has given Game Science significant resources. Expect expanded combat systems and multiple chapter structure.`,
  'elden': `Elden Ring Nightreign is performing above expectations. FromSoftware's co-op focused spin-off has strong concurrent player numbers and positive critical reception. Sales trajectory supports high confidence in continued support and potential DLC. The night-cycle and multiplayer design is being praised as a fresh direction for the studio.`,
  'apex': `Apex Legends mid-season update introduced a new legend and map changes to World's Edge. The balance patch has shifted competitive play toward more aggressive compositions. Ranked and ALGS teams are still adapting. Patch notes and win-rate data show meaningful shifts in legend pick rates within the first 48 hours.`,
  'esports': `Esports World Cup 2026 in Paris carries a record $30M prize pool. League of Legends MSI and Worlds remain the highest-viewership titles. Valorant Champions Tour and CS2 Majors continue to grow. Team Falcons, T1, Gen.G, and Vitality are among the strongest organizations across multiple titles this year.`,
  'fps': `Best FPS titles in 2026 right now: Valorant for competitive precision, Apex Legends for movement and battle-royale hybrid play, and Counter-Strike 2 for pure aim and economy. Single-player FPS standouts depend on preference for narrative vs pure gunplay. Ranked systems and anti-cheat quality remain key differentiators.`,
};

function getLocalResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('gta') || q.includes('grand theft')) return LOCAL_KNOWLEDGE.gta;
  if (q.includes('valorant') || q.includes('riot') || q.includes('meta')) return LOCAL_KNOWLEDGE.valorant;
  if (q.includes('wukong') || q.includes('black myth')) return LOCAL_KNOWLEDGE.wukong;
  if (q.includes('elden') || q.includes('nightreign') || q.includes('fromsoft')) return LOCAL_KNOWLEDGE.elden;
  if (q.includes('apex') || q.includes('respawn')) return LOCAL_KNOWLEDGE.apex;
  if (q.includes('esports') || q.includes('worlds') || q.includes('msi') || q.includes('tournament')) return LOCAL_KNOWLEDGE.esports;
  if (q.includes('best fps') || q.includes('best shooter') || q.includes('fps game')) return LOCAL_KNOWLEDGE.fps;
  if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) return "Hey. I'm Symantic AI — ask me about any game, patch, prediction, or esports topic. I stay honest and data-driven.";
  if (q.includes('who are you') || q.includes('what are you')) return "I'm Symantic AI, the gaming intelligence co-pilot. I analyze live signals, historical patterns, and model outputs to give clear, no-hype answers on games and esports.";
  return null;
}

async function generateAIResponse(query) {
  // Keep conversation history for context
  chatHistory.push({ role: 'user', content: query });
  if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);

  // Try local knowledge first for instant high-quality answers
  const local = getLocalResponse(query);
  if (local) {
    chatHistory.push({ role: 'assistant', content: local });
    return local;
  }

  const system = `You are Symantic AI — the premier gaming and esports intelligence assistant. You are precise, data-driven, and completely honest. You never hype. You focus on: game release predictions, patch analysis, meta shifts, esports results and forecasts, and player improvement. Current date context: August 2026. Keep answers clear and under 220 words unless the user asks for deeper analysis. If uncertain, say so.`;

  const messages = [{ role: 'system', content: system }, ...chatHistory];

  try {
    const r = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      // graceful fallback
      const fallback = "I don't have a live connection to the full model right now, but based on current signals I can still help. Try asking about GTA VI, Valorant meta, Black Myth Wukong 2, Elden Ring Nightreign, or any major esports title.";
      chatHistory.push({ role: 'assistant', content: fallback });
      return e.error || fallback;
    }
    const d = await r.json();
    const content = d.choices?.[0]?.message?.content || 'Something went wrong generating a response.';
    chatHistory.push({ role: 'assistant', content });
    return content;
  } catch (e) {
    console.warn(e);
    const fallback = getLocalResponse(query) || "Connection to the live model is unavailable right now. Ask me about GTA VI, Valorant, Black Myth Wukong, Apex, or current esports — I still have strong local knowledge on those.";
    chatHistory.push({ role: 'assistant', content: fallback });
    return fallback;
  }
}

function appendUserMessage(text) {
  const c = $('#chat-messages'); if (!c) return;
  const d = document.createElement('div'); d.className='flex justify-end';
  d.innerHTML = `<div class="max-w-[78%] bg-[#00f5ff] text-black px-5 py-3.5 rounded-3xl text-sm">${escapeHTML(text)}</div>`;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
}

function appendAIMessage(text) {
  const c = $('#chat-messages'); if (!c) return;
  const d = document.createElement('div'); d.className='flex gap-x-3.5 chat-bubble';
  d.innerHTML = `<div class="w-9 h-9 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#00f5ff] to-[#7c3aed] flex items-center justify-center ring-1 ring-white/20" aria-hidden="true"><i class="fa-solid fa-robot text-xs text-black"></i></div><div class="max-w-[82%]"><div class="text-xs text-white/50 mb-px">SYMANTIC AI • just now</div><div class="bg-white/5 px-5 py-[13px] rounded-3xl text-sm">${escapeHTML(text)}</div></div>`;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
}

async function sendChatMessage() {
  if (chatBusy) return;
  const input = $('#chat-input'); if (!input) return;
  const msg = input.value.trim(); if (!msg) return;
  chatBusy = true;
  appendUserMessage(msg); input.value=''; input.focus();
  showTypingIndicator();
  try {
    const reply = await generateAIResponse(msg);
    removeTypingIndicator(); appendAIMessage(reply);
  } finally { chatBusy = false; }
}

async function quickPrompt(q) {
  if (chatBusy) return;
  chatBusy = true;
  appendUserMessage(q); showTypingIndicator();
  try {
    const reply = await generateAIResponse(q); removeTypingIndicator(); appendAIMessage(reply);
  } finally { chatBusy = false; }
}

function clearChat() { chatHistory = []; const c=$('#chat-messages'); if(c){c.innerHTML=''; initChat();} }
function simulateVoiceInput() {
  showToast('Voice mode ready — listening...','info');
  setTimeout(() => { const i=$('#chat-input'); if(i){i.value="What's the current Valorant meta?"; sendChatMessage();} },1400);
}
function uploadReplay() {
  showToast('Replay analysis started — processing your match data...','success');
  setTimeout(() => appendAIMessage("I've analyzed your replay. Your K/D ratio is strong, but positioning in mid-round can improve. Would you like specific recommendations for your next 5 matches?"), 2200);
}

function togglePricing(period) {
  const m=$('#pricing-monthly'), y=$('#pricing-yearly'), p=$('#pro-price'), b=$('#pro-billing');
  if (!m||!y||!p||!b) return;
  if (period==='monthly') {
    m.classList.add('bg-white','text-black'); m.classList.remove('text-white');
    y.classList.remove('bg-white','text-black'); y.classList.add('text-white');
    p.textContent='$12'; b.textContent='billed monthly • cancel anytime';
  } else {
    y.classList.add('bg-white','text-black'); y.classList.remove('text-white');
    m.classList.remove('bg-white','text-black'); m.classList.add('text-white');
    p.textContent='$9'; b.textContent='billed yearly • save $39';
  }
}

function showLoginModal() { lastFocusedElement=document.activeElement; const m=$('#login-modal'); if(m){m.classList.remove('hidden');m.classList.add('flex'); lockBodyScroll(); m.querySelector('input')?.focus();} }
function hideLoginModal() { const m=$('#login-modal'); if(m){m.classList.remove('flex');m.classList.add('hidden'); unlockBodyScroll(); if(lastFocusedElement) lastFocusedElement.focus();} }
function loginUser() {
  const email = ($('#login-email')?.value || '').trim() || 'player@symantic.ai';
  safeJSONSet('symantic_user', { email, loggedIn: true, name: email.split('@')[0] });
  hideLoginModal();
  updateAuthUI();
  showToast(`Welcome back, ${email.split('@')[0]}!`,'success');
  setTimeout(()=>$('#live')?.scrollIntoView({behavior:'smooth',block:'center'}),1100);
}
function showSubscribeModal() { lastFocusedElement=document.activeElement; const m=$('#subscribe-modal'); if(m){m.classList.remove('hidden');m.classList.add('flex'); lockBodyScroll(); m.querySelector('input')?.focus();} }
function hideSubscribeModal() { const m=$('#subscribe-modal'); if(m){m.classList.remove('flex');m.classList.add('hidden'); unlockBodyScroll(); if(lastFocusedElement) lastFocusedElement.focus();} }
function processCheckout() {
  const mc = $('#subscribe-modal .glass'); if (!mc) return;
  const user = safeJSONParse('symantic_user', {});
  safeJSONSet('symantic_user', { ...user, pro: true, trialStart: Date.now() });
  updateAuthUI();
  mc.innerHTML = `<div class="text-center py-10"><div class="mx-auto w-16 h-16 bg-emerald-400/10 rounded-3xl flex items-center justify-center mb-6" aria-hidden="true"><i class="fa-solid fa-check text-4xl text-emerald-400"></i></div><div class="font-bold text-3xl tracking-tight">Welcome to Pro!</div><p class="mt-2 text-white/70">Your 14-day free trial has started.</p><div class="mt-9 text-left bg-white/5 p-6 rounded-2xl text-sm"><div class="font-semibold mb-3">What's unlocked now:</div><ul class="space-y-1.5 text-white/80"><li>✓ Unlimited AI insights &amp; predictions</li><li>✓ Early access to all forecasts</li><li>✓ Custom dashboards &amp; alerts</li><li>✓ Priority support</li></ul></div><button type="button" id="pro-start-btn" class="mt-8 w-full py-4 font-bold bg-white text-black rounded-3xl active:scale-[0.985]">Start Exploring Pro Features</button></div>`;
  $('#pro-start-btn')?.addEventListener('click', () => { hideSubscribeModal(); showToast('Pro features activated. Full access unlocked.'); });
}

function showContactModal() {
  lastFocusedElement = document.activeElement;
  lockBodyScroll();
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-6';
  modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-labelledby','contact-title');
  modal.innerHTML = `<div class="glass w-full max-w-md border border-white/10 rounded-3xl p-9" role="document"><div class="text-center"><i class="fa-solid fa-headset text-4xl mb-5 text-[#00f5ff]" aria-hidden="true"></i><div id="contact-title" class="font-bold text-2xl tracking-tight">Let's talk enterprise</div><p class="mt-2 text-white/70">Our team will get back to you within 4 hours.</p><div class="mt-7 text-left"><label class="sr-only" for="contact-email">Work email</label><input id="contact-email" type="email" placeholder="Your work email" class="w-full bg-white/5 border border-white/10 px-6 py-3.5 rounded-3xl text-sm mb-3.5"><label class="sr-only" for="contact-msg">Message</label><textarea id="contact-msg" placeholder="Tell us about your team and needs..." class="w-full h-24 bg-white/5 border border-white/10 px-6 py-3.5 rounded-3xl text-sm resize-y"></textarea></div><button type="button" id="contact-send" class="mt-6 w-full py-4 bg-white font-bold text-black rounded-3xl active:scale-[0.985]">Send message</button></div></div>`;
  const close = () => { modal.remove(); document.removeEventListener('keydown',onKey); unlockBodyScroll(); if(lastFocusedElement) lastFocusedElement.focus(); };
  const onKey = e => { if(e.key==='Escape') close(); };
  modal.addEventListener('click', e => { if(e.target===modal) close(); });
  modal.querySelector('#contact-send').addEventListener('click', () => { close(); showToast('Thanks! Our sales team will contact you shortly.','success'); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(modal);
  modal.querySelector('#contact-email')?.focus();
}

function initModalFocusTraps() {
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('#login-modal')?.classList.contains('hidden')) hideLoginModal();
    else if (!$('#subscribe-modal')?.classList.contains('hidden')) hideSubscribeModal();
    else if (!$('#article-modal')?.classList.contains('hidden')) hideArticleModal();
    else if (!$('#command-palette')?.classList.contains('hidden')) hideCommandPalette();
  });
}

function initCommandPaletteKeyboard() {
  document.addEventListener('keydown', e => {
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k') { e.preventDefault(); showCommandPalette(); }
    if (e.key==='?' && document.activeElement.tagName==='BODY') { e.preventDefault(); $('#ai')?.scrollIntoView({behavior:'smooth'}); setTimeout(()=>$('#chat-input')?.focus(),650); }
  });
}

function showCommandPalette() {
  lastFocusedElement = document.activeElement;
  const p = $('#command-palette'), i = $('#command-input');
  if (!p||!i) return;
  p.classList.remove('hidden'); p.classList.add('flex');
  lockBodyScroll();
  i.value=''; i.focus(); showAllCommands(); i.onkeyup = filterCommands;
}

function hideCommandPalette() {
  const p = $('#command-palette'); if (!p) return;
  p.classList.remove('flex'); p.classList.add('hidden');
  unlockBodyScroll();
  if (lastFocusedElement) lastFocusedElement.focus();
}

function showAllCommands() {
  const r = $('#command-results'); if (!r) return;
  r.innerHTML = `<div class="px-3 py-1 text-xs text-white/40 font-medium">QUICK ACTIONS</div><div role="option" tabindex="0" data-cmd="live" class="cmd-item px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-broadcast-tower w-4 text-[#00f5ff]" aria-hidden="true"></i> <span>Go to Live Feed</span></div><div role="option" tabindex="0" data-cmd="predictions" class="cmd-item px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-brain w-4 text-[#7c3aed]" aria-hidden="true"></i> <span>Refresh Predictions</span></div><div role="option" tabindex="0" data-cmd="ai-gta" class="cmd-item px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-robot w-4 text-[#00f5ff]" aria-hidden="true"></i> <span>Ask AI: GTA VI prediction</span></div><div role="option" tabindex="0" data-cmd="dashboard" class="cmd-item px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-chart-line w-4 text-emerald-400" aria-hidden="true"></i> <span>Refresh Dashboard</span></div><div role="option" tabindex="0" data-cmd="pricing" class="cmd-item px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-credit-card w-4 text-white/60" aria-hidden="true"></i> <span>View Pricing</span></div>`;
  bindCommandItems(r);
}

function filterCommands() {
  const input = ($('#command-input')?.value||'').toLowerCase();
  const r = $('#command-results'); if (!r) return;
  if (!input) { showAllCommands(); return; }
  let html = '<div class="px-3 py-1 text-xs text-white/40 font-medium">RESULTS</div>';
  if (input.includes('live')||input.includes('feed')) html += `<div role="option" tabindex="0" data-cmd="live" class="cmd-item px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-broadcast-tower w-4 text-[#00f5ff]" aria-hidden="true"></i> <span>Go to Live Feed</span></div>`;
  if (input.includes('predict')||input.includes('brain')) html += `<div role="option" tabindex="0" data-cmd="predictions" class="cmd-item px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-brain w-4 text-[#7c3aed]" aria-hidden="true"></i> <span>Refresh Predictions</span></div>`;
  if (input.includes('gta')||input.includes('ai')) html += `<div role="option" tabindex="0" data-cmd="ai-gta" class="cmd-item px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-robot w-4 text-[#00f5ff]" aria-hidden="true"></i> <span>Ask AI about GTA VI</span></div>`;
  if (input.includes('dash')||input.includes('metric')) html += `<div role="option" tabindex="0" data-cmd="dashboard" class="cmd-item px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-chart-line w-4 text-emerald-400" aria-hidden="true"></i> <span>Refresh Dashboard</span></div>`;
  if (input.includes('price')||input.includes('pro')) html += `<div role="option" tabindex="0" data-cmd="pricing" class="cmd-item px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-credit-card w-4 text-white/60" aria-hidden="true"></i> <span>View Pricing Plans</span></div>`;
  if (input.includes('news')||input.includes('article')) html += `<div role="option" tabindex="0" data-cmd="news" class="cmd-item px-4 py-3 hover:bg-white/5 rounded-2xl flex items-center gap-x-3 cursor-pointer"><i class="fa-solid fa-newspaper w-4 text-[#00f5ff]" aria-hidden="true"></i> <span>Go to News</span></div>`;
  r.innerHTML = html || '<div class="px-4 py-6 text-center text-white/50 text-sm">No matching commands. Try "live", "predict", or "gta"</div>';
  bindCommandItems(r);
}

function bindCommandItems(c) {
  c.querySelectorAll('.cmd-item').forEach(el => {
    el.addEventListener('click', () => executeCommand(el.dataset.cmd));
    el.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();executeCommand(el.dataset.cmd);} });
  });
}

function executeCommand(cmd) {
  hideCommandPalette();
  setTimeout(() => {
    if (cmd==='live') $('#live')?.scrollIntoView({behavior:'smooth',block:'center'});
    else if (cmd==='predictions') { $('#predictions')?.scrollIntoView({behavior:'smooth',block:'center'}); setTimeout(refreshPredictions,650); }
    else if (cmd==='ai-gta') { $('#ai')?.scrollIntoView({behavior:'smooth'}); setTimeout(()=>{const i=$('#chat-input');if(i){i.value='When is GTA VI releasing?';sendChatMessage();}},750); }
    else if (cmd==='dashboard') { $('#intelligence')?.scrollIntoView({behavior:'smooth',block:'center'}); setTimeout(refreshDashboard,650); }
    else if (cmd==='pricing') $('#pricing')?.scrollIntoView({behavior:'smooth',block:'center'});
    else if (cmd==='news') $('#news')?.scrollIntoView({behavior:'smooth',block:'center'});
  },180);
}

function toggleTheme() {
  currentTheme = currentTheme==='dark'?'light':'dark';
  applyTheme(); localStorage.setItem('symantic_theme', currentTheme);
}

function applyTheme() {
  const icon = $('#theme-icon');
  if (currentTheme==='light') {
    document.documentElement.classList.add('light');
    if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
  } else {
    document.documentElement.classList.remove('light');
    if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
  }
}

function showToast(msg, type='success') {
  const t = document.createElement('div');
  t.className = `toast fixed bottom-8 left-1/2 -translate-x-1/2 px-7 py-3.5 ${type==='success'?'bg-white text-black':'bg-white/95 text-black'} text-sm font-medium rounded-3xl shadow-2xl flex items-center gap-x-2.5 z-[200]`;
  t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
  t.innerHTML = (type==='success'?'<i class="fa-solid fa-check-double" aria-hidden="true"></i>':'<i class="fa-solid fa-info-circle" aria-hidden="true"></i>') + ' <span>'+escapeHTML(msg)+'</span>';
  document.body.appendChild(t);
  setTimeout(() => { t.style.transition='all .25s ease'; t.style.opacity='0'; setTimeout(()=>t.remove(),220); },2400);
}

function toggleMobileMenu() {
  const menu = $('#mobile-menu'), icon = $('#mobile-menu-icon'), btn = $('#mobile-menu-btn');
  if (!menu||!icon) return;
  const open = !menu.classList.contains('hidden');
  if (open) { menu.classList.add('hidden'); icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); btn?.setAttribute('aria-expanded','false'); }
  else { menu.classList.remove('hidden'); icon.classList.add('fa-times'); icon.classList.remove('fa-bars'); btn?.setAttribute('aria-expanded','true'); }
}

window.addEventListener('DOMContentLoaded', () => {
  init();
  setTimeout(() => {
    const hc = $('#hero-floating-card');
    if (hc && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hc.style.transition = 'transform 3s cubic-bezier(0.23,1,0.32,1)';
      setInterval(() => { if(hc){ hc.style.transform='translateY(-6px)'; setTimeout(()=>{if(hc)hc.style.transform='translateY(0)';},2800); } }, 6200);
    }
  }, 1800);
  document.addEventListener('keypress', e => { if (e.key.toLowerCase()==='s' && document.activeElement.tagName==='BODY') addLiveUpdate(); });
});

window.Symantic = {
  addLiveUpdate: () => addLiveUpdate(),
  refreshDashboard: () => refreshDashboard(),
  simulateChat: q => { const i=$('#chat-input'); if(i){i.value=q; $('#ai')?.scrollIntoView({behavior:'smooth'}); setTimeout(sendChatMessage,650);} },
  filterLive: t => filterLiveFeed(t),
  showCommand: () => showCommandPalette(),
};

// Expose for inline handlers
Object.assign(window, {
  filterLiveFeed, addLiveUpdate, refreshPredictions, refreshDashboard, bumpMetric,
  loadMoreNews, showSavedArticles, resetNewsView, hideArticleModal, sendChatMessage,
  clearChat, simulateVoiceInput, uploadReplay, togglePricing, showLoginModal,
  hideLoginModal, loginUser, showSubscribeModal, hideSubscribeModal, processCheckout,
  showContactModal, showCommandPalette, hideCommandPalette, toggleTheme, toggleMobileMenu,
  showPredictionModal, quickPrompt
});
