/* Ginekologia & Położnictwo V – hub. Vanilla JS, jeden plik, router hash. */
(function () {
'use strict';
const {
  GROUPS, MODS, ATLASES, TRAPS, CONF, BANKS, WIKILINKS, SEMANTIC_GAPS,
  OSCE_STATIONS, SYMPTOM_CLUSTERS, PREGNANCY_CALENDAR = [], PREGNANCY_VACCINES = [],
  modById, atById
} = window.HUB_META;
const CUSTOM_Q_KEY = 'ginpol_hub_custom_questions_v1';
let CUSTOM_Q = [];
try {
  const cqRaw = localStorage.getItem(CUSTOM_Q_KEY);
  if (cqRaw) CUSTOM_Q = JSON.parse(cqRaw);
} catch (e) { /* ignoruj */ }

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const main = $('#view');

const {
  esc, escB, norm, pct, b64EncodeUtf8, b64DecodeUtf8,
  calcNaegele, calcBishop, calcApgar, calcOgttPregnancy, calcRmi,
  parseQuestionsInput: _parseQ, diagnoseQuestionsInput, parseBackupCode, parseMarkdown, scoreExam
} = window.HUB_LOGIC;
const parseQuestionsInput = (input, defaultBank = 'zaklad', defaultMod = '1') => _parseQ(input, defaultBank, defaultMod, { modById, banks: BANKS });

let lastStorageWarnAt = 0;
function safeStorageSet(key, val) {
  try {
    localStorage.setItem(key, val);
    return true;
  } catch (e) {
    const now = Date.now();
    if (now - lastStorageWarnAt > 6000) {
      lastStorageWarnAt = now;
      toast('Brak miejsca w pamięci przeglądarki – wyeksportuj kopię zapasową.');
    }
    return false;
  }
}

/* ---------- helpers ---------- */
const L = 'ABCDEFGH';
function rich(h) {
  const s = String(h || '');
  if (!/[<>&]/.test(s)) return s;
  const t = document.createElement('template'); t.innerHTML = s;
  const ok = { B: 1, STRONG: 1, I: 1, EM: 1, BR: 1, P: 1, UL: 1, OL: 1, LI: 1, A: 1, SUB: 1, SUP: 1 };
  (function walk(n) {
    [...n.childNodes].forEach(c => {
      if (c.nodeType !== 1) return;
      if (!ok[c.tagName]) { c.replaceWith(document.createTextNode(c.textContent)); return; }
      [...c.attributes].forEach(a => { if (!(c.tagName === 'A' && a.name === 'href' && /^https?:/i.test(a.value))) c.removeAttribute(a.name); });
      if (c.tagName === 'A') { c.target = '_blank'; c.rel = 'noopener noreferrer'; }
      walk(c);
    });
  })(t.content);
  return t.innerHTML;
}
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
let toastT;
function toast(msg, opts = {}) {
  const t = $('#toast');
  if (typeof msg === 'string' && !opts.html) {
    t.textContent = msg;
  } else {
    t.innerHTML = msg;
  }
  t.classList.add('on');
  clearTimeout(toastT);
  const dur = opts.duration || 2200;
  if (dur > 0) toastT = setTimeout(() => t.classList.remove('on'), dur);
}
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- krótkie nazwy ---------- */
const SHORT = {
  '1': 'Krwotok PPH', '2': 'Rzucawka / PE', '3': 'Ektopowa / brzuch',
  '4': 'Fizjologia ciąży', '5': 'Poród i KTG', '6': 'GDM i cholestaza',
  '7': 'Poród przedwcz.', '8': 'PCOS i AUB', '9': 'Endometrioza / PID',
  '10': 'Antykonc. / MHT', '11': 'Szyjka / HPV', '12': 'Endometrium / jajnik'
};
const ASHORT = {
  'nagle-ob': 'Stany nagłe OB/GYN',
  'fizjologia': 'Fizjologia ciąży i KTG',
  'patologia': 'Patologia ciąży',
  'endo-gin': 'Ginekologia i rozród',
  'onko-gin': 'Onkologia ginekologiczna'
};
const GA = {
  'nagle-ob': ['var(--red)', 'var(--teal)'],
  'fizjologia': ['var(--amber)', 'var(--teal)'],
  'patologia': ['var(--amber)', 'var(--blue)'],
  'endo-gin': ['var(--blue)', 'var(--teal)'],
  'onko-gin': ['var(--violet)', 'var(--teal)']
};
const gOf = id => (modById[id] && GROUPS[modById[id].g]) ? GROUPS[modById[id].g] : GROUPS.A;

/* ---------- magazyn postępu ---------- */
const KEY = 'ginpol-hub.v1:';
const STORAGE_KEY = 'ginpol_hub_state_v1';
const defaultState = () => ({ visited: {}, last: null, done: {}, ans: {}, bm: {}, examHistory: [], patientCases: {}, osceCases: {} });
let S = defaultState();

try {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    Object.assign(S, JSON.parse(local));
  } else if (window.name.indexOf(KEY) === 0) {
    Object.assign(S, JSON.parse(window.name.slice(KEY.length)));
  }
} catch (e) {
  try { if (window.name.indexOf(KEY) === 0) Object.assign(S, JSON.parse(window.name.slice(KEY.length))); } catch (_) {}
}
S.examHistory = Array.isArray(S.examHistory) ? S.examHistory : [];
S.patientCases = (S.patientCases && typeof S.patientCases === 'object') ? S.patientCases : {};
S.osceCases = (S.osceCases && typeof S.osceCases === 'object') ? S.osceCases : {};

const save = () => {
  const serialized = JSON.stringify(S);
  safeStorageSet(STORAGE_KEY, serialized);
  try { window.name = KEY + serialized; } catch (e) { /* ignoruj */ }
};

function recordQAns(id, ok) {
  const a = S.ans[id] || { n: 0, c: 0 };
  a.n++; if (ok) a.c++; a.last = ok; a.ts = Date.now();
  S.ans[id] = a;
  save();
}

window.addEventListener('message', ev => {
  if (ev.data && ev.data.type === 'ginpol-atlas-ans' && ev.data.id) {
    recordQAns(ev.data.id, !!ev.data.ok);
  }
});

window.addEventListener('storage', ev => {
  if (ev.key !== STORAGE_KEY || !ev.newValue) return;
  try {
    const incoming = JSON.parse(ev.newValue);
    if (incoming && incoming.ans && typeof incoming.ans === 'object') {
      Object.assign(S.ans, incoming.ans);
    }
  } catch (e) {}
});

/* ---------- obsługa motywu (Dark Mode + 6 palet) ---------- */
const THEME_KEY = 'ginpol_hub_theme';
const THEME_PALETTES = [
  { id: 'navy', icon: '🌌', short: 'Navy', name: 'Deep Navy & Slate', desc: 'Głęboki granat i chłodny łupek', bg: '#111522', surface: '#1E263B', ink: '#DCE3EF', ink2: '#A8B8D0', accent: '#98A9C4', colors: ['#111522', '#1E263B', '#303D59', '#536684', '#98A9C4', '#DCE3EF'] },
  { id: 'moss', icon: '🌲', short: 'Moss', name: 'Forest Moss & Sage', desc: 'Głęboki, naturalny i kojący', bg: '#0F1A15', surface: '#1C2F27', ink: '#E6EBE6', ink2: '#A6C3AC', accent: '#84A98C', colors: ['#0F1A15', '#1C2F27', '#2E4C3E', '#4E6E5D', '#84A98C', '#E6EBE6'] },
  { id: 'espresso', icon: '☕', short: 'Espresso', name: 'Earthy Espresso & Sand', desc: 'Ciepłe espresso i piasek', bg: '#211B1A', surface: '#382A28', ink: '#E8D8CE', ink2: '#C9ABA0', accent: '#C1A094', colors: ['#211B1A', '#382A28', '#60433D', '#916B60', '#C1A094', '#E8D8CE'] },
  { id: 'ochre', icon: '🏜️', short: 'Ochre', name: 'Burnt Ochre & Charcoal', desc: 'Ciepły, industrialny i rustykalny', bg: '#1A1715', surface: '#2E2520', ink: '#F7F0EA', ink2: '#DFC2A6', accent: '#D19A66', colors: ['#1A1715', '#2E2520', '#553E31', '#8C5D3A', '#D19A66', '#F7F0EA'] },
  { id: 'purple', icon: '🔮', short: 'Lavender', name: 'Shadow Purple & Lavender', desc: 'Głęboki fiolet i lawenda', bg: '#17151C', surface: '#292531', ink: '#E2DDE7', ink2: '#BFB7C9', accent: '#AAA2B3', colors: ['#17151C', '#292531', '#45404F', '#716879', '#AAA2B3', '#E2DDE7'] },
  { id: 'ocean', icon: '🌊', short: 'Ocean', name: 'Ocean Teal & Coral', desc: 'Chłodne tony oceaniczne z akcentem koralowym', bg: '#0A1924', surface: '#152E3C', ink: '#E8F2F6', ink2: '#9CC0CC', accent: '#FF9E80', colors: ['#0A1924', '#152E3C', '#294A5A', '#4C7282', '#94B9C5', '#FF9E80'] }
];
const THEME_BY_ID = Object.fromEntries(THEME_PALETTES.map(p => [p.id, p]));
const THEME_ORDER = ['auto', 'light', 'dark', ...THEME_PALETTES.map(p => p.id)];
let currentTheme = 'auto';
try { currentTheme = localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) {}

function getEffectiveTheme() {
  if (currentTheme === 'dark' || THEME_BY_ID[currentTheme]) return currentTheme;
  if (currentTheme === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(t, persist = true) {
  currentTheme = THEME_ORDER.includes(t) ? t : 'auto';
  if (persist) safeStorageSet(THEME_KEY, currentTheme);
  const eff = getEffectiveTheme();
  if (eff !== 'light') {
    document.documentElement.dataset.theme = eff;
  } else {
    delete document.documentElement.dataset.theme;
  }
  const tc = $('meta[name="theme-color"]');
  if (tc) {
    const p = THEME_BY_ID[eff];
    tc.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || (p ? p.bg : eff === 'dark' ? '#090C0E' : '#F5F6F2');
  }
  updateThemeUI();
  syncIframeTheme(eff === 'light' ? 'light' : 'dark');
}

function updateThemeUI() {
  const icon = $('#themeIcon'), label = $('#themeLabel'), btn = $('#btnTheme');
  const svgSun = '<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  const svgMoon = '<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const svgAuto = '<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" fill-opacity="0.22"/></svg>';
  if (icon && label) {
    const p = THEME_BY_ID[currentTheme];
    if (p) {
      icon.innerHTML = `<span class="dot" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${p.accent};border:1px solid var(--line)"></span>`;
      label.textContent = p.short;
      if (btn) btn.title = `Motyw: ${p.name} (kliknij, aby przełączyć)`;
    } else if (currentTheme === 'dark') {
      icon.innerHTML = svgMoon; label.textContent = 'Ciemny';
      if (btn) btn.title = 'Motyw: Ciemny (kliknij, aby przełączyć)';
    } else if (currentTheme === 'light') {
      icon.innerHTML = svgSun; label.textContent = 'Jasny';
      if (btn) btn.title = 'Motyw: Jasny (kliknij, aby przełączyć)';
    } else {
      icon.innerHTML = svgAuto; label.textContent = 'Auto';
      if (btn) btn.title = 'Motyw: Systemowy (kliknij, aby przełączyć)';
    }
  }
  $$('[data-theme-choice]').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.themeChoice === currentTheme);
  });
}

function cycleTheme() {
  const idx = THEME_ORDER.indexOf(currentTheme);
  const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
  applyTheme(next);
  const p = THEME_BY_ID[next];
  const name = p ? p.name : (next === 'auto' ? 'Systemowy (Auto)' : next === 'dark' ? 'Ciemny' : 'Jasny');
  toast(`Zmieniono motyw: ${name}`);
}

function syncIframeTheme(eff) {
  const rf = $('#rf');
  if (rf && rf.contentDocument && rf.contentDocument.documentElement) {
    rf.contentDocument.documentElement.classList.add('hub-embedded');
    if (eff === 'dark') rf.contentDocument.documentElement.dataset.theme = 'dark';
    else delete rf.contentDocument.documentElement.dataset.theme;
  }
  if (rf && rf.contentWindow) {
    try { rf.contentWindow.postMessage({ type: 'SET_THEME', theme: eff }, '*'); } catch (e) {}
  }
}

try {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'auto') applyTheme('auto', false);
  });
} catch (e) {}

/* ---------- obsługa banków i pytań ---------- */
function getBank(q) {
  if (q.bank && BANKS[q.bank]) return q.bank;
  if (q.isCustom) return 'custom';
  if (q.id && !q.id.startsWith('gp')) return 'modulowa';
  const s = String(q.src || '').toUpperCase();
  if (s.includes('LEK')) return 'lek';
  if (s.includes('PES')) return 'pes';
  if (s.includes('PTGIP') || s.includes('FIGO')) return 'ptgip';
  return 'zaklad';
}

function getQNorm(q) {
  if (!q._n) {
    q._n = norm([q.id || '', q.src || '', q.stem, (q.opts || []).join(' '), q.topic || '', (q.mods || []).join(' '), ASHORT[q.at] || '', BANKS[q.bank] ? BANKS[q.bank].n : ''].join(' '));
  }
  return q._n;
}

function prepQuestion(q, isCustom = false) {
  q.isCustom = !!isCustom;
  q.bank = q.bank || getBank(q);
  q.pm = q.mods.find(m => modById[m] && modById[m].at === q.at) || q.mods[0] || '1';
  return q;
}

function loadAllQuestions() {
  const map = new Map();
  // 1. Wczytaj bazę modułową HUB_MODULOWA_Q lub HUB_Q (413 pytań)
  const modQ = window.HUB_MODULOWA_Q || window.HUB_Q || [];
  modQ.forEach(q => map.set(q.id, prepQuestion(q, false)));
  // 2. Jeśli załadowano dedykowany plik HUB_ZAKLAD_Q, nadpisz/wzbogać pełną pulą zakładową (2256 pytań)
  (window.HUB_ZAKLAD_Q || []).forEach(q => map.set(q.id, prepQuestion(q, false)));
  // 3. Własne pytania użytkownika
  CUSTOM_Q.forEach(q => map.set(q.id, prepQuestion(q, true)));
  const all = Array.from(map.values());
  window.HUB_Q = all; // kompatybilność wsteczna z atlasami i modułami
  return all;
}

let Q = loadAllQuestions();
let qById = Object.fromEntries(Q.map(q => [q.id, q]));
let ALL = null;
let _qStats = null;
let onBmMutate = null;

function getQStats() {
  if (_qStats) return _qStats;
  const banks = {};
  const modsHit = new Set();
  const confHit = new Set();
  let gap = 0;
  for (let i = 0; i < Q.length; i++) {
    const q = Q[i];
    banks[q.bank] = (banks[q.bank] || 0) + 1;
    if (q.gap) gap++;
    if (q.conf) confHit.add(q.conf);
    const ms = q.mods || [];
    for (let j = 0; j < ms.length; j++) modsHit.add(ms[j]);
  }
  _qStats = { banks, modsHit, confHit, gap };
  return _qStats;
}

function saveCustomQ() {
  safeStorageSet(CUSTOM_Q_KEY, JSON.stringify(CUSTOM_Q));
  Q = loadAllQuestions();
  qById = Object.fromEntries(Q.map(q => [q.id, q]));
  _qStats = null;
  ALL = null;
}

// Reclaim legacy zaklad IndexedDB cache left over from pre-v21 builds.
if (typeof indexedDB !== 'undefined') {
  /* standalone localStorage */
}

/* ---------- dane pochodne ---------- */
const IDX = Object.fromEntries(MODS.map((m, i) => [m.id, i]));
const covered = MODS.filter(m => m.at);
const baseNums = [...new Set(MODS.map(m => parseInt(m.id, 10)))];
const coveredBase = [...new Set(covered.map(m => parseInt(m.id, 10)))];
const gapCount = getQStats().gap;

const E = {};
function edgeOf(a, b) {
  if (a === b) return null;
  const [x, y] = IDX[a] < IDX[b] ? [a, b] : [b, a];
  return E[x + '|' + y] || (E[x + '|' + y] = { a: x, b: y, w: 0, traps: [] });
}
Q.forEach(q => {
  const u = [...new Set(q.mods.filter(m => modById[m]))];
  for (let i = 0; i < u.length; i++) for (let j = i + 1; j < u.length; j++) edgeOf(u[i], u[j]).w++;
});
TRAPS.forEach(t => {
  for (let i = 0; i < t.mods.length; i++) for (let j = i + 1; j < t.mods.length; j++) { const e = edgeOf(t.mods[i], t.mods[j]); if (e) e.traps.push(t); }
});
const EDGES = Object.values(E);
const edgeKey = (a, b) => (IDX[a] < IDX[b] ? a + '|' + b : b + '|' + a);

const BACKLINKS = {};
MODS.forEach(m => { BACKLINKS[m.id] = []; });
if (WIKILINKS) {
  Object.entries(WIKILINKS).forEach(([srcId, links]) => {
    links.forEach(l => {
      if (BACKLINKS[l.target]) {
        BACKLINKS[l.target].push({
          source: srcId,
          label: l.label,
          type: l.type,
          concept: l.concept,
          atlas: l.atlas || (modById[srcId] ? modById[srcId].at : null),
          sec: l.sec || (modById[srcId] ? modById[srcId].a : null)
        });
      }
    });
  });
}

function edgeStats(a, b) {
  const qs = Q.filter(q => q.mods.includes(a) && q.mods.includes(b));
  let att = 0, ok = 0;
  qs.forEach(q => { const ans = S.ans[q.id]; if (ans) { att++; if (ans.last) ok++; } });
  const rate = att > 0 ? (ok / att) : null;
  const status = att === 0 ? 'none' : (rate >= 0.7 ? 'ok' : (rate >= 0.4 ? 'warn' : 'bad'));
  return { total: qs.length, att, ok, wrong: att - ok, status, rate };
}

function modStats(id) {
  const qs = Q.filter(q => q.pm === id); let att = 0, ok = 0;
  qs.forEach(q => { const a = S.ans[q.id]; if (a) { att++; if (a.last) ok++; } });
  return { total: qs.length, att, ok, wrong: att - ok };
}
const doneCount = () => covered.filter(m => S.done[m.id]).length;

/* ---------- link do atlasu ---------- */
function atlasHref(q) {
  if (q.at === 'ogolne' || !atById[q.at]) return '#/pytania?mods=' + (q.mods[0] || '0');
  const m = q.mods.find(x => modById[x] && modById[x].at === q.at);
  return '#/atlas/' + q.at + (m ? '/' + modById[m].a : '/zadania');
}

