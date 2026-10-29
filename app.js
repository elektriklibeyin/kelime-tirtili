'use strict';
/* Kelime Tırtılı — A1 / A2 İngilizce kelime oyunları. Kayıtlar oyuncunun adıyla bu tarayıcıda tutulur. */

// ---------- yardımcılar ----------
const app = document.getElementById('app');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rand = n => Math.floor(Math.random() * n);
const pick = a => a[rand(a.length)];
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const normEn = s => String(s).replace(/İ/g, 'I').replace(/ı/g, 'i').toLowerCase().trim().replace(/[’‘`´]/g, "'").replace(/[.!?,]+$/, '').replace(/\s+/g, ' ');
const normTr = s => String(s).toLocaleLowerCase('tr').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
const lettersOnly = w => /^[a-z]+$/i.test(w.en);
const fmtDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayStr = () => fmtDate(new Date());
const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return fmtDate(d); };
const modalOpen = () => !!document.querySelector('.modal');
const typingIn = e => e.target && e.target.closest && e.target.closest('input, textarea, select');

function lev(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// ---------- kelimeler ----------
const WORDS = [];
const BY_KEY = new Map();
for (const [lvl, cats] of Object.entries(WORD_DATA)) {
  for (const [cat, raw] of Object.entries(cats)) {
    for (const item of raw.split(/[|\n]+/)) {
      const eq = item.indexOf('=');
      if (eq < 0) continue;
      const en = item.slice(0, eq).trim(), tr = item.slice(eq + 1).trim();
      const alts = en.split('/').map(s => s.trim()).filter(Boolean);
      if (!alts.length || !tr) continue;
      const key = alts[0].toLowerCase();
      if (BY_KEY.has(key)) continue;
      const trs = tr.split('/').map(s => s.trim()).filter(Boolean);
      const w = { key, en: alts[0], alts: alts.map(normEn), tr: trs.join(', '), trAll: trs.map(normTr), lvl, cat, mine: false };
      WORDS.push(w); BY_KEY.set(key, w);
    }
  }
}
const CATS = [...new Set(WORDS.map(w => w.cat))];

// ---------- ses ----------
const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let enVoice = null;
function loadVoice() { try { const vs = speechSynthesis.getVoices(); enVoice = vs.find(v => /en[-_]US/i.test(v.lang) && /Google|Samantha|Microsoft/i.test(v.name)) || vs.find(v => /en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null; } catch (e) { /* yok */ } }
if (canSpeak) { loadVoice(); speechSynthesis.onvoiceschanged = loadVoice; }
function speak(text) {
  if (!canSpeak || !text) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; if (enVoice) u.voice = enVoice; u.rate = 0.88; speechSynthesis.speak(u); } catch (e) { /* yok */ }
}
const sayBtn = en => canSpeak ? `<button type="button" class="spk" data-say="${esc(en)}" aria-label="Dinle">🔊</button>` : '';
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-say]'); if (b) { e.preventDefault(); e.stopPropagation(); speak(b.dataset.say); } }, true);

let actx = null;
function tone(freqs, type = 'sine', len = 0.12, vol = 0.12) {
  if (!S || !S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = actx.currentTime;
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain(); const t = t0 + i * len;
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len * 1.6);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + len * 1.7);
    });
  } catch (e) { /* ses yok */ }
}
const beep = ok => ok ? tone([660, 880], 'sine', 0.09) : tone([220, 160], 'triangle', 0.12, 0.1);
const fanfare = () => tone([523, 659, 784, 1047], 'sine', 0.11, 0.14);

// ---------- oyuncu ve kayıt ----------
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* yok */ } },
};
const cleanName = n => String(n).trim().replace(/\s+/g, ' ').slice(0, 20);
const userKey = n => cleanName(n).toLocaleLowerCase('tr');
const users = () => LS.get('kt.users', []);
const fresh = name => ({
  v: 1, name, xp: 0, today: { date: '', xp: 0, bonus: false }, streak: { last: '', count: 0 }, stats: {}, mine: [],
  settings: { levels: ['A1', 'A2'], source: 'all', cat: '', sound: true, speak: true }, best: {}, games: 0, created: Date.now(),
});
function normalizeState(d, name) {
  const f = fresh(d.name || name);
  return Object.assign(f, d, { settings: Object.assign(f.settings, d.settings || {}), today: Object.assign(f.today, d.today || {}), streak: Object.assign(f.streak, d.streak || {}), stats: d.stats || {}, mine: Array.isArray(d.mine) ? d.mine : [], best: d.best || {} });
}
let S = null;
let warnedStorage = false;
function save() {
  if (!S) return;
  const k = userKey(S.name);
  const ok = LS.set('kt.u.' + k, S);
  const list = users(); const u = list.find(x => x.key === k);
  if (u) { u.last = Date.now(); u.xp = S.xp; u.name = S.name; } else list.push({ key: k, name: S.name, xp: S.xp, last: Date.now() });
  LS.set('kt.users', list);
  if (!ok && !warnedStorage) { warnedStorage = true; toast('Bu tarayıcı kayıt yapmaya izin vermiyor (gizli sekme olabilir); ilerleme kaydedilmeyecek.', 5000); }
}
function login(name) {
  const k = userKey(name);
  const saved = LS.get('kt.u.' + k, null);
  S = saved ? normalizeState(saved, cleanName(name)) : fresh(cleanName(name));
  save();
  try { sessionStorage.setItem('kt.current', k); } catch (e) { /* yok */ }
  return !saved;
}
function restoreSession() {
  let k = null; try { k = sessionStorage.getItem('kt.current'); } catch (e) { /* yok */ }
  if (!k) return;
  const d = LS.get('kt.u.' + k, null);
  if (d) S = normalizeState(d, d.name);
}
function logout() { try { sessionStorage.removeItem('kt.current'); } catch (e) { /* yok */ } S = null; go(''); }

// ---------- seviye, XP, istatistik ----------
const DAILY_GOAL = 150;
const needFor = L => 60 + (L - 1) * 30;
function levelInfo(xp) { let L = 1, base = 0; while (xp >= base + needFor(L)) { base += needFor(L); L++; } return { level: L, into: xp - base, need: needFor(L) }; }
const TITLES = [[1, 'Minik Tırtıl'], [3, 'Meraklı Tırtıl'], [5, 'Tombul Tırtıl'], [8, 'Bilge Tırtıl'], [11, 'Koza Ustası'], [15, 'Kelebek'], [20, 'Gökkuşağı Kelebeği'], [30, 'Kelime Kraliçesi']];
const titleOf = L => TITLES.reduce((t, [l, n]) => (L >= l ? n : t), TITLES[0][1]);
const segFor = L => Math.min(2 + L, 16);
const wingsFor = L => L >= 15;
const streakNow = () => (S.streak.last === todayStr() || S.streak.last === yesterdayStr()) ? S.streak.count : 0;

function addXp(n) {
  const t = todayStr();
  if (S.today.date !== t) S.today = { date: t, xp: 0, bonus: false };
  const before = levelInfo(S.xp).level;
  S.today.xp += n; S.xp += n;
  if (S.streak.last !== t) { S.streak.count = S.streak.last === yesterdayStr() ? S.streak.count + 1 : 1; S.streak.last = t; }
  if (!S.today.bonus && S.today.xp >= DAILY_GOAL) { S.today.bonus = true; S.xp += 30; toast('Günlük hedef tamam! +30 XP bonus 🎯'); }
  const after = levelInfo(S.xp).level;
  save();
  if (after > before) showLevelUp(before, after);
}
function record(w, ok, xp = 10) {
  const st = S.stats[w.key] || (S.stats[w.key] = { c: 0, w: 0, s: 0, t: 0 });
  if (ok) { st.c++; st.s = (st.s || 0) + 1; } else { st.w++; st.s = 0; }
  st.t = Date.now();
  if (ok && xp) addXp(xp); else save();
}
const isMastered = key => ((S.stats[key] && S.stats[key].s) || 0) >= 3;
const isHard = key => { const st = S.stats[key]; return !!st && st.w > 0 && (st.s || 0) < 2; };
function setBest(id, v, lower = false) { const cur = S.best[id]; if (cur == null || (lower ? v < cur : v > cur)) S.best[id] = v; save(); return S.best[id]; }

function weight(w) {
  const st = S.stats[w.key];
  if (!st) return 3;
  const days = (Date.now() - (st.t || 0)) / 864e5;
  let v = 1 + st.w * 1.5 - (st.s || 0) * 0.8 + Math.min(days, 10) * 0.25;
  if ((st.s || 0) >= 3) v *= 0.3;
  return Math.max(0.15, v);
}
function pickWords(pool, n) {
  const arr = [...pool], res = [];
  while (res.length < n && arr.length) {
    const ws = arr.map(weight); let r = Math.random() * ws.reduce((a, b) => a + b, 0); let i = 0;
    for (; i < arr.length - 1; i++) { r -= ws[i]; if (r <= 0) break; }
    res.push(arr.splice(i, 1)[0]);
  }
  return res;
}
function pickDistinct(pool, n) {
  const out = [], trs = new Set(), ens = new Set();
  for (const w of pickWords(pool, Math.min(pool.length, n * 4))) {
    if (out.length >= n) break;
    if (ens.has(normEn(w.en)) || w.trAll.some(t => trs.has(t))) continue;
    out.push(w); ens.add(normEn(w.en)); w.trAll.forEach(t => trs.add(t));
  }
  return out;
}

// ---------- kelime havuzu ----------
function mineToWord(m) {
  const trs = m.tr.split(/[,/;]/).map(s => s.trim()).filter(Boolean);
  return { key: normEn(m.en), en: m.en.trim(), alts: [normEn(m.en)], tr: m.tr.trim(), trAll: trs.map(normTr), lvl: 'Benim', cat: 'Kelimelerim', mine: true, id: m.id };
}
function myWords(todayOnly) { const t = todayStr(); return S.mine.filter(m => !todayOnly || m.date === t).map(mineToWord); }
function allWords() { const map = new Map(WORDS.map(w => [w.key, w])); for (const w of myWords(false)) map.set(w.key, w); return [...map.values()]; }
const SOURCES = [{ id: 'all', name: 'Tüm kelimeler' }, { id: 'mine', name: 'Kelimelerim' }, { id: 'today', name: 'Bugünküler' }, { id: 'hard', name: 'Zorlandıklarım' }];
const sourceName = id => (SOURCES.find(s => s.id === id) || SOURCES[0]).name;
function sourceWords(src = S.settings.source) {
  if (src === 'mine') return myWords(false);
  if (src === 'today') return myWords(true);
  if (src === 'hard') return allWords().filter(w => isHard(w.key));
  const s = S.settings;
  return WORDS.filter(w => s.levels.includes(w.lvl) && (!s.cat || w.cat === s.cat));
}
function getPool(filter, min) {
  let pool = sourceWords().filter(filter);
  if (pool.length >= min) return pool;
  const s = S.settings;
  const label = s.source !== 'all' ? sourceName(s.source) : 'Seçili konu';
  toast(`“${label}” içinde bu oyuna uygun en az ${min} kelime yok; bu sefer tüm kelimelerle oynuyoruz.`, 4000);
  pool = WORDS.filter(w => s.levels.includes(w.lvl)).filter(filter);
  return pool.length >= min ? pool : WORDS.filter(filter);
}
function distractors(w, n, mode) {
  const all = allWords(); const bad = new Set(w.trAll);
  const ok = x => x.key !== w.key && !x.trAll.some(t => bad.has(t)) && normEn(x.en) !== normEn(w.en);
  const same = shuffle(all.filter(x => x.cat === w.cat && ok(x)));
  const other = shuffle(all.filter(x => x.cat !== w.cat && ok(x)));
  const res = [], seen = new Set([mode === 'tr' ? normTr(w.tr) : normEn(w.en)]);
  for (const x of [...same.slice(0, 2), ...other.slice(0, 40), ...same.slice(2)]) {
    const t = mode === 'tr' ? normTr(x.tr) : normEn(x.en);
    if (seen.has(t)) continue; seen.add(t); res.push(x);
    if (res.length >= n) break;
  }
  return res;
}

// ---------- tırtıl çizimi ----------
function tirtilSVG(seg = 5, opt = {}) {
  const gap = 17, r = 13, headR = 16, base = 52;
  const W = 24 + seg * gap + headR + 18, H = 86;
  let body = '';
  if (opt.wings) {
    const wx = 18 + seg * gap * 0.55;
    body += `<g class="wings"><ellipse cx="${wx - 13}" cy="${base - 30}" rx="17" ry="24" fill="#ffb52e" opacity=".92" transform="rotate(-28 ${wx - 13} ${base - 30})"/><ellipse cx="${wx + 13}" cy="${base - 30}" rx="17" ry="24" fill="#e8505f" opacity=".85" transform="rotate(28 ${wx + 13} ${base - 30})"/><circle cx="${wx - 15}" cy="${base - 34}" r="5" fill="#fff" opacity=".6"/><circle cx="${wx + 15}" cy="${base - 34}" r="5" fill="#fff" opacity=".6"/></g>`;
  }
  for (let i = 0; i < seg; i++) {
    const x = 18 + i * gap, y = base + Math.sin(i * 0.9) * 4;
    const fill = i % 2 ? '#86c95a' : '#5aa83a';
    body += `<g class="seg" style="animation-delay:${(-i * 0.11).toFixed(2)}s"><path d="M${x - 5} ${y + 10}l-2 8M${x + 5} ${y + 10}l2 8" stroke="#3d7f24" stroke-width="3" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/><circle cx="${x - 4}" cy="${y - 5}" r="3" fill="#fff" opacity=".35"/></g>`;
  }
  const hx = 18 + seg * gap + 4, hy = base - 6;
  const mood = opt.mood || 'happy';
  const mouth = mood === 'sad' ? `<path d="M${hx - 5} ${hy + 10}q5 -5 10 0" stroke="#263521" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    : mood === 'calm' ? `<path d="M${hx - 4} ${hy + 7}h8" stroke="#263521" stroke-width="2.4" stroke-linecap="round"/>`
      : `<path d="M${hx - 6} ${hy + 5}q6 7 12 0" stroke="#263521" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  body += `<g class="head"><path d="M${hx - 5} ${hy - 13}q-6 -14 -12 -16M${hx + 5} ${hy - 13}q4 -14 10 -16" stroke="#3d7f24" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="${hx - 17}" cy="${hy - 29}" r="4" fill="#ffb52e"/><circle cx="${hx + 15}" cy="${hy - 29}" r="4" fill="#ffb52e"/><circle cx="${hx}" cy="${hy}" r="${headR}" fill="#9ad96b"/><circle cx="${hx - 6}" cy="${hy - 3}" r="4.2" fill="#263521"/><circle cx="${hx + 6}" cy="${hy - 3}" r="4.2" fill="#263521"/><circle cx="${hx - 5}" cy="${hy - 4.5}" r="1.4" fill="#fff"/><circle cx="${hx + 7}" cy="${hy - 4.5}" r="1.4" fill="#fff"/><circle cx="${hx - 11}" cy="${hy + 5}" r="3" fill="#e8505f" opacity=".45"/><circle cx="${hx + 11}" cy="${hy + 5}" r="3" fill="#e8505f" opacity=".45"/>${mouth}</g>`;
  const sc = opt.scale || 1;
  return `<svg class="tirtil" viewBox="0 0 ${W} ${H}" width="${Math.round(W * sc)}" height="${Math.round(H * sc)}" aria-hidden="true">${body}</svg>`;
}

// ---------- ortak arayüz ----------
let toastTimer = null;
function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('show'); setTimeout(() => { t.hidden = true; }, 300); }, ms);
}
function leafRain() {
  const box = document.createElement('div'); box.className = 'rain';
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span'); s.textContent = pick(['🍃', '🍀', '🌿', '🦋', '🍃', '✨']);
    s.style.left = rand(100) + 'vw'; s.style.animationDelay = (Math.random() * 1.2).toFixed(2) + 's'; s.style.fontSize = (16 + rand(18)) + 'px';
    box.appendChild(s);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 4300);
}
function showLevelUp(from, to) {
  const un = GAMES.filter(g => g.lvl > from && g.lvl <= to && (!g.needsSpeech || canSpeak));
  const el = document.createElement('div'); el.className = 'modal';
  el.innerHTML = `<div class="modal__box"><div class="lvlup__pet">${tirtilSVG(segFor(to), { wings: wingsFor(to) })}</div><div class="lvl-badge big">Seviye ${to}</div><h2>Tebrikler ${esc(S.name)}! 🎉</h2><p>Artık bir <b>${esc(titleOf(to))}</b> oldun.</p>${un.length ? `<div class="unl"><b>Yeni oyun açıldı</b>${un.map(g => `<span>${g.icon} ${esc(g.name)}</span>`).join('')}</div>` : ''}<button class="btn primary">Devam</button></div>`;
  document.body.appendChild(el); fanfare(); leafRain();
  const btn = el.querySelector('button'); btn.focus();
  btn.onclick = () => el.remove();
}

let cleanup = null;
function mount(html, keepScroll) {
  if (cleanup) { const c = cleanup; cleanup = null; try { c(); } catch (e) { /* yok */ } }
  const y = window.scrollY;
  app.innerHTML = html;
  window.scrollTo(0, keepScroll ? y : 0);
}
function onCleanup(fn) { const prev = cleanup; cleanup = () => { if (prev) prev(); fn(); }; }
function onKey(fn) { const h = e => { if (modalOpen()) return; fn(e); }; document.addEventListener('keydown', h); onCleanup(() => document.removeEventListener('keydown', h)); }
const gameHeader = (title, right = '') => `<header class="ghead"><button class="iconbtn" data-act="home" aria-label="Ana sayfa">✕</button><h2>${esc(title)}</h2><div class="ghead__r">${right}</div></header>`;
const pageHead = title => `<header class="ghead"><button class="iconbtn" data-act="home" aria-label="Ana sayfa">‹</button><h2>${esc(title)}</h2><div class="ghead__r"></div></header>`;
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-act="home"]'); if (b) { e.preventDefault(); go(''); } });

function dateLabel(d) {
  if (d === todayStr()) return 'Bugün';
  if (d === yesterdayStr()) return 'Dün';
  const dt = new Date(d + 'T00:00:00');
  return isNaN(dt) ? d : dt.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function addMine(en, tr) {
  S.mine.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), en: cleanText(en, 40), tr: cleanText(tr, 60), date: todayStr(), added: Date.now() });
  save();
  const n = S.mine.filter(m => m.date === todayStr()).length;
  if (n === 10) { toast('Bugünkü 10 kelime tamam! 🎉'); leafRain(); } else toast(`Eklendi ✓ (bugün ${n}/10)`);
}
const cleanText = (s, max) => String(s).trim().replace(/\s+/g, ' ').slice(0, max);
const inMine = key => S.mine.some(m => normEn(m.en) === key);

function showResult(o) {
  S.games = (S.games || 0) + 1; save();
  const uniq = [...new Map((o.missed || []).map(w => [w.key, w])).values()];
  const stars = o.ratio >= 0.9 ? '🌟🌟🌟' : o.ratio >= 0.6 ? '🌟🌟' : o.ratio > 0.2 ? '🌟' : '';
  const L = levelInfo(S.xp).level;
  mount(`<div class="result">
    <div class="result__pet">${tirtilSVG(segFor(L), { mood: o.ratio >= 0.5 ? 'happy' : 'sad', wings: wingsFor(L), scale: 1.15 })}</div>
    <h2>${esc(o.title)}</h2>
    <div class="stars">${stars || '🍂'}</div>
    <p class="big">${esc(o.line)}</p>
    <p class="earn">+${o.xp || 0} XP · Seviye ${L}</p>
    ${o.best != null ? `<p class="muted">En iyi skorun: <b>${o.best}</b> ${esc(o.bestLabel || '')}</p>` : ''}
    ${uniq.length ? `<section class="card list missed"><h3>Tekrar etmen gerekenler</h3>${uniq.map(w => `<div class="mrow"><div class="mrow__w"><b>${esc(w.en)}</b>${sayBtn(w.en)}<span>${esc(w.tr)}</span></div>${inMine(w.key) || w.mine ? '<span class="tag">Listende</span>' : `<button class="btn xs" data-add="${esc(w.key)}">+ Kelimelerime</button>`}</div>`).join('')}<p class="muted small">Yanlış yaptığın kelimeler “Zorlandıklarım” listesine girer ve daha sık karşına çıkar.</p></section>` : ''}
    <div class="row center wrap"><button class="btn primary" id="again">↻ Tekrar oyna</button><button class="btn ghost" data-act="home">Ana sayfa</button></div>
  </div>`);
  $('#again').onclick = o.again;
  app.addEventListener('click', addFromList);
  onCleanup(() => app.removeEventListener('click', addFromList));
  if (o.ratio >= 0.7) leafRain();
}
function addFromList(e) {
  const b = e.target.closest('[data-add]'); if (!b) return;
  const w = BY_KEY.get(b.dataset.add) || allWords().find(x => x.key === b.dataset.add);
  if (!w || inMine(w.key)) return;
  addMine(w.en, w.tr);
  b.outerHTML = '<span class="tag">Listende</span>';
}

// ---------- oyun listesi ----------
const GAMES = [
  { id: 'meaning', lvl: 1, name: 'Anlamını Bul', icon: '🍃', color: '#e3f2d6', desc: 'İngilizce kelime, Türkçe şıklar', run: () => quiz({ id: 'meaning', title: 'Anlamını Bul', gens: ['mcEnTr'], count: 10 }) },
  { id: 'english', lvl: 1, name: 'İngilizcesi Ne?', icon: '🌱', color: '#dcedfa', desc: 'Türkçe kelime, İngilizce şıklar', run: () => quiz({ id: 'english', title: 'İngilizcesi Ne?', gens: ['mcTrEn'], count: 10 }) },
  { id: 'match', lvl: 1, name: 'Eşleştir', icon: '🔗', color: '#fff0cf', desc: 'Kelimeleri anlamlarıyla eşle', run: matching },
  { id: 'memory', lvl: 2, name: 'Hafıza Kartları', icon: '🃏', color: '#efe6fb', desc: 'Kartları çevir, çiftleri bul', run: memory, bestLabel: 'hamle' },
  { id: 'scramble', lvl: 2, name: 'Harf Karmaşası', icon: '🔤', color: '#fde3e5', desc: 'Karışık harflerden kelimeyi kur', run: () => quiz({ id: 'scramble', title: 'Harf Karmaşası', gens: ['scramble'], count: 10 }) },
  { id: 'crossword', lvl: 3, name: 'Bulmaca', icon: '🧩', color: '#fff0cf', desc: 'Türkçe ipuçları, İngilizce cevaplar', run: crossword },
  { id: 'listen', lvl: 3, name: 'Dinle ve Seç', icon: '🎧', color: '#dcedfa', desc: 'Duyduğun kelimenin anlamını seç', needsSpeech: true, run: () => quiz({ id: 'listen', title: 'Dinle ve Seç', gens: ['listen'], count: 10 }) },
  { id: 'hangman', lvl: 4, name: 'Yaprak Bitmeden', icon: '🍂', color: '#e3f2d6', desc: 'Harf tahmin et, yaprakları koru', run: hangman },
  { id: 'search', lvl: 4, name: 'Kelime Avı', icon: '🔍', color: '#efe6fb', desc: 'Tablodaki gizli kelimeleri bul', run: wordSearch },
  { id: 'write', lvl: 5, name: 'Yaz Bakalım', icon: '✏️', color: '#fde3e5', desc: 'Türkçesini gör, İngilizcesini yaz', run: () => quiz({ id: 'write', title: 'Yaz Bakalım', gens: ['write'], count: 10 }) },
  { id: 'speed', lvl: 5, name: 'Hızlı Tırtıl', icon: '⚡', color: '#fff0cf', desc: '60 saniye: doğru mu, yanlış mı?', run: speedGame, bestLabel: 'doğru' },
  { id: 'snake', lvl: 6, name: 'Tırtıl Yolu', icon: '🐛', color: '#e3f2d6', desc: 'Harfleri sırayla ye, kelimeyi tamamla', run: snakeGame, bestLabel: 'kelime' },
  { id: 'endless', lvl: 7, name: 'Sonsuz Maraton', icon: '♾️', color: '#dcedfa', desc: 'Karışık sorular, 3 can', run: () => quiz({ id: 'endless', title: 'Sonsuz Maraton', gens: ['mcEnTr', 'mcTrEn', 'write', 'scramble', ...(canSpeak ? ['listen'] : [])], lives: 3 }), bestLabel: 'doğru' },
];
const GAME_MAP = Object.fromEntries(GAMES.map(g => [g.id, g]));

// ---------- yönlendirme ----------
function route() {
  if (!S) return renderLogin();
  const [name, arg] = location.hash.replace(/^#\/?/, '').split('/');
  if (name === 'game' && GAME_MAP[arg]) {
    const g = GAME_MAP[arg];
    if ((g.needsSpeech && !canSpeak) || levelInfo(S.xp).level < g.lvl) return go('');
    return g.run();
  }
  if (name === 'mine') return renderMine();
  if (name === 'dict') return renderDict();
  return renderHome();
}
function go(path) { const want = path ? '#' + path : ''; if (location.hash === want || (!path && (location.hash === '' || location.hash === '#'))) route(); else location.hash = path; }
window.addEventListener('hashchange', route);

// ---------- giriş ----------
function renderLogin() {
  const list = users().sort((a, b) => (b.last || 0) - (a.last || 0));
  mount(`<div class="login">
    <div class="login__pet">${tirtilSVG(7, { scale: 1.25 })}</div>
    <h1>Kelime Tırtılı</h1>
    <p class="muted">İngilizce kelimeleri oynayarak öğren. Tırtılın her doğru cevapla büyür, bir gün kelebek olur! 🦋</p>
    <form id="lf" class="card login__f" autocomplete="off">
      <label for="ln">Adın ne?</label>
      <input id="ln" class="inp big" maxlength="20" placeholder="Adını yaz" autocomplete="off" enterkeyhint="go">
      <button class="btn primary big">Başla ➜</button>
      <p class="muted small">Aynı adla girersen kaldığın yerden devam edersin. Yeni bir adla oyun sıfırdan başlar.</p>
    </form>
    ${list.length ? `<section class="card"><h3>Bu cihazdaki oyuncular</h3><div class="plist">${list.map(u => `<button class="pbtn" data-u="${esc(u.name)}"><span class="pbtn__a">${esc(u.name.slice(0, 1).toLocaleUpperCase('tr'))}</span><span><b>${esc(u.name)}</b><small>Seviye ${levelInfo(u.xp || 0).level} · ${esc(titleOf(levelInfo(u.xp || 0).level))}</small></span><i>➜</i></button>`).join('')}</div></section>` : ''}
  </div>`);
  $('#lf').onsubmit = e => { e.preventDefault(); const v = cleanName($('#ln').value); if (!v) { $('#ln').focus(); return; } enter(v); };
  $$('.pbtn').forEach(b => { b.onclick = () => enter(b.dataset.u); });
}
function enter(name) {
  const isNew = login(name);
  toast(isNew ? `Merhaba ${S.name}! Yeni bir macera başlıyor 🐛` : `Tekrar hoş geldin ${S.name}! Kaldığın yerden devam 🍃`, 3200);
  go('');
}

// ---------- ana sayfa ----------
function renderHome(keep) {
  const s = S.settings, li = levelInfo(S.xp), L = li.level, t = todayStr();
  const todayXp = S.today.date === t ? S.today.xp : 0;
  const mastered = Object.values(S.stats).filter(x => (x.s || 0) >= 3).length;
  const counts = { all: sourceWords('all').length, mine: S.mine.length, today: myWords(true).length, hard: sourceWords('hard').length };
  const games = GAMES.filter(g => !g.needsSpeech || canSpeak);
  const nextG = games.filter(g => g.lvl > L).sort((a, b) => a.lvl - b.lvl)[0];
  mount(`
  <header class="top"><div class="brand">${tirtilSVG(3, { scale: 0.42 })}<h1>Kelime Tırtılı</h1></div><button class="user" id="userBtn" title="Oyuncu değiştir"><span>${esc(S.name)}</span><i>⇄</i></button></header>
  <section class="card hero">
    <div class="hero__pet">${tirtilSVG(segFor(L), { wings: wingsFor(L), scale: 1.15 })}</div>
    <div class="hero__lvl"><span class="lvl-badge">Seviye ${L}</span><b>${esc(titleOf(L))}</b></div>
    <div class="xpbar"><div class="bar big"><i style="width:${(li.into / li.need * 100).toFixed(1)}%"></i></div><span class="small">${li.into} / ${li.need} XP</span></div>
    ${nextG ? `<p class="muted small center">Seviye ${nextG.lvl}'te açılacak: ${nextG.icon} ${esc(nextG.name)}</p>` : ''}
    <div class="stats"><div><b>${streakNow()}</b><span>gün seri 🔥</span></div><div><b>${mastered}</b><span>öğrenilen</span></div><div><b>${S.xp}</b><span>toplam XP</span></div></div>
    <div class="goal"><span class="small">Günlük hedef</span><div class="bar"><i style="width:${Math.min(100, todayXp / DAILY_GOAL * 100).toFixed(1)}%"></i></div><span class="small">${Math.min(todayXp, DAILY_GOAL)}/${DAILY_GOAL}${S.today.date === t && S.today.bonus ? ' ✓' : ''}</span></div>
  </section>
  <div class="quick">
    <a class="qbtn" href="#mine"><span class="qbtn__i">📒</span><span><b>Kelimelerim</b><small>Bugün ${counts.today}/10 kelime</small></span></a>
    <a class="qbtn" href="#dict"><span class="qbtn__i">📚</span><span><b>Sözlük</b><small>${WORDS.length} kelime</small></span></a>
  </div>
  <section class="card pool">
    <h3>Hangi kelimelerle oynayalım?</h3>
    <div class="seg">${SOURCES.map(o => `<button class="${s.source === o.id ? 'on' : ''}" data-src="${o.id}">${o.name}<small>${counts[o.id]}</small></button>`).join('')}</div>
    ${s.source === 'all' ? `<div class="filters"><div class="chips">${['A1', 'A2'].map(lv => `<button class="chip ${s.levels.includes(lv) ? 'on' : ''}" data-lvl="${lv}">${lv}</button>`).join('')}</div><select id="catSel" class="inp sm" aria-label="Konu"><option value="">Tüm konular</option>${CATS.map(c => `<option ${s.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>` : ''}
    ${s.source !== 'all' && counts[s.source] === 0 ? `<p class="muted small">${s.source === 'hard' ? 'Henüz zorlandığın kelime yok. Yanlış yaptıkların buraya gelir.' : 'Bu listede henüz kelime yok; “Kelimelerim” ekranından ekleyebilirsin.'}</p>` : ''}
  </section>
  <h3 class="sec">Oyunlar</h3>
  <div class="games">${games.map(g => {
    const locked = L < g.lvl;
    const best = S.best[g.id];
    return locked
      ? `<div class="gcard locked" style="--c:${g.color}"><span class="gcard__i">🔒</span><b>${esc(g.name)}</b><small>Seviye ${g.lvl}'te açılır</small></div>`
      : `<a class="gcard" href="#game/${g.id}" style="--c:${g.color}"><span class="gcard__i">${g.icon}</span><b>${esc(g.name)}</b><small>${esc(g.desc)}</small>${best != null && g.bestLabel ? `<span class="gcard__best">🏆 ${best} ${esc(g.bestLabel)}</span>` : ''}</a>`;
  }).join('')}</div>
  <section class="card settings" id="settings">
    <h3>Ayarlar</h3>
    <label class="sw"><input type="checkbox" id="optSound" ${s.sound ? 'checked' : ''}><span></span>Ses efektleri</label>
    ${canSpeak ? `<label class="sw"><input type="checkbox" id="optSpeak" ${s.speak ? 'checked' : ''}><span></span>İngilizce kelimeleri sesli oku</label>` : ''}
    <div class="row wrap"><button class="btn ghost sm" id="switchBtn">⇄ Oyuncu değiştir</button><button class="btn ghost sm danger-t" id="resetBtn">İlerlemeyi sıfırla</button></div>
    <p class="muted small">İlerleme bu telefonda, bu tarayıcıda <b>${esc(S.name)}</b> adıyla saklanır. Başka cihaza geçerken Kelimelerim ekranından yedek alabilirsin.</p>
  </section>`, keep);

  $$('[data-src]').forEach(b => { b.onclick = () => { s.source = b.dataset.src; save(); renderHome(true); }; });
  $$('[data-lvl]').forEach(b => { b.onclick = () => { const lv = b.dataset.lvl; if (s.levels.includes(lv)) { if (s.levels.length === 1) return toast('En az bir seviye seçili kalmalı.'); s.levels = s.levels.filter(x => x !== lv); } else s.levels = [...s.levels, lv].sort(); save(); renderHome(true); }; });
  const cat = $('#catSel'); if (cat) cat.onchange = () => { s.cat = cat.value; save(); renderHome(true); };
  $('#optSound').onchange = e => { s.sound = e.target.checked; save(); };
  const sp = $('#optSpeak'); if (sp) sp.onchange = e => { s.speak = e.target.checked; save(); };
  $('#userBtn').onclick = logout; $('#switchBtn').onclick = logout;
  $('#resetBtn').onclick = () => {
    if (!confirm(`${S.name} için seviye, XP, seri ve istatistikler sıfırlansın mı? Kelimelerin silinmez.`)) return;
    Object.assign(S, { xp: 0, today: { date: '', xp: 0, bonus: false }, streak: { last: '', count: 0 }, stats: {}, best: {}, games: 0 });
    save(); toast('İlerleme sıfırlandı.'); renderHome();
  };
}

// ---------- kelimelerim ----------
let editingId = null;
function renderMine(keep) {
  const t = todayStr(); const today = S.mine.filter(m => m.date === t);
  const groups = new Map();
  [...S.mine].sort((a, b) => b.date.localeCompare(a.date) || (b.added || 0) - (a.added || 0)).forEach(m => { if (!groups.has(m.date)) groups.set(m.date, []); groups.get(m.date).push(m); });
  const ed = editingId ? S.mine.find(m => m.id === editingId) : null;
  if (!ed) editingId = null;
  const row = m => {
    const st = S.stats[normEn(m.en)];
    return `<div class="mrow"><div class="mrow__w"><b>${esc(m.en)}</b>${sayBtn(m.en)}<span>${esc(m.tr)}</span></div><div class="mrow__s">${st ? `<span class="ok">✓${st.c}</span><span class="no">✗${st.w}</span>` : ''}${isMastered(normEn(m.en)) ? '<span class="tag">Öğrenildi</span>' : ''}</div><button class="iconbtn sm" data-ed="${m.id}" aria-label="Düzenle">✎</button><button class="iconbtn sm" data-del="${m.id}" aria-label="Sil">🗑</button></div>`;
  };
  mount(`<div class="page">${pageHead('📒 Kelimelerim')}
    <section class="card">
      <div class="goal10"><div class="dots">${Array.from({ length: 10 }, (_, i) => `<i class="${i < today.length ? 'on' : ''}">${i < today.length ? '🍃' : ''}</i>`).join('')}</div><p><b>Bugün ${today.length} / 10 kelime</b>${today.length >= 10 ? ' · Bugünkü hedef tamam! 🎉' : ''}</p></div>
      <form id="af" class="addf" autocomplete="off">
        <label>İngilizce<input id="fEn" class="inp" maxlength="40" placeholder="ör. butterfly" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="next" value="${ed ? esc(ed.en) : ''}"></label>
        <label>Türkçe<input id="fTr" class="inp" maxlength="60" placeholder="ör. kelebek" autocomplete="off" enterkeyhint="done" value="${ed ? esc(ed.tr) : ''}"></label>
        <div id="sugg" class="sugg"></div>
        <p id="fErr" class="err"></p>
        <div class="row wrap"><button class="btn primary">${ed ? '✓ Kaydet' : '+ Ekle'}</button>${ed ? '<button type="button" class="btn ghost" id="fCancel">Vazgeç</button>' : ''}<a class="btn ghost" href="#dict">📚 Sözlükten seç</a></div>
      </form>
    </section>
    <section class="card"><h3>Kendi kelimelerinle oyna</h3><p class="muted small">Seçince bütün oyunlar bu kelimeleri sorar.</p><div class="row wrap"><button class="btn primary" data-play="today" ${today.length ? '' : 'disabled'}>Bugünkülerle (${today.length})</button><button class="btn ghost" data-play="mine" ${S.mine.length ? '' : 'disabled'}>Hepsiyle (${S.mine.length})</button></div></section>
    ${S.mine.length ? [...groups].map(([d, list]) => `<section class="card list"><h3>${esc(dateLabel(d))} <small class="muted">${list.length} kelime</small></h3>${list.map(row).join('')}</section>`).join('') : '<section class="card empty">Henüz kelime eklemedin. Her gün 10 kelime seç, burada biriksin! 🐛</section>'}
    <section class="card"><h3>Yedek</h3><p class="muted small">Kelimelerin ve ilerlemen yalnızca bu cihazda, bu tarayıcıda saklanıyor. Telefon değiştirirsen ya da tarayıcı verilerini silersen kaybolmasın diye ara sıra yedek al.</p><div class="row wrap"><button class="btn ghost" id="bkDown">⬇️ Yedeği indir</button><label class="btn ghost">⬆️ Yedeği yükle<input type="file" id="bkUp" accept="application/json,.json" hidden></label></div></section>
  </div>`, keep);

  const fEn = $('#fEn'), fTr = $('#fTr'), err = $('#fErr');
  const suggest = () => {
    const w = BY_KEY.get(normEn(fEn.value));
    $('#sugg').innerHTML = w && normTr(fTr.value) !== normTr(w.tr) ? `<button type="button" class="chip on" id="useS">📚 Sözlükte: ${esc(w.tr)} — kullan</button>` : '';
    const u = $('#useS'); if (u) u.onclick = () => { fTr.value = w.tr; $('#sugg').innerHTML = ''; fTr.focus(); };
  };
  fEn.oninput = suggest; fTr.oninput = suggest;
  fEn.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); fTr.focus(); } };
  $('#af').onsubmit = e => {
    e.preventDefault();
    const en = cleanText(fEn.value, 40), tr = cleanText(fTr.value, 60);
    if (!/[a-z]/i.test(en)) { err.textContent = 'İngilizce kelimeyi yaz.'; fEn.focus(); return; }
    if (!tr) { err.textContent = 'Türkçesini yaz.'; fTr.focus(); return; }
    const dupe = S.mine.find(m => normEn(m.en) === normEn(en) && m.id !== editingId);
    if (dupe) { err.textContent = `“${dupe.en}” zaten listende (${dateLabel(dupe.date)}).`; return; }
    if (ed) { ed.en = en; ed.tr = tr; editingId = null; save(); toast('Kaydedildi ✓'); renderMine(true); return; }
    addMine(en, tr); renderMine(true); $('#fEn').focus();
  };
  const cancel = $('#fCancel'); if (cancel) cancel.onclick = () => { editingId = null; renderMine(true); };
  app.querySelector('.page').addEventListener('click', e => {
    const d = e.target.closest('[data-del]'), ei = e.target.closest('[data-ed]'), p = e.target.closest('[data-play]');
    if (d) { const m = S.mine.find(x => x.id === d.dataset.del); if (m && confirm(`“${m.en}” silinsin mi?`)) { S.mine = S.mine.filter(x => x !== m); if (editingId === m.id) editingId = null; save(); renderMine(true); } }
    if (ei) { editingId = ei.dataset.ed; renderMine(); $('#fEn').focus(); }
    if (p) { S.settings.source = p.dataset.play; save(); toast(p.dataset.play === 'today' ? 'Oyunlar artık bugünkü kelimelerini soracak 🐛' : 'Oyunlar artık senin kelimelerini soracak 🐛', 3000); go(''); }
  });
  $('#bkDown').onclick = () => {
    const blob = new Blob([JSON.stringify({ app: 'kelime-tirtili', v: 1, saved: new Date().toISOString(), data: S })], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `kelime-tirtili-${userKey(S.name).replace(/[^a-z0-9çğıöşü]+/g, '-')}-${todayStr()}.json`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  $('#bkUp').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const j = JSON.parse(await f.text()); const d = j.data || j;
      if (!d || !Array.isArray(d.mine)) throw new Error('biçim');
      if (confirm(`Yedek yüklensin mi? ${S.name} oyuncusunun bu cihazdaki ilerlemesi yedektekiyle değiştirilir (${d.mine.length} kelime, ${d.xp || 0} XP).`)) {
        const name = S.name; S = normalizeState(d, name); S.name = name; save(); toast('Yedek yüklendi ✓'); renderMine();
      }
    } catch (x) { toast('Bu dosya okunamadı.'); }
    e.target.value = '';
  };
}

// ---------- sözlük ----------
const dictState = { q: '', lvl: '', cat: '', limit: 60 };
function renderDict() {
  mount(`<div class="page">${pageHead('📚 Sözlük')}
    <section class="card">
      <input id="dq" class="inp" placeholder="İngilizce ya da Türkçe ara…" value="${esc(dictState.q)}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
      <div class="filters"><div class="chips">${[['', 'Hepsi'], ['A1', 'A1'], ['A2', 'A2']].map(([v, n]) => `<button class="chip ${dictState.lvl === v ? 'on' : ''}" data-dl="${v}">${n}</button>`).join('')}</div><select id="dc" class="inp sm" aria-label="Konu"><option value="">Tüm konular</option>${CATS.map(c => `<option ${dictState.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
      <p class="muted small" id="dcount"></p>
    </section>
    <section class="card list" id="dres"></section>
  </div>`);
  const res = $('#dres');
  const upd = () => {
    const q = dictState.q.trim(), qe = normEn(q), qt = normTr(q);
    let list = WORDS.filter(w => (!dictState.lvl || w.lvl === dictState.lvl) && (!dictState.cat || w.cat === dictState.cat));
    if (q) {
      const sc = w => { const e = normEn(w.en); if (e === qe) return 0; if (e.startsWith(qe)) return 1; if (w.trAll.some(t => t === qt)) return 2; if (w.trAll.some(t => t.startsWith(qt))) return 3; if (e.includes(qe)) return 4; if (normTr(w.tr).includes(qt)) return 5; return 9; };
      list = list.map(w => [sc(w), w]).filter(x => x[0] < 9).sort((a, b) => a[0] - b[0] || a[1].en.localeCompare(b[1].en)).map(x => x[1]);
    } else list = [...list].sort((a, b) => a.en.toLowerCase().localeCompare(b.en.toLowerCase()));
    $('#dcount').textContent = `${list.length} kelime`;
    res.innerHTML = list.length ? list.slice(0, dictState.limit).map(w => `<div class="mrow"><div class="mrow__w"><b>${esc(w.en)}</b>${sayBtn(w.en)}<span>${esc(w.tr)}</span></div><div class="mrow__s"><span class="tag lv">${w.lvl}</span>${isMastered(w.key) ? '<span class="tag">Öğrenildi</span>' : ''}</div>${inMine(w.key) ? '<span class="tag ok">Listende</span>' : `<button class="btn xs" data-add="${esc(w.key)}">+ Ekle</button>`}</div>`).join('') + (list.length > dictState.limit ? '<div class="row center"><button class="btn ghost sm" id="more">Daha fazla göster</button></div>' : '') : '<p class="muted center">Bulunamadı. Kelimeyi “Kelimelerim” ekranından kendin ekleyebilirsin.</p>';
    const m = $('#more'); if (m) m.onclick = () => { dictState.limit += 60; upd(); };
  };
  $('#dq').oninput = e => { dictState.q = e.target.value; dictState.limit = 60; upd(); };
  $$('[data-dl]').forEach(b => { b.onclick = () => { dictState.lvl = b.dataset.dl; $$('[data-dl]').forEach(x => x.classList.toggle('on', x === b)); dictState.limit = 60; upd(); }; });
  $('#dc').onchange = e => { dictState.cat = e.target.value; dictState.limit = 60; upd(); };
  res.addEventListener('click', e => { const b = e.target.closest('[data-add]'); if (!b) return; const w = BY_KEY.get(b.dataset.add); if (w && !inMine(w.key)) { addMine(w.en, w.tr); b.outerHTML = '<span class="tag ok">Listende</span>'; } });
  upd();
}

// ---------- soru üreticileri ----------
const GEN = {
  mcEnTr: w => ({ kind: 'mc', w, say: 'auto', html: `<div class="q-lbl">İngilizce</div><div class="q-word">${esc(w.en)} ${sayBtn(w.en)}</div><p class="q-sub">Türkçesi hangisi?</p>`, options: shuffle([w, ...distractors(w, 3, 'tr')]).map(x => ({ text: x.tr, ok: x.key === w.key })) }),
  mcTrEn: w => ({ kind: 'mc', w, en: true, html: `<div class="q-lbl">Türkçe</div><div class="q-word tr">${esc(w.tr)}</div><p class="q-sub">İngilizcesi hangisi?</p>`, options: shuffle([w, ...distractors(w, 3, 'en')]).map(x => ({ text: x.en, ok: x.key === w.key })) }),
  listen: w => ({ kind: 'mc', w, say: 'always', html: `<button type="button" class="bigspk" data-say="${esc(w.en)}" aria-label="Tekrar dinle">🔊</button><p class="q-sub">Dinle — Türkçesi hangisi? <small class="muted">(tekrar dinlemek için dokun)</small></p>`, options: shuffle([w, ...distractors(w, 3, 'tr')]).map(x => ({ text: x.tr, ok: x.key === w.key })) }),
  write: w => ({ kind: 'write', w, html: `<div class="q-lbl">Türkçe</div><div class="q-word tr">${esc(w.tr)}</div><p class="q-sub">İngilizcesini yaz</p>` }),
  scramble: w => {
    const word = w.en.toLowerCase(); let letters = word.split('');
    for (let k = 0; k < 12 && letters.join('') === word; k++) letters = shuffle(letters);
    return { kind: 'scramble', w, letters, html: `<div class="q-lbl">Türkçe</div><div class="q-word tr">${esc(w.tr)}</div><p class="q-sub">Harfleri doğru sıraya diz</p>` };
  },
};
const GEN_OK = { scramble: w => lettersOnly(w) && w.en.length >= 3 && w.en.length <= 10, listen: () => canSpeak };
const PRAISE = ['Harika!', 'Süper!', 'Aferin!', 'Çok iyi!', 'Bravo!', 'Mükemmel!', 'Tırtıl gurur duyuyor!', 'Yaprak kaptın! 🍃'];

// ---------- soru oyunları (seçmeli, yazma, harf, dinleme, maraton) ----------
function quiz(cfg) {
  const endless = !cfg.count;
  const usable = w => cfg.gens.some(g => !GEN_OK[g] || GEN_OK[g](w));
  const pool = getPool(usable, 4);
  const queue = endless ? [] : pickWords(pool, cfg.count);
  const total = queue.length;
  const st = { i: 0, score: 0, lives: cfg.lives || 0, streak: 0, missed: [], recent: [], q: null, answered: false, built: [], hints: 0, xp0: S.xp };
  let timer = null;
  mount(`<div class="game">${gameHeader(cfg.title, '<span class="pill" id="score">✓ 0</span>')}<div class="qtop"><div id="prog" class="qprog"></div><div id="mini" class="mini"></div></div><div id="qarea"></div><div id="fb" class="fb"></div></div>`);
  onCleanup(() => clearTimeout(timer));
  const qarea = $('#qarea');

  function top() {
    $('#prog').innerHTML = endless
      ? `<div class="lives">${Array.from({ length: cfg.lives }, (_, i) => `<span class="${i < st.lives ? '' : 'lost'}">${i < st.lives ? '🍃' : '🍂'}</span>`).join('')}</div>`
      : `<div class="bar"><i style="width:${total ? st.i / total * 100 : 0}%"></i></div><span class="muted small">${Math.min(st.i + (st.answered ? 0 : 1), total)} / ${total}</span>`;
    $('#mini').innerHTML = tirtilSVG(Math.min(3 + st.streak, 12), { scale: 0.42, mood: st.streak ? 'happy' : 'calm' });
    $('#score').textContent = '✓ ' + st.score;
  }
  function nextQ() {
    clearTimeout(timer);
    const fb = $('#fb'); if (!fb) return;
    fb.className = 'fb'; fb.innerHTML = '';
    if (endless ? st.lives <= 0 : st.i >= total) return finish();
    let w;
    if (endless) {
      const c = pool.filter(x => !st.recent.includes(x.key));
      w = pickWords(c.length ? c : pool, 1)[0];
      st.recent.push(w.key); if (st.recent.length > Math.min(25, pool.length - 1)) st.recent.shift();
    } else w = queue[st.i];
    const gens = cfg.gens.filter(g => !GEN_OK[g] || GEN_OK[g](w));
    st.q = GEN[pick(gens)](w); st.answered = false; st.built = []; st.hints = 0;
    top(); drawQ();
    if (st.q.say === 'always' || (st.q.say === 'auto' && S.settings.speak)) setTimeout(() => speak(w.en), 250);
  }
  function drawQ() {
    const q = st.q; let body = '';
    if (q.kind === 'mc') body = `<div class="opts ${q.en ? 'en' : ''}">${q.options.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${i + 1}</span><span>${esc(o.text)}</span></button>`).join('')}</div>`;
    else if (q.kind === 'write') body = `<form id="wf" class="write" autocomplete="off"><div class="hint" id="hint">${hintHTML()}</div><input id="ans" class="inp big" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="İngilizcesini yaz"><div class="row center"><button type="button" class="btn ghost" id="hintBtn">💡 Harf ver</button><button class="btn primary">Kontrol et</button></div></form>`;
    else body = '<div id="sc"></div>';
    qarea.innerHTML = `<section class="qcard">${q.html}</section>${body}`;
    if (q.kind === 'write') {
      const ans = $('#ans'); ans.focus();
      $('#wf').onsubmit = e => { e.preventDefault(); checkWrite(); };
      $('#hintBtn').onclick = () => { if (st.answered) return; st.hints = Math.min(st.hints + 1, q.w.en.replace(/[^a-z]/gi, '').length); $('#hint').innerHTML = hintHTML(); ans.focus(); };
    }
    if (q.kind === 'scramble') drawScramble();
  }
  function hintHTML() {
    const en = st.q.w.en; let k = 0;
    return `<span class="pattern">${[...en].map(ch => { if (!/[a-z]/i.test(ch)) return ch === ' ' ? '<i class="gap"></i>' : `<span class="ph on">${esc(ch)}</span>`; const show = k++ < st.hints; return `<span class="ph ${show ? 'on' : ''}">${show ? esc(ch.toLowerCase()) : ''}</span>`; }).join('')}</span><small class="muted">${en.replace(/[^a-z]/gi, '').length} harf</small>`;
  }
  function checkWrite() {
    if (st.answered) { nextQ(); return; }
    const inp = $('#ans'); const v = normEn(inp.value);
    if (!v) { inp.focus(); return; }
    const w = st.q.w, strip = x => x.replace(/^(to|a|an|the) /, '');
    let ok = w.alts.some(a => a === v || strip(a) === strip(v)), note = '';
    if (!ok && w.alts[0].length >= 5 && lev(strip(v), strip(w.alts[0])) === 1) { ok = true; note = `Küçük bir yazım hatası vardı: “${inp.value.trim()}”`; }
    inp.classList.add(ok ? 'right' : 'wrong'); inp.readOnly = true;
    result(ok, note);
  }
  function drawScramble() {
    const q = st.q;
    $('#sc').innerHTML = `<div class="slots">${q.letters.map((_, i) => `<button class="slot ${i < st.built.length ? 'on' : ''}" data-s="${i}">${i < st.built.length ? esc(q.letters[st.built[i]].toUpperCase()) : ''}</button>`).join('')}</div><div class="tiles">${q.letters.map((ch, i) => `<button class="tile" data-t="${i}" ${st.built.includes(i) || st.answered ? 'disabled' : ''}>${esc(ch.toUpperCase())}</button>`).join('')}</div><div class="row center"><button class="btn ghost sm" id="clr">↺ Temizle</button><button class="btn ghost sm" id="shuf">🔀 Karıştır</button></div>`;
  }
  function checkScramble() {
    const q = st.q; if (st.built.length < q.letters.length) return;
    const ok = st.built.map(i => q.letters[i]).join('') === q.w.en.toLowerCase();
    $$('.slot').forEach(s => s.classList.add(ok ? 'right' : 'wrong'));
    result(ok);
  }
  function answerMc(i) {
    if (st.answered || !st.q.options[i]) return;
    const q = st.q;
    $$('.opt').forEach((b, j) => { b.disabled = true; if (q.options[j].ok) b.classList.add('right'); else if (j === i) b.classList.add('wrong'); });
    result(q.options[i].ok);
  }
  qarea.addEventListener('click', e => {
    const o = e.target.closest('.opt'); if (o) { answerMc(+o.dataset.i); return; }
    if (st.answered || !st.q || st.q.kind !== 'scramble') return;
    const t = e.target.closest('.tile'); if (t) { st.built.push(+t.dataset.t); drawScramble(); checkScramble(); return; }
    const s = e.target.closest('.slot'); if (s) { const i = +s.dataset.s; if (i < st.built.length) { st.built.splice(i, 1); drawScramble(); } return; }
    if (e.target.closest('#clr')) { st.built = []; drawScramble(); }
    if (e.target.closest('#shuf')) { st.built = []; st.q.letters = shuffle(st.q.letters); drawScramble(); }
  });
  function result(ok, note = '') {
    st.answered = true; const w = st.q.w;
    record(w, ok, 10);
    beep(ok);
    if (ok) { st.score++; st.streak++; } else { st.streak = 0; st.missed.push(w); if (endless) st.lives--; }
    if (!endless) st.i++;
    top();
    const last = endless ? st.lives <= 0 : st.i >= total;
    const fb = $('#fb');
    fb.className = 'fb show ' + (ok ? 'ok' : 'no');
    fb.innerHTML = `<div class="fb__in"><div class="fb__txt"><div class="fb__t">${ok ? esc(pick(PRAISE)) + (st.streak >= 3 ? ` <span class="combo">${st.streak} seri 🔥</span>` : '') : 'Doğrusu:'}</div><div class="fb__w"><b>${esc(w.en)}</b>${sayBtn(w.en)}<span>= ${esc(w.tr)}</span></div>${note ? `<div class="small">${esc(note)}</div>` : ''}</div><button class="btn ${ok ? 'primary' : 'danger'}" id="nextBtn">${last ? 'Sonuç' : 'Devam'} ➜</button></div>`;
    $('#nextBtn').onclick = nextQ;
    if (S.settings.speak && st.q.say !== 'auto' && st.q.say !== 'always') speak(w.en);
    if (ok && !last) timer = setTimeout(nextQ, 1400);
  }
  onKey(e => {
    if (!st.q) return;
    if (e.key === 'Enter' && st.answered && !(e.target.closest && e.target.closest('form'))) { e.preventDefault(); nextQ(); return; }
    if (st.answered || typingIn(e)) return;
    if (st.q.kind === 'mc' && /^[1-4]$/.test(e.key)) answerMc(+e.key - 1);
    if (st.q.kind === 'scramble') {
      if (e.key === 'Backspace') { e.preventDefault(); st.built.pop(); drawScramble(); }
      else if (/^[a-z]$/i.test(e.key)) { const i = st.q.letters.findIndex((ch, j) => ch === e.key.toLowerCase() && !st.built.includes(j)); if (i >= 0) { st.built.push(i); drawScramble(); checkScramble(); } }
    }
  });
  function finish() {
    clearTimeout(timer);
    const best = endless ? setBest(cfg.id, st.score) : null;
    showResult({ title: cfg.title, line: endless ? `${st.score} doğru cevap` : `${total} sorudan ${st.score} doğru`, ratio: endless ? Math.min(1, st.score / 15) : st.score / Math.max(total, 1), xp: S.xp - st.xp0, missed: st.missed, best, bestLabel: 'doğru', again: () => quiz(cfg) });
  }
  nextQ();
}

// ---------- bulmaca ----------
function buildCross(cands, max, limit) {
  const grid = new Map(), placed = [];
  const K = (r, c) => r + ',' + c, get = (r, c) => grid.get(K(r, c));
  let minR = 0, maxR = 0, minC = 0, maxC = 0;
  function check(word, r, c, dir) {
    const dr = dir, dc = 1 - dir; let inter = 0;
    if (get(r - dr, c - dc) || get(r + dr * word.length, c + dc * word.length)) return -1;
    for (let i = 0; i < word.length; i++) {
      const rr = r + dr * i, cc = c + dc * i, cell = get(rr, cc);
      if (cell) { if (cell.ch !== word[i] || cell.dirs[dir]) return -1; inter++; }
      else if (get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) return -1;
    }
    const a = Math.min(minR, r), b = Math.max(maxR, r + dr * (word.length - 1)), x = Math.min(minC, c), y = Math.max(maxC, c + dc * (word.length - 1));
    if (b - a + 1 > limit || y - x + 1 > limit) return -1;
    return inter;
  }
  function put(word, r, c, dir, w) {
    const dr = dir, dc = 1 - dir;
    for (let i = 0; i < word.length; i++) { const k = K(r + dr * i, c + dc * i); const cell = grid.get(k) || { ch: word[i], dirs: [false, false] }; cell.dirs[dir] = true; grid.set(k, cell); }
    minR = Math.min(minR, r); maxR = Math.max(maxR, r + dr * (word.length - 1)); minC = Math.min(minC, c); maxC = Math.max(maxC, c + dc * (word.length - 1));
    placed.push({ w, word, r, c, dir });
  }
  if (cands.length) {
    const f = cands[0].en.toUpperCase(); put(f, 0, 0, 0, cands[0]); maxC = f.length - 1;
    for (const w of cands.slice(1)) {
      if (placed.length >= max) break;
      const word = w.en.toUpperCase();
      if (placed.some(p => p.word === word)) continue;
      const opts = [];
      for (const [k, cell] of grid) {
        const [r0, c0] = k.split(',').map(Number);
        for (let i = 0; i < word.length; i++) {
          if (word[i] !== cell.ch) continue;
          for (const dir of [0, 1]) {
            if (cell.dirs[dir]) continue;
            const r = dir ? r0 - i : r0, c = dir ? c0 : c0 - i;
            const s = check(word, r, c, dir);
            if (s > 0) opts.push({ r, c, dir, s });
          }
        }
      }
      if (opts.length) { const topS = Math.max(...opts.map(o => o.s)); const o = pick(opts.filter(x => x.s === topS)); put(word, o.r, o.c, o.dir, w); }
    }
  }
  return { placed, b: { minR, maxR, minC, maxC } };
}
function crossword() {
  const pool = getPool(w => lettersOnly(w) && w.en.length >= 3 && w.en.length <= 10, 6);
  let best = null;
  for (let t = 0; t < 40; t++) {
    const cands = pickWords(pool, Math.min(22, pool.length)).sort((a, b) => b.en.length - a.en.length);
    const r = buildCross(cands, 9, 12);
    if (!best || r.placed.length > best.placed.length) best = r;
    if (best.placed.length >= 8) break;
  }
  const { placed, b } = best;
  const rows = b.maxR - b.minR + 1, cols = b.maxC - b.minC + 1;
  placed.forEach(p => { p.r -= b.minR; p.c -= b.minC; p.cells = Array.from({ length: p.word.length }, (_, i) => (p.r + p.dir * i) + ',' + (p.c + (1 - p.dir) * i)); });
  const cellMap = new Map();
  placed.forEach((p, pi) => p.cells.forEach((k, i) => { const c = cellMap.get(k) || { ch: p.word[i], words: [] }; c.words.push(pi); cellMap.set(k, c); }));
  const nums = new Map(); let n = 0;
  [...placed].sort((a, c) => a.r - c.r || a.c - c.c).forEach(p => { const k = p.cells[0]; if (!nums.has(k)) nums.set(k, ++n); p.num = nums.get(k); });
  const val = new Map(), solved = new Set(), revealed = new Set(), xp0 = S.xp;
  let act = 0, dir = placed[0].dir, done = false;
  const avail = Math.min(app.clientWidth - 32, 728);
  const cs = Math.max(24, Math.min(40, Math.floor(avail / cols)));
  let gridHTML = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = r + ',' + c;
    gridHTML += cellMap.has(k) ? `<div class="cw-c">${nums.has(k) ? `<span class="cw-n">${nums.get(k)}</span>` : ''}<input data-k="${k}" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" aria-label="Harf"></div>` : '<div class="cw-x"></div>';
  }
  const clues = d => placed.map((p, pi) => [p, pi]).filter(([p]) => p.dir === d).sort((a, c) => a[0].num - c[0].num).map(([p, pi]) => `<li data-p="${pi}"><b>${p.num}</b><span>${esc(p.w.tr)} <small>(${p.word.length})</small></span></li>`).join('');
  mount(`<div class="game">${gameHeader('Bulmaca', `<span class="pill" id="cwCount">0 / ${placed.length}</span>`)}
    <div class="cw-clue" id="cwClue"></div>
    <div class="cw-wrap"><div class="cw" style="--cs:${cs}px;grid-template-columns:repeat(${cols},var(--cs))">${gridHTML}</div></div>
    <div class="row center wrap"><button class="btn ghost sm" id="cwHint">💡 Harf ver</button><button class="btn ghost sm" id="cwCheck">🔎 Kontrol et</button><button class="btn ghost sm" id="cwGive">🏳️ Çöz</button></div>
    <div class="cw-lists"><div><h4>→ Soldan sağa</h4><ol>${clues(0)}</ol></div><div><h4>↓ Yukarıdan aşağı</h4><ol>${clues(1)}</ol></div></div>
  </div>`);
  const inputs = new Map($$('.cw input').map(i => [i.dataset.k, i]));
  const wordsAt = k => cellMap.get(k).words;
  function setActive(pi, focus) {
    act = pi; dir = placed[pi].dir; const p = placed[pi];
    $$('.cw-c.hl').forEach(e => e.classList.remove('hl'));
    p.cells.forEach(k => inputs.get(k).parentNode.classList.add('hl'));
    $$('.cw-lists li.on').forEach(e => e.classList.remove('on'));
    const li = $(`.cw-lists li[data-p="${pi}"]`); if (li) li.classList.add('on');
    $('#cwClue').innerHTML = `<b>${p.num} ${p.dir ? '↓' : '→'}</b> ${esc(p.w.tr)} <small>(${p.word.length} harf)</small>${solved.has(pi) ? ' ✓' : ''}`;
    if (focus) { const k = p.cells.find(x => val.get(x) !== cellMap.get(x).ch) || p.cells[0]; inputs.get(k).focus(); }
  }
  const nextUnsolved = () => { for (let j = 1; j <= placed.length; j++) { const pi = (act + j) % placed.length; if (!solved.has(pi)) return pi; } return -1; };
  function checkWords(k) {
    let newly = false;
    for (const pi of wordsAt(k)) {
      if (solved.has(pi)) continue;
      const p = placed[pi];
      if (p.cells.every((x, i) => val.get(x) === p.word[i])) {
        solved.add(pi); newly = true;
        p.cells.forEach(x => { inputs.get(x).parentNode.classList.add('ok'); inputs.get(x).readOnly = true; });
        const li = $(`.cw-lists li[data-p="${pi}"]`); if (li) { li.classList.add('done'); li.querySelector('span').innerHTML = `${esc(p.w.tr)} → <b>${esc(p.w.en)}</b>`; }
        record(p.w, !revealed.has(pi), 15); beep(true); if (S.settings.speak) speak(p.w.en);
      }
    }
    $('#cwCount').textContent = `${solved.size} / ${placed.length}`;
    if (solved.size === placed.length && !done) { done = true; setTimeout(finish, 800); return; }
    if (newly && solved.has(act)) { const nx = nextUnsolved(); if (nx >= 0) setActive(nx, true); }
  }
  function move(k, step) { const p = placed[act]; const i = p.cells.indexOf(k); const j = i + step; if (i >= 0 && j >= 0 && j < p.cells.length) inputs.get(p.cells[j]).focus(); }
  const cw = $('.cw'); let wasFocused = false;
  cw.addEventListener('pointerdown', e => { const inp = e.target.closest('input'); wasFocused = !!inp && document.activeElement === inp; });
  cw.addEventListener('click', e => { const inp = e.target.closest('input'); if (!inp || !wasFocused) return; const ws = wordsAt(inp.dataset.k); if (ws.length > 1) setActive(ws.find(pi => pi !== act) ?? ws[0]); });
  cw.addEventListener('focusin', e => { const k = e.target.dataset && e.target.dataset.k; if (!k) return; const ws = wordsAt(k); if (!ws.includes(act)) setActive(ws.find(pi => placed[pi].dir === dir) ?? ws[0]); setTimeout(() => { try { e.target.select(); } catch (x) { /* yok */ } }, 0); });
  cw.addEventListener('input', e => {
    const inp = e.target, k = inp.dataset.k; if (!k) return;
    if (inp.readOnly) { inp.value = val.get(k) || ''; return; }
    // Hızlı yazımda ya da yapıştırmada kutuya birden çok harf gelebilir: harfler kelimenin sonraki kutularına dağıtılır.
    let chars = [...(inp.value || '').replace(/ı/g, 'i').replace(/İ/g, 'I').toUpperCase().replace(/[^A-Z]/g, '')];
    const prev = val.get(k);
    if (chars.length > 1 && prev && chars[0] === prev) chars = chars.slice(1);
    if (!chars.length) { inp.value = prev || ''; return; }
    const was = act, p = placed[act];
    let i = Math.max(0, p.cells.indexOf(k)), last = k;
    for (const ch of chars) {
      while (i < p.cells.length && inputs.get(p.cells[i]).readOnly && p.cells[i] !== k) i++;
      if (i >= p.cells.length) break;
      const ck = p.cells[i], ci = inputs.get(ck);
      val.set(ck, ch); ci.value = ch; ci.parentNode.classList.remove('bad'); last = ck; i++;
    }
    inp.value = val.get(k) || '';
    for (const ck of p.cells) if (val.get(ck)) checkWords(ck);
    if (act === was && !solved.has(act)) { const j0 = p.cells.indexOf(last); for (let j = j0 + 1; j < p.cells.length; j++) { if (!inputs.get(p.cells[j]).readOnly) { inputs.get(p.cells[j]).focus(); break; } } }
  });
  cw.addEventListener('keydown', e => {
    const inp = e.target, k = inp.dataset && inp.dataset.k; if (!k) return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (inp.readOnly) { move(k, -1); return; }
      if (val.get(k)) { val.delete(k); inp.value = ''; } else { const p = placed[act]; const i = p.cells.indexOf(k); if (i > 0) { const pk = p.cells[i - 1]; const pin = inputs.get(pk); pin.focus(); if (!pin.readOnly) { val.delete(pk); pin.value = ''; } } }
      return;
    }
    const arrows = { ArrowLeft: [0, -1, 0], ArrowRight: [0, 1, 0], ArrowUp: [-1, 0, 1], ArrowDown: [1, 0, 1] };
    if (arrows[e.key]) {
      e.preventDefault(); const [dr, dc, d] = arrows[e.key]; const [r, c] = k.split(',').map(Number);
      const nk = (r + dr) + ',' + (c + dc); const ws = wordsAt(k);
      const pref = ws.find(pi => placed[pi].dir === d); if (pref != null && pref !== act) setActive(pref);
      if (inputs.has(nk)) inputs.get(nk).focus();
      return;
    }
    if (e.key === 'Enter') { e.preventDefault(); const nx = nextUnsolved(); if (nx >= 0) setActive(nx, true); }
  });
  $('.cw-lists').addEventListener('click', e => { const li = e.target.closest('li[data-p]'); if (li) setActive(+li.dataset.p, true); });
  $('#cwHint').onclick = () => {
    if (solved.has(act)) { const nx = nextUnsolved(); if (nx < 0) return; setActive(nx); }
    const p = placed[act]; const cur = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.k : null;
    const k = (cur && p.cells.includes(cur) && val.get(cur) !== cellMap.get(cur).ch) ? cur : p.cells.find(x => val.get(x) !== cellMap.get(x).ch);
    if (!k) return;
    revealed.add(act); const inp = inputs.get(k); val.set(k, cellMap.get(k).ch); inp.value = cellMap.get(k).ch; inp.parentNode.classList.add('hint'); inp.parentNode.classList.remove('bad');
    checkWords(k); if (!solved.has(act)) inp.focus();
  };
  $('#cwCheck').onclick = () => {
    let bad = 0;
    for (const [k, inp] of inputs) { const v = val.get(k); if (v && v !== cellMap.get(k).ch) { inp.parentNode.classList.add('bad'); bad++; } }
    toast(bad ? `${bad} harf yanlış (kırmızı olanlar).` : 'Yanlış harf yok, devam! 👍');
  };
  $('#cwGive').onclick = () => { if (confirm('Bulmacanın cevapları gösterilsin mi?')) finish(true); };
  function finish(gaveUp) {
    if (gaveUp) {
      placed.forEach((p, pi) => { if (!solved.has(pi)) { revealed.add(pi); record(p.w, false); p.cells.forEach(k => { inputs.get(k).value = cellMap.get(k).ch; }); } });
    }
    const clean = placed.filter((p, pi) => solved.has(pi) && !revealed.has(pi)).length;
    showResult({ title: 'Bulmaca', line: `${placed.length} kelimeden ${clean} tanesini kendin çözdün`, ratio: clean / placed.length, xp: S.xp - xp0, missed: placed.filter((p, pi) => revealed.has(pi)).map(p => p.w), again: crossword });
  }
  setActive(0);
}

