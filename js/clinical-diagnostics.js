/* Ginekologia & Położnictwo V – moduł kliniczny: Trenażer KTG (FIGO 2015), USG (Hotspots), Lab OB/GYN i Atlas Cytologii (Bethesda) */
(function () {
  'use strict';

  window.HUB_CLINICAL = window.HUB_CLINICAL || {};

  window.HUB_CLINICAL.diagnostics = function (ctx) {
    const {
      $, $$, main, esc, norm, pct,
      calcOgttPregnancy, safeStorageSet, save, toast, getNotes, saveNotes
    } = ctx;

    const IMAGING_KEY = 'ginpol_hub_imaging_v1';
    const CTG_KEY = 'ginpol_hub_ctg_v1';

    let DIAG_TAB = 'ktg'; // 'ktg' | 'usg' | 'lab' | 'cytologia'
    let LAB_SUBTAB = 'ogtt'; // 'ogtt' | 'hormony' | 'hellp'

    /* ---------- Persystencja stanu ---------- */
    let CTG_STATE = {
      activeId: 'ctg-norm',
      showRef: false,
      answers: {}, // { [caseId]: { figo: idx, action: idx } }
      solved: []
    };
    try {
      const raw = localStorage.getItem(CTG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.assign(CTG_STATE, parsed);
          if (!CTG_STATE.answers) CTG_STATE.answers = {};
          if (!Array.isArray(CTG_STATE.solved)) CTG_STATE.solved = [];
        }
      }
    } catch (e) { /* ignoruj */ }

    function saveCtgState() {
      if (typeof safeStorageSet === 'function') safeStorageSet(CTG_KEY, JSON.stringify(CTG_STATE));
      else { try { localStorage.setItem(CTG_KEY, JSON.stringify(CTG_STATE)); } catch (e) {} }
    }

    let IMG_STATE = {
      activeUsgId: 'usg-ektopowa',
      showHint: false,
      lastMiss: null,
      usgProgress: {}, // { [id]: { found: bool, mcq: idx } }
      bethesdaMode: 'catalog', // 'catalog' | 'puzzles'
      bethesdaId: 'lsil',
      puzzleIdx: 0,
      puzzleStep: 1,
      puzzleAnswers: {},
      puzzlesDone: []
    };
    try {
      const raw = localStorage.getItem(IMAGING_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.assign(IMG_STATE, parsed);
          if (!IMG_STATE.usgProgress) IMG_STATE.usgProgress = {};
          if (!IMG_STATE.puzzleAnswers) IMG_STATE.puzzleAnswers = {};
          if (!Array.isArray(IMG_STATE.puzzlesDone)) IMG_STATE.puzzlesDone = [];
        }
      }
    } catch (e) { /* ignoruj */ }

    function saveImgState() {
      if (typeof safeStorageSet === 'function') safeStorageSet(IMAGING_KEY, JSON.stringify(IMG_STATE));
      else { try { localStorage.setItem(IMAGING_KEY, JSON.stringify(IMG_STATE)); } catch (e) {} }
    }

    let LAB_STATE = {
      ogtt: { fasting: 95, h1: 174, h2: 148 },
      hormones: { fsh: 5.4, lh: 13.8, e2: 52, prl: 18, tsh: 1.9, amh: 6.4 },
      hellp: { plt: 86, ast: 112, alt: 98, ldh: 740, hemolysis: true },
      cord: { ph: 7.06, be: -11.4, pco2: 58, lactate: 6.2 }
    };

    function saveNoteEntry(title, content, mod) {
      try {
        const notes = typeof getNotes === 'function' ? getNotes() : [];
        const note = {
          id: 'note_diag_' + Date.now(),
          title,
          content,
          mod: mod || 'all',
          updatedAt: Date.now()
        };
        notes.unshift(note);
        if (typeof saveNotes === 'function') saveNotes(notes);
        if (typeof save === 'function') save();
        if (typeof toast === 'function') toast('Zapisano w Notatniku.');
      } catch (e) {
        if (typeof toast === 'function') toast('Nie udało się zapisać notatki.');
      }
    }

    const svgIcon = path => `<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true" style="flex-shrink:0">${path}</svg>`;
    const ICON_CTG = svgIcon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>');
    const ICON_USG = svgIcon('<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49"/><path d="M7.76 16.24a6 6 0 0 1 0-8.49"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 19.07a10 10 0 0 1 0-14.14"/>');
    const ICON_LAB = svgIcon('<path d="M10 2v7.53a2 2 0 0 1-.21.9L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.07-10.12a2 2 0 0 1-.21-.9V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>');
    const ICON_CYTO = svgIcon('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/>');
    const ICON_NOTE = svgIcon('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>');
    const ICON_RESET = svgIcon('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>');
    const ICON_WARN = svgIcon('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>');
    const ICON_BOOK = svgIcon('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>');
    const ICON_HINT = svgIcon('<circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>');
    const ICON_NEXT = svgIcon('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>');

    let armedResetTimer = null;
    function clearArmedResetTimer() {
      if (armedResetTimer) {
        clearTimeout(armedResetTimer);
        armedResetTimer = null;
      }
    }
    function bindTwoStepReset(btn, onConfirm) {
      if (!btn) return;
      const origHtml = btn.innerHTML;
      btn.onclick = () => {
        if (btn.dataset.armed !== '1') {
          clearArmedResetTimer();
          btn.dataset.armed = '1';
          btn.innerHTML = `${ICON_WARN} Potwierdź reset (kliknij ponownie)`;
          btn.style.borderColor = 'var(--red)';
          btn.style.color = 'var(--red)';
          btn.style.background = 'var(--red-l)';
          armedResetTimer = setTimeout(() => {
            armedResetTimer = null;
            if (btn.isConnected && btn.dataset.armed === '1') {
              delete btn.dataset.armed;
              btn.innerHTML = origHtml;
              btn.style.borderColor = '';
              btn.style.color = '';
              btn.style.background = '';
            }
          }, 4000);
          return;
        }
        clearArmedResetTimer();
        delete btn.dataset.armed;
        onConfirm();
      };
    }

    function captureFocusState() {
      const el = document.activeElement;
      if (!el || !main || !main.contains(el)) return null;
      const state = { id: el.id || '', selector: '', selStart: null, selEnd: null };
      if (!state.id) {
        const attrKeys = ['data-dtab', 'data-sub', 'data-mode', 'data-id', 'data-idx', 'data-val', 'data-opt', 'data-v', 'data-f'];
        for (let i = 0; i < attrKeys.length; i++) {
          const k = attrKeys[i];
          const v = el.getAttribute(k);
          if (v !== null) {
            const cls = Array.from(el.classList).find(c => c.startsWith('js-') || c === 'calc-tab-btn');
            const safeV = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            state.selector = (cls ? '.' + cls : el.tagName.toLowerCase()) + `[${k}="${safeV}"]`;
            break;
          }
        }
      }
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        try {
          if (typeof el.selectionStart === 'number') {
            state.selStart = el.selectionStart;
            state.selEnd = el.selectionEnd;
          }
        } catch (e) { /* input type=number nie wspiera selectionStart */ }
      }
      return (state.id || state.selector) ? state : null;
    }

    function restoreFocusState(state) {
      if (!state || !main) return;
      const target = state.id ? document.getElementById(state.id) : (state.selector ? main.querySelector(state.selector) : null);
      if (!target || target.disabled || typeof target.focus !== 'function') return;
      try {
        target.focus({ preventScroll: true });
      } catch (e) {
        target.focus();
      }
      if (state.selStart !== null && typeof target.setSelectionRange === 'function') {
        try { target.setSelectionRange(state.selStart, state.selEnd); } catch (e) {}
      }
    }

    /* ---------- Domyślne bazy (fallback) ---------- */

    const DEFAULT_CTG_CASES = [
      {
        id: 'ctg-norm',
        title: 'Zapis prawidłowy (Norma FIGO)',
        pattern: 'normal',
        subtitle: '39+2 Hbd · I okres porodu, 4 cm',
        vignette: 'Ciężarna w 39+2 Hbd w aktywnym I okresie porodu (rozwarcie 4 cm, czysty płyn owodniowy). FHR bazowe ok. 140 bpm, zmienność 10–15 bpm, widoczne akceleracje (>15 bpm przez >15 s), brak deceleracji, regularne skurcze 3/10 min.',
        metrics: { baseline: '140 bpm', variability: '10–15 bpm (prawidłowa)', accelerations: 'Obecne (2)', decelerations: 'Brak', toco: '3 skurcze / 10 min' },
        figoKey: 0, // 0: Prawidłowy, 1: Podejrzany, 2: Patologiczny
        actionQuestion: 'Jakie jest właściwe postępowanie przy tym zapisie KTG wg FIGO 2015?',
        actionOpts: [
          'Kontynuacja porodu z okresową/rutynową obserwacją KTG — niskie prawdopodobieństwo niedotlenienia płodu',
          'Natychmiastowe cięcie cesarskie w trybie nagłym (<15 min)',
          'Podanie tokolizy w celu całkowitego zatrzymania porodu',
          'Pilne badanie pH ze skóry główki płodu'
        ],
        actionKey: 0,
        pearl: 'Kryteria zapisu prawidłowego FIGO 2015: linia bazowa 110–160 bpm, zmienność 5–25 bpm, brak powtarzających się deceleracji (akceleracje potwierdzają brak kwasicy, ale ich brak w trakcie porodu sam w sobie nie czyni zapisu patologicznym).'
      },
      {
        id: 'ctg-var',
        title: 'Zapis podejrzany — deceleracje zmienne',
        pattern: 'variable',
        subtitle: '40+1 Hbd · I okres porodu, 6 cm',
        vignette: 'Rodząca w 40+1 Hbd po pęknięciu błon płodowych (rozwarcie 6 cm). Linia bazowa 145 bpm, zmienność zachowana (10 bpm), ale pojawiają się powtarzające się nagłe spadki FHR w kształcie litery „V” o zmiennym stosunku czasowym do skurczów macicy (<60 s).',
        metrics: { baseline: '145 bpm', variability: '10 bpm (prawidłowa)', accelerations: 'Pojedyncza', decelerations: 'Zmienne (V-kształtne)', toco: '4 skurcze / 10 min' },
        figoKey: 1,
        actionQuestion: 'Jakie jest optymalne postępowanie w pierwszej kolejności (zapis podejrzany)?',
        actionOpts: [
          'Usunięcie odwracalnych przyczyn (zmiana pozycji na bok, nawodnienie i.v., ocena szyjki/pępowiny, redukcja oksytocyny) i ścisłe ciągłe monitorowanie KTG',
          'Wypisanie pacjentki do domu na kontrolę za tydzień',
          'Zwiększenie wlewu oksytocyny, aby przyspieszyć poród',
          'Natychmiastowe cięcie cesarskie bez próby resuscytacji wewnątrzmacicznej'
        ],
        actionKey: 0,
        pearl: 'Deceleracje zmienne wynikają najczęściej z przejściowego ucisku pępowiny (odruch z baroreceptorów). Przy zachowanej zmienności 5–25 bpm i prawidłowej linii bazowej zapis kwalifikuje się jako PODEJRZANY (brak 1 cechy normy bez cech patologii) — kluczowa jest zmiana pozycji i kontrola postępu.'
      },
      {
        id: 'ctg-late',
        title: 'Patologiczny — deceleracje późne + niska zmienność',
        pattern: 'late',
        subtitle: '38+4 Hbd · Stan przedrzucawkowy, FGR',
        vignette: 'Pacjentka z FGR i stanem przedrzucawkowym w 38+4 Hbd podczas indukcji porodu. Linia bazowa 155 bpm, zmienność zredukowana (<5 bpm, niemal płaska linia), a po każdym skurczu występują symetryczne, U-kształtne spadki FHR z nadirem wyraźnie po szczycie skurczu i powolnym powrotem.',
        metrics: { baseline: '155 bpm', variability: '<5 bpm (obniżona)', accelerations: 'Brak', decelerations: 'Późne (powtarzające się)', toco: '4 skurcze / 10 min' },
        figoKey: 2,
        actionQuestion: 'Jaki jest mechanizm deceleracji późnych i pilne działanie kliniczne?',
        actionOpts: [
          'Niewydolność maciczno-łożyskowa / hipoksja (odruch z chemoreceptorów) — natychmiast przerwij oksytocynę, pozycja na lewym boku, nawodnienie i przygotowanie do pilnego ukończenia porodu',
          'Fizjologiczny ucisk główki w I okresie — brak potrzeby interwencji',
          'Artefakt ruchowy matki — wyłącz KTG na 2 godziny',
          'Izolowany ucisk pępowiny — podaj większą dawkę oksytocyny'
        ],
        actionKey: 0,
        pearl: 'Deceleracje późne (nadir >20 s po szczycie skurczu) w połączeniu ze zredukowaną zmiennością (<5 bpm) to klasyczny zapis PATOLOGICZNY FIGO 2015 o wysokim ryzyku kwasicy metabolicznej — wymaga natychmiastowych działań naprawczych i szybkiego ukończenia porodu.'
      },
      {
        id: 'ctg-sin',
        title: 'Patologiczny — rytm sinusoidalny',
        pattern: 'sinusoidal',
        subtitle: '33+5 Hbd · Konflikt RhD / osłabione ruchy',
        vignette: 'Ciężarna w 33+5 Hbd zgłasza nagłe osłabienie ruchów płodu. W zapisie KTG widoczna gładka, regularna fala przypominająca sinusoidę o amplitudzie ~10–12 bpm (130–150 bpm) i częstości 3–4 cykle/min, bez zmienności krótkoterminowej i bez akceleracji, utrzymująca się >30 min.',
        metrics: { baseline: '140 bpm (fala)', variability: 'Sinusoidalna (brak STV)', accelerations: 'Brak', decelerations: 'Brak', toco: 'Spokojna (1 skurcz)' },
        figoKey: 2,
        actionQuestion: 'Z jakim stanem zagrażającym życiu płodu kojarzy się prawdziwy rytm sinusoidalny?',
        actionOpts: [
          'Ciężka niedokrwistość płodu (konflikt serologiczny, krwotok płodowo-matczyny, vasa praevia) lub ciężka hipoksja — pilna ocena MCA-PSV / natychmiastowe rozwiązanie',
          'Prawidłowy sen głęboki płodu (faza NREM)',
          'Łagodna hipotermia matki bez znaczenia dla płodu',
          'Fizjologiczna odpowiedź na skurcze Braxtona-Hicksa'
        ],
        actionKey: 0,
        pearl: 'Prawdziwy rytm sinusoidalny (>30 min, 2–5 cykli/min, amplituda 5–15 bpm, brak zmienności krótkoterminowej) zawsze kwalifikuje KTG jako PATOLOGICZNY FIGO 2015. Różnicuj z pseudosinusoidą (np. po opioidach lub ssaniu kciuka — krótkotrwała, z epizodami prawidłowej zmienności).'
      }
    ];

    const DEFAULT_USG_CASES = [
      {
        id: 'usg-ektopowa',
        title: 'Ciąża ektopowa jajowodowa',
        modality: 'TVS',
        subtitle: '6+2 Hbd · beta-hCG 3200 mIU/ml · ból w prawym dole biodrowym',
        vignette: '29-letnia pacjentka po 6 tyg. zatrzymania miesiączki z jednostronnym bólem podbrzusza i plamieniem. Beta-hCG 3200 mIU/ml (powyżej strefy dyskryminacyjnej 1500–2000). W TVS jama macicy jest pusta (pogrubiałe endometrium bez pęcherzyka ciążowego z pęcherzykiem żółtkowym).',
        scene: 'ectopic',
        hotspot: { x: 355, y: 170, r: 44, label: 'Objaw pierścienia jajowodowego („bagel sign”) obok prawego jajnika' },
        hint: 'Zwróć uwagę na prawą stronę obrazu (przydatki prawe), poza jamą macicy — szukaj hiperechogenicznego pierścienia z centralnym obszarem bezechowym („bagel sign”).',
        mcqQuestion: 'Które postępowanie jest właściwe u tej pacjentki, jeśli RR wynosi 88/54 mmHg, HR 118/min i w zatoce Douglasa widoczny jest duży zbiornik wolnego płynu?',
        mcqOpts: [
          'Pilna laparoskopia operacyjna (salpingektomia) — podejrzenie pękniętej ciąży ektopowej z krwotokiem do jamy otrzewnej',
          'Pojedyncza dawka metotreksatu 50 mg/m2 i.m. i wypis do domu',
          'Postępowanie wyczekujące i powtórzenie beta-hCG za 48 h',
          'Wyłyżeczkowanie jamy macicy jako jedyne leczenie'
        ],
        mcqKey: 0,
        pearl: 'Strefa dyskryminacyjna beta-hCG (1500–2000 mIU/ml) + pusta jama macicy w TVS budzą silne podejrzenie ciąży ektopowej. Niestabilność hemodynamiczna i wolny płyn w jamie brzusznej są bezwzględnym przeciwwskazaniem do metotreksatu — wymagają pilnej operacji!'
      },
      {
        id: 'usg-lozysko',
        title: 'Łożysko przodujące centralne (Placenta previa)',
        modality: 'TVS',
        subtitle: '32+1 Hbd · bezbolesne krwawienie jasnoczerwoną krwią',
        vignette: '34-letnia wieloródka (stan po 2 cięciach cesarskich) w 32+1 Hbd zgłasza się z nagłym, bezbolesnym krwawieniem jasnoczerwoną krwią z pochwy. Mięsień macicy miękki, niebolesny, KTG prawidłowe. Wykonano ostrożne USG przezpochwowe (TVS) szyjki macicy.',
        scene: 'previa',
        hotspot: { x: 262, y: 175, r: 46, label: 'Tkanka łożyskowa całkowicie pokrywająca ujście wewnętrzne szyjki macicy' },
        hint: 'Prześledź kanał szyjki macicy w centrum sektora ku ujściu wewnętrznemu — wskaż miejsce, gdzie jednorodna tkanka łożyska przykrywa ujście wewnętrzne.',
        mcqQuestion: 'Które badanie jest BEZWZGLĘDNIE PRZECIWWSKAZANE przed wykluczeniem łożyska przodującego w USG?',
        mcqOpts: [
          'Badanie dwuręczne / palpacyjne przez pochwę (ryzyko sprowokowania masywnego krwotoku)',
          'USG przezbrzuszne i ostrożne USG przezpochwowe',
          'Zapis KTG płodu',
          'Oznaczenie grupy krwi, morfologii i próby krzyżowej'
        ],
        mcqKey: 0,
        pearl: 'Bezbolesne krwawienie jasnoczerwoną krwią przy miękkiej macicy w II/III trymestrze = klasyczny obraz łożyska przodującego (w przeciwieństwie do przedwczesnego oddzielenia łożyska: ból, deskowato twarda macica, ciemna krew, zaburzenia KTG). U pacjentki po CC dodatkowo wyklucz spektrum łożyska przyrośniętego (PAS).'
      },
      {
        id: 'usg-iota',
        title: 'Guz jajnika z cechami złośliwości (IOTA M-rules)',
        modality: 'TVS',
        subtitle: '61 lat · po menopauzie · CA-125 480 U/ml',
        vignette: '61-letnia pacjentka po menopauzie z powiększeniem obwodu brzucha i uczuciem pełności. W badaniu USG TVS widoczna nieregularna zmiana lito-torbielowata przydatków (92 mm) z licznymi wyroślami brodawkowatymi, przegrodami i wolnym płynem w miednicy mniejszej.',
        scene: 'iota',
        hotspot: { x: 255, y: 162, r: 46, label: 'Nieregularne wyrośla brodawkowate i pole lite (cechy M wg IOTA)' },
        hint: 'Wskaż wewnętrzną ścianę torbieli w centrum zmiany, gdzie widoczne są liczne hiperechogeniczne, nieregularne wyrośla brodawkowate (>=4) i komponenta lita.',
        mcqQuestion: 'Jaką cechę złośliwości (M-rules) klasyfikacji IOTA prezentuje ten obraz i dokąd kierujesz pacjentkę?',
        mcqOpts: [
          'M3 (>=4 wyrośla brodawkowate) / M4 (nieregularny guz lito-torbielowaty) + M2 (wodobrzusze) -> skierowanie do ośrodka ginekologii onkologicznej',
          'B1 (prosta jednokomorowa torbiel) -> kontrola za 12 miesięcy w POZ',
          'Torbiel czynnościowa pęcherzykowa -> leczenie dwuskładnikową tabletką antykoncepcyjną',
          'B2 (cień akustyczny bez unaczynienia) -> punkcja przezpochwowa torbieli'
        ],
        mcqKey: 0,
        pearl: 'Pięć cech M (Malignant) wg IOTA: M1 nieregularny guz lity, M2 wodobrzusze, M3 >=4 wyrośla brodawkowate, M4 nieregularny guz wielokomorowo-lity >=100 mm, M5 bardzo silny przepływ (Color Score 4). Nigdy nie nakłuwaj podejrzanego onkologicznie guza jajnika (ryzyko rozsiewu!).'
      },
      {
        id: 'usg-pcos',
        title: 'Zespół policystycznych jajników (PCOS)',
        modality: 'TVS',
        subtitle: '24 lata · rzadkie miesiączki (co 55 dni) · hirsutyzm',
        vignette: '24-letnia pacjentka zgłasza nieregularne, rzadkie miesiączki od okresu dojrzewania, trądzik i hirsutyzm (skala Ferrimana-Gallweya 12 pkt). W TVS widoczny powiększony jajnik o objętości 14,5 ml z charakterystycznym układem pęcherzyków antralnych.',
        scene: 'pcos',
        hotspot: { x: 260, y: 165, r: 48, label: 'Obwodowy układ licznych drobnych pęcherzyków („sznur pereł”, >=20 o śr. 2–9 mm) wokół hiperechogenicznego zrębu' },
        hint: 'Kliknij obwód powiększonego jajnika w centralnej części sektora, gdzie układają się liczne drobne, bezechowe pęcherzyki antralne 2–9 mm.',
        mcqQuestion: 'Ile kryteriów rotterdamskich (po wykluczeniu innych przyczyn hiperandrogenizmu) jest wymaganych do rozpoznania PCOS u dorosłej kobiety?',
        mcqOpts: [
          'Co najmniej 2 z 3: zaburzenia owulacji (oligo-/anovulacja), hiperandrogenizm (kliniczny lub biochemiczny), obraz PCOM w USG',
          'Wyłącznie obraz PCOM w USG bez objawów klinicznych',
          'Wszystkie 3 kryteria oraz obowiązkowo stosunek LH:FSH >3',
          'Wyłącznie podwyższone stężenie prolaktyny i obniżone AMH'
        ],
        mcqKey: 0,
        pearl: 'Wg aktualnych rekomendacji międzynarodowych (2023) próg PCOM przy nowoczesnych głowicach (>=8 MHz) wynosi >=20 pęcherzyków antralnych (2–9 mm) w jajniku lub objętość jajnika >=10 ml. W PCOS zawsze wyklucz inne przyczyny (TSH, PRL, 17-OHP dla nieklasycznego WPN, zespół Cushinga).'
      }
    ];

    const DEFAULT_BETHESDA_DB = [
      {
        id: 'nilm',
        code: 'NILM',
        name: 'NILM — brak śródbłonkowej neoplazji i raka',
        risk: 'Bardzo niskie (<0,15% CIN3+ w 5 lat przy HPV-)',
        urgency: 'low',
        morphology: 'Prawidłowe komórki nabłonka płaskiego (powierzchniowe i pośrednie) z małym, regularnym jądrem, szeroką cytoplazmą (niski stosunek N:C) oraz obecnością komórek strefy transformacji.',
        management: 'Kontrolne badanie przesiewowe w standardowym interwale (cytologia co 3 lata lub co-testing / HPV HR co 5 lat wg programu profilaktyki PTGiP/NFZ).',
        pearl: 'Obecność zmian odczynowych (zapalenie, atrofia, IUD) lub flory (Candida, Trichomonas, BV) nadal mieści się w kategorii NILM — nie jest zmianą przednowotworową.'
      },
      {
        id: 'ascus',
        code: 'ASC-US',
        name: 'ASC-US — atypowe komórki płaskonabłonkowe o nieokreślonym znaczeniu',
        risk: 'Niskie/pośrednie (~2–4% CIN3+, silnie zależne od statusu HPV HR)',
        urgency: 'mid',
        morphology: 'Powiększenie jąder komórkowych (2,5–3x większe niż w prawidłowej komórce pośredniej), minimalna hiperchromazja, gładki obrys jądra — cechy niewystarczające do rozpoznania LSIL.',
        management: 'Preferowany triage testem HPV HR (reflex HPV na tym samym podłożu LBC): HPV HR (+) -> kolposkopia; HPV HR (-) -> kontrola (co-testing za 3 lata). Alternatywnie powtórzenie cytologii za 12 mies.',
        pearl: 'ASC-US to najczęstszy nieprawidłowy wynik cytologii i podręcznikowe wskazanie do testu HPV HR (triage), który pozwala uniknąć zbędnych kolposkopii u kobiet HPV-ujemnych.'
      },
      {
        id: 'asch',
        code: 'ASC-H',
        name: 'ASC-H — atypowe komórki, nie można wykluczyć HSIL',
        risk: 'Wysokie (~25–40% CIN2+)',
        urgency: 'high',
        morphology: 'Drobne, metaplastyczne komórki z wyraźnie zwiększonym stosunkiem jądrowo-cytoplazmatycznym (wysoki N:C), ciemnymi, nieregularnymi jądrami — podejrzenie zmiany dużego stopnia.',
        management: 'Bezwzględne wskazanie do pilnej kolposkopii (niezależnie od wyniku HPV HR!) z biopsją celowaną podejrzanych ognisk.',
        pearl: 'Pułapka egzaminacyjna: w ASC-H NIE wykonujemy triage HPV HR, aby „odstąpić” od kolposkopii — każda pacjentka z ASC-H wymaga kolposkopii!'
      },
      {
        id: 'lsil',
        code: 'LSIL',
        name: 'LSIL — śródbłonkowa zmiana płaskonabłonkowa małego stopnia',
        risk: 'Pośrednie (~12–16% CIN2+, wysoki odsetek samoistnej regresji, zwłaszcza <25 r.ż.)',
        urgency: 'mid',
        morphology: 'Koilocyty — charakterystyczne przejaśnienie okołojądrowe (halo), wyraźnie odgraniczona gęsta obwodowa cytoplazma, powiększone, często dwujądrzaste komórki (wykładnik produktywnej infekcji HPV).',
        management: 'Kobiety >=25 r.ż.: kolposkopia (zwłaszcza gdy HPV HR+ lub brak wyniku HPV); u kobiet <25 r.ż. preferuje się powtórzenie cytologii za 12 miesięcy (wysoka spontaniczna regresja CIN 1).',
        pearl: 'Koilocytoza jest patognomonicznym wykładnikiem zakażenia HPV w cytologii i histopatologii, typowym dla LSIL / CIN 1.'
      },
      {
        id: 'hsil',
        code: 'HSIL',
        name: 'HSIL — śródbłonkowa zmiana płaskonabłonkowa dużego stopnia',
        risk: 'Bardzo wysokie (>60% CIN2/3, istotne ryzyko raka inwazyjnego)',
        urgency: 'high',
        morphology: 'Wyraźnie podwyższony stosunek N:C, ciemne (hiperchromatyczne) jądra o nieregularnych zarysach i gruboziarnistej chromatynie, skąpa cytoplazma, komórki ułożone pojedynczo lub w syncytialnych płatach.',
        management: 'Pilna kolposkopia z biopsją celowaną (lub leczenie wycinające LEEP/LLETZ w wybranych przypadkach „see-and-treat” u nieciężarnych). U ciężarnych kolposkopia bez łyżeczkowania kanału szyjki (ECC przeciwwskazane w ciąży!).',
        pearl: 'Kategoria HSIL obejmuje histologiczne CIN 2 i CIN 3 (oraz raka in situ). W ciąży nigdy nie wykonujemy rutynowo ECC ani konizacji, chyba że podejrzewamy raka inwazyjnego.'
      },
      {
        id: 'agc',
        code: 'AGC',
        name: 'AGC — atypowe komórki gruczołowe',
        risk: 'Wysokie (~10–30% istotnych zmian szyjki lub endometrium — AIS, rak gruczołowy, rak endometrium)',
        urgency: 'high',
        morphology: 'Płaty i rozetki stłoczonych komórek gruczołowych z nakładaniem się jąder (nuclear crowding), „pierzastym” obrysem (feathering) i podwyższonym stosunkiem N:C.',
        management: 'Pilna kolposkopia + pobranie materiału z kanału szyjki (ECC) + test HPV HR; dodatkowo biopsja endometrium u kobiet >=35 r.ż. lub <35 r.ż. z nieprawidłowym krwawieniem / czynnikami ryzyka raka endometrium.',
        pearl: 'AGC to pułapka egzaminacyjna! Sama kolposkopia tarczy szyjki nie wystarcza — zawsze pamiętaj o kanale szyjki (ECC) oraz ocenie endometrium (>=35 r.ż.).'
      }
    ];

    const DEFAULT_BETHESDA_PUZZLES = [
      {
        id: 'bp-1',
        vignette: '28-letnia kobieta zgłasza się na profilaktyczną cytologię LBC. Patomorfolog opisuje liczne komórki pośrednie z wyraźnym przejaśnieniem okołojądrowym (halo), pogrubiałym obwodem cytoplazmy i dwujądrzastością.',
        visualId: 'lsil',
        step1Prompt: 'Krok 1/2: Której kategorii systemu Bethesda 2014 odpowiada opisany obraz cytologiczny (koilocyty)?',
        step1Opts: ['LSIL', 'NILM', 'AGC', 'ASC-H'],
        step1Key: 0,
        step1Why: 'Koilocyty (halo okołojądrowe + atypia jądrowa / dwujądrzastość) to klasyczny wykładnik produktywnej infekcji HPV typowy dla LSIL (CIN 1).',
        step2Prompt: 'Krok 2/2: Jaki jest właściwy kolejny krok u tej 28-letniej pacjentki (gdy test HPV HR okazał się dodatni)?',
        step2Opts: [
          'Skierowanie na kolposkopię z oceną strefy transformacji',
          'Natychmiastowa histerektomia prosta',
          'Powtórzenie cytologii za 5 lat',
          'Antybiotykoterapia miejscowa bez dalszej diagnostyki'
        ],
        step2Key: 0,
        step2Why: 'U kobiet >=25 r.ż. z wynikiem LSIL (zwłaszcza przy dodatnim HPV HR) wskazana jest kolposkopia w celu wykluczenia ukrytego ogniska CIN2+.'
      },
      {
        id: 'bp-2',
        vignette: '36-letnia pacjentka bez objawów otrzymuje wynik cytologii LBC: ASC-US. Materiał pobrano na podłoże płynne (LBC).',
        visualId: 'ascus',
        step1Prompt: 'Krok 1/2: Co oznacza skrót ASC-US w klasyfikacji Bethesda?',
        step1Opts: [
          'Atypowe komórki nabłonka płaskiego o nieokreślonym znaczeniu',
          'Atypowe komórki gruczołowe kanału szyjki',
          'Śródbłonkowa zmiana dużego stopnia (CIN 3)',
          'Brak śródbłonkowej neoplazji i raka'
        ],
        step1Key: 0,
        step1Why: 'ASC-US (Atypical Squamous Cells of Undetermined Significance) to zmiany graniczne, niewystarczające do rozpoznania LSIL.',
        step2Prompt: 'Krok 2/2: Jakie jest preferowane postępowanie diagnostyczne I wyboru (triage) z pobranego podłoża LBC?',
        step2Opts: [
          'Wykonanie testu w kierunku onkogennych typów HPV (HPV HR reflex)',
          'Natychmiastowa konizacja elektrochirurgiczna LEEP bez kolposkopii',
          'Łyżeczkowanie jamy macicy i kanału szyjki',
          'Oznaczenie CA-125 i HE4'
        ],
        step2Key: 0,
        step2Why: 'W ASC-US złotym standardem selekcji (triage) jest test HPV HR — dopiero jego dodatni wynik kieruje pacjentkę na kolposkopię.'
      },
      {
        id: 'bp-3',
        vignette: '44-letnia kobieta z okresowym plamieniem międzymiesiączkowym otrzymuje wynik cytologii: AGC-NOS (atypowe komórki gruczołowe).',
        visualId: 'agc',
        step1Prompt: 'Krok 1/2: Z jakich struktur anatomicznych mogą pochodzić atypowe komórki w wyniku AGC?',
        step1Opts: [
          'Z kanału szyjki macicy (endocervix) lub błony śluzowej trzonu macicy (endometrium)',
          'Wyłącznie z nabłonka wielowarstwowego płaskiego pochwy',
          'Wyłącznie z trofoblastu łożyskowego',
          'Są artefaktem prawidłowego cyklu miesiączkowego'
        ],
        step1Key: 0,
        step1Why: 'AGC może sygnalizować zarówno gruczolakoraka in situ (AIS) / raka szyjki, jak i rozrost lub raka endometrium.',
        step2Prompt: 'Krok 2/2: Jaki pełny zestaw badań należy wykonać u tej 44-letniej pacjentki?',
        step2Opts: [
          'Kolposkopia + pobranie materiału z kanału szyjki (ECC) + biopsja endometrium + test HPV HR',
          'Wyłącznie powtórzenie cytologii za 12 miesięcy',
          'Wyłącznie test HPV HR — przy ujemnym HPV kończymy diagnostykę',
          'Tylko kolposkopia tarczy szyjki bez oceny kanału i endometrium'
        ],
        step2Key: 0,
        step2Why: 'W AGC u kobiety >=35 r.ż. (a tym bardziej z nieprawidłowym krwawieniem) obowiązkowe są kolposkopia, ECC oraz biopsja endometrium (ujemny HPV nie wyklucza raka endometrium!).'
      }
    ];

    /* ---------- Normalizatory źródeł HUB_META ---------- */
    function getCtgCases() {
      const meta = window.HUB_META;
      const raw = meta && Array.isArray(meta.CTG_CASES) && meta.CTG_CASES.length ? meta.CTG_CASES : DEFAULT_CTG_CASES;
      return raw.map((c, idx) => {
        const figoMap = { normal: 0, norma: 0, suspicious: 1, podejrzany: 1, pathological: 2, patologiczny: 2 };
        let fKey = typeof c.figoKey === 'number' ? c.figoKey : figoMap[String(c.figo || c.category || '').toLowerCase()];
        if (typeof fKey !== 'number') fKey = idx === 0 ? 0 : (idx === 1 ? 1 : 2);
        return {
          id: c.id || ('ctg-' + idx),
          title: c.title || c.name || ('Zapis KTG ' + (idx + 1)),
          pattern: c.pattern || (String(c.id).includes('sin') ? 'sinusoidal' : (String(c.id).includes('late') || String(c.id).includes('path') ? 'late' : (String(c.id).includes('var') || String(c.id).includes('susp') ? 'variable' : 'normal'))),
          subtitle: c.subtitle || c.sub || '',
          vignette: c.vignette || c.desc || c.clinical || '',
          metrics: c.metrics || {
            baseline: c.baseline || '140 bpm',
            variability: c.variability || '5–25 bpm',
            accelerations: c.accelerations || '—',
            decelerations: c.decelerations || '—',
            toco: c.toco || '3/10 min'
          },
          figoKey: fKey,
          actionQuestion: c.actionQuestion || c.question || 'Jakie jest właściwe postępowanie kliniczne wg FIGO 2015?',
          actionOpts: Array.isArray(c.actionOpts) ? c.actionOpts : (Array.isArray(c.opts) ? c.opts : ['Kontynuacja nadzoru', 'Resuscytacja wewnątrzmaciczna i ścisłe KTG', 'Pilne ukończenie porodu']),
          actionKey: typeof c.actionKey === 'number' ? c.actionKey : (typeof c.key === 'number' ? c.key : 0),
          pearl: c.pearl || c.why || ''
        };
      });
    }

    function getUsgCases() {
      const meta = window.HUB_META;
      const raw = meta && Array.isArray(meta.USG_TRAINER_CASES) && meta.USG_TRAINER_CASES.length ? meta.USG_TRAINER_CASES : DEFAULT_USG_CASES;
      const sceneModMap = { ectopic: '3', previa: '1', iota: '12', pcos: '8' };
      return raw.map((c, idx) => {
        const scene = c.scene || (String(c.id).includes('loz') || String(c.id).includes('prev') ? 'previa' : (String(c.id).includes('iota') || String(c.id).includes('guz') ? 'iota' : (String(c.id).includes('pcos') ? 'pcos' : 'ectopic')));
        const mod = (Array.isArray(c.mods) && c.mods[0]) ? String(c.mods[0]) : (c.mod ? String(c.mod) : (sceneModMap[scene] || '4'));
        return {
          id: c.id || ('usg-' + idx),
          title: c.title || c.name || ('Przypadek USG ' + (idx + 1)),
          modality: c.modality || 'TVS',
          subtitle: c.subtitle || c.sub || '',
          vignette: c.vignette || c.desc || '',
          scene,
          mod,
          hotspot: c.hotspot || { x: 260, y: 165, r: 44, label: 'Kluczowa zmiana patologiczna' },
          hint: c.hint || 'Wskaż centralną patologię w sektorze USG.',
          mcqQuestion: c.mcqQuestion || c.question || 'Wybierz właściwe rozpoznanie / postępowanie:',
          mcqOpts: Array.isArray(c.mcqOpts) ? c.mcqOpts : (Array.isArray(c.opts) ? c.opts : []),
          mcqKey: typeof c.mcqKey === 'number' ? c.mcqKey : (typeof c.key === 'number' ? c.key : 0),
          pearl: c.pearl || c.why || ''
        };
      });
    }

    function getBethesdaDb() {
      const meta = window.HUB_META;
      const raw = meta && Array.isArray(meta.BETHESDA_DATABASE) && meta.BETHESDA_DATABASE.length ? meta.BETHESDA_DATABASE : DEFAULT_BETHESDA_DB;
      return raw.map((b, idx) => ({
        id: b.id || ('beth-' + idx),
        code: b.code || b.short || b.name || 'Bethesda',
        name: b.name || b.title || b.code || '',
        risk: b.risk || '',
        urgency: b.urgency || (String(b.code).match(/HSIL|ASC-H|AGC/i) ? 'high' : (String(b.code).match(/NILM/i) ? 'low' : 'mid')),
        morphology: b.morphology || b.cytology || b.desc || '',
        management: b.management || b.action || b.ptgip || '',
        pearl: b.pearl || b.trap || ''
      }));
    }

    function getBethesdaPuzzles() {
      const meta = window.HUB_META;
      const raw = meta && Array.isArray(meta.BETHESDA_PUZZLES) && meta.BETHESDA_PUZZLES.length ? meta.BETHESDA_PUZZLES : DEFAULT_BETHESDA_PUZZLES;
      return raw.map((p, idx) => ({
        id: p.id || ('bp-' + idx),
        vignette: p.vignette || p.desc || '',
        visualId: p.visualId || p.categoryId || 'lsil',
        step1Prompt: p.step1Prompt || 'Krok 1/2: Wskaż kategorię Bethesda 2014:',
        step1Opts: Array.isArray(p.step1Opts) ? p.step1Opts : [],
        step1Key: typeof p.step1Key === 'number' ? p.step1Key : 0,
        step1Why: p.step1Why || '',
        step2Prompt: p.step2Prompt || 'Krok 2/2: Wskaż właściwe postępowanie wg PTGiP:',
        step2Opts: Array.isArray(p.step2Opts) ? p.step2Opts : [],
        step2Key: typeof p.step2Key === 'number' ? p.step2Key : 0,
        step2Why: p.step2Why || ''
      }));
    }

    /* ---------- Generator SVG zapisu KTG (papier milimetrowy + FHR + TOCO) ---------- */
    function seededNoise(seed) {
      let s = seed >>> 0;
      return function () {
        s = (s * 1664525 + 1013904223) >>> 0;
        return (s / 4294967296) - 0.5;
      };
    }

    function buildCtgSvg(c) {
      const W = 740;
      const H = 356;
      const left = 52;
      const right = 712; // width = 660 -> 10 min -> 66 px/min
      const plotW = right - left;
      const fhrTop = 22;
      const fhrH = 192; // 50..210 bpm (160 bpm span -> 1.2 px/bpm)
      const fhrY = bpm => fhrTop + (210 - Math.max(50, Math.min(210, bpm))) * (fhrH / 160);

      const tocoTop = 246;
      const tocoH = 88; // 0..100 mmHg
      const tocoY = mm => tocoTop + (100 - Math.max(0, Math.min(100, mm))) * (tocoH / 100);

      const pat = c.pattern || 'normal';
      const rand = seededNoise(pat.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7));

      // Punkty co 1.5 sekundy (400 próbek dla 10 minut)
      const samples = 400;
      const fhrPts = [];
      const tocoPts = [];

      // Definicje szczytów skurczów (w minutach 0..10)
      const contractions = pat === 'sinusoidal'
        ? [{ t: 4.5, amp: 38, w: 0.48 }]
        : (pat === 'normal'
          ? [{ t: 1.8, amp: 68, w: 0.42 }, { t: 5.1, amp: 74, w: 0.44 }, { t: 8.4, amp: 70, w: 0.42 }]
          : [{ t: 1.4, amp: 72, w: 0.42 }, { t: 3.9, amp: 78, w: 0.44 }, { t: 6.4, amp: 75, w: 0.43 }, { t: 8.8, amp: 74, w: 0.42 }]);

      for (let i = 0; i <= samples; i++) {
        const min = (i / samples) * 10;
        const x = left + (i / samples) * plotW;

        // TOCO
        let toco = 10 + Math.sin(min * 2.1) * 1.2 + rand() * 1.4;
        for (let k = 0; k < contractions.length; k++) {
          const ct = contractions[k];
          const dt = (min - ct.t) / ct.w;
          toco += ct.amp * Math.exp(-dt * dt * 1.6);
        }
        tocoPts.push(`${x.toFixed(1)},${tocoY(toco).toFixed(1)}`);

        // FHR
        let fhr = 140;
        if (pat === 'normal') {
          const macro = Math.sin(min * 5.2) * 4.5 + Math.cos(min * 9.7) * 3.0;
          const micro = rand() * 6.0;
          // 2 fizjologiczne akceleracje (>15 bpm, >15 s)
          const acc1 = 22 * Math.exp(-Math.pow((min - 2.6) / 0.28, 2));
          const acc2 = 20 * Math.exp(-Math.pow((min - 6.7) / 0.30, 2));
          fhr = 140 + macro + micro + acc1 + acc2;
        } else if (pat === 'variable') {
          const macro = Math.sin(min * 4.8) * 4.0 + Math.cos(min * 8.9) * 2.6;
          const micro = rand() * 5.2;
          let decel = 0;
          // Nagłe V-kształtne deceleracje zmienne o różnym przesunięciu względem skurczów
          const vDrops = [
            { t: 1.55, d: 46, w: 0.22 },
            { t: 3.75, d: 52, w: 0.24 },
            { t: 6.62, d: 42, w: 0.20 },
            { t: 8.70, d: 48, w: 0.23 }
          ];
          vDrops.forEach(vd => {
            const dist = Math.abs(min - vd.t);
            if (dist < vd.w) decel -= vd.d * (1 - dist / vd.w);
            else if (dist < vd.w + 0.14) decel += 6 * (1 - (dist - vd.w) / 0.14); // subtelne „ramię”
          });
          fhr = 145 + macro + micro + decel;
        } else if (pat === 'late') {
          // Obniżona zmienność (<5 bpm) + późne U-kształtne deceleracje (nadir 0.45 min po szczycie skurczu)
          const flatVar = Math.sin(min * 3.1) * 1.4 + rand() * 2.1;
          let decel = 0;
          contractions.forEach(ct => {
            const nadirT = ct.t + 0.48;
            const dt = (min - nadirT) / 0.44;
            decel -= 36 * Math.exp(-dt * dt * 1.8);
          });
          fhr = 155 + flatVar + decel;
        } else if (pat === 'sinusoidal') {
          // Gładka fala sinusoidalna 3.5 cykli/min, amplituda ~11 bpm, brak zmienności krótkoterminowej
          fhr = 140 + 11 * Math.sin(min * Math.PI * 2 * 3.4) + rand() * 0.6;
        } else {
          fhr = 140 + Math.sin(min * 5) * 4 + rand() * 5;
        }

        fhrPts.push(`${x.toFixed(1)},${fhrY(fhr).toFixed(1)}`);
      }

      // Linie siatki milimetrowej
      let gridLines = '';
      // Pionowe (co 0.5 min = 30 s, grubsze co 1 min)
      for (let halfMin = 0; halfMin <= 20; halfMin++) {
        const x = left + (halfMin / 20) * plotW;
        const major = halfMin % 2 === 0;
        const strokeColor = major ? 'var(--ctg-grid-major, #DFABA0)' : 'var(--ctg-grid-minor, #F3DFD8)';
        gridLines += `<line x1="${x.toFixed(1)}" y1="${fhrTop}" x2="${x.toFixed(1)}" y2="${fhrTop + fhrH}" stroke="${strokeColor}" stroke-width="${major ? 1.1 : 0.6}"/>`;
        gridLines += `<line x1="${x.toFixed(1)}" y1="${tocoTop}" x2="${x.toFixed(1)}" y2="${tocoTop + tocoH}" stroke="${strokeColor}" stroke-width="${major ? 1.1 : 0.6}"/>`;
        if (major) {
          gridLines += `<text x="${x.toFixed(1)}" y="${fhrTop + fhrH + 16}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--ctg-muted, #596870)">${halfMin / 2} min</text>`;
        }
      }
      // Poziome FHR (co 10 bpm)
      for (let bpm = 50; bpm <= 210; bpm += 10) {
        const y = fhrY(bpm);
        const major = bpm % 20 === 0;
        gridLines += `<line x1="${left}" y1="${y.toFixed(1)}" x2="${right}" y2="${y.toFixed(1)}" stroke="${major ? 'var(--ctg-grid-major, #DFABA0)' : 'var(--ctg-grid-minor, #F3DFD8)'}" stroke-width="${major ? 1.0 : 0.55}"/>`;
        if (major && bpm >= 60 && bpm <= 200) {
          gridLines += `<text x="${left - 7}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="10" font-weight="700" fill="var(--ctg-muted, #596870)">${bpm}</text>`;
        }
      }
      // Poziome TOCO (co 25 mmHg)
      for (let mm = 0; mm <= 100; mm += 25) {
        const y = tocoY(mm);
        gridLines += `<line x1="${left}" y1="${y.toFixed(1)}" x2="${right}" y2="${y.toFixed(1)}" stroke="var(--ctg-grid-major, #DFABA0)" stroke-width="0.9"/>`;
        gridLines += `<text x="${left - 7}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="10" font-weight="700" fill="var(--ctg-muted, #596870)">${mm}</text>`;
      }

      const normBandY = fhrY(160);
      const normBandH = fhrY(110) - fhrY(160);

      return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Zapis kardiotokograficzny KTG: kanał FHR 50–210 bpm oraz kanał TOCO 0–100 mmHg">
        <rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="var(--ctg-bg, #FFFDF7)"/>
        <text x="${left}" y="14" font-size="11" font-weight="800" fill="var(--ctg-ink, #13232C)">FHR (uderzenia/min) · Papier 1 cm/min · Pasmo normy 110–160 bpm</text>
        <text x="${right}" y="14" text-anchor="end" font-size="10.5" font-weight="700" fill="var(--ctg-muted, #596870)">10 min</text>

        <!-- Strefa fizjologiczna 110-160 bpm -->
        <rect x="${left}" y="${normBandY.toFixed(1)}" width="${plotW}" height="${normBandH.toFixed(1)}" fill="var(--ctg-band, rgba(33,107,62,0.08))"/>
        ${gridLines}
        <line x1="${left}" y1="${fhrY(160).toFixed(1)}" x2="${right}" y2="${fhrY(160).toFixed(1)}" stroke="var(--green, #216B3E)" stroke-width="1" stroke-dasharray="4 3" opacity="0.7"/>
        <line x1="${left}" y1="${fhrY(110).toFixed(1)}" x2="${right}" y2="${fhrY(110).toFixed(1)}" stroke="var(--green, #216B3E)" stroke-width="1" stroke-dasharray="4 3" opacity="0.7"/>
        <rect x="${left}" y="${fhrTop}" width="${plotW}" height="${fhrH}" fill="none" stroke="var(--ctg-grid-major, #DFABA0)" stroke-width="1.3"/>

        <!-- Krzywa FHR -->
        <polyline points="${fhrPts.join(' ')}" fill="none" stroke="var(--ctg-fhr, #13232C)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>

        <!-- Kanał TOCO -->
        <text x="${left}" y="${tocoTop - 7}" font-size="11" font-weight="800" fill="var(--ctg-toco, #24579E)">TOCO — czynność skurczowa macicy (jednostki względne / mmHg)</text>
        <rect x="${left}" y="${tocoTop}" width="${plotW}" height="${tocoH}" fill="none" stroke="var(--ctg-grid-major, #DFABA0)" stroke-width="1.3"/>
        <polyline points="${tocoPts.join(' ')}" fill="none" stroke="var(--ctg-toco, #24579E)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      </svg>`;
    }

    /* ---------- Generator ciemnego sektora USG SVG z klikalnym hotspotem ---------- */
    function buildUsgSvg(c, found, showHint, lastMiss) {
      const hs = c.hotspot;
      let anatomy = '';

      if (c.scene === 'ectopic') {
        anatomy = `
          <!-- Macica (pusta jama, pogrubiałe endometrium) -->
          <ellipse cx="195" cy="185" rx="74" ry="54" fill="url(#usgTissue)" stroke="#475569" stroke-width="1.5"/>
          <path d="M150 182 Q195 168 242 184 Q195 198 150 182 Z" fill="#cbd5e1" opacity="0.75"/>
          <text x="195" y="255" text-anchor="middle" font-size="11" fill="#94a3b8" font-family="monospace">MACICA (pusta jama)</text>
          <!-- Wolny płyn w zatoce Douglasa -->
          <path d="M235 230 Q290 258 345 232 Q315 276 255 268 Z" fill="#020617" stroke="#334155" stroke-width="1"/>
          <text x="292" y="280" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="monospace">płyn (Z. Douglasa)</text>
          <!-- Jajnik prawy -->
          <ellipse cx="395" cy="215" rx="34" ry="22" fill="#334155" stroke="#64748b" stroke-width="1"/>
          <circle cx="386" cy="212" r="5" fill="#0f172a"/><circle cx="404" cy="218" r="6" fill="#0f172a"/>
          <!-- Objaw pierścienia jajowodowego (bagel sign) -->
          <circle cx="${hs.x}" cy="${hs.y}" r="26" fill="#e2e8f0" opacity="0.88"/>
          <circle cx="${hs.x}" cy="${hs.y}" r="14" fill="#020617"/>
          <circle cx="${hs.x + 3}" cy="${hs.y - 2}" r="4.5" fill="none" stroke="#cbd5e1" stroke-width="1.5"/>
        `;
      } else if (c.scene === 'previa') {
        anatomy = `
          <!-- Pęcherz moczowy (bezechowy u góry z lewej) -->
          <path d="M125 98 Q185 82 225 112 Q185 138 130 124 Z" fill="#020617" stroke="#475569" stroke-width="1.2"/>
          <text x="172" y="114" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="monospace">PĘCHERZ</text>
          <!-- Szyjka macicy i kanał szyjki -->
          <rect x="215" y="195" width="95" height="68" rx="18" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
          <line x1="262" y1="196" x2="262" y2="262" stroke="#e2e8f0" stroke-width="2.5" stroke-dasharray="4 2"/>
          <text x="262" y="282" text-anchor="middle" font-size="11" fill="#94a3b8" font-family="monospace">KANAŁ SZYJKI (TVS)</text>
          <!-- Łożysko całkowicie pokrywające ujście wewnętrzne -->
          <path d="M150 155 Q262 118 378 162 Q355 204 262 198 Q175 202 150 155 Z" fill="url(#usgPlacenta)" stroke="#cbd5e1" stroke-width="1.5"/>
          <!-- Płyn owodniowy ponad łożyskiem -->
          <path d="M180 128 Q262 85 352 128 Q262 115 180 128 Z" fill="#020617" opacity="0.8"/>
        `;
      } else if (c.scene === 'iota') {
        anatomy = `
          <!-- Wolny płyn (ascites) wokół zmiany -->
          <path d="M120 225 Q260 288 405 225 Q375 292 260 296 Q150 290 120 225 Z" fill="#020617"/>
          <text x="260" y="286" text-anchor="middle" font-size="10.5" fill="#94a3b8" font-family="monospace">WOLNY PŁYN (ASCITES)</text>
          <!-- Duża wielokomorowa torbiel lito-torbielowata -->
          <ellipse cx="260" cy="170" rx="112" ry="74" fill="#090d16" stroke="#94a3b8" stroke-width="2.5"/>
          <!-- Grube nieregularne przegrody -->
          <path d="M185 116 Q235 170 210 235" fill="none" stroke="#94a3b8" stroke-width="3.2"/>
          <path d="M312 108 Q285 168 328 228" fill="none" stroke="#94a3b8" stroke-width="2.8"/>
          <!-- Wyrośla brodawkowate (>=4) i komponenta lita -->
          <path d="M218 175 Q232 132 254 148 Q268 122 288 152 Q305 142 302 184 Q282 208 242 202 Z" fill="#cbd5e1" opacity="0.88"/>
          <circle cx="190" cy="174" r="14" fill="#cbd5e1" opacity="0.8"/>
          <circle cx="332" cy="176" r="13" fill="#cbd5e1" opacity="0.8"/>
        `;
      } else {
        anatomy = `
          <!-- Powiększony jajnik PCOS z hiperechogenicznym zrębem i sznurem pereł -->
          <ellipse cx="260" cy="168" rx="108" ry="68" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
          <!-- Hiperechogeniczny centralny zrąb -->
          <ellipse cx="260" cy="168" rx="64" ry="34" fill="#cbd5e1" opacity="0.72"/>
          <text x="260" y="172" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1e293b" font-family="monospace">ZRĄB (HIPER)</text>
          <!-- Obwodowy sznur pereł (14 widocznych w jednym przekroju drobnych pęcherzyków 2-9 mm) -->
          ${[
            [172,158],[180,134],[198,116],[224,108],[254,105],[286,108],[314,116],[338,132],
            [350,156],[344,184],[326,206],[298,220],[266,226],[232,224],[202,214],[180,192]
          ].map(([cx, cy], i) => `<circle cx="${cx}" cy="${cy}" r="${(i % 3 === 0) ? 9 : 7.5}" fill="#020617" stroke="#94a3b8" stroke-width="1"/>`).join('')}
          <text x="260" y="264" text-anchor="middle" font-size="11" fill="#94a3b8" font-family="monospace">JAJNIK V = 14.5 ml (PCOM)</text>
        `;
      }

      const depthTicks = [2, 4, 6, 8, 10].map((cm, idx) => {
        const y = 60 + idx * 52;
        return `<line x1="484" y1="${y}" x2="496" y2="${y}" stroke="#94a3b8" stroke-width="1.2"/><text x="502" y="${y + 4}" font-size="10" fill="#94a3b8" font-family="monospace">${cm}cm</text>`;
      }).join('');

      return `<svg id="usgInteractiveSvg" class="imaging-canvas-svg" viewBox="0 0 530 315" role="group" aria-label="Obraz ultrasonograficzny: ${esc(c.title)}">
        <defs>
          <radialGradient id="usgSectorGrad" cx="50%" cy="6%" r="92%">
            <stop offset="0%" stop-color="#1e293b" stop-opacity="0.95"/>
            <stop offset="55%" stop-color="#0f172a" stop-opacity="0.98"/>
            <stop offset="100%" stop-color="#020617" stop-opacity="1"/>
          </radialGradient>
          <radialGradient id="usgTissue" cx="45%" cy="45%" r="60%">
            <stop offset="0%" stop-color="#64748b"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </radialGradient>
          <linearGradient id="usgPlacenta" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#94a3b8"/>
            <stop offset="50%" stop-color="#cbd5e1"/>
            <stop offset="100%" stop-color="#64748b"/>
          </linearGradient>
          <clipPath id="usgSectorClip">
            <path d="M210 18 L310 18 L480 285 Q260 320 40 285 Z"/>
          </clipPath>
        </defs>

        <rect x="0" y="0" width="530" height="315" fill="#05080f"/>
        <path d="M210 18 L310 18 L480 285 Q260 320 40 285 Z" fill="url(#usgSectorGrad)" stroke="#334155" stroke-width="1.5"/>

        <g clip-path="url(#usgSectorClip)">
          ${anatomy}
          <!-- Interaktywny obszar patologii -->
          ${(showHint || found) ? `<circle class="imaging-pulse-circle" cx="${hs.x}" cy="${hs.y}" r="${hs.r}" fill="none" stroke="${found ? '#3bb36e' : '#f59e0b'}" stroke-width="2.5"/>` : ''}
          ${found ? `<circle cx="${hs.x}" cy="${hs.y}" r="${hs.r - 4}" fill="rgba(59,179,110,0.16)" stroke="#3bb36e" stroke-width="2.5" stroke-dasharray="5 3"/>` : ''}
          <circle id="usgHotspotTarget" class="imaging-hit-circle" cx="${hs.x}" cy="${hs.y}" r="${hs.r}" fill="transparent" tabindex="0" role="button" aria-label="Wskaż kluczową patologię na obrazie USG" style="cursor:pointer"/>
          ${lastMiss && !found ? `<g><circle cx="${lastMiss.x}" cy="${lastMiss.y}" r="9" fill="none" stroke="#ef4444" stroke-width="2"/><line x1="${lastMiss.x - 5}" y1="${lastMiss.y - 5}" x2="${lastMiss.x + 5}" y2="${lastMiss.y + 5}" stroke="#ef4444" stroke-width="2"/><line x1="${lastMiss.x + 5}" y1="${lastMiss.y - 5}" x2="${lastMiss.x - 5}" y2="${lastMiss.y + 5}" stroke="#ef4444" stroke-width="2"/></g>` : ''}
        </g>

        ${depthTicks}
        <text x="14" y="22" font-size="10.5" fill="#94a3b8" font-family="monospace">${esc(c.modality)} · 7.5 MHz · MI 0.8 · TIS 0.2</text>
      </svg>`;
    }

    /* ---------- Generator SVG schematu cytologii Bethesda ---------- */
    function buildBethesdaSvg(id) {
      const cells = {
        nilm: `
          <polygon points="85,115 145,70 215,95 205,165 135,180 75,155" fill="#e8c5d3" fill-opacity="0.55" stroke="#8a284c" stroke-width="1.5"/>
          <circle cx="148" cy="128" r="10" fill="#3b1d5e"/>
          <polygon points="180,55 255,40 295,95 260,152 192,140" fill="#bfdbfe" fill-opacity="0.55" stroke="#2b63ae" stroke-width="1.5"/>
          <circle cx="236" cy="98" r="11" fill="#3b1d5e"/>
          <text x="180" y="212" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-2)">Małe, regularne jądra · szeroka cytoplazma (niski N:C)</text>
        `,
        ascus: `
          <polygon points="90,85 168,58 238,95 222,168 132,178 78,142" fill="#e8c5d3" fill-opacity="0.6" stroke="#8a284c" stroke-width="1.5"/>
          <ellipse cx="158" cy="120" rx="22" ry="18" fill="#4c1d95" opacity="0.88"/>
          <polygon points="215,112 282,88 308,144 265,184 212,165" fill="#bfdbfe" fill-opacity="0.55" stroke="#2b63ae" stroke-width="1.5"/>
          <circle cx="258" cy="138" r="11" fill="#3b1d5e"/>
          <text x="180" y="212" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-2)">Powiększone jądro (2,5–3x), gładki zarys, bez pełnych cech LSIL</text>
        `,
        asch: `
          <circle cx="135" cy="118" r="34" fill="#d8b4fe" fill-opacity="0.55" stroke="#6b21a8" stroke-width="1.8"/>
          <ellipse cx="135" cy="118" rx="22" ry="20" fill="#3b0764"/>
          <circle cx="215" cy="112" r="30" fill="#d8b4fe" fill-opacity="0.55" stroke="#6b21a8" stroke-width="1.8"/>
          <ellipse cx="215" cy="112" rx="20" ry="18" fill="#3b0764"/>
          <text x="180" y="212" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-2)">Drobne komórki metaplastyczne · wysoki N:C · podejrzenie HSIL</text>
        `,
        lsil: `
          <polygon points="78,108 152,55 245,78 268,148 190,185 95,168" fill="#c4b5fd" fill-opacity="0.45" stroke="#641b36" stroke-width="2.5"/>
          <!-- Wyraźne przejaśnienie okołojądrowe (koilocyt) -->
          <ellipse cx="172" cy="120" rx="52" ry="38" fill="#f3eff8" fill-opacity="0.78" stroke="#9333ea" stroke-width="1.4" stroke-dasharray="4 3"/>
          <!-- Dwujądrzastość i atypia jądrowa -->
          <ellipse cx="158" cy="120" rx="16" ry="13" fill="#3b0764"/>
          <ellipse cx="188" cy="122" rx="15" ry="13" fill="#3b0764"/>
          <text x="180" y="212" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-2)">Koilocyt: halo okołojądrowe, gęsty brzeg cytoplazmy, dwujądrzastość</text>
        `,
        hsil: `
          <g fill="#f3e8ff" stroke="#7e22ce" stroke-width="1.6">
            <circle cx="118" cy="112" r="24"/><circle cx="164" cy="96" r="25"/><circle cx="206" cy="118" r="23"/><circle cx="158" cy="144" r="24"/><circle cx="248" cy="108" r="22"/>
          </g>
          <g fill="#2e1065">
            <path d="M104 106 Q118 92 132 108 Q128 128 108 124 Z"/>
            <path d="M148 90 Q166 76 180 96 Q174 114 150 108 Z"/>
            <path d="M192 110 Q208 98 220 116 Q214 134 194 128 Z"/>
            <path d="M144 138 Q160 124 174 146 Q164 162 146 154 Z"/>
            <path d="M235 100 Q252 90 262 108 Q254 124 238 118 Z"/>
          </g>
          <text x="180" y="212" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-2)">Bardzo wysoki N:C · ciemne, nieregularne jądra · skąpa cytoplazma</text>
        `,
        agc: `
          <g fill="#dbeafe" stroke="#1d4ed8" stroke-width="1.4" opacity="0.88">
            <ellipse cx="145" cy="106" rx="34" ry="20" transform="rotate(-18 145 106)"/>
            <ellipse cx="185" cy="96" rx="36" ry="20" transform="rotate(8 185 96)"/>
            <ellipse cx="222" cy="118" rx="34" ry="20" transform="rotate(28 222 118)"/>
            <ellipse cx="166" cy="138" rx="34" ry="20" transform="rotate(-8 166 138)"/>
            <ellipse cx="205" cy="142" rx="32" ry="18" transform="rotate(14 205 142)"/>
          </g>
          <g fill="#1e3a8a">
            <ellipse cx="146" cy="106" rx="14" ry="9"/><ellipse cx="184" cy="98" rx="15" ry="9"/><ellipse cx="218" cy="118" rx="14" ry="9"/><ellipse cx="168" cy="136" rx="14" ry="9"/><ellipse cx="204" cy="140" rx="13" ry="8"/>
          </g>
          <text x="180" y="212" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-2)">Stłoczone płaty / rozetki komórek gruczołowych (nuclear crowding)</text>
        `
      };
      return `<svg class="rash-svg-canvas" viewBox="0 0 360 228" role="img" aria-label="Schemat cytomorfologii ${esc(id.toUpperCase())}">
        <rect x="6" y="6" width="348" height="190" rx="12" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
        <circle cx="180" cy="102" r="82" fill="var(--bg)" stroke="var(--line-2)" stroke-width="1.5" stroke-dasharray="4 4"/>
        ${cells[id] || cells.lsil}
      </svg>`;
    }

    /* ---------- Renderery zakładek ---------- */

    function renderKtgTab() {
      const cases = getCtgCases();
      const active = cases.find(c => c.id === CTG_STATE.activeId) || cases[0];
      CTG_STATE.activeId = active.id;
      const ans = CTG_STATE.answers[active.id] || {};
      const figoAnswered = typeof ans.figo === 'number';
      const actionAnswered = typeof ans.action === 'number';
      const figoLabels = [
        'Prawidłowy (Norma FIGO 2015)',
        'Podejrzany (FIGO 2015)',
        'Patologiczny (FIGO 2015)'
      ];
      const solvedCount = cases.filter(c => CTG_STATE.solved.includes(c.id)).length;
      const solvedPct = typeof pct === 'function' ? pct(solvedCount, cases.length) : Math.round(100 * solvedCount / Math.max(1, cases.length));

      return `
        <div class="imaging-trainer-wrapper">
          <div class="imaging-filter-bar">
            <div style="font-size:.88rem;font-weight:700;color:var(--ink-2)">
              Opanowane zapisy KTG: <strong style="color:var(--teal-d)">${solvedCount} / ${cases.length}</strong> (${solvedPct}%)
            </div>
            <div style="display:flex;gap:.5rem;flex-wrap:wrap">
              <button type="button" class="btn sec sm" id="btnToggleFigoRef">${ICON_BOOK} ${CTG_STATE.showRef ? 'Ukryj tabelę FIGO 2015' : 'Ściąga FIGO 2015'}</button>
              <button type="button" class="btn sec sm" id="btnResetCtg" aria-live="polite">${ICON_RESET} Resetuj quiz KTG</button>
            </div>
          </div>

          ${CTG_STATE.showRef ? `
            <div class="card" style="padding:1rem;font-size:.86rem">
              <h2 style="font-size:1.15rem;font-family:var(--font-body);font-weight:700;letter-spacing:0;margin:0 0 .6rem">Kryteria klasyfikacji KTG wg FIGO 2015</h2>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.75rem">
                <div style="padding:.7rem;border-radius:10px;background:var(--green-l);border:1px solid var(--green)">
                  <strong style="color:var(--green-d)">Prawidłowy (wszystkie 3):</strong>
                  <div>Linia bazowa 110–160 bpm, zmienność 5–25 bpm, brak powtarzających się deceleracji.</div>
                </div>
                <div style="padding:.7rem;border-radius:10px;background:var(--amber-l);border:1px solid var(--amber)">
                  <strong style="color:var(--amber-d)">Podejrzany:</strong>
                  <div>Brak co najmniej 1 cechy zapisu prawidłowego, ale bez cech patologicznych (np. tachykardia >160, zmienność graniczna lub izolowane deceleracje zmienne).</div>
                </div>
                <div style="padding:.7rem;border-radius:10px;background:var(--red-l);border:1px solid var(--red)">
                  <strong style="color:var(--red-d)">Patologiczny (>=1 cecha):</strong>
                  <div>Linia bazowa &lt;100 bpm; zmienność &lt;5 bpm (&gt;50 min) lub &gt;25 bpm (&gt;30 min); rytm sinusoidalny (&gt;30 min); powtarzające się deceleracje późne lub przedłużone (&gt;30 min / &gt;20 min przy obniżonej zmienności); pojedyncza deceleracja &gt;5 min.</div>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="imaging-case-carousel" role="tablist" aria-label="Przypadki KTG">
            ${cases.map(c => {
              const solved = CTG_STATE.solved.includes(c.id);
              return `
                <button type="button" class="imaging-case-chip js-ctg-case ${c.id === active.id ? 'active' : ''} ${solved ? 'solved' : ''}" data-id="${esc(c.id)}">
                  <div class="imaging-case-chip-head">
                    <span style="font-weight:800;color:var(--teal-d)">KTG</span>
                    <span style="font-weight:700;color:${solved ? 'var(--green)' : 'var(--muted)'}">${solved ? 'Zaliczono' : 'Do oceny'}</span>
                  </div>
                  <div class="imaging-case-chip-title">${esc(c.title)}</div>
                  <div class="imaging-case-chip-sub">${esc(c.subtitle)}</div>
                </button>
              `;
            }).join('')}
          </div>

          <div class="card" style="padding:1.1rem">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.6rem;margin-bottom:.75rem">
              <div>
                <div class="drug-formula">${esc(active.subtitle)}</div>
                <h2 style="font-size:1.15rem;font-family:var(--font-body);font-weight:700;letter-spacing:0;margin:.1rem 0 0">${esc(active.title)}</h2>
              </div>
              <button type="button" class="btn sec sm" id="btnCopyCtg">${ICON_NOTE} Zapisz do notatek</button>
            </div>
            <p style="font-size:.92rem;color:var(--ink-2);margin-bottom:.85rem">${esc(active.vignette)}</p>

            <div class="ctg-paper">${buildCtgSvg(active)}</div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem;margin-top:.85rem">
              <div style="padding:.5rem .7rem;border-radius:8px;background:var(--bg);border:1px solid var(--line-2);font-size:.82rem"><span style="color:var(--muted);display:block">Linia bazowa</span><strong>${esc(active.metrics.baseline)}</strong></div>
              <div style="padding:.5rem .7rem;border-radius:8px;background:var(--bg);border:1px solid var(--line-2);font-size:.82rem"><span style="color:var(--muted);display:block">Zmienność</span><strong>${esc(active.metrics.variability)}</strong></div>
              <div style="padding:.5rem .7rem;border-radius:8px;background:var(--bg);border:1px solid var(--line-2);font-size:.82rem"><span style="color:var(--muted);display:block">Akceleracje</span><strong>${esc(active.metrics.accelerations)}</strong></div>
              <div style="padding:.5rem .7rem;border-radius:8px;background:var(--bg);border:1px solid var(--line-2);font-size:.82rem"><span style="color:var(--muted);display:block">Deceleracje</span><strong>${esc(active.metrics.decelerations)}</strong></div>
              <div style="padding:.5rem .7rem;border-radius:8px;background:var(--bg);border:1px solid var(--line-2);font-size:.82rem"><span style="color:var(--muted);display:block">Skurcze (TOCO)</span><strong>${esc(active.metrics.toco)}</strong></div>
            </div>
          </div>

          <!-- Quiz FIGO 2015 -->
          <div class="imaging-step-card">
            <div style="font-weight:800;font-size:1rem;color:var(--ink)">Etap 1: Zaklasyfikuj zapis wg FIGO 2015</div>
            <div class="opts">
              ${figoLabels.map((lbl, idx) => {
                let cls = 'opt js-ctg-figo';
                if (figoAnswered) {
                  if (idx === active.figoKey) cls += ' ok';
                  else if (idx === ans.figo) cls += ' bad';
                  else cls += ' dim';
                }
                return `<button type="button" class="${cls}" data-val="${idx}" ${figoAnswered ? 'disabled' : ''}>
                  <span class="l">${idx + 1}</span>
                  <span>${esc(lbl)}</span>
                </button>`;
              }).join('')}
            </div>

            ${figoAnswered ? `
              <div style="margin-top:.5rem;padding-top:.85rem;border-top:1px solid var(--line-2)">
                <div style="font-weight:800;font-size:1rem;color:var(--ink);margin-bottom:.65rem">Etap 2: ${esc(active.actionQuestion)}</div>
                <div class="opts">
                  ${active.actionOpts.map((opt, idx) => {
                    let cls = 'opt js-ctg-action';
                    if (actionAnswered) {
                      if (idx === active.actionKey) cls += ' ok';
                      else if (idx === ans.action) cls += ' bad';
                      else cls += ' dim';
                    }
                    return `<button type="button" class="${cls}" data-val="${idx}" ${actionAnswered ? 'disabled' : ''}>
                      <span class="l">${String.fromCharCode(65 + idx)}</span>
                      <span>${esc(opt)}</span>
                    </button>`;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            ${actionAnswered ? `
              <div class="imaging-pearl-box">
                <strong>Komentarz FIGO 2015:</strong> ${esc(active.pearl)}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    function renderUsgTab() {
      const cases = getUsgCases();
      const active = cases.find(c => c.id === IMG_STATE.activeUsgId) || cases[0];
      IMG_STATE.activeUsgId = active.id;
      const prog = IMG_STATE.usgProgress[active.id] || { found: false, mcq: null };
      const found = !!prog.found;
      const mcqAnswered = typeof prog.mcq === 'number';
      const solvedCount = cases.filter(c => {
        const p = IMG_STATE.usgProgress[c.id];
        return p && p.found && typeof p.mcq === 'number';
      }).length;

      return `
        <div class="imaging-trainer-wrapper">
          <div class="imaging-filter-bar">
            <div style="font-size:.88rem;font-weight:700;color:var(--ink-2)">
              Rozwiązane przypadki USG: <strong style="color:var(--teal-d)">${solvedCount} / ${cases.length}</strong>
            </div>
            <div style="display:flex;gap:.5rem;flex-wrap:wrap">
              <button type="button" class="btn sec sm" id="btnUsgHint">${ICON_HINT} ${IMG_STATE.showHint ? 'Ukryj podpowiedź obszaru' : 'Podpowiedź obszaru'}</button>
              <button type="button" class="btn sec sm" id="btnResetUsg" aria-live="polite">${ICON_RESET} Resetuj USG</button>
            </div>
          </div>

          <div class="imaging-case-carousel" role="tablist" aria-label="Przypadki USG">
            ${cases.map(c => {
              const p = IMG_STATE.usgProgress[c.id];
              const done = p && p.found && typeof p.mcq === 'number';
              return `
                <button type="button" class="imaging-case-chip js-usg-case ${c.id === active.id ? 'active' : ''} ${done ? 'solved' : ''}" data-id="${esc(c.id)}">
                  <div class="imaging-case-chip-head">
                    <span style="font-weight:800;color:var(--teal-d)">USG ${esc(c.modality)}</span>
                    <span style="font-weight:700;color:${done ? 'var(--green)' : 'var(--muted)'}">${done ? 'Zaliczono' : 'Hotspot'}</span>
                  </div>
                  <div class="imaging-case-chip-title">${esc(c.title)}</div>
                  <div class="imaging-case-chip-sub">${esc(c.subtitle)}</div>
                </button>
              `;
            }).join('')}
          </div>

          <div class="imaging-viewer-grid">
            <div class="imaging-monitor-screen">
              <div class="imaging-monitor-header">
                <span>${esc(active.modality)} · ${esc(active.title)}</span>
                <span>${found ? 'PATOLOGIA ZAZNACZONA' : 'KLIKNIJ PATOLOGIĘ NA OBRAZIE'}</span>
              </div>
              ${buildUsgSvg(active, found, IMG_STATE.showHint, IMG_STATE.lastMiss)}
            </div>

            <div class="imaging-step-card">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem">
                <div>
                  <div class="drug-formula">${esc(active.subtitle)}</div>
                  <h2 style="font-size:1.15rem;font-family:var(--font-body);font-weight:700;letter-spacing:0;margin:.1rem 0 0">${esc(active.title)}</h2>
                </div>
                <button type="button" class="btn sec sm" id="btnCopyUsg">${ICON_NOTE} Zapisz do notatek</button>
              </div>
              <p style="font-size:.92rem;color:var(--ink-2)">${esc(active.vignette)}</p>

              ${!found ? `
                <div style="padding:.75rem .95rem;border-radius:10px;background:var(--bg);border:1.5px solid var(--line);font-size:.88rem">
                  <strong>Etap 1 (Hotspot):</strong> Kliknij bezpośrednio kluczową zmianę patologiczną na monitorze USG powyżej (możesz też nacisnąć Tab i Enter).
                  ${IMG_STATE.showHint ? `<div style="margin-top:.45rem;color:var(--amber-d)"><strong>Wskazówka:</strong> ${esc(active.hint)}</div>` : ''}
                  ${IMG_STATE.lastMiss ? `<div style="margin-top:.4rem;color:var(--red)">Pudło — spróbuj ponownie lub włącz podpowiedź obszaru.</div>` : ''}
                </div>
              ` : `
                <div style="padding:.75rem .95rem;border-radius:10px;background:var(--green-l);border:1.5px solid var(--green);font-size:.9rem;color:var(--ink)">
                  <strong>Trafienie!</strong> ${esc(active.hotspot.label)}
                </div>

                <div style="font-weight:800;font-size:1rem;color:var(--ink);margin-top:.3rem">Etap 2: ${esc(active.mcqQuestion)}</div>
                <div class="opts">
                  ${active.mcqOpts.map((opt, idx) => {
                    let cls = 'opt js-usg-mcq';
                    if (mcqAnswered) {
                      if (idx === active.mcqKey) cls += ' ok';
                      else if (idx === prog.mcq) cls += ' bad';
                      else cls += ' dim';
                    }
                    return `<button type="button" class="${cls}" data-val="${idx}" ${mcqAnswered ? 'disabled' : ''}>
                      <span class="l">${String.fromCharCode(65 + idx)}</span>
                      <span>${esc(opt)}</span>
                    </button>`;
                  }).join('')}
                </div>

                ${mcqAnswered ? `<div class="imaging-pearl-box"><strong>Perła kliniczna USG:</strong> ${esc(active.pearl)}</div>` : ''}
              `}
            </div>
          </div>
        </div>
      `;
    }

    function evaluateOgtt(vals) {
      if (typeof calcOgttPregnancy === 'function') return calcOgttPregnancy(vals);
      const f = Number(vals.fasting), h1 = Number(vals.h1), h2 = Number(vals.h2);
      const flags = [];
      let overt = false, gdm = false;
      if (f >= 126) { overt = true; flags.push(`Na czczo ${f} mg/dl (>=126)`); }
      else if (f >= 92) { gdm = true; flags.push(`Na czczo ${f} mg/dl (92–125)`); }
      if (h1 >= 180) { gdm = true; flags.push(`Po 1h ${h1} mg/dl (>=180)`); }
      if (h2 >= 200) { overt = true; flags.push(`Po 2h ${h2} mg/dl (>=200)`); }
      else if (h2 >= 153) { gdm = true; flags.push(`Po 2h ${h2} mg/dl (153–199)`); }
      return {
        gdm: gdm && !overt,
        overtDiabetes: overt,
        level: overt ? 'crit' : (gdm ? 'warn' : 'ok'),
        diagnosis: overt ? 'Cukrzyca w ciąży (jawna / DIP)' : (gdm ? 'Cukrzyca ciążowa (GDM)' : 'Prawidłowa tolerancja glukozy'),
        flags
      };
    }

    function interpretHormones(h) {
      const fsh = Number(h.fsh) || 0;
      const lh = Number(h.lh) || 0;
      const e2 = Number(h.e2) || 0;
      const prl = Number(h.prl) || 0;
      const tsh = Number(h.tsh) || 0;
      const amh = Number(h.amh) || 0;
      const ratio = fsh > 0 ? Math.round((lh / fsh) * 100) / 100 : 0;
      const notes = [];
      let headline = 'Profil hormonalny w granicach normy (wczesna faza folikularna)';
      let level = 'ok';

      if (fsh >= 25 && e2 < 40) {
        headline = 'Hipogonadyzm hipergonadotropowy (podejrzenie POI <40 r.ż. lub menopauzy)';
        level = 'crit';
        notes.push(`Wysokie FSH (${fsh} IU/l) i niskie E2 (${e2} pg/ml) wskazują na wygasanie czynności jajników (w POI potwierdź FSH >25 IU/l dwukrotnie w odstępie >=4 tyg.).`);
      } else if (fsh < 2 && lh < 2 && e2 < 30) {
        headline = 'Hipogonadyzm hipogonadotropowy (oś podwzgórze–przysadka)';
        level = 'warn';
        notes.push('Niskie gonadotropiny (FSH/LH) i niski estradiol — różnicuj czynnościowy brak miesiączki (FHA: stres, niedożywienie, wysiłek), zespół Kallmanna lub patologię przysadki.');
      } else if (ratio >= 2 && amh >= 4.0) {
        headline = 'Profil sugerujący PCOS (wysoki stosunek LH:FSH i wysokie AMH)';
        level = 'warn';
        notes.push(`Stosunek LH:FSH = ${ratio} (>=2) oraz podwyższone AMH (${amh} ng/ml) wspierają rozpoznanie PCOS (pamiętaj: kryteria rotterdamskie nie wymagają LH:FSH, wyklucz WPN i hiperprolaktynemię).`);
      }

      if (prl >= 100) {
        level = 'crit';
        notes.push(`Znaczna hiperprolaktynemia (PRL ${prl} ng/ml >=100) — pilna diagnostyka prolactinoma (MR przysadki), wyklucz makroprolaktynemię i leki dopaminolityczne.`);
      } else if (prl > 25) {
        if (level === 'ok') { headline = 'Łagodna / umiarkowana hiperprolaktynemia'; level = 'warn'; }
        notes.push(`PRL ${prl} ng/ml (>25) — wyklucz ciążę, niedoczynność tarczycy, leki (metoklopramid, risperidon, SSRI), stres pobrania oraz makroprolaktynę.`);
      }

      if (tsh > 4.0) {
        if (level === 'ok') { headline = 'Niedoczynność tarczycy'; level = 'warn'; }
        notes.push(`TSH ${tsh} mIU/l (>4,0) — oznacz fT4 i anty-TPO; u ciężarnych lub planujących ciążę cel TSH <2,5 mIU/l (lewotyroksyna).`);
      } else if (tsh > 2.5) {
        notes.push(`TSH ${tsh} mIU/l (2,5–4,0) — u kobiet nieciężarnych zwykle norma, ale w ciąży (zwłaszcza przy anty-TPO+) rozważ leczenie L-tyroksyną wg PTGiP/PTE.`);
      } else if (tsh > 0 && tsh < 0.4) {
        notes.push(`Obniżone TSH (${tsh} mIU/l) — oznacz fT4, fT3, TRAb (w I trymestrze różnicuj przejściową nadczynność zależną od beta-hCG z chorobą Gravesa-Basedowa).`);
      }

      if (amh > 0 && amh < 1.0) {
        notes.push(`Obniżona rezerwa jajnikowa (AMH ${amh} ng/ml <1,0).`);
      } else if (amh >= 4.0 && !(ratio >= 2)) {
        notes.push(`Wysokie AMH (${amh} ng/ml >=4,0) — liczne pęcherzyki antralne (częste w PCOS, wyższe ryzyko OHSS w stymulacji).`);
      }

      if (!notes.length) {
        notes.push(`Stosunek LH:FSH = ${ratio}; prawidłowa rezerwa jajnikowa (AMH ${amh} ng/ml), prawidłowe TSH i PRL.`);
      }
      return { ratio, headline, level, notes };
    }

    function interpretHellp(h) {
      const plt = Number(h.plt) || 0;
      const ast = Number(h.ast) || 0;
      const alt = Number(h.alt) || 0;
      const ldh = Number(h.ldh) || 0;
      const hem = !!h.hemolysis || ldh >= 600;
      const el = ast >= 70 || alt >= 70;
      const lp = plt < 100;
      const criteria = [hem, el, lp].filter(Boolean).length;

      let mississippi = 'Brak małopłytkowości (<150 G/l)';
      if (plt <= 50) mississippi = 'Klasa I wg Mississippi (PLT <=50 G/l — najcięższa)';
      else if (plt <= 100) mississippi = 'Klasa II wg Mississippi (PLT 51–100 G/l)';
      else if (plt <= 150) mississippi = 'Klasa III wg Mississippi (PLT 101–150 G/l)';

      let title = 'Brak kryteriów zespołu HELLP';
      let level = 'ok';
      let action = 'Monitoruj morfologię, próby wątrobowe, LDH i ciśnienie tętnicze.';
      if (criteria === 3) {
        title = 'Pełny zespół HELLP (kryteria Tennessee: H + EL + LP)';
        level = 'crit';
        action = 'Pilna stabilizacja matki (MgSO4, kontrola RR >=160/110) i ukończenie ciąży (natychmiast >=34 Hbd lub przy pogarszaniu stanu matki/płodu; przetoczenie KKP przy PLT <50 G/l przed CC lub krwawieniu).';
      } else if (criteria >= 1) {
        title = `Niepełny zespół HELLP (${criteria}/3 kryteria Tennessee)`;
        level = 'warn';
        action = 'Ścisły nadzór szpitalny (powtarzaj badania co 6–12 h), ocena kryteriów ciężkiego stanu przedrzucawkowego i gotowość do ukończenia ciąży.';
      }
      return { hem, el, lp, criteria, mississippi, title, level, action };
    }

    function interpretCordGas(g) {
      const ph = Number(g.ph);
      const be = Number(g.be);
      const pco2 = Number(g.pco2);
      const lac = Number(g.lactate);
      let title = 'Prawidłowa gazometria tętnicy pępowinowej';
      let level = 'ok';
      let detail = 'Brak wykładników istotnej kwasicy śródporodowej (pH >=7,20, BE > -8 mmol/l).';

      if (ph < 7.00 && be <= -12) {
        title = 'Ciężka kwasica metaboliczna — spełnione kryterium ACOG/FIGO ostrego niedotlenienia';
        level = 'crit';
        detail = `pH ${ph.toFixed(2)} (<7,00) i BE ${be.toFixed(1)} mmol/l (<=-12) wskazują na ciężką kwasicę metaboliczną z wysokim ryzykiem HIE — pilna ocena neonatologiczna (kwalifikacja do hipotermii leczniczej).`;
      } else if (ph < 7.10) {
        title = be <= -10 ? 'Istotna kwasica metaboliczna / mieszana' : 'Istotna kwasica (z przewagą komponenty oddechowej)';
        level = 'crit';
        detail = pco2 >= 60 && be > -10
          ? `Podwyższone pCO2 (${pco2} mmHg) przy umiarkowanym BE (${be} mmol/l) przemawia za komponentą oddechową (zwykle szybsza normalizacja po wentylacji noworodka).`
          : `Obniżone pH (${ph.toFixed(2)}) i głęboki niedobór zasad (BE ${be} mmol/l, mleczany ${lac} mmol/l) — ścisły nadzór neonatologiczny.`;
      } else if (ph < 7.20) {
        title = 'Łagodna / graniczna kwasica pępowinowa (7,10–7,19)';
        level = 'warn';
        detail = 'Wartości graniczne — oceniaj w powiązaniu ze stanem klinicznym noworodka (Apgar, oddech, napięcie).';
      }
      return { title, level, detail };
    }

    function renderOgttVerdictHtml(og) {
      const ogRes = evaluateOgtt(og);
      const ogColor = ogRes.level === 'ok' ? 'var(--green)' : (ogRes.level === 'warn' ? 'var(--amber)' : 'var(--red)');
      const ogBg = ogRes.level === 'ok' ? 'var(--green-l)' : (ogRes.level === 'warn' ? 'var(--amber-l)' : 'var(--red-l)');
      return `<div class="lab-verdict-banner" style="background:${ogBg};border:1.5px solid ${ogColor}">
        <div class="lab-verdict-title" style="color:${ogColor}">${esc(ogRes.diagnosis)}</div>
        ${ogRes.flags.length ? `<ul style="margin:.2rem 0 0 1.1rem;font-size:.9rem;color:var(--ink)">${ogRes.flags.map(fl => `<li>${esc(fl)}</li>`).join('')}</ul>` : '<div style="font-size:.9rem;color:var(--ink)">Wszystkie 3 punkty pomiarowe mieszczą się w normie PTGiP.</div>'}
        <div style="font-size:.82rem;color:var(--muted);margin-top:.2rem">Docelowe glikemie w samokontroli GDM (PTGiP): na czczo 70–90 mg/dl, 1 h po posiłku &lt;140 mg/dl.</div>
      </div>`;
    }

    function renderHormonesVerdictHtml(h) {
      const hRes = interpretHormones(h);
      const hColor = hRes.level === 'ok' ? 'var(--green)' : (hRes.level === 'warn' ? 'var(--amber)' : 'var(--red)');
      const hBg = hRes.level === 'ok' ? 'var(--green-l)' : (hRes.level === 'warn' ? 'var(--amber-l)' : 'var(--red-l)');
      return `<div class="lab-verdict-banner" style="background:${hBg};border:1.5px solid ${hColor}">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem">
          <div class="lab-verdict-title" style="color:${hColor}">${esc(hRes.headline)}</div>
          <span class="badge" style="background:var(--surface);border:1px solid var(--line);color:var(--ink)">LH : FSH = ${esc(hRes.ratio)}</span>
        </div>
        <ul style="margin:.25rem 0 0 1.1rem;font-size:.9rem;color:var(--ink)">
          ${hRes.notes.map(n => `<li>${esc(n)}</li>`).join('')}
        </ul>
      </div>`;
    }

    function renderHellpVerdictHtml(hl) {
      const hlRes = interpretHellp(hl);
      const hlColor = hlRes.level === 'ok' ? 'var(--green)' : (hlRes.level === 'warn' ? 'var(--amber)' : 'var(--red)');
      const hlBg = hlRes.level === 'ok' ? 'var(--green-l)' : (hlRes.level === 'warn' ? 'var(--amber-l)' : 'var(--red-l)');
      return `<div class="lab-verdict-banner" style="background:${hlBg};border:1.5px solid ${hlColor}">
        <div class="lab-verdict-title" style="color:${hlColor}">${esc(hlRes.title)}</div>
        <div style="font-size:.88rem;color:var(--ink)"><strong>${esc(hlRes.mississippi)}</strong> · Kryteria: Hemoliza (${hlRes.hem ? 'TAK' : 'NIE'}), Enzymy wątrobowe (${hlRes.el ? 'TAK' : 'NIE'}), Małopłytkowość &lt;100 (${hlRes.lp ? 'TAK' : 'NIE'}).</div>
        <div style="font-size:.9rem;color:var(--ink)">${esc(hlRes.action)}</div>
      </div>`;
    }

    function renderCordVerdictHtml(cg) {
      const cgRes = interpretCordGas(cg);
      const cgColor = cgRes.level === 'ok' ? 'var(--green)' : (cgRes.level === 'warn' ? 'var(--amber)' : 'var(--red)');
      const cgBg = cgRes.level === 'ok' ? 'var(--green-l)' : (cgRes.level === 'warn' ? 'var(--amber-l)' : 'var(--red-l)');
      return `<div class="lab-verdict-banner" style="background:${cgBg};border:1.5px solid ${cgColor}">
        <div class="lab-verdict-title" style="color:${cgColor}">${esc(cgRes.title)}</div>
        <div style="font-size:.9rem;color:var(--ink)">${esc(cgRes.detail)}</div>
      </div>`;
    }

    function renderLabTab() {
      const og = LAB_STATE.ogtt;
      const h = LAB_STATE.hormones;
      const hl = LAB_STATE.hellp;
      const cg = LAB_STATE.cord;

      return `
        <div class="imaging-filter-pills" style="margin-bottom:1.1rem" role="tablist" aria-label="Wybór kalkulatora laboratoryjnego">
          <button type="button" class="imaging-filter-btn js-lab-sub ${LAB_SUBTAB === 'ogtt' ? 'active' : ''}" data-sub="ogtt">OGTT 75g w ciąży (PTGiP)</button>
          <button type="button" class="imaging-filter-btn js-lab-sub ${LAB_SUBTAB === 'hormony' ? 'active' : ''}" data-sub="hormony">Panel hormonalny (FSH/LH/E2/PRL/TSH/AMH)</button>
          <button type="button" class="imaging-filter-btn js-lab-sub ${LAB_SUBTAB === 'hellp' ? 'active' : ''}" data-sub="hellp">HELLP i Gazometria pępowinowa</button>
        </div>

        ${LAB_SUBTAB === 'ogtt' ? `
          <div class="lab-calc-box">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.6rem;margin-bottom:.8rem">
              <div>
                <h2 style="font-size:1.15rem;font-family:var(--font-body);font-weight:700;letter-spacing:0;margin:0">Test obciążenia glukozą OGTT 75g w ciąży (PTGiP / IADPSG)</h2>
                <p style="font-size:.86rem;color:var(--muted);margin-top:.2rem">Progi GDM: na czczo 92–125 · po 1h &gt;=180 · po 2h 153–199 mg/dl (wystarczy &gt;=1 nieprawidłowa wartość). Cukrzyca jawna: na czczo &gt;=126 lub po 2h &gt;=200 mg/dl.</p>
              </div>
              <button type="button" class="btn sec sm" id="btnCopyOgtt">${ICON_NOTE} Zapisz do notatek</button>
            </div>

            <div class="calc-quick-pills" style="margin-bottom:1rem">
              <span style="font-size:.78rem;color:var(--muted);align-self:center">Presety:</span>
              <button type="button" class="calc-pill js-ogtt-preset" data-f="84" data-h1="138" data-h2="118">Norma</button>
              <button type="button" class="calc-pill js-ogtt-preset" data-f="95" data-h1="146" data-h2="122">GDM (na czczo)</button>
              <button type="button" class="calc-pill js-ogtt-preset" data-f="88" data-h1="186" data-h2="162">GDM (po 1h i 2h)</button>
              <button type="button" class="calc-pill js-ogtt-preset" data-f="132" data-h1="214" data-h2="206">Cukrzyca jawna (DIP)</button>
            </div>

            <div class="lab-inputs-grid">
              <div class="lab-input-group">
                <label for="ogttF">Glikemia na czczo (mg/dl)</label>
                <input id="ogttF" type="number" step="1" min="40" max="400" value="${esc(og.fasting)}">
              </div>
              <div class="lab-input-group">
                <label for="ogttH1">Glikemia po 1 h (mg/dl)</label>
                <input id="ogttH1" type="number" step="1" min="40" max="500" value="${esc(og.h1)}">
              </div>
              <div class="lab-input-group">
                <label for="ogttH2">Glikemia po 2 h (mg/dl)</label>
                <input id="ogttH2" type="number" step="1" min="40" max="500" value="${esc(og.h2)}">
              </div>
            </div>

            <div id="ogttVerdict" aria-live="polite">${renderOgttVerdictHtml(og)}</div>
          </div>
        ` : ''}

        ${LAB_SUBTAB === 'hormony' ? `
          <div class="lab-calc-box">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.6rem;margin-bottom:.8rem">
              <div>
                <h2 style="font-size:1.15rem;font-family:var(--font-body);font-weight:700;letter-spacing:0;margin:0">Interpreter panelu hormonalnego (wczesna faza folikularna, 2.–5. dc)</h2>
                <p style="font-size:.86rem;color:var(--muted);margin-top:.2rem">Ocena osi podwzgórze–przysadka–jajnik, stosunku LH:FSH, rezerwy jajnikowej AMH oraz progów PRL i TSH.</p>
              </div>
              <button type="button" class="btn sec sm" id="btnCopyHormones">${ICON_NOTE} Zapisz do notatek</button>
            </div>

            <div class="calc-quick-pills" style="margin-bottom:1rem">
              <span style="font-size:.78rem;color:var(--muted);align-self:center">Profile:</span>
              <button type="button" class="calc-pill js-horm-preset" data-v="6.2,5.8,48,14,1.6,2.8">Norma folikularna</button>
              <button type="button" class="calc-pill js-horm-preset" data-v="5.4,13.8,52,18,1.9,6.4">PCOS</button>
              <button type="button" class="calc-pill js-horm-preset" data-v="48,34,16,12,2.1,0.12">POI / Menopauza</button>
              <button type="button" class="calc-pill js-horm-preset" data-v="3.8,2.9,24,142,2.0,2.2">Hiperprolaktynemia</button>
              <button type="button" class="calc-pill js-horm-preset" data-v="1.2,0.9,18,11,1.7,2.4">FHA (hipogonadotrop.)</button>
            </div>

            <div class="lab-inputs-grid">
              <div class="lab-input-group"><label for="hFsh">FSH (IU/l)</label><input id="hFsh" type="number" step="0.1" min="0" value="${esc(h.fsh)}"></div>
              <div class="lab-input-group"><label for="hLh">LH (IU/l)</label><input id="hLh" type="number" step="0.1" min="0" value="${esc(h.lh)}"></div>
              <div class="lab-input-group"><label for="hE2">Estradiol E2 (pg/ml)</label><input id="hE2" type="number" step="1" min="0" value="${esc(h.e2)}"></div>
              <div class="lab-input-group"><label for="hPrl">Prolaktyna PRL (ng/ml)</label><input id="hPrl" type="number" step="0.5" min="0" value="${esc(h.prl)}"></div>
              <div class="lab-input-group"><label for="hTsh">TSH (mIU/l)</label><input id="hTsh" type="number" step="0.1" min="0" value="${esc(h.tsh)}"></div>
              <div class="lab-input-group"><label for="hAmh">AMH (ng/ml)</label><input id="hAmh" type="number" step="0.1" min="0" value="${esc(h.amh)}"></div>
            </div>

            <div id="hormonesVerdict" aria-live="polite">${renderHormonesVerdictHtml(h)}</div>
          </div>
        ` : ''}

        ${LAB_SUBTAB === 'hellp' ? `
          <div class="lab-calc-box">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.6rem;margin-bottom:.8rem">
              <div>
                <h2 style="font-size:1.15rem;font-family:var(--font-body);font-weight:700;letter-spacing:0;margin:0">Zespół HELLP (kryteria Tennessee i klasyfikacja Mississippi)</h2>
                <p style="font-size:.86rem;color:var(--muted);margin-top:.2rem">Hemoliza (LDH &gt;=600 U/l lub schistocyty/spadek haptoglobiny) + AST/ALT &gt;=70 U/l + PLT &lt;100 G/l.</p>
              </div>
              <button type="button" class="btn sec sm" id="btnCopyHellp">${ICON_NOTE} Zapisz do notatek</button>
            </div>
            <div class="calc-quick-pills" style="margin-bottom:1rem">
              <button type="button" class="calc-pill js-hellp-preset" data-v="195,24,22,240,0">Norma</button>
              <button type="button" class="calc-pill js-hellp-preset" data-v="118,92,84,420,0">Niepełny HELLP</button>
              <button type="button" class="calc-pill js-hellp-preset" data-v="86,112,98,740,1">Pełny HELLP (Klasa II)</button>
              <button type="button" class="calc-pill js-hellp-preset" data-v="38,240,210,1150,1">Ciężki HELLP (Klasa I)</button>
            </div>
            <div class="lab-inputs-grid">
              <div class="lab-input-group"><label for="hlPlt">Płytki PLT (G/l)</label><input id="hlPlt" type="number" step="1" min="5" value="${esc(hl.plt)}"></div>
              <div class="lab-input-group"><label for="hlAst">AST (U/l)</label><input id="hlAst" type="number" step="1" min="0" value="${esc(hl.ast)}"></div>
              <div class="lab-input-group"><label for="hlAlt">ALT (U/l)</label><input id="hlAlt" type="number" step="1" min="0" value="${esc(hl.alt)}"></div>
              <div class="lab-input-group"><label for="hlLdh">LDH (U/l)</label><input id="hlLdh" type="number" step="10" min="0" value="${esc(hl.ldh)}"></div>
            </div>
            <label style="display:inline-flex;align-items:center;gap:.5rem;min-height:44px;font-size:.88rem;font-weight:700;cursor:pointer;margin-bottom:.4rem">
              <input id="hlHem" type="checkbox" ${hl.hemolysis ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--teal)">
              <span>Cechy hemolizy w rozmazie / niska haptoglobina / bilirubina &gt;=1,2 mg/dl</span>
            </label>
            <div id="hellpVerdict" aria-live="polite">${renderHellpVerdictHtml(hl)}</div>
          </div>

          <div class="lab-calc-box">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.6rem;margin-bottom:.8rem">
              <div>
                <h2 style="font-size:1.15rem;font-family:var(--font-body);font-weight:700;letter-spacing:0;margin:0">Gazometria krwi pępowinowej (tętnica pępowinowa)</h2>
                <p style="font-size:.86rem;color:var(--muted);margin-top:.2rem">Obiektywna ocena równowagi kwasowo-zasadowej noworodka po porodzie (ACOG / FIGO: pH &lt;7,00 i BE &lt;=-12 mmol/l).</p>
              </div>
              <button type="button" class="btn sec sm" id="btnCopyCord">${ICON_NOTE} Zapisz do notatek</button>
            </div>
            <div class="calc-quick-pills" style="margin-bottom:1rem">
              <button type="button" class="calc-pill js-cord-preset" data-v="7.28,-3.5,48,2.4">Norma</button>
              <button type="button" class="calc-pill js-cord-preset" data-v="7.08,-6.2,72,4.1">Kwasica oddechowa</button>
              <button type="button" class="calc-pill js-cord-preset" data-v="6.94,-15.8,64,10.5">Ciężka kwasica metab. (ACOG)</button>
            </div>
            <div class="lab-inputs-grid">
              <div class="lab-input-group"><label for="cgPh">pH tętnicy pępowinowej</label><input id="cgPh" type="number" step="0.01" min="6.5" max="7.6" value="${esc(cg.ph)}"></div>
              <div class="lab-input-group"><label for="cgBe">BE — niedobór zasad (mmol/l)</label><input id="cgBe" type="number" step="0.5" min="-30" max="10" value="${esc(cg.be)}"></div>
              <div class="lab-input-group"><label for="cgPco2">pCO2 (mmHg)</label><input id="cgPco2" type="number" step="1" min="15" max="120" value="${esc(cg.pco2)}"></div>
              <div class="lab-input-group"><label for="cgLac">Mleczany (mmol/l)</label><input id="cgLac" type="number" step="0.1" min="0" max="25" value="${esc(cg.lactate)}"></div>
            </div>
            <div id="cordVerdict" aria-live="polite">${renderCordVerdictHtml(cg)}</div>
          </div>
        ` : ''}
      `;
    }

    function renderCytologiaTab() {
      const db = getBethesdaDb();
      const puzzles = getBethesdaPuzzles();
      const mode = IMG_STATE.bethesdaMode || 'catalog';
      const active = db.find(x => x.id === IMG_STATE.bethesdaId) || db[0];
      IMG_STATE.bethesdaId = active.id;

      const pIdx = Math.max(0, Math.min(puzzles.length - 1, Number(IMG_STATE.puzzleIdx) || 0));
      const puz = puzzles[pIdx];
      const pAns = IMG_STATE.puzzleAnswers[puz.id] || {};
      const s1Done = typeof pAns.s1 === 'number';
      const s2Done = typeof pAns.s2 === 'number';

      return `
        <div class="rash-module-wrap">
          <div class="rash-mode-bar">
            <div class="imaging-filter-pills" role="tablist" aria-label="Tryb atlasu cytologii">
              <button type="button" class="imaging-filter-btn js-beth-mode ${mode === 'catalog' ? 'active' : ''}" data-mode="catalog">Katalog Bethesda 2014 (${db.length})</button>
              <button type="button" class="imaging-filter-btn js-beth-mode ${mode === 'puzzles' ? 'active' : ''}" data-mode="puzzles">Zagadki 2-etapowe (${IMG_STATE.puzzlesDone.length}/${puzzles.length})</button>
            </div>
          </div>

          ${mode === 'catalog' ? `
            <div class="rash-pills-row" role="tablist" aria-label="Kategorie Bethesda">
              ${db.map(item => `
                <button type="button" class="rash-pill-btn js-beth-item ${item.id === active.id ? 'active' : ''} ${item.urgency === 'high' ? 'alert-pill' : ''}" data-id="${esc(item.id)}">
                  <span>${esc(item.code)}</span>
                </button>
              `).join('')}
            </div>

            <div class="rash-card-grid">
              <div class="rash-visual-card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem;gap:.5rem">
                  <strong style="font-size:.95rem;color:var(--ink)">Obraz cytomorfologiczny: ${esc(active.code)}</strong>
                  <span class="badge" style="background:${active.urgency === 'high' ? 'var(--red-l)' : (active.urgency === 'mid' ? 'var(--amber-l)' : 'var(--green-l)')};color:${active.urgency === 'high' ? 'var(--red-d)' : (active.urgency === 'mid' ? 'var(--amber-d)' : 'var(--green-d)')}">
                    ${active.urgency === 'high' ? 'Pilna kolposkopia' : (active.urgency === 'mid' ? 'Triage / nadzór' : 'Rutynowy skrining')}
                  </span>
                </div>
                <div class="rash-silhouette-container">
                  ${buildBethesdaSvg(active.id)}
                </div>
                <div class="rash-pearl-box" style="margin-top:.8rem">
                  <strong>Pułapka egzaminacyjna:</strong> ${esc(active.pearl)}
                </div>
              </div>

              <div class="rash-details-card">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem">
                  <h2 style="font-size:1.15rem;font-family:var(--font-body);font-weight:700;letter-spacing:0;margin:0">${esc(active.name)}</h2>
                  <button type="button" class="btn sec sm" id="btnCopyBethesda">${ICON_NOTE} Do notatek</button>
                </div>
                <div class="rash-info-sections">
                  <div class="rash-info-row">
                    <span class="rash-info-label">Ryzyko zmian dużego stopnia (CIN2/3+)</span>
                    <div>${esc(active.risk)}</div>
                  </div>
                  <div class="rash-info-row">
                    <span class="rash-info-label">Cechy cytologiczne (Bethesda 2014)</span>
                    <div>${esc(active.morphology)}</div>
                  </div>
                  <div class="rash-info-row">
                    <span class="rash-info-label">Postępowanie wg PTGiP / ASCCP</span>
                    <div style="font-weight:600">${esc(active.management)}</div>
                  </div>
                </div>
              </div>
            </div>
          ` : `
            <div class="imaging-filter-bar" style="margin-bottom:.7rem">
              <div style="display:flex;gap:.4rem;flex-wrap:wrap">
                ${puzzles.map((pz, idx) => `
                  <button type="button" class="calc-pill js-bp-idx ${idx === pIdx ? 'active' : ''}" data-idx="${idx}">
                    Zagadka ${idx + 1}${IMG_STATE.puzzlesDone.includes(pz.id) ? ' (OK)' : ''}
                  </button>
                `).join('')}
              </div>
              <button type="button" class="btn sec sm" id="btnResetBethesdaPuzzles" aria-live="polite">${ICON_RESET} Resetuj zagadki</button>
            </div>

            <div class="rash-card-grid">
              <div class="rash-visual-card">
                <div class="drug-formula" style="margin-bottom:.4rem">Schemat cytologiczny do oceny</div>
                <div class="rash-silhouette-container">${buildBethesdaSvg(puz.visualId)}</div>
                <div style="margin-top:.8rem;font-size:.9rem;line-height:1.5;color:var(--ink)"><strong>Opis przypadku:</strong> ${esc(puz.vignette)}</div>
              </div>

              <div class="rash-details-card">
                <div style="font-weight:800;font-size:.98rem;color:var(--ink)">${esc(puz.step1Prompt)}</div>
                <div class="opts">
                  ${puz.step1Opts.map((opt, oIdx) => {
                    let cls = 'opt js-bp-s1';
                    if (s1Done) {
                      if (oIdx === puz.step1Key) cls += ' ok';
                      else if (oIdx === pAns.s1) cls += ' bad';
                      else cls += ' dim';
                    }
                    return `<button type="button" class="${cls}" data-opt="${oIdx}" ${s1Done ? 'disabled' : ''}>
                      <span class="l">${String.fromCharCode(65 + oIdx)}</span>
                      <span>${esc(opt)}</span>
                    </button>`;
                  }).join('')}
                </div>
                ${s1Done ? `<div style="font-size:.86rem;color:var(--ink-2);padding:.55rem .75rem;border-radius:8px;background:var(--bg);border:1px solid var(--line-2)">${esc(puz.step1Why)}</div>` : ''}

                ${s1Done ? `
                  <div style="font-weight:800;font-size:.98rem;color:var(--ink);margin-top:.4rem">${esc(puz.step2Prompt)}</div>
                  <div class="opts">
                    ${puz.step2Opts.map((opt, oIdx) => {
                      let cls = 'opt js-bp-s2';
                      if (s2Done) {
                        if (oIdx === puz.step2Key) cls += ' ok';
                        else if (oIdx === pAns.s2) cls += ' bad';
                        else cls += ' dim';
                      }
                      return `<button type="button" class="${cls}" data-opt="${oIdx}" ${s2Done ? 'disabled' : ''}>
                        <span class="l">${String.fromCharCode(65 + oIdx)}</span>
                        <span>${esc(opt)}</span>
                      </button>`;
                    }).join('')}
                  </div>
                ` : ''}

                ${s2Done ? `
                  <div class="imaging-pearl-box"><strong>Podsumowanie:</strong> ${esc(puz.step2Why)}</div>
                  ${pIdx < puzzles.length - 1 ? `<button type="button" class="btn pri sm" id="btnBpNext" style="align-self:flex-end">Następna zagadka ${ICON_NEXT}</button>` : ''}
                ` : ''}
              </div>
            </div>
          `}
        </div>
      `;
    }

    function viewDiagnostics(parts, params) {
      if (params && params.tab && ['ktg', 'usg', 'lab', 'cytologia'].includes(params.tab)) {
        DIAG_TAB = params.tab;
      }
      if (params && params.case) {
        const ctgList = getCtgCases();
        const usgList = getUsgCases();
        if (ctgList.some(c => c.id === params.case)) {
          CTG_STATE.activeId = params.case;
          DIAG_TAB = 'ktg';
        } else if (usgList.some(c => c.id === params.case)) {
          IMG_STATE.activeUsgId = params.case;
          DIAG_TAB = 'usg';
        }
      }
      if (params && params.bethesda) {
        IMG_STATE.bethesdaId = params.bethesda;
        IMG_STATE.bethesdaMode = 'catalog';
        DIAG_TAB = 'cytologia';
      }

      const render = () => {
        const prevFocus = captureFocusState();
        clearArmedResetTimer();

        let bodyHtml = '';
        if (DIAG_TAB === 'ktg') bodyHtml = renderKtgTab();
        else if (DIAG_TAB === 'usg') bodyHtml = renderUsgTab();
        else if (DIAG_TAB === 'lab') bodyHtml = renderLabTab();
        else bodyHtml = renderCytologiaTab();

        main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:980px">
          <div class="eyebrow">Diagnostyka położnicza i ginekologiczna</div>
          <h1 style="font-size:clamp(1.7rem,3.4vw,2.4rem);margin:0 0 .5rem">KTG (FIGO 2015), USG, Laboratorium OB/GYN i Cytologia</h1>
          <p class="lead">Interaktywny trenażer zapisów KTG na papierze milimetrowym, monitor USG z hotspotami patologii, kalkulatory OGTT / hormonów / HELLP / gazometrii pępowinowej oraz atlas cytologii Bethesda 2014.</p>

          <div class="calc-tab-nav" id="diagTabNav" role="tablist" aria-label="Zakładki diagnostyki OB/GYN">
            <button type="button" role="tab" aria-selected="${DIAG_TAB === 'ktg'}" class="calc-tab-btn ${DIAG_TAB === 'ktg' ? 'active' : ''}" data-dtab="ktg">${ICON_CTG} Trenażer KTG (FIGO 2015)</button>
            <button type="button" role="tab" aria-selected="${DIAG_TAB === 'usg'}" class="calc-tab-btn ${DIAG_TAB === 'usg' ? 'active' : ''}" data-dtab="usg">${ICON_USG} Trenażer USG (Hotspots)</button>
            <button type="button" role="tab" aria-selected="${DIAG_TAB === 'lab'}" class="calc-tab-btn ${DIAG_TAB === 'lab' ? 'active' : ''}" data-dtab="lab">${ICON_LAB} Kalkulatory Lab OB/GYN</button>
            <button type="button" role="tab" aria-selected="${DIAG_TAB === 'cytologia'}" class="calc-tab-btn ${DIAG_TAB === 'cytologia' ? 'active' : ''}" data-dtab="cytologia">${ICON_CYTO} Atlas Cytologii (Bethesda)</button>
          </div>

          <div id="diagTabBody">${bodyHtml}</div>
        </div></section>`;

        bindEvents(render);
        restoreFocusState(prevFocus);
      };

      render();
    }

    function bindEvents(render) {
      // Nawigacja zakładek głównych
      $$('#diagTabNav .calc-tab-btn').forEach(btn => {
        btn.onclick = () => {
          DIAG_TAB = btn.dataset.dtab;
          render();
        };
      });

      // --- KTG ---
      const refBtn = $('#btnToggleFigoRef');
      if (refBtn) {
        refBtn.onclick = () => {
          CTG_STATE.showRef = !CTG_STATE.showRef;
          saveCtgState();
          render();
        };
      }
      bindTwoStepReset($('#btnResetCtg'), () => {
        CTG_STATE.answers = {};
        CTG_STATE.solved = [];
        saveCtgState();
        if (typeof toast === 'function') toast('Zresetowano postęp trenażera KTG.');
        render();
      });
      $$('.js-ctg-case').forEach(btn => {
        btn.onclick = () => {
          CTG_STATE.activeId = btn.dataset.id;
          saveCtgState();
          render();
        };
      });
      $$('.js-ctg-figo').forEach(btn => {
        btn.onclick = () => {
          const id = CTG_STATE.activeId;
          CTG_STATE.answers[id] = Object.assign({}, CTG_STATE.answers[id], { figo: Number(btn.dataset.val) });
          saveCtgState();
          render();
        };
      });
      $$('.js-ctg-action').forEach(btn => {
        btn.onclick = () => {
          const id = CTG_STATE.activeId;
          CTG_STATE.answers[id] = Object.assign({}, CTG_STATE.answers[id], { action: Number(btn.dataset.val) });
          if (!CTG_STATE.solved.includes(id)) CTG_STATE.solved.push(id);
          saveCtgState();
          render();
        };
      });
      const copyCtgBtn = $('#btnCopyCtg');
      if (copyCtgBtn) {
        copyCtgBtn.onclick = () => {
          const c = getCtgCases().find(x => x.id === CTG_STATE.activeId);
          if (!c) return;
          const figoNames = ['Prawidłowy', 'Podejrzany', 'Patologiczny'];
          const md = `# KTG (FIGO 2015): ${c.title}\n- **Klasyfikacja FIGO:** ${figoNames[c.figoKey]}\n- **Parametry:** linia bazowa ${c.metrics.baseline}, zmienność ${c.metrics.variability}, akceleracje ${c.metrics.accelerations}, deceleracje ${c.metrics.decelerations}\n- **Postępowanie:** ${c.actionOpts[c.actionKey]}\n- **Komentarz:** ${c.pearl}`;
          saveNoteEntry(`KTG FIGO: ${c.title}`, md, '5');
        };
      }

      // --- USG ---
      const hintBtn = $('#btnUsgHint');
      if (hintBtn) {
        hintBtn.onclick = () => {
          IMG_STATE.showHint = !IMG_STATE.showHint;
          render();
        };
      }
      bindTwoStepReset($('#btnResetUsg'), () => {
        IMG_STATE.usgProgress = {};
        IMG_STATE.lastMiss = null;
        IMG_STATE.showHint = false;
        saveImgState();
        if (typeof toast === 'function') toast('Zresetowano postęp trenażera USG.');
        render();
      });
      $$('.js-usg-case').forEach(btn => {
        btn.onclick = () => {
          IMG_STATE.activeUsgId = btn.dataset.id;
          IMG_STATE.lastMiss = null;
          IMG_STATE.showHint = false;
          saveImgState();
          render();
        };
      });
      const markUsgFound = () => {
        const id = IMG_STATE.activeUsgId;
        const prev = IMG_STATE.usgProgress[id] || { found: false, mcq: null };
        IMG_STATE.usgProgress[id] = { found: true, mcq: prev.mcq };
        IMG_STATE.lastMiss = null;
        saveImgState();
        render();
      };
      const usgTarget = $('#usgHotspotTarget');
      if (usgTarget) {
        usgTarget.onclick = e => {
          e.stopPropagation();
          markUsgFound();
        };
        usgTarget.onkeydown = e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            markUsgFound();
          }
        };
      }
      const usgSvg = $('#usgInteractiveSvg');
      if (usgSvg) {
        usgSvg.onclick = e => {
          const p = IMG_STATE.usgProgress[IMG_STATE.activeUsgId];
          if (p && p.found) return;
          const rect = usgSvg.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const x = Math.round(((e.clientX - rect.left) / rect.width) * 530);
          const y = Math.round(((e.clientY - rect.top) / rect.height) * 315);
          IMG_STATE.lastMiss = { x, y };
          render();
        };
      }
      $$('.js-usg-mcq').forEach(btn => {
        btn.onclick = () => {
          const id = IMG_STATE.activeUsgId;
          IMG_STATE.usgProgress[id] = { found: true, mcq: Number(btn.dataset.val) };
          saveImgState();
          render();
        };
      });
      const copyUsgBtn = $('#btnCopyUsg');
      if (copyUsgBtn) {
        copyUsgBtn.onclick = () => {
          const c = getUsgCases().find(x => x.id === IMG_STATE.activeUsgId);
          if (!c) return;
          const md = `# USG (${c.modality}): ${c.title}\n- **Obraz:** ${c.hotspot.label}\n- **Opis:** ${c.vignette}\n- **Postępowanie:** ${c.mcqOpts[c.mcqKey]}\n- **Perła:** ${c.pearl}`;
          saveNoteEntry(`USG: ${c.title}`, md, c.mod || '4');
        };
      }

      // --- LAB ---
      $$('.js-lab-sub').forEach(btn => {
        btn.onclick = () => {
          LAB_SUBTAB = btn.dataset.sub;
          render();
        };
      });
      // OGTT (aktualizacja werdyktu w miejscu bez utraty fokusu)
      const bindNum = (sel, obj, key, updateVerdict) => {
        const el = $(sel);
        if (!el) return;
        const onVal = () => {
          if (el.value === '' || el.value === '-') return;
          const num = Number(el.value);
          if (Number.isNaN(num)) return;
          obj[key] = num;
          if (typeof updateVerdict === 'function') updateVerdict();
        };
        el.oninput = onVal;
        el.onchange = onVal;
      };
      const updateOgttVerdict = () => {
        const box = $('#ogttVerdict');
        if (box) box.innerHTML = renderOgttVerdictHtml(LAB_STATE.ogtt);
      };
      bindNum('#ogttF', LAB_STATE.ogtt, 'fasting', updateOgttVerdict);
      bindNum('#ogttH1', LAB_STATE.ogtt, 'h1', updateOgttVerdict);
      bindNum('#ogttH2', LAB_STATE.ogtt, 'h2', updateOgttVerdict);
      $$('.js-ogtt-preset').forEach(btn => {
        btn.onclick = () => {
          LAB_STATE.ogtt = { fasting: Number(btn.dataset.f), h1: Number(btn.dataset.h1), h2: Number(btn.dataset.h2) };
          render();
        };
      });
      const copyOgttBtn = $('#btnCopyOgtt');
      if (copyOgttBtn) {
        copyOgttBtn.onclick = () => {
          const r = evaluateOgtt(LAB_STATE.ogtt);
          const md = `# OGTT 75g w ciąży\n- Wyniki: na czczo ${LAB_STATE.ogtt.fasting} · 1h ${LAB_STATE.ogtt.h1} · 2h ${LAB_STATE.ogtt.h2} mg/dl\n- **Rozpoznanie:** ${r.diagnosis}\n${r.flags.map(f => `- ${f}`).join('\n')}`;
          saveNoteEntry(`OGTT 75g: ${r.diagnosis}`, md, '6');
        };
      }
      // Hormony
      const updateHormonesVerdict = () => {
        const box = $('#hormonesVerdict');
        if (box) box.innerHTML = renderHormonesVerdictHtml(LAB_STATE.hormones);
      };
      bindNum('#hFsh', LAB_STATE.hormones, 'fsh', updateHormonesVerdict);
      bindNum('#hLh', LAB_STATE.hormones, 'lh', updateHormonesVerdict);
      bindNum('#hE2', LAB_STATE.hormones, 'e2', updateHormonesVerdict);
      bindNum('#hPrl', LAB_STATE.hormones, 'prl', updateHormonesVerdict);
      bindNum('#hTsh', LAB_STATE.hormones, 'tsh', updateHormonesVerdict);
      bindNum('#hAmh', LAB_STATE.hormones, 'amh', updateHormonesVerdict);
      $$('.js-horm-preset').forEach(btn => {
        btn.onclick = () => {
          const [fsh, lh, e2, prl, tsh, amh] = btn.dataset.v.split(',').map(Number);
          LAB_STATE.hormones = { fsh, lh, e2, prl, tsh, amh };
          render();
        };
      });
      const copyHormBtn = $('#btnCopyHormones');
      if (copyHormBtn) {
        copyHormBtn.onclick = () => {
          const r = interpretHormones(LAB_STATE.hormones);
          const h = LAB_STATE.hormones;
          const md = `# Panel hormonalny GYN\n- FSH ${h.fsh} · LH ${h.lh} (LH:FSH ${r.ratio}) · E2 ${h.e2} · PRL ${h.prl} · TSH ${h.tsh} · AMH ${h.amh}\n- **Wniosek:** ${r.headline}\n${r.notes.map(n => `- ${n}`).join('\n')}`;
          saveNoteEntry(`Panel hormonalny: ${r.headline}`, md, '8');
        };
      }
      // HELLP & Cord Gas
      const updateHellpVerdict = () => {
        const box = $('#hellpVerdict');
        if (box) box.innerHTML = renderHellpVerdictHtml(LAB_STATE.hellp);
      };
      bindNum('#hlPlt', LAB_STATE.hellp, 'plt', updateHellpVerdict);
      bindNum('#hlAst', LAB_STATE.hellp, 'ast', updateHellpVerdict);
      bindNum('#hlAlt', LAB_STATE.hellp, 'alt', updateHellpVerdict);
      bindNum('#hlLdh', LAB_STATE.hellp, 'ldh', updateHellpVerdict);
      const hlHem = $('#hlHem');
      if (hlHem) {
        hlHem.onchange = () => {
          LAB_STATE.hellp.hemolysis = !!hlHem.checked;
          updateHellpVerdict();
        };
      }
      $$('.js-hellp-preset').forEach(btn => {
        btn.onclick = () => {
          const [plt, ast, alt, ldh, hem] = btn.dataset.v.split(',').map(Number);
          LAB_STATE.hellp = { plt, ast, alt, ldh, hemolysis: hem === 1 };
          render();
        };
      });
      const copyHellpBtn = $('#btnCopyHellp');
      if (copyHellpBtn) {
        copyHellpBtn.onclick = () => {
          const r = interpretHellp(LAB_STATE.hellp);
          const h = LAB_STATE.hellp;
          const md = `# Zespół HELLP\n- PLT ${h.plt} G/l · AST ${h.ast} U/l · ALT ${h.alt} U/l · LDH ${h.ldh} U/l\n- **Ocena:** ${r.title} (${r.mississippi})\n- **Postępowanie:** ${r.action}`;
          saveNoteEntry(`HELLP: ${r.title}`, md, '2');
        };
      }
      const updateCordVerdict = () => {
        const box = $('#cordVerdict');
        if (box) box.innerHTML = renderCordVerdictHtml(LAB_STATE.cord);
      };
      bindNum('#cgPh', LAB_STATE.cord, 'ph', updateCordVerdict);
      bindNum('#cgBe', LAB_STATE.cord, 'be', updateCordVerdict);
      bindNum('#cgPco2', LAB_STATE.cord, 'pco2', updateCordVerdict);
      bindNum('#cgLac', LAB_STATE.cord, 'lactate', updateCordVerdict);
      $$('.js-cord-preset').forEach(btn => {
        btn.onclick = () => {
          const [ph, be, pco2, lactate] = btn.dataset.v.split(',').map(Number);
          LAB_STATE.cord = { ph, be, pco2, lactate };
          render();
        };
      });
      const copyCordBtn = $('#btnCopyCord');
      if (copyCordBtn) {
        copyCordBtn.onclick = () => {
          const r = interpretCordGas(LAB_STATE.cord);
          const g = LAB_STATE.cord;
          const md = `# Gazometria tętnicy pępowinowej\n- pH ${g.ph} · BE ${g.be} mmol/l · pCO2 ${g.pco2} mmHg · mleczany ${g.lactate} mmol/l\n- **Wniosek:** ${r.title}\n- ${r.detail}`;
          saveNoteEntry(`Gazometria pępowinowa: pH ${g.ph}`, md, '5');
        };
      }

      // --- CYTOLOGIA (BETHESDA) ---
      $$('.js-beth-mode').forEach(btn => {
        btn.onclick = () => {
          IMG_STATE.bethesdaMode = btn.dataset.mode;
          saveImgState();
          render();
        };
      });
      $$('.js-beth-item').forEach(btn => {
        btn.onclick = () => {
          IMG_STATE.bethesdaId = btn.dataset.id;
          saveImgState();
          render();
        };
      });
      const copyBethBtn = $('#btnCopyBethesda');
      if (copyBethBtn) {
        copyBethBtn.onclick = () => {
          const b = getBethesdaDb().find(x => x.id === IMG_STATE.bethesdaId);
          if (!b) return;
          const md = `# Cytologia Bethesda 2014: ${b.name}\n- **Ryzyko:** ${b.risk}\n- **Morfologia:** ${b.morphology}\n- **Postępowanie PTGiP:** ${b.management}\n- **Pułapka:** ${b.pearl}`;
          saveNoteEntry(`Bethesda: ${b.code}`, md, '11');
        };
      }
      $$('.js-bp-idx').forEach(btn => {
        btn.onclick = () => {
          IMG_STATE.puzzleIdx = Number(btn.dataset.idx) || 0;
          saveImgState();
          render();
        };
      });
      $$('.js-bp-s1').forEach(btn => {
        btn.onclick = () => {
          const puz = getBethesdaPuzzles()[IMG_STATE.puzzleIdx] || getBethesdaPuzzles()[0];
          IMG_STATE.puzzleAnswers[puz.id] = Object.assign({}, IMG_STATE.puzzleAnswers[puz.id], { s1: Number(btn.dataset.opt) });
          saveImgState();
          render();
        };
      });
      $$('.js-bp-s2').forEach(btn => {
        btn.onclick = () => {
          const puz = getBethesdaPuzzles()[IMG_STATE.puzzleIdx] || getBethesdaPuzzles()[0];
          IMG_STATE.puzzleAnswers[puz.id] = Object.assign({}, IMG_STATE.puzzleAnswers[puz.id], { s2: Number(btn.dataset.opt) });
          if (!IMG_STATE.puzzlesDone.includes(puz.id)) IMG_STATE.puzzlesDone.push(puz.id);
          saveImgState();
          render();
        };
      });
      const bpNext = $('#btnBpNext');
      if (bpNext) {
        bpNext.onclick = () => {
          IMG_STATE.puzzleIdx = (IMG_STATE.puzzleIdx || 0) + 1;
          saveImgState();
          render();
        };
      }
      bindTwoStepReset($('#btnResetBethesdaPuzzles'), () => {
        IMG_STATE.puzzleAnswers = {};
        IMG_STATE.puzzlesDone = [];
        IMG_STATE.puzzleIdx = 0;
        saveImgState();
        if (typeof toast === 'function') toast('Zresetowano zagadki Bethesda.');
        render();
      });
    }

    return { viewDiagnostics };
  };
})();