/* ---------- wykres powiązań (Focus & Context + Mastery + Semantyka) ---------- */
function renderGraph(host, o = {}) {
  const size = 600, cx = 300, cy = 300, R = 196, gap = 0.2, n = MODS.length;
  const step = (Math.PI * 2 - 4 * gap) / n;
  let ang = -Math.PI / 2 + gap / 2, lastG = null; const pos = {};
  MODS.forEach(m => {
    if (lastG && m.g !== lastG) ang += gap;
    lastG = m.g; pos[m.id] = { a: ang, x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) };
    ang += step;
  });
  const maxW = Math.max(...EDGES.map(e => e.w));
  const arcs = Object.keys(GROUPS).map(g => {
    const ms = MODS.filter(m => m.g === g); const a0 = pos[ms[0].id].a, a1 = pos[ms[ms.length - 1].id].a;
    const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0), x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    return `<path d="M${x0} ${y0} A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}" fill="none" stroke="${GROUPS[g].color}" stroke-width="30" stroke-linecap="round" opacity=".13"/>`;
  }).join('');

  const edges = EDGES.filter(e => e.w > 0 || e.traps.length).map(e => {
    const p = pos[e.a], q = pos[e.b];
    const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, kx = cx + (mx - cx) * .22, ky = cy + (my - cy) * .22;
    const d = `M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${kx.toFixed(1)} ${ky.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    const w = e.w;

    let extraClasses = '';
    let edgeTitle = `[${e.a}] ↔ [${e.b}]: ${w} pytań`;
    if (e.traps.length) edgeTitle += `, ${e.traps.length} pułapek`;

    if (o.type === 'questions') {
      const st = edgeStats(e.a, e.b);
      extraClasses += ` m-${st.status}`;
      if (st.att > 0) {
        edgeTitle += ` (Rozwiązane: ${st.att}/${st.total}, Poprawne: ${Math.round(st.rate * 100)}%)`;
      } else {
        edgeTitle += ` (Jeszcze niećwiczone)`;
      }
    } else if (o.type === 'atlas') {
      const wA = (WIKILINKS[e.a] || []).filter(w => w.target === e.b);
      const wB = (WIKILINKS[e.b] || []).filter(w => w.target === e.a);
      const allW = [...wA, ...wB];
      if (allW.some(w => w.type === 'trap') || e.traps.length) extraClasses += ' sem-trap cur';
      else if (allW.some(w => w.type === 'diff')) extraClasses += ' sem-diff';
      else if (allW.some(w => w.type === 'diag')) extraClasses += ' sem-diag';
    }

    const sw = (1.2 + Math.min(w, 8) * .55).toFixed(2);
    const op = (.22 + Math.min(w, 8) * .07 + (e.traps.length ? .14 : 0)).toFixed(2);

    return `<g class="eg" data-e="${e.a}|${e.b}">
      <path class="edge${e.traps.length ? ' cur' : ''}${extraClasses}" data-e="${e.a}|${e.b}" d="${d}" stroke-width="${sw}" opacity="${op}"/>
      <path d="${d}" fill="none" stroke="transparent" stroke-width="16" ${o.mode === 'select' ? 'style="cursor:pointer"' : ''} data-hit="${e.a}|${e.b}">
        <title>${edgeTitle}</title>
      </path>
    </g>`;
  }).join('');

  const nodes = MODS.map(m => {
    const p = pos[m.id], c = Math.cos(p.a), anchor = c > .25 ? 'start' : c < -.25 ? 'end' : 'middle';
    const lx = cx + (R + 34) * Math.cos(p.a), ly = cy + (R + 34) * Math.sin(p.a) + (Math.abs(c) <= .25 ? (Math.sin(p.a) > 0 ? 10 : -4) : 0);
    return `<g class="node${m.at ? '' : ' miss'}" data-m="${m.id}" tabindex="0" role="button" aria-label="Moduł ${m.id}: ${esc(m.n)}${m.at ? '' : ', brak atlasu'}">
      <circle class="c" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="20" fill="${GROUPS[m.g].color}" stroke="${GROUPS[m.g].color}" stroke-width="2"/>
      <text class="n" x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}">${m.id}</text>
      ${o.labels === false ? '' : `<text class="l" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}">${esc(SHORT[m.id])}</text>`}
      <title>[${m.id}] ${esc(m.n)}${m.at ? '' : ' (brak atlasu)'}</title></g>`;
  }).join('');

  host.innerHTML = `<svg class="gsvg" viewBox="-40 -6 680 612" role="group" aria-label="Mapa powiązań między modułami">${arcs}<g class="edges">${edges}</g>${nodes}</svg>`;
  const svg = $('svg', host);

  const clear = () => {
    svg.classList.remove('hl', 'focus-mode');
    $$('.node', svg).forEach(x => x.classList.remove('on', 'dim'));
    $$('.edge', svg).forEach(x => x.classList.remove('on', 'dim', 'cluster-edge'));
  };

  function lit(ids) {
    clear();
    if (!ids || !ids.length) return;
    svg.classList.add('hl', 'focus-mode');
    const set = new Set(ids);
    $$('.node', svg).forEach(nd => {
      const on = set.has(nd.dataset.m);
      nd.classList.toggle('on', on);
      nd.classList.toggle('dim', !on);
    });
    $$('.edge', svg).forEach(ed => {
      const [a, b] = ed.dataset.e.split('|');
      const on = set.has(a) && set.has(b);
      ed.classList.toggle('on', on);
      ed.classList.toggle('dim', !on);
    });
  }

  function litCluster(mods) {
    clear();
    if (!mods || !mods.length) return;
    svg.classList.add('hl', 'focus-mode');
    const set = new Set(mods);
    $$('.node', svg).forEach(nd => {
      const on = set.has(nd.dataset.m);
      nd.classList.toggle('on', on);
      nd.classList.toggle('dim', !on);
    });
    $$('.edge', svg).forEach(ed => {
      const [a, b] = ed.dataset.e.split('|');
      const on = set.has(a) && set.has(b);
      ed.classList.toggle('on', on);
      ed.classList.toggle('cluster-edge', on);
      ed.classList.toggle('dim', !on);
    });
  }

  function litNode(id) {
    clear();
    svg.classList.add('hl', 'focus-mode');
    const conn = new Set([id]);
    $$('.edge', svg).forEach(ed => {
      const [a, b] = ed.dataset.e.split('|');
      if (a === id || b === id) {
        ed.classList.add('on');
        ed.classList.remove('dim');
        conn.add(a);
        conn.add(b);
      } else {
        ed.classList.remove('on');
        ed.classList.add('dim');
      }
    });
    $$('.node', svg).forEach(nd => {
      const on = conn.has(nd.dataset.m);
      nd.classList.toggle('on', on);
      nd.classList.toggle('dim', !on);
    });
  }

  let pinned = null;
  const restore = () => { if (pinned && pinned.length) lit(pinned); else clear(); };

  $$('.node', svg).forEach(nd => {
    const id = nd.dataset.m;
    nd.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') litNode(id); });
    nd.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') restore(); });
    nd.addEventListener('focus', () => litNode(id));
    nd.addEventListener('blur', restore);
    const act = () => o.onNode && o.onNode(id);
    nd.addEventListener('click', act);
    nd.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
  });

  if (o.mode === 'select') $$('[data-hit]', svg).forEach(h => h.addEventListener('click', () => o.onEdge && o.onEdge(h.dataset.hit)));

  if (!reduce && o.draw) $$('.edge', svg).forEach((p, i) => {
    const l = p.getTotalLength();
    p.style.strokeDasharray = l; p.style.strokeDashoffset = l;
    p.getBoundingClientRect();
    p.style.transition = `stroke-dashoffset .9s ${(i * 12) % 500}ms ease`;
    requestAnimationFrame(() => { p.style.strokeDashoffset = 0; });
    setTimeout(() => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.style.transition = ''; }, 1900);
  });

  return { pin(ids) { pinned = ids; restore(); }, lit, litNode, litCluster, clear };
}

/* ---------- komponenty ---------- */
function confChip(c) { const k = CONF[c] || CONF.inf; return `<span class="chip" style="background:${k.l};border-color:transparent;color:${k.c}" title="${esc(k.d)}"><i class="dot" style="background:${k.c}"></i>${esc(k.n)}</span>`; }
function modChips(q) { return (q.mods || []).map(m => `<span class="chip m" style="${modById[m] ? 'color:' + gOf(m).color : ''}">[${esc(m)}]</span>`).join(''); }
function explain(q) {
  let h = '';
  if (q.type === 'open' && q.ans) h += `<div class="why"><h4>Odpowiedź</h4><p>${rich(q.ans)}</p></div>`;
  if (q.zal && q.akt) {
    h += `<div class="dual"><div class="dbox z"><h4>🏛️ Do zaliczenia (wg klucza zakładu)</h4>${rich(q.zal)}</div><div class="dbox a"><h4>🩺 Aktualna wiedza kliniczna</h4>${rich(q.akt)}</div></div>`;
  } else if (q.zal) {
    h += `<div class="dual"><div class="dbox z"><h4>🏛️ Do zaliczenia (wg klucza zakładu)</h4>${rich(q.zal)}</div></div>`;
  } else if (q.akt) {
    h += `<div class="dual"><div class="dbox a"><h4>🩺 Aktualna wiedza kliniczna</h4>${rich(q.akt)}</div></div>`;
  }
  if (q.why || (q.fig && q.fig.src)) {
    const whyBody = q.why ? (/<p>/i.test(q.why) ? rich(q.why) : '<p>' + rich(q.why) + '</p>') : '';
    const figSrc = q.fig && q.fig.src && !/^\s*javascript:/i.test(q.fig.src) ? q.fig.src : '';
    const figHtml = figSrc ? `<figure class="q-fig"><a href="${esc(figSrc)}" target="_blank" rel="noopener noreferrer" title="Otwórz infografikę w pełnym rozmiarze"><img src="${esc(figSrc)}" alt="${esc(q.fig.alt || '')}" loading="lazy"></a>${q.fig.cap ? `<figcaption>${esc(q.fig.cap)}</figcaption>` : ''}</figure>` : '';
    h += `<div class="why"><h4>Omówienie</h4>${whyBody}${figHtml}</div>`;
  }
  if (q.tip) h += `<div class="tip"><h4>Jak to zapamiętać</h4>${rich(q.tip)}</div>`;
  
  if (q.src || q.isGlued || q.id) {
    const originFallback = q.isCustom ? 'Własne pytanie' : (q.bank === 'modulowa' ? 'Baza modułowa' : 'Baza zakładowa');
    h += `<details class="q-source-details">
      <summary><span class="muted" style="font-size:.76rem;cursor:pointer;display:inline-flex;align-items:center;gap:.35rem;flex-wrap:wrap">
        📜 Pochodzenie pytania (${q.reps ? q.reps + 'x' : '1x'})${q.id ? ` <code class="q-id-badge" title="Unikatowy identyfikator zadania">${esc(q.id)}</code>` : ''} <span style="opacity:.6;font-size:.68rem">▾</span>
      </span></summary>
      <div class="q-source-box">
        ${q.id ? `<div class="q-id-row"><strong>ID zadania:</strong> <code class="q-id-badge">${esc(q.id)}</code> <button type="button" class="q-id-copy" data-copy-id="${esc(q.id)}" title="Kopiuj ID zadania">Kopiuj ID</button></div>` : ''}
        <strong>Źródła w puli:</strong> ${esc(q.src || originFallback)}
        ${q.isGlued ? '<div style="color:var(--amber);margin-top:.35rem;font-weight:700">⚠️ Uwaga: Pytanie sklejone z wieloczęściowego skanu OCR testu historycznego.</div>' : ''}
        ${q.adapt ? '<div class="muted" style="margin-top:.25rem">Opcje odpowiedzi uzupełnione lub zrekonstruowane.</div>' : ''}
      </div>
    </details>`;
  }
  return h;
}
function optsStatic(q) {
  if (q.type === 'open' || !q.opts) return '';
  return `<div class="opts">${q.opts.map((o, i) => `<div class="opt${q.keys.includes(i) ? ' ok' : ''}"><span class="l">${L[i]}</span><span>${esc(o)}</span></div>`).join('')}</div>`;
}
function bankChip(b) {
  const bank = BANKS[b] || BANKS.zaklad;
  return `<span class="chip" style="font-weight:700;background:var(--surface);border-color:var(--line)" title="${esc(bank.desc)}">${bank.icon} ${esc(bank.short)}</span>`;
}
function qCardActs(q) {
  const bm = !!S.bm[q.id];
  return `<div class="acts"><a class="btn sec sm" href="${atlasHref(q)}">${q.at === 'ogolne' ? 'Filtruj moduł w bazie' : 'Otwórz temat w atlasie'}</a><button class="bm" data-bm="${esc(q.id)}" aria-pressed="${bm}" aria-label="Zakładka" title="Zakładka"><svg width="16" height="16" viewBox="0 0 16 16" fill="${bm ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M3.5 2h9v12L8 11 3.5 14z"/></svg></button>${q.isCustom ? `<button class="btn sec sm del-cq" data-del="${esc(q.id)}" style="color:var(--red);margin-left:auto" title="Usuń z bazy własnych pytań">Usuń pytanie</button>` : ''}</div>`;
}
function qCardBody(q, interactive) {
  const hasKey = q.keys && q.keys.length > 0;
  const metaRow = `<div class="tags qc-meta">${bankChip(q.bank)}${hasKey ? confChip(q.conf) : '<span class="chip" style="background:var(--amber-l);color:var(--amber);border-color:transparent" title="Brak oficjalnego klucza w puli zakładu (do dyskusji)">Do dyskusji (brak klucza)</span>'}${q.why ? '<span class="chip" style="background:var(--blue-l);color:var(--blue);border-color:transparent" title="Zawiera omówienie merytoryczne">Omówienie</span>' : ''}${q.isGlued ? '<span class="chip glued" title="Pytanie złożone z kilku zagadnień ze skanu OCR">⚠️ Pytanie łączone (OCR)</span>' : ''}<span class="chip">${esc(ASHORT[q.at] || 'Moduł')}</span></div>`;
  if (interactive) {
    if (q.type === 'open' || !q.opts || !q.opts.length) {
      return `${metaRow}<div class="acts"><button type="button" class="btn dark sm" data-qreveal>Pokaż odpowiedź i omówienie ▾</button></div><div class="qc-exp"></div>${qCardActs(q)}`;
    }
    const multi = q.keys && q.keys.length > 1;
    const checkBtn = multi ? '<button type="button" class="btn dark sm" data-qcheck disabled>Sprawdź</button>' : '';
    return `${metaRow}${multi ? '<p class="srcline">Zadanie wielokrotnego wyboru: zaznacz wszystkie poprawne odpowiedzi.</p>' : ''}<div class="opts">${q.opts.map((o, i) => `<button type="button" class="opt" data-opt="${i}"><span class="l">${L[i]}</span><span>${esc(o)}</span></button>`).join('')}</div><div class="acts">${checkBtn}<button type="button" class="btn sec sm" data-qreveal>Pokaż klucz i omówienie</button></div><div class="qc-exp"></div>${qCardActs(q)}`;
  }
  return `${metaRow}${optsStatic(q)}${explain(q)}${qCardActs(q)}`;
}
function qCard(q, open, interactive) {
  const a = S.ans[q.id];
  const isHit = q.reps && q.reps >= 2;
  const hasKey = q.keys && q.keys.length > 0;
  let sigChip = '';
  if (q.gap) sigChip = '<span class="chip gap" title="Rozbieżność między kluczem zaliczenia a wytycznymi">⚠️ Rozbieżność klucz vs wytyczne</span>';
  else if (isHit) sigChip = `<span class="chip hit" title="Powtórzone w ${q.reps} niezależnych źródłach / rocznikach">🔥 Hit bazy (${q.reps}x)</span>`;
  else if (q.type === 'open') sigChip = '<span class="chip" style="background:var(--violet-l);color:var(--violet);font-weight:700">Fiszka / Otwarte</span>';
  else if (!hasKey) sigChip = '<span class="chip" style="background:var(--amber-l);color:var(--amber);border-color:transparent" title="Brak oficjalnego klucza w puli zakładu (do dyskusji)">Do dyskusji</span>';
  return `<details class="qc" data-q="${esc(q.id)}"${open ? ' open' : ''}>
    <summary><div><div class="stem">${escB(q.stem)}</div>
      <div class="tags">${modChips(q)}${sigChip}${a ? `<span class="chip" data-qstatus style="background:${a.last ? 'var(--green-l)' : 'var(--red-l)'};color:${a.last ? 'var(--green)' : 'var(--red)'};border-color:transparent">${a.last ? 'opanowane' : 'do powtórki'}</span>` : ''}</div></div>
      <span class="chev" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 4 4 4 4-4"/></svg></span></summary>
    <div class="body">${open ? qCardBody(q, !!interactive) : ''}</div></details>`;
}
function updateCardStatusChip(det, ok) {
  const tags = $('summary .tags', det);
  if (!tags) return;
  let chip = $('[data-qstatus]', tags);
  if (!chip) {
    chip = document.createElement('span');
    chip.className = 'chip';
    chip.dataset.qstatus = '';
    chip.style.borderColor = 'transparent';
    tags.appendChild(chip);
  }
  chip.style.background = ok ? 'var(--green-l)' : 'var(--red-l)';
  chip.style.color = ok ? 'var(--green)' : 'var(--red)';
  chip.textContent = ok ? 'opanowane' : 'do powtórki';
}
function gradeQcCard(det, q, selSet, record) {
  const btns = $$('button.opt[data-opt]', det);
  const hasKey = q.keys && q.keys.length > 0;
  btns.forEach(btn => {
    const i = +btn.dataset.opt;
    btn.disabled = true;
    btn.classList.remove('sel');
    if (hasKey) {
      btn.classList.add(q.keys.includes(i) ? 'ok' : (selSet && selSet.has(i) ? 'bad' : 'dim'));
    } else if (selSet && selSet.has(i)) {
      btn.classList.add('sel');
    } else {
      btn.classList.add('dim');
    }
  });
  const checkAct = $('[data-qreveal], [data-qcheck]', det);
  if (checkAct && checkAct.parentElement) checkAct.parentElement.remove();
  const exp = $('.qc-exp', det);
  if (exp) {
    const note = !hasKey && selSet ? '<p class="srcline">Pytanie bez oficjalnego klucza — porównaj wybór z omówieniem poniżej.</p>' : '';
    const selfRow = (!q.opts || !q.opts.length || q.type === 'open')
      ? '<div class="acts" style="margin-top:.5rem"><span class="muted" style="font-weight:700">Twoja samoocena:</span><button type="button" class="btn pri sm" data-qself="1" style="background:var(--green);border-color:var(--green);color:var(--ink-inv)">Znam ✓</button><button type="button" class="btn sec sm" data-qself="0" style="border-color:var(--red);color:var(--red)">Do powtórki ✗</button></div>'
      : '';
    exp.innerHTML = note + explain(q) + selfRow;
  }
  if (record && hasKey && selSet) {
    const ok = selSet.size === q.keys.length && q.keys.every(k => selSet.has(k));
    recordQAns(q.id, ok);
    updateCardStatusChip(det, ok);
  }
}
function delegateBm(root, onMutate) {
  // Hydrate closed question card bodies only when the user actually expands them.
  root.addEventListener('toggle', e => {
    const det = e.target;
    if (!det || !det.open || !det.classList || !det.classList.contains('qc')) return;
    const body = $('.body', det);
    if (!body || body.firstElementChild) return;
    const q = qById[det.dataset.q];
    if (q) body.innerHTML = qCardBody(q, !!det.closest('[data-quiz="1"]'));
  }, true);
  root.addEventListener('click', e => {
    const copyIdBtn = e.target.closest('[data-copy-id]');
    if (copyIdBtn) {
      e.preventDefault();
      const id = copyIdBtn.dataset.copyId;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id).then(() => toast('Skopiowano ID: ' + id)).catch(() => toast('ID zadania: ' + id));
      } else {
        toast('ID zadania: ' + id);
      }
      return;
    }
    const b = e.target.closest('[data-bm]');
    if (b) {
      e.preventDefault(); const id = b.dataset.bm;
      if (S.bm[id]) delete S.bm[id]; else S.bm[id] = 1;
      save(); const on = !!S.bm[id]; b.setAttribute('aria-pressed', on); $('svg', b).setAttribute('fill', on ? 'currentColor' : 'none');
      toast(on ? 'Dodano zakładkę' : 'Usunięto zakładkę');
      return;
    }
    const del = e.target.closest('[data-del]');
    if (del) {
      e.preventDefault(); const id = del.dataset.del;
      if (confirm('Czy na pewno chcesz usunąć to pytanie z bazy własnych?')) {
        CUSTOM_Q = CUSTOM_Q.filter(x => x.id !== id);
        saveCustomQ();
        toast('Pytanie zostało usunięte');
        if (onMutate) onMutate();
      }
      return;
    }
    const qcOpt = e.target.closest('details.qc button.opt[data-opt]');
    if (qcOpt && !qcOpt.disabled) {
      const det = qcOpt.closest('details.qc'), q = det && qById[det.dataset.q];
      if (!q) return;
      if (q.keys && q.keys.length > 1) {
        qcOpt.classList.toggle('sel');
        const chk = $('[data-qcheck]', det);
        if (chk) chk.disabled = !$('button.opt.sel', det);
      } else {
        gradeQcCard(det, q, new Set([+qcOpt.dataset.opt]), true);
      }
      return;
    }
    const qcCheck = e.target.closest('details.qc [data-qcheck]');
    if (qcCheck) {
      const det = qcCheck.closest('details.qc'), q = det && qById[det.dataset.q];
      if (!q) return;
      const selSet = new Set($$('button.opt.sel', det).map(x => +x.dataset.opt));
      gradeQcCard(det, q, selSet, true);
      return;
    }
    const qcReveal = e.target.closest('details.qc [data-qreveal]');
    if (qcReveal) {
      const det = qcReveal.closest('details.qc'), q = det && qById[det.dataset.q];
      if (q) gradeQcCard(det, q, null, false);
      return;
    }
    const qcSelf = e.target.closest('details.qc [data-qself]');
    if (qcSelf) {
      const det = qcSelf.closest('details.qc'), q = det && qById[det.dataset.q];
      if (!q) return;
      const ok = qcSelf.dataset.qself === '1';
      recordQAns(q.id, ok);
      updateCardStatusChip(det, ok);
      const row = qcSelf.closest('.acts');
      if (row) row.outerHTML = `<p class="srcline">${ok ? 'Zapisano: opanowane ✓' : 'Zapisano: do powtórki ✗'}</p>`;
    }
  });
}

/* ---------- router ---------- */
function parseHash() {
  const raw = location.hash.slice(1) || '/'; const [path, qs] = raw.split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), params: Object.fromEntries(new URLSearchParams(qs || '')) };
}
let current = { name: null, id: null };
let SESSION = null;
let pendingRetryIds = null;
let pendingAutoTrain = false;
const KLINIKA_ROUTES = new Set(['pacjent', 'kalkulator', 'badania', 'kalendarz']);
const WIECEJ_ROUTES = new Set(['egzamin', 'polaczenia', 'graf', 'notatki', 'postep']);

function closeNavDropdowns() {
  $$('.nav-dd').forEach(dd => {
    const btn = $('.nav-dd-btn', dd);
    const pop = $('.nav-pop', dd);
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (pop) pop.hidden = true;
  });
}

function initNavMenus() {
  $$('.nav-dd-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const dd = btn.closest('.nav-dd');
      const pop = $('.nav-pop', dd);
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      closeNavDropdowns();
      if (!isOpen && pop) {
        btn.setAttribute('aria-expanded', 'true');
        pop.hidden = false;
      }
    });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.nav-dd')) closeNavDropdowns(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNavDropdowns(); });
}

function route() {
  closeNavDropdowns();
  onBmMutate = null;
  const { parts, params } = parseHash(); const name = parts[0] || 'start';
  if (name !== 'egzamin' && EXAM_SESSION && EXAM_SESSION.timer) {
    clearInterval(EXAM_SESSION.timer);
    EXAM_SESSION.timer = null;
  }
  // czytnik: ten sam atlas → tylko kotwica
  if (name === 'atlas' && current.name === 'atlas' && current.id === parts[1] && $('#rf')) { setAnchor(parts[1], parts[2]); return; }
  document.body.classList.toggle('reader', name === 'atlas');
  if (name !== 'atlas') document.body.classList.remove('reader-focus');
  $$('#menu a[data-r]').forEach(a => { const r = a.dataset.r; a.classList.toggle('on', r === name || (r === 'atlasy' && name === 'atlas')); });
  $$('#menu .nav-dd').forEach(dd => {
    const btn = $('.nav-dd-btn', dd);
    if (!btn) return;
    const isMatch = (dd.dataset.group === 'klinika' && KLINIKA_ROUTES.has(name)) || (dd.dataset.group === 'wiecej' && WIECEJ_ROUTES.has(name));
    btn.classList.toggle('on', isMatch);
  });
  const v = { start: viewStart, atlasy: viewGallery, atlas: viewReader, trening: viewTrening, egzamin: viewExam, pacjent: clinicalPatient.viewPatient, kalkulator: clinicalCalc.viewCalculator || clinicalCalc.viewCalc, kalendarz: viewKalendarz, badania: clinicalDiagnostics.viewDiagnostics, pytania: viewQuestions, notatki: viewNotes, polaczenia: viewConnections, graf: viewKnowledgeGraph, postep: viewProgress }[name];
  current = { name, id: parts[1] || null };
  main.classList.remove('view'); void main.offsetWidth; main.classList.add('view');
  if (!v) { location.hash = '#/'; return; }
  v(parts, params);
  renderFooter();
  if (name !== 'atlas') window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

/* ---------- STRONA GŁÓWNA ---------- */
function viewStart() {
  const last = S.last && atById[S.last.at];
  const contHref = last ? '#/atlas/' + S.last.at + (S.last.a ? '/' + S.last.a : '') : '#/atlas/nagle-ob';
  const sample = Q.filter(x => x.zal && x.akt && x.stem.length < 240).slice(0, 2);
  const confRows = Object.keys(ASHORT).map(aid => {
    const qs = Q.filter(q => q.at === aid), tot = qs.length;
    if (!tot) return '';
    const seg = ['src', 'inf', 'unk', 'did', 'own'].map(k => {
      const c = qs.filter(q => q.conf === k).length;
      return c ? `<i style="width:${100 * c / tot}%;background:${CONF[k].c}" title="${CONF[k].n}: ${c}"></i>` : '';
    }).join('');
    return `<div class="crow"><span>${esc(ASHORT[aid])}</span><div class="cstack">${seg}</div><span class="mono muted">${tot}</span></div>`;
  }).join('');
  const zakladCount = Q.filter(q => q.bank === 'zaklad').length;

  main.innerHTML = `
  <section class="hero"><div class="wrap grid">
    <div>
      <h1>Ginekologia i położnictwo w <em>jednym</em> miejscu.</h1>
      <p class="sub">${ATLASES.length} interaktywne atlasy pokazowe, ${Q.length} pytań z podwójną prawdą (klucz zakładu vs PTGiP/FIGO), kalkulatory położnicze, trenażer KTG/USG, Izba Przyjęć, stacje OSCE i kalendarz ciąży MZ — wszystko offline.</p>
      <div class="cta">
        <a class="btn pri" href="${contHref}" id="cont">${last ? 'Kontynuuj: ' + esc(ASHORT[S.last.at]) : 'Otwórz atlas stanów nagłych'} <span aria-hidden="true">→</span></a>
        <a class="btn sec" href="#/kalkulator">Kalkulatory i dawki OB →</a>
        ${zakladCount > 0 ? `<a class="btn sec" href="#/pytania?tab=zaklad">Pula pytań (${Q.length}) →</a>` : `<a class="btn sec" href="#/trening">Ćwicz pytania (${Q.length}) →</a>`}
      </div>
      <div class="stats" aria-label="Zakres makiety hubu">
        <div class="stat"><b data-n="${ATLASES.length}">${ATLASES.length}</b><span>atlasy gotowe</span></div>
        <div class="stat"><b><i style="font-style:normal" data-n="${MODS.length}">${MODS.length}</i></b><span>modułów w mapie</span></div>
        <div class="stat"><b data-n="${Q.length}">${Q.length}</b><span>pytań przykładowych</span></div>
        <div class="stat"><b data-n="${gapCount}">${gapCount}</b><span>rozbieżności klucz ↔ PTGiP</span></div>
      </div>
    </div>
    <div class="hero-viz"><div id="heroGraph"></div><p class="cap"><b>Mapa powiązań OB/GYN.</b> Najedź na węzeł, aby zobaczyć moduły połączone wspólnymi pułapkami i zadaniami.</p></div>
  </div></section>

  <section class="blk" id="mapa"><div class="wrap">
    <h2>Dwanaście modułów, cztery obszary kliniczne</h2>
    <p class="lead">Kafelki z pełnym obramowaniem prowadzą bezpośrednio do gotowych atlasów pokazowych. Moduły z przerywaną ramką mają już aktywną bazę pytań i powiązań, a ich pełne atlasy są przewidziane do rozbudowy.</p>
    <div class="map">${Object.keys(GROUPS).map(g => `<div class="mgroup" style="--gc:${GROUPS[g].color}"><div class="gl">Obszar ${g}</div><h3>${GROUPS[g].name}</h3><div class="stack">${MODS.filter(m => m.g === g).map(m => {
      const st = modStats(m.id);
      const hasAtlas = !!(m.at && atById[m.at]);
      const href = hasAtlas ? `#/atlas/${m.at}/${m.a}` : `#/pytania?tab=browse&mod=${m.id}`;
      const right = st.att ? `<span class="acc">${pct(st.ok, st.att)}%</span>` : `<span class="acc">${st.total} pyt.</span>`;
      return `<a class="mtile${hasAtlas ? '' : ' miss'}" href="${href}" style="--gc:${GROUPS[m.g].color}"><span class="nb">${m.id}</span><span><b>${esc(m.n)}</b><small>${esc(m.d)}</small></span>${right}</a>`;
    }).join('')}</div></div>`).join('')}</div>
    <p class="srcline" style="margin-top:1rem">Wskaźnik po prawej: odsetek poprawnych odpowiedzi w hubie albo liczba dostępnych pytań z danego modułu.</p>
  </div></section>

  <section class="blk" id="narzedzia"><div class="wrap">
    <h2>Narzędzia przyłóżkowe i pętla nauki</h2>
    <p class="lead">Szybkie przejście od lektury atlasu przez trening pytań po narzędzia kliniczne na dyżur i OSCE.</p>
    <div class="loop">
      <a class="step" href="#/atlasy"><h3>Atlasy modułowe</h3><p>Interaktywne algorytmy 4T PPH, rzucawki, ciąży ektopowej, chwytów Leopolda, Bishopa i KTG.</p><span class="go">Otwórz atlasy →</span></a>
      <a class="step" href="#/kalkulator"><h3>Kalkulatory OB</h3><p>Reguła Naegelego + CRL, skala Bishopa, Apgar, wskaźnik RMI oraz dawki ratunkowe MgSO₄ i PPH.</p><span class="go">Uruchom kalkulator →</span></a>
      <a class="step" href="#/badania"><h3>KTG, USG i Cytologia</h3><p>Trenażer zapisów KTG wg FIGO 2015, hotspoty USG, OGTT 75g i klasyfikacja Bethesda.</p><span class="go">Otwórz diagnostykę →</span></a>
      <a class="step" href="#/pacjent"><h3>Izba Przyjęć &amp; OSCE</h3><p>Symulacje stanów nagłych OB/GYN z monitorem parametrów oraz stacje egzaminacyjne OSCE.</p><span class="go">Wejdź na dyżur →</span></a>
    </div>
  </div></section>

  <section class="blk" id="dwa"><div class="wrap">
    <h2>Pod zaliczenie czy aktualnie klinicznie (PTGiP / FIGO)?</h2>
    <p class="lead">Starsze klucze kolokwiów potrafią odbiegać od aktualnych rekomendacji PTGiP i FIGO. W pytaniach z rozbieżnością hub rozdziela oba stanowiska, nie zacierając żadnego z nich.</p>
    <div class="dcase">${sample.map(q => `<div class="card"><div class="q">${esc(q.stem)}</div><div class="tags" style="display:flex;gap:.3rem;margin:.5rem 0 .8rem">${modChips(q)}${confChip(q.conf)}</div><div class="dual"><div class="dbox z"><h4>Pod zaliczenie</h4>${rich(q.zal)}</div><div class="dbox a"><h4>Aktualnie klinicznie</h4>${rich(q.akt)}</div></div></div>`).join('')}</div>
    <p style="margin-top:1rem"><a class="btn sec" href="#/pytania?gap=1">Zobacz wszystkie ${gapCount} rozbieżności →</a></p>
  </div></section>

  <section class="blk"><div class="wrap">
    <h2>Przejrzystość źródeł i pewność klucza</h2>
    <p class="lead">Każde pytanie w makiecie posiada jawne oznaczenie pochodzenia i pewności klucza, rozłożone na obszary specjalizacji.</p>
    <div class="card"><div class="cbars">${confRows}</div>
      <div class="legend">${Object.keys(CONF).filter(k => Q.some(q => q.conf === k)).map(k => `<span><i class="dot" style="background:${CONF[k].c}"></i><b>${CONF[k].n}</b> – ${CONF[k].d}</span>`).join('')}</div></div>
  </div></section>

  <section class="blk"><div class="wrap">
    <h2>Pułapki na styku położnictwa i ginekologii</h2>
    <p class="lead">Najgroźniejsze błędy egzaminacyjne i przyłóżkowe powstają na przecięciu modułów. Zobacz pełną mapę połączeń i różnicowania.</p>
    <div class="agrid">${TRAPS.slice(0, 3).map(t => `<a class="acard" href="#/polaczenia?trap=${TRAPS.indexOf(t)}" style="--c1:var(--red);--c2:var(--amber)"><div class="pillrow">${t.mods.map(m => `<span class="chip m" style="color:${gOf(m).color}">[${m}]</span>`).join('')}</div><h3>${esc(t.t)}</h3><p>${esc(t.eq)}</p><p style="color:var(--red);font-weight:800">${esc(t.out)}</p></a>`).join('')}</div>
    <p style="margin-top:1.2rem"><a class="btn pri" href="#/polaczenia">Otwórz mapę połączeń →</a></p>
  </div></section>`;
  renderGraph($('#heroGraph'), { labels: false, draw: true, onNode: id => { const m = modById[id]; location.hash = (m && m.at && atById[m.at]) ? '#/atlas/' + m.at + '/' + m.a : '#/polaczenia?mod=' + id; } });
  if (!reduce) $$('[data-n]').forEach(el => { const t = +el.dataset.n; const t0 = performance.now(); (function tick(now) { const p = Math.min(1, (now - t0) / 800); el.textContent = Math.round(t * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); })(t0); });
}

/* ---------- GALERIA ATLASÓW ---------- */
function viewGallery() {
  main.innerHTML = `<section class="blk" style="border:0"><div class="wrap">
    <h2>${ATLASES.length} atlasów modułowych</h2>
    <p class="lead">Atlasy działają wewnątrz hubu, ale zachowują własną nawigację. Ostatnio otwarte są oznaczone.</p>
    <div class="agrid">${ATLASES.map(a => {
      const qs = Q.filter(q => q.at === a.id), g = GA[a.id]; const vis = S.visited[a.id];
      const ok = qs.filter(q => S.ans[q.id] && S.ans[q.id].last).length, att = qs.filter(q => S.ans[q.id]).length;
      return `<a class="acard" href="#/atlas/${a.id}" style="--c1:${g[0]};--c2:${g[1]}"><div class="pillrow">${a.mods.map(m => `<span class="chip m" style="color:${gOf(m).color}">[${m}]</span>`).join('')}${vis ? '<span class="chip" style="background:var(--teal-l);color:var(--teal-d);border-color:transparent">otwarty</span>' : ''}</div>
      <h3>${esc(a.t)}</h3><p>${esc(a.d)}</p>
      <div class="meta"><span>${a.secs.length} sekcji</span><span>${qs.length} zadań</span><span>${att ? pct(ok, att) + '% poprawnych' : 'bez prób'}</span></div></a>`;
    }).join('')}</div>
  </div></section>`;
}