// ---------- kelime avı ----------
function wordSearch() {
  const N = 10, xp0 = S.xp;
  const pool = getPool(w => lettersOnly(w) && w.en.length >= 3 && w.en.length <= 9, 6);
  const DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  let best = null;
  for (let t = 0; t < 25; t++) {
    const grid = Array.from({ length: N }, () => Array(N).fill('')); const placed = [];
    for (const w of pickWords(pool, 18)) {
      if (placed.length >= 8) break;
      const word = w.en.toUpperCase();
      if (placed.some(p => p.word.includes(word) || word.includes(p.word))) continue;
      for (let a = 0; a < 100; a++) {
        const [dr, dc] = pick(DIRS), r0 = rand(N), c0 = rand(N);
        const r1 = r0 + dr * (word.length - 1), c1 = c0 + dc * (word.length - 1);
        if (r1 < 0 || r1 >= N || c1 >= N) continue;
        let fit = true;
        for (let i = 0; i < word.length; i++) { const ch = grid[r0 + dr * i][c0 + dc * i]; if (ch && ch !== word[i]) { fit = false; break; } }
        if (!fit) continue;
        for (let i = 0; i < word.length; i++) grid[r0 + dr * i][c0 + dc * i] = word[i];
        placed.push({ w, word, found: false }); break;
      }
    }
    if (!best || placed.length > best.placed.length) best = { grid, placed };
    if (best.placed.length >= 7) break;
  }
  const { grid, placed } = best;
  const FILL = 'EEEEAAAIIIOOOTTNNSSRRLLHDDUUCMPGBYWFKV';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!grid[r][c]) grid[r][c] = pick(FILL);
  mount(`<div class="game">${gameHeader('Kelime Avı', `<span class="pill" id="wsCount">0 / ${placed.length}</span>`)}
    <p class="muted center small">Türkçe ipuçlarının İngilizcesini tabloda bul. Parmağını harflerin üzerinde kaydır ya da ilk ve son harfe dokun.</p>
    <div class="ws-wrap"><div class="ws" id="ws" style="grid-template-columns:repeat(${N},1fr)">${grid.map((row, r) => row.map((ch, c) => `<div class="ws-c" data-r="${r}" data-c="${c}">${ch}</div>`).join('')).join('')}</div></div>
    <ul class="ws-list">${placed.map((p, i) => `<li data-i="${i}">${esc(p.w.tr)} <small>(${p.word.length})</small></li>`).join('')}</ul>
    <div class="row center"><button class="btn ghost sm" id="wsGive">🏳️ Pes et</button></div>
  </div>`);
  const wsEl = $('#ws'); const cellEl = (r, c) => wsEl.children[r * N + c];
  let start = null, anchor = null, sel = [], moved = false, color = 0, finished = false;
  const rc = el => [+el.dataset.r, +el.dataset.c];
  function line(a, b) {
    const [r1, c1] = rc(a), [r2, c2] = rc(b); const ar = Math.abs(r2 - r1), ac = Math.abs(c2 - c1);
    if (!(ar === 0 || ac === 0 || ar === ac)) return [a];
    const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1), n = Math.max(ar, ac);
    return Array.from({ length: n + 1 }, (_, i) => cellEl(r1 + dr * i, c1 + dc * i));
  }
  function show(list) { $$('.ws-c.sel', wsEl).forEach(e => e.classList.remove('sel')); list.forEach(e => e.classList.add('sel')); sel = list; }
  const cellFrom = e => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.closest ? el.closest('.ws-c') : null; };
  const clearAnchor = () => { if (anchor) anchor.classList.remove('anchor'); anchor = null; };
  function commit() {
    const s = sel.map(e => e.textContent).join(''); const rev = [...s].reverse().join('');
    const i = placed.findIndex(p => !p.found && (p.word === s || p.word === rev));
    if (i >= 0) {
      const p = placed[i]; p.found = true;
      sel.forEach(e => e.classList.add('f' + (color % 6))); color++;
      const li = $(`.ws-list li[data-i="${i}"]`); li.classList.add('done'); li.innerHTML = `${esc(p.w.tr)} → <b>${esc(p.w.en)}</b>`;
      record(p.w, true, 12); beep(true); if (S.settings.speak) speak(p.w.en);
      const f = placed.filter(x => x.found).length; $('#wsCount').textContent = `${f} / ${placed.length}`;
      if (f === placed.length) { finished = true; setTimeout(() => finish(), 800); }
    } else if (sel.length > 1) { wsEl.classList.add('shake'); setTimeout(() => wsEl.classList.remove('shake'), 350); }
    show([]);
  }
  wsEl.addEventListener('pointerdown', e => { if (finished) return; const c = e.target.closest('.ws-c'); if (!c) return; e.preventDefault(); start = c; moved = false; try { wsEl.setPointerCapture(e.pointerId); } catch (x) { /* yok */ } show(anchor ? line(anchor, c) : [c]); });
  wsEl.addEventListener('pointermove', e => { if (!start) return; const c = cellFrom(e); if (!c || !wsEl.contains(c)) return; if (c !== start) { moved = true; clearAnchor(); } if (moved) show(line(start, c)); });
  wsEl.addEventListener('pointerup', e => {
    if (!start) return; const c = cellFrom(e) || start;
    if (moved) { show(line(start, c)); commit(); }
    else if (anchor && anchor !== start) { show(line(anchor, start)); clearAnchor(); commit(); }
    else if (anchor === start) { clearAnchor(); show([]); }
    else { anchor = start; anchor.classList.add('anchor'); show([start]); }
    start = null;
  });
  wsEl.addEventListener('pointercancel', () => { start = null; show([]); });
  $('#wsGive').onclick = () => { if (confirm('Kalan kelimeler gösterilsin mi?')) finish(true); };
  function finish(gaveUp) {
    finished = true;
    const missed = placed.filter(p => !p.found).map(p => p.w);
    if (gaveUp) missed.forEach(w => record(w, false));
    const f = placed.length - missed.length;
    showResult({ title: 'Kelime Avı', line: `${placed.length} kelimeden ${f} tanesini buldun`, ratio: f / placed.length, xp: S.xp - xp0, missed, again: wordSearch });
  }
}

