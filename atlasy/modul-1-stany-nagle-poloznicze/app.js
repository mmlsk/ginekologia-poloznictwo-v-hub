/* Logika interaktywna dla Atlasu 1: Stany nagłe w położnictwie i ginekologii [1][2][3] */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ===== 4T PPH interactive tabs ===== */
function render4T(key) {
  const d = T4_DATA[key];
  if (!d) return;
  $$('#t4Tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.t4 === key ? 'true' : 'false'));
  $('#t4Panel').innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:.6rem">
      <h3 style="margin:0">${d.title}</h3>
      <span class="sev ${d.badgeCls}">${d.badge}</span>
    </div>
    <div class="grid2">
      <div>
        <h4>Rozpoznanie i obraz kliniczny</h4>
        <ul class="tight">${d.clues.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>
      <div>
        <h4>Postępowanie krok po kroku</h4>
        <ul class="tight">${d.actions.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>
    </div>
    <div class="callout amber" style="margin-top:.85rem"><b class="k">Klucz egzaminacyjny</b>${d.pearl}</div>`;
}
$$('#t4Tabs button').forEach(b => {
  b.addEventListener('click', () => render4T(b.dataset.t4));
});
render4T('tone');

/* ===== Shock Index table + mini calculator ===== */
$('#siTable').innerHTML = `
  <thead><tr><th>Shock Index (HR/SBP)</th><th>Kategoria</th><th>Działanie kliniczne</th></tr></thead>
  <tbody>${SI_TABLE.map(r => `
    <tr>
      <td><b>${r[0]}</b></td>
      <td><span class="sev ${r[2]}">${r[1]}</span></td>
      <td>${r[3]}</td>
    </tr>`).join('')}
  </tbody>`;

function updateSI() {
  const hr = parseFloat($('#siHr').value);
  const sbp = parseFloat($('#siSbp').value);
  const out = $('#siOut');
  if (!hr || !sbp || sbp <= 0) {
    out.innerHTML = '<b>—</b><span class="small">Wpisz HR i SBP</span>';
    return;
  }
  const si = hr / sbp;
  const fmt = si.toFixed(2).replace('.', ',');
  let cls = 'g', label = 'Norma położnicza (<0,9)';
  if (si >= 1.7) { cls = 'r'; label = 'Krytyczny wstrząs (≥1,7) — transfuzja 1:1:1!'; }
  else if (si >= 1.2) { cls = 'r'; label = 'Wstrząs krwotoczny (1,2–1,6) — protokół PPH + TXA'; }
  else if (si >= 0.9) { cls = 'a'; label = 'Sygnał ostrzegawczy (0,9–1,1) — 2 wkłucia, krzyżówka'; }
  out.innerHTML = `<b>SI = ${fmt}</b><span class="sev ${cls}" style="margin-top:.25rem">${label}</span>`;
}
$('#siHr').addEventListener('input', updateSI);
$('#siSbp').addEventListener('input', updateSI);
updateSI();

/* ===== Łożysko przodujące vs przedwczesne oddzielenie ===== */
$('#placentaTable').innerHTML = `
  <thead><tr><th>Cecha</th><th>Łożysko przodujące (placenta praevia)</th><th>Przedwczesne oddzielenie (abruptio placentae)</th></tr></thead>
  <tbody>${PLACENTA_CMP.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>`;

/* ===== Tabela dawek ===== */
$('#doseTable').innerHTML = `
  <thead><tr><th>Lek / preparat</th><th>Dawka w stanie nagłym</th><th>Wskazania, uwagi i przeciwwskazania</th></tr></thead>
  <tbody>${DOSES.map(r => r.grp
    ? `<tr class="grp"><td colspan="3">${r.grp}</td></tr>`
    : `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`
  ).join('')}</tbody>`;

/* ===== Dual-truth (#klucz) ===== */
$('#dualCards').innerHTML = GAP.map(g => `
  <div class="dual-item">
    <h3>${g[0]}</h3>
    <div class="cmp">
      <div class="a"><b class="k">Pod zaliczenie (klucz / starsze ujęcie)</b>${g[1]}</div>
      <div class="b"><b class="k">Aktualnie klinicznie (PTGiP / FIGO / ACOG)</b>${g[2]}</div>
    </div>
  </div>`).join('');

/* ===== Źródła ===== */
$('#srcList').innerHTML = SOURCES.map(s => `<li><b>${s[0]}</b> — ${s[1]}</li>`).join('');

/* ===== Quiz (#zadania) — pełna zgodność z ../atlas-hub-sync.js ===== */
(function permuteOptions() {
  Q.forEach(q => {
    let seed = q.n * 7919 + 41;
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
        <span class="mod">[1–3]</span>
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