/* ---------- CZYTNIK ATLASU ---------- */
function setAnchor(id, a) {
  const at = atById[id]; if (!at) return; const f = $('#rf');
  const url = 'atlasy/' + at.dir + '/index.html' + (a ? '#' + a : '');
  // Przewiń bez przeładowania dokumentu, jeśli ten sam atlas jest już załadowany
  if (f.dataset.atlasId === id && f.contentDocument && f.contentDocument.readyState !== 'loading') {
    const target = a ? f.contentDocument.getElementById(a) : null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (!a && f.contentWindow) {
      f.contentWindow.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (f.getAttribute('src') !== url) {
      f.setAttribute('src', url);
    }
  } else {
    f.dataset.atlasId = id;
    if (f.getAttribute('src') !== url) f.setAttribute('src', url);
  }
  $('#secSel').value = a || '';
  S.visited[id] = Date.now(); S.last = { at: id, a: a || null }; save();
  setTimeout(() => syncIframeTheme(getEffectiveTheme()), 60);
}
function viewReader(parts) {
  const id = parts[1], a = parts[2], at = atById[id];
  if (!at) { location.hash = '#/atlasy'; return; }
  main.innerHTML = `<div class="rbar"><div class="wrap">
    <a class="btn sec sm" href="#/atlasy" aria-label="Wróć do listy atlasów">← Atlasy</a>
    <nav class="rtabs" aria-label="Przełącznik atlasów">${ATLASES.map(x => `<a class="rtab${x.id === id ? ' on' : ''}" href="#/atlas/${x.id}"><b>${x.tag}</b> ${esc(ASHORT[x.id])}</a>`).join('')}</nav>
    <label class="sr" for="secSel">Przejdź do sekcji</label>
    <select id="secSel" class="tgl rbar-sec-sel"><option value="">Sekcje…</option>${at.secs.map(s => `<option value="${s[0]}">${esc(s[1])}</option>`).join('')}</select>
    <a class="btn pri sm" href="#/trening?at=${id}">Trening z atlasu</a>
    <button type="button" class="btn sec sm rbar-focus-btn" id="rbarFocus" aria-pressed="${document.body.classList.contains('reader-focus')}" title="Tryb skupienia (ukryj górny i dolny pasek)" aria-label="Tryb skupienia">⛶</button>
    <a class="btn sec sm" target="_blank" rel="noopener" href="atlasy/${at.dir}/index.html" title="Otwórz atlas w osobnej karcie" aria-label="Otwórz atlas w osobnej karcie">↗</a>
  </div></div>
  <iframe id="rf" class="rframe" title="Atlas: ${esc(at.t)}" src="" loading="eager"></iframe>`;
  $('#secSel').addEventListener('change', e => {
    const activeId = $('#rf')?.dataset.atlasId || current.id || id;
    location.hash = '#/atlas/' + activeId + (e.target.value ? '/' + e.target.value : '');
  });
  const rbarFocus = $('#rbarFocus');
  if (rbarFocus) {
    rbarFocus.onclick = () => {
      const on = document.body.classList.toggle('reader-focus');
      rbarFocus.setAttribute('aria-pressed', String(on));
    };
  }
  const syncReaderHeader = (loadedAt, loadedSec) => {
    const sel = $('#secSel');
    const sec = loadedSec && loadedAt.secs.some(s => s[0] === loadedSec) ? loadedSec : '';
    if (rf.dataset.atlasId !== loadedAt.id) {
      rf.dataset.atlasId = loadedAt.id;
      current.id = loadedAt.id;
      rf.title = 'Atlas: ' + loadedAt.t;
      $$('.rtab').forEach(tab => {
        const match = tab.getAttribute('href') === '#/atlas/' + loadedAt.id;
        tab.classList.toggle('on', match);
        if (match) tab.scrollIntoView({ inline: 'center', block: 'nearest' });
      });
      if (sel) sel.innerHTML = `<option value="">Sekcje…</option>${loadedAt.secs.map(s => `<option value="${s[0]}">${esc(s[1])}</option>`).join('')}`;
      const treningLink = $('.rbar a[href^="#/trening?at="]');
      if (treningLink) treningLink.setAttribute('href', '#/trening?at=' + loadedAt.id);
      const extLink = $('.rbar a[target="_blank"]');
      if (extLink) extLink.setAttribute('href', `atlasy/${loadedAt.dir}/index.html`);
    }
    if (sel) sel.value = sec;
    S.visited[loadedAt.id] = Date.now();
    S.last = { at: loadedAt.id, a: sec || null };
    save();
    history.replaceState(null, '', '#/atlas/' + loadedAt.id + (sec ? '/' + sec : ''));
  };
  const rf = $('#rf');
  if (rf) {
    rf.addEventListener('load', () => {
      syncIframeTheme(getEffectiveTheme());
      try {
        const win = rf.contentWindow;
        const m = (win?.location?.pathname || '').match(/\/atlasy\/([^/]+)\//);
        const loadedAt = m ? ATLASES.find(x => x.dir === m[1]) : null;
        const loadedSec = (win?.location?.hash || '').slice(1);
        if (loadedAt) syncReaderHeader(loadedAt, loadedSec);
        win.addEventListener('hashchange', () => {
          const curId = rf.dataset.atlasId || current.id || id;
          const curAt = atById[curId];
          const h = (win.location.hash || '').slice(1);
          if (curAt) syncReaderHeader(curAt, h);
        });
      } catch (e) {}
    });
  }
  setAnchor(id, a);
  $('.rtab.on').scrollIntoView({ inline: 'center', block: 'nearest' });
}

/* ---------- POŁĄCZENIA MIĘDZYMODUŁOWE (Symptom Explorer + 2 Mapy) ---------- */
function viewConnections(parts, params) {
  let activeTab = params.tab === 'pytania' ? 'pytania' : 'atlas';
  let activeClusterId = params.cluster || null;
  let activeClusterTag = 'all';
  let activeGraph = null;
  let currentMasteryFilter = 'all';
  let currentTrapFilter = 'all';

  main.innerHTML = `<section class="blk" style="border:0"><div class="wrap">
    <div class="eyebrow">Połączenia międzymodułowe · Silnik integracji klinicznej</div>
    <h2>Gdzie tematy się przecinają</h2>
    <p class="lead" style="margin-bottom:1.4rem">Eksploruj powiązania między modułami: ścieżki różnicowania objawowego z algorytmami decyzyjnymi, głębokie wikilinki do sekcji atlasów oraz mapę pytań i pułapek z wizualizacją Twojego opanowania.</p>

    <!-- OMNIBAR OBJAWÓW (Symptom Explorer) -->
    <div class="conn-omnibar-box">
      <div class="conn-omnibar-header">
        <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
          <span style="font-weight:800;font-size:.95rem;color:var(--ink);display:flex;align-items:center;gap:.4rem">
            <span>🩺</span> Symptom Explorer: 8 Zespołów Różnicowych
          </span>
          <span class="chip" style="font-size:.72rem;background:var(--teal-l);color:var(--teal-d);border:0;font-weight:700">Wysokopunktowane LĘK / PES / OSCE</span>
        </div>
        <div class="conn-omnibar-filters" id="omnibarTags">
          <button class="omnibar-tag-btn active" data-tag="all">Wszystkie (8)</button>
          <button class="omnibar-tag-btn" data-tag="brzuszne">Brzuszne</button>
          <button class="omnibar-tag-btn" data-tag="zakaźne">Zakaźne & Skazy</button>
          <button class="omnibar-tag-btn" data-tag="nerkowe">Nerkowe</button>
          <button class="omnibar-tag-btn" data-tag="stany-nagle">Stany nagłe & OUN</button>
        </div>
      </div>

      <div class="conn-clusters-scroll" id="clusterChipsRow">
        <!-- Generowane z SYMPTOM_CLUSTERS -->
      </div>
    </div>

    <!-- KARTA ŚCIEŻKI DECYZYJNEJ -->
    <div id="diffDecisionCardHost"></div>

    <div class="conn-tabs" role="tablist" style="margin-top:1.8rem">
      <button class="conn-tab-btn ${activeTab === 'atlas' ? 'active' : ''}" data-tab="atlas" role="tab" aria-selected="${activeTab === 'atlas'}">🗺️ Mapa Atlasów i Wikilinków (Głębokie powiązania)</button>
      <button class="conn-tab-btn ${activeTab === 'pytania' ? 'active' : ''}" data-tab="pytania" role="tab" aria-selected="${activeTab === 'pytania'}">🎯 Mapa Zadań i Pułapek (Baza pytań & Opanowanie)</button>
      <a class="conn-tab-btn" href="#/graf" style="margin-left:auto;text-decoration:none">🕸️ Otwórz Graf wiedzy →</a>
    </div>
    <div id="connTabContent"></div>
  </div></section>`;

  const tabContent = $('#connTabContent');
  const clustersRow = $('#clusterChipsRow');
  const cardHost = $('#diffDecisionCardHost');

  // Renderowanie kafelków w Omnibarze
  function renderClusterChips(tag = 'all') {
    const clusters = (SYMPTOM_CLUSTERS || []).filter(c => {
      if (tag === 'all') return true;
      if (tag === 'brzuszne') return c.id === 's1' || c.id === 's6';
      if (tag === 'zakaźne') return c.id === 's2' || c.id === 's7';
      if (tag === 'nerkowe') return c.id === 's3' || c.id === 's8';
      if (tag === 'stany-nagle') return c.id === 's4' || c.id === 's5';
      return true;
    });

    clustersRow.innerHTML = clusters.map(c => {
      const isSel = c.id === activeClusterId;
      return `
        <button class="symptom-chip ${isSel ? 'active' : ''}" data-cluster="${c.id}" type="button">
          <span class="symptom-icon">${c.icon}</span>
          <div style="text-align:left">
            <div class="symptom-name">${esc(c.name)}</div>
            <div class="symptom-mods">
              ${c.mods.map(m => `<span class="chip-mini" style="color:${gOf(m).color}">[${m}]</span>`).join('')}
            </div>
          </div>
        </button>
      `;
    }).join('');

    $$('.symptom-chip[data-cluster]', clustersRow).forEach(chip => {
      chip.addEventListener('click', () => {
        const id = chip.dataset.cluster;
        if (activeClusterId === id) {
          activeClusterId = null;
          chip.classList.remove('active');
          renderDiffDecisionCard(null);
          if (activeGraph) activeGraph.clear();
        } else {
          activeClusterId = id;
          $$('.symptom-chip', clustersRow).forEach(x => x.classList.toggle('active', x === chip));
          const cluster = (SYMPTOM_CLUSTERS || []).find(x => x.id === id);
          renderDiffDecisionCard(cluster);
          if (activeGraph && cluster) activeGraph.litCluster(cluster.mods);
          cardHost.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

  // Filtr tagów Omnibara
  $('#omnibarTags').addEventListener('click', ev => {
    const btn = ev.target.closest('.omnibar-tag-btn');
    if (!btn) return;
    activeClusterTag = btn.dataset.tag;
    $$('.omnibar-tag-btn').forEach(b => b.classList.toggle('active', b === btn));
    renderClusterChips(activeClusterTag);
  });

  renderClusterChips('all');

  // Renderowanie Karty Ścieżki Decyzyjnej
  function renderDiffDecisionCard(cluster) {
    if (!cluster) {
      cardHost.innerHTML = '';
      return;
    }

    const commonCrossQs = Q.filter(q => {
      const hits = q.mods.filter(m => cluster.mods.includes(m));
      return hits.length >= 2;
    });

    cardHost.innerHTML = `
      <div class="diff-card-wrapper" id="activeDiffCard">
        <div class="diff-card-header">
          <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
            <span style="font-size:1.6rem">${cluster.icon}</span>
            <div>
              <div style="display:flex;align-items:center;gap:.5rem">
                <span class="chip" style="font-size:.7rem;font-weight:700">${esc(cluster.tag)}</span>
                <div class="pillrow" style="margin:0">
                  ${cluster.mods.map(m => `<span class="chip m" style="color:${gOf(m).color};font-size:.75rem">[${m}] ${esc(SHORT[m])}</span>`).join('')}
                </div>
              </div>
              <h3 style="margin:.25rem 0 0;font-size:1.3rem;font-family:var(--font-display)">${esc(cluster.name)}</h3>
            </div>
          </div>
          <button class="btn sec sm" id="btnCloseDiffCard" style="margin-left:auto" title="Zwiń kartę różnicowania">✕ Zwiń kartę</button>
        </div>

        <!-- RED FLAGS -->
        <div class="diff-box red-flags">
          <div class="diff-box-title">🚨 Czerwone flagi (Red Flags – Natychmiastowa ocena SOR/OIT)</div>
          <ul class="diff-list">
            ${cluster.redFlags.map(rf => `<li>${esc(rf)}</li>`).join('')}
          </ul>
        </div>

        <!-- KEY RULE -->
        <div class="diff-box key-rule">
          <div class="diff-box-title">⚖️ Klucz rozstrzygający (Badanie z wyboru / Pierwszy krok)</div>
          <p style="margin:0;font-size:.9rem;line-height:1.5;font-weight:600;color:var(--ink)">${esc(cluster.keyRule)}</p>
        </div>

        <!-- GAŁĘZIE MODUŁOWE (BRANCHES) -->
        <div style="margin-top:1rem">
          <div class="flab" style="margin-bottom:.5rem">Kierunki różnicowania i głębokie odnośniki do sekcji w atlasach</div>
          <div class="diff-branches-grid">
            ${cluster.branches.map(b => `
              <div class="diff-branch-item" style="border-left:4px solid ${gOf(b.mod).color}">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.3rem">
                  <span class="chip m" style="color:${gOf(b.mod).color};font-size:.72rem">[${b.mod}] ${esc(SHORT[b.mod])}</span>
                  <span class="muted" style="font-size:.75rem">Atlas: ${b.atlas}</span>
                </div>
                <h4 style="font-size:.96rem;margin-bottom:.3rem">${esc(b.name)}</h4>
                <p class="muted" style="font-size:.82rem;line-height:1.4;margin-bottom:.6rem">${esc(b.clue)}</p>
                <a class="btn sec sm diff-link-btn" href="#/atlas/${b.atlas}/${b.sec}">
                  📖 ${esc(b.linkText)} →
                </a>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- PUŁAPKA I TRENING -->
        <div class="diff-footer-row">
          <div class="diff-trap-box ${cluster.trap.type === 'bedside' ? 'bedside-trap' : 'test-trap'}">
            <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.25rem">
              <span style="font-weight:800;font-size:.8rem">${esc(cluster.trap.badge)}</span>
            </div>
            <div style="font-weight:700;font-size:.88rem;margin-bottom:.2rem">${esc(cluster.trap.title)}</div>
            <p class="muted" style="font-size:.82rem;margin:0;line-height:1.4">${esc(cluster.trap.desc)}</p>
            <div style="margin-top:.4rem;font-size:.8rem;color:var(--ink);font-weight:600">💡 <b>Egzamin:</b> ${esc(cluster.examTip)}</div>
          </div>

          <div class="diff-action-box">
            <div style="font-size:.85rem;font-weight:700;margin-bottom:.3rem">Sprawdź się na styku modułów:</div>
            <p class="muted" style="font-size:.78rem;margin-bottom:.7rem">Baza zawiera <b>${commonCrossQs.length}</b> pytań łączących te tematy.</p>
            <a class="btn pri sm" href="#/trening?mods=${cluster.mods.join(',')}" style="width:100%;text-align:center;justify-content:center">
              🎯 Ćwicz pytania ze styku (${commonCrossQs.length})
            </a>
          </div>
        </div>
      </div>
    `;

    $('#btnCloseDiffCard').addEventListener('click', () => {
      activeClusterId = null;
      $$('.symptom-chip').forEach(c => c.classList.remove('active'));
      cardHost.innerHTML = '';
      if (activeGraph) activeGraph.clear();
    });
  }

  if (activeClusterId) {
    const cluster = (SYMPTOM_CLUSTERS || []).find(x => x.id === activeClusterId);
    if (cluster) renderDiffDecisionCard(cluster);
  }

  /* ------------------- ZAKŁADKA 1: MAPA ATLASÓW ------------------- */
  function renderAtlasMap() {
    tabContent.innerHTML = `
      <p class="lead">Wizualizacja powiązań między modułami, sekcjami atlasów oraz powiązanymi pojęciami klinicznymi (Wikilinks & Backlinks). Kliknij moduł na mapie, aby prześwietlić jego odniesienia wychodzące i przychodzące z głębokimi linkami do podstron.</p>
      <div class="conn">
        <div class="card" style="padding:.6rem"><div id="atlasGraph"></div></div>
        <div class="sticky"><div id="atlasPanel"></div></div>
      </div>
      <div style="margin-top:2.4rem">
        <h3>Kluczowe mosty wiedzy między atlasami</h3>
        <p class="lead" style="margin-bottom:1rem">Pojęcia i jednostki chorobowe wymagające łączenia wiedzy z różnych atlasów kursu.</p>
        <div class="agrid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))" id="atlasBridgeGrid">
          ${(SEMANTIC_GAPS || []).map(g => `
            <button type="button" class="card bridge-card-btn" data-mod="${g.from}">
              <span class="pillrow" style="margin-bottom:.4rem">
                ${g.mods.map(m => `<span class="chip m" style="color:${gOf(m).color}">[${m}] ${esc(SHORT[m])}</span>`).join('')}
              </span>
              <strong style="display:block;font-size:1rem;margin-bottom:.3rem">${esc(g.title)}</strong>
              <span class="muted" style="display:block;font-size:.84rem;line-height:1.4">${esc(g.clinicalReason.slice(0, 130))}…</span>
            </button>
          `).join('')}
        </div>
      </div>`;

    const panel = $('#atlasPanel');
    const g = renderGraph($('#atlasGraph'), { type: 'atlas', mode: 'select', draw: true, onNode: selAtlasNode, onEdge: selAtlasEdge });
    activeGraph = g;

    function introAtlas() {
      g.pin(null);
      panel.innerHTML = `<div class="card">
        <h3>Mapa Atlasów i Wikilinków</h3>
        <p class="muted" style="margin:.4rem 0 .8rem">Wybierz moduł z koła powiązań. Panel pokaże odniesienia wychodzące (Wikilinks), odniesienia przychodzące (Backlinks) oraz sekcje atlasu z możliwością natychmiastowego przejścia do treści.</p>
        <div class="legend" style="margin:0">
          ${Object.keys(GROUPS).map(k => `<span><i class="dot" style="background:${GROUPS[k].color}"></i>${GROUPS[k].short}</span>`).join('')}
          <span><i class="dot" style="background:var(--red)"></i>pułapka kliniczna</span>
          <span><i class="dot" style="background:var(--teal)"></i>różnicowanie / most</span>
          <span><i class="dot" style="border:2px dashed var(--muted);background:var(--surface)"></i>brak atlasu</span>
        </div>
      </div>`;
    }

    function selAtlasNode(id) {
      const m = modById[id];
      if (!m) return;
      g.pin([id]);
      g.litNode(id);

      const wikis = WIKILINKS[id] || [];
      const backs = BACKLINKS[id] || [];
      const at = atById[m.at];

      panel.innerHTML = `<div class="card">
        <div class="pillrow">
          <span class="chip m" style="background:${gOf(id).color};color:var(--ink-inv);border:0">[${id}]</span>
          <span class="chip">${GROUPS[m.g].short}</span>
        </div>
        <h3 style="margin:.5rem 0 .2rem;font-size:1.3rem;font-family:var(--font-display)">${esc(m.n)}</h3>
        <p class="muted">${esc(m.d)}</p>
        <div class="acts" style="margin:.9rem 0">
          ${m.at ? `<a class="btn pri sm" href="#/atlas/${m.at}/${m.a}">Otwórz atlas [${esc(ASHORT[m.at])}] →</a>` : '<span class="chip">brak atlasu</span>'}
          <a class="btn sec sm" href="#/trening?mods=${id}">Trening</a>
          <a class="btn sec sm" href="#/pytania?mods=${id}">Zadania (${modStats(id).total})</a>
        </div>

        <div style="margin-top:1.2rem">
          <div class="flab">Wikilinks (Odniesienia wychodzące: ${wikis.length})</div>
          <div class="link-list">
            ${wikis.map(w => `
              <div class="link-item">
                <div class="link-item-header">
                  <span class="link-item-title">${esc(w.label)}</span>
                  <button class="chip m link-goto-btn" data-goto="${w.target}" type="button" style="color:${gOf(w.target).color};font-size:.72rem;cursor:pointer;border:1px solid currentColor">
                    [${w.target}] ${esc(SHORT[w.target])}
                  </button>
                </div>
                <div class="link-item-concept">${esc(w.concept)}</div>
                ${w.atlas && w.sec ? `
                  <div style="margin-top:.4rem;text-align:right">
                    <a class="btn sec sm" href="#/atlas/${w.atlas}/${w.sec}" style="padding:.2rem .5rem;font-size:.72rem">
                      Otwórz w atlasie: ${w.sec} →
                    </a>
                  </div>
                ` : ''}
              </div>
            `).join('') || '<span class="muted" style="font-size:.85rem">Brak bezpośrednich odniesień wychodzących.</span>'}
          </div>
        </div>

        <div style="margin-top:1.2rem">
          <div class="flab">Backlinks (Odniesienia przychodzące: ${backs.length})</div>
          <div class="link-list">
            ${backs.map(b => `
              <div class="link-item">
                <div class="link-item-header">
                  <span class="link-item-title">${esc(b.label)}</span>
                  <button class="chip m link-goto-btn" data-goto="${b.source}" type="button" style="color:${gOf(b.source).color};font-size:.72rem;cursor:pointer;border:1px solid currentColor">
                    [${b.source}] ${esc(SHORT[b.source])}
                  </button>
                </div>
                <div class="link-item-concept">${esc(b.concept)}</div>
                ${b.atlas && b.sec ? `
                  <div style="margin-top:.4rem;text-align:right">
                    <a class="btn sec sm" href="#/atlas/${b.atlas}/${b.sec}" style="padding:.2rem .5rem;font-size:.72rem">
                      Otwórz w atlasie: ${b.sec} →
                    </a>
                  </div>
                ` : ''}
              </div>
            `).join('') || '<span class="muted" style="font-size:.85rem">Brak bezpośrednich odniesień przychodzących.</span>'}
          </div>
        </div>

        ${at && at.secs ? `
          <div style="margin-top:1.2rem">
            <div class="flab">Sekcje w atlasie</div>
            <div class="pillrow" style="margin-top:.4rem">
              ${at.secs.map(s => `<a class="chip" href="#/atlas/${at.id}/${s[0]}" style="text-decoration:none">${esc(s[1])}</a>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>`;

      $$('.link-goto-btn[data-goto]', panel).forEach(btn => {
        btn.addEventListener('click', () => selAtlasNode(btn.dataset.goto));
      });
    }

    function selAtlasEdge(k) {
      const e = E[k];
      if (!e) return;
      g.pin([e.a, e.b]);
      g.lit([e.a, e.b]);
      const wA = (WIKILINKS[e.a] || []).filter(w => w.target === e.b);
      const wB = (WIKILINKS[e.b] || []).filter(w => w.target === e.a);

      panel.innerHTML = `<div class="card">
        <div class="pillrow">
          <span class="chip m" style="background:${gOf(e.a).color};color:var(--ink-inv);border:0">[${e.a}] ${esc(SHORT[e.a])}</span>
          <span aria-hidden="true">↔</span>
          <span class="chip m" style="background:${gOf(e.b).color};color:var(--ink-inv);border:0">[${e.b}] ${esc(SHORT[e.b])}</span>
        </div>
        <h3 style="margin:.5rem 0;font-size:1.15rem">${esc(SHORT[e.a])} ↔ ${esc(SHORT[e.b])}</h3>
        <p class="muted" style="font-size:.88rem;margin-bottom:.8rem">Most semantyczny i powiązania między atlasami.</p>

        ${[...wA, ...wB].map(w => `
          <div class="link-item" style="margin-bottom:.5rem">
            <div class="link-item-title" style="margin-bottom:.25rem">${esc(w.label)}</div>
            <div class="link-item-concept">${esc(w.concept)}</div>
            ${w.atlas && w.sec ? `
              <div style="margin-top:.4rem;text-align:right">
                <a class="btn sec sm" href="#/atlas/${w.atlas}/${w.sec}">
                  Otwórz sekcję [${w.sec}] →
                </a>
              </div>
            ` : ''}
          </div>
        `).join('')}

        <div class="acts" style="margin-top:1rem">
          ${modById[e.a].at ? `<a class="btn pri sm" href="#/atlas/${modById[e.a].at}">Atlas [${e.a}]</a>` : ''}
          ${modById[e.b].at ? `<a class="btn pri sm" href="#/atlas/${modById[e.b].at}">Atlas [${e.b}]</a>` : ''}
          <button class="btn sec sm" id="clrAtlas">Wyczyść</button>
        </div>
      </div>`;
      const c = $('#clrAtlas');
      if (c) c.onclick = () => { introAtlas(); g.lit([]); };
    }

    introAtlas();
    if (activeClusterId) {
      const cluster = (SYMPTOM_CLUSTERS || []).find(x => x.id === activeClusterId);
      if (cluster) g.litCluster(cluster.mods);
    } else if (params.mod && modById[params.mod]) {
      selAtlasNode(params.mod);
    }

    $('#atlasBridgeGrid').addEventListener('click', ev => {
      const card = ev.target.closest('[data-mod]');
      if (card && card.dataset.mod) {
        selAtlasNode(card.dataset.mod);
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /* ------------------- ZAKŁADKA 2: MAPA ZADAŃ I PUŁAPEK ------------------- */
  function renderQuestionsMap() {
    let totalPairsWithQs = 0, pairsWithWrong = 0;
    EDGES.forEach(e => {
      if (e.w > 0) {
        totalPairsWithQs++;
        const st = edgeStats(e.a, e.b);
        if (st.wrong > 0) pairsWithWrong++;
      }
    });

    const bedsideCount = TRAPS.filter(t => t.category === 'bedside').length;
    const testCount = TRAPS.filter(t => t.category === 'test').length;

    tabContent.innerHTML = `
      <p class="lead">Grubość linii to liczba wspólnych zadań z bazy (${Q.length} pytań). Kolor odzwierciedla Twoje opanowanie krawędzi (zielony/żółty/czerwony). Kliknij krawędź lub komórkę macierzy, aby uruchomić trening ze styku tematów.</p>

      <div class="conn-filter-toolbar">
        <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap" id="masteryFilterBar">
          <span style="font-weight:700;font-size:.82rem;color:var(--ink-2)">Filtruj powiązania:</span>
          <button class="tgl ${currentMasteryFilter === 'all' ? 'on' : ''}" data-mf="all" aria-pressed="${currentMasteryFilter === 'all'}">Wszystkie (${totalPairsWithQs})</button>
          <button class="tgl tgl-err ${currentMasteryFilter === 'wrong' ? 'on' : ''}" data-mf="wrong" aria-pressed="${currentMasteryFilter === 'wrong'}">❌ Z błędami (${pairsWithWrong})</button>
        </div>
        <div class="legend" style="margin:0;font-size:.78rem">
          <span><i class="dot" style="background:var(--green)"></i>Opanowane (≥70%)</span>
          <span><i class="dot" style="background:var(--amber)"></i>W trakcie (40-69%)</span>
          <span><i class="dot" style="background:var(--red)"></i>Błędy (&lt;40%)</span>
          <span><i class="dot" style="background:rgba(12,122,133,0.35)"></i>Niećwiczone</span>
        </div>
      </div>

      <div class="conn">
        <div class="card" style="padding:.6rem"><div id="bigGraph"></div></div>
        <div class="sticky"><div id="panel"></div></div>
      </div>

      <div style="margin-top:2.4rem">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.6rem;margin-bottom:.5rem">
          <div>
            <h2 style="margin:0">Pułapki kliniczne i egzaminacyjne</h2>
            <p class="lead" style="margin:0">16 kluczowych pułapek z podziałem na błędy w sztuce (przyłóżkowe) i pułapki testowe.</p>
          </div>
          <div class="pillrow" id="trapCatFilters" style="margin:0">
            <button class="tgl ${currentTrapFilter === 'all' ? 'on' : ''}" data-tf="all" aria-pressed="${currentTrapFilter === 'all'}">Wszystkie (16)</button>
            <button class="tgl ${currentTrapFilter === 'bedside' ? 'on' : ''}" data-tf="bedside" aria-pressed="${currentTrapFilter === 'bedside'}">🚨 Zagrożenie życia (${bedsideCount})</button>
            <button class="tgl ${currentTrapFilter === 'test' ? 'on' : ''}" data-tf="test" aria-pressed="${currentTrapFilter === 'test'}">⚠️ Testowe (${testCount})</button>
          </div>
        </div>

        <div class="agrid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,290px),1fr))" id="trapsGrid">
          <!-- Generowane z TRAPS -->
        </div>
      </div>

      <div style="margin-top:2.4rem">
        <h2>Macierz współwystępowania & opanowania</h2>
        <p class="lead">Wspólne zadania między modułami oraz Twój wynik. Kliknij komórkę, aby wybrać parę i rozpocząć trening.</p>
        <div class="card"><div class="matrix-wrap"><div id="matrix"></div></div></div>
      </div>`;

    const panel = $('#panel');
    const g = renderGraph($('#bigGraph'), { type: 'questions', mode: 'select', draw: true, onNode: selNode, onEdge: selEdge });
    activeGraph = g;

    function renderTrapsList() {
      const filtered = TRAPS.filter(t => {
        if (currentTrapFilter === 'all') return true;
        return t.category === currentTrapFilter;
      });

      $('#trapsGrid').innerHTML = filtered.map(t => {
        const idx = TRAPS.indexOf(t);
        const isBedside = t.category === 'bedside';
        return `
          <button class="trap" data-t="${idx}" style="border-left-color:${isBedside ? 'var(--red)' : 'var(--amber)'}">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:.4rem;margin-bottom:.2rem">
              <span class="chip" style="font-size:.7rem;font-weight:800;border:0;color:${isBedside ? 'var(--red)' : 'var(--amber)'};background:${isBedside ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'}">
                ${isBedside ? '🚨 PRZYŁÓŻKOWA' : '⚠️ TESTOWA'}
              </span>
              <div class="pillrow" style="margin:0">
                ${t.mods.map(m => `<span class="chip m" style="color:${gOf(m).color};font-size:.7rem">[${m}]</span>`).join('')}
              </div>
            </div>
            <h4>${esc(t.t)}</h4>
            <span class="eq">${esc(t.eq)}</span>
            <span class="out" style="color:${isBedside ? 'var(--red)' : 'var(--amber)'}">→ ${esc(t.out)}</span>
          </button>
        `;
      }).join('');
    }

    renderTrapsList();

    $('#trapCatFilters').addEventListener('click', ev => {
      const btn = ev.target.closest('[data-tf]');
      if (!btn) return;
      currentTrapFilter = btn.dataset.tf;
      $$('#trapCatFilters [data-tf]').forEach(b => {
        const on = b === btn;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      renderTrapsList();
    });

    function applyMasteryFilter() {
      const onlyWrong = currentMasteryFilter === 'wrong';
      const modsWrong = new Set();
      $$('#matrix td[data-e]').forEach(td => {
        const [a, b] = td.dataset.e.split('|');
        const st = edgeStats(a, b);
        const keep = !onlyWrong || st.wrong > 0;
        td.style.opacity = keep ? '' : '.18';
        if (onlyWrong && st.wrong > 0) { modsWrong.add(a); modsWrong.add(b); }
      });
      if (onlyWrong) { g.pin(modsWrong.size ? [...modsWrong] : []); g.lit([...modsWrong]); }
      else { g.pin(null); g.lit([]); }
    }

    const mfBar = $('#masteryFilterBar');
    if (mfBar) {
      mfBar.addEventListener('click', ev => {
        const btn = ev.target.closest('[data-mf]');
        if (!btn) return;
        currentMasteryFilter = btn.dataset.mf;
        $$('#masteryFilterBar [data-mf]').forEach(b => {
          const on = b === btn;
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', String(on));
        });
        applyMasteryFilter();
      });
    }

    function intro() {
      g.pin(null);
      panel.innerHTML = `<div class="card">
        <h3>Jak czytać mapę pytań</h3>
        <p class="muted" style="margin:.4rem 0 .8rem">Wybierz moduł albo krawędź. Panel pokaże powiązane tematy, pułapki oraz statystyki Twoich odpowiedzi ze styku tych modułów.</p>
        <div class="legend" style="margin:0">
          ${Object.keys(GROUPS).map(k => `<span><i class="dot" style="background:${GROUPS[k].color}"></i>${GROUPS[k].short}</span>`).join('')}
          <span><i class="dot" style="background:var(--teal)"></i>pułapka kliniczna</span>
          <span><i class="dot" style="border:2px dashed var(--muted);background:var(--surface)"></i>brak atlasu</span>
        </div>
      </div>`;
    }

    function selNode(id) {
      const m = modById[id];
      g.pin([id]);
      g.litNode(id);
      const conn = EDGES.filter(e => e.a === id || e.b === id).map(e => ({ o: e.a === id ? e.b : e.a, e })).sort((x, y) => y.e.w - x.e.w);
      panel.innerHTML = `<div class="card">
        <div class="pillrow">
          <span class="chip m" style="background:${gOf(id).color};color:var(--ink-inv);border:0">[${id}]</span>
          <span class="chip">${GROUPS[m.g].short}</span>
        </div>
        <h3 style="margin:.5rem 0 .2rem;font-size:1.3rem;font-family:var(--font-display)">${esc(m.n)}</h3>
        <p class="muted">${esc(m.d)}</p>
        <div class="acts" style="margin:.9rem 0">
          ${m.at ? `<a class="btn pri sm" href="#/atlas/${m.at}/${m.a}">Atlas</a>` : '<span class="chip">brak atlasu</span>'}
          <a class="btn sec sm" href="#/pytania?mods=${id}">Zadania (${modStats(id).total})</a>
          ${m.at ? `<a class="btn sec sm" href="#/trening?mods=${id}">Trening</a>` : ''}
        </div>
        <div class="flab" style="margin-bottom:.4rem">Powiązane moduły</div>
        <div class="pillrow">
          ${conn.map(c => {
            const st = edgeStats(c.e.a, c.e.b);
            const dotColor = st.status === 'ok' ? 'var(--green)' : st.status === 'bad' ? 'var(--red)' : st.status === 'warn' ? 'var(--amber)' : 'var(--muted)';
            return `<button class="tgl" data-e="${c.e.a}|${c.e.b}">[${c.o}] ${esc(SHORT[c.o])} <b>${c.e.w}</b> <i class="dot" style="background:${dotColor}"></i></button>`;
          }).join('') || '<span class="muted">brak</span>'}
        </div>
      </div>`;
    }

    function selEdge(k) {
      const e = E[k];
      if (!e) return;
      g.pin([e.a, e.b]);
      g.lit([e.a, e.b]);
      const st = edgeStats(e.a, e.b);

      const masteryHtml = st.att > 0
        ? `<div class="diff-box key-rule" style="margin:.7rem 0">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.3rem">
              <span style="font-weight:700;font-size:.84rem">Twój wynik ze styku:</span>
              <span class="chip" style="font-size:.72rem;background:${st.status === 'ok' ? 'var(--green-l)' : st.status === 'bad' ? 'var(--red-l)' : 'var(--amber-l)'};color:${st.status === 'ok' ? 'var(--green)' : st.status === 'bad' ? 'var(--red)' : 'var(--amber)'};border:0;font-weight:800">
                ${st.status === 'ok' ? '🟢 Opanowane' : st.status === 'bad' ? '🔴 Wymaga powtórki' : '🟡 W trakcie'} (${Math.round(st.rate * 100)}%)
              </span>
            </div>
            <div class="muted" style="font-size:.8rem">Rozwiązane: <b>${st.att}</b> / ${st.total} (Poprawne: ${st.ok}, Błędne: ${st.wrong})</div>
          </div>`
        : `<div class="diff-box" style="margin:.7rem 0;background:var(--bg)">
            <span class="muted" style="font-size:.82rem">Jeszcze nie rozwiązywałeś zadań łączących te dwa moduły.</span>
          </div>`;

      panel.innerHTML = `<div class="card">
        <div class="pillrow">
          <span class="chip m" style="background:${gOf(e.a).color};color:var(--ink-inv);border:0">[${e.a}]</span>
          <span aria-hidden="true">↔</span>
          <span class="chip m" style="background:${gOf(e.b).color};color:var(--ink-inv);border:0">[${e.b}]</span>
        </div>
        <h3 style="margin:.5rem 0;font-size:1.15rem">${esc(SHORT[e.a])} ↔ ${esc(SHORT[e.b])}</h3>
        <p><b>${e.w}</b> ${e.w === 1 ? 'zadanie łączy' : 'zadań łączy'} oba moduły.</p>

        ${masteryHtml}

        ${e.traps.map(t => `
          <div class="trap on" style="margin-top:.6rem;cursor:default;border-left-color:${t.category === 'bedside' ? 'var(--red)' : 'var(--amber)'}">
            <div style="font-size:.72rem;font-weight:800;color:${t.category === 'bedside' ? 'var(--red)' : 'var(--amber)'};margin-bottom:.2rem">
              ${t.category === 'bedside' ? '🚨 ZAGROŻENIE ŻYCIA' : '⚠️ PUŁAPKA TESTOWA'}
            </div>
            <h4>${esc(t.t)}</h4>
            <span class="eq">${esc(t.eq)}</span>
            <span class="out">→ ${esc(t.out)}</span>
            <span class="eq">${esc(t.tip)}</span>
          </div>
        `).join('')}

        <div class="acts" style="margin-top:.9rem">
          ${e.w ? `<a class="btn pri sm" href="#/trening?mods=${e.a},${e.b}">Ćwicz styk (${e.w})</a>` : ''}
          ${st.wrong ? `<a class="btn sec sm" href="#/trening?mods=${e.a},${e.b}&wrong=1" style="color:var(--red)">Błędne (${st.wrong})</a>` : ''}
          ${e.w ? `<a class="btn sec sm" href="#/pytania?mods=${e.a},${e.b}&all=1">Baza pytań</a>` : ''}
          <button class="btn sec sm" id="clr">Wyczyść</button>
        </div>
      </div>`;

      const c = $('#clr');
      if (c) c.onclick = () => { intro(); g.lit([]); };
    }

    panel.addEventListener('click', ev => {
      const b = ev.target.closest('[data-e]');
      if (b) selEdge(b.dataset.e);
    });

    $('#trapsGrid').addEventListener('click', ev => {
      const b = ev.target.closest('[data-t]');
      if (!b) return;
      const t = TRAPS[+b.dataset.t];
      $$('#trapsGrid .trap').forEach(x => x.classList.toggle('on', x === b));
      g.pin(t.mods);
      g.lit(t.mods);

      const isBedside = t.category === 'bedside';
      panel.innerHTML = `<div class="card">
        <div style="font-size:.72rem;font-weight:800;color:${isBedside ? 'var(--red)' : 'var(--amber)'};margin-bottom:.25rem">
          ${isBedside ? '🚨 PRZYŁÓŻKOWE ZAGROŻENIE ŻYCIA' : '⚠️ PUŁAPKA TESTOWA (KLUCZ VS WYTYCZNE)'}
        </div>
        <h3 style="font-size:1.3rem;font-family:var(--font-display);margin-bottom:.4rem">${esc(t.t)}</h3>
        <p>${esc(t.eq)}</p>
        <p style="color:${isBedside ? 'var(--red)' : 'var(--amber)'};font-weight:800;margin:.4rem 0">→ ${esc(t.out)}</p>
        <p class="muted">${esc(t.tip)}</p>
        <div class="acts" style="margin-top:.9rem">
          <a class="btn pri sm" href="#/trening?mods=${t.mods.join(',')}">Ćwicz pytania z tej pułapki</a>
          ${t.mods.map(m => modById[m].at ? `<a class="btn sec sm" href="#/atlas/${modById[m].at}/${modById[m].a}">[${m}] ${esc(SHORT[m])}</a>` : `<span class="chip">[${m}] · brak atlasu</span>`).join('')}
        </div>
      </div>`;

      if (innerWidth < 1000) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Macierz współwystępowania & opanowania
    const ids = MODS.map(m => m.id);
    const mx = Math.max(...EDGES.map(e => e.w));

    $('#matrix').innerHTML = `<table class="matrix">
      <tr><th></th>${ids.map(i => `<th style="color:${gOf(i).color}">${i}</th>`).join('')}</tr>
      ${ids.map((r, ri) => `
        <tr>
          <th style="text-align:right;color:${gOf(r).color}">${r}</th>
          ${ids.map((c, ci) => {
            if (ci > ri) return '<td></td>';
            if (ci === ri) return `<td style="background:${gOf(r).soft}"></td>`;
            const e = E[edgeKey(r, c)];
            const w = e ? e.w : 0;
            if (!w) return `<td style="background:var(--line-2)"></td>`;

            const st = edgeStats(r, c);
            let cellBg = `rgba(12,122,133,${(.14 + .86 * w / mx).toFixed(2)})`;
            let cellColor = w / mx > .5 ? 'var(--on-accent)' : 'var(--ink-2)';

            if (st.att > 0) {
              if (st.status === 'ok') { cellBg = 'var(--green-l)'; cellColor = 'var(--ink)'; }
              else if (st.status === 'bad') { cellBg = 'var(--red-l)'; cellColor = 'var(--ink)'; }
              else { cellBg = 'var(--amber-l)'; cellColor = 'var(--ink)'; }
            }

            return `<td data-e="${e ? e.a + '|' + e.b : ''}" style="background:${cellBg};color:${cellColor};cursor:pointer" title="[${r}] ↔ [${c}]: ${w} pytań${st.att > 0 ? ` (Wynik: ${Math.round(st.rate * 100)}%)` : ''}">${w}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </table>`;

    $('#matrix').addEventListener('click', ev => {
      const td = ev.target.closest('td[data-e]');
      if (td && td.dataset.e) selEdge(td.dataset.e);
    });

    intro();
    if (activeClusterId) {
      const cluster = (SYMPTOM_CLUSTERS || []).find(x => x.id === activeClusterId);
      if (cluster) g.litCluster(cluster.mods);
    } else if (params.mod && modById[params.mod]) {
      selNode(params.mod);
    } else if (params.trap != null && TRAPS[+params.trap]) {
      const b = $(`#trapsGrid [data-t="${+params.trap}"]`);
      if (b) b.click();
    }
  }

  // Przełączanie zakładek
  $$('.conn-tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab === activeTab) return;
      activeTab = tab;
      $$('.conn-tab-btn[data-tab]').forEach(b => {
        const isActive = b.dataset.tab === tab;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      if (tab === 'atlas') renderAtlasMap();
      else renderQuestionsMap();
    });
  });

  if (activeTab === 'atlas') renderAtlasMap();
  else renderQuestionsMap();
}

/* ---------- KNOWLEDGE GRAPH (Graf wiedzy & Luki semantyczne OB/GYN) ---------- */
const KG_DATA = (function () {
  const nodes = [
    // --- KLASTER A: Stany nagłe OB/GYN (var(--red)) ---
    { id: 'm1',  type: 'mod', mid: '1', n: 'Krwotok PPH i łożysko',      g: 'A', x: 250, y: 120 },
    { id: 'm2',  type: 'mod', mid: '2', n: 'Preeklampsja / HELLP',       g: 'A', x: 145, y: 215 },
    { id: 'm3',  type: 'mod', mid: '3', n: 'Ektopowa / ostry brzuch',    g: 'A', x: 355, y: 215 },
    { id: 'd_pph',  type: 'dis',  n: 'Atonia macicy (4T)',               g: 'A', x: 245, y: 210, icon: '4T' },
    { id: 'd_loz',  type: 'dis',  n: 'Łożysko przodujące',               g: 'A', x: 380, y: 115, icon: 'ŁP' },
    { id: 'p_mgso4',type: 'proc', n: 'Protokół MgSO₄ i.v.',              g: 'A', x: 115, y: 115, icon: 'Mg' },
    { id: 'b_bhcg', type: 'diag', n: 'β-hCG + USG TV',                   g: 'A', x: 430, y: 280, icon: 'USG' },

    // --- KLASTER B: Położnictwo fizjologiczne i patologia ciąży (var(--amber)) ---
    { id: 'm4',  type: 'mod', mid: '4', n: 'Fizjologia i opieka MZ',     g: 'B', x: 615, y: 120 },
    { id: 'm5',  type: 'mod', mid: '5', n: 'Poród, KTG i połóg',         g: 'B', x: 760, y: 145 },
    { id: 'm6',  type: 'mod', mid: '6', n: 'GDM i cholestaza',           g: 'B', x: 645, y: 245 },
    { id: 'm7',  type: 'mod', mid: '7', n: 'Poród przedwczesny / Rh',    g: 'B', x: 790, y: 265 },
    { id: 'b_ktg',  type: 'diag', n: 'Zapis KTG (FIGO 2015)',            g: 'B', x: 525, y: 175, icon: 'KTG' },
    { id: 'b_ogtt', type: 'diag', n: 'Test OGTT 75g (PTGiP)',            g: 'B', x: 540, y: 270, icon: 'OGT' },
    { id: 'p_antyd',type: 'proc', n: 'Profilaktyka anty-D',              g: 'B', x: 840, y: 195, icon: 'Rh' },

    // --- KLASTER C: Ginekologia endokrynologiczna, rozród i zakażenia (var(--blue)) ---
    { id: 'm8',  type: 'mod', mid: '8', n: 'PCOS i AUB (PALM-COEIN)',    g: 'C', x: 610, y: 455 },
    { id: 'm9',  type: 'mod', mid: '9', n: 'Endometrioza, mięśniaki, PID', g: 'C', x: 765, y: 465 },
    { id: 'm10', type: 'mod', mid: '10',n: 'Antykoncepcja i MHT',        g: 'C', x: 685, y: 585 },
    { id: 'd_pid',  type: 'dis',  n: 'Zapalenie przydatków (PID)',       g: 'C', x: 525, y: 525, icon: 'PID' },
    { id: 'b_horm', type: 'diag', n: 'Panel FSH/LH/PRL/AMH',             g: 'C', x: 810, y: 560, icon: 'LAB' },

    // --- KLASTER D: Onkologia ginekologiczna i patologia szyjki (var(--violet)) ---
    { id: 'm11', type: 'mod', mid: '11',n: 'Profilaktyka HPV i szyjka',  g: 'D', x: 185, y: 455 },
    { id: 'm12', type: 'mod', mid: '12',n: 'Endometrium, jajnik, GTD',   g: 'D', x: 335, y: 475 },
    { id: 'b_beth', type: 'diag', n: 'Cytologia Bethesda / HR-HPV',      g: 'D', x: 140, y: 565, icon: 'HPV' },
    { id: 'b_iota', type: 'diag', n: 'Reguły USG IOTA / RMI',            g: 'D', x: 385, y: 575, icon: 'RMI' },
    { id: 'd_gtd',  type: 'dis',  n: 'Zaśniad groniasty (GTD)',          g: 'D', x: 265, y: 585, icon: 'GTD' }
  ];

  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

  const edges = [
    { from: 'm1', to: 'd_pph' }, { from: 'm1', to: 'd_loz' }, { from: 'm1', to: 'm5' },
    { from: 'm2', to: 'p_mgso4' }, { from: 'm2', to: 'm6' }, { from: 'm2', to: 'b_ktg' },
    { from: 'm3', to: 'b_bhcg' }, { from: 'm3', to: 'm9' },
    { from: 'm4', to: 'm5' }, { from: 'm4', to: 'b_ogtt' }, { from: 'm4', to: 'p_antyd' },
    { from: 'm5', to: 'b_ktg' }, { from: 'm6', to: 'b_ogtt' }, { from: 'm7', to: 'p_antyd' }, { from: 'm7', to: 'p_mgso4' },
    { from: 'm8', to: 'b_horm' }, { from: 'm8', to: 'm10' }, { from: 'm9', to: 'd_pid' }, { from: 'm9', to: 'm3' },
    { from: 'm11', to: 'b_beth' }, { from: 'm12', to: 'b_iota' }, { from: 'm12', to: 'd_gtd' }, { from: 'd_gtd', to: 'b_bhcg' }
  ];

  const gapEdges = [
    { from: 'd_loz', to: 'm5',   gapId: 'gap-1' },
    { from: 'm2',    to: 'm1',   gapId: 'gap-2' },
    { from: 'm3',    to: 'd_gtd',gapId: 'gap-3' },
    { from: 'm7',    to: 'm2',   gapId: 'gap-4' },
    { from: 'm8',    to: 'm12',  gapId: 'gap-5' },
    { from: 'm9',    to: 'm3',   gapId: 'gap-6' }
  ];

  return { nodes, edges, gapEdges, nodeById };
})();

function viewKnowledgeGraph(parts, params) {
  main.innerHTML = `<section class="blk" style="border:0"><div class="wrap">
    
    <h2>Globalna mapa pojęć i mostów myślowych</h2>
    <p class="lead">Połączona sieć 12 modułów ginekologii i położnictwa, badań oraz procedur ratunkowych. Pulsujące linie przerywane wskazują luki semantyczne i pułapki egzaminacyjne PTGiP/LEK.</p>

    <div class="kg-wrap">
      <div class="kg-canvas-card">
        <div class="kg-toolbar">
          <div class="kg-filter-group" id="kgFilters">
            <button class="kg-filter-btn active" data-filter="all">🔘 Wszystkie (34)</button>
            <button class="kg-filter-btn" data-filter="mod">📚 Moduły (17)</button>
            <button class="kg-filter-btn" data-filter="dis">🩺 Choroby (11)</button>
            <button class="kg-filter-btn" data-filter="diag">🔬 Badania (6)</button>
            <button class="kg-filter-btn" data-filter="gaps" style="border-color:var(--teal);color:var(--teal-d);font-weight:800">💡 Luki wiedzy (8)</button>
          </div>
          <div style="display:flex;align-items:center;gap:.4rem">
            <input type="search" id="kgSearch" placeholder="Szukaj encji..." style="border:1.5px solid var(--line);border-radius:999px;padding:.28rem .75rem;font-size:.8rem;background:var(--surface);color:var(--ink);outline:none">
            <button class="btn sec sm" id="kgResetBtn" style="padding:.28rem .65rem;font-size:.78rem">↺ Reset</button>
          </div>
        </div>
        <div id="kgSvgHost"></div>
      </div>
      <div class="sticky"><div id="kgInspector"></div></div>
    </div>
  </div></section>

  <section class="blk"><div class="wrap">
    <div class="eyebrow">Analiza pułapek klinicznych</div>
    <h2>💡 8 Kluczowych luk semantycznych (Mosty myślowe)</h2>
    <p class="lead">Kliknij dowolną kartę, aby podświetlić most wiedzy na grafie i otworzyć dedykowaną analizę patomechanizmu oraz pułapki egzaminacyjnej.</p>
    <div class="agrid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))" id="kgGapsGrid">
      ${(SEMANTIC_GAPS || []).map((g, idx) => `
        <button type="button" class="kg-gap-card-box" data-gap="${g.id}">
          <span style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem">
            <span class="kg-gap-badge">Most #${idx + 1}</span>
            <span class="pillrow" style="margin:0">
              ${g.mods.map(m => `<span class="chip m" style="color:${gOf(m).color};font-size:.72rem">[${m}]</span>`).join('')}
            </span>
          </span>
          <strong style="display:block;font-size:1.02rem;margin-bottom:.35rem">${esc(g.title)}</strong>
          <span class="muted" style="display:block;font-size:.84rem;line-height:1.4">${esc(g.clinicalReason.slice(0, 130))}…</span>
          <span style="display:block;margin-top:.7rem;font-size:.8rem;color:var(--teal-d);font-weight:700">Pokaż na grafie & szczegóły →</span>
        </button>
      `).join('')}
    </div>
  </div></section>`;

  const svgHost = $('#kgSvgHost');
  const inspector = $('#kgInspector');
  const { nodes, edges, gapEdges, nodeById } = KG_DATA;
  const gapById = Object.fromEntries((SEMANTIC_GAPS || []).map(g => [g.id, g]));

  // Renderowanie SVG
  function renderSvg(filter = 'all', filterTerm = '') {
    const term = norm(filterTerm);

    const isNodeVisible = (n) => {
      if (term && !norm(n.n).includes(term) && !norm(n.mid || '').includes(term)) return false;
      if (filter === 'all') return true;
      if (filter === 'mod') return n.type === 'mod';
      if (filter === 'dis') return n.type === 'dis';
      if (filter === 'diag') return n.type === 'diag' || n.type === 'proc';
      if (filter === 'gaps') {
        return gapEdges.some(ge => ge.from === n.id || ge.to === n.id);
      }
      return true;
    };

    // Oblicz krawędzie stałe
    const renderedEdges = edges.map(e => {
      const p1 = nodeById[e.from], p2 = nodeById[e.to];
      if (!p1 || !p2) return '';
      const visible = filter !== 'gaps' && isNodeVisible(p1) && isNodeVisible(p2);
      return `<line class="kg-edge" data-e="${e.from}|${e.to}" data-from="${e.from}" data-to="${e.to}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" style="${visible ? '' : 'display:none'}" />`;
    }).join('');

    // Oblicz krawędzie przerywane (luki semantyczne)
    const renderedGaps = gapEdges.map(e => {
      const p1 = nodeById[e.from], p2 = nodeById[e.to];
      if (!p1 || !p2) return '';
      const gap = gapById[e.gapId];
      // Łuk krzywej Beziera wygięty w stronę środka (480, 360)
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      const kx = mx + (480 - mx) * 0.35, ky = my + (360 - my) * 0.35;
      const d = `M ${p1.x} ${p1.y} Q ${kx.toFixed(1)} ${ky.toFixed(1)} ${p2.x} ${p2.y}`;
      const visible = isNodeVisible(p1) || isNodeVisible(p2) || filter === 'all' || filter === 'gaps';
      return `<g class="kg-gap-group" data-gap="${e.gapId}" style="${visible ? '' : 'display:none'}">
        <path class="kg-edge dashed gap-pulse" data-gap="${e.gapId}" data-from="${e.from}" data-to="${e.to}" d="${d}" />
        <path d="${d}" fill="none" stroke="transparent" stroke-width="24" style="cursor:pointer" data-hitgap="${e.gapId}">
          <title>Most wiedzy: ${gap ? esc(gap.title) : ''}</title>
        </path>
      </g>`;
    }).join('');

    // Oblicz węzły
    const renderedNodes = nodes.map(n => {
      const visible = isNodeVisible(n);
      const grp = GROUPS[n.g] || GROUPS.A;
      const displayStyle = visible ? '' : 'display:none';

      if (n.type === 'mod') {
        return `<g class="kg-node" data-nid="${n.id}" data-type="mod" data-mid="${n.mid}" tabindex="0" role="button" aria-label="Moduł ${n.mid}: ${esc(n.n)}" style="${displayStyle}">
          <circle cx="${n.x}" cy="${n.y}" r="22" fill="${grp.color}" stroke="${grp.color}" stroke-width="2.5" />
          <text x="${n.x}" y="${n.y + 1}" font-size="12px" font-weight="800" fill="var(--ink-inv)" text-anchor="middle" dominant-baseline="central" pointer-events="none">${n.mid}</text>
          <text x="${n.x}" y="${n.y + 36}" font-size="11.5px" font-weight="700" fill="var(--ink-2)" text-anchor="middle" pointer-events="none">${esc(SHORT[n.mid] || n.n)}</text>
        </g>`;
      } else if (n.type === 'dis') {
        return `<g class="kg-node" data-nid="${n.id}" data-type="dis" tabindex="0" role="button" aria-label="Choroba: ${esc(n.n)}" style="${displayStyle}">
          <rect x="${n.x - 22}" y="${n.y - 18}" width="44" height="36" rx="10" fill="var(--surface)" stroke="${grp.color}" stroke-width="2.2" />
          <text x="${n.x}" y="${n.y + 1}" font-size="16px" text-anchor="middle" dominant-baseline="central" pointer-events="none">${n.icon || '🩺'}</text>
          <text x="${n.x}" y="${n.y + 32}" font-size="10.5px" font-weight="700" fill="var(--ink)" text-anchor="middle" pointer-events="none">${esc(n.n.length > 18 ? n.n.slice(0, 16) + '…' : n.n)}</text>
        </g>`;
      } else {
        return `<g class="kg-node" data-nid="${n.id}" data-type="${n.type}" tabindex="0" role="button" aria-label="Badanie/Procedura: ${esc(n.n)}" style="${displayStyle}">
          <circle cx="${n.x}" cy="${n.y}" r="17" fill="var(--bg)" stroke="var(--line-2)" stroke-width="2" />
          <text x="${n.x}" y="${n.y + 1}" font-size="9.5px" font-weight="800" fill="var(--ink)" text-anchor="middle" dominant-baseline="central" pointer-events="none">${esc(n.icon || 'OB')}</text>
          <text x="${n.x}" y="${n.y + 28}" font-size="10px" font-weight="700" fill="var(--muted)" text-anchor="middle" pointer-events="none">${esc(n.n.length > 18 ? n.n.slice(0, 16) + '…' : n.n)}</text>
        </g>`;
      }
    }).join('');

    svgHost.innerHTML = `
      <svg class="kg-svg" viewBox="-10 -10 960 720" role="group" aria-label="Graf wiedzy klinicznej">
        <!-- Tła klastrów -->
        <rect x="20" y="20" width="440" height="320" rx="20" fill="var(--red)" opacity="0.04" pointer-events="none" />
        <text x="35" y="45" font-size="11px" font-weight="800" fill="var(--red)" letter-spacing="0.06em" opacity="0.72">KLASTER A · STANY NAGŁE OB/GYN</text>

        <rect x="480" y="20" width="440" height="320" rx="20" fill="var(--amber)" opacity="0.04" pointer-events="none" />
        <text x="495" y="45" font-size="11px" font-weight="800" fill="var(--amber)" letter-spacing="0.06em" opacity="0.72">KLASTER B · POŁOŻNICTWO I KTG</text>

        <rect x="480" y="360" width="440" height="320" rx="20" fill="var(--blue)" opacity="0.04" pointer-events="none" />
        <text x="495" y="385" font-size="11px" font-weight="800" fill="var(--blue)" letter-spacing="0.06em" opacity="0.72">KLASTER C · GINEKOLOGIA I ROZRÓD</text>

        <rect x="20" y="360" width="440" height="320" rx="20" fill="var(--violet)" opacity="0.04" pointer-events="none" />
        <text x="35" y="385" font-size="11px" font-weight="800" fill="var(--violet)" letter-spacing="0.06em" opacity="0.72">KLASTER D · ONKOLOGIA GINEKOLOGICZNA</text>

        <!-- Krawędzie -->
        <g class="kg-edges">${renderedEdges}</g>
        <g class="kg-gaps">${renderedGaps}</g>
        <!-- Węzły -->
        <g class="kg-nodes">${renderedNodes}</g>
      </svg>
    `;

    bindSvgEvents();
  }

  function bindSvgEvents() {
    const svg = $('svg.kg-svg', svgHost);
    if (!svg) return;

    const clearHighlight = () => {
      svg.classList.remove('hl');
      $$('.on', svg).forEach(el => el.classList.remove('on'));
      $$('.selected', svg).forEach(el => el.classList.remove('selected'));
    };

    const highlightNode = (nid) => {
      clearHighlight();
      svg.classList.add('hl');
      const connNodes = new Set([nid]);

      $$('.kg-edge', svg).forEach(ed => {
        const from = ed.dataset.from, to = ed.dataset.to;
        if (from === nid || to === nid) {
          ed.classList.add('on');
          connNodes.add(from);
          connNodes.add(to);
        }
      });

      $$('.kg-node', svg).forEach(nd => {
        if (connNodes.has(nd.dataset.nid)) nd.classList.add('on');
      });
    };

    // Hover na węzłach
    $$('.kg-node', svg).forEach(nd => {
      const nid = nd.dataset.nid;
      nd.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') highlightNode(nid); });
      nd.addEventListener('pointerleave', e => { if (e.pointerType !== 'mouse') return; if (!pinnedEntity) clearHighlight(); else restorePinned(); });
      nd.addEventListener('click', () => selKgNode(nid));
      nd.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selKgNode(nid); } });
    });

    // Kliknięcie w linię przerywaną (lukę)
    $$('[data-hitgap]', svg).forEach(hit => {
      hit.addEventListener('click', () => selKgGap(hit.dataset.hitgap));
      hit.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse') return;
        const gid = hit.dataset.hitgap;
        clearHighlight();
        svg.classList.add('hl');
        const gapEl = $(`path.kg-edge[data-gap="${gid}"]`, svg);
        if (gapEl) {
          gapEl.classList.add('on');
          const from = gapEl.dataset.from, to = gapEl.dataset.to;
          $$(`.kg-node[data-nid="${from}"], .kg-node[data-nid="${to}"]`, svg).forEach(x => x.classList.add('on'));
        }
      });
      hit.addEventListener('pointerleave', e => { if (e.pointerType !== 'mouse') return; if (!pinnedEntity) clearHighlight(); else restorePinned(); });
    });
  }

  let pinnedEntity = null; // { type: 'node'|'gap', id: '...' }

  function restorePinned() {
    const svg = $('svg.kg-svg', svgHost);
    if (!svg) return;
    svg.classList.remove('hl');
    $$('.on', svg).forEach(el => el.classList.remove('on'));
    if (!pinnedEntity) return;

    svg.classList.add('hl');
    if (pinnedEntity.type === 'node') {
      const nid = pinnedEntity.id;
      const targetNode = $(`.kg-node[data-nid="${nid}"]`, svg);
      if (targetNode) targetNode.classList.add('selected', 'on');
      $$('.kg-edge', svg).forEach(ed => {
        if (ed.dataset.from === nid || ed.dataset.to === nid) {
          ed.classList.add('on');
          const other = ed.dataset.from === nid ? ed.dataset.to : ed.dataset.from;
          const onEl = $(`.kg-node[data-nid="${other}"]`, svg);
          if (onEl) onEl.classList.add('on');
        }
      });
    } else if (pinnedEntity.type === 'gap') {
      const gid = pinnedEntity.id;
      const gapEl = $(`path.kg-edge[data-gap="${gid}"]`, svg);
      if (gapEl) {
        gapEl.classList.add('on');
        const from = gapEl.dataset.from, to = gapEl.dataset.to;
        $$(`.kg-node[data-nid="${from}"], .kg-node[data-nid="${to}"]`, svg).forEach(x => x.classList.add('selected', 'on'));
      }
    }
  }

  function introInspector() {
    pinnedEntity = null;
    restorePinned();
    inspector.innerHTML = `<div class="card">
      <h3 style="font-family:var(--font-display);font-size:1.25rem;margin:.2rem 0 .5rem">Eksploracja sieci pojęć OB/GYN</h3>
      <p class="muted" style="font-size:.88rem;line-height:1.45;margin-bottom:1rem">
        Graf wizualizuje ${KG_DATA.nodes.length} kluczowych encji programu ginekologii i położnictwa oraz ${SEMANTIC_GAPS.length} krytycznych mostów klinicznych.
      </p>
      <div style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.2rem">
        <div style="font-size:.84rem;display:flex;align-items:center;gap:.45rem"><span class="dot" style="background:var(--red)"></span> <b>Klaster A</b>: Stany nagłe OB/GYN (PPH, PE, ektopowa)</div>
        <div style="font-size:.84rem;display:flex;align-items:center;gap:.45rem"><span class="dot" style="background:var(--amber)"></span> <b>Klaster B</b>: Położnictwo, KTG, GDM i poród przedwczesny</div>
        <div style="font-size:.84rem;display:flex;align-items:center;gap:.45rem"><span class="dot" style="background:var(--blue)"></span> <b>Klaster C</b>: Endokrynologia, rozród, endometrioza, PID</div>
        <div style="font-size:.84rem;display:flex;align-items:center;gap:.45rem"><span class="dot" style="background:var(--violet)"></span> <b>Klaster D</b>: Onkologia ginekologiczna, HPV i GTD</div>
      </div>
      <div style="padding:.75rem;background:var(--bg);border-radius:var(--r);border:1px solid var(--line);font-size:.82rem;line-height:1.4">
        <b>Wskazówka:</b> Kliknij linię przerywaną lub wybierz filtr <b>„Luki wiedzy”</b>, aby przeanalizować najczęstsze pułapki na styku modułów.
      </div>
    </div>`;
  }

  function selKgNode(nid) {
    const n = nodeById[nid];
    if (!n) return;
    pinnedEntity = { type: 'node', id: nid };
    restorePinned();

    const isMod = n.type === 'mod';
    const m = isMod ? modById[n.mid] : null;
    const grp = GROUPS[n.g] || GROUPS.A;

    // Znajdź połączone encje
    const neighbors = [];
    edges.forEach(e => {
      if (e.from === nid) neighbors.push(nodeById[e.to]);
      if (e.to === nid) neighbors.push(nodeById[e.from]);
    });
    const connectedGaps = gapEdges.filter(ge => ge.from === nid || ge.to === nid).map(ge => gapById[ge.gapId]).filter(Boolean);

    inspector.innerHTML = `<div class="card">
      <div class="pillrow">
        <span class="chip" style="background:${grp.color};color:var(--ink-inv);border:0">${isMod ? 'Moduł [' + n.mid + ']' : (n.type === 'dis' ? 'Choroba' : 'Badanie')}</span>
        <span class="chip">${grp.short}</span>
      </div>
      <h3 style="margin:.5rem 0 .2rem;font-size:1.3rem;font-family:var(--font-display)">${esc(n.n)}</h3>
      <p class="muted" style="font-size:.88rem;line-height:1.4">${m ? esc(m.d) : 'Węzeł wiedzy klinicznej zintegrowany z modułami i badaniami.'}</p>

      <div class="acts" style="margin:.9rem 0">
        ${m && m.at ? `<a class="btn pri sm" href="#/atlas/${m.at}/${m.a}">Otwórz atlas →</a>` : ''}
        ${m ? `<a class="btn sec sm" href="#/trening?mods=${m.id}">Trening</a><a class="btn sec sm" href="#/pytania?mods=${m.id}">Zadania (${modStats(m.id).total})</a>` : ''}
        <button class="btn sec sm" id="kgClearPin">Odznacz</button>
      </div>

      ${connectedGaps.length ? `
        <div style="margin-top:1rem">
          <div class="flab">Luki wiedzy związane z tym węzłem</div>
          <div class="link-list">
            ${connectedGaps.map(g => `
              <button class="link-item" data-showgap="${g.id}" type="button">
                <div class="link-item-header">
                  <span class="link-item-title" style="color:var(--teal)">💡 ${esc(g.title)}</span>
                </div>
                <div class="link-item-concept">${esc(g.clinicalReason.slice(0, 100))}…</div>
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div style="margin-top:1rem">
        <div class="flab">Powiązane pojęcia (${neighbors.length})</div>
        <div class="pillrow" style="margin-top:.4rem">
          ${neighbors.map(nb => `
            <button class="tgl" data-jump="${nb.id}" style="font-size:.8rem;padding:.2rem .6rem">
              ${nb.type === 'mod' ? `[${nb.mid}] ${esc(SHORT[nb.mid])}` : esc(nb.n)}
            </button>
          `).join('') || '<span class="muted" style="font-size:.84rem">Brak bezpośrednich połączeń.</span>'}
        </div>
      </div>
    </div>`;

    const clr = $('#kgClearPin', inspector);
    if (clr) clr.onclick = introInspector;
    $$('[data-showgap]', inspector).forEach(b => b.onclick = () => selKgGap(b.dataset.showgap));
    $$('[data-jump]', inspector).forEach(b => b.onclick = () => selKgNode(b.dataset.jump));
  }

  function selKgGap(gid) {
    const gap = gapById[gid];
    if (!gap) return;
    pinnedEntity = { type: 'gap', id: gid };
    restorePinned();

    inspector.innerHTML = `<div class="card" style="border-top:4px solid var(--teal)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:.4rem;margin-bottom:.4rem">
        <span class="kg-gap-badge">💡 Luka semantyczna</span>
        <div class="pillrow" style="margin:0">
          ${gap.mods.map(m => `<span class="chip m" style="color:${gOf(m).color};font-size:.72rem">[${m}]</span>`).join('')}
        </div>
      </div>
      <h3 style="font-family:var(--font-display);font-size:1.25rem;margin:.2rem 0 .5rem">${esc(gap.title)}</h3>
      <div style="font-size:.82rem;font-weight:700;color:var(--ink-2);margin-bottom:.8rem">
        ${esc(gap.fromName)} ⤏ ${esc(gap.toName)}
      </div>

      <div style="margin-bottom:.85rem">
        <div class="flab">Mechanizm kliniczny</div>
        <p style="font-size:.88rem;line-height:1.45;color:var(--ink)">${esc(gap.clinicalReason)}</p>
      </div>

      <div class="gap-exam-warning">
        <b>⚠️ Pułapka egzaminacyjna (PES/LEK):</b>
        <span>${esc(gap.examTrap)}</span>
      </div>

      <div class="acts" style="margin-top:1.1rem;display:flex;flex-direction:column;gap:.4rem">
        <a class="btn pri sm" href="#/trening?mods=${gap.mods.join(',')}" style="text-align:center">Ćwicz powiązane pytania w Treningu →</a>
        <div style="display:flex;gap:.4rem">
          <a class="btn sec sm" href="#/pytania?mods=${gap.mods.join(',')}&all=1" style="flex:1;text-align:center">Baza pytań</a>
          <button class="btn sec sm" id="kgClearGap" style="flex:none">Odznacz</button>
        </div>
      </div>
    </div>`;

    const clr = $('#kgClearGap', inspector);
    if (clr) clr.onclick = introInspector;
  }

  // Obsługa filtrów paska narzędzi
  let currentFilter = 'all';
  $$('.kg-filter-btn', svgHost.parentElement).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.kg-filter-btn').forEach(b => b.classList.toggle('active', b === btn));
      currentFilter = btn.dataset.filter;
      renderSvg(currentFilter, $('#kgSearch').value);
      restorePinned();
    });
  });

  $('#kgSearch').addEventListener('input', (e) => {
    renderSvg(currentFilter, e.target.value);
    restorePinned();
  });

  $('#kgResetBtn').onclick = () => {
    $('#kgSearch').value = '';
    $$('.kg-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
    currentFilter = 'all';
    renderSvg('all', '');
    introInspector();
  };

  // Kafelki luk na dole strony
  $('#kgGapsGrid').addEventListener('click', ev => {
    const card = ev.target.closest('[data-gap]');
    if (card && card.dataset.gap) {
      selKgGap(card.dataset.gap);
      inspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  renderSvg('all', '');
  introInspector();

  if (params.gap && gapById[params.gap]) {
    selKgGap(params.gap);
  } else if (params.node && nodeById[params.node]) {
    selKgNode(params.node);
  }
}


/* ---------- PARSER IMPORTU PYTAŃ ---------- */
/* ---------- BAZA PYTAŃ ---------- */
const F = { q: '', at: new Set(), mods: new Set(), banks: new Set(), all: false, conf: new Set(), gap: false, bm: false, wrong: false, hit: false, hasKey: false, hasWhy: false, searchWhy: false, quiz: true, advOpen: false, open: 'all', limit: 30, tab: getQStats().banks.zaklad ? 'zaklad' : 'browse', addMode: 'single' };
let parsedImportStash = [];

function viewQuestions(parts, params) {
  if (Object.keys(params).length) {
    F.q = params.q || ''; F.at = new Set((params.at || '').split(',').filter(Boolean)); F.mods = new Set((params.mods || '').split(',').filter(Boolean));
    F.banks = new Set((params.bank || '').split(',').filter(Boolean));
    F.all = !!params.all; F.conf = new Set((params.conf || '').split(',').filter(Boolean)); F.gap = !!params.gap; F.bm = !!params.bm; F.wrong = !!params.wrong;
    F.hit = !!params.hit; F.hasKey = !!params.hasKey; F.hasWhy = !!params.hasWhy; F.searchWhy = !!params.searchWhy; F.limit = 30;
    if (params.tab) F.tab = params.tab;
  }

  const zakladCount = getQStats().banks.zaklad || 0;
  main.innerHTML = `<section class="blk" style="border:0"><div class="wrap">
    <div class="eyebrow">Baza pytań i banki zewnętrzne</div><h2>${Q.length} zadań · Pula zakładowa, LEK, PES, MP</h2>
    <p class="lead">Przeglądaj pytania według banków, sprawdzaj klucze i omówienia lub twórz własne zadania testowe i importuj całe zestawy.</p>

    <div class="qtabs" id="qTabs">
      <button class="qtab zaklad-tab${F.tab === 'zaklad' ? ' on' : ''}" data-t="zaklad">🏛️ Pula Zakładowa (${zakladCount})</button>
      <button class="qtab${F.tab === 'browse' ? ' on' : ''}" data-t="browse">🔍 Wyszukiwarka pytań (${Q.length})</button>
      <button class="qtab${F.tab === 'add' ? ' on' : ''}" data-t="add">➕ Dodaj nowe pytanie / Import</button>
      <button class="qtab${F.tab === 'export' ? ' on' : ''}" data-t="export">📤 Eksport dodanych (${CUSTOM_Q.length})</button>
    </div>

    <div id="qTabContent"></div>
  </div></section>`;

  $('#qTabs').addEventListener('click', e => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    F.tab = b.dataset.t;
    $$('#qTabs .qtab').forEach(x => x.classList.toggle('on', x === b));
    renderTabContent();
  });

  renderTabContent();
}

function renderTabContent() {
  const container = $('#qTabContent');
  if (!container) return;

  if (F.tab === 'zaklad') {
    renderZakladTab(container);
  } else if (F.tab === 'browse') {
    renderBrowseTab(container);
  } else if (F.tab === 'add') {
    renderAddTab(container);
  } else if (F.tab === 'export') {
    renderExportTab(container);
  }
}

function renderZakladTab(container) {
  const tot = getQStats().banks.zaklad || 0;
  if (!tot) {
    container.innerHTML = `<div class="zd-banner">
      <div class="eyebrow" style="color:var(--amber)">Pulpit Puli Zakładowej</div>
      <h3 style="font-size:1.3rem;margin:.2rem 0 .5rem">Pula zakładowa jest obecnie wyłączona</h3>
      <p class="muted" style="margin-bottom:1rem">Plik zewnętrzny (<code>js/questions_zaklad.js</code>) został odpięty od startowego ładowania i zachowany jako kopia zapasowa. Wszystkie ${Q.length} aktywnych pytań klinicznych znajdziesz w wyszukiwarce oraz trybie treningu.</p>
      <div style="display:flex;flex-wrap:wrap;gap:.6rem">
        <button class="btn pri sm" id="zdGoBrowse">🔍 Przeglądaj aktywną bazę (${Q.length}) →</button>
        <a class="btn sec sm" href="#/trening">⚡ Uruchom trening →</a>
      </div>
    </div>`;
    $('#zdGoBrowse').onclick = () => {
      F.tab = 'browse';
      $$('#qTabs .qtab').forEach(x => x.classList.toggle('on', x.dataset.t === 'browse'));
      renderTabContent();
    };
    return;
  }

  const s4Qs = [];
  let att = 0, ok = 0, wrong = 0, hitsCount = 0, gapCountLocal = 0, openCount = 0, s4Ok = 0;
  const modCounts = Object.create(null);
  for (let i = 0; i < Q.length; i++) {
    const q = Q[i];
    if (q.bank !== 'zaklad') continue;
    const a = S.ans[q.id];
    if (a) { att++; if (a.last) ok++; else wrong++; }
    if (false) {
      s4Qs.push(q);
      if (a && a.last) s4Ok++;
    }
    if (q.reps >= 2) hitsCount++;
    if (q.gap) gapCountLocal++;
    if (q.type === 'open') openCount++;
    const ms = q.mods || [];
    for (let j = 0; j < ms.length; j++) modCounts[ms[j]] = (modCounts[ms[j]] || 0) + 1;
  }
  const fresh = tot - att;
  const pctMastered = Math.round((ok / tot) * 100);

  container.innerHTML = `
    <div class="zd-banner">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.6rem">
        <div>
          <div class="eyebrow" style="color:var(--amber)">Pulpit Puli Zakładowej</div>
          <h3 style="font-size:1.4rem;margin:.2rem 0">Opanowanie pytań z kolokwiów i zaliczeń</h3>
        </div>
        <div style="text-align:right">
          <span style="font-size:1.8rem;font-weight:800;color:var(--teal)">${pctMastered}%</span>
          <span class="muted" style="font-size:.84rem;display:block">opanowanej puli</span>
        </div>
      </div>

      <div class="zd-prog">
        <div class="zd-prog-bar">
          <div class="zd-prog-fill" style="width:${pctMastered}%"></div>
        </div>
      </div>

      <div class="zd-metrics">
        <div class="zd-mcard">
          <b style="color:var(--ink)">${tot}</b>
          <span>Wszystkie zadania</span>
        </div>
        <div class="zd-mcard">
          <b style="color:var(--green)">${ok}</b>
          <span>Opanowane (ostatnia ✓)</span>
        </div>
        <div class="zd-mcard">
          <b style="color:var(--red)">${wrong}</b>
          <span>Do powtórki (błędne)</span>
        </div>
        <div class="zd-mcard">
          <b style="color:var(--muted)">${fresh}</b>
          <span>Jeszcze nieruszone</span>
        </div>
      </div>
    </div>

    <!-- Szybki skok po numerze pytania Q... -->
    <div class="zd-jump-bar">
      <span style="font-weight:800;font-size:.9rem;white-space:nowrap">🎯 Szybki skok:</span>
      <input type="text" inputmode="search" enterkeyhint="search" class="zd-jump-input" id="zdJumpInput" placeholder="Wpisz nr pytania (np. 12, gp0005, nagle-ob-q1)…" aria-label="Skocz do pytania">
      <button class="btn sec sm" id="zdJumpBtn" style="font-weight:700">Otwórz pytanie →</button>
    </div>

    <!-- Kafelki dedykowanych trybów nauki -->
    <h3 style="margin:1.6rem 0 .5rem">Dedykowane tryby nauki</h3>
    <p class="muted" style="margin-bottom:1rem">Wybierz profil nauki dopasowany do Twojego etapu przygotowań do kolokwium lub egzaminu.</p>

    <div class="zd-modes-grid">
      ${s4Qs.length ? `
      <div class="zd-mode-card s4">
        <span class="zd-mode-title">📘 Baza S4 Pediatria 2026_27 <span class="zd-count">${s4Qs.length} pytań</span></span>
        <span class="zd-mode-desc">Komplet zadań pochodzących bezpośrednio z pliku <code>Baza S4 Pediatria 2026_27</code> (opanowane: ${s4Ok}/${s4Qs.length}).</span>
        <div class="zd-mode-acts">
          <button type="button" class="btn pri sm" style="background:var(--blue);border-color:var(--blue)" data-mode="s4">Trenuj zestaw →</button>
          <button type="button" class="btn sec sm" data-browse-src="Baza-S4-Pediatria-2026_27">Przeglądaj (${s4Qs.length})</button>
        </div>
      </div>
      ` : ''}

      <button type="button" class="zd-mode-card hit" data-mode="hits">
        <span class="zd-mode-title">🔥 Hity Zakładowe <span class="zd-count">${hitsCount} pytań</span></span>
        <span class="zd-mode-desc">Pytania powtórzone w co najmniej dwóch niezależnych rocznikach/zaliczeniach (2014–2026). Absolutny priorytet powtórkowy!</span>
        <span class="btn pri sm hit" aria-hidden="true">Trenuj Hity Zakładowe →</span>
      </button>

      <button type="button" class="zd-mode-card gap" data-mode="gap">
        <span class="zd-mode-title">⚠️ Pułapki i Rozbieżności <span class="zd-count">${gapCountLocal} pytań</span></span>
        <span class="zd-mode-desc">Zadania, w których klucz zakładowy różni się od współczesnych wytycznych. Dwutorowy panel: „Pod zaliczenie” vs „Klinicznie”.</span>
        <span class="btn pri sm" style="background:var(--amber-d);border-color:var(--amber-d)" aria-hidden="true">Ćwicz Rozbieżności →</span>
      </button>

      <button type="button" class="zd-mode-card marathon" data-mode="marathon">
        <span class="zd-mode-title">⚡ Maraton Zakładowy <span class="zd-count">25 pytań</span></span>
        <span class="zd-mode-desc">Losowa sesja 25 pytań z całej puli zakładowej w trybie nauki – natychmiastowe wyjaśnienie merytoryczne i analiza dystraktorów.</span>
        <span class="btn pri sm" aria-hidden="true">Rozpocznij Maraton →</span>
      </button>

      <button type="button" class="zd-mode-card flash" data-mode="flash">
        <span class="zd-mode-title">🃏 Fiszki Kliniczne <span class="zd-count">${openCount} pytań</span></span>
        <span class="zd-mode-desc">Pytania otwarte i rekonstrukcyjne – wymusza aktywne przypominanie (retrieval practice) przed odsłonięciem klucza i omówienia.</span>
        <span class="btn pri sm" aria-hidden="true">Uruchom Fiszki →</span>
      </button>

      ${wrong > 0 ? `
      <button type="button" class="zd-mode-card wrong" data-mode="wrong">
        <span class="zd-mode-title">❌ Koryguj Błędy <span class="zd-count" style="color:var(--red)">${wrong} do powtórki</span></span>
        <span class="zd-mode-desc">Sesja powtórkowa skupiona wyłącznie na zadaniach zakładowych, w których ostatnia odpowiedź była błędna.</span>
        <span class="btn pri sm" style="background:var(--red);border-color:var(--red)" aria-hidden="true">Powtórz błędy →</span>
      </button>
      ` : ''}
    </div>

    <!-- Modułowy rozkład pytań zakładowych -->
    <h3 style="margin:2rem 0 .5rem">Pula zakładowa wg modułów kursu</h3>
    <p class="muted" style="margin-bottom:1rem">Wybierz moduł, aby natychmiast uruchomić sesję treningową wyłącznie z pytań zakładowych z danego działu.</p>

    <div class="zd-mods-grid">
      ${MODS.map(m => {
        const qCount = modCounts[m.id] || 0;
        if (!qCount) return '';
        const g = gOf(m.id).color;
        return `<a class="zd-mod-pill" href="#/trening?mods=${m.id}&bank=zaklad" title="Rozpocznij trening z modułu ${m.id}: ${esc(m.n)}">
          <span class="m-badge" style="color:${g}">[${m.id}]</span>
          <span class="m-name">${esc(SHORT[m.id] || m.n)}</span>
          <span class="m-cnt">${qCount} Q</span>
        </a>`;
      }).join('')}
    </div>
  `;

  // Obsługa skoku po numerze pytania
  const doJump = () => {
    const val = $('#zdJumpInput').value.trim();
    if (!val) return;
    const m = val.match(/^#?q?(\d{1,4})$/i);
    if (!m) {
      toast('Wpisz poprawny numer pytania (np. 142, Q0500)');
      return;
    }
    const targetId = 'q' + m[1].padStart(4, '0');
    const found = qById[targetId];
    if (!found) {
      toast(`Nie znaleziono pytania ${targetId.toUpperCase()} w bazie`);
      return;
    }
    F.tab = 'browse';
    F.q = targetId;
    F.limit = 30;
    $$('#qTabs .qtab').forEach(x => x.classList.toggle('on', x.dataset.t === 'browse'));
    renderTabContent();
    const card = $(`#qlist details.qc[data-q="${targetId}"]`);
    if (card) card.scrollIntoView({ block: 'nearest' });
    toast(`Otwarto pytanie ${targetId.toUpperCase()}`);
  };

  $('#zdJumpBtn').onclick = doJump;
  $('#zdJumpInput').onkeydown = e => { if (e.key === 'Enter') doJump(); };

  // Obsługa kliknięć w kafelki trybów
  container.querySelectorAll('[data-mode]').forEach(card => {
    card.onclick = () => {
      const mode = card.dataset.mode;
      if (mode === 's4') {
        C.mode = 'learn';
        pendingRetryIds = s4Qs.map(q => q.id);
        SESSION = null;
        location.hash = '#/trening';
        return;
      }
      C.at = new Set(); C.mods = new Set(); C.conf = new Set();
      C.banks = new Set(['zaklad']);
      C.hitsOnly = mode === 'hits';
      C.gap = mode === 'gap';
      C.wrong = mode === 'wrong';
      C.bm = false; C.fresh = false;
      C.open = mode === 'flash';
      C.mode = mode === 'flash' ? 'flash' : 'learn';
      C.n = mode === 'wrong' ? 0 : (mode === 'flash' ? 20 : 25);
      SESSION = null;
      pendingAutoTrain = true;
      location.hash = '#/trening';
    };
  });
  container.querySelectorAll('[data-browse-src]').forEach(btn => {
    btn.onclick = () => {
      F.tab = 'browse';
      F.q = btn.dataset.browseSrc;
      F.at.clear(); F.mods.clear(); F.banks = new Set(['zaklad']);
      F.conf.clear(); F.gap = false; F.bm = false; F.wrong = false;
      F.hit = false; F.hasKey = false; F.hasWhy = false;
      F.limit = 50;
      $$('#qTabs .qtab').forEach(x => x.classList.toggle('on', x.dataset.t === 'browse'));
      renderTabContent();
    };
  });
}

function renderBrowseTab(container) {
  const stats = getQStats();
  const countAdv = () => F.conf.size + (F.all ? 1 : 0) + (F.hasKey ? 1 : 0) + (F.hasWhy ? 1 : 0) + (F.searchWhy ? 1 : 0);
  const advCnt = countAdv();
  container.innerHTML = `
    <div class="tool">
      <input class="field" id="fq" type="search" inputmode="search" enterkeyhint="search" placeholder="Szukaj po ID (np. q0042), w treści pytań, odpowiedziach lub omówieniach…" value="${esc(F.q)}" aria-label="Szukaj w pytaniach">
      <div class="frow"><span class="flab">Bank</span><div class="pillrow" id="fBank">${Object.keys(BANKS).map(b => `<button class="tgl" data-v="${b}" aria-pressed="${F.banks.has(b)}">${BANKS[b].icon} ${BANKS[b].short} (${stats.banks[b] || 0})</button>`).join('')}</div></div>
      <div class="frow"><span class="flab">Atlas</span><div class="pillrow" id="fAt">${ATLASES.map(a => `<button class="tgl" data-v="${a.id}" aria-pressed="${F.at.has(a.id)}">${a.tag} ${esc(ASHORT[a.id])}</button>`).join('')}</div></div>
      <div class="frow"><span class="flab">Moduł</span><div class="pillrow" id="fMod">${MODS.filter(m => stats.modsHit.has(m.id)).map(m => `<button class="tgl g" style="--gc:${gOf(m.id).color}" data-v="${m.id}" aria-pressed="${F.mods.has(m.id)}" title="Moduł ${m.id}: ${esc(m.n)}">[${m.id}] ${esc(SHORT[m.id] || m.n)}</button>`).join('')}</div></div>
      <div class="frow" id="fFlag"><span class="flab">Tylko</span><div class="pillrow">
        <button class="tgl" data-f="hit" aria-pressed="${F.hit}">🔥 hity bazy (≥2)</button>
        <button class="tgl gap-tgl" data-f="gap" aria-pressed="${F.gap}">⚠️ klucz ≠ wytyczne (${stats.gap})</button>
        <button class="tgl" data-f="wrong" aria-pressed="${F.wrong}">moje błędne</button>
        <button class="tgl" data-f="bm" aria-pressed="${F.bm}">zakładki</button>
        <button class="tgl" id="fQuiz" aria-pressed="${F.quiz}" title="Ukryj zaznaczony klucz i rozwiązuj pytania klikając odpowiedzi bezpośrednio w kartach">📝 Rozwiązuj w kartach</button>
      </div>
        <span style="flex:1"></span><span class="muted" id="fCount" style="font-weight:700"></span><button class="btn pri sm" id="fTrain">⚡ Ćwicz (0)</button><button class="btn sec sm" id="fClr">Wyczyść</button></div>
      <details class="adv-filters" id="fAdv"${F.advOpen || advCnt > 0 ? ' open' : ''}>
        <summary><span id="fAdvLabel">Filtry zaawansowane: pewność klucza i flagi techniczne${advCnt ? ` (${advCnt} aktywne)` : ''}</span></summary>
        <div class="adv-body">
          <div class="frow"><span class="flab">Klucz</span><div class="pillrow" id="fConf">${Object.keys(CONF).filter(k => stats.confHit.has(k)).map(k => `<button class="tgl" data-v="${k}" aria-pressed="${F.conf.has(k)}">${CONF[k].n}</button>`).join('')}</div></div>
          <div class="frow"><span class="flab">Flagi</span><div class="pillrow" id="fAdvFlags">
            <button class="tgl" data-f="hasKey" aria-pressed="${F.hasKey}">z oficjalnym kluczem</button>
            <button class="tgl" data-f="hasWhy" aria-pressed="${F.hasWhy}">z omówieniem</button>
            <button class="tgl" data-f="searchWhy" aria-pressed="${F.searchWhy}" title="Przeszukuj również pełne teksty wyjaśnień i analizy dystraktorów">🔍 szukaj też w omówieniach</button>
            <button class="tgl" id="fAll" aria-pressed="${F.all}" title="Wymagaj wszystkich wybranych modułów jednocześnie">wszystkie wybrane moduły naraz</button>
          </div></div>
        </div>
      </details>
    </div>
    <div class="qlist" id="qlist" data-quiz="${F.quiz ? '1' : '0'}"></div><div style="text-align:center;margin-top:1.2rem" id="more"></div>
  `;

  const list = $('#qlist');
  const trainBtn = $('#fTrain');
  const moreBox = $('#more');
  const advDet = $('#fAdv');
  const advLab = $('#fAdvLabel');
  if (advDet) advDet.addEventListener('toggle', () => { F.advOpen = advDet.open; });
  const syncAdvLabel = () => {
    if (!advLab) return;
    const c = countAdv();
    advLab.textContent = `Filtry zaawansowane: pewność klucza i flagi techniczne${c ? ` (${c} aktywne)` : ''}`;
  };
  let lastFiltered = [];
  let fqTimer = null;
  let lastTargetQId = null;
  function filtered() {
    const rawQuery = (F.q || '').trim();
    const numMatch = rawQuery.match(/^#?q?(\d{1,4})$/i);
    const exactId = rawQuery.replace(/^#/, '');
    const targetQId = numMatch ? 'q' + numMatch[1].padStart(4, '0') : (qById[exactId] ? exactId : (qById[exactId.toLowerCase()] ? exactId.toLowerCase() : null));
    lastTargetQId = targetQId;
    const toks = norm(F.q).split(/\s+/).filter(Boolean);
    const ms = F.mods.size ? [...F.mods] : null;
    return Q.filter(q => {
      if (targetQId && q.id === targetQId) return true;
      if (F.hit && (!q.reps || q.reps < 2)) return false;
      if (F.hasKey && (!q.keys || !q.keys.length)) return false;
      if (F.hasWhy && !q.why) return false;
      if (F.banks.size && !F.banks.has(q.bank)) return false;
      if (F.at.size && !F.at.has(q.at)) return false;
      if (ms && (F.all ? !ms.every(m => q.mods.includes(m)) : !ms.some(m => q.mods.includes(m)))) return false;
      if (F.conf.size && !F.conf.has(q.conf)) return false;
      if (F.gap && !q.gap) return false; if (F.bm && !S.bm[q.id]) return false;
      if (F.wrong && !(S.ans[q.id] && !S.ans[q.id].last)) return false;
      if (!toks.length) return true;
      const qn = getQNorm(q);
      if (toks.every(t => qn.includes(t))) return true;
      if (F.searchWhy && (q.why || q.zal || q.akt)) {
        if (!q._whyN) q._whyN = norm([q.why || '', q.zal || '', q.akt || ''].join(' '));
        return toks.every(t => qn.includes(t) || q._whyN.includes(t));
      }
      return false;
    });
  }
  function renderMore(r) {
    moreBox.innerHTML = r.length > F.limit ? `<button class="btn sec" id="moreB">Pokaż kolejne ${Math.min(30, r.length - F.limit)} (zostało ${r.length - F.limit})</button>` : '';
    const mb = $('#moreB');
    if (mb) mb.onclick = () => { const prev = F.limit; F.limit += 30; draw(prev); };
  }
  function draw(appendFrom = 0) {
    syncAdvLabel();
    const r = appendFrom > 0 ? lastFiltered : filtered();
    lastFiltered = r;
    if (appendFrom > 0) {
      const chunk = r.slice(appendFrom, F.limit);
      if (chunk.length) list.insertAdjacentHTML('beforeend', chunk.map(q => qCard(q, false, F.quiz)).join(''));
      renderMore(r);
      return;
    }
    $('#fCount').textContent = r.length + ' z ' + Q.length;
    if (trainBtn) {
      trainBtn.textContent = `⚡ Ćwicz (${r.length})`;
      trainBtn.disabled = !r.length;
    }
    const slice = r.slice(0, F.limit);
    list.innerHTML = slice.map(q => qCard(q, !!(lastTargetQId && q.id === lastTargetQId), F.quiz)).join('') || '<div class="card" style="text-align:center;padding:2rem"><h3>Brak wyników</h3><p class="muted" style="margin:.3rem auto">Poluzuj filtry lub zmień frazę.</p></div>';
    renderMore(r);
  }
  const tgl = (sel, set) => $(sel).addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; const v = b.dataset.v; set.has(v) ? set.delete(v) : set.add(v); b.setAttribute('aria-pressed', set.has(v)); F.limit = 30; draw(); });
  tgl('#fBank', F.banks); tgl('#fAt', F.at); tgl('#fMod', F.mods); tgl('#fConf', F.conf);
  $('#fAll').addEventListener('click', e => { F.all = !F.all; e.currentTarget.setAttribute('aria-pressed', F.all); F.limit = 30; draw(); });
  const handleFlagClick = e => {
    const b = e.target.closest('[data-f]');
    if (!b) return;
    F[b.dataset.f] = !F[b.dataset.f];
    b.setAttribute('aria-pressed', F[b.dataset.f]);
    F.limit = 30;
    draw();
  };
  $('#fFlag').addEventListener('click', handleFlagClick);
  $('#fAdvFlags').addEventListener('click', handleFlagClick);
  $('#fQuiz').addEventListener('click', e => {
    F.quiz = !F.quiz;
    e.currentTarget.setAttribute('aria-pressed', F.quiz);
    list.dataset.quiz = F.quiz ? '1' : '0';
    draw();
  });
  $('#fq').addEventListener('input', e => {
    F.q = e.target.value;
    F.limit = 30;
    clearTimeout(fqTimer);
    fqTimer = setTimeout(() => draw(), 140);
  });
  if (trainBtn) {
    trainBtn.addEventListener('click', () => {
      if (!lastFiltered.length) return;
      C.mode = 'learn';
      pendingRetryIds = lastFiltered.map(q => q.id);
      location.hash = '#/trening';
    });
  }
  $('#fClr').addEventListener('click', () => { clearTimeout(fqTimer); Object.assign(F, { q: '', at: new Set(), mods: new Set(), banks: new Set(), all: false, conf: new Set(), gap: false, bm: false, wrong: false, hit: false, hasKey: false, hasWhy: false, searchWhy: false, quiz: true, advOpen: false, limit: 30 }); renderBrowseTab(container); });
  onBmMutate = () => {
    draw();
    $('#qTabs button[data-t="export"]').textContent = `📤 Eksport dodanych (${CUSTOM_Q.length})`;
    $('#qTabs button[data-t="browse"]').textContent = `🔍 Wyszukiwarka pytań (${Q.length})`;
  };
  draw();
}

function renderAddTab(container) {
  container.innerHTML = `
    <div style="display:flex;gap:.5rem;margin-bottom:1rem">
      <button class="btn ${F.addMode === 'single' ? 'pri' : 'sec'} sm" id="btnModeSingle">Pojedyncze pytanie</button>
      <button class="btn ${F.addMode === 'mass' ? 'pri' : 'sec'} sm" id="btnModeMass">Masowy import (tekst / JSON)</button>
    </div>
    <div id="addModeBox"></div>
  `;

  $('#btnModeSingle').onclick = () => { F.addMode = 'single'; renderAddTab(container); };
  $('#btnModeMass').onclick = () => { F.addMode = 'mass'; renderAddTab(container); };

  const box = $('#addModeBox');
  if (F.addMode === 'single') {
    box.innerHTML = `
      <form class="qform" id="sqForm">
        <div class="qform-row">
          <label for="sqStem">Treść pytania (stem) *</label>
          <textarea class="qform-textarea" id="sqStem" required placeholder="Wpisz treść pytania klinicznego lub teoretycznego..."></textarea>
        </div>

        <div class="qform-row">
          <label>Odpowiedzi i dystraktory (zaznacz kółkiem prawidłową odpowiedź) *</label>
          <div id="sqOptsList">
            ${['A', 'B', 'C', 'D', 'E'].map((l, i) => `
              <div class="qform-opt">
                <input type="radio" name="sqKey" value="${i}" ${i === 0 ? 'checked' : ''} title="Zaznacz odpowiedź ${l} jako prawidłową">
                <span class="opt-letter">${l}</span>
                <input class="qform-input opt-inp" placeholder="Treść opcji ${l}..." ${i < 2 ? 'required' : ''}>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="qform-grid">
          <div class="qform-row">
            <label for="sqBank">Bank / Źródło *</label>
            <select class="qform-select" id="sqBank">
              ${Object.keys(BANKS).map(b => `<option value="${b}">${BANKS[b].icon} ${BANKS[b].n}</option>`).join('')}
            </select>
          </div>
          <div class="qform-row">
            <label for="sqMod">Moduł główny *</label>
            <select class="qform-select" id="sqMod">
              ${MODS.map(m => `<option value="${m.id}">[${m.id}] ${esc(m.n)} (${GROUPS[m.g].short})</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="qform-row">
          <label for="sqWhy">Omówienie / uzasadnienie kliniczne (opcjonalne)</label>
          <textarea class="qform-textarea" id="sqWhy" placeholder="Dlaczego ta odpowiedź jest prawidłowa, jakie wytyczne o tym decydują..."></textarea>
        </div>

        <div class="qform-acts">
          <button type="submit" class="btn pri">Dodaj pytanie do bazy</button>
          <button type="reset" class="btn sec">Wyczyść formularz</button>
        </div>
      </form>
    `;

    $('#sqForm').onsubmit = e => {
      e.preventDefault();
      const stem = $('#sqStem').value.trim();
      const inps = $$('.opt-inp', $('#sqOptsList'));
      const opts = inps.map(x => x.value.trim()).filter(Boolean);
      if (opts.length < 2) {
        toast('Podaj co najmniej 2 opcje odpowiedzi!');
        return;
      }
      const selRadio = $('input[name="sqKey"]:checked');
      const keyIdx = selRadio ? parseInt(selRadio.value, 10) : 0;
      const bank = $('#sqBank').value;
      const mod = $('#sqMod').value;
      const why = $('#sqWhy').value.trim();

      const newQ = {
        id: 'cq-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        at: modById[mod]?.at || 'nagle-ob',
        type: 'mcq',
        mods: [mod],
        topic: '',
        stem,
        opts,
        keys: [keyIdx < opts.length ? keyIdx : 0],
        conf: 'src',
        adapt: false,
        gap: false,
        src: BANKS[bank]?.n || 'Własne',
        bank,
        why,
        tip: '',
        zal: '',
        akt: '',
        ans: '',
        isCustom: true
      };

      CUSTOM_Q.push(newQ);
      saveCustomQ();
      toast('Pytanie zostało pomyślnie dodane!');
      $('#sqForm').reset();
      $('#qTabs button[data-t="export"]').textContent = `📤 Eksport dodanych (${CUSTOM_Q.length})`;
      $('#qTabs button[data-t="browse"]').textContent = `🔍 Przeglądaj pytania (${Q.length})`;
    };
  } else {
    box.innerHTML = `
      <div class="qform">
        <p class="muted">Wklej tekst pytań z numeracją i literami A–E (np. ze skryptu, PDF-a, bazy LEK/PES) lub wklej tablicę JSON. Parser automatycznie wyodrębni treść pytania, warianty odpowiedzi i klucz.</p>

        <div class="qform-grid">
          <div class="qform-row">
            <label for="mqBank">Domyślny bank</label>
            <select class="qform-select" id="mqBank">
              ${Object.keys(BANKS).map(b => `<option value="${b}">${BANKS[b].icon} ${BANKS[b].n}</option>`).join('')}
            </select>
          </div>
          <div class="qform-row">
            <label for="mqMod">Domyślny moduł</label>
            <select class="qform-select" id="mqMod">
              ${MODS.map(m => `<option value="${m.id}">[${m.id}] ${esc(m.n)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="qform-row">
          <label for="mqText">Treść pytań do importu</label>
          <textarea class="qform-textarea" id="mqText" style="min-height:160px" placeholder="Przykład formatu tekstowego:
1. Które ze stwierdzeń dotyczących zapalenia płuc u niemowląt jest fałszywe?
A. Najczęstszą etiologią są wirusy
B. Badaniem pierwszego wyboru jest TK klatki piersiowej
C. Duszność i tachypnoe to wiodące objawy
D. Antybiotykiem pierwszego rzutu jest amoksycylina
E. Wskazaniem do hospitalizacji jest saturacja <92%
Klucz: B
Omówienie: TK nie jest badaniem rutynowym, wystarczy badanie kliniczne i ew. RTG."></textarea>
        </div>

        <div class="qform-acts">
          <button class="btn pri" id="btnParse">Przetestuj i wyświetl podgląd</button>
          <button class="btn sec" id="btnCommitImport" style="display:none">Zatwierdź i dodaj do bazy</button>
        </div>

        <div id="mqPreview"></div>
      </div>
    `;

    $('#btnParse').onclick = () => {
      const text = $('#mqText').value;
      const b = $('#mqBank').value;
      const m = $('#mqMod').value;
      parsedImportStash = parseQuestionsInput(text, b, m);
      const prev = $('#mqPreview');
      const btnCommit = $('#btnCommitImport');

      if (!parsedImportStash.length) {
        prev.innerHTML = `<div class="card" role="alert" style="margin-top:1rem;color:var(--red)">${esc(diagnoseQuestionsInput(text))}</div>`;
        btnCommit.style.display = 'none';
        return;
      }

      btnCommit.style.display = 'inline-block';
      btnCommit.textContent = `Zatwierdź i dodaj ${parsedImportStash.length} ${parsedImportStash.length === 1 ? 'pytanie' : 'pytań'}`;

      prev.innerHTML = `
        <div class="preview-box">
          <h4 style="color:var(--green)">✓ Rozpoznano poprawnie: ${parsedImportStash.length} pytań</h4>
          <div class="qlist" style="margin-top:.8rem">
            ${parsedImportStash.slice(0, 5).map(q => qCard(q, true)).join('')}
            ${parsedImportStash.length > 5 ? `<p class="muted" style="margin-top:.5rem">...oraz ${parsedImportStash.length - 5} kolejnych pytań.</p>` : ''}
          </div>
        </div>
      `;
    };

    $('#btnCommitImport').onclick = () => {
      if (!parsedImportStash.length) return;
      CUSTOM_Q.push(...parsedImportStash);
      saveCustomQ();
      toast(`Dodano ${parsedImportStash.length} nowych pytań!`);
      parsedImportStash = [];
      $('#mqText').value = '';
      $('#mqPreview').innerHTML = '';
      $('#btnCommitImport').style.display = 'none';
      $('#qTabs button[data-t="export"]').textContent = `📤 Eksport dodanych (${CUSTOM_Q.length})`;
      $('#qTabs button[data-t="browse"]').textContent = `🔍 Przeglądaj pytania (${Q.length})`;
    };
  }
}

function renderExportTab(container) {
  const jsonStr = JSON.stringify(CUSTOM_Q, null, 2);
  container.innerHTML = `
    <div class="qform">
      <h3>Eksport pytań dodanych przez Ciebie (${CUSTOM_Q.length})</h3>
      <p class="muted">Pytania zapisane są w pamięci Twojej przeglądarki. Aby wdrożyć je na stałe do repozytorium GitHub i dla wszystkich użytkowników, skopiuj poniższy kod JSON lub pobierz plik.</p>

      <div class="qform-row">
        <textarea class="qform-textarea" id="expJson" style="min-height:220px;font-family:monospace;font-size:.85rem" readonly>${esc(jsonStr)}</textarea>
      </div>

      <div class="qform-acts">
        <button class="btn pri" id="btnCopyJson">Skopiuj kod JSON</button>
        <button class="btn sec" id="btnDownloadJson">Pobierz plik .json</button>
        ${CUSTOM_Q.length ? `<button class="btn sec" id="btnClearCustom" style="color:var(--red);margin-left:auto">Wyczyść wszystkie dodane (${CUSTOM_Q.length})</button>` : ''}
      </div>
    </div>
  `;

  $('#btnCopyJson').onclick = async () => {
    try {
      await navigator.clipboard.writeText(jsonStr);
      toast('Skopiowano kod JSON do schowka!');
    } catch (e) {
      $('#expJson').select();
      toast('Zaznaczono tekst, skopiuj go za pomocą Ctrl+C');
    }
  };

  $('#btnDownloadJson').onclick = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ginpol-hub-pytania-custom-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Pobrano plik JSON!');
  };

  const btnClear = $('#btnClearCustom');
  if (btnClear) {
    btnClear.onclick = () => {
      if (confirm('Czy na pewno chcesz usunąć wszystkie pytania dodane w tej przeglądarce? Tej operacji nie można cofnąć.')) {
        CUSTOM_Q = [];
        saveCustomQ();
        toast('Wyczyszczono dodane pytania');
        $('#qTabs button[data-t="export"]').textContent = `📤 Eksport dodanych (0)`;
        $('#qTabs button[data-t="browse"]').textContent = `🔍 Przeglądaj pytania (${Q.length})`;
        renderExportTab(container);
      }
    };
  }
}

/* ---------- TRENING ---------- */
const C = { at: new Set(), mods: new Set(), banks: new Set(), conf: new Set(), gap: false, wrong: false, bm: false, fresh: false, open: false, hitsOnly: false, includeUnverified: false, advOpen: false, n: 10, mode: 'learn' };
function pool() {
  return Q.filter(q => {
    if (!C.includeUnverified && (!q.keys || !q.keys.length) && q.type !== 'open') return false;
    if (C.hitsOnly && (!q.reps || q.reps < 2)) return false;
    if (q.type === 'open' && !C.open && C.mode !== 'flash') return false;
    if (C.banks.size && !C.banks.has(q.bank)) return false;
    if (C.at.size && !C.at.has(q.at)) return false;
    if (C.mods.size && ![...C.mods].some(m => q.mods.includes(m))) return false;
    if (C.conf.size && !C.conf.has(q.conf)) return false;
    if (C.gap && !q.gap) return false; if (C.bm && !S.bm[q.id]) return false;
    if (C.wrong && !(S.ans[q.id] && !S.ans[q.id].last)) return false;
    if (C.fresh && S.ans[q.id]) return false;
    return true;
  });
}
/* ---------- LEKKI PARSER MARKDOWN & NOTATNIK ---------- */
function downloadFile(filename, content, mime = 'text/markdown') {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function insertMarkdownAt(textarea, type) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  const sel = val.slice(start, end);
  let ins = '';
  let cursorOffset = 0;

  switch (type) {
    case 'b': ins = `**${sel || 'pogrubienie'}**`; cursorOffset = sel ? ins.length : 2; break;
    case 'i': ins = `*${sel || 'kursywa'}*`; cursorOffset = sel ? ins.length : 1; break;
    case 'h2': ins = `\n## ${sel || 'Nagłówek sekcji'}\n`; cursorOffset = ins.length; break;
    case 'h3': ins = `\n### ${sel || 'Podnagłówek'}\n`; cursorOffset = ins.length; break;
    case 'list': ins = `\n- ${sel || 'Element listy'}\n`; cursorOffset = ins.length; break;
    case 'check': ins = `\n- [ ] ${sel || 'Zadanie / objaw do weryfikacji'}\n`; cursorOffset = ins.length; break;
    case 'table':
      ins = `\n| Cecha | Parametr A | Parametr B |\n|---|---|---|\n| Norma | Wartość 1 | Wartość 2 |\n| Patologia | Objaw 1 | Objaw 2 |\n`;
      cursorOffset = ins.length;
      break;
    case 'quote': ins = `\n> ${sel || 'Kluczowa perła kliniczna / uwaga'}\n`; cursorOffset = ins.length; break;
    case 'code': ins = `\`${sel || 'kod/dawka'}\``; cursorOffset = sel ? ins.length : 1; break;
  }

  textarea.value = val.slice(0, start) + ins + val.slice(end);
  textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;
  textarea.focus();
}

const NOTES_KEY = 'ginpol_hub_notes_v1';
const SCRATCH_KEY = 'ginpol_quick_scratchpad';

const NOTE_TEMPLATES = {
  choroba: `# [Jednostka położnicza / ginekologiczna]
**Moduł:** [Wybierz moduł 1–12]
**Wytyczne:** PTGiP / FIGO

### 1. Epidemiologia i czynniki ryzyka
- Grupa pacjentek / wiek ciążowy:
- Czynniki ryzyka:

### 2. Obraz kliniczny i czerwone flagi
- Objawy osiowe:
- Czerwone flagi (natychmiastowa interwencja):

### 3. Diagnostyka (USG, KTG, laboratorium)
- Badania pierwszego rzutu:
- Kryteria rozpoznania:

### 4. Postępowanie i farmakoterapia
- Stabilizacja / leczenie zachowawcze:
- Wskazania do rozwiązania ciąży / zabiegu:

### 5. Pułapki egzaminacyjne
- Klucz zakładu vs aktualne wytyczne PTGiP:
`,
  nagle: `# Protokół stanu nagłego OB/GYN: [Temat]

### Ocena matki i płodu (ABCDE + FHR)
- **A/B:** Drożność, tlenoterapia, pozycja na lewym boku (odciążenie żyły głównej dolnej!)
- **C:** 2 wkłucia obwodowe ≥18G, tętno, BP, **Shock Index (HR / SBP)** (norma w ciąży <0,9; >1,1 = ciężki wstrząs!)
- **Krew:** Morfologia, koagulogram (fibrynogen!), próba krzyżowa, grupa krwi
- **Płód:** Czynność serca (KTG / USG), wiek ciążowy (Hbd)

### Zasada 4T w krwotoku poporodowym (PPH)
1. **Tone (70%):** Atonia macicy → masaż dna, oksytocyna, karbetocyna, TXA 1 g i.v. w <3 h, misoprostol, balon Bakriego
2. **Trauma (20%):** Pęknięcia szyjki/pochwy, pęknięcie lub wynicowanie macicy
3. **Tissue (10%):** Resztki łożyska, spektrum łożyska przyrośniętego (PAS)
4. **Thrombin (<1%):** Koagulopatie, DIC (fibrynogen <2 g/l!)
`,
  dawki: `# Tabela dawek ratunkowych w położnictwie (PTGiP)

| Lek | Wskazanie | Dawka początkowa / schemat | Uwagi i przeciwwskazania |
|---|---|---|---|
| Siarczan magnezu (MgSO₄) | Rzucawka / ciężkie PE / neuroprotekcja <32 Hbd | 4–6 g i.v. w 15–20 min, następnie 1–2 g/h | Kontroluj odruch rzepkowy, RR ≥12/min, diurezę ≥25 ml/h. Odtrutka: **glukonian wapnia 1 g i.v.** |
| Kwas traneksamowy (TXA) | Krwotok poporodowy (PPH) | 1 g i.v. w 10 min (powtórka po 30 min) | Podać w ciągu **3 godzin** od porodu (badanie WOMAN) |
| Oksytocyna | Profilaktyka / leczenie atonii (PPH) | 5 j.m. i.v. powoli + wlew 10–40 j.m. w 500 ml | Unikać szybkiego bolusa (hipotensja, tachykardia) |
| Labetalol | Ciężkie nadciśnienie (≥160/110 mmHg) | 20 mg i.v., kolejne 40→80 mg co 10 min | Przeciwwskazany w astmie oskrzelowej i bradykardii |
| Nifedypina | Ciężkie nadciśnienie w ciąży | 10–20 mg p.o. (nie podjęzykowo!) | Bezpieczna łącznie z MgSO₄ przy monitorowaniu BP |
| Betametazon | Zagrażający poród przedwczesny (24–34 Hbd) | 12 mg i.m. × 2 dawki co 24 h | Profilaktyka RDS, IVH i NEC u wcześniaka |
| Immunoglobulina anty-D | Profilaktyka konfliktu Rh(-) | 300 µg i.m. w 28–30 Hbd + do 72 h po porodzie | Także po poronieniu, ektopowej, amniopunkcji |
`,
  checklista: `# Checklista powtórkowa — Ginekologia i Położnictwo V

- [ ] Moduł 1: Krwotok poporodowy (4T, TXA), łożysko przodujące vs oddzielenie przedwczesne
- [ ] Moduł 2: Nadciśnienie w ciąży, stan przedrzucawkowy, rzucawka (MgSO₄), zespół HELLP
- [ ] Moduł 3: Ciąża ektopowa (MTX vs laparoskopia) i skręt przydatków
- [ ] Moduł 4: Fizjologia ciąży i Standard Organizacyjny Opieki Okołoporodowej MZ
- [ ] Moduł 5: Okresy porodu, chwyty Leopolda, skala Bishopa, KTG (FIGO 2015), połóg
- [ ] Moduł 6: Cukrzyca ciążowa (OGTT 75g), cholestaza wewnątrzwątrobowa ciężarnych
- [ ] Moduł 7: Poród przedwczesny, PROM/PPROM, konflikt serologiczny (anty-D)
- [ ] Moduł 8: PCOS (kryteria rotterdamskie), AUB (PALM-COEIN), hiperprolaktynemia
- [ ] Moduł 9: Endometrioza, mięśniaki macicy (FIGO), zapalenie przydatków (PID)
- [ ] Moduł 10: Antykoncepcja (WHO MEC), menopauza (MHT), uroginekologia
- [ ] Moduł 11: HPV, cytologia Bethesda, kolposkopia, CIN, rak szyjki macicy
- [ ] Moduł 12: Rak endometrium, guzy jajnika (IOTA / RMI), zaśniad groniasty (GTD)
`
};

function getNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {}
  return [
    {
      id: 'note_starter_1',
      title: 'Perły kliniczne i normy — Ginekologia i Położnictwo V',
      content: `# Perły kliniczne i wartości referencyjne OB/GYN

## 1. Klasyfikacja KTG wg FIGO 2015
| Parametr | Prawidłowy | Podejrzany | Patologiczny |
|---|---|---|---|
| Linia podstawowa (FHR) | 110–160 /min | Brak 1 cechy normy | <100 /min (bradykardia) |
| Zmienność | 5–25 /min | — | <5 /min (>50 min) lub >25 /min (>30 min) lub sinusoidalny |
| Deceleracje | Brak powtarzalnych | — | Powtarzalne późne lub przedłużone >30 min (>20 min przy obniżonej zmienności) |

## 2. Czerwone flagi przyłóżkowe
- [ ] Krwawienie w II/III trymestrze — **ZAKAZ badania dwuręcznego** przed wykluczeniem łożyska przodującego w USG!
- [ ] Napad rzucawki — lekiem I rzutu jest **siarczan magnezu (MgSO₄)**, nie diazepam
- [ ] Kobieta w wieku rozrodczym z bólem podbrzusza i omdleniem — **zawsze test ciążowy / β-hCG** (wyklucz ciążę ektopową)
- [ ] Kobieta po menopauzie z krwawieniem z dróg rodnych — **wyklucz raka endometrium** (USG TV + biopsja)

## 3. Kryteria OGTT 75g w ciąży (PTGiP / IADPSG)
> Wystarczy **jedna** nieprawidłowa wartość do rozpoznania GDM: na czczo **92–125 mg/dl**, po 1 h **≥180 mg/dl**, po 2 h **153–199 mg/dl**.
`,
      mod: 'all',
      updatedAt: Date.now() - 3600000
    },
    {
      id: 'note_starter_2',
      title: 'Dawki ratunkowe w położnictwie (PPH, MgSO₄, NT)',
      content: NOTE_TEMPLATES.dawki,
      mod: '1',
      updatedAt: Date.now() - 7200000
    }
  ];
}

function saveNotes(notes) {
  return safeStorageSet(NOTES_KEY, JSON.stringify(notes));
}

function initNotesDrawer() {
  const btn = $('#btnQuickNotes');
  const drawer = $('#notesDrawer');
  const close = $('#drawerClose');
  const input = $('#drawerInput');
  const preview = $('#drawerPreview');
  const modeBtn = $('#drawerToggleMode');
  const saveBtn = $('#drawerSaveAsNote');
  const clearBtn = $('#drawerClear');
  const status = $('#scratchSavedStatus');
  if (!btn || !drawer || !input) return;

  try {
    input.value = localStorage.getItem(SCRATCH_KEY) || '';
  } catch (e) {}

  let isPreview = false;
  const updatePreview = () => {
    if (preview) preview.innerHTML = parseMarkdown(input.value) || '<p class="muted">Brak tekstu w brudnopisie...</p>';
  };

  btn.onclick = () => {
    const hidden = drawer.hasAttribute('hidden');
    if (hidden) {
      drawer.removeAttribute('hidden');
      input.focus();
      updatePreview();
    } else {
      drawer.setAttribute('hidden', '');
    }
  };

  if (close) close.onclick = () => drawer.setAttribute('hidden', '');

  let saveT;
  input.addEventListener('input', () => {
    clearTimeout(saveT);
    if (status) status.textContent = 'Zapisywanie...';
    saveT = setTimeout(() => {
      const ok = safeStorageSet(SCRATCH_KEY, input.value);
      if (status) status.textContent = ok ? 'Zapisano ✓' : '⚠️ Brak miejsca';
      updatePreview();
    }, 300);
  });

  input.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertMarkdownAt(input, 'b');
      updatePreview();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertMarkdownAt(input, 'i');
      updatePreview();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const start = input.selectionStart, end = input.selectionEnd;
      input.value = input.value.slice(0, start) + '  ' + input.value.slice(end);
      input.selectionStart = input.selectionEnd = start + 2;
    }
  });

  if (modeBtn) {
    modeBtn.onclick = () => {
      isPreview = !isPreview;
      if (isPreview) {
        input.hidden = true;
        preview.hidden = false;
        modeBtn.textContent = 'Edycja';
        updatePreview();
      } else {
        input.hidden = false;
        preview.hidden = true;
        modeBtn.textContent = 'Podgląd';
        input.focus();
      }
    };
  }

  $$('[data-md]', drawer).forEach(b => {
    b.onclick = () => {
      insertMarkdownAt(input, b.dataset.md);
      safeStorageSet(SCRATCH_KEY, input.value);
      updatePreview();
    };
  });

  if (saveBtn) {
    saveBtn.onclick = () => {
      const text = input.value.trim();
      if (!text) { toast('Brudnopis jest pusty!'); return; }
      const firstLine = text.split('\n')[0].replace(/^[#\s*-]+/, '').trim();
      const title = firstLine ? firstLine.slice(0, 50) : `Notatka z brudnopisu (${new Date().toLocaleDateString('pl-PL')})`;
      const notes = getNotes();
      const newNote = {
        id: 'note_' + Date.now(),
        title,
        content: text,
        mod: 'all',
        updatedAt: Date.now()
      };
      notes.unshift(newNote);
      saveNotes(notes);
      toast('Zapisano nową notatkę w Hubie!');
      drawer.setAttribute('hidden', '');
      location.hash = '#/notatki?id=' + newNote.id;
    };
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      if (confirm('Czy na pewno chcesz wyczyścić szybki brudnopis?')) {
        input.value = '';
        try { localStorage.removeItem(SCRATCH_KEY); } catch (e) {}
        updatePreview();
        toast('Wyczyszczono brudnopis');
      }
    };
  }
}

/* Widok pełnego notatnika (#/notatki) */
let activeNoteId = null;
let noteViewMode = 'split'; // 'split' | 'editor' | 'preview'

function viewNotes(parts, params) {
  const notes = getNotes();
  if (params.id && notes.some(n => n.id === params.id)) {
    activeNoteId = params.id;
  } else if (!activeNoteId || !notes.some(n => n.id === activeNoteId)) {
    activeNoteId = notes[0] ? notes[0].id : null;
  }

  const activeNote = notes.find(n => n.id === activeNoteId) || {
    id: 'note_' + Date.now(),
    title: 'Nowa notatka',
    content: '',
    mod: 'all',
    updatedAt: Date.now()
  };

  const render = () => {
    main.innerHTML = `<section class="blk" style="border:0"><div class="wrap">
      <div class="eyebrow">Własne notatki</div>
      <h2>Notatnik kliniczny Markdown</h2>
      <p class="lead">Twórz i organizuj notatki do zaliczenia z pełnym wsparciem składni Markdown: tabelami parametrów, checklistami objawów, dawkami i blokami leków.</p>

      <div class="notes-layout">
        <!-- Lewy panel: Lista notatek -->
        <aside class="notes-sidebar">
          <div class="acts" style="justify-content:space-between">
            <button class="btn pri sm" id="btnNewNote">+ Nowa notatka</button>
            <span class="muted" style="font-size:.8rem;font-weight:700" id="noteCount">${notes.length} ${notes.length === 1 ? 'notatka' : 'notatek'}</span>
          </div>
          <input type="search" id="notesSearch" class="field" placeholder="Szukaj w notatkach…" style="width:100%;padding:.45rem .7rem;font-size:.85rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink)">
          <div class="pillrow" style="gap:.25rem" id="noteModFilter">
            <button class="tgl sm active" data-filter="all" aria-pressed="true" style="font-size:.72rem;padding:.2rem .5rem">Wszystkie</button>
            ${MODS.map(m => `<button class="tgl sm" data-filter="${m.id}" aria-pressed="false" title="Moduł ${m.id}: ${esc(m.n)}" style="font-size:.72rem;padding:.2rem .5rem">[${m.id}] ${esc(SHORT[m.id] || m.n)}</button>`).join('')}
          </div>
          <div class="notes-items" id="notesList">
            ${renderNoteItems(notes, activeNoteId)}
          </div>
        </aside>

        <!-- Prawy panel: Edytor i podgląd -->
        <div class="notes-editor-box">
          <div class="note-header-row">
            <input type="text" id="noteTitleIn" class="note-title-in" value="${esc(activeNote.title)}" placeholder="Tytuł notatki…">
            <select id="noteModSel" class="field" style="padding:.4rem .6rem;border-radius:8px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);font-weight:700;font-size:.84rem">
              <option value="all" ${activeNote.mod === 'all' ? 'selected' : ''}>Ogólne (Wszystkie moduły)</option>
              ${MODS.map(m => `<option value="${m.id}" ${activeNote.mod === m.id ? 'selected' : ''}>Moduł [${m.id}] ${esc(m.n)}</option>`).join('')}
            </select>
          </div>

          <div class="notes-toolbar">
            <button type="button" data-f="b" title="Pogrubienie (Ctrl+B)"><b>B</b></button>
            <button type="button" data-f="i" title="Kursywa (Ctrl+I)"><i>I</i></button>
            <button type="button" data-f="h2" title="Nagłówek sekcji">H2</button>
            <button type="button" data-f="h3" title="Podnagłówek">H3</button>
            <button type="button" data-f="list" title="Lista punktowana">• Lista</button>
            <button type="button" data-f="check" title="Checklista">☑ Zadanie</button>
            <button type="button" data-f="table" title="Tabela parametrów">▦ Tabela</button>
            <button type="button" data-f="quote" title="Cytat / uwaga">” Cytat</button>
            <button type="button" data-f="code" title="Kod / dawka">\`Kod\`</button>

            <select id="templateSel" style="padding:.25rem .5rem;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:.8rem;font-weight:700">
              <option value="">Wstaw szablon medyczny…</option>
              <option value="choroba">Karta jednostki chorobowej</option>
              <option value="nagle">Różnicowanie stanów nagłych (ABCDE)</option>
              <option value="dawki">Tabela dawek ratunkowych OB (PPH / MgSO₄)</option>
              <option value="checklista">Checklista 15 modułów</option>
            </select>

            <div style="flex:1"></div>

            <div class="seg" id="modeSeg">
              <button data-m="split" aria-pressed="${noteViewMode === 'split'}">Podział</button>
              <button data-m="editor" aria-pressed="${noteViewMode === 'editor'}">Edytor</button>
              <button data-m="preview" aria-pressed="${noteViewMode === 'preview'}">Podgląd</button>
            </div>

            <button type="button" id="btnExportMd" class="btn sec sm" title="Pobierz plik Markdown">📥 .md</button>
            <button type="button" id="btnCopyMd" class="btn sec sm" title="Kopiuj zawartość do schowka">📋 Kopiuj</button>
            <button type="button" id="btnDeleteNote" class="btn sec sm" style="color:var(--red)" title="Usuń notatkę">🗑️</button>
          </div>

          <div class="notes-split mode-${noteViewMode}" id="notesSplit">
            <div class="notes-editor-pane">
              <textarea id="noteContentIn" placeholder="Wpisz treść notatki w formacie Markdown…">${esc(activeNote.content)}</textarea>
            </div>
            <div class="notes-preview-pane md-preview" id="notePreviewPane">
              ${parseMarkdown(activeNote.content) || '<p class="muted">Podgląd notatki Markdown pojawi się tutaj…</p>'}
            </div>
          </div>
          <div class="srcline" style="display:flex;justify-content:space-between">
            <span id="noteSaveIndicator">✓ Zapisano automatycznie</span>
            <span>Ostatnia modyfikacja: ${new Date(activeNote.updatedAt || Date.now()).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div></section>`;

    attachEvents();
  };

  const renderNoteItems = (list, curId, filterText = '', filterMod = 'all') => {
    let filtered = list;
    if (filterMod !== 'all') filtered = filtered.filter(n => n.mod === filterMod);
    if (filterText) {
      const q = norm(filterText);
      filtered = filtered.filter(n => norm(n.title + ' ' + n.content).includes(q));
    }
    if (!filtered.length) return '<p class="muted" style="font-size:.82rem;padding:.8rem;text-align:center">Brak pasujących notatek</p>';
    return filtered.map(n => {
      const active = n.id === curId;
      const d = new Date(n.updatedAt || Date.now()).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
      const modTag = n.mod && n.mod !== 'all' ? `[${n.mod}] ` : '';
      return `<button class="note-item ${active ? 'active' : ''}" data-id="${n.id}">
        <span class="note-item-title">${modTag}${esc(n.title || 'Bez tytułu')}</span>
        <span class="note-item-meta"><span>${d}</span><span>${(n.content || '').length} zn.</span></span>
      </button>`;
    }).join('');
  };

  const attachEvents = () => {
    const listCont = $('#notesList');
    const searchIn = $('#notesSearch');
    const titleIn = $('#noteTitleIn');
    const contentIn = $('#noteContentIn');
    const modSel = $('#noteModSel');
    const previewPane = $('#notePreviewPane');
    const saveInd = $('#noteSaveIndicator');
    const newBtn = $('#btnNewNote');
    const delBtn = $('#btnDeleteNote');
    const exportBtn = $('#btnExportMd');
    const copyBtn = $('#btnCopyMd');
    const tmplSel = $('#templateSel');
    let curFilterMod = 'all';

    // Przełączanie notatek
    if (listCont) {
      listCont.addEventListener('click', e => {
        const item = e.target.closest('.note-item');
        if (!item) return;
        activeNoteId = item.dataset.id;
        location.hash = '#/notatki?id=' + activeNoteId;
      });
    }

    // Nowa notatka
    if (newBtn) {
      newBtn.onclick = () => {
        const allNotes = getNotes();
        const created = {
          id: 'note_' + Date.now(),
          title: 'Nowa notatka kliniczna',
          content: '# Nowa notatka kliniczna\n\n- ',
          mod: 'all',
          updatedAt: Date.now()
        };
        allNotes.unshift(created);
        saveNotes(allNotes);
        activeNoteId = created.id;
        toast('Utworzono nową notatkę');
        viewNotes(parts, { id: created.id });
      };
    }

    // Usuwanie notatki
    if (delBtn) {
      delBtn.onclick = () => {
        let allNotes = getNotes();
        if (allNotes.length <= 1) {
          toast('Nie można usunąć ostatniej notatki');
          return;
        }
        if (confirm(`Czy na pewno chcesz usunąć notatkę "${activeNote.title}"?`)) {
          allNotes = allNotes.filter(n => n.id !== activeNote.id);
          saveNotes(allNotes);
          activeNoteId = allNotes[0].id;
          toast('Notatka usunięta');
          viewNotes(parts, { id: activeNoteId });
        }
      };
    }

    // Wyszukiwanie
    if (searchIn) {
      searchIn.addEventListener('input', () => {
        listCont.innerHTML = renderNoteItems(getNotes(), activeNoteId, searchIn.value, curFilterMod);
      });
    }

    // Filtrowanie po module
    $$('#noteModFilter button').forEach(b => {
      b.onclick = () => {
        $$('#noteModFilter button').forEach(x => {
          x.classList.toggle('active', x === b);
          x.setAttribute('aria-pressed', String(x === b));
        });
        curFilterMod = b.dataset.filter;
        listCont.innerHTML = renderNoteItems(getNotes(), activeNoteId, (searchIn || {}).value || '', curFilterMod);
      };
    });

    // Autosave edycji
    let autoSaveT;
    const triggerSave = () => {
      clearTimeout(autoSaveT);
      if (saveInd) saveInd.textContent = 'Zapisywanie…';
      autoSaveT = setTimeout(() => {
        const allNotes = getNotes();
        const idx = allNotes.findIndex(n => n.id === activeNote.id);
        if (idx !== -1) {
          allNotes[idx].title = titleIn.value.trim() || 'Bez tytułu';
          allNotes[idx].content = contentIn.value;
          allNotes[idx].mod = modSel.value;
          allNotes[idx].updatedAt = Date.now();
          const saved = saveNotes(allNotes);
          if (saveInd) saveInd.textContent = saved ? '✓ Zapisano automatycznie' : '⚠️ Brak miejsca – nie zapisano';
          listCont.innerHTML = renderNoteItems(allNotes, activeNoteId, (searchIn || {}).value || '', curFilterMod);
        }
      }, 400);
    };

    if (titleIn) titleIn.addEventListener('input', triggerSave);
    if (modSel) modSel.addEventListener('change', triggerSave);

    if (contentIn) {
      contentIn.addEventListener('input', () => {
        if (previewPane) previewPane.innerHTML = parseMarkdown(contentIn.value) || '<p class="muted">Podgląd notatki Markdown…</p>';
        triggerSave();
      });

      contentIn.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
          e.preventDefault();
          insertMarkdownAt(contentIn, 'b');
          if (previewPane) previewPane.innerHTML = parseMarkdown(contentIn.value);
          triggerSave();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
          e.preventDefault();
          insertMarkdownAt(contentIn, 'i');
          if (previewPane) previewPane.innerHTML = parseMarkdown(contentIn.value);
          triggerSave();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const start = contentIn.selectionStart, end = contentIn.selectionEnd;
          contentIn.value = contentIn.value.slice(0, start) + '  ' + contentIn.value.slice(end);
          contentIn.selectionStart = contentIn.selectionEnd = start + 2;
        }
      });
    }

    // Pasek narzędzi
    $$('.notes-toolbar button[data-f]').forEach(b => {
      b.onclick = () => {
        insertMarkdownAt(contentIn, b.dataset.f);
        if (previewPane) previewPane.innerHTML = parseMarkdown(contentIn.value);
        triggerSave();
      };
    });

    // Szablony
    if (tmplSel) {
      tmplSel.addEventListener('change', () => {
        const val = tmplSel.value;
        if (!val || !NOTE_TEMPLATES[val]) return;
        if (contentIn.value.trim() && !confirm('Czy na pewno wstawić szablon na końcu notatki?')) {
          tmplSel.value = '';
          return;
        }
        contentIn.value = (contentIn.value ? contentIn.value + '\n\n' : '') + NOTE_TEMPLATES[val];
        tmplSel.value = '';
        if (previewPane) previewPane.innerHTML = parseMarkdown(contentIn.value);
        triggerSave();
        toast('Wstawiono szablon notatki');
      });
    }

    // Przełącznik trybu widoku
    $$('#modeSeg button').forEach(b => {
      b.onclick = () => {
        noteViewMode = b.dataset.m;
        $$('#modeSeg button').forEach(x => x.setAttribute('aria-pressed', x === b));
        const split = $('#notesSplit');
        if (split) {
          split.className = `notes-split mode-${noteViewMode}`;
        }
      };
    });

    // Eksport do pliku .md
    if (exportBtn) {
      exportBtn.onclick = () => {
        const safeTitle = (activeNote.title || 'notatka').toLowerCase().replace(/[^a-z0-9_-]+/gi, '-');
        downloadFile(`${safeTitle}.md`, contentIn.value);
        toast(`Pobrano plik ${safeTitle}.md`);
      };
    }

    // Kopiowanie Markdown
    if (copyBtn) {
      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(contentIn.value);
          toast('Skopiowano treść Markdown do schowka');
        } catch (e) {
          contentIn.select();
          toast('Zaznaczono treść, skopiuj ręcznie');
        }
      };
    }
  };

  render();
}

/* ---------- SYMULACJA EGZAMINU (MOCK EXAM) ---------- */
let EXAM_CONF = {
  count: 50,
  timeMode: '1min',
  customMinutes: 50,
  banks: new Set(Object.keys(BANKS)),
  mods: new Set(MODS.map(m => m.id)),
  shuffleQ: true,
  hitsOnly: false,
  gapOnly: false,
  includeUnverified: false,
  advOpen: false
};

let EXAM_SESSION = null;

function getExamQuestionsPool() {
  return Q.filter(q => {
    if (!EXAM_CONF.includeUnverified && (!q.keys || !q.keys.length)) return false;
    if (EXAM_CONF.hitsOnly && (!q.reps || q.reps < 2)) return false;
    if (EXAM_CONF.gapOnly && !q.gap) return false;
    if (EXAM_CONF.banks.size && !EXAM_CONF.banks.has(q.bank)) return false;
    if (EXAM_CONF.mods.size && !q.mods.some(m => EXAM_CONF.mods.has(m))) return false;
    return true;
  });
}

function viewExam(parts, params) {
  if (params && params.id) {
    const report = (S.examHistory || []).find(x => x.id === params.id);
    if (report) return renderExamReport(report, true);
    toast('Nie znaleziono egzaminu w historii');
  }

  if (EXAM_SESSION && !EXAM_SESSION.finished) {
    return renderActiveExam();
  }

  if (EXAM_SESSION && EXAM_SESSION.finished && EXAM_SESSION.report) {
    return renderExamReport(EXAM_SESSION.report, false);
  }

  renderExamSetup();
}

function renderExamSetup() {
  const pool = getExamQuestionsPool();
  main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:920px">
    <div class="eyebrow">Symulator egzaminu</div>
    <h2>Egzamin próbny z ginekologii i położnictwa</h2>
    <p class="lead">Sprawdź swoją wiedzę w warunkach zbliżonych do oficjalnego zaliczenia: licznik czasu, brak podglądu poprawnych odpowiedzi w trakcie, nawigacja po siatce pytań z flagami „do sprawdzenia” oraz oficjalny próg zdawalności 60%.</p>

    <!-- Kafelki szybkich presetów -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.8rem">
      <button type="button" class="card preset-card" data-preset="quick" aria-pressed="${EXAM_CONF.count === 20 && EXAM_CONF.timeMode === '1min'}">
        <span style="display:block;font-size:1.4rem;margin-bottom:.3rem">⚡ Szybki test</span>
        <strong style="display:block">20 pytań · 20 minut</strong>
        <span class="srcline" style="display:block;margin-top:.3rem">Krótka weryfikacja wiedzy z losowych modułów.</span>
      </button>
      <button type="button" class="card preset-card" data-preset="standard" aria-pressed="${EXAM_CONF.count === 50 && EXAM_CONF.timeMode === '1min'}">
        <span style="display:block;font-size:1.4rem;margin-bottom:.3rem">🎓 Egzamin standardowy</span>
        <strong style="display:block">50 pytań · 50 minut</strong>
        <span class="srcline" style="display:block;margin-top:.3rem">Zrównoważony przekrój wszystkich 15 modułów.</span>
      </button>
      <button type="button" class="card preset-card" data-preset="full" aria-pressed="${EXAM_CONF.count === 100 && EXAM_CONF.timeMode === '1min'}">
        <span style="display:block;font-size:1.4rem;margin-bottom:.3rem">📚 Pełny maraton</span>
        <strong style="display:block">100 pytań · 100 minut</strong>
        <span class="srcline" style="display:block;margin-top:.3rem">Maksymalny test wytrzymałości i wiedzy.</span>
      </button>
    </div>

    <!-- Konfiguracja zaawansowana -->
    <div class="tool">
      <div class="frow">
        <span class="flab">Liczba pytań</span>
        <div class="seg" id="exN">
          <button data-n="20" aria-pressed="${EXAM_CONF.count === 20}">20</button>
          <button data-n="30" aria-pressed="${EXAM_CONF.count === 30}">30</button>
          <button data-n="50" aria-pressed="${EXAM_CONF.count === 50}">50</button>
          <button data-n="100" aria-pressed="${EXAM_CONF.count === 100}">100</button>
          <button data-n="0" aria-pressed="${EXAM_CONF.count === 0}">Wszystkie (${pool.length})</button>
        </div>
      </div>

      <div class="frow">
        <span class="flab">Czas trwania</span>
        <div class="seg" id="exTime">
          <button data-t="1min" aria-pressed="${EXAM_CONF.timeMode === '1min'}">1 min / pytanie</button>
          <button data-t="1.5min" aria-pressed="${EXAM_CONF.timeMode === '1.5min'}">1.5 min / pytanie</button>
          <button data-t="45s" aria-pressed="${EXAM_CONF.timeMode === '45s'}">45 s / pytanie</button>
          <button data-t="unlimited" aria-pressed="${EXAM_CONF.timeMode === 'unlimited'}">Bez limitu</button>
        </div>
      </div>

      <div class="frow">
        <span class="flab">Banki pytań</span>
        <div class="pillrow" id="exBanks">
          ${Object.keys(BANKS).map(b => `<button class="tgl" data-bank="${b}" aria-pressed="${EXAM_CONF.banks.has(b)}">${BANKS[b].icon} ${BANKS[b].short} (${Q.filter(q => q.bank === b).length})</button>`).join('')}
        </div>
      </div>

      <details class="adv-filters" id="exAdv"${EXAM_CONF.advOpen || EXAM_CONF.mods.size < MODS.length || EXAM_CONF.hitsOnly || EXAM_CONF.gapOnly || EXAM_CONF.includeUnverified ? ' open' : ''}>
        <summary><span id="exAdvLabel">Filtry zaawansowane: wybór modułów (${EXAM_CONF.mods.size}/${MODS.length}) i flagi specjalne</span></summary>
        <div class="adv-body">
          <div class="frow">
            <span class="flab">Moduły kursu</span>
            <div style="flex:1">
              <div class="acts" style="margin-bottom:.5rem">
                <button class="btn sec sm" id="btnSelectAllMods" style="font-size:.76rem;padding:.2rem .6rem">Zaznacz wszystkie</button>
                <button class="btn sec sm" id="btnDeselectAllMods" style="font-size:.76rem;padding:.2rem .6rem">Odznacz wszystkie</button>
              </div>
              <div class="pillrow" id="exMods">
                ${MODS.map(m => `<button class="tgl" data-mod="${m.id}" aria-pressed="${EXAM_CONF.mods.has(m.id)}">[${m.id}] ${esc(SHORT[m.id] || m.n)}</button>`).join('')}
              </div>
            </div>
          </div>

          <div class="frow">
            <span class="flab">Flagi</span>
            <div class="pillrow" id="exFilters">
              <button class="tgl" id="exHitsOnly" aria-pressed="${EXAM_CONF.hitsOnly}">🔥 Tylko hity zakładowe (≥2 źródła)</button>
              <button class="tgl" id="exGapOnly" aria-pressed="${EXAM_CONF.gapOnly}">⚠️ Tylko pytania sporne (klucz vs wytyczne: ${Q.filter(q => q.gap).length})</button>
              <button class="tgl" id="exUnverified" aria-pressed="${EXAM_CONF.includeUnverified}">Uwzględnij pytania bez oficjalnego klucza (do dyskusji)</button>
            </div>
          </div>
        </div>
      </details>

      <div class="frow" style="justify-content:space-between;border-top:1px solid var(--line-2);padding-top:1.1rem;margin-top:.6rem">
        <div>
          <span id="exPoolInfo" style="font-weight:800;font-size:1.05rem"></span>
          <div class="srcline" id="exEstTime">Szacowany czas: ~50 minut</div>
        </div>
        <button class="btn pri" id="btnStartExam" style="font-size:1.05rem;padding:.8rem 1.6rem">Rozpocznij egzamin próbny →</button>
      </div>
    </div>
  </div></section>`;

  const exAdv = $('#exAdv');
  const exAdvLabel = $('#exAdvLabel');
  if (exAdv) exAdv.addEventListener('toggle', () => { EXAM_CONF.advOpen = exAdv.open; });

  const updatePoolInfo = () => {
    const curPool = getExamQuestionsPool();
    const count = EXAM_CONF.count === 0 ? curPool.length : Math.min(EXAM_CONF.count, curPool.length);
    $('#exPoolInfo').textContent = curPool.length ? `Dostępna pula: ${curPool.length} pytań (do testu: ${count})` : 'Pula pusta! Zaznacz przynajmniej jeden bank i moduł.';
    $('#btnStartExam').disabled = !curPool.length;
    if (exAdvLabel) {
      const fCnt = (EXAM_CONF.hitsOnly ? 1 : 0) + (EXAM_CONF.gapOnly ? 1 : 0) + (EXAM_CONF.includeUnverified ? 1 : 0);
      exAdvLabel.textContent = `Filtry zaawansowane: wybór modułów (${EXAM_CONF.mods.size}/${MODS.length})${fCnt ? ` i ${fCnt} ${fCnt === 1 ? 'flaga aktywna' : 'flagi aktywne'}` : ' i flagi specjalne'}`;
    }

    let timeText = 'Bez limitu czasu';
    if (EXAM_CONF.timeMode === '1min') timeText = `Limit czasu: ${count} min (1 min/pytanie)`;
    else if (EXAM_CONF.timeMode === '1.5min') timeText = `Limit czasu: ${Math.round(count * 1.5)} min (1.5 min/pytanie)`;
    else if (EXAM_CONF.timeMode === '45s') timeText = `Limit czasu: ${Math.round(count * 0.75)} min (45 s/pytanie)`;
    $('#exEstTime').textContent = timeText;
  };

  const syncPresetCards = () => {
    const active = EXAM_CONF.timeMode !== '1min' ? null : (EXAM_CONF.count === 20 ? 'quick' : EXAM_CONF.count === 50 ? 'standard' : EXAM_CONF.count === 100 ? 'full' : null);
    $$('[data-preset]').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.preset === active)));
  };

  // Presety
  $$('[data-preset]').forEach(card => {
    card.onclick = () => {
      const p = card.dataset.preset;
      if (p === 'quick') { EXAM_CONF.count = 20; EXAM_CONF.timeMode = '1min'; }
      else if (p === 'standard') { EXAM_CONF.count = 50; EXAM_CONF.timeMode = '1min'; }
      else if (p === 'full') { EXAM_CONF.count = 100; EXAM_CONF.timeMode = '1min'; }
      $$('#exN button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.n === EXAM_CONF.count));
      $$('#exTime button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === EXAM_CONF.timeMode));
      syncPresetCards();
      updatePoolInfo();
    };
  });

  // Liczba pytań
  $('#exN').onclick = e => {
    const b = e.target.closest('[data-n]');
    if (!b) return;
    EXAM_CONF.count = +b.dataset.n;
    $$('#exN button').forEach(x => x.setAttribute('aria-pressed', x === b));
    syncPresetCards();
    updatePoolInfo();
  };

  // Czas
  $('#exTime').onclick = e => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    EXAM_CONF.timeMode = b.dataset.t;
    $$('#exTime button').forEach(x => x.setAttribute('aria-pressed', x === b));
    syncPresetCards();
    updatePoolInfo();
  };

  // Banki
  $('#exBanks').onclick = e => {
    const b = e.target.closest('[data-bank]');
    if (!b) return;
    const bk = b.dataset.bank;
    EXAM_CONF.banks.has(bk) ? EXAM_CONF.banks.delete(bk) : EXAM_CONF.banks.add(bk);
    b.setAttribute('aria-pressed', EXAM_CONF.banks.has(bk));
    updatePoolInfo();
  };

  // Moduły
  $('#exMods').onclick = e => {
    const b = e.target.closest('[data-mod]');
    if (!b) return;
    const m = b.dataset.mod;
    EXAM_CONF.mods.has(m) ? EXAM_CONF.mods.delete(m) : EXAM_CONF.mods.add(m);
    b.setAttribute('aria-pressed', EXAM_CONF.mods.has(m));
    updatePoolInfo();
  };

  $('#btnSelectAllMods').onclick = () => {
    MODS.forEach(m => EXAM_CONF.mods.add(m.id));
    $$('#exMods button').forEach(b => b.setAttribute('aria-pressed', 'true'));
    updatePoolInfo();
  };

  $('#btnDeselectAllMods').onclick = () => {
    EXAM_CONF.mods.clear();
    $$('#exMods button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    updatePoolInfo();
  };

  const btnHitsOnly = $('#exHitsOnly');
  if (btnHitsOnly) {
    btnHitsOnly.onclick = () => {
      EXAM_CONF.hitsOnly = !EXAM_CONF.hitsOnly;
      btnHitsOnly.setAttribute('aria-pressed', EXAM_CONF.hitsOnly);
      updatePoolInfo();
    };
  }

  const btnGapOnly = $('#exGapOnly');
  if (btnGapOnly) {
    btnGapOnly.onclick = () => {
      EXAM_CONF.gapOnly = !EXAM_CONF.gapOnly;
      btnGapOnly.setAttribute('aria-pressed', EXAM_CONF.gapOnly);
      updatePoolInfo();
    };
  }

  const btnUnverified = $('#exUnverified');
  if (btnUnverified) {
    btnUnverified.onclick = () => {
      EXAM_CONF.includeUnverified = !EXAM_CONF.includeUnverified;
      btnUnverified.setAttribute('aria-pressed', EXAM_CONF.includeUnverified);
      updatePoolInfo();
    };
  }

  $('#btnStartExam').onclick = () => startExam();

  updatePoolInfo();
}

function startExam() {
  let pool = getExamQuestionsPool();
  if (!pool.length) { toast('Brak pytań spełniających kryteria'); return; }
  if (EXAM_CONF.shuffleQ) pool = shuffle(pool);
  const count = EXAM_CONF.count === 0 ? pool.length : Math.min(EXAM_CONF.count, pool.length);
  const list = pool.slice(0, count);

  let totalSec = null;
  if (EXAM_CONF.timeMode === '1min') totalSec = count * 60;
  else if (EXAM_CONF.timeMode === '1.5min') totalSec = Math.round(count * 90);
  else if (EXAM_CONF.timeMode === '45s') totalSec = Math.round(count * 45);

  EXAM_SESSION = {
    id: 'exam_' + Date.now(),
    list,
    i: 0,
    userAnswers: {},
    flagged: new Set(),
    startedAt: Date.now(),
    totalSec,
    remainingSec: totalSec,
    timer: null,
    finished: false,
    report: null
  };

  startExamTimer();
  renderActiveExam();
}

function startExamTimer() {
  if (!EXAM_SESSION || EXAM_SESSION.finished || EXAM_SESSION.remainingSec <= 0 || EXAM_SESSION.timer) return;
  EXAM_SESSION.timer = setInterval(() => {
    if (!EXAM_SESSION || EXAM_SESSION.finished) return;
    EXAM_SESSION.remainingSec--;
    updateExamTimerUI();
    if (EXAM_SESSION.remainingSec <= 0) {
      clearInterval(EXAM_SESSION.timer);
      EXAM_SESSION.timer = null;
      toast('Czas egzaminu dobiegł końca! Przechodzę do podsumowania...');
      finishExam();
    }
  }, 1000);
}

function updateExamTimerUI() {
  const el = $('#examTimer');
  if (!el || !EXAM_SESSION) return;
  const rem = EXAM_SESSION.remainingSec;
  if (rem == null) {
    el.textContent = '⏱️ Bez limitu';
    return;
  }
  const m = Math.floor(Math.max(0, rem) / 60);
  const s = Math.max(0, rem) % 60;
  el.textContent = `⏱️ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  el.classList.toggle('warn', rem <= 300 && rem > 60);
  el.classList.toggle('danger', rem <= 60);
}

let examGridExpanded = false;

function renderActiveExam() {
  const es = EXAM_SESSION;
  if (!es || es.finished) return renderExamSetup();
  startExamTimer();
  const q = es.list[es.i];
  const total = es.list.length;
  const countAnswered = () => Object.keys(es.userAnswers).filter(k => es.userAnswers[k] && es.userAnswers[k].size).length;
  const answeredCount = countAnswered();
  const isFlagged = es.flagged.has(q.id);
  const currentSel = es.userAnswers[q.id] || new Set();
  const multi = q.keys.length > 1;

  main.innerHTML = `
  <!-- Pasek górny egzaminu -->
  <div class="exam-bar">
    <div class="wrap exam-bar-inner">
      <div style="display:flex;align-items:center;gap:.75rem">
        <span class="exam-timer" id="examTimer">⏱️ --:--</span>
        <span style="font-weight:700;font-size:.9rem;color:var(--ink-2)">Pytanie <b>${es.i + 1}</b> z ${total}</span>
      </div>
      <div style="display:flex;align-items:center;gap:.6rem">
        <button class="btn-flag ${isFlagged ? 'active' : ''}" id="btnExamFlag">
          <span>🚩</span><span id="btnExamFlagTxt">${isFlagged ? 'Oznaczone' : 'Oznacz flagą'}</span>
        </button>
        <button class="btn sec sm" id="btnExamQuit" style="color:var(--red)">Zakończ egzamin</button>
      </div>
    </div>
  </div>

  <section class="blk" style="border:0;padding-top:0"><div class="wrap qz">
    <!-- Pasek postępu odpowiedzi -->
    <div class="qprog" id="examProg" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${answeredCount}">
      <i id="examProgFill" style="width:${pct(answeredCount, total)}%"></i>
    </div>
    <div class="exam-pill-head">
      <div class="srcline" style="display:flex;gap:.9rem;flex-wrap:wrap">
        <span>Odpowiedziano: <b id="examAnsCnt">${answeredCount}</b> z ${total}</span>
        <span>Oznaczone do weryfikacji: <b id="examFlagCnt">${es.flagged.size}</b></span>
      </div>
      <button type="button" class="btn sec sm exam-grid-toggle" id="btnExamGridExpand" aria-expanded="${examGridExpanded}">${examGridExpanded ? 'Zwiń ▴' : 'Siatka (' + total + ') ▾'}</button>
    </div>

    <!-- Siatka pytań 1..N -->
    <div class="exam-pill-grid${examGridExpanded ? ' expanded' : ''}" id="examGrid">
      ${es.list.map((item, idx) => {
        const hasAns = es.userAnswers[item.id] && es.userAnswers[item.id].size;
        const fl = es.flagged.has(item.id);
        const cur = idx === es.i;
        return `<button class="exam-q-pill ${cur ? 'active' : ''} ${hasAns ? 'answered' : ''} ${fl ? 'flagged' : ''}" data-idx="${idx}">${idx + 1}</button>`;
      }).join('')}
    </div>

    <!-- Karta pytania -->
    <div class="qbox">
      <div class="tags" style="display:flex;gap:.35rem;flex-wrap:wrap">
        ${modChips(q)}
        <span class="chip">${esc(ASHORT[q.at])}</span>
        ${multi ? '<span class="chip" style="background:var(--amber-l);color:var(--amber);border-color:var(--amber)">Wielokrotny wybór</span>' : ''}
      </div>

      <div class="stemL">${escB(q.stem)}</div>

      <div class="opts" id="examOpts">
        ${q.opts.map((o, idx) => {
          const isSel = currentSel.has(idx);
          return `<button class="opt ${isSel ? 'sel' : ''}" data-i="${idx}">
            <span class="l">${L[idx]}</span>
            <span>${esc(o)}</span>
          </button>`;
        }).join('')}
      </div>

      <div class="acts exam-nav-acts" style="margin-top:1.5rem;justify-content:space-between">
        <button class="btn sec" id="btnPrevQ" ${es.i === 0 ? 'disabled' : ''}>← Poprzednie</button>
        <span class="muted exam-kbd-hint" style="font-size:.84rem;font-weight:700">Skróty: [←] [→] | [F] Flaga</span>
        <button class="btn pri" id="btnNextQ">${es.i + 1 < total ? 'Następne →' : 'Zakończ i podsumuj →'}</button>
      </div>
    </div>
  </div></section>`;

  updateExamTimerUI();

  const examGrid = $('#examGrid');
  const activePill = examGrid ? $('.exam-q-pill.active', examGrid) : null;
  if (examGrid && activePill && !examGridExpanded) {
    examGrid.scrollLeft = Math.max(0, activePill.offsetLeft - (examGrid.clientWidth - activePill.offsetWidth) / 2);
  }

  const gridExpandBtn = $('#btnExamGridExpand');
  if (gridExpandBtn && examGrid) {
    gridExpandBtn.onclick = () => {
      examGridExpanded = !examGridExpanded;
      examGrid.classList.toggle('expanded', examGridExpanded);
      gridExpandBtn.setAttribute('aria-expanded', String(examGridExpanded));
      gridExpandBtn.textContent = examGridExpanded ? 'Zwiń ▴' : `Siatka (${total}) ▾`;
      if (!examGridExpanded && activePill) {
        examGrid.scrollLeft = Math.max(0, activePill.offsetLeft - (examGrid.clientWidth - activePill.offsetWidth) / 2);
      }
    };
  }

  // Nawigacja siatką
  examGrid.onclick = e => {
    const pill = e.target.closest('[data-idx]');
    if (!pill) return;
    es.i = +pill.dataset.idx;
    renderActiveExam();
  };

  // Zaznaczanie opcji odpowiedzi (aktualizacja bez pełnego przeładowania widoku)
  $('#examOpts').onclick = e => {
    const optBtn = e.target.closest('[data-i]');
    if (!optBtn) return;
    const idx = +optBtn.dataset.i;
    let userSet = es.userAnswers[q.id];
    if (!userSet) userSet = es.userAnswers[q.id] = new Set();

    if (multi) {
      userSet.has(idx) ? userSet.delete(idx) : userSet.add(idx);
    } else {
      userSet.clear();
      userSet.add(idx);
    }
    $$('#examOpts .opt').forEach(b => b.classList.toggle('sel', userSet.has(+b.dataset.i)));
    if (activePill) activePill.classList.toggle('answered', userSet.size > 0);
    const cnt = countAnswered();
    const ansEl = $('#examAnsCnt'); if (ansEl) ansEl.textContent = cnt;
    const progEl = $('#examProg'); if (progEl) progEl.setAttribute('aria-valuenow', cnt);
    const fillEl = $('#examProgFill'); if (fillEl) fillEl.style.width = pct(cnt, total) + '%';
  };

  // Flaga (aktualizacja w miejscu)
  $('#btnExamFlag').onclick = () => {
    const nowFlagged = !es.flagged.has(q.id);
    if (nowFlagged) es.flagged.add(q.id); else es.flagged.delete(q.id);
    const btn = $('#btnExamFlag');
    if (btn) btn.classList.toggle('active', nowFlagged);
    const txt = $('#btnExamFlagTxt');
    if (txt) txt.textContent = nowFlagged ? 'Oznaczone' : 'Oznacz flagą';
    if (activePill) activePill.classList.toggle('flagged', nowFlagged);
    const flCnt = $('#examFlagCnt');
    if (flCnt) flCnt.textContent = es.flagged.size;
  };

  // Poprzednie / Następne
  $('#btnPrevQ').onclick = () => {
    if (es.i > 0) {
      es.i--;
      renderActiveExam();
      window.scrollTo(0, 0);
    }
  };

  $('#btnNextQ').onclick = () => {
    if (es.i + 1 < total) {
      es.i++;
      renderActiveExam();
      window.scrollTo(0, 0);
    } else {
      confirmFinishExam();
    }
  };

  // Zakończenie egzaminu
  $('#btnExamQuit').onclick = () => confirmFinishExam();

  function confirmFinishExam() {
    const unanswered = total - Object.keys(es.userAnswers).filter(k => es.userAnswers[k] && es.userAnswers[k].size).length;
    const msg = unanswered > 0
      ? `Pozostało jeszcze ${unanswered} pytań bez odpowiedzi oraz ${es.flagged.size} oznaczonych flagą.\n\nCzy na pewno chcesz zakończyć egzamin i poznać wynik?`
      : `Odpowiedziałeś na wszystkie pytania (${total}).\n\nCzy na pewno chcesz zakończyć egzamin i poznać wynik?`;
    if (confirm(msg)) {
      finishExam();
    }
  }
}

// Obsługa klawiatury dla egzaminu
document.addEventListener('keydown', e => {
  if (!EXAM_SESSION || EXAM_SESSION.finished || current.name !== 'egzamin' || pal?.open) return;
  const tag = (document.activeElement || {}).tagName || '';
  if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (EXAM_SESSION.i > 0) { EXAM_SESSION.i--; renderActiveExam(); }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (EXAM_SESSION.i + 1 < EXAM_SESSION.list.length) { EXAM_SESSION.i++; renderActiveExam(); }
  } else if (e.key.toLowerCase() === 'f') {
    e.preventDefault();
    const q = EXAM_SESSION.list[EXAM_SESSION.i];
    EXAM_SESSION.flagged.has(q.id) ? EXAM_SESSION.flagged.delete(q.id) : EXAM_SESSION.flagged.add(q.id);
    renderActiveExam();
  }
});