// ---------- eşleştir ----------
function matching() {
  const pool = getPool(() => true, 5), xp0 = S.xp;
  const words = pickDistinct(pool, 15);
  const rounds = []; for (let i = 0; i < words.length; i += 5) rounds.push(words.slice(i, i + 5));
  const W = new Map(words.map(w => [w.key, w]));
  let ri = 0, selL = null, selR = null, mistakes = 0, busy = false; const bad = new Set(), missed = [];
  mount(`<div class="game">${gameHeader('Eşleştir', '<span class="pill" id="mScore"></span>')}<p class="muted center small">Soldan İngilizce kelimeyi, sağdan Türkçe anlamını seç.</p><div id="mArea" class="match"></div></div>`);
  const area = $('#mArea');
  function draw() {
    const r = rounds[ri];
    area.innerHTML = `<div class="mcol">${shuffle(r).map(w => `<button class="mbtn" data-l="${esc(w.key)}">${esc(w.en)}</button>`).join('')}</div><div class="mcol">${shuffle(r).map(w => `<button class="mbtn tr" data-r="${esc(w.key)}">${esc(w.tr)}</button>`).join('')}</div>`;
    $('#mScore').textContent = `Tur ${ri + 1} / ${rounds.length}`; selL = selR = null;
  }
  const q = (attr, key) => area.querySelector(`[data-${attr}="${CSS.escape(key)}"]`);
  area.addEventListener('click', e => {
    const b = e.target.closest('.mbtn'); if (!b || b.disabled || busy) return;
    if (b.dataset.l) { $$('[data-l].sel', area).forEach(x => x.classList.remove('sel')); selL = b.dataset.l; b.classList.add('sel'); if (S.settings.speak) speak(W.get(selL).en); }
    else { $$('[data-r].sel', area).forEach(x => x.classList.remove('sel')); selR = b.dataset.r; b.classList.add('sel'); }
    if (!selL || !selR) return;
    const L = q('l', selL), R = q('r', selR);
    if (selL === selR) {
      [L, R].forEach(x => { x.classList.remove('sel'); x.classList.add('done'); x.disabled = true; });
      if (!bad.has(selL)) record(W.get(selL), true, 6);
      beep(true); selL = selR = null;
      if (rounds[ri].every(w => q('l', w.key).disabled)) { ri++; if (ri >= rounds.length) setTimeout(finish, 500); else setTimeout(draw, 500); }
    } else {
      mistakes++; beep(false); busy = true;
      if (!bad.has(selL)) { bad.add(selL); record(W.get(selL), false); missed.push(W.get(selL)); }
      [L, R].forEach(x => x.classList.add('wrong'));
      setTimeout(() => { [L, R].forEach(x => x.classList.remove('wrong', 'sel')); selL = selR = null; busy = false; }, 550);
    }
  });
  function finish() { showResult({ title: 'Eşleştir', line: `${words.length} çift · ${mistakes} hata`, ratio: Math.max(0, 1 - mistakes / words.length), xp: S.xp - xp0, missed, again: matching }); }
  draw();
}

