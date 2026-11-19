/* Logika interaktywna dla Atlasu 2: Fizjologia ciąży, porodu i KTG [4][5] */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ===== Fizjologia ciąży — zakładki trymestrów ===== */
function renderTrimester(key) {
  const tr = TRIMESTERS[key];
  if (!tr) return;
  $$('#trimTabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.trim === key ? 'true' : 'false'));
  $('#trimPanel').innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:.85rem">
      <h3 style="margin:0">${tr.title}</h3>
      <span class="tbadge">${tr.badge}</span>
    </div>
    <div class="grid3">
      ${tr.cards.map(c => `
        <div class="tcard ${c.c}">
          <h4>${c.h}</h4>
          <ul>${c.items.map(i => `<li>${i}</li>`).join('')}</ul>
        </div>`).join('')}
    </div>`;
}
$$('#trimTabs button').forEach(b => b.addEventListener('click', () => renderTrimester(b.dataset.trim)));
renderTrimester('t1');

/* ===== Standard MZ — tabela kalendarza ===== */
$('#mzTable').innerHTML = `
  <thead><tr><th>Tydzień ciąży</th><th>Obowiązkowe badania i interwencje (Standard MZ / PTGiP)</th><th>Cel kliniczny</th></tr></thead>
  <tbody>${MZ_SCHEDULE.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>`;

/* ===== Chwyty Leopolda I–IV (interaktywny SVG + panel) ===== */
function renderLeopold(num) {
  const d = LEOPOLD_DATA[num];
  if (!d) return;
  $$('#leoBtns button').forEach(b => b.setAttribute('aria-selected', Number(b.dataset.leo) === num ? 'true' : 'false'));
  $$('#leoSvg g.grip').forEach(g => g.classList.toggle('on', Number(g.dataset.leo) === num));
  $('#leoPanel').innerHTML = `
    <h3 style="margin-bottom:.45rem">${d.name}</h3>
    <p style="margin-bottom:.5rem"><b>Ułożenie rąk:</b> ${d.hands}</p>
    <p style="margin-bottom:.6rem">${d.answers}</p>
    <ul class="tight" style="margin-bottom:.75rem">${d.findings.map(f => `<li>${f}</li>`).join('')}</ul>
    <div class="callout blue"><b class="k">Wskazówka egzaminacyjna / OSCE</b>${d.pearl}</div>`;
}
$$('#leoBtns button').forEach(b => b.addEventListener('click', () => renderLeopold(Number(b.dataset.leo))));
$$('#leoSvg g.grip').forEach(g => {
  g.addEventListener('click', () => renderLeopold(Number(g.dataset.leo)));
  g.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      renderLeopold(Number(g.dataset.leo));
    }
  });
});
renderLeopold(1);

/* ===== Interaktywna Skala Bishopa (0–13 pkt) ===== */
const bishopState = { dil: 1, eff: 1, sta: 1, con: 1, pos: 1 };

function renderBishopControls() {
  $('#bishopRows').innerHTML = BISHOP_PARAMS.map(p => `
    <div class="bishop-row">
      <h4>${p.label}</h4>
      <div class="bishop-opts ${p.opts.length === 3 ? 'cols3' : ''}">
        ${p.opts.map((label, pts) => `
          <button type="button" data-bp="${p.id}" data-pts="${pts}" aria-pressed="${bishopState[p.id] === pts ? 'true' : 'false'}">
            <b>${pts} pkt</b>
            <span>${label}</span>
          </button>`).join('')}
      </div>
    </div>`).join('');
  updateBishopScore();
}

function updateBishopScore() {
  const total = Object.values(bishopState).reduce((a, b) => a + b, 0);
  let cls = 'r', status = 'Szyjka niedojrzała (<6 pkt)', plan = 'Wskazana <b>preindukcja porodu</b> (cewnik Foleya / balon Cooka lub prostaglandyny PGE2 / mizoprostol) przed podaniem oksytocyny.';
  if (total >= 8) {
    cls = 'g';
    status = 'Szyjka w pełni dojrzała (≥8 pkt)';
    plan = 'Wysokie prawdopodobieństwo powodzenia indukcji (porównywalne z porodem samoistnym). Można zastosować <b>oksytocynę i/lub amniotomię</b>.';
  } else if (total >= 6) {
    cls = 'a';
    status = 'Szyjka dojrzewająca / dojrzała (6–7 pkt)';
    plan = 'Strefa przejściowa — wg PTGiP zwykle kwalifikuje już do <b>indukcji oksytocyną / amniotomią</b> (część ośrodków woli ≥8 pkt).';
  }
  $('#bishopOut').innerHTML = `
    <div class="big">${total} / 13 pkt</div>
    <div style="margin:.45rem 0 .6rem"><span class="sev ${cls}">${status}</span></div>
    <p class="small">${plan}</p>`;
}

$('#bishopRows').addEventListener('click', e => {
  const btn = e.target.closest('button[data-bp]');
  if (!btn) return;
  bishopState[btn.dataset.bp] = Number(btn.dataset.pts);
  renderBishopControls();
});
renderBishopControls();

/* ===== KTG FIGO 2015 tabela + interaktywny wykres SVG ===== */
$('#figoTable').innerHTML = `
  <thead><tr><th>Parametr KTG</th><th>Prawidłowy</th><th>Podejrzany</th><th>Patologiczny</th></tr></thead>
  <tbody>${FIGO_TABLE.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody>`;

function renderCtg(key) {
  const p = CTG_PATTERNS[key];
  if (!p) return;
  $$('#ctgTabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.ctg === key ? 'true' : 'false'));
  const strokeColor = p.sev === 'r' ? '#A82D1E' : p.sev === 'a' ? '#8F5808' : '#216B3E';

  // Grid lines for FHR (top: y 24..144 -> 180..60 bpm) and TOCO (bottom: y 160..220)
  let grid = '';
  // Normal FHR band 110–160 bpm: y=44 (160 bpm) to y=94 (110 bpm)
  grid += `<rect class="ctg-band" x="40" y="44" width="520" height="50" fill="#E1F3E7"/>`;
  [180, 160, 140, 120, 100, 80, 60].forEach(bpm => {
    const y = 24 + (180 - bpm);
    grid += `<line class="ctg-grid-line" x1="40" y1="${y}" x2="560" y2="${y}" stroke="#DCE2E0" stroke-width="${bpm === 110 || bpm === 160 ? '1.3' : '0.8'}"/>`;
    grid += `<text x="34" y="${y + 4}" text-anchor="end" font-size="10" fill="#596870">${bpm}</text>`;
  });
  for (let x = 40; x <= 560; x += 52) {
    grid += `<line class="ctg-grid-line" x1="${x}" y1="24" x2="${x}" y2="144" stroke="#DCE2E0" stroke-width="0.7"/>`;
    grid += `<line class="ctg-grid-line" x1="${x}" y1="160" x2="${x}" y2="222" stroke="#DCE2E0" stroke-width="0.7"/>`;
  }
  [160, 190, 220].forEach((y, idx) => {
    grid += `<line class="ctg-grid-line" x1="40" y1="${y}" x2="560" y2="${y}" stroke="#DCE2E0" stroke-width="0.8"/>`;
    grid += `<text x="34" y="${y + 4}" text-anchor="end" font-size="9.5" fill="#596870">${[100, 50, 0][idx]}</text>`;
  });

  const markersSvg = p.markers.map(m => `
    <text x="${m.x}" y="${m.y}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${strokeColor}">${m.t}</text>`).join('');

  $('#ctgSvg').innerHTML = `
    ${grid}
    <text x="44" y="16" font-size="11" font-weight="800" fill="#13232C">FHR (/min) · pasmo zielone = norma 110–160/min</text>
    <text x="44" y="156" font-size="10.5" font-weight="700" fill="#44545D">TOCO — czynność skurczowa macicy (mmHg)</text>
    <path d="${p.fhrPath}" fill="none" stroke="${strokeColor}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="${p.tocoPath}" fill="none" stroke="#2B63AE" stroke-width="2.2" stroke-linejoin="round"/>
    ${markersSvg}
    <text x="560" y="236" text-anchor="end" font-size="10" fill="#596870">Oś czasu (1 kratka = 1 min · schemat poglądowy 10 min)</text>`;

  $('#ctgDesc').innerHTML = `
    <div class="ctg-meta">
      <h3 style="margin:0">${p.name}</h3>
      <span class="sev ${p.sev}">${p.sevLabel}</span>
    </div>
    <p style="margin-bottom:.45rem">${p.desc}</p>
    <div class="callout ${p.sev === 'r' ? 'red' : p.sev === 'a' ? 'amber' : 'green'}"><b class="k">Postępowanie kliniczne</b>${p.action}</div>`;
}
$$('#ctgTabs button').forEach(b => b.addEventListener('click', () => renderCtg(b.dataset.ctg)));
renderCtg('normal');

/* ===== Dual-truth (#klucz) ===== */
$('#dualCards').innerHTML = GAP.map(g => `
  <div class="dual-item">
    <h3>${g[0]}</h3>
    <div class="cmp">
      <div class="a"><b class="k">Pod zaliczenie (starsze ujęcie / klucz)</b>${g[1]}</div>
      <div class="b"><b class="k">Aktualnie klinicznie (PTGiP / FIGO / WHO / MZ)</b>${g[2]}</div>
    </div>
  </div>`).join('');

/* ===== Źródła ===== */
$('#srcList').innerHTML = SOURCES.map(s => `<li><b>${s[0]}</b> — ${s[1]}</li>`).join('');

/* ===== Quiz (#zadania) — pełna zgodność z ../atlas-hub-sync.js ===== */
(function permuteOptions() {
  Q.forEach(q => {
    let seed = q.n * 7919 + 73;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const idx = q.o.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    q.o = idx.map(i => q.o[i]);
    q.k = idx.indexOf(q.k);
  });
})();

const CONF = { src: ['src', 'KLUCZ POTWIERDZONY'], inf: ['inf', 'KLUCZ WNIOSKOWANY'], unk: ['unk', 'KLUCZ NIEPEWNY'] };
let activeFilter = 'all';
let state = {};

$('#qFilters').innerHTML = [['all', 'Wszystkie (5)']]
  .concat(Object.keys(TOPICS).map(k => [k, TOPICS[k]]))
  .map((x, i) => `<button aria-pressed="${i === 0}" data-f="${x[0]}">${x[1]}</button>`)
  .join('');

function updateScore() {
  const vals = Object.values(state);
  $('#score').textContent = `Wynik: ${vals.filter(x => x.ok).length} / ${vals.length}`;
}

function discHtml(q, done) {
  const L = 'ABCD';
  return `
    <div class="callout ${done.ok ? 'green' : 'red'}">
      <b class="k">${done.ok ? 'Poprawnie' : 'Błędnie'} · prawidłowa odpowiedź: ${L[q.k]}</b>
      ${q.why}
    </div>
    ${q.tip ? `<div class="callout blue"><b class="k">Wskazówka egzaminacyjna</b>${q.tip}</div>` : ''}
    ${q.gap ? `<div class="cmp">
      <div class="a"><b class="k">Pod zaliczenie (klucz)</b>${q.gap.pool}</div>
      <div class="b"><b class="k">Aktualnie klinicznie (wytyczne)</b>${q.gap.now}</div>
    </div>` : ''}`;
}

function renderQ() {
  const L = 'ABCD';
  const items = activeFilter === 'all' ? Q : Q.filter(q => q.t === activeFilter);
  $('#quiz').innerHTML = items.map(q => {
    const done = state[q.n];
    const cf = CONF[q.c];
    return `<article class="q" id="q${q.n}">
      <header>
        <span class="n">Zad. ${q.n}</span>
        <span class="mod">[4–5]</span>
        <span class="tbadge">${TOPICS[q.t]}</span>
        <span class="kb ${cf[0]}">${cf[1]}</span>
        <span class="src">${q.s}</span>
      </header>
      <div class="stem">${q.stem}</div>
      <div class="opts" role="group" aria-label="Odpowiedzi do zadania ${q.n}">
        ${q.o.map((txt, i) => {
          let cls = 'opt';
          if (done) {
            if (i === q.k) cls += ' key ok';
            else if (i === done.sel) cls += ' bad';
          }
          return `<button class="${cls}" data-q="${q.n}" data-i="${i}" ${done ? 'disabled' : ''}><span class="l">${L[i]}</span><span>${txt}</span></button>`;
        }).join('')}
      </div>
      <div class="disc" ${done ? '' : 'hidden'}>${done ? discHtml(q, done) : ''}</div>
    </article>`;
  }).join('') || '<p>Brak zadań w tym filtrze.</p>';
  updateScore();
}

$('#quiz').addEventListener('click', e => {
  const btn = e.target.closest('.opt');
  if (!btn) return;
  const q = Q.find(x => x.n === Number(btn.dataset.q));
  const i = Number(btn.dataset.i);
  if (!q || state[q.n]) return;
  const done = (state[q.n] = { sel: i, ok: i === q.k });
  const art = btn.closest('article.q');
  if (art) {
    $$('.opt', art).forEach(b => {
      b.disabled = true;
      const ix = Number(b.dataset.i);
      if (ix === q.k) b.classList.add('key', 'ok');
      else if (ix === i) b.classList.add('bad');
    });
    const d = $('.disc', art);
    if (d) {
      d.innerHTML = discHtml(q, done);
      d.hidden = false;
      d.classList.add('on');
    }
  }
  updateScore();
});

$$('#qFilters button').forEach(b => {
  b.addEventListener('click', () => {
    activeFilter = b.dataset.f;
    $$('#qFilters button').forEach(x => x.setAttribute('aria-pressed', x.dataset.f === activeFilter ? 'true' : 'false'));
    renderQ();
  });
});

$('#resetQ').addEventListener('click', () => {
  state = {};
  renderQ();
});

renderQ();

/* ===== Scrollspy ===== */
const navLinks = $$('#navlist a');
const navSecs = navLinks.map(a => $(a.getAttribute('href')));
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id));
    }
  });
}, { rootMargin: '-38% 0px -56% 0px' });
navSecs.forEach(s => s && io.observe(s));
