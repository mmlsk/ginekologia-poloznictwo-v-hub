/* Ginekologia & Położnictwo V – moduł kliniczny: Kalkulatory położnicze, skale, dawki ratunkowe OB i trening zleceń */
(function () {
  'use strict';

  window.HUB_CLINICAL = window.HUB_CLINICAL || {};

  window.HUB_CLINICAL.calc = function (ctx) {
    const {
      $, $$, main, esc, norm, pct,
      calcNaegele, calcBishop, calcApgar, calcRmi,
      safeStorageSet, save, toast, getNotes, saveNotes
    } = ctx;

    const CALC_KEY = 'ginpol_hub_calc_v1';

    function isoDaysAgo(days) {
      const now = new Date();
      const utc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - days));
      const y = utc.getUTCFullYear();
      const m = String(utc.getUTCMonth() + 1).padStart(2, '0');
      const d = String(utc.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    function addDaysIso(iso, deltaDays) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
      if (!m) return '';
      const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + deltaDays));
      const yy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    }

    function formatPlDate(iso) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
      if (!m) return '—';
      return `${m[3]}.${m[2]}.${m[1]}`;
    }

    function fallbackCalcNaegele(lmpIso, cycleDays) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(lmpIso || ''));
      if (!m) return null;
      const lmp = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
      const cycle = Math.max(21, Math.min(45, Math.round(Number(cycleDays) || 28)));
      const shift = cycle - 28;
      const eddIso = addDaysIso(lmpIso, 280 + shift);
      const now = new Date();
      const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const totalDays = Math.max(0, Math.floor((today.getTime() - lmp.getTime()) / 86400000) - shift);
      const gaWeeks = Math.floor(totalDays / 7);
      const gaDays = totalDays % 7;
      const trimester = gaWeeks >= 28 ? 3 : (gaWeeks >= 14 ? 2 : 1);
      let termStatus = 'Przed terminem (<37+0 Hbd)';
      if (gaWeeks >= 42) termStatus = 'Ciąża po terminie (>=42+0 Hbd)';
      else if (gaWeeks >= 41) termStatus = 'Ciąża późna (41+0 – 41+6 Hbd)';
      else if (gaWeeks >= 39) termStatus = 'Pełny termin (39+0 – 40+6 Hbd)';
      else if (gaWeeks >= 37) termStatus = 'Wczesny termin (37+0 – 38+6 Hbd)';
      else if (gaWeeks < 22) termStatus = 'I / wczesny II trymestr';
      return { eddIso, cycleDays: cycle, shiftDays: shift, totalDays, gaWeeks, gaDays, gaLabel: `${gaWeeks}+${gaDays} Hbd`, trimester, termStatus };
    }

    function computeNaegele(lmpIso, cycleDays, todayIso) {
      if (typeof calcNaegele === 'function') return calcNaegele(lmpIso, cycleDays, todayIso);
      return fallbackCalcNaegele(lmpIso, cycleDays);
    }

    function computeBishop(b) {
      if (typeof calcBishop === 'function') return calcBishop(b);
      const s = (+b.dilation || 0) + (+b.effacement || 0) + (+b.station || 0) + (+b.consistency || 0) + (+b.position || 0);
      return {
        score: s,
        max: 13,
        favorable: s >= 6,
        level: s >= 8 ? 'high' : (s >= 6 ? 'mid' : 'low'),
        interpretation: s >= 8 ? 'Szyjka dojrzała (>=8 pkt).' : (s >= 6 ? 'Szyjka pośrednia (6–7 pkt).' : 'Szyjka niedojrzała (<=5 pkt).')
      };
    }

    function computeApgar(a) {
      if (typeof calcApgar === 'function') return calcApgar(a);
      const s = (+a.appearance || 0) + (+a.pulse || 0) + (+a.grimace || 0) + (+a.activity || 0) + (+a.respiration || 0);
      return {
        score: s,
        max: 10,
        level: s <= 3 ? 'crit' : (s <= 7 ? 'warn' : 'ok'),
        status: s <= 3 ? 'Zamartwica ciężka (0–3 pkt)' : (s <= 7 ? 'Stan średni (4–7 pkt)' : 'Stan dobry (8–10 pkt)')
      };
    }

    function computeRmi(r) {
      if (typeof calcRmi === 'function') return calcRmi(r);
      const U = r.ultrasoundFeatures === 0 ? 0 : (r.ultrasoundFeatures === 1 ? 1 : 3);
      const M = r.postmenopausal ? 3 : 1;
      const ca = Math.max(0, Number(r.ca125) || 0);
      const rmi = Math.round(U * M * ca * 10) / 10;
      return {
        U, M, ca125: ca, rmi,
        riskLevel: rmi >= 200 ? 'high' : (rmi >= 25 ? 'moderate' : 'low'),
        label: rmi >= 200 ? 'Wysokie ryzyko (>=200)' : (rmi >= 25 ? 'Pośrednie ryzyko (25–199)' : 'Niskie ryzyko (<25)')
      };
    }

    function saveNoteEntry(title, content, mod) {
      try {
        const notes = typeof getNotes === 'function' ? getNotes() : [];
        const note = {
          id: 'note_calc_' + Date.now(),
          title,
          content,
          mod: mod || 'all',
          updatedAt: Date.now()
        };
        notes.unshift(note);
        if (typeof saveNotes === 'function') saveNotes(notes);
        if (typeof save === 'function') save();
        if (typeof toast === 'function') toast('Zapisano wynik w Notatniku.');
      } catch (e) {
        if (typeof toast === 'function') toast('Nie udało się zapisać notatki.');
      }
    }

    /* ---------- Domyślne bazy (fallback gdy brak w HUB_META) ---------- */
    const DEFAULT_OB_DRUGS = [
      {
        id: 'mgso4',
        name: 'Siarczan magnezu (MgSO4)',
        category: 'nadcisnienie',
        categoryLabel: 'Nadciśnienie / Rzucawka',
        indication: 'Rzucawka (napad i profilaktyka), ciężki stan przedrzucawkowy z objawami prodromalnymi, neuroprotekcja płodu <32 Hbd.',
        dose: 'Bolus 4–6 g i.v. w 15–20 min, następnie wlew 1–2 g/h',
        route: 'i.v. (pompa infuzyjna)',
        regimen: 'Kontynuować min. 24 h po porodzie lub ostatnim napadzie drgawkowym. Przy niewydolności nerek zredukować wlew podtrzymujący i kontrolować stężenie Mg2+.',
        antidote: 'Glukonian wapnia 10%: 10 ml (1 g) powoli i.v. w ciągu 3 min (przy zaniku odruchów, oddechu <12/min lub zatrzymaniu oddechu).',
        warning: 'Monitoruj co godzinę: odruch rzepkowy (obecny), częstość oddechów (>=12/min), diurezę (>=25–30 ml/h), SpO2. Nie zastępuje leczenia hipotensyjnego!',
        notes: 'Stężenie terapeutyczne: 2,0–3,5 mmol/l (4,8–8,4 mg/dl). Przeciwwskazany w miastenii.'
      },
      {
        id: 'oxytocin',
        name: 'Oksytocyna',
        category: 'pph',
        categoryLabel: 'Krwotok (PPH)',
        indication: 'Profilaktyka i leczenie I rzutu krwotoku poporodowego (PPH) w przebiegu atonii macicy.',
        dose: '5 j.m. powoli i.v. + wlew 20–40 j.m. w 500–1000 ml NaCl 0,9%',
        route: 'i.v. powoli / wlew ciągły (lub 10 j.m. i.m. w profilaktyce)',
        regimen: 'W PPH wlew 125–250 ml/h (ok. 10 j.m./h) z równoczesnym masażem dna macicy. Aktywne prowadzenie III okresu: 5 j.m. i.v. lub 10 j.m. i.m.',
        antidote: 'Przerwanie wlewu (t1/2 ~3–5 min); objawowe leczenie hipotonii.',
        warning: 'Unikaj szybkiego bolusu >5 j.m. i.v. — ryzyko ciężkiej hipotonii, tachykardii i niedokrwienia mięśnia sercowego. Duże dawki w płynach hipotonicznych grożą zatruciem wodnym (działanie antydiuretyczne).',
        notes: 'Zawsze weryfikuj 4T: Tone (atonia), Trauma (uraz), Tissue (resztki), Thrombin (koagulopatia).'
      },
      {
        id: 'txa',
        name: 'Kwas traneksamowy (TXA)',
        category: 'pph',
        categoryLabel: 'Krwotok (PPH)',
        indication: 'Krwotok poporodowy (PPH) niezależnie od przyczyny — badanie WOMAN, zalecenia WHO/PTGiP.',
        dose: '1 g (10 ml roztworu 100 mg/ml) powoli i.v. w 10 min',
        route: 'i.v. (1 ml/min)',
        regimen: 'Podać jak najszybciej, najlepiej w ciągu 3 h od porodu. Powtórzyć dawkę 1 g i.v., jeśli krwawienie utrzymuje się po 30 min lub nawraca w ciągu 24 h.',
        antidote: 'Brak swoistego antidotum.',
        warning: 'Korzyść maleje o ~10% na każde 15 min opóźnienia; po >3 h od porodu nie zaleca się rutynowego podawania. Ostrożnie przy czynnej zakrzepicy.',
        notes: 'Lek antyfibrynolityczny — stosować równolegle z uterotonikami, nie zamiast nich.'
      },
      {
        id: 'carbetocin',
        name: 'Karbetocyna',
        category: 'pph',
        categoryLabel: 'Krwotok (PPH)',
        indication: 'Profilaktyka atonii macicy po cięciu cesarskim i u pacjentek z wysokim ryzykiem PPH.',
        dose: '100 mcg (1 ampułka) jednorazowo powoli i.v. (>1 min)',
        route: 'i.v. (wyłącznie dawka pojedyncza)',
        regimen: 'Podaje się po wydobyciu dziecka, najlepiej przed oddzieleniem łożyska. Działanie skurczowe utrzymuje się 1–2 h (dłużej niż oksytocyna).',
        antidote: 'Brak; leczenie objawowe.',
        warning: 'Przeciwwskazana przed urodzeniem dziecka (indukcja/stymulacja porodu!), w ciężkiej niewydolności wątroby/nerek oraz w ciężkich chorobach sercowo-naczyniowych.',
        notes: 'Syntetyczny długo działający analog oksytocyny; nie wymaga wlewu podtrzymującego.'
      },
      {
        id: 'misoprostol',
        name: 'Misoprostol (PGE1)',
        category: 'pph',
        categoryLabel: 'Krwotok (PPH)',
        indication: 'Leczenie II/III rzutu atonii macicy w PPH (szczególnie przy braku odpowiedzi na oksytocynę).',
        dose: '800–1000 mcg p.r. lub 600–800 mcg s.l.',
        route: 'doodbytniczo (p.r.) / podjęzykowo (s.l.)',
        regimen: 'Dawka jednorazowa w PPH; działa po ok. 15–20 min (s.l. szybciej niż p.r.).',
        antidote: 'Leczenie objawowe gorączki i dreszczy (paracetamol, chłodzenie).',
        warning: 'Często wywołuje wysoką gorączkę (>38,5°C) i dreszcze — różnicuj z sepsą! Przeciwwskazany do indukcji porodu żywego płodu w ciąży po przebytym cięciu cesarskim (ryzyko pęknięcia macicy).',
        notes: 'Stabilny w temperaturze pokojowej; nie wymaga chłodni.'
      },
      {
        id: 'labetalol',
        name: 'Labetalol',
        category: 'nadcisnienie',
        categoryLabel: 'Nadciśnienie / Rzucawka',
        indication: 'Ciężkie nadciśnienie w ciąży / przełom nadciśnieniowy (>=160/110 mmHg).',
        dose: '20 mg i.v. w 2 min -> 40 mg -> 80 mg -> 80 mg co 10–15 min',
        route: 'i.v. (lub wlew 1–2 mg/min)',
        regimen: 'Cel: obniżyć RR bezpiecznie do 140–150 / 90–100 mmHg (nie szybciej niż o 25% w 1. godzinie). Maks. dawka skumulowana 300 mg.',
        antidote: 'Atropina (bradykardia), glukagon i.v. przy ciężkim przedawkowaniu beta-blokera.',
        warning: 'Przeciwwskazany w astmie oskrzelowej, bloku AV II/III°, ciężkiej bradykardii (<60/min) i zdekompensowanej niewydolności serca.',
        notes: 'Doustnie lek I rzutu w przewlekłym leczeniu nadciśnienia w ciąży obok metyldopy i nifedypiny.'
      },
      {
        id: 'nifedipine',
        name: 'Nifedypina',
        category: 'nadcisnienie',
        categoryLabel: 'Nadciśnienie / Rzucawka',
        indication: 'Ciężkie nadciśnienie w ciąży (>=160/110 mmHg) oraz tokoliza w zagrażającym porodzie przedwczesnym.',
        dose: 'NT ciężkie: 10–20 mg p.o. co 20–30 min (maks. 50 mg/h) | Tokoliza: 10–20 mg p.o. -> 10–20 mg co 6–8 h',
        route: 'p.o. (wyłącznie doustnie — połykać)',
        regimen: 'W tokolizie zwykle do 48 h w celu dokończenia kursu glikokortykosteroidów i transferu in utero.',
        antidote: 'Chlorek/glukonian wapnia i.v. + płynoterapia przy ciężkiej hipotonii.',
        warning: 'NIGDY nie podawaj podjęzykowo (gwałtowny spadek RR i hipoperfuzja łożyska). Zachowaj ostrożność przy jednoczesnym wlewie MgSO4 (ryzyko blokady nerwowo-mięśniowej i hipotonii).',
        notes: 'Bloker kanałów wapniowych; nie stosować łącznie z beta-mimetykami.'
      },
      {
        id: 'atosiban',
        name: 'Atosyban',
        category: 'porod',
        categoryLabel: 'Poród przedwczesny',
        indication: 'Tokoliza w zagrażającym porodzie przedwczesnym (24+0 – 33+6 Hbd) przy regularnej czynności skurczowej i skracaniu szyjki.',
        dose: 'Bolus 6,75 mg i.v. (1 min) -> 18 mg/h (3 h) -> 6 mg/h (do 45 h)',
        route: 'i.v. (3-etapowy protokół pompowy)',
        regimen: 'Łączny czas leczenia do 48 h (maks. dawka 330,75 mg) — zysk czasu na betametazon i transfer do ośrodka III stopnia referencyjności.',
        antidote: 'Przerwanie wlewu.',
        warning: 'Przeciwwskazany przy chorioamnionitis, zagrażającej zamartwicy płodu, przedwczesnym oddzieleniu łożyska, ciężkim krwawieniu i obumarciu płodu.',
        notes: 'Antagonista receptora oksytocynowego; najlepszy profil bezpieczeństwa sercowo-naczyniowego matki.'
      },
      {
        id: 'betamethasone',
        name: 'Betametazon',
        category: 'porod',
        categoryLabel: 'Poród przedwczesny',
        indication: 'Prenatalna profilaktyka RDS, IVH i NEC u płodu zagrożonego porodem przedwczesnym (24+0 – 33+6 Hbd).',
        dose: '12 mg i.m. co 24 h (2 dawki, łącznie 24 mg)',
        route: 'i.m. głęboko',
        regimen: 'Pełny efekt po 24–48 h od 1. dawki; utrzymuje się ok. 7 dni. Alternatywa: deksametazon 6 mg i.m. co 12 h x 4 dawki.',
        antidote: 'Brak; kontroluj glikemię u ciężarnych z cukrzycą.',
        warning: 'Wywołuje przejściową leukocytozę matczyną (nie mylić z zakażeniem!) oraz hiperglikemię u pacjentek z GDM/PGDM przez 3–5 dni.',
        notes: 'Nie podawać rutynowych wielokrotnych kursów; dopuszczalny 1 kurs ratunkowy wg wytycznych.'
      },
      {
        id: 'antid',
        name: 'Immunoglobulina anty-D',
        category: 'profilaktyka',
        categoryLabel: 'Profilaktyka / Inne',
        indication: 'Profilaktyka immunizacji RhD u ciężarnych RhD-ujemnych bez przeciwciał anty-D.',
        dose: '300 mcg (1500 j.m.) i.m. (w I trymestrze min. 50–150 mcg)',
        route: 'i.m. (lub preparaty i.v. wg ChPL)',
        regimen: 'Rutynowo w 28–30 Hbd oraz do 72 h po porodzie dziecka RhD+, a także po poronieniu, ciąży ektopowej, amniopunkcji, urazie brzucha czy krwawieniu.',
        antidote: 'Brak.',
        warning: 'Przed podaniem zweryfikuj brak przeciwciał anty-D (pośredni test antyglobulinowy — PTA ujemny). Po podaniu PTA jest przejściowo dodatni (nie oznacza konfliktu!).',
        notes: 'Dawka 300 mcg neutralizuje do 30 ml pełnej krwi płodu (15 ml KKCz płodu); przy podejrzeniu masywnego krwotoku płodowo-matczynego wykonaj test Kleihauera-Betkego.'
      },
      {
        id: 'methotrexate',
        name: 'Metotreksat (MTX)',
        category: 'profilaktyka',
        categoryLabel: 'Profilaktyka / Inne',
        indication: 'Leczenie zachowawcze niepękniętej ciąży ektopowej (stabilna pacjentka, beta-hCG <5000 mIU/ml, brak FHR, pęcherzyk <3,5–4 cm).',
        dose: '50 mg/m2 pc. i.m. (protokół single-dose)',
        route: 'i.m. (po oznaczeniu morfologii, AST/ALT, kreatyniny, grupy krwi)',
        regimen: 'Kontrola beta-hCG w dobie 4. i 7. — oczekujemy spadku >=15% między dobą 4. a 7. (przejściowy wzrost w dobie 4. jest fizjologiczny).',
        antidote: 'Folinian wapnia (leukoworyna) przy toksyczności hematologicznej.',
        warning: 'Bezwzględnie przeciwwskazany przy niestabilności hemodynamicznej, podejrzeniu pęknięcia jajowodu, karmieniu piersią, niewydolności wątroby/nerek i leukopenii. Zakaz suplementacji kwasu foliowego i alkoholu w trakcie terapii.',
        notes: 'Zalecić antykoncepcję przez min. 3 miesiące po podaniu MTX; u RhD- podać anty-D.'
      }
    ];

    const DEFAULT_ORDER_CHALLENGES = [
      {
        id: 'ord-preeclampsia',
        title: 'Ciężki stan przedrzucawkowy (34+2 Hbd)',
        badge: 'Stany nagłe OB',
        vignette: '31-letnia pierwiastka w 34+2 Hbd zgłasza silny ból głowy, mroczki przed oczami i ból w nadbrzuszu. RR 172/114 mmHg (powtórzone po 15 min: 168/112 mmHg), białkomocz 2+, PLT 118 G/l. KTG: FHR 142 bpm, reaktywne. Wybierz właściwe zlecenia ratunkowe.',
        steps: [
          {
            prompt: 'Krok 1/3: Jakie leczenie przeciwdrgawkowe zlecasz w pierwszej kolejności?',
            opts: [
              'Siarczan magnezu (MgSO4) 4–6 g i.v. w 15–20 min, następnie wlew 1–2 g/h',
              'Diazepam 10 mg i.v. we wlewie ciągłym przez 24 h',
              'Fenytoina 15 mg/kg i.v. w dawce nasycającej',
              'Wstrzymanie leczenia przeciwdrgawkowego do wystąpienia napadu rzucawki'
            ],
            key: 0,
            why: 'MgSO4 jest lekiem z wyboru zarówno w leczeniu napadu rzucawki, jak i w profilaktyce u pacjentek z ciężkim stanem przedrzucawkowym i objawami prodromalnymi (ból głowy, zaburzenia widzenia, ból w nadbrzuszu).'
          },
          {
            prompt: 'Krok 2/3: Który lek hipotensyjny jest bezpiecznym wyborem I rzutu do obniżenia RR >=160/110 mmHg (pacjentka bez astmy)?',
            opts: [
              'Labetalol 20 mg i.v. w 2 min (eskalacja 40 -> 80 mg co 10–15 min) lub nifedypina 10–20 mg p.o.',
              'Kaptopryl 25 mg podjęzykowo',
              'Nifedypina 10 mg podjęzykowo (rozgryźć kapsułkę)',
              'Furosemid 40 mg i.v. w bolusie jako monoterapia'
            ],
            key: 0,
            why: 'ACEI (kaptopryl) są bezwzględnie przeciwwskazane w ciąży (fetotoksyczność), a nifedypina podjęzykowa grozi gwałtowną hipotonią i niedotlenieniem płodu. Labetalol i.v. lub nifedypina p.o. są standardem I rzutu.'
          },
          {
            prompt: 'Krok 3/3: Po 3 godzinach wlewu MgSO4 znikają odruchy rzepkowe, a częstość oddechów spada do 9/min. Co podajesz natychmiast po zatrzymaniu wlewu MgSO4?',
            opts: [
              'Glukonian wapnia 10% — 10 ml (1 g) powoli i.v. w 3 min',
              'Flumazenil 0,5 mg i.v.',
              'Nalokson 0,4 mg i.v.',
              'Siarczan protaminy 50 mg i.v.'
            ],
            key: 0,
            why: 'Glukonian wapnia 10% (1 g i.v.) jest fizjologicznym antagonistą magnezu i swoistym antidotum w toksyczności MgSO4.'
          }
        ]
      },
      {
        id: 'ord-pph',
        title: 'Krwotok poporodowy — atonia macicy',
        badge: 'PPH / Sala porodowa',
        vignette: 'Wieloródka po porodzie siłami natury dziecka o masie 4350 g. 15 min po urodzeniu kompletnego łożyska pojawia się masywne krwawienie z dróg rodnych (>800 ml), dno macicy miękkie powyżej pępka, RR 92/58 mmHg, HR 116/min. Kanał rodny bez pęknięć.',
        steps: [
          {
            prompt: 'Krok 1/3: Które połączenie działań i leków I rzutu wdrażasz równolegle z masażem macicy i resuscytacją płynową?',
            opts: [
              'Oksytocyna 5 j.m. wolno i.v. + wlew 20–40 j.m. oraz kwas traneksamowy (TXA) 1 g i.v. w 10 min',
              'Wyłącznie kwas traneksamowy p.o. i obserwacja przez 60 min',
              'Bolus 30 j.m. oksytocyny w szybkim wstrzyknięciu i.v. w 10 sekund',
              'Natychmiastowe podanie heparyny drobnocząsteczkowej'
            ],
            key: 0,
            why: 'W atonii macicy I rzutem jest masaż macicy + oksytocyna (powoli i.v. + wlew ciągły) oraz wczesne podanie TXA 1 g i.v. w ciągu 3 h od porodu (badanie WOMAN). Szybki bolus dużej dawki oksytocyny grozi zapaścią krążeniową.'
          },
          {
            prompt: 'Krok 2/3: Krwawienie utrzymuje się mimo oksytocyny i masażu. Pacjentka ma wywiad przewlekłego nadciśnienia tętniczego (aktualnie RR 148/96 mmHg). Który lek II rzutu jest PRZECIWWSKAZANY?',
            opts: [
              'Metyloergometryna (alkaloid sporyszu) — nasila skurcz naczyń i przełom nadciśnieniowy',
              'Misoprostol (PGE1) 800 mcg doodbytniczo',
              'Karboprost (PGF2alfa) u pacjentki bez astmy oskrzelowej',
              'Założenie balonu wewnątrzmacicznego (np. Bakriego)'
            ],
            key: 0,
            why: 'Metyloergometryna powoduje silny skurcz naczyń i jest przeciwwskazana w nadciśnieniu tętniczym oraz stanie przedrzucawkowym (podobnie karboprost jest przeciwwskazany w astmie).'
          },
          {
            prompt: 'Krok 3/3: Po 35 minutach krwawienie nadal przekracza 1500 ml, a fibrynogen wynosi 1,4 g/l. Co uzupełniasz?',
            opts: [
              'Drugą dawkę TXA 1 g i.v., koncentrat fibrynogenu (cel >=2,0 g/l) oraz protokół masywnej transfuzji (KKCz + FFP)',
              'Wyłącznie 4000 ml NaCl 0,9% bez preparatów krwiopochodnych',
              'Witaminę K doustnie i ponowną ocenę rano',
              'Odstawienie oksytocyny i podanie atosybanu'
            ],
            key: 0,
            why: 'W PPH stężenie fibrynogenu <2,0 g/l jest wczesnym predyktorem ciężkiego krwotoku i wymaga pilnego wyrównania (fibrynogen / krioprecypitat) wraz z KKCz/FFP i ewentualną drugą dawką TXA.'
          }
        ]
      },
      {
        id: 'ord-preterm',
        title: 'Zagrażający poród przedwczesny (29+4 Hbd)',
        badge: 'Patologia ciąży',
        vignette: '27-letnia ciężarna w 29+4 Hbd (ciąza pojedyncza, bez gorączki, CRP 3 mg/l, błony płodowe zachowane) zgłasza regularne skurcze co 5 min. W USG TVS długość szyjki macicy wynosi 14 mm z lejkowatym rozwarciem ujścia wewnętrznego. KTG prawidłowe.',
        steps: [
          {
            prompt: 'Krok 1/3: Jaką steroidoterapię prenatalną zlecasz w celu przyspieszenia dojrzewania płuc płodu?',
            opts: [
              'Betametazon 12 mg i.m. co 24 h (2 dawki, łącznie 24 mg)',
              'Hydrokortyzon 100 mg i.v. jednorazowo',
              'Prednizon 20 mg p.o. przez 14 dni',
              'Steroidoterapia nie jest wskazana przed 32 Hbd'
            ],
            key: 0,
            why: 'Betametazon 2 x 12 mg i.m. co 24 h (lub deksametazon 4 x 6 mg i.m. co 12 h) przechodzi przez łożysko i zmniejsza ryzyko RDS, IVH oraz NEC między 24+0 a 33+6 Hbd.'
          },
          {
            prompt: 'Krok 2/3: Który protokół tokolityczny wybierasz na max 48 h, aby umożliwić zadziałanie sterydów i transfer in utero?',
            opts: [
              'Atosyban i.v. (bolus 6,75 mg -> 18 mg/h przez 3 h -> 6 mg/h do 45 h) lub nifedypina p.o.',
              'Doustna tokoliza podtrzymująca salbutamolem do 37 Hbd',
              'Indometacyna przez 14 dni w 34 Hbd',
              'Oksytocyna w małych dawkach'
            ],
            key: 0,
            why: 'Tokolizę krótkoterminową (do 48 h) prowadzi się atosybanem lub nifedypiną p.o. Długotrwała tokoliza podtrzymująca nie poprawia wyników neonatologicznych.'
          },
          {
            prompt: 'Krok 3/3: Mimo leczenia po 12 h rozwarcie postępuje do 5 cm i poród przedwczesny (29+5 Hbd) staje się nieuchronny. Jaki lek podajesz w neuroprotekcji OUN płodu?',
            opts: [
              'Siarczan magnezu (MgSO4) i.v. (bolus 4 g -> wlew 1 g/h do porodu, max 24 h)',
              'Mannitol 20% i.v.',
              'Kwas walproinowy i.v.',
              'Nie ma wskazań do neuroprotekcji poniżej 32 Hbd'
            ],
            key: 0,
            why: 'MgSO4 podany matce przy nieuchronnym porodzie <32+0 Hbd istotnie zmniejsza ryzyko mózgowego porażenia dziecięcego (MPD) u wcześniaka.'
          }
        ]
      },
      {
        id: 'ord-gbs',
        title: 'Profilaktyka śródporodowa GBS+ i konflikt RhD',
        badge: 'Położnictwo',
        vignette: 'Ciężarna w 39+1 Hbd, grupa krwi A RhD-ujemny (PTA ujemny), dodatni posiew z pochwy i odbytu w kierunku GBS (36 Hbd), brak alergii na penicyliny. Zgłasza się z odpływaniem czystego płynu owodniowego i regularną czynnością skurczową.',
        steps: [
          {
            prompt: 'Krok 1/2: Jaki antybiotyk zlecasz śródporodowo w profilaktyce zakażenia noworodka GBS?',
            opts: [
              'Penicylina G 5 mln j. i.v., następnie 2,5–3 mln j. i.v. co 4 h do porodu (lub ampicylina 2 g -> 1 g co 4 h)',
              'Amoksycylina doustnie 500 mg co 8 h',
              'Azytromycyna 500 mg p.o. jednorazowo',
              'Antybiotyk dopiero po 24 h od odpłynięcia wód'
            ],
            key: 0,
            why: 'Lekiem I rzutu w śródporodowej profilaktyce GBS jest penicylina G i.v. (alternatywnie ampicylina i.v.), rozpoczęta natychmiast przy rozpoczęciu porodu lub PROM, aby uzyskać >=4 h ekspozycji przed urodzeniem.'
          },
          {
            prompt: 'Krok 2/2: Noworodek ma grupę krwi A RhD-dodatni. Co zlecasz położnicy po porodzie?',
            opts: [
              'Immunoglobulinę anty-D 300 mcg (1500 j.m.) i.m. w ciągu 72 h od porodu',
              'Nic, jeśli otrzymała dawkę w 28 Hbd',
              'Immunoglobulinę anty-D wyłącznie przy kolejnej ciąży',
              'Przetoczenie 1 j. KKCz RhD-'
            ],
            key: 0,
            why: 'Każda położnica RhD- bez przeciwciał anty-D, która urodziła dziecko RhD+, wymaga dawki poporodowej 300 mcg immunoglobuliny anty-D do 72 h, niezależnie od profilaktyki śródciążowej w 28–30 Hbd.'
          }
        ]
      }
    ];

    /* ---------- Stan kalkulatora ---------- */
    let CALC_STATE = {
      tab: 'wiek', // 'wiek' | 'skale' | 'nagle' | 'recepty'
      lmpIso: isoDaysAgo(168), // ~24+0 Hbd
      cycleDays: 28,
      crlMm: '',
      usgDateIso: isoDaysAgo(84), // np. 12 Hbd temu
      bishop: { dilation: 1, effacement: 1, station: 1, consistency: 1, position: 1 },
      apgar: { appearance: 2, pulse: 2, grimace: 2, activity: 2, respiration: 2 },
      rmi: { features: [false, false, false, false, false], postmenopausal: false, ca125: 28 },
      drugCat: 'all',
      drugSearch: '',
      recepty: {
        chalIdx: 0,
        chalStep: 0,
        chalAnswers: {},
        chalDone: []
      }
    };

    try {
      const savedRaw = localStorage.getItem(CALC_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && typeof parsed === 'object') {
          Object.assign(CALC_STATE, parsed);
          if (!CALC_STATE.bishop) CALC_STATE.bishop = { dilation: 1, effacement: 1, station: 1, consistency: 1, position: 1 };
          if (!CALC_STATE.apgar) CALC_STATE.apgar = { appearance: 2, pulse: 2, grimace: 2, activity: 2, respiration: 2 };
          if (!CALC_STATE.rmi || !Array.isArray(CALC_STATE.rmi.features)) {
            CALC_STATE.rmi = { features: [false, false, false, false, false], postmenopausal: false, ca125: 28 };
          }
          if (!CALC_STATE.recepty) CALC_STATE.recepty = { chalIdx: 0, chalStep: 0, chalAnswers: {}, chalDone: [] };
          if (!CALC_STATE.recepty.chalAnswers) CALC_STATE.recepty.chalAnswers = {};
          if (!Array.isArray(CALC_STATE.recepty.chalDone)) CALC_STATE.recepty.chalDone = [];
        }
      }
    } catch (e) { /* ignoruj uszkodzony stan */ }

    function saveCalcState() {
      if (typeof safeStorageSet === 'function') {
        safeStorageSet(CALC_KEY, JSON.stringify(CALC_STATE));
      } else {
        try { localStorage.setItem(CALC_KEY, JSON.stringify(CALC_STATE)); } catch (e) {}
      }
    }

    /* ---------- Normalizacja danych z HUB_META ---------- */
    function getDrugsList() {
      const meta = window.HUB_META;
      const raw = meta && Array.isArray(meta.OB_DRUG_DATABASE) && meta.OB_DRUG_DATABASE.length
        ? meta.OB_DRUG_DATABASE
        : DEFAULT_OB_DRUGS;
      return raw.map((d, idx) => ({
        id: d.id || ('ob-drug-' + idx),
        name: d.name || d.title || 'Lek położniczy',
        category: d.category || d.cat || 'inne',
        categoryLabel: d.categoryLabel || d.catLabel || d.category || d.cat || 'Protokół OB',
        indication: d.indication || d.ind || '',
        dose: d.dose || d.dosage || d.regimenShort || '',
        route: d.route || d.way || '',
        regimen: d.regimen || d.protocol || d.schedule || '',
        antidote: d.antidote || '',
        warning: d.warning || d.alert || d.contra || '',
        notes: d.notes || d.monitoring || d.pearl || ''
      }));
    }

    function getOrderChallenges() {
      const meta = window.HUB_META;
      const raw = meta && Array.isArray(meta.PRESCRIPTION_CHALLENGES) && meta.PRESCRIPTION_CHALLENGES.length
        ? meta.PRESCRIPTION_CHALLENGES
        : DEFAULT_ORDER_CHALLENGES;
      return raw.map((ch, idx) => {
        if (Array.isArray(ch.steps) && ch.steps.length) {
          return {
            id: ch.id || ('ord-' + idx),
            title: ch.title || ch.name || ('Przypadek ' + (idx + 1)),
            badge: ch.badge || ch.cat || 'Zlecenia OB/GYN',
            vignette: ch.vignette || ch.case || ch.desc || '',
            steps: ch.steps.map(st => ({
              prompt: st.prompt || st.question || st.q || '',
              opts: Array.isArray(st.opts) ? st.opts : (Array.isArray(st.options) ? st.options : []),
              key: typeof st.key === 'number' ? st.key : (typeof st.correct === 'number' ? st.correct : 0),
              why: st.why || st.explanation || st.rationale || ''
            }))
          };
        }
        return {
          id: ch.id || ('ord-' + idx),
          title: ch.title || ch.name || ('Przypadek ' + (idx + 1)),
          badge: ch.badge || ch.cat || 'Zlecenia OB/GYN',
          vignette: ch.vignette || ch.case || ch.desc || '',
          steps: [{
            prompt: ch.prompt || ch.question || ch.stem || 'Wybierz prawidłowe zlecenie kliniczne:',
            opts: Array.isArray(ch.opts) ? ch.opts : (Array.isArray(ch.options) ? ch.options : []),
            key: typeof ch.key === 'number' ? ch.key : (typeof ch.correct === 'number' ? ch.correct : 0),
            why: ch.why || ch.explanation || ''
          }]
        };
      });
    }

    /* ---------- Pomocnicze renderery zakładek ---------- */

    function renderWiekTab() {
      const res = computeNaegele(CALC_STATE.lmpIso, CALC_STATE.cycleDays);
      const todayIso = isoDaysAgo(0);
      const crlNum = Number(CALC_STATE.crlMm);
      const hasCrl = CALC_STATE.crlMm !== '' && Number.isFinite(crlNum) && crlNum >= 10 && crlNum <= 84;

      let crlHtml = '';
      if (hasCrl) {
        // Wzór Robinsona-Fleminga (1975): dni ciąży = 8.052 * sqrt(CRL * 1.037) + 23.73
        const crlDays = Math.round(8.052 * Math.sqrt(crlNum * 1.037) + 23.73);
        const crlW = Math.floor(crlDays / 7);
        const crlD = crlDays % 7;
        const refDate = /^(\d{4})-(\d{2})-(\d{2})$/.test(CALC_STATE.usgDateIso) ? CALC_STATE.usgDateIso : todayIso;
        const omAtUsg = computeNaegele(CALC_STATE.lmpIso, CALC_STATE.cycleDays, refDate);
        const diffDays = omAtUsg ? (crlDays - omAtUsg.totalDays) : 0;
        const absDiff = Math.abs(diffDays);
        const threshold = crlW < 9 ? 5 : 7; // ACOG / PTGiP: >5 dni (<9+0 Hbd), >7 dni (9+0 – 13+6 Hbd)
        const needsRedate = absDiff > threshold;
        const usgEddIso = addDaysIso(refDate, 280 - crlDays);

        crlHtml = `
          <div class="lab-verdict-banner" style="background:${needsRedate ? 'var(--amber-l)' : 'var(--green-l)'};border:1.5px solid ${needsRedate ? 'var(--amber)' : 'var(--green)'};margin-top:1rem">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem">
              <div class="lab-verdict-title" style="color:${needsRedate ? 'var(--amber-d)' : 'var(--green-d)'}">
                CRL ${esc(crlNum)} mm (Robinson) = ${crlW}+${crlD} Hbd (${crlDays} dni)
              </div>
              <span class="badge" style="background:var(--surface);border:1px solid var(--line);color:var(--ink)">
                Różnica vs OM w dniu USG: ${diffDays >= 0 ? '+' : ''}${diffDays} dni
              </span>
            </div>
            <div style="font-size:.9rem;color:var(--ink)">
              ${needsRedate
                ? `<strong>Korekta terminu porodu wg USG I trymestru (rozbieżność &gt;${threshold} dni):</strong> przyjmij TP z USG = <strong>${esc(formatPlDate(usgEddIso))}</strong> (${esc(usgEddIso)}). Zgodnie z PTGiP/ACOG dla CRL &lt;9+0 Hbd próg korekty wynosi &gt;5 dni, a dla 9+0–13+6 Hbd &gt;7 dni.`
                : `Rozbieżność mieści się w granicach tolerancji (&lt;=${threshold} dni dla ${crlW < 9 ? '&lt;9+0' : '9+0–13+6'} Hbd) — zachowaj termin porodu wyliczony z OM (${res ? esc(formatPlDate(res.eddIso)) : '—'}). Szacunkowy TP z samego CRL: ${esc(formatPlDate(usgEddIso))}.`
              }
            </div>
          </div>`;
      } else if (CALC_STATE.crlMm !== '') {
        crlHtml = `<div class="drug-alert" style="margin-top:.8rem">Podaj CRL w zakresie 10–84 mm (I trymestr, ok. 7+0 – 13+6 Hbd), aby obliczyć wiek wg Robinsona i ocenić wskazanie do korekty TP.</div>`;
      }

      const daysLeft = res ? Math.max(0, 280 - res.totalDays) : 0;
      const milestones = res ? [
        { lbl: 'USG genetyczne I trym. (11+0 – 13+6)', range: `${formatPlDate(addDaysIso(res.eddIso, -(280 - 77)))} – ${formatPlDate(addDaysIso(res.eddIso, -(280 - 97)))}` },
        { lbl: 'USG połówkowe II trym. (18+0 – 22+0)', range: `${formatPlDate(addDaysIso(res.eddIso, -(280 - 126)))} – ${formatPlDate(addDaysIso(res.eddIso, -(280 - 154)))}` },
        { lbl: 'Test OGTT 75g (24+0 – 28+0)', range: `${formatPlDate(addDaysIso(res.eddIso, -(280 - 168)))} – ${formatPlDate(addDaysIso(res.eddIso, -(280 - 196)))}` },
        { lbl: 'Profilaktyka anty-D RhD- (28–30 Hbd)', range: `${formatPlDate(addDaysIso(res.eddIso, -(280 - 196)))} – ${formatPlDate(addDaysIso(res.eddIso, -(280 - 210)))}` },
        { lbl: 'Posiew GBS (35+0 – 37+0)', range: `${formatPlDate(addDaysIso(res.eddIso, -(280 - 245)))} – ${formatPlDate(addDaysIso(res.eddIso, -(280 - 259)))}` }
      ] : [];

      return `
        <div class="calc-param-card">
          <div class="calc-param-grid">
            <div class="calc-field-group">
              <label for="calcLmpInput" style="font-size:.82rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)">Pierwszy dzień ostatniej miesiączki (OM)</label>
              <input id="calcLmpInput" type="date" value="${esc(CALC_STATE.lmpIso)}" style="padding:.6rem .8rem;border:1.5px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);font-weight:700;font-size:1rem">
              <div class="calc-quick-pills">
                <button type="button" class="calc-pill js-lmp-preset" data-days="84">12 Hbd</button>
                <button type="button" class="calc-pill js-lmp-preset" data-days="140">20 Hbd</button>
                <button type="button" class="calc-pill js-lmp-preset" data-days="168">24 Hbd</button>
                <button type="button" class="calc-pill js-lmp-preset" data-days="238">34 Hbd</button>
                <button type="button" class="calc-pill js-lmp-preset" data-days="273">39 Hbd</button>
              </div>
            </div>
            <div class="calc-field-group calc-field-divider">
              <label for="calcCycleSlider" style="font-size:.82rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)">Długość cyklu miesiączkowego</label>
              <div class="calc-val-display">
                <span class="calc-val-number" id="calcCycleVal">${esc(CALC_STATE.cycleDays)}</span>
                <span style="font-weight:700;color:var(--ink-2)">dni (korekta: ${CALC_STATE.cycleDays - 28 >= 0 ? '+' : ''}${CALC_STATE.cycleDays - 28} d)</span>
              </div>
              <input id="calcCycleSlider" class="calc-slider" type="range" min="21" max="45" step="1" value="${esc(CALC_STATE.cycleDays)}" aria-label="Długość cyklu w dniach">
              <div class="calc-quick-pills">
                ${[24, 26, 28, 30, 32, 35].map(d => `<button type="button" class="calc-pill js-cycle-pill ${CALC_STATE.cycleDays === d ? 'active' : ''}" data-cycle="${d}">${d} d</button>`).join('')}
              </div>
            </div>
          </div>
        </div>

        ${res ? `
        <div class="drug-grid">
          <div class="drug-card">
            <div class="drug-formula">Termin porodu (TP wg Naegelego)</div>
            <div class="drug-result-dose" style="font-size:1.75rem">${esc(formatPlDate(res.eddIso))}</div>
            <div class="drug-notes">ISO: ${esc(res.eddIso)} · Reguła: OM + 280 dni ${res.shiftDays !== 0 ? `(${res.shiftDays > 0 ? '+' : ''}${res.shiftDays} d za cykl ${res.cycleDays} d)` : '(cykl standardowy 28 d)'}.</div>
          </div>
          <div class="drug-card">
            <div class="drug-formula">Aktualny wiek ciążowy (dziś)</div>
            <div class="drug-result-dose" style="font-size:1.75rem">${esc(res.gaLabel)}</div>
            <div class="drug-notes">Trymestr ${res.trimester} · ${esc(res.termStatus)} · Pozostało ok. <strong>${daysLeft}</strong> dni do TP.</div>
          </div>
        </div>` : '<div class="drug-alert">Wprowadź poprawną datę OM (RRRR-MM-DD).</div>'}

        <div class="lab-calc-box">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.6rem;margin-bottom:.8rem">
            <div>
              <h3 style="margin:0">Weryfikacja USG I trymestru (CRL wg Robinsona)</h3>
              <p style="font-size:.86rem;color:var(--muted);margin-top:.2rem">Opcjonalnie wpisz pomiar CRL (10–84 mm) oraz datę badania USG, aby sprawdzić wskazanie do korekty TP (&gt;5–7 dni).</p>
            </div>
            ${CALC_STATE.crlMm !== '' ? `<button type="button" class="btn sec sm" id="btnClearCrl">Wyczyść CRL</button>` : ''}
          </div>
          <div class="lab-inputs-grid">
            <div class="lab-input-group">
              <label for="calcCrlInput">CRL (mm, zakres 10–84)</label>
              <input id="calcCrlInput" type="number" min="10" max="84" step="1" placeholder="np. 56" value="${esc(CALC_STATE.crlMm)}">
            </div>
            <div class="lab-input-group">
              <label for="calcUsgDateInput">Data badania USG I trym.</label>
              <input id="calcUsgDateInput" type="date" value="${esc(CALC_STATE.usgDateIso)}">
            </div>
          </div>
          <div class="calc-quick-pills">
            <span style="font-size:.78rem;color:var(--muted);align-self:center;margin-right:.2rem">Przykłady CRL:</span>
            <button type="button" class="calc-pill js-crl-preset" data-crl="23">23 mm (~9+0)</button>
            <button type="button" class="calc-pill js-crl-preset" data-crl="45">45 mm (~11+2)</button>
            <button type="button" class="calc-pill js-crl-preset" data-crl="60">60 mm (~12+3)</button>
            <button type="button" class="calc-pill js-crl-preset" data-crl="78">78 mm (~13+5)</button>
          </div>
          ${crlHtml}
        </div>

        ${milestones.length ? `
        <div class="scale-card">
          <div class="scale-header">
            <h3 style="margin:0">Okna kluczowych badań w tej ciąży (PTGiP / MZ)</h3>
            <button type="button" class="btn sec sm" id="btnCopyNaegele">Zapisz do notatek</button>
          </div>
          <div style="display:grid;gap:.45rem">
            ${milestones.map(ms => `
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;padding:.5rem .7rem;border-radius:8px;background:var(--bg);border:1px solid var(--line-2);font-size:.88rem">
                <span style="font-weight:700;color:var(--ink)">${esc(ms.lbl)}</span>
                <span style="font-weight:700;color:var(--teal-d);font-variant-numeric:tabular-nums">${esc(ms.range)}</span>
              </div>
            `).join('')}
          </div>
        </div>` : ''}
      `;
    }

    function renderSkaleTab() {
      const b = CALC_STATE.bishop;
      const bRes = computeBishop(b);
      const bColor = bRes.level === 'high' ? 'var(--green)' : (bRes.level === 'mid' ? 'var(--amber)' : 'var(--red)');
      const bBg = bRes.level === 'high' ? 'var(--green-l)' : (bRes.level === 'mid' ? 'var(--amber-l)' : 'var(--red-l)');

      const bishopRows = [
        { key: 'dilation', label: 'Rozwarcie szyjki', opts: ['0: zamknięta', '1: 1–2 cm', '2: 3–4 cm', '3: >=5 cm'] },
        { key: 'effacement', label: 'Skrócenie szyjki', opts: ['0: 0–30%', '1: 40–50%', '2: 60–70%', '3: >=80%'] },
        { key: 'station', label: 'Punkt prowadzący', opts: ['0: -3', '1: -2', '2: -1 / 0', '3: +1 / +2'] },
        { key: 'consistency', label: 'Konsystencja', opts: ['0: twarda', '1: średnia', '2: miękka'] },
        { key: 'position', label: 'Położenie szyjki', opts: ['0: ku tyłowi', '1: pośrednie', '2: w osi pochwy'] }
      ];

      const a = CALC_STATE.apgar;
      const aRes = computeApgar(a);
      const aColor = aRes.level === 'ok' ? 'var(--green)' : (aRes.level === 'warn' ? 'var(--amber)' : 'var(--red)');
      const aBg = aRes.level === 'ok' ? 'var(--green-l)' : (aRes.level === 'warn' ? 'var(--amber-l)' : 'var(--red-l)');

      const apgarRows = [
        { key: 'appearance', label: 'Zabarwienie skóry', opts: ['0: sinica / bladość całego ciała', '1: tułów różowy, kończyny sine', '2: całe ciało różowe'] },
        { key: 'pulse', label: 'Czynność serca (HR)', opts: ['0: brak', '1: <100/min', '2: >=100/min'] },
        { key: 'grimace', label: 'Reakcja na bodźce', opts: ['0: brak reakcji', '1: grymas twarzy', '2: kaszel, kichanie, głośny płacz'] },
        { key: 'activity', label: 'Napięcie mięśniowe', opts: ['0: wiotkość', '1: słabe zgięcie kończyn', '2: żywe ruchy czynne'] },
        { key: 'respiration', label: 'Oddech', opts: ['0: bezdech', '1: wolny, nieregularny', '2: regularny, głośny płacz'] }
      ];

      const r = CALC_STATE.rmi;
      const featCount = r.features.filter(Boolean).length;
      const rRes = computeRmi({ ultrasoundFeatures: featCount, postmenopausal: r.postmenopausal, ca125: r.ca125 });
      const rColor = rRes.riskLevel === 'low' ? 'var(--green)' : (rRes.riskLevel === 'moderate' ? 'var(--amber)' : 'var(--red)');
      const rBg = rRes.riskLevel === 'low' ? 'var(--green-l)' : (rRes.riskLevel === 'moderate' ? 'var(--amber-l)' : 'var(--red-l)');

      const rmiFeatLabels = [
        'Zmiana wielokomorowa (przegrody)',
        'Obecność pól litych / wyrośli brodawkowatych',
        'Zmiany obustronne w obu jajnikach',
        'Wodobrzusze (ascites)',
        'Cechy przerzutów w jamie brzusznej'
      ];

      return `
        <!-- SKALA BISHOPA -->
        <div class="scale-card">
          <div class="scale-header">
            <div>
              <h3 style="margin:0">Skala Bishopa (dojrzałość szyjki przed indukcją)</h3>
              <div style="font-size:.84rem;color:var(--muted)">Ocena przed indukcją porodu (0–13 pkt)</div>
            </div>
            <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
              <div class="scale-score-badge" style="color:${bColor};background:${bBg}">${bRes.score} / ${bRes.max} pkt</div>
              <button type="button" class="btn sec sm" id="btnCopyBishop">Zapisz do notatek</button>
            </div>
          </div>
          ${bishopRows.map(row => `
            <div class="scale-row">
              <div style="font-weight:700;font-size:.88rem;color:var(--ink)">${esc(row.label)}</div>
              <div class="scale-opt-group" role="group" aria-label="${esc(row.label)}">
                ${row.opts.map((opt, idx) => `
                  <button type="button" class="scale-opt-btn js-bishop-btn ${Number(b[row.key]) === idx ? 'active' : ''}" data-key="${row.key}" data-val="${idx}" aria-pressed="${Number(b[row.key]) === idx}">${esc(opt)}</button>
                `).join('')}
              </div>
            </div>
          `).join('')}
          <div class="lab-verdict-banner" style="background:${bBg};border:1.5px solid ${bColor}">
            <div style="font-weight:800;color:${bColor}">${bRes.favorable ? 'Szyjka sprzyjająca / pośrednia' : 'Szyjka niedojrzała — wskazana preindukcja'}</div>
            <div style="font-size:.9rem;color:var(--ink)">${esc(bRes.interpretation)}</div>
          </div>
        </div>

        <!-- SKALA APGAR -->
        <div class="scale-card">
          <div class="scale-header">
            <div>
              <h3 style="margin:0">Skala Apgar (ocena noworodka w 1. i 5. min)</h3>
              <div style="font-size:.84rem;color:var(--muted)">Nie opóźniaj rozpoczęcia resuscytacji NLS w oczekiwaniu na ocenę 1. minuty!</div>
            </div>
            <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
              <div class="scale-score-badge" style="color:${aColor};background:${aBg}">${aRes.score} / ${aRes.max} pkt</div>
              <button type="button" class="btn sec sm" id="btnCopyApgar">Zapisz do notatek</button>
            </div>
          </div>
          ${apgarRows.map(row => `
            <div class="scale-row">
              <div style="font-weight:700;font-size:.88rem;color:var(--ink)">${esc(row.label)}</div>
              <div class="scale-opt-group" role="group" aria-label="${esc(row.label)}">
                ${row.opts.map((opt, idx) => `
                  <button type="button" class="scale-opt-btn js-apgar-btn ${Number(a[row.key]) === idx ? 'active' : ''}" data-key="${row.key}" data-val="${idx}" aria-pressed="${Number(a[row.key]) === idx}">${esc(opt)}</button>
                `).join('')}
              </div>
            </div>
          `).join('')}
          <div class="lab-verdict-banner" style="background:${aBg};border:1.5px solid ${aColor}">
            <div style="font-weight:800;color:${aColor}">Wynik: ${aRes.score} pkt</div>
            <div style="font-size:.9rem;color:var(--ink)">${esc(aRes.status)}</div>
          </div>
        </div>

        <!-- WSKAŹNIK RMI I -->
        <div class="scale-card">
          <div class="scale-header">
            <div>
              <h3 style="margin:0">Wskaźnik RMI I (ocena ryzyka złośliwości guza jajnika)</h3>
              <div style="font-size:.84rem;color:var(--muted)">Wzór Jacobsa: RMI = U x M x CA-125 (próg wysokiego ryzyka &gt;=200)</div>
            </div>
            <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
              <div class="scale-score-badge" style="color:${rColor};background:${rBg}">RMI ${esc(rRes.rmi)}</div>
              <button type="button" class="btn sec sm" id="btnCopyRmi">Zapisz do notatek</button>
            </div>
          </div>

          <div class="scale-row">
            <div style="font-weight:700;font-size:.88rem;color:var(--ink)">Cechy USG (U = ${rRes.U})<div style="font-size:.76rem;color:var(--muted);font-weight:500">0 cech: U=0 | 1: U=1 | >=2: U=3</div></div>
            <div style="display:grid;gap:.4rem">
              ${rmiFeatLabels.map((lbl, idx) => `
                <label style="display:flex;align-items:center;gap:.55rem;font-size:.88rem;cursor:pointer;padding:.35rem .6rem;border-radius:8px;background:var(--bg);border:1px solid ${r.features[idx] ? 'var(--teal)' : 'var(--line-2)'}">
                  <input type="checkbox" class="js-rmi-feat" data-idx="${idx}" ${r.features[idx] ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--teal)">
                  <span>${esc(lbl)}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="scale-row">
            <div style="font-weight:700;font-size:.88rem;color:var(--ink)">Status menopauzalny (M = ${rRes.M})</div>
            <div class="scale-opt-group" role="group" aria-label="Status menopauzalny">
              <button type="button" class="scale-opt-btn js-rmi-meno ${!r.postmenopausal ? 'active' : ''}" data-post="0" aria-pressed="${!r.postmenopausal}">Przed menopauzą (M = 1)</button>
              <button type="button" class="scale-opt-btn js-rmi-meno ${r.postmenopausal ? 'active' : ''}" data-post="1" aria-pressed="${r.postmenopausal}">Po menopauzie (M = 3)</button>
            </div>
          </div>

          <div class="scale-row">
            <div style="font-weight:700;font-size:.88rem;color:var(--ink)">Stężenie CA-125 (U/ml)</div>
            <div>
              <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
                <input id="calcRmiCa125" type="number" min="0" max="50000" step="1" value="${esc(r.ca125)}" aria-label="CA-125 w U/ml" style="width:140px;padding:.5rem .7rem;border:1.5px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);font-weight:800;font-size:1rem">
                <div class="calc-quick-pills" style="margin-top:0">
                  ${[15, 35, 85, 220, 650].map(v => `<button type="button" class="calc-pill js-rmi-ca-preset" data-val="${v}">${v} U/ml</button>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="lab-verdict-banner" style="background:${rBg};border:1.5px solid ${rColor}">
            <div style="font-weight:800;color:${rColor}">RMI = ${rRes.U} x ${rRes.M} x ${esc(rRes.ca125)} = ${esc(rRes.rmi)}</div>
            <div style="font-size:.9rem;color:var(--ink)">${esc(rRes.label)}</div>
            <div style="font-size:.8rem;color:var(--muted)">Uwaga: w wieku rozrodczym CA-125 rośnie fałszywie dodatnio w endometriozie, mięśniakach, PID i w ciąży; do oceny USG preferuje się modele IOTA (Simple Rules / ADNEX).</div>
          </div>
        </div>
      `;
    }

    function renderNagleTab() {
      const drugs = getDrugsList();
      const catMap = new Map([['all', 'Wszystkie']]);
      drugs.forEach(d => {
        if (!catMap.has(d.category)) catMap.set(d.category, d.categoryLabel);
      });
      const q = typeof norm === 'function' ? norm(CALC_STATE.drugSearch) : String(CALC_STATE.drugSearch || '').toLowerCase();
      const filtered = drugs.filter(d => {
        if (CALC_STATE.drugCat !== 'all' && d.category !== CALC_STATE.drugCat) return false;
        if (!q) return true;
        const hay = [d.name, d.indication, d.dose, d.antidote, d.warning, d.notes].join(' ');
        return (typeof norm === 'function' ? norm(hay) : hay.toLowerCase()).includes(q);
      });

      return `
        <div class="calc-param-card" style="padding:1rem 1.2rem">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.8rem;margin-bottom:.75rem">
            <div class="imaging-filter-pills" role="tablist" aria-label="Filtr kategorii leków OB">
              ${Array.from(catMap.entries()).map(([k, lbl]) => `
                <button type="button" class="imaging-filter-btn js-drug-cat ${CALC_STATE.drugCat === k ? 'active' : ''}" data-cat="${esc(k)}">${esc(lbl)}</button>
              `).join('')}
            </div>
            <input id="calcDrugSearch" type="search" value="${esc(CALC_STATE.drugSearch)}" placeholder="Szukaj leku, antidotum, wskazania..." aria-label="Szukaj leku OB" style="min-width:220px;flex:1;max-width:320px;padding:.5rem .8rem;border:1.5px solid var(--line);border-radius:999px;background:var(--bg);color:var(--ink);font-size:.92rem">
          </div>
          <div style="font-size:.82rem;color:var(--muted)">Charakter edukacyjny (PTGiP / FIGO) — przed podaniem leku przy łóżku pacjentki zweryfikuj dawkę i przeciwwskazania z ChPL.</div>
        </div>

        ${filtered.length ? `
          <div class="drug-grid">
            ${filtered.map(d => `
              <article class="drug-card">
                <div class="drug-header">
                  <div>
                    <div class="drug-formula">${esc(d.categoryLabel)}</div>
                    <h3 class="drug-title" style="margin:.15rem 0 0">${esc(d.name)}</h3>
                  </div>
                  <button type="button" class="btn sec sm js-copy-drug" data-id="${esc(d.id)}" title="Zapisz kartę leku do notatek">Do notatek</button>
                </div>
                ${d.indication ? `<div class="drug-notes"><strong>Wskazania:</strong> ${esc(d.indication)}</div>` : ''}
                <div class="drug-result-box">
                  <div>
                    <div class="drug-formula">Dawkowanie</div>
                    <div style="font-weight:800;font-size:1.02rem;color:var(--teal-d);margin-top:.15rem">${esc(d.dose)}</div>
                    ${d.route ? `<div class="drug-formula" style="margin-top:.2rem">Droga: ${esc(d.route)}</div>` : ''}
                  </div>
                </div>
                ${d.regimen ? `<div class="drug-notes">${esc(d.regimen)}</div>` : ''}
                ${d.antidote ? `<div style="background:var(--green-l);border:1px solid var(--green);border-radius:8px;padding:.45rem .7rem;font-size:.82rem;color:var(--ink)"><strong>Antidotum / odwrócenie:</strong> ${esc(d.antidote)}</div>` : ''}
                ${d.warning ? `<div class="drug-alert">Uwaga kliniczna: ${esc(d.warning)}</div>` : ''}
                ${d.notes ? `<div class="drug-formula" style="color:var(--ink-2)">${esc(d.notes)}</div>` : ''}
              </article>
            `).join('')}
          </div>
        ` : `<div class="card"><p>Brak leków pasujących do filtra „${esc(CALC_STATE.drugSearch)}”.</p></div>`}
      `;
    }

    function renderReceptyTab() {
      const challenges = getOrderChallenges();
      const rState = CALC_STATE.recepty;
      const idx = Math.max(0, Math.min(challenges.length - 1, Number(rState.chalIdx) || 0));
      const ch = challenges[idx];
      const stepIdx = Math.max(0, Math.min(ch.steps.length - 1, Number(rState.chalStep) || 0));
      const step = ch.steps[stepIdx];
      const ansKey = `${ch.id}__${stepIdx}`;
      const chosen = rState.chalAnswers[ansKey];
      const answered = typeof chosen === 'number';
      const isCorrect = answered && chosen === step.key;
      const allStepsDone = ch.steps.every((_, sIdx) => typeof rState.chalAnswers[`${ch.id}__${sIdx}`] === 'number');
      const doneCount = challenges.filter(c => rState.chalDone.includes(c.id)).length;
      const donePct = typeof pct === 'function' ? pct(doneCount, challenges.length) : Math.round(100 * doneCount / Math.max(1, challenges.length));

      return `
        <div class="imaging-filter-bar" style="margin-bottom:.6rem">
          <div style="font-size:.88rem;font-weight:700;color:var(--ink-2)">
            Ukończono scenariuszy zleceń: <strong style="color:var(--teal-d)">${doneCount} / ${challenges.length}</strong> (${donePct}%)
          </div>
          <button type="button" class="btn sec sm" id="btnResetOrders">Resetuj postęp treningu</button>
        </div>

        <div class="imaging-case-carousel" role="tablist" aria-label="Lista przypadków zleceń">
          ${challenges.map((c, cIdx) => {
            const solved = rState.chalDone.includes(c.id);
            return `
              <button type="button" class="imaging-case-chip js-ord-chip ${cIdx === idx ? 'active' : ''} ${solved ? 'solved' : ''}" data-idx="${cIdx}">
                <div class="imaging-case-chip-head">
                  <span style="font-weight:700;color:var(--teal-d)">${esc(c.badge)}</span>
                  <span style="font-weight:800;color:${solved ? 'var(--green)' : 'var(--muted)'}">${solved ? 'Zaliczono' : `${c.steps.length} kroki`}</span>
                </div>
                <div class="imaging-case-chip-title">${esc(c.title)}</div>
              </button>
            `;
          }).join('')}
        </div>

        <div class="scale-card">
          <div class="scale-header">
            <div>
              <div class="drug-formula">${esc(ch.badge)} · Krok ${stepIdx + 1} z ${ch.steps.length}</div>
              <h3 style="margin:.15rem 0 0">${esc(ch.title)}</h3>
            </div>
            <div style="display:flex;gap:.35rem;flex-wrap:wrap">
              ${ch.steps.map((_, sIdx) => {
                const aVal = rState.chalAnswers[`${ch.id}__${sIdx}`];
                const ok = aVal === ch.steps[sIdx].key;
                const bad = typeof aVal === 'number' && !ok;
                return `<button type="button" class="calc-pill js-ord-step ${sIdx === stepIdx ? 'active' : ''}" data-step="${sIdx}" style="${ok ? 'border-color:var(--green)' : (bad ? 'border-color:var(--red)' : '')}">Krok ${sIdx + 1}</button>`;
              }).join('')}
            </div>
          </div>

          <div style="background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:.9rem 1rem;margin-bottom:1rem;font-size:.93rem;line-height:1.55;color:var(--ink)">
            <strong>Opis kliniczny:</strong> ${esc(ch.vignette)}
          </div>

          <div style="font-weight:800;font-size:1rem;margin-bottom:.75rem;color:var(--ink)">${esc(step.prompt)}</div>

          <div class="opts">
            ${step.opts.map((optText, oIdx) => {
              let cls = 'opt js-ord-opt';
              if (answered) {
                if (oIdx === step.key) cls += ' ok';
                else if (oIdx === chosen) cls += ' bad';
                else cls += ' dim';
              }
              return `
                <button type="button" class="${cls}" data-opt="${oIdx}" ${answered ? 'disabled' : ''}>
                  <span class="l">${String.fromCharCode(65 + oIdx)}</span>
                  <span>${esc(optText)}</span>
                </button>
              `;
            }).join('')}
          </div>

          ${answered ? `
            <div class="lab-verdict-banner" style="background:${isCorrect ? 'var(--green-l)' : 'var(--red-l)'};border:1.5px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}">
              <div style="font-weight:800;color:${isCorrect ? 'var(--green-d)' : 'var(--red-d)'}">
                ${isCorrect ? 'Prawidłowe zlecenie kliniczne' : 'Wymaga korekty — sprawdź uzasadnienie'}
              </div>
              <div style="font-size:.9rem;color:var(--ink)">${esc(step.why)}</div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.6rem;margin-top:1rem">
              <button type="button" class="btn sec sm" id="btnCopyOrderCase">Zapisz scenariusz do notatek</button>
              <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                ${stepIdx < ch.steps.length - 1
                  ? `<button type="button" class="btn pri sm" id="btnOrdNextStep">Następny krok</button>`
                  : (idx < challenges.length - 1
                    ? `<button type="button" class="btn pri sm" id="btnOrdNextCase">Następny przypadek</button>`
                    : (allStepsDone ? `<span style="font-size:.86rem;font-weight:700;color:var(--green)">Koniec zestawu</span>` : '')
                  )}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    function viewCalculator(parts, params) {
      if (params && params.tab && ['wiek', 'skale', 'nagle', 'recepty'].includes(params.tab)) {
        CALC_STATE.tab = params.tab;
      }
      if (params && params.lek) {
        CALC_STATE.tab = 'nagle';
        CALC_STATE.drugSearch = String(params.lek);
      }

      const render = () => {
        const tab = CALC_STATE.tab;
        let bodyHtml = '';
        if (tab === 'wiek') bodyHtml = renderWiekTab();
        else if (tab === 'skale') bodyHtml = renderSkaleTab();
        else if (tab === 'nagle') bodyHtml = renderNagleTab();
        else bodyHtml = renderReceptyTab();

        main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:980px">
          <div class="eyebrow">Narzędzia kliniczne OB/GYN</div>
          <h2>Kalkulatory położnicze, skale i dawki ratunkowe</h2>
          <p class="lead">Reguła Naegelego z weryfikacją CRL, skale Bishopa, Apgar i RMI, dawki ratunkowe PTGiP/FIGO (MgSO4, PPH, tokoliza, profilaktyka) oraz interaktywny trening zleceń klinicznych.</p>

          <div class="calc-tab-nav" id="calcTabNav" role="tablist" aria-label="Zakładki kalkulatora OB/GYN">
            <button type="button" role="tab" aria-selected="${tab === 'wiek'}" class="calc-tab-btn ${tab === 'wiek' ? 'active' : ''}" data-ctab="wiek">Wiek ciążowy i Naegele</button>
            <button type="button" role="tab" aria-selected="${tab === 'skale'}" class="calc-tab-btn ${tab === 'skale' ? 'active' : ''}" data-ctab="skale">Skale: Bishop, Apgar, RMI</button>
            <button type="button" role="tab" aria-selected="${tab === 'nagle'}" class="calc-tab-btn ${tab === 'nagle' ? 'active' : ''}" data-ctab="nagle">Dawki ratunkowe i protokoły OB</button>
            <button type="button" role="tab" aria-selected="${tab === 'recepty'}" class="calc-tab-btn ${tab === 'recepty' ? 'active' : ''}" data-ctab="recepty">Trening zleceń klinicznych</button>
          </div>

          <div id="calcTabBody">${bodyHtml}</div>
        </div></section>`;

        bindEvents(render);
      };

      render();
    }

    function bindEvents(render) {
      // Nawigacja zakładek
      $$('#calcTabNav .calc-tab-btn').forEach(btn => {
        btn.onclick = () => {
          CALC_STATE.tab = btn.dataset.ctab;
          saveCalcState();
          render();
        };
      });

      // Tab 1: Wiek ciążowy
      const lmpIn = $('#calcLmpInput');
      if (lmpIn) {
        lmpIn.onchange = () => {
          CALC_STATE.lmpIso = lmpIn.value;
          saveCalcState();
          render();
        };
      }
      $$('.js-lmp-preset').forEach(btn => {
        btn.onclick = () => {
          CALC_STATE.lmpIso = isoDaysAgo(Number(btn.dataset.days) || 168);
          saveCalcState();
          render();
        };
      });
      const cycSlider = $('#calcCycleSlider');
      if (cycSlider) {
        cycSlider.oninput = () => {
          CALC_STATE.cycleDays = Math.max(21, Math.min(45, Number(cycSlider.value) || 28));
          const valEl = $('#calcCycleVal');
          if (valEl) valEl.textContent = String(CALC_STATE.cycleDays);
        };
        cycSlider.onchange = () => {
          CALC_STATE.cycleDays = Math.max(21, Math.min(45, Number(cycSlider.value) || 28));
          saveCalcState();
          render();
        };
      }
      $$('.js-cycle-pill').forEach(btn => {
        btn.onclick = () => {
          CALC_STATE.cycleDays = Number(btn.dataset.cycle) || 28;
          saveCalcState();
          render();
        };
      });
      const crlIn = $('#calcCrlInput');
      if (crlIn) {
        crlIn.onchange = () => {
          CALC_STATE.crlMm = crlIn.value.trim();
          saveCalcState();
          render();
        };
      }
      const usgDateIn = $('#calcUsgDateInput');
      if (usgDateIn) {
        usgDateIn.onchange = () => {
          CALC_STATE.usgDateIso = usgDateIn.value;
          saveCalcState();
          render();
        };
      }
      $$('.js-crl-preset').forEach(btn => {
        btn.onclick = () => {
          CALC_STATE.crlMm = btn.dataset.crl;
          saveCalcState();
          render();
        };
      });
      const clearCrlBtn = $('#btnClearCrl');
      if (clearCrlBtn) {
        clearCrlBtn.onclick = () => {
          CALC_STATE.crlMm = '';
          saveCalcState();
          render();
        };
      }
      const copyNaegeleBtn = $('#btnCopyNaegele');
      if (copyNaegeleBtn) {
        copyNaegeleBtn.onclick = () => {
          const res = computeNaegele(CALC_STATE.lmpIso, CALC_STATE.cycleDays);
          if (!res) return;
          const md = [
            `# Wiek ciążowy i Reguła Naegelego`,
            `- **OM:** ${formatPlDate(CALC_STATE.lmpIso)} (cykl ${res.cycleDays} dni, korekta ${res.shiftDays >= 0 ? '+' : ''}${res.shiftDays} d)`,
            `- **Termin porodu (TP):** ${formatPlDate(res.eddIso)} (${res.eddIso})`,
            `- **Aktualny wiek ciążowy:** ${res.gaLabel} (trymestr ${res.trimester}) — ${res.termStatus}`,
            CALC_STATE.crlMm ? `- **CRL I trym.:** ${CALC_STATE.crlMm} mm (data USG: ${formatPlDate(CALC_STATE.usgDateIso)})` : ''
          ].filter(Boolean).join('\n');
          saveNoteEntry(`Wiek ciążowy ${res.gaLabel} (TP ${formatPlDate(res.eddIso)})`, md, '1');
        };
      }

      // Tab 2: Skale
      $$('.js-bishop-btn').forEach(btn => {
        btn.onclick = () => {
          CALC_STATE.bishop[btn.dataset.key] = Number(btn.dataset.val);
          saveCalcState();
          render();
        };
      });
      const copyBishopBtn = $('#btnCopyBishop');
      if (copyBishopBtn) {
        copyBishopBtn.onclick = () => {
          const r = computeBishop(CALC_STATE.bishop);
          const md = `# Skala Bishopa: ${r.score}/${r.max} pkt\n- **Interpretacja:** ${r.interpretation}\n- Składowe: rozwarcie ${CALC_STATE.bishop.dilation}, skrócenie ${CALC_STATE.bishop.effacement}, punkt prowadzący ${CALC_STATE.bishop.station}, konsystencja ${CALC_STATE.bishop.consistency}, położenie ${CALC_STATE.bishop.position}.`;
          saveNoteEntry(`Skala Bishopa (${r.score}/13 pkt)`, md, '4');
        };
      }

      $$('.js-apgar-btn').forEach(btn => {
        btn.onclick = () => {
          CALC_STATE.apgar[btn.dataset.key] = Number(btn.dataset.val);
          saveCalcState();
          render();
        };
      });
      const copyApgarBtn = $('#btnCopyApgar');
      if (copyApgarBtn) {
        copyApgarBtn.onclick = () => {
          const r = computeApgar(CALC_STATE.apgar);
          const md = `# Skala Apgar: ${r.score}/${r.max} pkt\n- **Ocena:** ${r.status}\n- Składowe: skóra ${CALC_STATE.apgar.appearance}, HR ${CALC_STATE.apgar.pulse}, reakcja ${CALC_STATE.apgar.grimace}, napięcie ${CALC_STATE.apgar.activity}, oddech ${CALC_STATE.apgar.respiration}.`;
          saveNoteEntry(`Skala Apgar (${r.score}/10 pkt)`, md, '4');
        };
      }

      $$('.js-rmi-feat').forEach(cb => {
        cb.onchange = () => {
          const idx = Number(cb.dataset.idx);
          CALC_STATE.rmi.features[idx] = !!cb.checked;
          saveCalcState();
          render();
        };
      });
      $$('.js-rmi-meno').forEach(btn => {
        btn.onclick = () => {
          CALC_STATE.rmi.postmenopausal = btn.dataset.post === '1';
          saveCalcState();
          render();
        };
      });
      const caIn = $('#calcRmiCa125');
      if (caIn) {
        caIn.onchange = () => {
          CALC_STATE.rmi.ca125 = Math.max(0, Number(caIn.value) || 0);
          saveCalcState();
          render();
        };
      }
      $$('.js-rmi-ca-preset').forEach(btn => {
        btn.onclick = () => {
          CALC_STATE.rmi.ca125 = Number(btn.dataset.val) || 0;
          saveCalcState();
          render();
        };
      });
      const copyRmiBtn = $('#btnCopyRmi');
      if (copyRmiBtn) {
        copyRmiBtn.onclick = () => {
          const featCount = CALC_STATE.rmi.features.filter(Boolean).length;
          const r = computeRmi({ ultrasoundFeatures: featCount, postmenopausal: CALC_STATE.rmi.postmenopausal, ca125: CALC_STATE.rmi.ca125 });
          const md = `# Wskaźnik RMI I = ${r.rmi}\n- Wzór: U (${r.U}) x M (${r.M}) x CA-125 (${r.ca125} U/ml)\n- **Kwalifikacja:** ${r.label}`;
          saveNoteEntry(`Wskaźnik RMI I = ${r.rmi}`, md, '10');
        };
      }

      // Tab 3: Dawki ratunkowe OB
      $$('.js-drug-cat').forEach(btn => {
        btn.onclick = () => {
          CALC_STATE.drugCat = btn.dataset.cat;
          saveCalcState();
          render();
        };
      });
      const drugSearch = $('#calcDrugSearch');
      if (drugSearch) {
        drugSearch.oninput = () => {
          CALC_STATE.drugSearch = drugSearch.value;
          saveCalcState();
          render();
          const refreshed = $('#calcDrugSearch');
          if (refreshed) {
            refreshed.focus();
            refreshed.setSelectionRange(refreshed.value.length, refreshed.value.length);
          }
        };
      }
      $$('.js-copy-drug').forEach(btn => {
        btn.onclick = () => {
          const d = getDrugsList().find(x => x.id === btn.dataset.id);
          if (!d) return;
          const md = [
            `# ${d.name} (${d.categoryLabel})`,
            d.indication ? `- **Wskazania:** ${d.indication}` : '',
            `- **Dawkowanie:** ${d.dose}${d.route ? ` (${d.route})` : ''}`,
            d.regimen ? `- **Schemat:** ${d.regimen}` : '',
            d.antidote ? `- **Antidotum:** ${d.antidote}` : '',
            d.warning ? `- **Ostrzeżenia:** ${d.warning}` : '',
            d.notes ? `- **Uwagi:** ${d.notes}` : ''
          ].filter(Boolean).join('\n');
          saveNoteEntry(`Protokół OB: ${d.name}`, md, '5');
        };
      });

      // Tab 4: Trening zleceń
      $$('.js-ord-chip').forEach(btn => {
        btn.onclick = () => {
          CALC_STATE.recepty.chalIdx = Number(btn.dataset.idx) || 0;
          CALC_STATE.recepty.chalStep = 0;
          saveCalcState();
          render();
        };
      });
      $$('.js-ord-step').forEach(btn => {
        btn.onclick = () => {
          CALC_STATE.recepty.chalStep = Number(btn.dataset.step) || 0;
          saveCalcState();
          render();
        };
      });
      $$('.js-ord-opt').forEach(btn => {
        btn.onclick = () => {
          const challenges = getOrderChallenges();
          const ch = challenges[CALC_STATE.recepty.chalIdx] || challenges[0];
          const sIdx = CALC_STATE.recepty.chalStep || 0;
          const optIdx = Number(btn.dataset.opt);
          CALC_STATE.recepty.chalAnswers[`${ch.id}__${sIdx}`] = optIdx;
          const allAnswered = ch.steps.every((_, i) => typeof CALC_STATE.recepty.chalAnswers[`${ch.id}__${i}`] === 'number');
          if (allAnswered && !CALC_STATE.recepty.chalDone.includes(ch.id)) {
            CALC_STATE.recepty.chalDone.push(ch.id);
          }
          saveCalcState();
          render();
        };
      });
      const nextStepBtn = $('#btnOrdNextStep');
      if (nextStepBtn) {
        nextStepBtn.onclick = () => {
          CALC_STATE.recepty.chalStep = (CALC_STATE.recepty.chalStep || 0) + 1;
          saveCalcState();
          render();
        };
      }
      const nextCaseBtn = $('#btnOrdNextCase');
      if (nextCaseBtn) {
        nextCaseBtn.onclick = () => {
          CALC_STATE.recepty.chalIdx = (CALC_STATE.recepty.chalIdx || 0) + 1;
          CALC_STATE.recepty.chalStep = 0;
          saveCalcState();
          render();
        };
      }
      const resetOrdersBtn = $('#btnResetOrders');
      if (resetOrdersBtn) {
        resetOrdersBtn.onclick = () => {
          CALC_STATE.recepty = { chalIdx: 0, chalStep: 0, chalAnswers: {}, chalDone: [] };
          saveCalcState();
          if (typeof toast === 'function') toast('Zresetowano postęp treningu zleceń.');
          render();
        };
      }
      const copyOrderBtn = $('#btnCopyOrderCase');
      if (copyOrderBtn) {
        copyOrderBtn.onclick = () => {
          const challenges = getOrderChallenges();
          const ch = challenges[CALC_STATE.recepty.chalIdx] || challenges[0];
          const md = [
            `# Trening zleceń: ${ch.title}`,
            ch.vignette,
            ...ch.steps.map((s, i) => `## Krok ${i + 1}: ${s.prompt}\n- **Poprawne zlecenie:** ${s.opts[s.key]}\n- **Uzasadnienie:** ${s.why}`)
          ].join('\n\n');
          saveNoteEntry(`Zlecenia OB: ${ch.title}`, md, '5');
        };
      }
    }

    return { viewCalculator, viewCalc: viewCalculator };
  };
})();