// ---------- hafıza kartları ----------
function memory() {
  const pool = getPool(() => true, 4), xp0 = S.xp;
  const words = pickDistinct(pool, 6);
  const cards = shuffle(words.flatMap(w => [{ w, en: true }, { w, en: false }]));
  let open = [], matched = 0, moves = 0, lock = false;
  mount(`<div class="game">${gameHeader('Hafıza Kartları', '<span class="pill" id="memMoves">0 hamle</span>')}<p class="muted center small">Kartları çevir; İngilizce kelimeyi Türkçe anlamıyla eşle.</p><div class="mem" id="mem">${cards.map((c, i) => `<button class="mcard" data-i="${i}" aria-label="Kart"><span class="mcard__in"><span class="mcard__b">🍃</span><span class="mcard__f ${c.en ? 'en' : 'tr'}">${esc(c.en ? c.w.en : c.w.tr)}</span></span></button>`).join('')}</div></div>`);
  $('#mem').addEventListener('click', e => {
    const b = e.target.closest('.mcard'); if (!b || lock || b.classList.contains('open')) return;
    const i = +b.dataset.i; b.classList.add('open'); open.push(i);
    if (cards[i].en && S.settings.speak) speak(cards[i].w.en);
    if (open.length < 2) return;
    moves++; $('#memMoves').textContent = `${moves} hamle`;
    const [a, c] = open; const A = cards[a], C = cards[c];
    if (A.w.key === C.w.key) {
      open.forEach(j => $(`.mcard[data-i="${j}"]`).classList.add('done'));
      open = []; matched++; record(A.w, true, 6); beep(true);
      if (matched === words.length) setTimeout(finish, 700);
    } else {
      lock = true;
      setTimeout(() => { open.forEach(j => $(`.mcard[data-i="${j}"]`).classList.remove('open')); open = []; lock = false; }, 1000);
    }
  });
  function finish() { const best = setBest('memory', moves, true); showResult({ title: 'Hafıza Kartları', line: `${words.length} çifti ${moves} hamlede buldun`, ratio: Math.min(1, (words.length + 2) / moves), xp: S.xp - xp0, missed: [], best, bestLabel: 'hamle', again: memory }); }
}

