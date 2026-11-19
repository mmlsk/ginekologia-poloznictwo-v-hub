/* Ginekologia & Położnictwo V – moduł kliniczny: Symulator egzaminu praktycznego OSCE */
(function () {
  'use strict';
  window.HUB_CLINICAL = window.HUB_CLINICAL || {};
  window.HUB_CLINICAL.osce = function (ctx) {
    const { $, $$, main, esc, pct, save, toast, getNotes, saveNotes } = ctx;

    /* ---------- IKONY SVG UI CHROME (16x16, stroke="currentColor") ---------- */
    const ICON_PATHS = {
      alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
      activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
      pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
      key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
      check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
      xcircle: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
      chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      refresh: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
      info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
    };

    function ico(name, size) {
      const sz = size || 16;
      const p = ICON_PATHS[name] || ICON_PATHS.info;
      return `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0;vertical-align:-.18em">${p}</svg>`;
    }

    function escAttr(v) {
      return (typeof CSS !== 'undefined' && typeof CSS.escape === 'function')
        ? CSS.escape(String(v))
        : String(v).replace(/["\\]/g, '\\$&');
    }

    function captureFocusSelector() {
      const ae = document.activeElement;
      if (!ae || !main.contains(ae)) return null;
      if (ae.id) return '#' + escAttr(ae.id);
      if (ae.dataset) {
        const keys = ['zoneBtn', 'otab', 'maneuver', 'qidx', 'ptab', 'sdiag', 'sact'];
        for (const k of keys) {
          if (ae.dataset[k] !== undefined) {
            const attr = 'data-' + k.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
            return `[${attr}="${escAttr(ae.dataset[k])}"]`;
          }
        }
      }
      if (ae.tagName === 'INPUT' && ae.name && ae.value) {
        return `input[name="${escAttr(ae.name)}"][value="${escAttr(ae.value)}"]`;
      }
      return null;
    }

    function restoreFocus(sel, fallbackSel) {
      const target = (sel && main.querySelector(sel)) || (fallbackSel && main.querySelector(fallbackSel));
      if (target && typeof target.focus === 'function') {
        target.focus({ preventScroll: true });
      }
    }

    function normalizeModId(mod) {
      const s = String(mod || '').trim().replace(/^m/i, '');
      const n = Number(s);
      return (Number.isInteger(n) && n >= 1 && n <= 12) ? String(n) : null;
    }

    function parseVitalNum(v) {
      if (v === null || v === undefined || v === '') return null;
      if (typeof v === 'number') return Number.isFinite(v) ? v : null;
      const m = String(v).replace(',', '.').match(/-?\d+(?:\.\d+)?/);
      return m ? Number(m[0]) : null;
    }

    function normalizeVitals(v) {
      if (!v) return {};
      const out = { ...v };
      if (out.hr != null) out.hr = parseVitalNum(out.hr);
      if (out.rr != null) out.rr = parseVitalNum(out.rr);
      if (out.spo2 != null) out.spo2 = parseVitalNum(out.spo2);
      if (out.temp != null) out.temp = parseVitalNum(out.temp);
      if (out.fhr != null) out.fhr = parseVitalNum(out.fhr);
      return out;
    }

    /* ---------- WEWNĘTRZNA BAZA 3 STACJI OSCE OB/GYN (FALLBACK / ENRICHMENT) ---------- */
    const FALLBACK_OSCE_STATIONS = [
      {
        id: 'osce-leopold',
        number: 1,
        shortTitle: 'Chwyty Leopolda i FHR',
        title: 'Badanie położnicze zewnętrzne (Chwyty Leopolda) i dobrostan płodu',
        topic: 'Położnictwo · Badanie w III trymestrze (38+4 Hbd)',
        svgMode: 'leopold',
        mods: ['5', '4'],
        patient: {
          name: 'Anna K., 28 lat',
          age: '28 lat',
          gravida: 'G1P0 · 38+4 Hbd',
          gestation: 'Ciąża pojedyncza donoszona',
          vitalsInitial: { hr: 84, bp: '122/76', rr: 16, spo2: 99, temp: 36.6, fhr: 142 }
        },
        briefing: {
          scenario: 'Pierworódka w 38+4 Hbd zgłasza się na rutynową wizytę kontrolną przed terminem porodu. Odczuwa prawidłowe ruchy płodu, bez odpływania płynu owodniowego i bez krwawienia. Przeprowadź pełne badanie położnicze zewnętrzne (4 chwyty Leopolda + SFH), wysłuchaj FHR i sprawdź podstawowe parametry bezpieczeństwa matki.',
          task: 'Zbadaj wszystkie strefy anatomiczne we właściwej kolejności, zbierz kluczowy wywiad i sformułuj rozpoznanie położnicze (położenie, ustawienie, stosunek do wchodu) oraz Status Praesens.'
        },
        interview: [
          {
            id: 'q_leo_1',
            q: 'Kiedy była ostatnia miesiączka i jaki jest termin porodu z USG I trymestru (CRL)?',
            a: 'Termin z USG w 12. tygodniu wypada za 10 dni — dziś mamy dokładnie 38 tygodni i 4 dni. Ciąża dotychczas przebiegała bez powikłań.'
          },
          {
            id: 'q_leo_2',
            q: 'Jak Pani odczuwa ruchy dziecka? Czy wystąpiły skurcze, krwawienie lub sączenie płynu?',
            a: 'Ruchy czuję wyraźnie, ponad 10 w ciągu godziny po posiłku. Nie mam krwawienia ani wycieku płynu, tylko sporadyczne niebolesne twardnienia brzucha.'
          },
          {
            id: 'q_leo_3',
            q: 'Czy miała Pani bóle głowy, zaburzenia widzenia, obrzęki lub podwyższone ciśnienie? Jaki jest wynik GBS?',
            a: 'Ciśnienie w domu zawsze ok. 115–125/75 mmHg, bez bólów głowy. Wymaz GBS pobrany w 36. tygodniu — wynik ujemny. Grupa krwi A RhD-dodatnia.'
          }
        ],
        zones: [
          {
            id: 'dno_macicy',
            name: 'Dno macicy (Chwyt I + SFH)',
            pin: { x: 50, y: 24 },
            desc: 'Ocena wysokości dna macicy (SFH) oraz części płodu znajdującej się w dnie macicy.',
            maneuvers: [
              {
                id: 'm_leo_1',
                label: 'I chwyt Leopolda — oburęczne badanie dna macicy',
                isKey: true,
                reaction: 'normal',
                finding: 'Dno macicy 2–3 palce poniżej wyrostka mieczykowatego (po obniżeniu w 38. Hbd). W dnie wyczuwalna duża, miękka, nieregularna część płodu niebalotująca — pośladki płodu.',
                svgBadge: 'I: Pośladki'
              },
              {
                id: 'm_leo_sfh',
                label: 'Pomiar wysokości dna macicy taśmą (SFH, spojenie → dno)',
                isKey: true,
                reaction: 'normal',
                finding: 'Odległość spojenie łonowe – dno macicy (SFH) wynosi 37 cm (zgodne z wiekiem ciążowym 38+4 Hbd ±2 cm).',
                svgBadge: 'SFH 37 cm'
              }
            ]
          },
          {
            id: 'boki_macicy',
            name: 'Boki macicy (Chwyt II)',
            pin: { x: 26, y: 44 },
            desc: 'Określenie położenia płodu i strony grzbietu (ustawienie I vs II).',
            maneuvers: [
              {
                id: 'm_leo_2',
                label: 'II chwyt Leopolda — naprzemienna palpacja boków macicy',
                isKey: true,
                reaction: 'normal',
                finding: 'Po stronie lewej wyczuwalna gładka, równa, łukowata płaszczyzna (grzbiet płodu — ustawienie I). Po stronie prawej drobne, ruchome części (kończyny). Położenie podłużne.',
                svgBadge: 'II: Grzbiet L (I)'
              }
            ]
          },
          {
            id: 'nadlonie',
            name: 'Odcinek dolny (Chwyt III i IV)',
            pin: { x: 50, y: 63 },
            desc: 'Określenie części przodującej (III chwyt) oraz jej stosunku do wchodu miednicy (IV chwyt).',
            maneuvers: [
              {
                id: 'm_leo_3',
                label: 'III chwyt Leopolda (Pawlika) — część przodująca nad spojeniem',
                isKey: true,
                reaction: 'normal',
                finding: 'Nad spojeniem łonowym wyczuwalna twarda, okrągła, gładka część płodu — główka. Balotowanie nieznacznie ograniczone.',
                svgBadge: 'III: Główka'
              },
              {
                id: 'm_leo_4',
                label: 'IV chwyt Leopolda (twarzą do stóp pacjentki) — stosunek do wchodu',
                isKey: true,
                reaction: 'normal',
                finding: 'Palce rąk zbieżne ponad główką, główka przyparta do wchodu miednicy (u pierworódki w 38+4 Hbd fizjologiczne przygotowanie do porodu).',
                svgBadge: 'IV: Przyparta'
              }
            ]
          },
          {
            id: 'auskultacja_fhr',
            name: 'Osłuchiwanie FHR (Lewy dolny kwadrant)',
            pin: { x: 38, y: 55 },
            desc: 'Wysłuchanie tętna płodu (detektor tętna / słuchawka Pinarda) nad grzbietem płodu.',
            maneuvers: [
              {
                id: 'm_leo_fhr',
                label: 'Osłuchanie FHR w punkcie największej słyszalności (LLQ) z kontrolą tętna matki',
                isKey: true,
                reaction: 'normal',
                finding: 'Czynność serca płodu miarowa, 142 ud./min, najwyraźniejsza w lewym dolnym kwadrancie (połowa linii pępek – kolec biodrowy przedni górny lewy). Różnicowanie z tętnem matki (84/min) potwierdzone.',
                svgBadge: 'FHR 142/min'
              }
            ]
          },
          {
            id: 'uklad_krazenia',
            name: 'Pozycja, RR i obrzęki',
            pin: { x: 75, y: 40 },
            desc: 'Bezpieczne ułożenie ciężarnej, pomiar ciśnienia tętniczego i ocena obrzęków.',
            maneuvers: [
              {
                id: 'm_leo_rr',
                label: 'Pomiar RR na ramieniu w pozycji siedzącej/półleżącej + ocena obrzęków kończyn dolnych',
                isKey: true,
                reaction: 'normal',
                finding: 'RR 122/76 mmHg (norma <140/90). Niewielkie, fizjologiczne obrzęki wokół kostek, brak obrzęków twarzy i rąk.',
                svgBadge: 'RR 122/76'
              },
              {
                id: 'm_leo_supine_error',
                label: 'Pozostawienie ciężarnej płasko na wznak przez 10 min podczas badania',
                isKey: false,
                isFatalError: true,
                reaction: 'crisis',
                vitalsDelta: { hr: 34, bp: '86/52', fhr: -36 },
                finding: 'BŁĄD KRYTYCZNY: Zespół ucisku żyły głównej dolnej! Ciężarna macica ucisnęła VCI — nagła hipotonia matki (86/52), tachykardia, bladość, zawroty głowy oraz spadek FHR do 106/min. Natychmiast ułóż pacjentkę na lewym boku (15–30°)!',
                complicationText: 'Zespół ucisku żyły głównej dolnej (aortocaval compression)! Ułożenie płasko na wznak w III trymestrze drastycznie zmniejsza powrót żylny i perfuzję łożyska. Natychmiast przekręć ciężarną na lewy bok!'
              }
            ]
          }
        ],
        synthesis: {
          diagnosisPrompt: 'Wybierz pełne, prawidłowe rozpoznanie położnicze:',
          diagnoses: [
            { id: 'd1', text: 'Ciąża I, 38+4 Hbd. Położenie podłużne główkowe, ustawienie I (grzbiet po lewej), główka przyparta do wchodu, FHR prawidłowe (142/min)', correct: true },
            { id: 'd2', text: 'Ciąża I, 38+4 Hbd. Położenie podłużne miednicowe, ustawienie II (grzbiet po prawej), FHR prawidłowe', correct: false },
            { id: 'd3', text: 'Ciąża I, 38+4 Hbd. Położenie poprzeczne z zagrażającą zamartwicą płodu', correct: false }
          ],
          actions: [
            { id: 'a1', text: 'Omówienie z pacjentką objawów alarmowych i wskazań do pilnego zgłoszenia na Izbę Przyjęć (odpłynięcie wód, krwawienie, regularne skurcze, osłabienie ruchów)', correct: true },
            { id: 'a2', text: 'Wpisanie wyniku badania (SFH, położenie, ustawienie, FHR, RR) do karty ciąży i wyznaczenie kolejnej kontroli za tydzień / w terminie porodu', correct: true },
            { id: 'a3', text: 'Zlecenie pilnego cięcia cesarskiego ze względu na przypartą główkę u pierworódki', correct: false }
          ]
        },
        statusPraesens: {
          title: 'Status Praesens Położniczy — Stacja 1 (Chwyty Leopolda)',
          sections: [
            { num: 1, title: 'Stan ogólny i parametry życiowe', content: 'Pacjentka w stanie ogólnym dobrym, przytomna, zorientowana, w logicznym kontakcie. RR 122/76 mmHg, HR 84/min miarowe, SpO₂ 99%, temp. 36,6°C.' },
            { num: 2, title: 'Brzuch i wysokość dna macicy (SFH)', content: 'Brzuch wysklepiony odpowiednio do wieku ciążowego (38+4 Hbd), bez blizn pooperacyjnych. Napięcie macicy prawidłowe, niebolesna palpacyjnie. Dno macicy 2–3 palce poniżej wyrostka mieczykowatego, SFH = 37 cm.' },
            { num: 3, title: 'Chwyty Leopolda (I–IV)', content: 'I chwyt: w dnie macicy miękkie, nieregularne pośladki. II chwyt: po lewej stronie wyczuwalny grzbiet płodu (ustawienie I), po prawej drobne części. III chwyt: nad spojeniem twarda, okrągła główka. IV chwyt: główka przyparta do wchodu miednicy.' },
            { num: 4, title: 'Dobrostan płodu (FHR i ruchy)', content: 'Czynność serca płodu (FHR) wysłuchana w lewym dolnym kwadrancie: 142 ud./min, miarowa, zróżnicowana z tętnem matki. Ruchy płodu dobrze odczuwalne.' },
            { num: 5, title: 'Obrzęki i objawy alarmowe', content: 'Minimalne fizjologiczne obrzęki wokół kostek, brak obrzęków uogólnionych, bez objawów stanu przedrzucawkowego. GBS (-).' }
          ],
          conclusions: 'Ciąża I, 38+4 Hbd, przebieg fizjologiczny. Położenie podłużne główkowe, ustawienie I, główka przyparta do wchodu. Dobrostan płodu zachowany. Dalsza opieka ambulatoryjna, edukacja o objawach początku porodu.'
        }
      },
      {
        id: 'osce-krwawienie-1t',
        number: 2,
        shortTitle: 'Krwotok w I trymestrze',
        title: 'Krwawienie z dróg rodnych w I trymestrze — diagnostyka różnicowa',
        topic: 'Ginekologia / Wczesna ciąża · 8+2 Hbd (β-hCG 2450 mIU/ml)',
        svgMode: 'gyn',
        mods: ['3', '7'],
        patient: {
          name: 'Karolina M., 28 lat',
          age: '28 lat',
          gravida: 'G1P0 · 8+2 Hbd wg OM',
          gestation: 'β-hCG 2450 mIU/ml',
          vitalsInitial: { hr: 98, bp: '108/68', rr: 18, spo2: 98, temp: 36.7, fhr: null }
        },
        briefing: {
          scenario: '28-letnia pacjentka w 8+2 Hbd zgłasza się z powodu plamienia ciemnoczerwoną krwią od rana oraz narastającego, jednostronnego pobolewania w prawym dole biodrowym. Dwa lata temu przebyła zapalenie przydatków (PID). Wykonaj bezpieczne badanie i różnicowanie: poronienie vs ciąża ektopowa.',
          task: 'Oceń stan hemodynamiczny, zbadaj delikatnie brzuch, wykonaj badanie we wziernikach i USG TV oraz sprawdź grupę krwi RhD. Unikaj forsownego badania dwuręcznego przydatków przed USG!'
        },
        interview: [
          {
            id: 'q_k1_1',
            q: 'Czy miała Pani wcześniej wykonane USG potwierdzające ciążę wewnątrzmaciczną?',
            a: 'Nie, to moja pierwsza wizyta. Zrobiłam tylko test ciążowy i wczoraj prywatnie β-hCG — wynik 2450 mIU/ml.'
          },
          {
            id: 'q_k1_2',
            q: 'Czy przebyła Pani stany zapalne przydatków, zabiegi na jajowodach lub stosowała wkładkę IUD?',
            a: 'Dwa lata temu leczyłam się antybiotykami z powodu chlamydiozy i zapalenia przydatków. Palę kilka papierosów dziennie.'
          },
          {
            id: 'q_k1_3',
            q: 'Jaka jest Pani grupa krwi i czy występowały zawroty głowy lub omdlenia?',
            a: 'Mam grupę 0 RhD-ujemną. Rano lekko zakręciło mi się w głowie przy wstawaniu, ale nie zemdlałam.'
          }
        ],
        zones: [
          {
            id: 'parametry_ogolne',
            name: 'Stan ogólny i hemodynamika',
            pin: { x: 50, y: 20 },
            desc: 'Ocena stabilności krążeniowej, wskaźnika wstrząsowego (SI) i zabarwienia powłok.',
            maneuvers: [
              {
                id: 'm_k1_hemo',
                label: 'Ocena parametrów życiowych, SI (HR/SBP) oraz powłok i śluzówek',
                isKey: true,
                reaction: 'normal',
                finding: 'HR 98/min, RR 108/68 mmHg → SI = 0,91 (granicznie podwyższony — czujność krwotoczna!). Skóra nieco blada, pacjentka stabilna, w kontakcie.',
                svgBadge: 'SI 0,91 (!)'
              }
            ]
          },
          {
            id: 'brzuch_otrzewna',
            name: 'Palpacja jamy brzusznej',
            pin: { x: 38, y: 44 },
            desc: 'Delikatne badanie palpacyjne podbrzusza, ocena bolesności jednostronnej i objawów otrzewnowych.',
            maneuvers: [
              {
                id: 'm_k1_brzuch',
                label: 'Delikatna palpacja podbrzusza + ocena objawu Blumberga',
                isKey: true,
                reaction: 'pain',
                finding: 'Brzuch miękki, lecz wyraźna tkliwość uciskowa w prawym dole biodrowym. Objaw Blumberga słabo zaznaczony lokalnie, bez rozlanej obrony mięśniowej.',
                svgBadge: 'Tkliwość R'
              }
            ]
          },
          {
            id: 'wzierniki',
            name: 'Badanie we wziernikach (Szyjka)',
            pin: { x: 50, y: 69 },
            desc: 'Ocena ilości i charakteru krwawienia oraz rozwarcia ujścia zewnętrznego szyjki macicy.',
            maneuvers: [
              {
                id: 'm_k1_speculum',
                label: 'Badanie we wzierniku — ocena szyjki i źródła krwawienia',
                isKey: true,
                reaction: 'normal',
                finding: 'W pochwie niewielka ilość ciemnej krwi, brak tkanek trofoblastu. Tarcza szyjki gładka, ujście zewnętrzne ZAMKNIĘTE (przemawia przeciwko poronieniu w toku).',
                svgBadge: 'Ujście zamkn.'
              },
              {
                id: 'm_k1_bimanual_err',
                label: 'Głębokie, forsowne badanie dwuręczne z uciskiem prawego przydatka przed USG',
                isKey: false,
                isFatalError: true,
                reaction: 'crisis',
                vitalsDelta: { hr: 32, bp: '84/50', rr: 6 },
                finding: 'BŁĄD KRYTYCZNY: Jatrogenne pęknięcie ciąży jajowodowej! Forsowny ucisk przydatka przy niezweryfikowanej w USG ciąży doprowadził do nagłego bólu, spadku RR (84/50) i tachykardii 130/min!',
                complicationText: 'Ryzyko pęknięcia ciąży ektopowej przy brutalnym badaniu dwuręcznym! Przy podejrzeniu ciąży ektopowej badanie przydatków musi być niezwykle delikatne lub poprzedzone USG TV.'
              }
            ]
          },
          {
            id: 'usg_tv',
            name: 'Przyłóżkowe USG TV',
            pin: { x: 64, y: 55 },
            desc: 'Złoty standard różnicowania krwawienia w I trymestrze (jama macicy, przydatki, zatoka Douglasa).',
            maneuvers: [
              {
                id: 'm_k1_usg',
                label: 'Wykonanie USG przezpochwowego (TV): jama macicy, przydatki, zatoka Douglasa',
                isKey: true,
                reaction: 'pain',
                finding: 'Jama macicy PUSTA (endometrium 13 mm, brak pęcherzyka ciążowego mimo β-hCG 2450 mIU/ml). W rzucie prawego jajowodu hiperechogeniczny pierścień („bagel sign”) śr. 2,8 cm bez FHR zarodka oraz niewielka ilość wolnego płynu w zatoce Douglasa (15 mm).',
                svgBadge: 'Bagel sign R'
              }
            ]
          },
          {
            id: 'lab_rh',
            name: 'Badania laboratoryjne i RhD',
            pin: { x: 76, y: 31 },
            desc: 'Kluczowy panel przed kwalifikacją do leczenia (MTX vs laparoskopia) oraz profilaktyka RhD.',
            maneuvers: [
              {
                id: 'm_k1_lab',
                label: 'Zlecenie morfologii, grupy krwi (RhD!), β-hCG, AST/ALT, kreatyniny (kwalifikacja do leczenia)',
                isKey: true,
                reaction: 'normal',
                finding: 'Hb 11,4 g/dl, grupa 0 RhD-ujemna (wymagana profilaktyka Ig anty-D!), AST/ALT i kreatynina w normie, β-hCG 2450 mIU/ml.',
                svgBadge: '0 RhD(-)'
              }
            ]
          }
        ],
        synthesis: {
          diagnosisPrompt: 'Wybierz najbardziej prawdopodobne rozpoznanie na podstawie badania i USG TV:',
          diagnoses: [
            { id: 'd1', text: 'Ciąża ektopowa (prawostronna jajowodowa) bez jawnego masywnego pęknięcia, pacjentka aktualnie stabilna hemodynamicznie', correct: true },
            { id: 'd2', text: 'Poronienie w toku — konieczne pilne łyżeczkowanie jamy macicy', correct: false },
            { id: 'd3', text: 'Prawidłowa wczesna ciąża wewnątrzmaciczna — obserwacja ambulatoryjna za 3 tygodnie', correct: false }
          ],
          actions: [
            { id: 'a1', text: 'Hospitalizacja i kwalifikacja do leczenia ciąży ektopowej (metotreksat i.m. przy spełnieniu kryteriów i ścisłym nadzorze LUB laparoskopia, szczególnie przy narastającym bólu/płynie)', correct: true },
            { id: 'a2', text: 'Podanie immunoglobuliny anty-D (pacjentka 0 RhD-ujemna)', correct: true },
            { id: 'a3', text: 'Wypis do domu z progesteronem p.o. bez dalszej diagnostyki', correct: false }
          ]
        },
        statusPraesens: {
          title: 'Status Praesens Ginekologiczny — Stacja 2 (Krwawienie I trymestr)',
          sections: [
            { num: 1, title: 'Wywiad i czynniki ryzyka', content: '28 l., G1P0, 8+2 Hbd wg OM. β-hCG 2450 mIU/ml. Czynniki ryzyka ciąży ektopowej: przebyte PID/chlamydioza, nikotynizm. Grupa krwi 0 RhD(-).' },
            { num: 2, title: 'Stan ogólny i hemodynamika', content: 'Przytomna, stabilna, skóra lekko blada. RR 108/68 mmHg, HR 98/min (SI = 0,91 — wymaga ścisłego monitorowania), SpO₂ 98%, temp. 36,7°C.' },
            { num: 3, title: 'Badanie jamy brzusznej', content: 'Brzuch miękki, tkliwość palpacyjna w prawym dole biodrowym, bez rozlanych objawów otrzewnowych.' },
            { num: 4, title: 'Badanie we wziernikach i USG TV', content: 'We wzierniku ślad ciemnej krwi, ujście zewnętrzne szyjki zamknięte, bez tkanek jaja płodowego. W USG TV jama macicy pusta, w prawym przydatku struktura 2,8 cm („bagel sign”) bez FHR, wolny płyn w zatoce Douglasa 15 mm.' },
            { num: 5, title: 'Zalecenia i profilaktyka RhD', content: 'Hospitalizacja na oddziale ginekologii, weryfikacja kwalifikacji (laparoskopia vs MTX w protokole jednodawkowym), obowiązkowa podaż immunoglobuliny anty-D (pacjentka RhD-ujemna).' }
          ],
          conclusions: 'Podejrzenie niepękniętej ciąży jajowodowej prawostronnej (O00.1). Pilna hospitalizacja, ścisły nadzór hemodynamiczny, profilaktyka anty-D.'
        }
      },
      {
        id: 'osce-ktg-bishop',
        number: 3,
        shortTitle: 'KTG, Bishop i łożysko przodujące',
        title: 'Izba Przyjęć Porodowa — KTG, skala Bishopa i wykluczenie łożyska przodującego',
        topic: 'Położnictwo · 38+0 Hbd, krwawienie w wywiadzie + kwalifikacja do porodu',
        svgMode: 'labor',
        mods: ['1', '5', '4'],
        patient: {
          name: 'Magdalena W., 34 lata',
          age: '34 lata',
          gravida: 'G2P1 · 38+0 Hbd',
          gestation: 'Ciąża po 1 porodzie SN, plamienie sprzed 2 h',
          vitalsInitial: { hr: 88, bp: '124/78', rr: 16, spo2: 99, temp: 36.6, fhr: 138 }
        },
        briefing: {
          scenario: 'Wieloródka w 38+0 Hbd zgłasza się na Izbę Przyjęć Porodową z nieregularnymi skurczami od 3 godzin oraz epizodem bezbolesnego krwawienia żywoczerwoną krwią (ok. pół podpaski) przed 2 godzinami. Zanim dotkniesz szyjki macicy — pamiętaj o żelaznej zasadzie położnictwa!',
          task: 'Zweryfikuj lokalizację łożyska w karcie ciąży / USG, zinterpretuj zapis KTG, zbadaj napięcie macicy, a dopiero po wykluczeniu łożyska przodującego oceń szyjkę w skali Bishopa.'
        },
        interview: [
          {
            id: 'q_kb_1',
            q: 'Czy w badaniu USG III trymestru opisano lokalizację łożyska? Czy krwawieniu towarzyszył stały ból brzucha?',
            a: 'Krwawienie było zupełnie bezbolesne, teraz już tylko delikatnie plamię. Mam ze sobą kartę ciąży i opis USG z 32. tygodnia — pamiętam, że lekarz wspominał coś o „nisko schodzącym łożysku”, ale nie miałam kontrolnego USG.'
          },
          {
            id: 'q_kb_2',
            q: 'Czy odczuwa Pani ruchy płodu i czy odpłynął płyn owodniowy?',
            a: 'Ruchy czuję bardzo dobrze, tak jak zawsze. Wody nie odeszły.'
          },
          {
            id: 'q_kb_3',
            q: 'Jak przebiegał poprzedni poród i jaki jest wynik GBS?',
            a: 'Pierwszy poród 4 lata temu siłami natury, bez powikłań (3450 g). Wynik GBS dodatni z 36. tygodnia.'
          }
        ],
        zones: [
          {
            id: 'karta_usg',
            name: 'USG lokalizacji łożyska (PRIORYTET!)',
            pin: { x: 50, y: 24 },
            desc: 'Obowiązkowa weryfikacja lokalizacji łożyska przed jakimkolwiek badaniem przezpochwowym u ciężarnej z krwawieniem w II/III trymestrze.',
            maneuvers: [
              {
                id: 'm_kb_usg_placenta',
                label: 'Przyłóżkowe USG przezbrzuszne (i ostrożne TV): weryfikacja położenia łożyska',
                isKey: true,
                reaction: 'normal',
                finding: 'USG: łożysko na ścianie przedniej, dolny brzeg łożyska 4,2 cm powyżej ujścia wewnętrznego szyjki macicy (łożysko przodujące WYKLUCZONE — migracja w III trymestrze!). Brak krwiaka pozałożyskowego.',
                svgBadge: 'Łożysko >4 cm OK'
              }
            ]
          },
          {
            id: 'ktg_ocena',
            name: 'Zapis KTG (FHR + TOCO)',
            pin: { x: 26, y: 45 },
            desc: 'Systematyczna interpretacja KTG wg FIGO: czynność podstawowa, zmienność, akceleracje, deceleracje, skurcze.',
            maneuvers: [
              {
                id: 'm_kb_ktg',
                label: 'Podłączenie i interpretacja 30-minutowego zapisu KTG (kryteria FIGO)',
                isKey: true,
                reaction: 'normal',
                finding: 'FHR podstawowe 138/min, zmienność falująca 10–15/min, liczne akceleracje (>15/min przez >15 s), brak deceleracji. Skurcze nieregularne 1–2/10 min. Zapis PRAWIDŁOWY (kat. I / prawidłowy wg FIGO).',
                svgBadge: 'KTG Prawidł.'
              }
            ]
          },
          {
            id: 'brzuch_skurcze',
            name: 'Napięcie macicy (Badanie zewn.)',
            pin: { x: 74, y: 45 },
            desc: 'Różnicowanie z przedwczesnym oddzieleniem łożyska (macica deskowata, bolesna).',
            maneuvers: [
              {
                id: 'm_kb_abdomen',
                label: 'Ocena napięcia spoczynkowego macicy i bolesności palpacyjnej',
                isKey: true,
                reaction: 'normal',
                finding: 'Macica między skurczami miękka, niebolesna palpacyjnie (wyklucza klasyczny obraz przedwczesnego oddzielenia łożyska). Położenie podłużne główkowe.',
                svgBadge: 'Macica miękka'
              }
            ]
          },
          {
            id: 'szyjka_bishop',
            name: 'Ocena szyjki / Skala Bishopa',
            pin: { x: 50, y: 69 },
            desc: 'Ocena dojrzałości szyjki macicy w skali Bishopa — WYŁĄCZNIE po wykluczeniu łożyska przodującego!',
            maneuvers: [
              {
                id: 'm_dwureczne_bez_usg',
                label: 'Natychmiastowe badanie dwuręczne szyjki (bez sprawdzenia USG łożyska)',
                isKey: false,
                isFatalError: true,
                reaction: 'crisis',
                vitalsDelta: { hr: 38, bp: '88/54', fhr: -34 },
                finding: 'BŁĄD KRYTYCZNY EGZAMINU OSCE: Badanie dwuręczne palcem przy podejrzeniu łożyska przodującego! U ciężarnej z bezbolesnym krwawieniem w III trymestrze i nisko schodzącym łożyskiem w wywiadzie NIGDY nie wolno badać przez pochwę przed wykluczeniem łożyska przodującego w USG — grozi rozdarciem zatok łożyskowych i śmiertelnym krwotokiem!',
                complicationText: 'BŁĄD KRYTYCZNY: Badanie dwuręczne przed wykluczeniem łożyska przodującego! W sytuacji prawdziwego łożyska przodującego wywołuje to masywny krwotok matczyny i ostrą zamartwicę płodu.'
              },
              {
                id: 'm_kb_bishop_safe',
                label: 'Badanie we wzierniku i ocena w skali Bishopa (PO wykluczeniu łożyska przodującego w USG)',
                isKey: true,
                requiresManeuver: 'm_kb_usg_placenta',
                reaction: 'normal',
                finding: 'Po potwierdzeniu prawidłowego usadowienia łożyska: w pochwie niewielkie śluzowo-krwiste plamienie (czop śluzowy!). Szyjka w osi (2 pkt), miękka (2 pkt), skrócona o 60% (2 pkt), rozwarcie 2 cm (1 pkt), główka na -1 (2 pkt) → Skala Bishopa = 9 pkt (szyjka dojrzała!).',
                svgBadge: 'Bishop 9 pkt'
              }
            ]
          },
          {
            id: 'plan_porodowy',
            name: 'Kwalifikacja GBS i plan',
            pin: { x: 50, y: 84 },
            desc: 'Weryfikacja statusu GBS, błon płodowych i planu postępowania na Sali Porodowej.',
            maneuvers: [
              {
                id: 'm_kb_gbs',
                label: 'Weryfikacja statusu GBS (+) i zaplanowanie profilaktyki antybiotykowej śródporodowej',
                isKey: true,
                reaction: 'normal',
                finding: 'GBS dodatni → konieczna śródporodowa profilaktyka penicyliną G i.v. (5 mln j.m. i.v., następnie 2,5 mln j.m. co 4 h) od momentu rozpoczęcia czynnej akcji porodowej lub odpłynięcia wód płodowych.',
                svgBadge: 'GBS (+) → IAP'
              }
            ]
          }
        ],
        synthesis: {
          diagnosisPrompt: 'Wybierz prawidłową syntezę kliniczną po wykluczeniu łożyska przodującego:',
          diagnoses: [
            { id: 'd1', text: '38+0 Hbd, faza utajona porodu / odejście czopa śluzowego; łożysko prawidłowo usadowione (>4 cm), KTG prawidłowe, szyjka dojrzała (Bishop 9 pkt), GBS (+)', correct: true },
            { id: 'd2', text: 'Łożysko przodujące centralnie — pilne cięcie cesarskie ratunkowe', correct: false },
            { id: 'd3', text: 'Przedwczesne oddzielenie łożyska z zagrażającą zamartwicą płodu', correct: false }
          ],
          actions: [
            { id: 'a1', text: 'Obserwacja na oddziale / Sali Porodowej, kontrolne KTG i wdrożenie śródporodowej antybiotykoterapii (IAP) z powodu GBS (+) po rozpoczęciu aktywnego porodu', correct: true },
            { id: 'a2', text: 'Zapamiętanie reguły: przy każdym krwawieniu w II/III trymestrze najpierw USG łożyska, nigdy badanie dwuręczne „w ciemno”', correct: true },
            { id: 'a3', text: 'Natychmiastowe podanie prostaglandyn dopochwowo mimo szyjki 9 pkt w skali Bishopa', correct: false }
          ]
        },
        statusPraesens: {
          title: 'Status Praesens Izby Przyjęć Porodowej — Stacja 3 (KTG & Bishop)',
          sections: [
            { num: 1, title: 'Stan ogólny i wywiad', content: '34 l., G2P1, 38+0 Hbd. Epizod bezbolesnego plamienia 2 h temu, w 32. Hbd opisywano nisko schodzące łożysko. GBS (+). RR 124/78 mmHg, HR 88/min, temp. 36,6°C.' },
            { num: 2, title: 'USG lokalizacji łożyska', content: 'Przed badaniem wew. wykonano USG: łożysko na ścianie przedniej, dolny brzeg 4,2 cm od ujścia wewnętrznego — łożysko przodujące wykluczone, bez krwiaka pozałożyskowego.' },
            { num: 3, title: 'Badanie zewnętrzne i KTG', content: 'Macica miękka między skurczami, niebolesna, położenie podłużne główkowe. KTG prawidłowe wg FIGO: FHR 138/min, zmienność 10–15/min, akceleracje obecne, brak deceleracji, nieregularna czynność skurczowa.' },
            { num: 4, title: 'Badanie we wzierniku i skala Bishopa', content: 'Śluzowo-krwista wydzielina (czop śluzowy), brak czynnego krwotoku. Szyjka w osi (2), miękka (2), skrócona 60% (2), rozwarcie 2 cm (1), główka -1 (2). Skala Bishopa = 9 pkt (szyjka dojrzała).' },
            { num: 5, title: 'Plan postępowania', content: 'Przyjęcie do obserwacji w kierunku postępu porodu. Ze względu na GBS (+) zlecenie śródporodowej profilaktyki penicyliną G i.v. od początku aktywnej fazy porodu lub PROM.' }
          ],
          conclusions: 'Ciąża II, 38+0 Hbd, faza wstępna porodu po wykluczeniu łożyska przodującego i oddzielenia łożyska. KTG prawidłowe, szyjka dojrzała (Bishop 9 pkt), GBS (+).'
        }
      }
    ];

    /* ---------- ŁĄCZENIE Z window.HUB_META.OSCE_STATIONS ---------- */
    function normalizeStation(raw, fb) {
      const s = fb ? {
        ...fb,
        ...raw,
        svgMode: raw.svgMode || fb.svgMode,
        zones: (raw.zones && raw.zones.length) ? raw.zones : fb.zones,
        interview: raw.interview || fb.interview,
        statusPraesens: raw.statusPraesens || fb.statusPraesens,
        patient: { ...(fb.patient || {}), ...(raw.patient || {}) },
        briefing: { ...(fb.briefing || {}), ...(raw.briefing || {}) }
      } : { ...raw };

      s.mods = (Array.isArray(s.mods) ? s.mods.map(normalizeModId).filter(Boolean) : []);
      if (!s.mods.length && fb && Array.isArray(fb.mods)) {
        s.mods = fb.mods.map(normalizeModId).filter(Boolean);
      }

      if (s.patient && s.patient.vitalsInitial) {
        s.patient = { ...s.patient, vitalsInitial: normalizeVitals(s.patient.vitalsInitial) };
      }

      if (Array.isArray(s.zones)) {
        s.zones = s.zones.map(z => ({
          ...z,
          desc: z.desc || '',
          maneuvers: (z.maneuvers || []).map(mv => ({
            ...mv,
            isFatalError: Boolean(mv.isFatalError || mv.isFatal),
            complicationText: mv.complicationText || mv.fatalMessage || '',
            complicationVitals: mv.complicationVitals ? normalizeVitals(mv.complicationVitals) : null
          }))
        }));
      }

      const syn = s.synthesis || (fb && fb.synthesis);
      if (syn) {
        s.synthesis = {
          diagnosisPrompt: syn.diagnosisPrompt || syn.questionDiagnostic || 'Wybierz rozpoznanie wstępne:',
          diagnoses: Array.isArray(syn.diagnoses)
            ? syn.diagnoses
            : (syn.optionsDiagnostic || []).map(o => ({
                id: o.id,
                text: o.text || o.label,
                correct: Boolean(o.correct != null ? o.correct : o.isCorrect),
                explanation: o.explanation || ''
              })),
          actions: Array.isArray(syn.actions)
            ? syn.actions
            : (syn.actionOptions || []).map(o => ({
                id: o.id,
                text: o.text || o.label,
                correct: Boolean(o.correct != null ? o.correct : o.isCorrect),
                isFatal: Boolean(o.isFatal)
              }))
        };
      }
      return s;
    }

    function getStations() {
      const metaList = (window.HUB_META && Array.isArray(window.HUB_META.OSCE_STATIONS))
        ? window.HUB_META.OSCE_STATIONS
        : [];
      if (!metaList.length) return FALLBACK_OSCE_STATIONS.map(fb => normalizeStation(fb, null));

      const byId = new Map(FALLBACK_OSCE_STATIONS.map(s => [s.id, s]));
      const merged = metaList.map(m => normalizeStation(m, byId.get(m.id)));
      // Upewnij się, że 3 kluczowe stacje OB/GYN są obecne
      FALLBACK_OSCE_STATIONS.forEach(fb => {
        if (!merged.some(s => s.id === fb.id)) merged.push(normalizeStation(fb, null));
      });
      return merged;
    }

    /* ---------- HELPERY PARAMETRÓW I REAKCJI ---------- */
    function localVitalStatus(key, val) {
      if (ctx.patient && typeof ctx.patient.getVitalStatus === 'function') {
        return ctx.patient.getVitalStatus(key, val);
      }
      if (val === null || val === undefined) return 'ok';
      if (key === 'spo2') return val >= 95 ? 'ok' : (val >= 91 ? 'warn' : 'danger');
      if (key === 'hr') return (val >= 60 && val <= 100) ? 'ok' : (val <= 115 ? 'warn' : 'danger');
      if (key === 'rr') return (val >= 12 && val <= 20) ? 'ok' : (val <= 24 ? 'warn' : 'danger');
      if (key === 'temp') return (val >= 36.0 && val <= 37.5) ? 'ok' : 'warn';
      if (key === 'fhr') return (val >= 110 && val <= 160) ? 'ok' : ((val >= 100 && val < 110) || (val > 160 && val < 180) ? 'warn' : 'danger');
      if (key === 'bp') {
        const m = String(val).match(/(\d+)\s*\/\s*(\d+)/);
        if (!m) return 'ok';
        const sys = Number(m[1]), dia = Number(m[2]);
        if (sys < 90 || sys >= 160 || dia >= 110) return 'danger';
        if (sys < 100 || sys >= 140 || dia >= 90) return 'warn';
        return 'ok';
      }
      return 'ok';
    }

    function getReactionBadge(r) {
      switch (r) {
        case 'pain': return `<span class="osce-reaction-badge pain">${ico('alert')} Tkliwość / Ból palpacyjny</span>`;
        case 'cry': return `<span class="osce-reaction-badge cry">${ico('alert')} Niepokój pacjentki</span>`;
        case 'crisis': return `<span class="osce-reaction-badge crisis">${ico('shield')} KRYZYS / BŁĄD KRYTYCZNY</span>`;
        case 'normal':
        default: return `<span class="osce-reaction-badge normal">${ico('check')} Pacjentka stabilna / Współpracująca</span>`;
      }
    }

    /* ---------- STAN AKTYWNEJ STACJI OSCE ---------- */
    let OSCE_ACTIVE = null;

    function startOsceStation(station) {
      OSCE_ACTIVE = {
        stationId: station.id,
        performedManeuvers: new Set(),
        performedQuestions: new Set(),
        selectedZone: station.zones && station.zones[0] ? station.zones[0].id : null,
        activeTab: 'maneuvers', // 'maneuvers' | 'interview' | 'log'
        reaction: 'normal',
        currentVitals: { ...(station.patient && station.patient.vitalsInitial ? station.patient.vitalsInitial : {}) },
        isComplication: false,
        complicationMessage: '',
        findings: [],
        fatalErrorsTriggered: 0,
        isSynthesis: false,
        isFinished: false,
        synthesisDiagnosis: null,
        synthesisActions: new Set(),
        score: null,
        startedAt: Date.now()
      };
    }

    function computeLiveProgress(station) {
      const allManeuvers = (station.zones || []).flatMap(z => z.maneuvers || []);
      const keyManeuvers = allManeuvers.filter(m => m.isKey);
      const doneKey = keyManeuvers.filter(m => OSCE_ACTIVE.performedManeuvers.has(m.id)).length;
      const totalKey = Math.max(1, keyManeuvers.length);
      const totalQ = Math.max(1, (station.interview || []).length);
      const doneQ = OSCE_ACTIVE.performedQuestions.size;
      const examPct = Math.round(((doneKey / totalKey) * 0.8 + (doneQ / totalQ) * 0.2) * 100);
      const penalty = OSCE_ACTIVE.fatalErrorsTriggered * 25;
      return {
        doneKey,
        totalKey: keyManeuvers.length,
        doneQ,
        totalQ: (station.interview || []).length,
        livePct: Math.max(0, Math.min(100, examPct - penalty))
      };
    }

    /* ---------- INTERAKTYWNA MAPA SVG OB/GYN ---------- */
    function isZoneCompleted(station, zoneId) {
      const z = (station.zones || []).find(item => item.id === zoneId);
      if (!z || !OSCE_ACTIVE) return false;
      const keys = (z.maneuvers || []).filter(m => m.isKey);
      return keys.length > 0 && keys.every(m => OSCE_ACTIVE.performedManeuvers.has(m.id));
    }

    function getZoneClass(station, zoneId) {
      if (!zoneId) return '';
      let cls = 'osce-anatomy-region';
      if (OSCE_ACTIVE && OSCE_ACTIVE.selectedZone === zoneId) cls += ' active-zone';
      if (isZoneCompleted(station, zoneId)) cls += ' done-zone';
      return cls;
    }

    function resolveZoneAttr(station, candidates) {
      const zones = station.zones || [];
      const zid = candidates.find(id => zones.some(z => z.id === id)) || '';
      if (!zid) return 'aria-hidden="true"';
      return `class="${getZoneClass(station, zid)}" data-zone-id="${esc(zid)}" aria-hidden="true"`;
    }

    function renderObGynSvg(station) {
      const mode = station.svgMode || 'leopold';
      const perf = OSCE_ACTIVE ? OSCE_ACTIVE.performedManeuvers : new Set();

      // Wspólna sylwetka tułowia i miednicy pacjentki (SVG 300x460); interakcję klawiaturową i SR zapewniają przyciski .osce-hotspot
      const baseTorso = `
        <defs>
          <linearGradient id="obSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--teal)" stop-opacity="0.06"/>
            <stop offset="100%" stop-color="var(--teal)" stop-opacity="0.15"/>
          </linearGradient>
          <radialGradient id="uterusGrad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stop-color="var(--teal)" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="var(--teal)" stop-opacity="0.06"/>
          </radialGradient>
        </defs>
        <rect x="14" y="10" width="272" height="440" rx="22" fill="rgba(138,40,76,0.02)" stroke="var(--line)" stroke-width="1.4" stroke-dasharray="5 4"/>
        <!-- Głowa i szyja (orientacja) -->
        <circle cx="150" cy="48" r="22" fill="url(#obSkin)" stroke="var(--line)" stroke-width="1.6"/>
        <path d="M 140 70 L 140 84 M 160 70 L 160 84" stroke="var(--line)" stroke-width="1.6"/>
        <!-- Zarys tułowia, klatki piersiowej i bioder -->
        <path d="M 96 92 C 80 105 74 148 76 205 C 74 265 68 310 82 355 L 114 430 L 140 430 L 148 358 L 152 358 L 160 430 L 186 430 L 218 355 C 232 310 226 265 224 205 C 226 148 220 105 204 92 C 186 84 114 84 96 92 Z"
              fill="url(#obSkin)" stroke="var(--teal)" stroke-opacity="0.55" stroke-width="2" stroke-linejoin="round"/>
        <!-- Spojenie łonowe (punkt orientacyjny) -->
        <path d="M 122 332 Q 150 344 178 332" fill="none" stroke="var(--teal)" stroke-opacity="0.4" stroke-width="2" stroke-dasharray="3 3"/>
      `;

      let overlay = '';
      if (mode === 'leopold') {
        const sfhDone = perf.has('m_leo_sfh') || perf.has('m_wysokosc_dna');
        overlay = `
          <!-- Macica ciężarna 38 Hbd -->
          <ellipse cx="150" cy="212" rx="64" ry="96" fill="url(#uterusGrad)" stroke="var(--teal)" stroke-width="2.2"/>
          <!-- Strefa: Dno macicy (I chwyt + SFH) -->
          <path ${resolveZoneAttr(station, ['dno_macicy'])}
                d="M 96 165 C 102 108 198 108 204 165 Q 150 176 96 165 Z"
                fill="rgba(138,40,76,0.10)" stroke="var(--teal)" stroke-width="2"/>
          <!-- Strefa: Boki macicy (II chwyt) -->
          <path ${resolveZoneAttr(station, ['boki_macicy'])}
                d="M 88 170 C 78 215 84 255 104 282 L 138 274 C 128 232 128 196 138 170 Z"
                fill="rgba(138,40,76,0.09)" stroke="var(--teal)" stroke-width="2"/>
          <!-- Zarys płodu w położeniu podłużnym główkowym -->
          <path d="M 142 146 C 118 158 112 204 126 244 C 134 264 148 276 150 282" fill="none" stroke="var(--teal-d)" stroke-width="2.4" stroke-linecap="round" stroke-opacity="0.55"/>
          <circle cx="150" cy="288" r="20" fill="rgba(138,40,76,0.14)" stroke="var(--teal-d)" stroke-width="2"/>
          <!-- Strefa: Nadłonie (III i IV chwyt) -->
          <ellipse ${resolveZoneAttr(station, ['nadlonie', 'spojenie_lonowe'])}
                   cx="150" cy="292" rx="44" ry="28" fill="rgba(138,40,76,0.08)" stroke="var(--teal)" stroke-width="2"/>
          <!-- Strefa: Punkt FHR (LLQ) -->
          <g ${resolveZoneAttr(station, ['auskultacja_fhr', 'punkt_fhr'])}>
            <circle cx="118" cy="252" r="18" fill="rgba(185,52,36,0.10)" stroke="var(--red)" stroke-width="2"/>
            <circle class="osce-pulse-ring" cx="118" cy="252" r="8" fill="none" stroke="var(--red)" stroke-width="1.6"/>
            <text x="118" y="256" text-anchor="middle" font-size="10" font-weight="800" fill="var(--red)">FHR</text>
          </g>
          <!-- Strefa: Mankiet RR / krążenie -->
          <rect ${resolveZoneAttr(station, ['uklad_krazenia', 'cisnienie_ogolne'])}
                x="212" y="156" width="38" height="58" rx="8" fill="rgba(43,99,174,0.12)" stroke="var(--blue)" stroke-width="2"/>
          <text x="231" y="189" text-anchor="middle" font-size="10" font-weight="800" fill="var(--blue)">RR</text>
          ${sfhDone ? `<line x1="150" y1="118" x2="150" y2="332" stroke="var(--green)" stroke-width="2" stroke-dasharray="4 3"/><text class="osce-finding-badge-svg" x="184" y="212" font-size="10" font-weight="800" fill="var(--green)">37 cm</text>` : ''}
        `;
      } else if (mode === 'gyn') {
        const usgDone = perf.has('m_k1_usg') || perf.has('m_usg_tv_ektopowa');
        overlay = `
          <!-- Strefa: Parametry ogólne / Hemodynamika -->
          <rect ${resolveZoneAttr(station, ['parametry_ogolne', 'krążenie_wstrzas'])}
                x="104" y="96" width="92" height="44" rx="10" fill="rgba(43,99,174,0.10)" stroke="var(--blue)" stroke-width="2"/>
          <text x="150" y="122" text-anchor="middle" font-size="10" font-weight="800" fill="var(--blue)">SI / Hemodynamika</text>
          <!-- Strefa: Brzuch i prawy dół biodrowy -->
          <ellipse ${resolveZoneAttr(station, ['brzuch_otrzewna', 'brzuch_ektopowa'])}
                   cx="116" cy="212" rx="36" ry="42" fill="rgba(184,115,15,0.10)" stroke="var(--amber)" stroke-width="2"/>
          <text x="116" y="215" text-anchor="middle" font-size="9.5" font-weight="800" fill="var(--amber-d)">Prawy dół</text>
          <!-- Macica (nieciężarna/wczesna) i jajowody -->
          <path d="M 134 268 Q 150 256 166 268 L 158 308 L 142 308 Z" fill="url(#uterusGrad)" stroke="var(--teal)" stroke-width="2"/>
          <path d="M 134 270 Q 112 262 104 274" fill="none" stroke="var(--teal)" stroke-width="2.2"/>
          <path d="M 166 270 Q 188 262 196 274" fill="none" stroke="var(--teal)" stroke-width="2.2"/>
          <!-- Strefa: USG TV (przydatki i zatoka Douglasa) -->
          <g ${resolveZoneAttr(station, ['usg_tv', 'badanie_gin_usg'])}>
            <circle cx="192" cy="264" r="24" fill="rgba(185,52,36,0.10)" stroke="var(--red)" stroke-width="2" stroke-dasharray="3 2"/>
            <text x="192" y="268" text-anchor="middle" font-size="9.5" font-weight="800" fill="var(--red)">USG TV</text>
          </g>
          <!-- Strefa: Wzierniki / Szyjka -->
          <rect ${resolveZoneAttr(station, ['wzierniki', 'badanie_gin_usg'])}
                x="118" y="308" width="64" height="44" rx="12" fill="rgba(138,40,76,0.10)" stroke="var(--teal)" stroke-width="2"/>
          <text x="150" y="334" text-anchor="middle" font-size="10" font-weight="800" fill="var(--teal-d)">Wziernik</text>
          <!-- Strefa: Lab / Grupa krwi RhD -->
          <rect ${resolveZoneAttr(station, ['lab_rh'])}
                x="202" y="138" width="54" height="44" rx="10" fill="rgba(47,132,80,0.10)" stroke="var(--green)" stroke-width="2"/>
          <text x="229" y="164" text-anchor="middle" font-size="9.5" font-weight="800" fill="var(--green)">RhD / Lab</text>
          ${usgDone ? `<circle class="osce-finding-badge-svg" cx="104" cy="274" r="10" fill="rgba(185,52,36,0.28)" stroke="var(--red)" stroke-width="2"/>` : ''}
        `;
      } else {
        // mode === 'labor' (KTG, Bishop i weryfikacja łożyska)
        const placentaChecked = perf.has('m_kb_usg_placenta');
        overlay = `
          <!-- Macica donoszona -->
          <ellipse cx="150" cy="212" rx="64" ry="94" fill="url(#uterusGrad)" stroke="var(--teal)" stroke-width="2.2"/>
          <!-- Strefa: USG lokalizacji łożyska -->
          <path ${resolveZoneAttr(station, ['karta_usg'])}
                d="M 108 134 Q 150 110 192 134 Q 186 168 150 166 Q 114 168 108 134 Z"
                fill="${placentaChecked ? 'rgba(47,132,80,0.18)' : 'rgba(184,115,15,0.15)'}"
                stroke="${placentaChecked ? 'var(--green)' : 'var(--amber)'}" stroke-width="2.2"/>
          <text x="150" y="148" text-anchor="middle" font-size="9.5" font-weight="800" fill="${placentaChecked ? 'var(--green)' : 'var(--amber-d)'}">${placentaChecked ? 'Łożysko >4 cm' : 'USG łożyska'}</text>
          <!-- Strefa: Peloty KTG -->
          <g ${resolveZoneAttr(station, ['ktg_ocena'])}>
            <rect x="64" y="192" width="54" height="44" rx="10" fill="rgba(43,99,174,0.12)" stroke="var(--blue)" stroke-width="2"/>
            <polyline points="72,216 80,216 85,204 91,226 96,214 110,214" fill="none" stroke="var(--blue)" stroke-width="2"/>
          </g>
          <!-- Strefa: Badanie napięcia macicy -->
          <ellipse ${resolveZoneAttr(station, ['brzuch_skurcze'])}
                   cx="206" cy="212" rx="34" ry="38" fill="rgba(138,40,76,0.09)" stroke="var(--teal)" stroke-width="2"/>
          <text x="206" y="216" text-anchor="middle" font-size="9.5" font-weight="800" fill="var(--teal-d)">Napięcie</text>
          <!-- Strefa: Szyjka / Skala Bishopa -->
          <rect ${resolveZoneAttr(station, ['szyjka_bishop', 'badanie_wew_bishop'])}
                x="114" y="294" width="72" height="48" rx="12" fill="rgba(185,52,36,0.08)" stroke="var(--teal)" stroke-width="2"/>
          <text x="150" y="322" text-anchor="middle" font-size="10" font-weight="800" fill="var(--teal-d)">Szyjka / Bishop</text>
          <!-- Strefa: GBS / Plan -->
          <rect ${resolveZoneAttr(station, ['plan_porodowy'])}
                x="108" y="366" width="84" height="36" rx="10" fill="rgba(47,132,80,0.09)" stroke="var(--green)" stroke-width="2"/>
          <text x="150" y="388" text-anchor="middle" font-size="10" font-weight="800" fill="var(--green)">GBS &amp; Plan</text>
        `;
      }

      return `<svg class="osce-silhouette-svg" viewBox="0 0 300 460" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        ${baseTorso}
        ${overlay}
      </svg>`;
    }

    function renderOsceVitals(v) {
      const hasFhr = v.fhr !== null && v.fhr !== undefined;
      return `<div class="osce-vitals-monitor" style="grid-template-columns:repeat(${hasFhr ? 6 : 5}, 1fr)">
        <div class="vital-chip ${localVitalStatus('hr', v.hr)}"><span class="v-lab">HR</span><span class="v-val" style="font-size:1.05rem">${esc(v.hr)}</span><span class="v-unit">/min</span></div>
        <div class="vital-chip ${localVitalStatus('bp', v.bp)}"><span class="v-lab">RR</span><span class="v-val" style="font-size:.98rem">${esc(v.bp)}</span><span class="v-unit">mmHg</span></div>
        <div class="vital-chip ${localVitalStatus('spo2', v.spo2)}"><span class="v-lab">SpO₂</span><span class="v-val" style="font-size:1.05rem">${esc(v.spo2)}%</span><span class="v-unit">O₂</span></div>
        <div class="vital-chip ${localVitalStatus('rr', v.rr)}"><span class="v-lab">Oddech</span><span class="v-val" style="font-size:1.05rem">${esc(v.rr)}</span><span class="v-unit">/min</span></div>
        <div class="vital-chip ${localVitalStatus('temp', v.temp)}"><span class="v-lab">Temp</span><span class="v-val" style="font-size:1.05rem">${esc(Number(v.temp != null ? v.temp : 36.6).toFixed(1))}</span><span class="v-unit">°C</span></div>
        ${hasFhr ? `<div class="vital-chip ${localVitalStatus('fhr', v.fhr)}"><span class="v-lab">FHR</span><span class="v-val" style="font-size:1.05rem">${esc(v.fhr)}</span><span class="v-unit">płód</span></div>` : ''}
      </div>`;
    }

    /* ---------- LISTA STACJI OSCE ---------- */
    function renderOsceStationList() {
      const prevFocus = captureFocusSelector();
      window.scrollTo(0, 0);
      const stations = getStations();
      const sorCount = (ctx.patient && Array.isArray(ctx.patient.cases)) ? ctx.patient.cases.length : 4;
      const savedMap = ctx.S.osceCases || {};
      const completedCount = Object.keys(savedMap).length;
      const avgScore = completedCount > 0
        ? Math.round(Object.values(savedMap).reduce((acc, c) => acc + (c.bestScore != null ? c.bestScore : (c.score || 0)), 0) / completedCount)
        : 0;

      main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:1040px">
        <div class="eyebrow">Symulator kliniczny · Egzamin Praktyczny OSCE</div>
        <h1 style="font-size:clamp(1.7rem,3.4vw,2.4rem);margin:0 0 .5rem 0">Stacje Badania Położniczo-Ginekologicznego i Status Praesens</h1>

        <div class="conn-tabs" role="tablist" aria-label="Tryb symulatora klinicznego" style="margin-bottom:1.4rem">
          <button type="button" class="conn-tab-btn" data-ptab="sor" role="tab" aria-selected="false">${ico('alert')} Izba Przyjęć · Przypadki ostre (${sorCount})</button>
          <button type="button" class="conn-tab-btn active" data-ptab="osce" role="tab" aria-selected="true">${ico('clipboard')} Stacje OSCE (${stations.length})</button>
        </div>

        <p class="lead">Interaktywny symulator egzaminu praktycznego OSCE z ginekologii i położnictwa. Klikaj strefy na wektorowej planszy badania, zbierz wywiad, unikaj błędów krytycznych (np. badania dwuręcznego przy łożysku przodującym) i wygeneruj Status Praesens do Notatnika.</p>

        <div class="hero-strip" style="margin-bottom:1.8rem">
          <div class="hero-stat">
            <span class="val">${stations.length}</span>
            <span class="lbl">Stacji OSCE</span>
          </div>
          <div class="hero-stat">
            <span class="val">${completedCount} / ${stations.length}</span>
            <span class="lbl">Zaliczonych</span>
          </div>
          <div class="hero-stat">
            <span class="val">${completedCount > 0 ? avgScore + '%' : '–'}</span>
            <span class="lbl">Średni wynik</span>
          </div>
          <div class="hero-stat">
            <span class="val">Status</span>
            <span class="lbl">Eksport do Notatek</span>
          </div>
        </div>

        <div class="grid cols-2" style="gap:1.3rem">
          ${stations.map(station => {
            const saved = savedMap[station.id];
            const bestScore = saved ? (saved.bestScore != null ? saved.bestScore : saved.score) : null;
            const isPassed = bestScore !== null && bestScore >= 60;
            const totalZones = (station.zones || []).length;
            const totalKey = (station.zones || []).flatMap(z => z.maneuvers || []).filter(m => m.isKey).length;
            return `<article class="card" style="display:flex;flex-direction:column;justify-content:space-between;border-top:4px solid var(--teal)">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.55rem;flex-wrap:wrap;gap:.4rem">
                  <span class="chip" style="background:var(--teal);color:var(--on-accent);font-weight:800;border:0">STACJA ${esc(station.number || '')}</span>
                  <span style="font-size:.8rem;color:var(--ink-muted);font-weight:700">${esc(station.patient && station.patient.gravida ? station.patient.gravida : (station.patient && station.patient.age || ''))}</span>
                </div>
                <h3 style="margin:.15rem 0 .4rem 0;font-size:1.15rem">
                  <a href="#/pacjent/osce/${esc(station.id)}" style="color:inherit;text-decoration:none">${esc(station.title)}</a>
                </h3>
                <div style="font-size:.84rem;color:var(--teal-d);font-weight:700;margin-bottom:.55rem;display:flex;align-items:center;gap:.35rem">${ico('activity')} <span>${esc(station.topic || '')}</span></div>
                <p style="font-size:.88rem;color:var(--ink-muted);line-height:1.48;margin-bottom:.9rem">${esc(station.briefing && station.briefing.scenario || '')}</p>
                <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem">
                  <span class="chip" style="background:var(--teal-l);color:var(--teal-d);border:0">${ico('pin')} ${totalZones} stref</span>
                  <span class="chip" style="background:var(--teal-l);color:var(--teal-d);border:0">${ico('key')} ${totalKey} manewrów</span>
                  <span class="chip" style="background:var(--red-l);color:var(--red);border:0">${ico('alert')} Błędy krytyczne</span>
                </div>
              </div>

              <div style="border-top:1px solid var(--line-2);padding-top:.85rem;display:flex;align-items:center;justify-content:space-between;gap:.6rem;flex-wrap:wrap">
                <div>
                  ${bestScore !== null ? `
                    <span class="chip" style="background:${isPassed ? 'var(--green-l)' : 'var(--red-l)'};color:${isPassed ? 'var(--green)' : 'var(--red)'};font-weight:800;border:0">
                      ${isPassed ? `${ico('check')} ZALICZONE` : `${ico('xcircle')} DO POPRAWY`}: ${bestScore}%
                    </span>
                  ` : `<span class="chip" style="color:var(--ink-muted)">Nowa stacja</span>`}
                </div>
                <a class="btn pri sm" href="#/pacjent/osce/${esc(station.id)}">${bestScore !== null ? 'Powtórz stację →' : 'Rozpocznij stację →'}</a>
              </div>
            </article>`;
          }).join('')}
        </div>
      </div></section>`;

      $$('.conn-tab-btn[data-ptab]').forEach(b => {
        b.onclick = () => {
          location.hash = b.dataset.ptab === 'osce' ? '#/pacjent/osce' : '#/pacjent';
        };
      });

      restoreFocus(prevFocus);
    }

    /* ---------- AKTYWNA STACJA OSCE ---------- */
    function renderActiveOsceStation(station, focusFallbackSel) {
      if (OSCE_ACTIVE.isSynthesis || OSCE_ACTIVE.isFinished) {
        return renderOsceSynthesisAndReport(station);
      }

      const prevFocus = captureFocusSelector();
      const prog = computeLiveProgress(station);
      const selectedZoneObj = (station.zones || []).find(z => z.id === OSCE_ACTIVE.selectedZone) || (station.zones || [])[0];
      const latestFinding = OSCE_ACTIVE.findings.length ? OSCE_ACTIVE.findings[0] : null;

      main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:1120px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.9rem;flex-wrap:wrap;gap:.5rem">
          <a class="btn sec sm" href="#/pacjent/osce">← Wróć do stacji OSCE</a>
          <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
            ${getReactionBadge(OSCE_ACTIVE.reaction)}
            <button type="button" class="btn pri sm" id="btnFinishOsce">Zakończ i przejdź do syntezy →</button>
          </div>
        </div>

        <!-- Briefing + pasek checklisty na żywo -->
        <div class="card" style="margin-bottom:1.1rem;padding:1.05rem 1.3rem;border-left:4px solid var(--teal)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.6rem">
            <div style="flex:1;min-width:240px">
              <div style="display:flex;gap:.45rem;flex-wrap:wrap;margin-bottom:.3rem">
                <span class="chip" style="background:var(--teal);color:var(--on-accent);border:0;font-weight:800">STACJA ${esc(station.number || '')}</span>
                <span class="chip">${esc(station.patient.name)}</span>
                <span class="chip">${esc(station.patient.gravida || station.patient.age || '')}</span>
              </div>
              <h1 style="margin:.2rem 0;font-size:1.25rem">${esc(station.title)}</h1>
              <p class="srcline" style="margin:.3rem 0 0 0;font-size:.88rem">${esc(station.briefing.scenario)}</p>
            </div>
            <div style="min-width:210px;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:.65rem .85rem">
              <div style="font-size:.74rem;font-weight:800;text-transform:uppercase;color:var(--muted);margin-bottom:.3rem">Checklista OSCE na żywo</div>
              <div style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:.2rem">
                <span>Manewry kluczowe:</span><b>${prog.doneKey} / ${prog.totalKey}</b>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:.2rem">
                <span>Wywiad (Q&amp;A):</span><b>${prog.doneQ} / ${prog.totalQ}</b>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:.84rem">
                <span>Błędy krytyczne:</span><b style="color:${OSCE_ACTIVE.fatalErrorsTriggered > 0 ? 'var(--red)' : 'var(--green)'}">${OSCE_ACTIVE.fatalErrorsTriggered}</b>
              </div>
              <div style="margin-top:.45rem;height:6px;background:var(--line);border-radius:999px;overflow:hidden">
                <div style="height:100%;width:${prog.livePct}%;background:${OSCE_ACTIVE.fatalErrorsTriggered > 0 ? 'var(--amber)' : 'var(--teal)'};transition:width .25s"></div>
              </div>
            </div>
          </div>
        </div>

        ${OSCE_ACTIVE.isComplication ? `
          <div class="osce-complication-card" role="alert">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.8rem;flex-wrap:wrap">
              <div style="flex:1">
                <b style="color:var(--red);font-size:1.02rem;display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem">${ico('shield')} ALARM KRYTYCZNY — POWIKŁANIE JATROGENNE</b>
                <p style="margin:0;font-size:.9rem;line-height:1.45">${esc(OSCE_ACTIVE.complicationMessage)}</p>
              </div>
              <button type="button" class="btn pri sm" id="btnStabilizeOsce" style="background:var(--red);border-color:var(--red)">${ico('activity')} Natychmiast stabilizuj pacjentkę</button>
            </div>
          </div>
        ` : ''}

        <div class="osce-wrap">
          <!-- LEWA KOLUMNA: INTERAKTYWNA MAPA ANATOMICZNA SVG -->
          <div class="osce-board">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem">
              <b style="font-size:.92rem;color:var(--ink)">Mapa badania (kliknij strefę)</b>
              <span style="font-size:.76rem;color:var(--ink-muted)">${prog.doneKey}/${prog.totalKey} ✓</span>
            </div>
            <div class="osce-patient-stage">
              <div class="osce-stage-inner" role="group" aria-label="Interaktywna mapa badania ${esc(station.shortTitle)}">
                ${renderObGynSvg(station)}
                ${(station.zones || []).map(z => {
                  const isActive = selectedZoneObj && selectedZoneObj.id === z.id;
                  const isDone = isZoneCompleted(station, z.id);
                  const pinX = (z.pin && z.pin.x != null) ? z.pin.x : (z.x != null ? z.x : 50);
                  const pinY = (z.pin && z.pin.y != null) ? z.pin.y : (z.y != null ? z.y : 50);
                  return `<button type="button"
                    class="osce-hotspot ${isActive ? 'active' : ''} ${isDone ? 'performed' : ''}"
                    data-zone-btn="${esc(z.id)}"
                    style="left:${pinX}%;top:${pinY}%;background:none;border:0;min-width:44px;min-height:44px;justify-content:center"
                    aria-label="Strefa: ${esc(z.name)} — ${isDone ? 'zbadano (komplet manewrów)' : 'do zbadania'}"
                    aria-pressed="${isActive ? 'true' : 'false'}">
                    <span class="osce-pin-badge">
                      <span aria-hidden="true">${isDone ? '✓' : '●'}</span>
                      <span class="pin-name">${esc(z.name.split('(')[0].trim())}</span>
                    </span>
                  </button>`;
                }).join('')}
              </div>
            </div>
            <div style="font-size:.76rem;color:var(--ink-muted);margin-top:.6rem;text-align:center">
              Zielone punkty oznaczają strefy z kompletem manewrów kluczowych.
            </div>
          </div>

          <!-- PRAWA KOLUMNA: MONITOR, MANEWRY I WYWIAD -->
          <div>
            ${renderOsceVitals(OSCE_ACTIVE.currentVitals)}

            <div class="conn-tabs" role="tablist" aria-label="Panel badania OSCE" style="margin-bottom:.9rem">
              <button type="button" class="conn-tab-btn ${OSCE_ACTIVE.activeTab === 'maneuvers' ? 'active' : ''}" data-otab="maneuvers" role="tab" aria-selected="${OSCE_ACTIVE.activeTab === 'maneuvers' ? 'true' : 'false'}">${ico('activity')} Manewry (${selectedZoneObj ? esc(selectedZoneObj.name.split('(')[0].trim()) : ''})</button>
              <button type="button" class="conn-tab-btn ${OSCE_ACTIVE.activeTab === 'interview' ? 'active' : ''}" data-otab="interview" role="tab" aria-selected="${OSCE_ACTIVE.activeTab === 'interview' ? 'true' : 'false'}">${ico('chat')} Wywiad (${prog.doneQ}/${prog.totalQ})</button>
              <button type="button" class="conn-tab-btn ${OSCE_ACTIVE.activeTab === 'log' ? 'active' : ''}" data-otab="log" role="tab" aria-selected="${OSCE_ACTIVE.activeTab === 'log' ? 'true' : 'false'}">${ico('clipboard')} Wyniki (${OSCE_ACTIVE.findings.length})</button>
            </div>

            ${OSCE_ACTIVE.activeTab === 'maneuvers' && selectedZoneObj ? `
              <div class="card" style="padding:1.15rem 1.25rem">
                <div class="eyebrow">Wybrana strefa anatomiczna</div>
                <h3 style="margin:.2rem 0 .35rem 0;font-size:1.12rem">${esc(selectedZoneObj.name)}</h3>
                ${selectedZoneObj.desc ? `<p class="srcline" style="margin:0 0 .9rem 0;font-size:.86rem">${esc(selectedZoneObj.desc)}</p>` : ''}

                <div id="osceManeuverList">
                  ${(selectedZoneObj.maneuvers || []).map(m => {
                    const done = OSCE_ACTIVE.performedManeuvers.has(m.id);
                    const locked = m.requiresManeuver && !OSCE_ACTIVE.performedManeuvers.has(m.requiresManeuver);
                    return `<button type="button"
                      class="osce-maneuver-btn ${done ? 'done' : ''}"
                      data-maneuver="${esc(m.id)}"
                      style="min-height:44px;${m.isFatalError ? 'border-color:var(--red-b);' : ''}">
                      <span style="flex:1;padding-right:.6rem">
                        ${esc(m.label)}
                        ${locked ? `<span style="display:flex;align-items:center;gap:.3rem;font-size:.75rem;color:var(--amber-d);font-weight:600;margin-top:.15rem">${ico('info')} Najpierw zweryfikuj warunek bezpieczeństwa (USG lokalizacji łożyska)!</span>` : ''}
                      </span>
                      <span class="chip" style="border:0;font-size:.74rem;font-weight:800;${done ? 'background:var(--green-l);color:var(--green)' : (m.isFatalError ? 'background:var(--red-l);color:var(--red)' : 'background:var(--teal-l);color:var(--teal-d)')}">
                        ${done ? '✓ Wykonano' : (m.isFatalError ? `${ico('alert')} Ryzyko!` : 'Wykonaj')}
                      </span>
                    </button>`;
                  }).join('')}
                </div>

                ${latestFinding ? `
                  <div class="osce-finding-alert" aria-live="polite">
                    <div style="font-size:.74rem;font-weight:800;text-transform:uppercase;color:var(--teal-d);margin-bottom:.25rem">Ostatnie znalezisko (${esc(latestFinding.zone)}):</div>
                    <div>${esc(latestFinding.text)}</div>
                  </div>
                ` : `
                  <div class="osce-context-card" style="margin-top:.8rem">
                    <span class="srcline">Wybierz manewr powyżej, aby zbadać pacjentkę i zapisać wynik w karcie badania.</span>
                  </div>
                `}
              </div>
            ` : ''}

            ${OSCE_ACTIVE.activeTab === 'interview' ? `
              <div class="card" style="padding:1.15rem 1.25rem">
                <div class="eyebrow">Wywiad ukierunkowany z pacjentką</div>
                <h3 style="margin:.2rem 0 .75rem 0;font-size:1.12rem">Zadaj kluczowe pytania położniczo-ginekologiczne</h3>
                <div style="display:flex;flex-direction:column;gap:.65rem">
                  ${(station.interview || []).map((item, idx) => {
                    const asked = OSCE_ACTIVE.performedQuestions.has(idx);
                    return `<div style="border:1px solid ${asked ? 'var(--green)' : 'var(--line)'};border-radius:10px;padding:.75rem .9rem;background:${asked ? 'var(--bg)' : 'var(--surface)'}">
                      <button type="button" data-qidx="${idx}" style="width:100%;text-align:left;background:none;border:0;padding:0;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:.6rem;color:var(--ink);font-weight:700;font-size:.92rem;min-height:44px">
                        <span>„${esc(item.q)}”</span>
                        <span class="chip" style="border:0;flex-shrink:0;${asked ? 'background:var(--green-l);color:var(--green)' : 'background:var(--teal-l);color:var(--teal-d)'}">${asked ? '✓ Zapytano' : 'Zapytaj'}</span>
                      </button>
                      ${asked ? `<div style="margin-top:.55rem;padding-top:.55rem;border-top:1px solid var(--line-2);font-size:.88rem;line-height:1.48;color:var(--ink-2)"><b>Odpowiedź pacjentki:</b> ${esc(item.a)}</div>` : ''}
                    </div>`;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            ${OSCE_ACTIVE.activeTab === 'log' ? `
              <div class="card" style="padding:1.15rem 1.25rem">
                <div class="eyebrow">Dziennik badania fizykalnego</div>
                <h3 style="margin:.2rem 0 .75rem 0;font-size:1.12rem">Zebrane znaleziska (${OSCE_ACTIVE.findings.length})</h3>
                ${OSCE_ACTIVE.findings.length ? `
                  <div style="display:flex;flex-direction:column;gap:.55rem">
                    ${OSCE_ACTIVE.findings.map(f => `
                      <div style="padding:.7rem .85rem;border-radius:8px;background:var(--bg);border-left:3px solid ${f.isError ? 'var(--red)' : 'var(--teal)'}">
                        <div style="font-size:.76rem;font-weight:800;color:${f.isError ? 'var(--red)' : 'var(--teal-d)'}">${esc(f.zone)} · ${esc(f.label)}</div>
                        <div style="font-size:.86rem;margin-top:.2rem;line-height:1.42">${esc(f.text)}</div>
                      </div>
                    `).join('')}
                  </div>
                ` : `<p class="srcline">Nie wykonano jeszcze żadnych manewrów. Kliknij strefę na sylwetce i rozpocznij badanie.</p>`}
              </div>
            ` : ''}
          </div>
        </div>
      </div></section>`;

      // Obsługa kliknięć stref (zarówno hotspoty jak i regiony SVG)
      $$('[data-zone-btn], [data-zone-id]').forEach(el => {
        el.onclick = () => {
          const zid = el.dataset.zoneBtn || el.dataset.zoneId;
          if (!zid) return;
          OSCE_ACTIVE.selectedZone = zid;
          OSCE_ACTIVE.activeTab = 'maneuvers';
          renderActiveOsceStation(station, `[data-zone-btn="${escAttr(zid)}"]`);
        };
      });

      // Zakładki prawego panelu
      $$('[data-otab]').forEach(btn => {
        btn.onclick = () => {
          OSCE_ACTIVE.activeTab = btn.dataset.otab;
          renderActiveOsceStation(station);
        };
      });

      // Manewry
      $$('[data-maneuver]').forEach(btn => {
        btn.onclick = () => {
          const mid = btn.dataset.maneuver;
          const maneuver = (selectedZoneObj.maneuvers || []).find(m => m.id === mid);
          if (maneuver) performOsceManeuver(station, selectedZoneObj, maneuver);
        };
      });

      // Pytania wywiadu
      $$('[data-qidx]').forEach(btn => {
        btn.onclick = () => {
          const idx = Number(btn.dataset.qidx);
          OSCE_ACTIVE.performedQuestions.add(idx);
          renderActiveOsceStation(station);
        };
      });

      // Stabilizacja po kryzysie
      const btnStab = $('#btnStabilizeOsce');
      if (btnStab) {
        btnStab.onclick = () => {
          OSCE_ACTIVE.isComplication = false;
          OSCE_ACTIVE.complicationMessage = '';
          OSCE_ACTIVE.reaction = 'normal';
          OSCE_ACTIVE.currentVitals = { ...(station.patient.vitalsInitial || {}) };
          toast('Pacjentka ustabilizowana — parametry wróciły do wyjściowych');
          const fallback = selectedZoneObj ? `[data-zone-btn="${escAttr(selectedZoneObj.id)}"]` : '#btnFinishOsce';
          renderActiveOsceStation(station, fallback);
        };
      }

      // Przejście do syntezy diagnostycznej
      const btnFin = $('#btnFinishOsce');
      if (btnFin) {
        btnFin.onclick = () => {
          OSCE_ACTIVE.isSynthesis = true;
          renderOsceSynthesisAndReport(station);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };
      }

      restoreFocus(prevFocus, focusFallbackSel);
    }

    function performOsceManeuver(station, zone, maneuver) {
      if (maneuver.requiresManeuver && !OSCE_ACTIVE.performedManeuvers.has(maneuver.requiresManeuver)) {
        toast('Najpierw zweryfikuj położenie łożyska w USG (strefa „USG lokalizacji łożyska”)!');
        return;
      }

      OSCE_ACTIVE.performedManeuvers.add(maneuver.id);
      OSCE_ACTIVE.reaction = maneuver.reaction || 'normal';

      if (maneuver.isFatalError) {
        OSCE_ACTIVE.fatalErrorsTriggered++;
        OSCE_ACTIVE.isComplication = true;
        OSCE_ACTIVE.complicationMessage = maneuver.complicationText || maneuver.finding;
        if (maneuver.complicationVitals) {
          Object.assign(OSCE_ACTIVE.currentVitals, maneuver.complicationVitals);
        } else if (maneuver.vitalsDelta) {
          const v = OSCE_ACTIVE.currentVitals;
          const d = maneuver.vitalsDelta;
          if (typeof d.hr === 'number') v.hr = Math.min(180, v.hr + d.hr);
          if (typeof d.rr === 'number') v.rr = Math.min(40, v.rr + d.rr);
          if (typeof d.fhr === 'number' && v.fhr != null) v.fhr = Math.max(60, v.fhr + d.fhr);
          if (d.bp) v.bp = d.bp;
        }
        toast('Błąd krytyczny! Sprawdź alert powikłania!');
      }

      if (!OSCE_ACTIVE.findings.some(f => f.id === maneuver.id)) {
        OSCE_ACTIVE.findings.unshift({
          id: maneuver.id,
          zone: zone.name,
          label: maneuver.label,
          text: maneuver.finding,
          isError: Boolean(maneuver.isFatalError)
        });
      }

      renderActiveOsceStation(station);
    }

    /* ---------- DYNAMICZNY (UCZCIWY) RAPORT STATUS PRAESENS ---------- */
    function buildStatusPraesens(station) {
      const ref = station.statusPraesens || { title: `Status Praesens — ${station.shortTitle}`, sections: [], conclusions: '' };
      const perf = OSCE_ACTIVE ? OSCE_ACTIVE.performedManeuvers : new Set();
      const askedSet = OSCE_ACTIVE ? OSCE_ACTIVE.performedQuestions : new Set();
      const interview = station.interview || [];
      const zones = station.zones || [];

      const askedItems = [];
      const missedQuestions = [];
      interview.forEach((item, idx) => {
        if (askedSet.has(idx)) askedItems.push(item);
        else missedQuestions.push(item.q);
      });

      const missedManeuvers = [];
      const triggeredFatal = [];
      const sections = [];
      let secNum = 1;

      // 1. Wywiad (faktycznie zebrany vs pominięty)
      let interviewContent = '';
      if (askedItems.length) {
        interviewContent = askedItems.map(it => `${it.a}`).join(' ');
        if (missedQuestions.length) {
          interviewContent += ` [Pominięte pytania wywiadu (${missedQuestions.length}/${interview.length}): ${missedQuestions.join('; ')}]`;
        }
      } else {
        interviewContent = `Nie zebrano wywiadu z pacjentką — pominięto wszystkie pytania (${interview.length}/${interview.length}).`;
      }
      sections.push({
        num: secNum++,
        title: `Wywiad ukierunkowany (${askedItems.length}/${interview.length})`,
        content: interviewContent,
        status: missedQuestions.length === 0 ? 'done' : (askedItems.length > 0 ? 'partial' : 'missed')
      });

      // 2..N. Każda strefa badania (tylko faktycznie wykonane manewry + jawne oznaczenie pominiętych i błędów krytycznych)
      zones.forEach(z => {
        const keyM = (z.maneuvers || []).filter(m => m.isKey);
        const fatalM = (z.maneuvers || []).filter(m => m.isFatalError);
        const doneKey = keyM.filter(m => perf.has(m.id));
        const skippedKey = keyM.filter(m => !perf.has(m.id));
        const doneFatal = fatalM.filter(m => perf.has(m.id));

        skippedKey.forEach(m => missedManeuvers.push({ zone: z.name, label: m.label }));
        doneFatal.forEach(m => triggeredFatal.push({ zone: z.name, label: m.label, detail: m.complicationText || m.finding }));

        const parts = [];
        if (doneKey.length) {
          parts.push(doneKey.map(m => m.finding).join(' '));
        }
        if (skippedKey.length) {
          const prefix = doneKey.length ? 'Pominięto dodatkowo w tej strefie: ' : 'Nie wykonano badania w tej strefie (pominięto): ';
          parts.push(`${prefix}${skippedKey.map(m => m.label).join('; ')}.`);
        }
        if (doneFatal.length) {
          parts.push(`BŁĄD KRYTYCZNY: ${doneFatal.map(m => `${m.label} — ${m.complicationText || m.finding}`).join(' ')}`);
        }

        let status = 'done';
        if (doneFatal.length) status = 'error';
        else if (!doneKey.length && skippedKey.length) status = 'missed';
        else if (skippedKey.length) status = 'partial';

        sections.push({
          num: secNum++,
          title: z.name,
          content: parts.join(' '),
          status
        });
      });

      const syn = station.synthesis || { diagnoses: [], actions: [] };
      const chosenDiag = syn.diagnoses.find(d => d.id === OSCE_ACTIVE.synthesisDiagnosis);
      const correctDiag = syn.diagnoses.find(d => d.correct);
      const missedActions = syn.actions.filter(a => a.correct && !OSCE_ACTIVE.synthesisActions.has(a.id));
      const wrongActions = syn.actions.filter(a => !a.correct && OSCE_ACTIVE.synthesisActions.has(a.id));

      const isComplete = missedManeuvers.length === 0 && missedQuestions.length === 0 && triggeredFatal.length === 0;

      return {
        title: ref.title,
        sections,
        missedManeuvers,
        missedQuestions,
        triggeredFatal,
        chosenDiag,
        correctDiag,
        missedActions,
        wrongActions,
        isComplete,
        refConclusions: ref.conclusions || '',
        refSections: ref.sections || []
      };
    }

    /* ---------- SYNTEZA DIAGNOSTYCZNA I STATUS PRAESENS ---------- */
    function renderOsceSynthesisAndReport(station) {
      const prevFocus = captureFocusSelector();
      const prog = computeLiveProgress(station);
      const syn = station.synthesis || { diagnosisPrompt: 'Wybierz rozpoznanie:', diagnoses: [], actions: [] };

      if (!OSCE_ACTIVE.isFinished) {
        main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:900px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.1rem;flex-wrap:wrap;gap:.5rem">
            <button type="button" class="btn sec sm" id="btnBackToExam">← Wróć do badania pacjentki</button>
            <span class="chip">Wykonane manewry kluczowe: ${prog.doneKey}/${prog.totalKey}</span>
          </div>

          <div class="card" style="padding:1.4rem">
            <div class="eyebrow">Etap końcowy OSCE · Synteza diagnostyczna</div>
            <h1 style="margin:.25rem 0 .8rem 0;font-size:1.35rem">${esc(station.shortTitle)} — rozpoznanie i zalecenia</h1>

            <div style="margin-bottom:1.3rem">
              <b style="display:block;margin-bottom:.55rem;font-size:.98rem">1. ${esc(syn.diagnosisPrompt)}</b>
              <div class="action-grid">
                ${syn.diagnoses.map(d => {
                  const sel = OSCE_ACTIVE.synthesisDiagnosis === d.id;
                  return `<label class="sim-action-card ${sel ? 'selected' : ''}" data-sdiag="${esc(d.id)}">
                    <input type="radio" name="osceDiag" value="${esc(d.id)}" ${sel ? 'checked' : ''} style="margin-top:.2rem">
                    <span style="font-weight:600;font-size:.94rem">${esc(d.text)}</span>
                  </label>`;
                }).join('')}
              </div>
            </div>

            <div style="margin-bottom:1.3rem">
              <b style="display:block;margin-bottom:.55rem;font-size:.98rem">2. Zaznacz prawidłowe dalsze postępowanie:</b>
              <div class="action-grid">
                ${syn.actions.map(a => {
                  const sel = OSCE_ACTIVE.synthesisActions.has(a.id);
                  return `<label class="sim-action-card ${sel ? 'selected' : ''}" data-sact="${esc(a.id)}">
                    <input type="checkbox" name="osceAct" value="${esc(a.id)}" ${sel ? 'checked' : ''}>
                    <span style="font-weight:600;font-size:.94rem">${esc(a.text)}</span>
                  </label>`;
                }).join('')}
              </div>
            </div>

            <div style="display:flex;justify-content:flex-end">
              <button type="button" class="btn pri" id="btnSubmitSynthesis" style="padding:.75rem 1.5rem">Zatwierdź i wygeneruj Status Praesens →</button>
            </div>
          </div>
        </div></section>`;

        $('#btnBackToExam').onclick = () => {
          OSCE_ACTIVE.isSynthesis = false;
          renderActiveOsceStation(station);
        };

        $$('input[name="osceDiag"]').forEach(radio => {
          radio.onchange = () => {
            OSCE_ACTIVE.synthesisDiagnosis = radio.value;
            $$('[data-sdiag]').forEach(card => {
              card.classList.toggle('selected', card.dataset.sdiag === radio.value);
            });
          };
        });

        $$('input[name="osceAct"]').forEach(cb => {
          cb.onchange = () => {
            const aid = cb.value;
            if (cb.checked) OSCE_ACTIVE.synthesisActions.add(aid);
            else OSCE_ACTIVE.synthesisActions.delete(aid);
            const card = cb.closest('[data-sact]');
            if (card) card.classList.toggle('selected', cb.checked);
          };
        });

        $('#btnSubmitSynthesis').onclick = () => {
          if (!OSCE_ACTIVE.synthesisDiagnosis) {
            toast('Wybierz rozpoznanie wstępne przed zakończeniem stacji');
            return;
          }
          const diagObj = syn.diagnoses.find(d => d.id === OSCE_ACTIVE.synthesisDiagnosis);
          const diagPts = (diagObj && diagObj.correct) ? 15 : 0;

          const correctActs = syn.actions.filter(a => a.correct);
          let actHits = 0;
          let actWrongs = 0;
          syn.actions.forEach(a => {
            const chosen = OSCE_ACTIVE.synthesisActions.has(a.id);
            if (a.correct && chosen) actHits++;
            if (!a.correct && chosen) actWrongs++;
          });
          const actPts = Math.max(0, Math.round((actHits / Math.max(1, correctActs.length)) * 10) - actWrongs * 5);

          const examPts = Math.round((prog.doneKey / Math.max(1, prog.totalKey)) * 60);
          const interviewPts = Math.round((prog.doneQ / Math.max(1, prog.totalQ)) * 15);
          const penalty = OSCE_ACTIVE.fatalErrorsTriggered * 25;
          const finalPct = Math.max(0, Math.min(100, examPts + interviewPts + diagPts + actPts - penalty));

          OSCE_ACTIVE.score = finalPct;
          OSCE_ACTIVE.isFinished = true;

          // Zapis postępu w ctx.S.osceCases[stationId]
          ctx.S.osceCases = ctx.S.osceCases || {};
          const prev = ctx.S.osceCases[station.id];
          const best = prev ? Math.max(prev.bestScore != null ? prev.bestScore : (prev.score || 0), finalPct) : finalPct;
          ctx.S.osceCases[station.id] = {
            score: finalPct,
            bestScore: best,
            doneAt: Date.now(),
            passed: finalPct >= 60,
            maneuversDone: prog.doneKey,
            maneuversTotal: prog.totalKey
          };
          save();

          toast(finalPct >= 60 ? `Stacja OSCE zaliczona: ${finalPct}%` : `Wynik ${finalPct}% — przeanalizuj Status Praesens i powtórz`);
          renderOsceSynthesisAndReport(station);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        restoreFocus(prevFocus);
        return;
      }

      // EKRAN KOŃCOWY + UCZCIWIE WYGENEROWANY STATUS PRAESENS
      const finalPct = OSCE_ACTIVE.score || 0;
      const passed = finalPct >= 60;
      const report = buildStatusPraesens(station);
      const diagObj = report.chosenDiag;

      main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:920px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;flex-wrap:wrap;gap:.5rem">
          <a class="btn sec sm" href="#/pacjent/osce">← Wszystkie stacje OSCE</a>
          <span class="chip" style="font-weight:700">Stacja ${esc(station.number || '')} · ${esc(station.shortTitle)}</span>
        </div>

        <div class="card" style="text-align:center;padding:1.9rem 1.3rem;border-top:4px solid ${passed ? 'var(--green)' : 'var(--red)'}">
          <div style="display:inline-flex;align-items:center;justify-content:center;color:${passed ? 'var(--green)' : 'var(--red)'};margin-bottom:.45rem" aria-hidden="true">${ico(passed ? 'check' : 'alert', 38)}</div>
          <h1 style="margin:0 0 .35rem 0;font-size:1.7rem;font-family:var(--font-display)">Wynik stacji OSCE: ${finalPct}%</h1>
          <b style="color:${passed ? 'var(--green)' : 'var(--red)'}">${passed ? 'Stacja zaliczona' : 'Wymaga powtórzenia'}</b>
          <div style="display:flex;justify-content:center;gap:.6rem;flex-wrap:wrap;margin-top:.9rem">
            <span class="chip">Manewry kluczowe: ${prog.doneKey}/${prog.totalKey}</span>
            <span class="chip">Wywiad: ${prog.doneQ}/${prog.totalQ}</span>
            <span class="chip">Rozpoznanie: ${diagObj && diagObj.correct ? '✓ Trafne' : '✗ Błędne'}</span>
            <span class="chip" style="${OSCE_ACTIVE.fatalErrorsTriggered ? 'background:var(--red-l);color:var(--red);border:0;font-weight:700' : ''}">Błędy krytyczne: ${OSCE_ACTIVE.fatalErrorsTriggered}</span>
          </div>

          <div style="display:flex;gap:.75rem;justify-content:center;margin-top:1.4rem;flex-wrap:wrap">
            <button type="button" class="btn pri" id="btnCopyStatusPraesens">${ico('clipboard')} Zapisz Status Praesens do Notatnika</button>
            <button type="button" class="btn sec" id="btnRepeatOsce">${ico('refresh')} Powtórz stację</button>
            <a class="btn sec" href="#/pacjent/osce">${ico('clipboard')} Inna stacja</a>
          </div>
        </div>

        <div class="card" style="margin-top:1.35rem;padding:1.45rem">
          <div class="eyebrow">Wygenerowany raport badania przedmiotowego (na podstawie wykonanych kroków)</div>
          <h3 style="margin:.25rem 0 .8rem 0;font-size:1.25rem">${esc(report.title)}</h3>

          ${report.triggeredFatal.length ? `
            <div style="background:var(--red-l);border:1.5px solid var(--red);border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem">
              <b style="color:var(--red);display:flex;align-items:center;gap:.35rem;margin-bottom:.35rem">${ico('shield')} Popełnione błędy krytyczne (${report.triggeredFatal.length}):</b>
              <ul style="margin:0;padding-left:1.2rem;font-size:.88rem;line-height:1.45">
                ${report.triggeredFatal.map(f => `<li><b>${esc(f.zone)}:</b> ${esc(f.label)} — ${esc(f.detail)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${(report.missedManeuvers.length || report.missedQuestions.length) ? `
            <div style="background:var(--amber-l);border:1px solid var(--amber);border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem">
              <b style="color:var(--amber-d);display:flex;align-items:center;gap:.35rem;margin-bottom:.35rem">${ico('alert')} Pominięte elementy badania i wywiadu (nie mogą figurować jako wykonane):</b>
              ${report.missedManeuvers.length ? `
                <div style="font-size:.84rem;font-weight:700;margin-top:.25rem">Pominięte manewry kluczowe (${report.missedManeuvers.length}):</div>
                <ul style="margin:.2rem 0 .45rem 1.2rem;padding:0;font-size:.86rem;line-height:1.45">
                  ${report.missedManeuvers.map(m => `<li><b>${esc(m.zone)}:</b> ${esc(m.label)}</li>`).join('')}
                </ul>
              ` : ''}
              ${report.missedQuestions.length ? `
                <div style="font-size:.84rem;font-weight:700;margin-top:.25rem">Pominięte pytania wywiadu (${report.missedQuestions.length}):</div>
                <ul style="margin:.2rem 0 0 1.2rem;padding:0;font-size:.86rem;line-height:1.45">
                  ${report.missedQuestions.map(q => `<li>„${esc(q)}”</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          ` : `
            <div style="background:var(--green-l);border:1px solid var(--green);border-radius:10px;padding:.7rem .95rem;margin-bottom:1rem;font-size:.88rem;color:var(--green);font-weight:700;display:flex;align-items:center;gap:.4rem">
              ${ico('check')} Wykonano komplet kluczowych manewrów i pytań wywiadu bez błędów krytycznych.
            </div>
          `}

          <div class="status-praesens-box">
            ${report.sections.map(sec => {
              const badge = sec.status === 'error'
                ? `<span class="chip" style="background:var(--red-l);color:var(--red);border:0;font-size:.7rem;margin-left:.4rem">Błąd krytyczny</span>`
                : (sec.status === 'missed'
                  ? `<span class="chip" style="background:var(--amber-l);color:var(--amber-d);border:0;font-size:.7rem;margin-left:.4rem">Pominięto</span>`
                  : (sec.status === 'partial'
                    ? `<span class="chip" style="background:var(--amber-l);color:var(--amber-d);border:0;font-size:.7rem;margin-left:.4rem">Niepełne</span>`
                    : ''));
              return `<div class="status-praesens-section">
                <h4 style="display:flex;align-items:center;flex-wrap:wrap">${esc(sec.num)}. ${esc(sec.title)}${badge}</h4>
                <p style="margin:0;${sec.status === 'missed' ? 'color:var(--ink-muted);font-style:italic' : ''}">${esc(sec.content)}</p>
              </div>`;
            }).join('')}
          </div>

          <div class="tip" style="margin:0 0 1rem 0">
            <h4>Twoja synteza vs wzorcowe wnioski kliniczne</h4>
            <p style="margin:0 0 .45rem 0"><b>Wybrane rozpoznanie:</b> ${esc(diagObj ? diagObj.text : 'Nie wybrano')} (${diagObj && diagObj.correct ? 'trafne' : 'błędne'})</p>
            ${report.missedActions.length ? `<p style="margin:0 0 .45rem 0;color:var(--amber-d)"><b>Pominięte zalecenia:</b> ${esc(report.missedActions.map(a => a.text).join('; '))}</p>` : ''}
            ${report.wrongActions.length ? `<p style="margin:0 0 .45rem 0;color:var(--red)"><b>Błędnie zaznaczone zalecenia:</b> ${esc(report.wrongActions.map(a => a.text).join('; '))}</p>` : ''}
            <p style="margin:0"><b>Klucz egzaminacyjny OSCE:</b> ${esc(report.refConclusions)}</p>
          </div>

          ${(!report.isComplete && report.refSections.length) ? `
            <details style="background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:.75rem 1rem">
              <summary style="cursor:pointer;font-weight:700;font-size:.9rem;color:var(--teal-d);min-height:44px;display:flex;align-items:center">Porównaj z wzorcowym Status Praesens (pełny klucz OSCE)</summary>
              <div style="margin-top:.75rem;display:flex;flex-direction:column;gap:.65rem;font-size:.86rem;line-height:1.5">
                ${report.refSections.map(s => `<div><b>${esc(s.num)}. ${esc(s.title)}:</b> ${esc(s.content)}</div>`).join('')}
              </div>
            </details>
          ` : ''}
        </div>
      </div></section>`;

      const btnCopy = $('#btnCopyStatusPraesens');
      if (btnCopy) btnCopy.onclick = () => copyStatusPraesensToNotes(station, finalPct);

      const btnRepeat = $('#btnRepeatOsce');
      if (btnRepeat) {
        btnRepeat.onclick = () => {
          startOsceStation(station);
          renderActiveOsceStation(station);
        };
      }

      restoreFocus(prevFocus, '#btnCopyStatusPraesens');
    }

    function copyStatusPraesensToNotes(station, finalPct) {
      if (!station) return;
      const report = buildStatusPraesens(station);
      const prog = computeLiveProgress(station);
      const nowStr = new Date().toLocaleString('pl-PL');
      const gapsMd = [
        report.triggeredFatal.length
          ? `### Błędy krytyczne (${report.triggeredFatal.length})\n${report.triggeredFatal.map(f => `- **${f.zone}:** ${f.label} — ${f.detail}`).join('\n')}`
          : '',
        report.missedManeuvers.length
          ? `### Pominięte manewry kluczowe (${report.missedManeuvers.length})\n${report.missedManeuvers.map(m => `- **${m.zone}:** ${m.label}`).join('\n')}`
          : '',
        report.missedQuestions.length
          ? `### Pominięte pytania wywiadu (${report.missedQuestions.length})\n${report.missedQuestions.map(q => `- ${q}`).join('\n')}`
          : ''
      ].filter(Boolean).join('\n\n');

      const md = `# ${report.title}
**Data badania:** ${nowStr}
**Pacjentka:** ${station.patient.name} (${station.patient.gravida || station.patient.age})
**Tematyka:** ${station.topic}
**Wynik stacji OSCE:** ${finalPct}% (manewry kluczowe: ${prog.doneKey}/${prog.totalKey}, wywiad: ${prog.doneQ}/${prog.totalQ}, błędy krytyczne: ${OSCE_ACTIVE ? OSCE_ACTIVE.fatalErrorsTriggered : 0})

---
## Badanie przedmiotowe — przebieg faktyczny (Status Praesens)

${report.sections.map(s => `### ${s.num}. ${s.title}\n${s.content}`).join('\n\n')}
${gapsMd ? `\n---\n## Elementy pominięte i błędy krytyczne\n\n${gapsMd}\n` : ''}
---
### Synteza i wzorcowe wnioski kliniczne
- **Wybrane rozpoznanie:** ${report.chosenDiag ? report.chosenDiag.text : 'Nie wybrano'} (${report.chosenDiag && report.chosenDiag.correct ? 'trafne' : 'błędne'})
- **Wzorzec OSCE:** ${report.refConclusions}

---
*Wygenerowano w module OSCE · Ginekologia & Położnictwo V – Hub nauki*
`;
      try {
        const notes = getNotes();
        const validMod = (station.mods && station.mods.length ? normalizeModId(station.mods[0]) : null) || 'all';
        notes.unshift({
          id: 'osce_sp_' + Date.now(),
          title: `Status Praesens: ${station.shortTitle} (${finalPct}%)`,
          content: md,
          body: md,
          mod: validMod,
          updatedAt: Date.now(),
          updated: Date.now()
        });
        saveNotes(notes);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(md).catch(() => {});
        }
        toast('Zapisano Status Praesens do Notatnika i skopiowano do schowka!');
      } catch (err) {
        toast('Nie udało się zapisać notatki');
      }
    }

    function openStation(stationOrId) {
      const station = typeof stationOrId === 'string'
        ? getStations().find(s => s.id === stationOrId)
        : stationOrId;
      if (!station) {
        toast('Nie znaleziono stacji OSCE');
        renderOsceStationList();
        return;
      }
      if (!OSCE_ACTIVE || OSCE_ACTIVE.stationId !== station.id) {
        startOsceStation(station);
      }
      renderActiveOsceStation(station);
    }

    return {
      renderOsceStationList,
      openStation,
      renderOsceList: renderOsceStationList,
      renderOsceSession: openStation,
      getStations
    };
  };
})();