function finishExam() {
  if (!EXAM_SESSION) return;
  if (EXAM_SESSION.timer) { clearInterval(EXAM_SESSION.timer); EXAM_SESSION.timer = null; }

  const es = EXAM_SESSION;
  const { score, total, pct: pctScore, passed, byMod, wrongQIds } = scoreExam(es.list, es.userAnswers);
  const durationSec = es.totalSec
    ? Math.max(0, es.totalSec - Math.max(0, es.remainingSec))
    : Math.round((Date.now() - es.startedAt) / 1000);

  const report = {
    id: es.id,
    date: new Date().toISOString(),
    score,
    total,
    pct: pctScore,
    passed,
    durationSec,
    byMod,
    wrongQIds,
    flaggedQIds: [...es.flagged],
    qIds: es.list.map(q => q.id),
    userAnswers: Object.fromEntries(Object.entries(es.userAnswers).map(([k, v]) => [k, [...v]]))
  };

  S.examHistory = Array.isArray(S.examHistory) ? S.examHistory : [];
  S.examHistory.unshift(report);
  if (S.examHistory.length > 40) S.examHistory.pop();
  save();

  es.finished = true;
  es.report = report;

  renderExamReport(report, false);
}

function renderExamReport(rep, isArchive = false) {
  const total = rep.total;
  const score = rep.score;
  const p = rep.pct;
  const passed = rep.passed;
  const wrongCount = rep.wrongQIds.length;
  const flaggedCount = rep.flaggedQIds.length;
  const mins = Math.floor(rep.durationSec / 60);
  const secs = rep.durationSec % 60;
  const timeStr = `${mins} min ${secs} s`;
  const dateStr = new Date(rep.date).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' });

  // Pytania egzaminu
  const questions = rep.qIds.map(id => qById[id]).filter(Boolean);
  let reviewFilter = 'all'; // 'all' | 'wrong' | 'flagged' | 'correct'

  const renderContent = () => {
    main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:920px">
      <div class="eyebrow">${isArchive ? 'Archiwalny wynik egzaminu' : 'Podsumowanie egzaminu'}</div>
      <h2>${passed ? '🎉 Gratulacje! Egzamin zaliczony' : '⚠️ Egzamin niezaliczony'}</h2>
      <p class="lead">${isArchive ? `Podejście z dnia ${dateStr}.` : 'Oficjalny próg zdawalności wynosi 60%. Poniżej znajduje się szczegółowa diagnoza mocnych i słabych modułów oraz pełne omówienie pytań.'}</p>

      <!-- Duża karta wyniku -->
      <div class="exam-summary-card">
        <div style="text-align:center">
          <div class="big" style="color:${passed ? 'var(--green)' : 'var(--red)'}">${p}%</div>
          <div>${passed ? '<span class="exam-badge-pass">Zdany (≥60%)</span>' : '<span class="exam-badge-fail">Niezaliczony (<60%)</span>'}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem">
          <div><div class="muted" style="font-size:.82rem;font-weight:700">Zdobyte punkty</div><b style="font-size:1.3rem">${score} / ${total}</b></div>
          <div><div class="muted" style="font-size:.82rem;font-weight:700">Czas rozwiązywania</div><b style="font-size:1.3rem">${timeStr}</b></div>
          <div><div class="muted" style="font-size:.82rem;font-weight:700">Błędne odpowiedzi</div><b style="font-size:1.3rem;color:var(--red)">${wrongCount}</b></div>
          <div><div class="muted" style="font-size:.82rem;font-weight:700">Oznaczone flagą</div><b style="font-size:1.3rem;color:var(--amber)">${flaggedCount}</b></div>
        </div>
      </div>

      <!-- Akcje główne -->
      <div class="acts" style="margin:1.6rem 0">
        ${wrongCount ? `<button class="btn pri" id="btnTrainWrong">🎯 Trening z błędnych pytań (${wrongCount})</button>` : ''}
        <button class="btn sec" id="btnSaveToNotes">📝 Zapisz błędy do Notatnika</button>
        <button class="btn sec" id="btnNewExam">🔄 Nowy egzamin</button>
        <a class="btn sec" href="#/postep">Historia i postęp</a>
      </div>

      <!-- Diagnoza wg modułów -->
      <h3 style="margin:2.4rem 0 .4rem">Diagnoza gotowości wg modułów</h3>
      <p class="muted" style="margin-bottom:.9rem">Zwróć szczególną uwagę na moduły z wynikiem poniżej 60% – to one decydują o zdaniu egzaminu.</p>
      <div class="card" style="padding:1.2rem">
        <div class="mod-diagnostic-list">
          ${Object.keys(rep.byMod).sort((a, b) => IDX[a] - IDX[b]).map(mId => {
            const data = rep.byMod[mId];
            const modPct = pct(data.correct, data.total);
            const isModPass = modPct >= 60;
            const g = gOf(mId).color;
            return `<div class="mod-diag-row">
              <div style="display:flex;align-items:center;gap:.45rem">
                <span class="chip m" style="color:${g}">[${mId}]</span>
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(SHORT[mId] || mId)}</span>
              </div>
              <div class="meter">
                <i style="width:${modPct}%;background:${isModPass ? 'var(--green)' : 'var(--red)'}"></i>
              </div>
              <div style="text-align:right">
                <span class="mono" style="color:${isModPass ? 'var(--green)' : 'var(--red)'}">${modPct}%</span>
                <small class="muted" style="margin-left:.3rem">(${data.correct}/${data.total})</small>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Przegląd pytań -->
      <h3 style="margin:2.6rem 0 .4rem">Przegląd pytań i klucz odpowiedzi</h3>
      <p class="muted" style="margin-bottom:.9rem">Przeanalizuj swoje odpowiedzi w porównaniu z oficjalnym kluczem i wytycznymi klinicznymi.</p>

      <div class="seg" id="reviewFilterSeg" style="margin-bottom:1.2rem">
        <button data-rf="all" aria-pressed="${reviewFilter === 'all'}">Wszystkie (${total})</button>
        <button data-rf="wrong" aria-pressed="${reviewFilter === 'wrong'}" style="color:var(--red)">Tylko błędne (${wrongCount})</button>
        <button data-rf="flagged" aria-pressed="${reviewFilter === 'flagged'}">Oznaczone flagą (${flaggedCount})</button>
        <button data-rf="correct" aria-pressed="${reviewFilter === 'correct'}" style="color:var(--green)">Poprawne (${score})</button>
      </div>

      <div id="reviewCardsList">
        ${renderReviewCards(questions, rep, reviewFilter)}
      </div>
    </div></section>`;

    attachReportEvents();
  };

  const renderReviewCards = (list, reportData, filter) => {
    let filtered = list;
    if (filter === 'wrong') filtered = filtered.filter(q => reportData.wrongQIds.includes(q.id));
    else if (filter === 'flagged') filtered = filtered.filter(q => reportData.flaggedQIds.includes(q.id));
    else if (filter === 'correct') filtered = filtered.filter(q => !reportData.wrongQIds.includes(q.id));

    if (!filtered.length) {
      return '<div class="card" style="padding:1.6rem;text-align:center"><p class="muted">Brak pytań w tym filtrze.</p></div>';
    }

    return filtered.map((q, idx) => {
      const userSel = reportData.userAnswers[q.id] || [];
      const isCorrect = userSel.length === q.keys.length && q.keys.every(k => userSel.includes(k));
      const isFlagged = reportData.flaggedQIds.includes(q.id);

      return `<div class="exam-review-card" style="border-left:5px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem;flex-wrap:wrap;gap:.4rem">
          <div class="tags" style="display:flex;gap:.35rem;align-items:center">
            <span class="chip" style="font-weight:800;background:${isCorrect ? 'var(--green-l)' : 'var(--red-l)'};color:${isCorrect ? 'var(--green)' : 'var(--red)'}">
              ${isCorrect ? '✓ Poprawna' : '✗ Błędna'}
            </span>
            ${isFlagged ? '<span class="chip" style="background:var(--amber-l);color:var(--amber)">🚩 Flaga</span>' : ''}
            ${modChips(q)}
            <span class="chip">${esc(ASHORT[q.at])}</span>
            ${confChip(q.conf)}
          </div>
          <a class="btn sec sm" href="${atlasHref(q)}" target="_blank" style="font-size:.78rem">Temat w atlasie ↗</a>
        </div>

        <div class="stemL" style="font-size:1.15rem;margin:.5rem 0 .9rem">${escB(q.stem)}</div>

        <div style="margin-bottom:1rem">
          ${q.opts.map((opt, optIdx) => {
            const isUserChoice = userSel.includes(optIdx);
            const isKey = q.keys.includes(optIdx);
            let cls = 'opt-dim';
            let badge = '';

            if (isKey && isUserChoice) {
              cls = 'opt-correct';
              badge = '<b style="color:var(--green);font-size:.8rem;margin-left:auto">✓ Twoja odpowiedź (poprawna)</b>';
            } else if (isKey && !isUserChoice) {
              cls = 'opt-correct';
              badge = '<b style="color:var(--green);font-size:.8rem;margin-left:auto">✓ Prawidłowa odpowiedź</b>';
            } else if (!isKey && isUserChoice) {
              cls = 'opt-wrong';
              badge = '<b style="color:var(--red);font-size:.8rem;margin-left:auto">✗ Twoja odpowiedź</b>';
            }

            return `<div class="opt-review ${cls}">
              <span class="l" style="font-weight:800;min-width:20px">${L[optIdx]}</span>
              <span>${esc(opt)}</span>
              ${badge}
            </div>`;
          }).join('')}
        </div>

        ${explain(q)}
      </div>`;
    }).join('');
  };

  const attachReportEvents = () => {
    // Filtr zakładek
    $$('#reviewFilterSeg button').forEach(b => {
      b.onclick = () => {
        reviewFilter = b.dataset.rf;
        $$('#reviewFilterSeg button').forEach(x => x.setAttribute('aria-pressed', x === b));
        $('#reviewCardsList').innerHTML = renderReviewCards(questions, rep, reviewFilter);
      };
    });

    // Trening z błędów
    const btnTrain = $('#btnTrainWrong');
    if (btnTrain) {
      btnTrain.onclick = () => {
        const ids = rep.wrongQIds;
        location.hash = '#/trening';
        setTimeout(() => startSession(ids), 50);
      };
    }

    // Zapisz do notatek
    const btnNote = $('#btnSaveToNotes');
    if (btnNote) {
      btnNote.onclick = () => {
        const wrongQs = rep.wrongQIds.map(id => qById[id]).filter(Boolean);
        const md = `# Podsumowanie błędów egzaminu (${new Date(rep.date).toLocaleDateString('pl-PL')})
**Wynik:** ${rep.pct}% (${rep.score}/${rep.total}) · Status: ${rep.passed ? 'ZDANY' : 'NIEZDANY'}
**Czas:** ${timeStr}

## Błędne pytania do powtórzenia (${wrongQs.length}):

${wrongQs.map((q, idx) => `### ${idx + 1}. [${q.pm || 'Moduł'}] ${q.stem.slice(0, 90)}...
- **Prawidłowa odpowiedź:** ${q.keys.map(k => `${L[k]}: ${q.opts[k]}`).join('; ')}
- **Wyjaśnienie:** ${q.why || q.tip || 'Brak omówienia'}
`).join('\n---\n\n')}
`;
        const notes = getNotes();
        const note = {
          id: 'note_' + Date.now(),
          title: `Błędy z egzaminu (${rep.pct}%, ${new Date(rep.date).toLocaleDateString('pl-PL')})`,
          content: md,
          mod: 'all',
          updatedAt: Date.now()
        };
        notes.unshift(note);
        saveNotes(notes);
        toast('Utworzono notatkę z błędnymi pytaniami!');
        location.hash = '#/notatki?id=' + note.id;
      };
    }

    // Nowy egzamin
    const btnNew = $('#btnNewExam');
    if (btnNew) {
      btnNew.onclick = () => {
        EXAM_SESSION = null;
        location.hash = '#/egzamin';
        renderExamSetup();
      };
    }
  };

  renderContent();
}

/* Moduły kliniczne (Kalkulator, Pacjent SOR, OSCE, Badania) wydzielone do js/clinical-*.js */
/* ---------- KALENDARZ BADAŃ W CIĄŻY (STANDARD MZ / PTGiP) ---------- */
let CAL_TRIMESTER = 'all';

function viewKalendarz() {
  const calendar = (PREGNANCY_CALENDAR && PREGNANCY_CALENDAR.length) ? PREGNANCY_CALENDAR : [
    { id: 'v1', trimester: '1', period: 'Do 10 Hbd', title: 'Pierwsza wizyta ciążowa i założenie karty ciąży', badge: 'I trymestr', mandatoryTests: ['Grupa krwi i Rh + przeciwciała odpornościowe', 'Morfologia krwi, badanie ogólne moczu', 'Glukoza na czczo (OGTT od razu u grupy ryzyka GDM)', 'TSH, VDRL (kiła), HIV, HCV, różyczka IgG/IgM, toksoplazmoza IgG/IgM', 'Cytologia (jeśli nie wykonano w ostatnich 6 mies.)'], clinicalExam: ['Pomiar BP, masy ciała, BMI, badanie ginekologiczne i piersi', 'Ocena ryzyka ciążowego'], counseling: ['Kwas foliowy 0,4 mg/d (4 mg przy WCN w wywiadzie)', 'Witamina D3 2000 j.m., jod 150–200 µg, kwasy DHA'] },
    { id: 'v2', trimester: '1', period: '11+0 – 13+6 Hbd', title: 'USG I trymestru (genetyczne) i test złożony', badge: 'I trymestr', mandatoryTests: ['USG I trymestru (CRL 45–84 mm, NT, NB, czynność serca)', 'Test podwójny (PAPP-A + wolne β-hCG) — refundowany wg programu badań prenatalnych', 'Ocena ryzyka preeklampsji (FMF → ASA 150 mg przed 16 Hbd u grupy ryzyka!)'], clinicalExam: ['Pomiar BP, masy ciała, weryfikacja terminu porodu wg CRL'], counseling: ['Najdokładniejsze okno ustalenia wieku ciążowego (CRL)'] },
    { id: 'v3', trimester: '2', period: '15 – 20 Hbd', title: 'Kontrola II trymestru', badge: 'II trymestr', mandatoryTests: ['Morfologia krwi, badanie ogólne moczu'], clinicalExam: ['Pomiar BP, masy ciała, ocena czynności serca płodu'], counseling: ['Obserwacja pierwszych ruchów płodu (~18–20 Hbd)'] },
    { id: 'v4', trimester: '2', period: '18 – 22 Hbd', title: 'USG połówkowe (anatomiczne) + ocena szyjki', badge: 'II trymestr', mandatoryTests: ['Szczegółowa ocena anatomii płodu (serce, OUN, nerki, kręgosłup)', 'Ocena lokalizacji łożyska i ilości płynu owodniowego', 'Pomiar długości szyjki macicy (CL) w USG TV u kobiet z ryzykiem porodu przedwczesnego'], clinicalExam: ['BP, masa ciała, tętno płodu'], counseling: ['Przy CL ≤25 mm rozważ progesteron dopochwowy'] },
    { id: 'v5', trimester: '2', period: '24 – 26 Hbd', title: 'Test obciążenia glukozą (OGTT 75g) i toksoplazmoza', badge: 'II trymestr', mandatoryTests: ['OGTT 75g (na czczo, 1 h, 2 h) wg PTGiP/IADPSG', 'Badanie ogólne moczu, przeciwciała anty-Rh u Rh(-)', 'Toksoplazmoza IgG (jeśli ujemna w I trymestrze)'], clinicalExam: ['BP, masa ciała, wysokość dna macicy (SFH)'], counseling: ['Edukacja żywieniowa i aktywność fizyczna'] },
    { id: 'v6', trimester: '3', period: '27 – 32 Hbd', title: 'USG III trymestru, profilaktyka anty-D i szczepienie Tdap', badge: 'III trymestr', mandatoryTests: ['USG III trymestru (28–32 Hbd): wzrastanie płodu (EFW), położenie, łożysko, AFI', 'Morfologia, badanie ogólne moczu, przeciwciała anty-D u Rh(-)'], clinicalExam: ['BP, obrzęki, masa ciała, czynność serca płodu'], counseling: ['Immunoglobulina anty-D (300 µg i.m.) w 28–30 Hbd u Rh(-) bez przeciwciał!', 'Szczepienie przeciw krztuścowi (Tdap) w 27–36 Hbd (bezpłatne dla ciężarnych)'] },
    { id: 'v7', trimester: '3', period: '33 – 37 Hbd', title: 'Posiew w kierunku GBS i badania zakaźne przed porodem', badge: 'III trymestr', mandatoryTests: ['Posiew z pochwy i odbytu w kierunku GBS (35–37 Hbd)', 'HBsAg, HIV, HCV (u grup ryzyka), VDRL, morfologia, badanie ogólne moczu'], clinicalExam: ['Ocena położenia płodu (chwyty Leopolda), BP, ocena ruchów płodu'], counseling: ['Plan porodu, szczepienie RSV (32–36 Hbd), liczenie ruchów płodu (≥10 ruchów/2 h)'] },
    { id: 'v8', trimester: '3', period: '38 – 40+ Hbd', title: 'Opieka okołoterminowa, KTG i kwalifikacja do indukcji', badge: 'Termin', mandatoryTests: ['Zapis KTG i badanie USG (AFI, EFW) od 40 Hbd', 'Morfologia i badanie ogólne moczu'], clinicalExam: ['Ocena dojrzałości szyjki w skali Bishopa, BP, kontrola obrzęków'], counseling: ['Hospitalizacja po 41+0 Hbd, preindukcja / indukcja wg rekomendacji PTGiP'] }
  ];

  const vaccines = (PREGNANCY_VACCINES && PREGNANCY_VACCINES.length) ? PREGNANCY_VACCINES : [
    { name: 'Krztusiec, błonica, tężec (Tdap)', timing: '27–36 Hbd (w każdej ciąży)', status: 'Zalecana (bezpłatna)', safe: true, desc: 'Przezłożyskowy transfer przeciwciał chroni noworodka w pierwszych miesiącach życia przed ciężkim krztuścem.' },
    { name: 'Grypa (inaktywowana IIV)', timing: 'Dowolny trymestr w sezonie jesienno-zimowym', status: 'Zalecana', safe: true, desc: 'Chroni ciężarną przed ciężkim zapaleniem płuc i hospitalizacją oraz daje odporność bierną noworodkowi.' },
    { name: 'RSV (szczepionka podjednostkowa)', timing: '32–36 Hbd', status: 'Zalecana (PTGiP)', safe: true, desc: 'Ochrona niemowląt przed ciężkim zapaleniem oskrzelików RSV w pierwszych 6 mies. życia.' },
    { name: 'COVID-19 (mRNA)', timing: 'Dowolny trymestr', status: 'Zalecana', safe: true, desc: 'Redukuje ryzyko ciężkiego przebiegu, stanu przedrzucawkowego i porodu przedwczesnego.' },
    { name: 'Szczepionki żywe (MMR, ospa VZV, BCG, żółta gorączka)', timing: 'Przeciwwskazane w ciąży', status: 'ZAKAZ w ciąży', safe: false, desc: 'Teoretyczne ryzyko zakażenia płodu. Po szczepieniu żywym należy odroczyć zajście w ciążę o 4 tygodnie.' }
  ];

  const render = () => {
    const filtered = CAL_TRIMESTER === 'all' ? calendar : calendar.filter(x => String(x.trimester) === CAL_TRIMESTER);
    main.innerHTML = `<section class="blk" style="border:0"><div class="wrap">
      <h2>Kalendarz badań w ciąży i profilaktyka (MZ / PTGiP)</h2>
      <p class="lead">Standard Organizacyjny Opieki Okołoporodowej w Polsce krok po kroku: obowiązkowe badania laboratoryjne i USG, profilaktyka konfliktu Rh, GBS oraz szczepienia w ciąży.</p>

      <div class="trimester-strip">
        <div class="trimester-card"><b>11–13+6 Hbd</b><span>USG I trymestru (CRL 45–84 mm) + test złożony</span></div>
        <div class="trimester-card"><b>24–26 Hbd</b><span>Test OGTT 75g (PTGiP: 92 / 180 / 153 mg/dl)</span></div>
        <div class="trimester-card"><b>28–30 Hbd</b><span>Immunoglobulina anty-D (300 µg) u Rh(-)</span></div>
        <div class="trimester-card"><b>35–37 Hbd</b><span>Wymaz pochwowo-odbytniczy na GBS</span></div>
      </div>

      <div class="seg" id="calFilterSeg" style="margin-bottom:1.4rem">
        <button data-cf="all" aria-pressed="${CAL_TRIMESTER === 'all'}">Cała ciąża (${calendar.length} etapów)</button>
        <button data-cf="1" aria-pressed="${CAL_TRIMESTER === '1'}">I trymestr (≤13+6 Hbd)</button>
        <button data-cf="2" aria-pressed="${CAL_TRIMESTER === '2'}">II trymestr (14–27 Hbd)</button>
        <button data-cf="3" aria-pressed="${CAL_TRIMESTER === '3'}">III trymestr (≥28 Hbd)</button>
      </div>

      <div class="pso-container">
        <div class="timeline-pso">
          ${filtered.map(item => `
            <div class="pso-node">
              <span class="pso-dot"></span>
              <div class="pso-card">
                <div class="pso-header">
                  <div>
                    <span class="pso-age mono">${esc(item.period)}</span>
                    <b style="margin-left:.6rem;font-size:1rem;color:var(--ink)">${esc(item.title)}</b>
                  </div>
                  <span class="chip">${esc(item.badge || ('Trymestr ' + item.trimester))}</span>
                </div>
                <div class="grid2" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:1rem;margin-top:.8rem">
                  <div>
                    <div style="font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--teal-d);margin-bottom:.35rem">Badania obowiązkowe</div>
                    <ul style="padding-left:1.1rem;font-size:.9rem;color:var(--ink-2)">
                      ${(item.mandatoryTests || []).map(t => `<li style="margin:.2rem 0">${esc(t)}</li>`).join('')}
                    </ul>
                  </div>
                  <div>
                    <div style="font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-2);margin-bottom:.35rem">Badanie i profilaktyka</div>
                    <ul style="padding-left:1.1rem;font-size:.9rem;color:var(--ink-2)">
                      ${(item.clinicalExam || []).map(t => `<li style="margin:.2rem 0">${esc(t)}</li>`).join('')}
                      ${(item.counseling || []).map(t => `<li style="margin:.2rem 0"><b>${esc(t)}</b></li>`).join('')}
                    </ul>
                  </div>
                </div>
                ${item.redFlag ? `<div class="callout red" style="margin-top:.8rem;font-size:.86rem"><b>Uwaga kliniczna:</b> ${esc(item.redFlag)}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <h3 style="margin:2.6rem 0 .4rem;font-family:var(--font-display);font-size:1.5rem">Szczepienia w ciąży (zalecane vs przeciwwskazane)</h3>
      <p class="muted" style="margin-bottom:1rem">Szczepionki inaktywowane i podjednostkowe są bezpieczne i zalecane; szczepionki żywe atenuowane są przeciwwskazane w ciąży.</p>
      <div class="agrid">
        ${vaccines.map(v => {
          const isSafe = v.safe !== undefined ? !!v.safe : (v.status !== 'contraindicated' && v.status !== 'forbidden');
          const timing = v.window || v.timing || '';
          const badge = v.statusLabel || v.status || (isSafe ? 'Zalecana' : 'Przeciwwskazana');
          const desc = [v.mechanism, v.note || v.desc].filter(Boolean).join(' ');
          return `
          <div class="card" style="box-shadow:var(--shadow),inset 0 3px 0 0 ${isSafe ? 'var(--green)' : 'var(--red)'}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.4rem">
              <b>${esc(v.name)}</b>
              <span class="chip" style="background:${isSafe ? 'var(--green-l)' : 'var(--red-l)'};color:${isSafe ? 'var(--green)' : 'var(--red)'};border-color:transparent">${esc(badge)}</span>
            </div>
            <div class="mono" style="font-size:.82rem;color:var(--teal-d);font-weight:700;margin-bottom:.35rem">${esc(timing)}</div>
            <p class="srcline" style="color:var(--ink-2)">${esc(desc)}</p>
          </div>`;
        }).join('')}
      </div>

      <div class="card" style="margin-top:2rem;padding:1.3rem">
        <h3 style="margin-bottom:.4rem">Szybki planer wizyty wg tygodnia ciąży (Hbd)</h3>
        <p class="muted" style="margin-bottom:.9rem">Przesuń suwak, aby sprawdzić, jakie badania i profilaktykę należy zaplanować w danym tygodniu ciąży.</p>
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem">
          <label for="hbdSlider" style="font-weight:700">Wiek ciążowy:</label>
          <input id="hbdSlider" type="range" min="6" max="41" value="28" style="flex:1;min-width:180px;accent-color:var(--teal)">
          <span id="hbdVal" class="mono" style="font-weight:800;font-size:1.15rem;color:var(--teal-d);min-width:74px">28 Hbd</span>
        </div>
        <div id="hbdPlanOut" style="background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:1rem"></div>
      </div>
    </div></section>`;

    $$('#calFilterSeg button').forEach(b => {
      b.onclick = () => { CAL_TRIMESTER = b.dataset.cf; render(); };
    });

    const updatePlan = w => {
      const valEl = $('#hbdVal'), outEl = $('#hbdPlanOut');
      if (valEl) valEl.textContent = `${w} Hbd`;
      if (!outEl) return;
      let idx = 0;
      if (w <= 10) idx = 0;
      else if (w <= 14) idx = 1;
      else if (w <= 17) idx = 2;
      else if (w <= 22) idx = 3;
      else if (w <= 26) idx = 4;
      else if (w <= 32) idx = 5;
      else if (w <= 37) idx = 6;
      else idx = 7;
      const item = calendar[Math.min(idx, calendar.length - 1)];
      outEl.innerHTML = `<div style="font-weight:800;color:var(--teal-d);margin-bottom:.35rem">${esc(item.period)} — ${esc(item.title)}</div>
        <ul style="padding-left:1.1rem;font-size:.9rem;color:var(--ink-2)">${(item.mandatoryTests || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        ${(item.counseling || []).length ? `<p class="srcline" style="margin-top:.5rem"><b>Kluczowe działania:</b> ${esc(item.counseling.join(' · '))}</p>` : ''}`;
    };
    const sl = $('#hbdSlider');
    if (sl) {
      sl.oninput = () => updatePlan(+sl.value);
      updatePlan(+sl.value);
    }
  };
  render();
}

/* ---------- TRENING ---------- */
function viewTrening(parts, params) {
  if (pendingRetryIds) {
    const ids = pendingRetryIds;
    pendingRetryIds = null;
    SESSION = null;
    startSession(ids);
    return;
  }
  if (pendingAutoTrain) {
    pendingAutoTrain = false;
    SESSION = null;
    startSession();
    return;
  }
  if (params.at !== undefined || params.mods !== undefined || params.wrong || params.auto || params.gap || params.bank || params.mode) {
    C.at = new Set((params.at || '').split(',').filter(Boolean)); C.mods = new Set((params.mods || '').split(',').filter(Boolean));
    C.banks = new Set((params.bank || '').split(',').filter(Boolean));
    if (params.mode) C.mode = params.mode;
    C.wrong = !!params.wrong; C.gap = !!params.gap; C.conf = new Set(); C.bm = false; C.fresh = false; C.open = params.mode === 'flash' || !!params.open;
    SESSION = null;
    if (params.auto) { startSession(); return; }
    history.replaceState && (() => { try { history.replaceState(null, '', '#/trening'); } catch (e) { /* tryb piaskownicy */ } })();
  }
  if (SESSION) return renderSession();
  renderConfig();
}
function renderConfig() {
  const countTrainAdv = () => C.conf.size + (C.includeUnverified ? 1 : 0) + (C.fresh ? 1 : 0) + (C.open ? 1 : 0);
  const advCnt = countTrainAdv();
  main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:900px">
    <div class="eyebrow">Trening mieszany</div><h2>Ułóż sesję</h2>
    <p class="lead">Pytania pochodzą ze wszystkich atlasów naraz. W trybie nauki omówienie pojawia się od razu, w trybie egzaminu dopiero na końcu, a w trybie fiszek trenujesz aktywne przypominanie.</p>
    <div class="tool">
      <div class="frow"><span class="flab">Bank</span><div class="pillrow" id="cBank">${Object.keys(BANKS).map(b => `<button class="tgl" data-v="${b}" aria-pressed="${C.banks.has(b)}">${BANKS[b].icon} ${BANKS[b].short} (${Q.filter(q => q.bank === b).length})</button>`).join('')}</div></div>
      <div class="frow"><span class="flab">Atlas</span><div class="pillrow" id="cAt">${ATLASES.map(a => `<button class="tgl" data-v="${a.id}" aria-pressed="${C.at.has(a.id)}">${a.tag} ${esc(ASHORT[a.id])}</button>`).join('')}</div></div>
      ${C.mods.size ? `<div class="frow"><span class="flab">Moduły</span><div class="pillrow">${[...C.mods].map(m => `<button class="tgl" data-rm="${m}" aria-pressed="true">[${m}] ${esc(SHORT[m] || m)} ✕</button>`).join('')}</div></div>` : ''}
      <div class="frow" id="cFlag"><span class="flab">Tylko</span><div class="pillrow"><button class="tgl" data-f="hitsOnly" aria-pressed="${C.hitsOnly}">🔥 hity bazy (≥2)</button><button class="tgl" data-f="gap" aria-pressed="${C.gap}">klucz ≠ wytyczne</button><button class="tgl" data-f="wrong" aria-pressed="${C.wrong}">moje błędne</button><button class="tgl" data-f="bm" aria-pressed="${C.bm}">zakładki</button></div></div>
      <div class="frow"><span class="flab">Liczba</span><div class="seg" id="cN">${[10, 20, 40, 0].map(n => `<button data-n="${n}" aria-pressed="${C.n === n}">${n || 'Wszystkie'}</button>`).join('')}</div>
        <span class="flab" style="min-width:0;margin-left:1rem">Tryb</span><div class="seg" id="cMode"><button data-m="learn" aria-pressed="${C.mode === 'learn'}">Nauka</button><button data-m="exam" aria-pressed="${C.mode === 'exam'}">Egzamin</button><button data-m="flash" aria-pressed="${C.mode === 'flash'}">🃏 Fiszki</button></div></div>
      <details class="adv-filters" id="cAdv"${C.advOpen || advCnt > 0 ? ' open' : ''}>
        <summary><span id="cAdvLabel">Filtry zaawansowane: pewność klucza i flagi techniczne${advCnt ? ` (${advCnt} aktywne)` : ''}</span></summary>
        <div class="adv-body">
          <div class="frow"><span class="flab">Klucz</span><div class="pillrow" id="cConf">${Object.keys(CONF).filter(k => Q.some(q => q.conf === k)).map(k => `<button class="tgl" data-v="${k}" aria-pressed="${C.conf.has(k)}">${CONF[k].n}</button>`).join('')}</div></div>
          <div class="frow" id="cAdvFlags"><span class="flab">Flagi</span><div class="pillrow"><button class="tgl" data-f="fresh" aria-pressed="${C.fresh}">jeszcze nie ruszone</button><button class="tgl" data-f="open" aria-pressed="${C.open}">z fiszkami (otwarte)</button><button class="tgl" data-f="includeUnverified" aria-pressed="${C.includeUnverified}">uwzględnij bez klucza</button></div></div>
        </div>
      </details>
      <div class="frow" style="justify-content:space-between;border-top:1px solid var(--line-2);padding-top:.9rem"><span id="cPool" style="font-weight:800"></span><button class="btn pri" id="go">Rozpocznij sesję →</button></div>
    </div></div></section>`;
  const cAdv = $('#cAdv');
  const cAdvLabel = $('#cAdvLabel');
  if (cAdv) cAdv.addEventListener('toggle', () => { C.advOpen = cAdv.open; });
  const upd = () => {
    const p = pool().length;
    $('#cPool').textContent = p ? `Pula: ${p} ${p === 1 ? 'pytanie' : 'pytań'}` : 'Pula pusta, poluzuj filtry';
    $('#go').disabled = !p;
    if (cAdvLabel) {
      const c = countTrainAdv();
      cAdvLabel.textContent = `Filtry zaawansowane: pewność klucza i flagi techniczne${c ? ` (${c} aktywne)` : ''}`;
    }
  };
  const tgl = (sel, set) => $(sel).addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; const v = b.dataset.v; set.has(v) ? set.delete(v) : set.add(v); b.setAttribute('aria-pressed', set.has(v)); upd(); });
  tgl('#cBank', C.banks); tgl('#cAt', C.at); tgl('#cConf', C.conf);
  const handleCFlag = e => { const b = e.target.closest('[data-f]'); if (!b) return; C[b.dataset.f] = !C[b.dataset.f]; b.setAttribute('aria-pressed', C[b.dataset.f]); upd(); };
  $('#cFlag').addEventListener('click', handleCFlag);
  $('#cAdvFlags').addEventListener('click', handleCFlag);
  $('#cN').addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (!b) return; C.n = +b.dataset.n; $$('#cN button').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  $('#cMode').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; C.mode = b.dataset.m; $$('#cMode button').forEach(x => x.setAttribute('aria-pressed', x === b)); upd(); });
  $$('[data-rm]').forEach(b => b.addEventListener('click', () => { C.mods.delete(b.dataset.rm); renderConfig(); }));
  $('#go').addEventListener('click', () => startSession());
  upd();
}
function startSession(ids) {
  let list = ids ? ids.map(i => qById[i]).filter(Boolean) : shuffle(pool());
  if (!ids && C.n) list = list.slice(0, C.n);
  if (!list.length) { renderConfig(); return; }
  SESSION = { list, i: 0, log: [], history: {}, mode: C.mode, locked: false, sel: new Set() };
  renderSession();
}
function goSessionPrev() {
  const s = SESSION;
  if (!s || s.i <= 0) return;
  s.i--;
  const prev = s.history && s.history[s.i];
  s.locked = !!prev;
  s.sel = new Set(prev ? prev.sel : []);
  renderSession();
  window.scrollTo(0, 0);
}
function renderSession() {
  const s = SESSION; if (!s) return renderConfig();
  if (s.i >= s.list.length) return renderResults();
  const q = s.list[s.i], done = s.locked, learn = s.mode === 'learn', isFlash = s.mode === 'flash';
  const good = s.log.filter(x => x.ok).length;
  const prevBtnHtml = s.i > 0 ? '<button type="button" class="btn sec sm" id="prevQ">← Poprzednie</button>' : '';
  let body = '';
  if (q.type === 'open' || isFlash) {
    if (isFlash && q.type !== 'open' && q.opts && q.opts.length) {
      body = `<div class="opts" id="opts">${q.opts.map((o, i) => {
        let cls = ''; if (done) cls = q.keys.includes(i) ? 'ok' : 'dim';
        return `<div class="opt ${cls}" style="cursor:default"><span class="l">${L[i]}</span><span>${esc(o)}</span></div>`;
      }).join('')}</div>`;
      if (!done) {
        body += `<div class="acts" style="margin-top:1.2rem">${prevBtnHtml}<button class="btn pri" id="reveal">Pokaż klucz i omówienie ▾</button></div>`;
      } else {
        body += explain(q);
        body += `<div class="acts" id="flashEvalRow" style="display:flex;gap:.8rem;align-items:center;background:var(--surface);padding:.9rem 1.1rem;border-radius:10px;border:1px solid var(--line);margin-top:1.2rem;flex-wrap:wrap">
          ${prevBtnHtml}
          <span style="font-weight:700">Twoja samoocena:</span>
          <button class="btn pri sm" id="flashYes" style="background:var(--green);border-color:var(--green);color:var(--ink-inv);font-weight:700">Znam to ✓</button>
          <button class="btn sec sm" id="flashNo" style="border-color:var(--red);color:var(--red);font-weight:700">Muszę powtórzyć ✗</button>
          <span style="flex:1"></span>
          <button class="bm" data-bm="${q.id}" aria-pressed="${!!S.bm[q.id]}" aria-label="Zakładka"><svg width="16" height="16" viewBox="0 0 16 16" fill="${S.bm[q.id] ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M3.5 2h9v12L8 11 3.5 14z"/></svg></button>
        </div>`;
      }
    } else {
      body = done ? `${explain(q)}<div class="acts trening-next-sticky" id="nextRow"></div>` : `<div class="acts" style="margin-top:1rem">${prevBtnHtml}<button class="btn dark" id="reveal">Pokaż odpowiedź i omówienie ▾</button></div>`;
    }
  } else {
    const multi = q.keys.length > 1;
    body = `${multi ? '<p class="srcline" style="margin-bottom:.5rem">Zadanie wielokrotnego wyboru: zaznacz wszystkie poprawne odpowiedzi.</p>' : ''}<div class="opts" id="opts">${q.opts.map((o, i) => {
      let cls = ''; if (done) { if (learn) cls = q.keys.includes(i) ? 'ok' : (s.sel.has(i) ? 'bad' : 'dim'); else cls = s.sel.has(i) ? 'sel' : ''; } else if (s.sel.has(i)) cls = 'sel';
      return `<button class="opt ${cls}" data-i="${i}" ${done ? 'disabled' : ''}><span class="l">${L[i]}</span><span>${esc(o)}</span></button>`;
    }).join('')}</div>${!done && multi ? '<div class="acts" style="margin-top:.7rem"><button class="btn dark" id="check" ' + (s.sel.size ? '' : 'disabled') + '>Sprawdź</button></div>' : ''}${done && learn ? explain(q) : ''}${done && !learn ? '<p class="srcline">Odpowiedź zapisana. Omówienie zobaczysz po zakończeniu sesji.</p>' : ''}<div class="acts${done ? ' trening-next-sticky' : ''}" id="nextRow">${!done && prevBtnHtml ? prevBtnHtml : ''}</div>`;
  }
  const modeLabel = s.mode === 'learn' ? 'tryb nauki' : (s.mode === 'flash' ? '🃏 tryb fiszek' : 'tryb egzaminu');
  main.innerHTML = `<section class="blk" style="border:0"><div class="wrap qz">
    <div class="qprog" role="progressbar" aria-valuemin="0" aria-valuemax="${s.list.length}" aria-valuenow="${s.i}"><i style="width:${100 * s.i / s.list.length}%"></i></div>
    <div class="qhead"><span>Pytanie ${s.i + 1} z ${s.list.length} · ${modeLabel}</span><span>${learn || isFlash || !done ? `Poprawne: ${good}/${s.log.length}` : ''}</span><button class="btn sec sm" id="quit">Zakończ sesję</button></div>
    <div class="qbox"><div class="tags" style="display:flex;gap:.3rem;flex-wrap:wrap">
      ${bankChip(q.bank)}
      ${modChips(q)}
      ${q.reps >= 2 ? `<span class="chip hit">🔥 Hit (${q.reps}x)</span>` : ''}
      ${q.gap ? `<span class="chip gap">⚠️ klucz ≠ wytyczne</span>` : ''}
      ${q.isGlued ? `<span class="chip glued">⚠️ OCR łączone</span>` : ''}
      ${learn || isFlash || q.type === 'open' ? confChip(q.conf) : ''}
      <span class="chip">${esc(ASHORT[q.at] || q.at || 'Moduł')}</span>
    </div>
    <div class="stemL">${escB(q.stem)}</div>${body}</div>
    <p class="srcline exam-kbd-hint" style="margin-top:.6rem">Skróty klawiszowe: <kbd>1–5</kbd> / <kbd>A–E</kbd> wybór · <kbd>Enter</kbd> / <kbd>Spacja</kbd> zatwierdź / dalej · <kbd>←</kbd> / <kbd>→</kbd> nawigacja</p>
  </div></section>`;
  const bindPrev = () => { const p = $('#prevQ'); if (p) p.onclick = goSessionPrev; };
  bindPrev();
  const nextBtn = () => {
    $('#nextRow').innerHTML = `${prevBtnHtml}<a class="btn sec sm" href="${atlasHref(q)}" target="_self">Temat w atlasie</a><button class="bm" data-bm="${q.id}" aria-pressed="${!!S.bm[q.id]}" aria-label="Zakładka"><svg width="16" height="16" viewBox="0 0 16 16" fill="${S.bm[q.id] ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M3.5 2h9v12L8 11 3.5 14z"/></svg></button><span style="flex:1"></span><button class="btn pri" id="next">${s.i + 1 < s.list.length ? 'Dalej →' : 'Zobacz wynik →'}</button>`;
    bindPrev();
    $('#next').focus({ preventScroll: true });
    $('#next').onclick = () => {
      s.i++;
      const nxt = s.history && s.history[s.i];
      s.locked = !!nxt;
      s.sel = new Set(nxt ? nxt.sel : []);
      renderSession();
      window.scrollTo(0, 0);
    };
  };
  $('#quit').onclick = () => {
    const rem = s.list.length - s.i - (done ? 1 : 0);
    if (rem > 0) {
      const noun = rem === 1 ? 'pytanie' : (rem % 10 >= 2 && rem % 10 <= 4 && (rem % 100 < 12 || rem % 100 > 14)) ? 'pytania' : 'pytań';
      if (!confirm(`Przerwać bieżącą sesję? Odpowiedziano na ${s.log.length} z ${s.list.length} pytań — pozostałe ${rem} ${noun} zostanie pominiętych.`)) return;
    }
    s.i = s.list.length;
    renderSession();
  };
  function record(ok) {
    s.history = s.history || {};
    if (!s.history[s.i]) {
      s.log.push({ id: q.id, ok, sel: [...s.sel] });
      recordQAns(q.id, ok);
    }
    s.history[s.i] = { ok, sel: [...s.sel] };
    s.locked = true;
  }
  if (isFlash && q.type !== 'open' && q.opts && q.opts.length) {
    if (!done) {
      $('#reveal').onclick = () => { s.locked = true; renderSession(); };
    } else {
      $('#flashYes').onclick = () => { s.sel = new Set(q.keys); record(true); s.locked = false; s.i++; renderSession(); window.scrollTo(0, 0); };
      $('#flashNo').onclick = () => { s.sel = new Set(); record(false); s.locked = false; s.i++; renderSession(); window.scrollTo(0, 0); };
    }
    return;
  }
  if (q.type === 'open') {
    if (!done) { $('#reveal').onclick = () => { s.locked = true; renderSession(); }; }
    else { $('#nextRow').innerHTML = `${prevBtnHtml}<span class="muted" style="font-weight:700">Czy znałeś odpowiedź?</span><button class="btn pri sm" id="yes" style="background:var(--green);border-color:var(--green);color:var(--ink-inv)">Tak ✓</button><button class="btn sec sm" id="no" style="border-color:var(--red);color:var(--red)">Nie ✗</button>`; bindPrev(); $('#yes').onclick = () => { s.sel = new Set(); record(true); s.locked = false; s.i++; renderSession(); window.scrollTo(0, 0); }; $('#no').onclick = () => { s.sel = new Set(); record(false); s.locked = false; s.i++; renderSession(); window.scrollTo(0, 0); }; }
    return;
  }
  const multi = q.keys.length > 1;
  if (!done) {
    $('#opts').addEventListener('click', e => {
      const b = e.target.closest('[data-i]'); if (!b) return; const i = +b.dataset.i;
      if (multi) { s.sel.has(i) ? s.sel.delete(i) : s.sel.add(i); b.classList.toggle('sel'); $('#check').disabled = !s.sel.size; return; }
      s.sel = new Set([i]); record(i === q.keys[0]); renderSession(); nextBtn();
    });
    if (multi) $('#check').onclick = () => { const ok = s.sel.size === q.keys.length && q.keys.every(k => s.sel.has(k)); record(ok); renderSession(); nextBtn(); };
  } else nextBtn();
}
document.addEventListener('keydown', e => {
  if (!SESSION || current.name !== 'trening' || SESSION.i >= SESSION.list.length) return;
  if (pal?.open || e.ctrlKey || e.metaKey || e.altKey) return;
  const ae = document.activeElement;
  const tag = (ae || {}).tagName || '';
  if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;

  const s = SESSION;
  const q = s.list[s.i];
  const key = e.key;
  const low = key.toLowerCase();

  if (key === 'ArrowLeft') {
    if (s.i > 0) { e.preventDefault(); goSessionPrev(); }
    return;
  }
  if (key === 'ArrowRight') {
    const nxt = $('#next');
    if (s.locked && nxt) { e.preventDefault(); nxt.click(); }
    return;
  }
  if (!s.locked && q && q.type !== 'open' && s.mode !== 'flash') {
    let optIdx = -1;
    if (/^[1-5]$/.test(key)) optIdx = +key - 1;
    else if (/^[a-e]$/.test(low)) optIdx = 'abcde'.indexOf(low);
    if (optIdx >= 0 && q.opts && optIdx < q.opts.length) {
      const btn = $(`#opts [data-i="${optIdx}"]`);
      if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
      return;
    }
  }
  if (key === 'Enter' || key === ' ') {
    if (/BUTTON|A/.test(tag)) return;
    if (!s.locked) {
      const revealBtn = $('#reveal');
      if (revealBtn) { e.preventDefault(); revealBtn.click(); return; }
      const checkBtn = $('#check');
      if (checkBtn && !checkBtn.disabled) { e.preventDefault(); checkBtn.click(); }
    } else {
      const nxt = $('#next');
      if (nxt) { e.preventDefault(); nxt.click(); }
    }
  }
});
function renderResults() {
  const s = SESSION; const tot = s.log.length, good = s.log.filter(x => x.ok).length;
  const by = {}; s.log.forEach(x => { const q = qById[x.id]; if (!q) return; const k = q.pm; (by[k] = by[k] || { t: 0, g: 0 }).t++; if (x.ok) by[k].g++; });
  const wrong = s.log.filter(x => !x.ok).map(x => qById[x.id]).filter(Boolean);
  const p = pct(good, tot), col = p >= 80 ? 'var(--green)' : p >= 60 ? 'var(--amber)' : 'var(--red)';
  main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:900px">
    <div class="eyebrow">Wynik sesji</div>
    <div class="card res"><div><div class="big" style="color:${col}">${p}%</div><div class="muted" style="font-weight:700">${good} z ${tot} poprawnie</div></div>
      <div class="bk">${Object.keys(by).sort((a, b) => IDX[a] - IDX[b]).map(k => `<div class="bkrow"><span class="chip m" style="color:${gOf(k).color}">[${k}]</span><div class="t"><i style="width:${pct(by[k].g, by[k].t)}%;background:${gOf(k).color}"></i></div><span class="mono">${by[k].g}/${by[k].t}</span></div>`).join('') || '<span class="muted">Brak odpowiedzi</span>'}</div></div>
    <div class="acts" style="margin:1.2rem 0">${wrong.length ? `<button class="btn pri" id="redo">Powtórz błędne (${wrong.length})</button>` : ''}<button class="btn sec" id="again">Nowa sesja</button><a class="btn sec" href="#/postep">Postęp</a></div>
    ${wrong.length ? `<h3 style="margin:1.6rem 0 .2rem">Do powtórki</h3><div class="qlist">${wrong.map(q => qCard(q)).join('')}</div>` : '<div class="card" style="text-align:center;padding:2rem"><h3>Bez błędów</h3><p class="muted" style="margin:.3rem auto">Spróbuj trudniejszej puli, na przykład pytań z niepewnym kluczem.</p></div>'}
  </div></section>`;
  if ($('#redo')) $('#redo').onclick = () => { const ids = wrong.map(q => q.id); SESSION = null; startSession(ids); };
  $('#again').onclick = () => { SESSION = null; renderConfig(); };
  if (s.mode === 'exam') $$('details.qc', main).forEach(d => d.open = false);
}

/* ---------- POSTĘP ---------- */
function viewProgress() {
  const att = Object.keys(S.ans).filter(k => qById[k]), ok = att.filter(k => S.ans[k].last).length;
  const dc = doneCount();
  main.innerHTML = `<section class="blk" style="border:0"><div class="wrap">
    <div class="eyebrow">Postęp</div><h2>Gdzie jesteś</h2>
    <div class="agrid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-bottom:1.6rem">
      <div class="card"><div class="muted" style="font-weight:700">Moduły opanowane</div><div class="big" style="font-size:2.6rem">${dc}<span class="muted" style="font-size:1.2rem">/${covered.length}</span></div></div>
      <div class="card"><div class="muted" style="font-weight:700">Rozwiązane zadania</div><div class="big" style="font-size:2.6rem">${att.length}<span class="muted" style="font-size:1.2rem">/${Q.length}</span></div></div>
      <div class="card"><div class="muted" style="font-weight:700">Poprawne (ostatnia próba)</div><div class="big" style="font-size:2.6rem">${att.length ? pct(ok, att.length) + '%' : '–'}</div></div>
      <div class="card"><div class="muted" style="font-weight:700">Do powtórki</div><div class="big" style="font-size:2.6rem;color:var(--red)">${att.length - ok}</div></div>
    </div>
    <div class="plist">${MODS.map(m => {
      const st = modStats(m.id); const g = gOf(m.id).color; const at = m.at ? atById[m.at] : null;
      if (!m.at) return `<div class="prow" style="--gc:${g};opacity:.65"><span class="nb" style="background:transparent;border:2px dashed ${g};color:${g}">${m.id}</span><div><b>${esc(m.n)}</b><small>Brak atlasu w Projekcie</small></div><div class="muted" style="font-weight:700">–</div><span></span></div>`;
      return `<div class="prow" style="--gc:${g}"><span class="nb">${m.id}</span>
        <div><b>${esc(m.n)}</b><small>${esc(ASHORT[m.at])}${S.visited[m.at] ? ' · otwarty' : ''}</small></div>
        <div><div class="meter"><i style="width:${pct(st.att, st.total)}%;opacity:.35"></i><i style="width:${pct(st.ok, st.total)}%;position:absolute;left:0;top:0"></i></div><div class="meterl"><span>${st.ok} poprawnych · ${st.wrong} błędnych</span><span>${st.att}/${st.total}</span></div></div>
        <div class="acts"><label class="chk"><input type="checkbox" data-done="${m.id}" ${S.done[m.id] ? 'checked' : ''}> opanowany</label><a class="btn sec sm" href="#/atlas/${m.at}/${m.a}">Atlas</a><a class="btn ${st.wrong ? 'pri' : 'sec'} sm" href="#/trening?mods=${m.id}${st.wrong ? '&wrong=1' : ''}">${st.wrong ? 'Błędne' : 'Trening'}</a></div></div>`;
    }).join('')}</div>

    <h3 style="margin:2.4rem 0 .3rem">Historia egzaminów próbnych</h3>
    <p class="muted" style="margin-bottom:.7rem">Podejścia do pełnej symulacji egzaminu z progiem zdawalności 60%.</p>
    ${renderExamHistorySection()}

    <h3 style="margin:2.2rem 0 .3rem">Motyw graficzny</h3>
    <p class="muted" style="margin-bottom:.7rem">Wybierz motyw bazowy lub jedną z 6 palet kolorystycznych dla całego Hubu.</p>
    <div id="themeSeg">
      <div class="seg">
        <button data-theme-choice="auto" aria-pressed="${currentTheme === 'auto'}">🖥️ Auto (systemowy)</button>
        <button data-theme-choice="light" aria-pressed="${currentTheme === 'light'}">☀️ Jasny</button>
        <button data-theme-choice="dark" aria-pressed="${currentTheme === 'dark'}">🌙 Ciemny</button>
      </div>
      <div class="theme-grid">
        ${THEME_PALETTES.map(p => `<button type="button" class="theme-card" data-theme-choice="${p.id}" aria-pressed="${currentTheme === p.id}">
          <div class="theme-preview" style="background:${p.bg}" aria-hidden="true">
            <div class="theme-preview-card" style="background:${p.surface}">
              <div class="theme-preview-lines">
                <i style="width:68%;background:${p.ink}"></i>
                <i style="width:44%;background:${p.ink2};opacity:.78"></i>
              </div>
              <span class="theme-preview-pill" style="background:${p.accent}"></span>
            </div>
          </div>
          <div class="theme-card-top">
            <span>${esc(p.name)}</span>
            <span class="theme-check" aria-hidden="true"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.2 6.2 4.8 8.8 9.8 3.4"/></svg></span>
          </div>
          <div class="theme-dots" aria-hidden="true">${p.colors.map(c => `<span style="background:${c}"></span>`).join('')}</div>
          <div class="theme-card-sub">${esc(p.desc)}</div>
        </button>`).join('')}
      </div>
    </div>
    <h3 style="margin:2.2rem 0 .3rem">Kopia zapasowa</h3>
    <p class="muted" style="margin-bottom:.7rem">Skopiuj kod, aby przenieść postęp na inne urządzenie, albo wklej kod, aby go wczytać.</p>
    <textarea class="code" id="bk" aria-label="Kod kopii zapasowej"></textarea>
    <p id="bkMsg" class="muted" role="alert" style="margin:.45rem 0 0;font-size:.85rem;min-height:1.1em"></p>
    <div class="acts" style="margin-top:.55rem"><button class="btn sec sm" id="bkGen">Wygeneruj kod</button><button class="btn sec sm" id="bkCopy">Kopiuj</button><button class="btn dark sm" id="bkLoad">Wczytaj z kodu</button><button class="btn sec sm" id="bkReset" style="color:var(--red)">Zeruj postęp</button></div>
  </div></section>`;

  function renderExamHistorySection() {
    const h = S.examHistory || [];
    if (!h.length) {
      return `<div class="card" style="padding:1.4rem;text-align:center">
        <p class="muted" style="margin-bottom:.6rem">Brak zarejestrowanych podejść do symulacji egzaminu.</p>
        <a class="btn pri sm" href="#/egzamin">Rozpocznij pierwszy egzamin próbny →</a>
      </div>`;
    }
    const avg = Math.round(h.reduce((acc, x) => acc + x.pct, 0) / h.length);
    const passedCount = h.filter(x => x.passed).length;
    const best = Math.max(...h.map(x => x.pct));

    return `<div class="card" style="padding:1.2rem;margin-bottom:.8rem">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;margin-bottom:1.1rem;padding-bottom:1rem;border-bottom:1px solid var(--line-2)">
        <div><div class="muted" style="font-size:.76rem;font-weight:700">Podejścia</div><b style="font-size:1.4rem">${h.length}</b></div>
        <div><div class="muted" style="font-size:.76rem;font-weight:700">Średni wynik</div><b style="font-size:1.4rem">${avg}%</b></div>
        <div><div class="muted" style="font-size:.76rem;font-weight:700">Najlepszy wynik</div><b style="font-size:1.4rem;color:var(--green)">${best}%</b></div>
        <div><div class="muted" style="font-size:.76rem;font-weight:700">Zdane / Niezdane</div><b style="font-size:1.4rem">${passedCount} / ${h.length - passedCount}</b></div>
      </div>
      <div style="display:grid;gap:.55rem">
        ${h.map(item => {
          const d = new Date(item.date).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
          const m = Math.floor(item.durationSec / 60);
          const s = item.durationSec % 60;
          return `<div class="prow" style="padding:.6rem .8rem;align-items:center">
            <span class="nb" style="background:${item.passed ? 'var(--green)' : 'var(--red)'};font-size:.85rem">${item.pct}%</span>
            <div>
              <b>${item.passed ? 'ZDANY' : 'NIEZDANY'} (${item.score}/${item.total} pkt)</b>
              <small>${d} · czas: ${m}m ${s}s · ${item.wrongQIds.length} błędów</small>
            </div>
            <div></div>
            <div class="acts">
              <a class="btn sec sm" href="#/egzamin?id=${item.id}">Raport</a>
              ${item.wrongQIds.length ? `<button class="btn pri sm" data-retry-exam="${item.id}">Błędy</button>` : ''}
              <button class="btn sec sm" data-del-exam="${item.id}" style="color:var(--red);padding:.3rem .55rem" title="Usuń próbę">✕</button>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="acts" style="margin-top:.9rem;justify-content:flex-end">
        <button class="btn sec sm" id="btnClearExamHistory" style="color:var(--red)">Wyczyść historię egzaminów</button>
      </div>
    </div>`;
  }

  // Akcje historii egzaminów
  $$('[data-del-exam]').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.delExam;
      if (confirm('Czy na pewno chcesz usunąć to podejście do egzaminu?')) {
        S.examHistory = (S.examHistory || []).filter(x => x.id !== id);
        save();
        toast('Usunięto podejście z historii');
        viewProgress();
      }
    };
  });

  $$('[data-retry-exam]').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.retryExam;
      const ex = (S.examHistory || []).find(x => x.id === id);
      if (ex && ex.wrongQIds.length) {
        pendingRetryIds = ex.wrongQIds.slice();
        location.hash = '#/trening';
      }
    };
  });

  const clearExBtn = $('#btnClearExamHistory');
  if (clearExBtn) {
    clearExBtn.onclick = () => {
      if (confirm('Czy na pewno wyczyścić całą historię egzaminów próbnych?')) {
        S.examHistory = [];
        save();
        toast('Historia egzaminów wyczyszczona');
        viewProgress();
      }
    };
  }
  const tseg = $('#themeSeg');
  if (tseg) {
    tseg.addEventListener('click', e => {
      const b = e.target.closest('[data-theme-choice]');
      if (!b) return;
      applyTheme(b.dataset.themeChoice);
    });
  }
  $$('[data-done]').forEach(c => c.addEventListener('change', () => { c.checked ? S.done[c.dataset.done] = 1 : delete S.done[c.dataset.done]; save(); viewProgressSummaryRefresh(); }));
  function viewProgressSummaryRefresh() { const cards = $$('.agrid .card .big'); if (cards[0]) cards[0].innerHTML = `${doneCount()}<span class="muted" style="font-size:1.2rem">/${covered.length}</span>`; }
  const enc = () => b64EncodeUtf8(JSON.stringify(S));
  const setBkMsg = (msg, isErr) => { const el = $('#bkMsg'); if (!el) return; el.textContent = msg || ''; el.style.color = isErr ? 'var(--red)' : 'var(--teal-d)'; };
  $('#bkGen').onclick = () => { $('#bk').value = enc(); setBkMsg('Wygenerowano aktualny kod kopii zapasowej.', false); };
  $('#bkCopy').onclick = async () => { $('#bk').value = enc(); try { await navigator.clipboard.writeText($('#bk').value); toast('Skopiowano kod'); setBkMsg('Skopiowano kod do schowka.', false); } catch (e) { $('#bk').select(); toast('Zaznaczono kod, skopiuj ręcznie'); setBkMsg('Zaznaczono kod — skopiuj go ręcznie (Ctrl/Cmd+C).', false); } };
  $('#bkLoad').onclick = () => {
    const res = parseBackupCode($('#bk').value, defaultState());
    if (!res.ok) { setBkMsg(res.error, true); toast(res.error); return; }
    S = res.state;
    save();
    toast('Wczytano postęp');
    viewProgress();
  };
  $('#bkReset').onclick = () => { if ($('#bkReset').dataset.s) { S = defaultState(); save(); toast('Postęp wyzerowany'); viewProgress(); } else { $('#bkReset').dataset.s = 1; $('#bkReset').textContent = 'Kliknij ponownie, aby potwierdzić'; setTimeout(() => { const b = $('#bkReset'); if (b) { delete b.dataset.s; b.textContent = 'Zeruj postęp'; } }, 3000); } };
}