// ---------- yaprak bitmeden (harf tahmini) ----------
function hangman() {
  const pool = getPool(w => lettersOnly(w) && w.en.length >= 3 && w.en.length <= 10, 5), xp0 = S.xp;
  const words = pickWords(pool, 5), MAX = 6, ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  let wi = 0, guessed = new Set(), wrong = 0, over = false, won = false, score = 0; const missed = [];
  mount(`<div class="game">${gameHeader('Yaprak Bitmeden', '<span class="pill" id="hCount"></span>')}<div id="hArea"></div></div>`);
  const area = $('#hArea');
  function draw() {
    const w = words[wi], word = w.en.toUpperCase();
    $('#hCount').textContent = `Kelime ${wi + 1} / ${words.length}`;
    area.innerHTML = `<section class="qcard"><div class="q-lbl">Türkçesi</div><div class="q-word tr">${esc(w.tr)}</div>
      <div class="h-leaves" aria-label="Kalan yaprak">${Array.from({ length: MAX }, (_, i) => `<span class="${i < MAX - wrong ? '' : 'gone'}">${i < MAX - wrong ? '🍃' : '🍂'}</span>`).join('')}</div>
      <div class="h-word">${[...word].map(ch => { const shown = guessed.has(ch) || over; return `<span class="${shown ? 'on' : ''} ${over && !guessed.has(ch) ? 'miss' : ''}">${shown ? ch : ''}</span>`; }).join('')}</div></section>
      ${over ? `<div class="fb show static ${won ? 'ok' : 'no'}"><div class="fb__in"><div class="fb__txt"><div class="fb__t">${won ? esc(pick(PRAISE)) : 'Yapraklar bitti!'}</div><div class="fb__w"><b>${esc(w.en)}</b>${sayBtn(w.en)}<span>= ${esc(w.tr)}</span></div></div><button class="btn ${won ? 'primary' : 'danger'}" id="hNext">${wi + 1 >= words.length ? 'Sonuç' : 'Sonraki'} ➜</button></div></div>`
        : `<div class="kbd">${ROWS.map(r => `<div>${[...r].map(ch => `<button data-k="${ch}" class="${guessed.has(ch) ? (word.includes(ch) ? 'hit' : 'nohit') : ''}" ${guessed.has(ch) ? 'disabled' : ''}>${ch}</button>`).join('')}</div>`).join('')}</div>`}`;
    const nb = $('#hNext'); if (nb) { nb.onclick = next; nb.focus(); }
  }
  function guess(ch) {
    if (over || guessed.has(ch)) return;
    const w = words[wi], word = w.en.toUpperCase(); guessed.add(ch);
    if (!word.includes(ch)) { wrong++; beep(false); if (wrong >= MAX) { over = true; won = false; record(w, false); missed.push(w); if (S.settings.speak) speak(w.en); } }
    else { beep(true); if ([...word].every(c => guessed.has(c))) { over = true; won = true; score++; record(w, true, 15); if (S.settings.speak) speak(w.en); } }
    draw();
  }
  function next() { wi++; if (wi >= words.length) { finish(); return; } guessed = new Set(); wrong = 0; over = false; won = false; draw(); }
  area.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) guess(b.dataset.k); });
  onKey(e => { if (typingIn(e)) return; if (over && e.key === 'Enter') { e.preventDefault(); next(); return; } const k = e.key.replace(/ı/g, 'i').toUpperCase(); if (/^[A-Z]$/.test(k)) guess(k); });
  function finish() { showResult({ title: 'Yaprak Bitmeden', line: `${words.length} kelimeden ${score} tanesini buldun`, ratio: score / words.length, xp: S.xp - xp0, missed, again: hangman }); }
  draw();
}

