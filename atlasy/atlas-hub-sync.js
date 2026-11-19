/* Wspólna synchronizacja odpowiedzi z sekcji #zadania atlasów z globalnym stanem Hubu (ginpol_hub_state_v1) */
(function () {
  var DARK_THEMES = { dark: 1, navy: 1, moss: 1, espresso: 1, ochre: 1, purple: 1, ocean: 1 };
  function applyAtlasTheme(theme) {
    var t = theme || 'light';
    var eff = DARK_THEMES[t]
      ? t
      : (t === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : '');
    if (eff) document.documentElement.dataset.theme = eff;
    else delete document.documentElement.dataset.theme;
  }
  window.addEventListener('message', function (ev) {
    if (ev.data && ev.data.type === 'SET_THEME') {
      applyAtlasTheme(ev.data.theme);
    }
  });

  var STORAGE_KEY = 'ginpol_hub_state_v1';
  var PREFIX_BY_DIR = {
    'modul-1-stany-nagle-poloznicze': 'nagle-ob-q',
    'modul-2-fizjologia-ciazy-i-porodu': 'fizjologia-q'
  };

  var prefix = '';
  var parts = (location.pathname || '').split('/');
  for (var i = 0; i < parts.length; i++) {
    if (PREFIX_BY_DIR[parts[i]]) { prefix = PREFIX_BY_DIR[parts[i]]; break; }
  }
  if (!prefix) return;

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (!parsed.ans || typeof parsed.ans !== 'object') parsed.ans = {};
          return parsed;
        }
      }
    } catch (e) {}
    return { visited: {}, last: null, done: {}, ans: {}, bm: {}, examHistory: [], patientCases: {}, osceCases: {} };
  }

  function recordHubAns(hubId, ok) {
    if (!hubId) return;
    var st = loadState();
    var a = st.ans[hubId] || { n: 0, c: 0 };
    a.n = (a.n || 0) + 1;
    if (ok) a.c = (a.c || 0) + 1;
    a.last = !!ok;
    a.ts = Date.now();
    st.ans[hubId] = a;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); } catch (e) {}
    if (window.parent && window.parent !== window) {
      try { window.parent.postMessage({ type: 'ginpol-atlas-ans', id: hubId, ok: !!ok }, '*'); } catch (e) {}
    }
    refreshBadges();
  }
  window.hubSyncRecord = recordHubAns;

  function resolveHubId(art) {
    if (!art) return null;
    if (art.dataset.hubId) return art.dataset.hubId;
    var m = /^(?:q|z)(\d+)$/.exec(art.id || '');
    return m ? prefix + m[1] : null;
  }

  function decorateArticle(art, ansMap) {
    var hubId = resolveHubId(art);
    if (!hubId) return;
    var hdr = art.querySelector('header');
    if (!hdr) return;
    var a = ansMap[hubId];
    var badge = hdr.querySelector('.hub-sync-badge');
    if (!a || !a.n) {
      if (badge) badge.remove();
      return;
    }
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'tbadge hub-sync-badge';
      hdr.appendChild(badge);
    }
    badge.classList.toggle('is-ok', !!a.last);
    badge.classList.toggle('is-bad', !a.last);
    badge.textContent = (a.last ? '✓ Hub ' : '✗ Hub ') + (a.c || 0) + '/' + a.n;
    badge.title = 'Zapisano w postępie Hubu (' + (a.c || 0) + ' poprawnych na ' + a.n + ' prób)';
  }

  function refreshBadges() {
    var ansMap = loadState().ans;
    document.querySelectorAll('article.q').forEach(function (art) {
      decorateArticle(art, ansMap);
    });
  }

  document.addEventListener('click', function (ev) {
    var hit = ev.target.closest('.opt, .check');
    if (!hit) return;
    var art = hit.closest('article.q');
    if (!art) return;
    var hubId = resolveHubId(art);
    if (!hubId) return;
    queueMicrotask(function () {
      if (art.dataset.hubRecorded === '1') return;
      var answered = art.querySelector('.opt.ok, .opt.bad, .opt.key-g, .opt.key-a, .opt.wrong, .res.ok, .res.no');
      if (!answered) return;
      var userPicked = art.querySelector('.opt.bad, .opt.wrong, .opt.pick, .res.ok, .res.no') ||
        (hit.classList.contains('opt') && hit.disabled) ||
        (hit.classList.contains('check') && hit.hidden);
      if (!userPicked) return;
      art.dataset.hubRecorded = '1';
      var isOk = !art.querySelector('.opt.bad, .opt.wrong, .res.no');
      recordHubAns(hubId, isOk);
    });
  });

  var roots = [];
  function observeRoots() {
    document.querySelectorAll('#quiz, #trainOut, .qlist').forEach(function (el) {
      if (roots.indexOf(el) !== -1) return;
      roots.push(el);
      var timer = null;
      new MutationObserver(function () {
        if (timer) return;
        timer = setTimeout(function () { timer = null; refreshBadges(); }, 40);
      }).observe(el, { childList: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { observeRoots(); refreshBadges(); });
  } else {
    observeRoots();
    refreshBadges();
  }
  window.addEventListener('storage', function (ev) {
    if (ev.key === STORAGE_KEY) refreshBadges();
  });
})();