/* ---------- STOPKA ---------- */
function renderFooter() {
  $('#ft').innerHTML = `<div class="wrap"><div><h3>Ginekologia &amp; Położnictwo · V rok</h3><p>Wstępna makieta hubu łącząca ${ATLASES.length} interaktywne atlasy pokazowe, ${Q.length} przykładowych zadań z podwójną prawdą, kalkulatory położnicze, trenażer KTG/USG, Izbę Przyjęć i stacje OSCE.</p><p class="muted" style="margin-top:.5rem;font-size:.78rem">Makieta v0.1 · Materiał dydaktyczny; decyzje kliniczne zawsze weryfikuj z ChPL, rekomendacjami PTGiP/FIGO i standardem MZ.</p></div>
  <div><h3>Jak czytać źródła</h3><p>Tam, gdzie klucz historyczny rozmija się z aktualnymi rekomendacjami PTGiP lub FIGO, hub rozdziela stanowiska „pod zaliczenie” i „aktualnie klinicznie”. Przykładowa pula zakładowa w makiecie ma charakter edukacyjny.</p><p style="margin-top:.5rem">Szybkie wyszukiwanie: <b>Ctrl K</b> lub <b>/</b>.</p></div></div>`;
}

/* ---------- PALETA ---------- */
const pal = $('#pal'), palIn = $('#palIn'), palList = $('#palList');
let palItems = [], palCur = 0;
const VIEWS = [
  ['Start', '#/'],
  ['Atlasy modułowe', '#/atlasy'],
  ['Trening mieszany', '#/trening'],
  ['Egzamin próbny', '#/egzamin'],
  ['Izba Przyjęć i stacje OSCE', '#/pacjent'],
  ['Kalkulatory położnicze i dawki OB', '#/kalkulator'],
  ['Kalendarz badań w ciąży (MZ / PTGiP)', '#/kalendarz'],
  ['KTG (FIGO), USG i Cytologia Bethesda', '#/badania'],
  ['Baza pytań', '#/pytania'],
  ['Notatki Markdown', '#/notatki'],
  ['Mapa połączeń i pułapek', '#/polaczenia'],
  ['Graf wiedzy', '#/graf'],
  ['Postęp i historia', '#/postep']
];
function buildSearchIndex() {
  return [
    ...VIEWS.map(v => ({ k: 'Widok', t: v[0], h: v[1], n: norm(v[0]) })),
    ...(clinicalPatient.cases || []).map(c => ({ k: 'Izba Przyjęć', t: c.title, h: '#/pacjent/' + c.id, n: norm((c.shortTitle || '') + ' ' + c.title + ' ' + (c.category || '') + ' ' + (c.debrief?.diagnosis || '')) })),
    ...(OSCE_STATIONS || []).map(s => ({ k: 'Stacja OSCE', t: s.title, h: '#/pacjent/osce/' + s.id, n: norm((s.shortTitle || '') + ' ' + s.title + ' ' + (s.topic || '')) })),
    ...(SEMANTIC_GAPS || []).map(g => ({ k: 'Luka wiedzy', t: g.title, h: `#/graf?gap=${g.id}`, n: norm(`${g.title} ${g.clinicalReason} ${g.examTrap}`) })),
    ...MODS.map(m => ({ k: 'Moduł', t: `[${m.id}] ${m.n}`, h: (m.at && atById[m.at]) ? `#/atlas/${m.at}/${m.a}` : `#/polaczenia?mod=${m.id}`, n: norm(`${m.id} ${m.n} ${m.d}`) })),
    ...ATLASES.flatMap(a => a.secs.map(s => ({ k: 'Sekcja', t: `${ASHORT[a.id]} › ${s[1]}`, h: `#/atlas/${a.id}/${s[0]}`, n: norm(`${ASHORT[a.id]} ${s[1]}`) }))),
    ...Q.map(q => ({ k: 'Zadanie', t: q.stem.length > 120 ? q.stem.slice(0, 118) + '…' : q.stem, h: `#/pytania?q=${encodeURIComponent(q.stem.slice(0, 40))}`, n: getQNorm(q) }))
  ];
}
function palRender() {
  const toks = norm(palIn.value).split(/\s+/).filter(Boolean);
  palItems = (toks.length ? ALL.filter(i => toks.every(t => i.n.includes(t))) : ALL.slice(0, 22)).slice(0, 40);
  palCur = 0;
  palList.innerHTML = palItems.length
    ? palItems.map((i, ix) => `<li role="none"><a id="pal-opt-${ix}" href="${i.h}" role="option" aria-selected="${ix === 0}" class="${ix === 0 ? 'cur' : ''}" data-ix="${ix}"><span class="k">${i.k}</span><span class="t">${esc(i.t)}</span><span aria-hidden="true">↵</span></a></li>`).join('')
    : '<li class="empty" role="option" aria-disabled="true" aria-selected="false">Brak wyników</li>';
  if (palItems.length) palIn.setAttribute('aria-activedescendant', 'pal-opt-0');
  else palIn.removeAttribute('aria-activedescendant');
}
function palOpen() { if (!ALL) ALL = buildSearchIndex(); if (!pal.open) pal.showModal(); palIn.value = ''; palRender(); palIn.focus(); }
$('#openPal').onclick = palOpen;
const palClose = $('#palClose');
if (palClose) palClose.onclick = () => pal.close();
palIn.addEventListener('input', palRender);
pal.addEventListener('keydown', e => {
  const as = $$('a[role="option"]', palList); if (!as.length) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    palCur = (palCur + (e.key === 'ArrowDown' ? 1 : -1) + as.length) % as.length;
    as.forEach((a, i) => { a.classList.toggle('cur', i === palCur); a.setAttribute('aria-selected', String(i === palCur)); });
    palIn.setAttribute('aria-activedescendant', as[palCur].id);
    as[palCur].scrollIntoView({ block: 'nearest' });
    if (document.activeElement && document.activeElement.closest('#palList')) as[palCur].focus({ preventScroll: true });
  } else if (e.key === 'Enter') {
    if (document.activeElement === palClose) return;
    if (document.activeElement && document.activeElement.closest('#palList a[role="option"]')) return;
    e.preventDefault();
    if (palItems[palCur]) { location.hash = palItems[palCur].h; pal.close(); }
  }
});
palList.addEventListener('click', e => { if (e.target.closest('a')) pal.close(); });
pal.addEventListener('click', e => { if (e.target === pal) pal.close(); });
document.addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '');
  if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); palOpen(); }
});
if (/Mac|iPhone|iPad/.test(navigator.platform)) $('.srch kbd').textContent = '⌘ K';