// ---------- hızlı tırtıl ----------
function speedGame() {
  const pool = getPool(() => true, 6), xp0 = S.xp;
  let time = 60, score = 0, wrongs = 0, cur = null, iv = null, last = null, started = false; const missed = [];
  mount(`<div class="game">${gameHeader('Hızlı Tırtıl', '<span class="pill" id="spScore">✓ 0</span>')}<div class="sp-time"><div class="bar"><i id="spBar" style="width:100%"></i></div><b id="spT">60</b></div><div id="spArea"></div></div>`);
  const area = $('#spArea');
  area.innerHTML = `<section class="qcard"><div class="q-word">⚡</div><p>60 saniyen var. Gösterilen İngilizce kelime ile Türkçe anlam eşleşiyor mu?</p><p class="muted small">Klavyede ← yanlış, → doğru</p><button class="btn primary big" id="spGo">Başla</button></section>`;
  $('#spGo').onclick = startGame;
  onCleanup(() => clearInterval(iv));
  function startGame() {
    started = true;
    iv = setInterval(() => { if (modalOpen()) return; time--; $('#spT').textContent = time; $('#spBar').style.width = (time / 60 * 100) + '%'; if (time <= 10) $('#spT').classList.add('low'); if (time <= 0) end(); }, 1000);
    next();
  }
  function next() {
    const c = pool.filter(x => x !== last); const w = pickWords(c.length ? c : pool, 1)[0]; last = w;
    let truth = Math.random() < 0.5, shown = w.tr;
    if (!truth) { const d = distractors(w, 1, 'tr')[0]; if (d) shown = d.tr; else truth = true; }
    cur = { w, truth };
    area.innerHTML = `<section class="qcard sp-card" id="spCard"><div class="q-word">${esc(w.en)}</div><div class="sp-eq">=</div><div class="q-word tr">${esc(shown)}</div><p class="q-sub">Doğru mu?</p></section><div class="sp-btns"><button class="btn danger big" data-a="0">✗ Yanlış</button><button class="btn primary big" data-a="1">✓ Doğru</button></div>`;
  }
  function answer(a) {
    if (!started || !cur || time <= 0) return;
    const ok = (a === 1) === cur.truth;
    record(cur.w, ok, 4); beep(ok);
    if (ok) score++; else { wrongs++; missed.push(cur.w); }
    $('#spScore').textContent = '✓ ' + score;
    const card = $('#spCard'); if (card) card.classList.add(ok ? 'flash-ok' : 'flash-no');
    setTimeout(next, ok ? 150 : 450); cur = null;
  }
  area.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) answer(+b.dataset.a); });
  onKey(e => { if (e.key === 'ArrowLeft') { e.preventDefault(); answer(0); } if (e.key === 'ArrowRight') { e.preventDefault(); answer(1); } });
  function end() {
    clearInterval(iv); time = 0;
    const best = setBest('speed', score);
    showResult({ title: 'Hızlı Tırtıl', line: `${score} doğru · ${wrongs} yanlış`, ratio: (score / Math.max(1, score + wrongs)) * Math.min(1, score / 12), xp: S.xp - xp0, missed, best, bestLabel: 'doğru', again: speedGame });
  }
}

// ---------- tırtıl yolu ----------
function snakeGame() {
  const pool = getPool(w => lettersOnly(w) && w.en.length >= 3 && w.en.length <= 8, 4), xp0 = S.xp, N = 12;
  mount(`<div class="game">${gameHeader('Tırtıl Yolu', '<span class="pill" id="snLives"></span>')}
    <div class="sn-info"><div class="sn-target" id="snTarget"></div><div class="sn-prog" id="snProg"></div></div>
    <div class="sn-box" id="snBox"><canvas id="cv"></canvas><div class="sn-msg" id="snMsg"></div><div class="sn-over" id="snOver"></div></div>
    <div class="dpad"><button data-d="0,-1" aria-label="Yukarı">▲</button><button data-d="-1,0" aria-label="Sol">◀</button><button data-d="1,0" aria-label="Sağ">▶</button><button data-d="0,1" aria-label="Aşağı">▼</button></div>
    <p class="muted small center">Ok tuşları, ekranda kaydırma ya da düğmelerle yönet. Boşluk tuşu duraklatır.</p>
  </div>`);
  const cv = $('#cv'), ctx = cv.getContext('2d'), box = $('#snBox');
  let cell = 20, snake, dir, nextDir, letters = [], w, prog = 0, lives = 3, done = 0, speed = 270, iv = null, running = false, failed = false, flash = 0, msgT = null, ended = false;
  const recent = [], missed = [];
  function resize() { const s = Math.min(box.clientWidth, 440); const dpr = window.devicePixelRatio || 1; cv.style.width = cv.style.height = s + 'px'; cv.width = cv.height = Math.round(s * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cell = s / N; draw(); }
  function resetSnake() { snake = [{ x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }]; dir = { x: 1, y: 0 }; nextDir = dir; }
  const occupied = (x, y) => snake.some(s => s.x === x && s.y === y) || letters.some(l => l.x === x && l.y === y);
  function freeCell() {
    const h = snake[0];
    for (let a = 0; a < 400; a++) { const x = rand(N), y = rand(N); if (occupied(x, y) || Math.abs(x - h.x) + Math.abs(y - h.y) < 3 || (y === h.y && (x - h.x) * dir.x > 0) || (x === h.x && (y - h.y) * dir.y > 0)) continue; return { x, y }; }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!occupied(x, y)) return { x, y };
    return { x: 0, y: 0 };
  }
  function newWord() {
    const c = pool.filter(x => !recent.includes(x.key)); w = pickWords(c.length ? c : pool, 1)[0];
    recent.push(w.key); if (recent.length > 12) recent.shift();
    prog = 0; failed = false; letters = [];
    const word = w.en.toLowerCase();
    for (const ch of word) letters.push({ ...freeCell(), ch });
    const abc = 'abcdefghijklmnoprstuvwyz'.split('').filter(ch => !word.includes(ch));
    for (let i = 0, dec = Math.min(1 + Math.floor(done / 2), 4); i < dec; i++) letters.push({ ...freeCell(), ch: pick(abc) });
    info();
  }
  function info() {
    $('#snTarget').innerHTML = `<span class="muted small">Tırtılın aradığı kelime</span><b>${esc(w.tr)}</b>`;
    $('#snProg').innerHTML = [...w.en.toLowerCase()].map((ch, i) => `<span class="${i < prog ? 'on' : ''}">${i < prog ? esc(ch.toUpperCase()) : ''}</span>`).join('');
    $('#snLives').textContent = '🍃'.repeat(Math.max(0, lives)) + '  ✓ ' + done;
  }
  function msg(text) { const m = $('#snMsg'); if (!m) return; m.textContent = text; m.classList.add('show'); clearTimeout(msgT); msgT = setTimeout(() => m.classList.remove('show'), 1300); }
  function overlay(html) { const o = $('#snOver'); if (!html) { o.hidden = true; o.innerHTML = ''; return; } o.hidden = false; o.innerHTML = html; }
  function setRun(on) { clearInterval(iv); running = on; if (on) { overlay(''); iv = setInterval(step, speed); } }
  function lose() {
    lives--; beep(false); flash = 6;
    if (!failed) { failed = true; record(w, false); missed.push(w); }
    info();
    if (lives <= 0) { setRun(false); draw(); ended = true; setTimeout(end, 900); return true; }
    return false;
  }
  function step() {
    if (modalOpen()) return;
    dir = nextDir;
    const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || snake.slice(0, -1).some(s => s.x === h.x && s.y === h.y)) {
      if (lose()) return;
      setRun(false); resetSnake();
      letters.forEach(l => { if (snake.some(s => s.x === l.x && s.y === l.y)) Object.assign(l, freeCell()); });
      draw(); overlay('<div><b>Ah, çarptın! 🍂</b><p>Devam etmek için dokun ya da bir yön tuşuna bas.</p></div>');
      return;
    }
    snake.unshift(h);
    let grow = false;
    const li = letters.findIndex(l => l.x === h.x && l.y === h.y);
    if (li >= 0) {
      const L = letters[li], word = w.en.toLowerCase();
      if (L.ch === word[prog]) {
        letters.splice(li, 1); prog++; grow = true; beep(true); info();
        if (prog >= word.length) {
          if (!failed) record(w, true, 20);
          done++; speak(w.en); msg(`✓ ${w.en.toUpperCase()} = ${w.tr}`);
          speed = Math.max(140, speed - 12); if (snake.length > 14) snake.length = 14;
          newWord(); setRun(true);
        }
      } else {
        letters.splice(li, 1); letters.push({ ...freeCell(), ch: L.ch }); msg(`Yanlış harf: ${L.ch.toUpperCase()}`);
        if (lose()) return;
      }
    }
    if (!grow) snake.pop();
    draw();
  }
  function draw() {
    if (!snake) return;
    const s = cell * N; ctx.clearRect(0, 0, s, s);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { ctx.fillStyle = (x + y) % 2 ? '#e4f2d5' : '#d6ebc2'; ctx.fillRect(x * cell, y * cell, cell, cell); }
    if (flash > 0) { ctx.fillStyle = `rgba(232,80,95,${flash * 0.05})`; ctx.fillRect(0, 0, s, s); flash--; }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `700 ${Math.round(cell * 0.56)}px Fredoka, Nunito, sans-serif`;
    for (const l of letters) {
      const cx = l.x * cell + cell / 2, cy = l.y * cell + cell / 2;
      ctx.fillStyle = '#fff8e1'; ctx.beginPath(); ctx.arc(cx, cy, cell * 0.44, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f0b13c'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#5a3d00'; ctx.fillText(l.ch.toUpperCase(), cx, cy + 1);
    }
    for (let i = snake.length - 1; i >= 0; i--) {
      const p = snake[i], cx = p.x * cell + cell / 2, cy = p.y * cell + cell / 2;
      ctx.fillStyle = i === 0 ? '#9ad96b' : (i % 2 ? '#7cc451' : '#5aa83a');
      ctx.beginPath(); ctx.arc(cx, cy, i === 0 ? cell * 0.5 : cell * 0.42, 0, Math.PI * 2); ctx.fill();
      if (i === 0) {
        const ex = dir.x, ey = dir.y, px = -ey, py = ex;
        for (const sg of [-1, 1]) {
          const ox = cx + ex * cell * 0.16 + px * sg * cell * 0.2, oy = cy + ey * cell * 0.16 + py * sg * cell * 0.2;
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ox, oy, cell * 0.12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#263521'; ctx.beginPath(); ctx.arc(ox + ex * cell * 0.04, oy + ey * cell * 0.04, cell * 0.065, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  }
  function turn(dx, dy) {
    if (ended || lives <= 0) return;
    if (dir.x === -dx && dir.y === -dy) { if (!running) setRun(true); return; }
    nextDir = { x: dx, y: dy };
    if (!running) setRun(true);
  }
  const KEYS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
  onKey(e => {
    const k = KEYS[e.key] || KEYS[e.key.toLowerCase()];
    if (k) { e.preventDefault(); turn(k[0], k[1]); return; }
    if (e.key === ' ') { e.preventDefault(); if (ended) return; if (running) { setRun(false); overlay('<div><b>Duraklatıldı</b><p>Devam etmek için dokun.</p></div>'); } else setRun(true); }
  });
  $$('.dpad button').forEach(b => { b.addEventListener('pointerdown', e => { e.preventDefault(); const [dx, dy] = b.dataset.d.split(',').map(Number); turn(dx, dy); }); });
  let tx = 0, ty = 0;
  box.addEventListener('touchstart', e => { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; }, { passive: true });
  box.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  box.addEventListener('touchend', e => { const t = e.changedTouches[0]; const dx = t.clientX - tx, dy = t.clientY - ty; if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) { if (!running && !ended) setRun(true); return; } if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0); else turn(0, Math.sign(dy)); });
  $('#snOver').addEventListener('click', e => { if (e.target.closest('#snGo') || (!running && !ended && !e.target.closest('button'))) setRun(true); });
  const onVis = () => { if (document.hidden && running) { setRun(false); overlay('<div><b>Duraklatıldı</b><p>Devam etmek için dokun.</p></div>'); } };
  document.addEventListener('visibilitychange', onVis); window.addEventListener('resize', resize);
  onCleanup(() => { clearInterval(iv); clearTimeout(msgT); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('resize', resize); });
  function end() { showResult({ title: 'Tırtıl Yolu', line: `${done} kelime tamamladın`, ratio: Math.min(1, done / 5), xp: S.xp - xp0, missed, best: setBest('snake', done), bestLabel: 'kelime', again: snakeGame }); }
  resetSnake(); newWord(); resize();
  overlay('<div><b>Hazır mısın? 🐛</b><p>Türkçesi yazan kelimenin İngilizce harflerini <b>sırayla</b> ye. Yanlış harf ya da duvara çarpmak bir yaprak götürür.</p><button class="btn primary" id="snGo">Başla</button></div>');
}

// ---------- başlat ----------
restoreSession();
route();