/* ---------- PWA & Service Worker ---------- */
let deferredInstallPrompt = null;
function initPWA() {
  const btnInstall = $('#btnInstall');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (btnInstall) btnInstall.style.display = 'inline-flex';
  });

  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        btnInstall.style.display = 'none';
        toast('Zainstalowano Ginekologia & Położnictwo V Hub!');
      }
      deferredInstallPrompt = null;
    });
  }

  window.addEventListener('appinstalled', () => {
    if (btnInstall) btnInstall.style.display = 'none';
    deferredInstallPrompt = null;
  });

  if ('serviceWorker' in navigator) {
    const hadController = !!navigator.serviceWorker.controller;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast(
                `<span>Dostępna nowa wersja materiałów.</span> <button id="swReload" style="margin-left:.6rem;background:var(--teal);color:var(--on-accent);border:0;padding:.25rem .7rem;border-radius:999px;font-weight:700;cursor:pointer">Odśwież</button>`,
                { html: true, duration: 10000 }
              );
              const b = $('#swReload');
              if (b) {
                b.onclick = () => {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                };
              }
            }
          });
        });
      }).catch(err => {
        console.debug('ServiceWorker registration error:', err);
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController && !refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}

function initTheme() {
  const btn = $('#btnTheme');
  if (btn && btn.parentElement) {
    const wrap = document.createElement('div');
    wrap.className = 'theme-wrap';
    btn.parentElement.insertBefore(wrap, btn);
    wrap.appendChild(btn);
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'true');
    const pop = document.createElement('div');
    pop.className = 'theme-pop';
    pop.hidden = true;
    pop.setAttribute('role', 'menu');
    pop.innerHTML = `
      <button type="button" class="theme-pop-item" data-theme-choice="auto" aria-pressed="${currentTheme === 'auto'}"><span>Auto (systemowy)</span></button>
      <button type="button" class="theme-pop-item" data-theme-choice="light" aria-pressed="${currentTheme === 'light'}"><span>Jasny (papier kliniczny)</span></button>
      <button type="button" class="theme-pop-item" data-theme-choice="dark" aria-pressed="${currentTheme === 'dark'}"><span>Ciemny (Obsidian)</span></button>
      <div class="theme-pop-sep"></div>
      ${THEME_PALETTES.map(p => `<button type="button" class="theme-pop-item" data-theme-choice="${p.id}" aria-pressed="${currentTheme === p.id}">
        <span>${esc(p.name)}</span>
        <span class="theme-pop-swatches" aria-hidden="true"><i style="background:${p.bg}"></i><i style="background:${p.surface}"></i><i style="background:${p.accent}"></i></span>
      </button>`).join('')}
    `;
    wrap.appendChild(pop);
    const setOpen = open => {
      pop.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.onclick = e => { e.stopPropagation(); setOpen(pop.hidden); };
    pop.addEventListener('click', e => {
      const b = e.target.closest('[data-theme-choice]');
      if (!b) return;
      applyTheme(b.dataset.themeChoice);
    });
    document.addEventListener('click', e => { if (!pop.hidden && !wrap.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) { setOpen(false); btn.focus(); } });
  }
  applyTheme(currentTheme, false);
}

const HUB_CLINICAL = window.HUB_CLINICAL || {};
const clinicalCtx = {
  $,
  $$,
  main,
  get S() { return S; },
  get Q() { return Q; },
  get current() { return current; },
  get osce() { return clinicalOsce; },
  get patient() { return clinicalPatient; },
  esc,
  norm,
  pct,
  calcNaegele,
  calcBishop,
  calcApgar,
  calcOgttPregnancy,
  calcRmi,
  safeStorageSet,
  save,
  toast,
  ASHORT,
  getNotes,
  saveNotes
};
const clinicalCalc = HUB_CLINICAL.calc ? HUB_CLINICAL.calc(clinicalCtx) : { viewCalculator: () => {} };
const clinicalPatient = HUB_CLINICAL.patient ? HUB_CLINICAL.patient(clinicalCtx) : { viewPatient: () => {}, cases: [] };
const clinicalOsce = HUB_CLINICAL.osce ? HUB_CLINICAL.osce(clinicalCtx) : { openStation: () => {}, renderOsceStationList: () => {} };
const clinicalDiagnostics = HUB_CLINICAL.diagnostics ? HUB_CLINICAL.diagnostics(clinicalCtx) : { viewDiagnostics: () => {} };

delegateBm(main, () => { if (onBmMutate) onBmMutate(); });
initNavMenus();
initTheme();
initPWA();
initNotesDrawer();
route();
})();
