/* Ginekologia & Położnictwo V – moduł kliniczny: Izba Przyjęć Położniczo-Ginekologiczna (Przypadki ostre) */
(function () {
  'use strict';
  window.HUB_CLINICAL = window.HUB_CLINICAL || {};
  window.HUB_CLINICAL.patient = function (ctx) {
    const { $, $$, main, esc, pct, save, toast, getNotes, saveNotes } = ctx;

    /* ---------- HELPERY STACJI OSCE ---------- */
    function getOsceStations() {
      if (ctx.osce && typeof ctx.osce.getStations === 'function') {
        return ctx.osce.getStations();
      }
      return (window.HUB_META && Array.isArray(window.HUB_META.OSCE_STATIONS))
        ? window.HUB_META.OSCE_STATIONS
        : [];
    }

    /* ---------- PANEL DAWEK RATUNKOWYCH (PTGiP / FIGO) ---------- */
    const EMERGENCY_DRUG_CARDS = {
      'pph-atonia': {
        subtitle: 'Protokół krwotoku poporodowego (PPH · PTGiP / FIGO)',
        drugs: [
          {
            name: 'Oksytocyna (I rzut)',
            dose: '5 j.m. powoli i.v. (lub 10 j.m. i.m.), następnie wlew 20–40 j.m. w 1000 ml krystaloidu',
            route: 'Dożylnie (powolny bolus + wlew ciągły)',
            indication: 'Podstawowy uterotonik w atonii macicy. Zbyt szybki bolus i.v. grozi hipotonią i tachykardią.',
            badge: 'I rzut'
          },
          {
            name: 'Kwas traneksamowy (TXA / Exacyl)',
            dose: '1 g i.v. w ciągu 10 min (powtórka 1 g po 30 min, jeśli krwawienie trwa)',
            route: 'Dożylnie (jak najszybciej, optymalnie <3 h od porodu)',
            indication: 'Badanie WOMAN: istotnie zmniejsza śmiertelność z powodu PPH niezależnie od przyczyny.',
            badge: 'Obowiązkowo <3 h'
          },
          {
            name: 'Leki II rzutu: Mizoprostol / Metyloergometryna / Karboprost',
            dose: 'Mizoprostol 800 µg s.l./p.r. · Metyloergometryna 0,2 mg i.m. · Karboprost 250 µg i.m. co 15 min (max 2 mg)',
            route: 'Podjęzykowo / doodbytniczo / domięśniowo',
            indication: 'Metyloergometryna p/wskazana w nadciśnieniu i PE; karboprost p/wskazany w astmie oskrzelowej.',
            badge: 'II rzut'
          },
          {
            name: 'Koncentrat fibrynogenu + Protokół MTP (KKCz : FFP : KKP)',
            dose: 'Fibrynogen 2–4 g i.v. przy stężeniu <2 g/l (w ciąży norma 4–6 g/l!)',
            route: 'Dożylnie (stosunek preparatów 1:1:1 w masywnym krwotoku)',
            indication: 'Fibrynogen spada jako pierwszy czynnik krzepnięcia w PPH i jest najsilniejszym predyktorem ciężkiego krwotoku.',
            badge: 'Koagulopatia'
          }
        ],
        redFlags: [
          'Wskaźnik wstrząsowy (SI = HR / SBP) ≥0,9 w położnictwie oznacza istotną hipowolemię (≥1,1 → pilna potrzeba przetoczenia KKCz)!',
          'Nie czekaj na wynik hemoglobiny — w ostrym krwotoku Hb początkowo bywa fałszywie prawidłowa.',
          'Zawsze oceń 4T: Tone (atonia), Trauma (uraz kanału), Tissue (resztki łożyska), Thrombin (koagulopatia).'
        ]
      },
      'eclampsia-hellp': {
        subtitle: 'Protokół ciężkiego PE, rzucawki i HELLP (PTGiP / ACOG)',
        drugs: [
          {
            name: 'Siarczan magnezu (MgSO₄) — lek I rzutu',
            dose: 'Dawka nasycająca 4–6 g i.v. w 15–20 min, następnie wlew 1–2 g/h',
            route: 'Dożylnie (pompa infuzyjna) przez min. 24 h po porodzie / ostatnim napadzie',
            indication: 'Zapobiega napadom rzucawki i nawrotom drgawek skuteczniej niż benzodiazepiny czy fenytoina.',
            badge: 'I rzut (OUN)'
          },
          {
            name: 'Labetalol i.v. (hipotensyjny I rzut)',
            dose: '20 mg i.v., po 10 min 40 mg, następnie 80 mg (max 220–300 mg)',
            route: 'Powolne wstrzyknięcie i.v. lub wlew ciągły',
            indication: 'Cel RR: 140–150 / 90–100 mmHg. Unikać w astmie i bradykardii matki.',
            badge: 'Kontrola RR'
          },
          {
            name: 'Nifedypina p.o. (o natychmiastowym uwalnianiu)',
            dose: '10 mg p.o., powtórka 10–20 mg co 20 min (max 50 mg/h)',
            route: 'Doustnie (nie podjęzykowo!)',
            indication: 'Szybka alternatywa I rzutu przy braku wkłucia żylnego lub przeciwwskazaniach do beta-blokerów.',
            badge: 'Hipotensyjny p.o.'
          },
          {
            name: 'Glukonian wapnia 10% (antidotum MgSO₄)',
            dose: '10 ml 10% roztworu (1 g) powoli i.v. w ciągu 3–5 min',
            route: 'Dożylnie przy objawach toksyczności magnezu',
            indication: 'Zawsze przy łóżku! Podaj przy zniesieniu odruchów kolanowych, RR oddechów <12/min lub zatrzymaniu oddechu.',
            badge: 'Antidotum'
          }
        ],
        redFlags: [
          'NIGDY nie obniżaj ciśnienia gwałtownie poniżej 110/70 mmHg — grozi ostrym niedotlenieniem płodu (hipoperfuzja łożyska).',
          'Ogranicz podaż płynów i.v. do ok. 80 ml/h — w stanie przedrzucawkowym uszkodzony śródbłonek sprzyja obrzękowi płuc!',
          'Bezwzględnie przeciwwskazane w ciąży: inhibitory ACE, sartany (ARB) i antagoniści reniny.'
        ]
      },
      'ectopic-ruptured': {
        subtitle: 'Protokół pękniętej ciąży ektopowej i wstrząsu (PTGiP / RCOG)',
        drugs: [
          {
            name: 'Krystaloidy zbilansowane + KKCz (0 RhD ujemna / zgodna)',
            dose: 'Ostrożny bolus 500–1000 ml + pilne przetoczenie KKCz (cel MAP ~65 mmHg przed hemostazą)',
            route: '2 szerokie kaniule obwodowe ≥16G',
            indication: 'Unikaj agresywnej hemodylucji przed opanowaniem krwawienia operacyjnego (hipotensja kontrolowana).',
            badge: 'Resuscytacja'
          },
          {
            name: 'Kwas traneksamowy (TXA)',
            dose: '1 g i.v. w 10 min',
            route: 'Dożylnie',
            indication: 'Wspomaganie hemostazy przy masywnym krwotoku do jamy otrzewnej (hemoperitoneum).',
            badge: 'Hemostaza'
          },
          {
            name: 'Immunoglobulina anty-D (Ig anty-D)',
            dose: '50 µg (250 j.m.) i.m. w I trymestrze (lub 150–300 µg wg protokołu ośrodka) do 72 h',
            route: 'Domięśniowo u każdej pacjentki RhD-ujemnej bez przeciwciał',
            indication: 'Zapobieganie immunizacji w układzie Rh po zabiegu operacyjnym z powodu ciąży ektopowej.',
            badge: 'Profilaktyka RhD'
          },
          {
            name: 'Metotreksat (MTX) — UWAGA: PRZECIWWSKAZANY!',
            dose: 'Wyłącznie u stabilnych pacjentek (β-hCG <5000, pęcherzyk <3,5 cm, brak FHR, brak pęknięcia)',
            route: 'Nie podawać we wstrząsie / hemoperitoneum',
            indication: 'W pękniętej ciąży ektopowej jedynym leczeniem ratującym życie jest pilna operacja (salpingektomia).',
            badge: 'Przeciwwskazany'
          }
        ],
        redFlags: [
          'Niestabilna pacjentka z dodatnim β-hCG i płynem w jamie otrzewnej jedzie prosto na blok operacyjny — NIE na tomografię komputerową!',
          'Objaw Kehra (ból promieniujący do barku) świadczy o drażnieniu kopuły przepony przez krew w jamie otrzewnej.',
          'Nie czekaj 48 godzin na ocenę przyrostu β-hCG u pacjentki z objawami ostrza brzucha lub wstrząsu.'
        ]
      },
      'cord-prolapse': {
        subtitle: 'Protokół wypadnięcia pępowiny — CC kat. 1 (PTGiP / RCOG)',
        drugs: [
          {
            name: 'Odbarczenie ręczne + Pozycja kolankowo-łokciowa / Trendelenburga',
            dose: 'Stałe unoszenie części przodującej palcami przez pochwę aż do wydobycia płodu',
            route: 'Manewr mechaniczny I rzutu (natychmiast!)',
            indication: 'Znosi ucisk części przodującej na naczynia pępowinowe i przywraca przepływ łożyskowo-płodowy.',
            badge: 'Priorytet #1'
          },
          {
            name: 'Wypełnienie pęcherza moczowego (metoda Vago)',
            dose: '500–700 ml ciepłego 0,9% NaCl przez cewnik Foleya i zaciśnięcie cewnika',
            route: 'Dopęcherzowo (przy przewidywanym opóźnieniu transportu na blok)',
            indication: 'Unosi część przodującą i hamuje skurcze macicy — pamiętaj o opróżnieniu pęcherza tuż przed nacięciem macicy!',
            badge: 'Most mechaniczny'
          },
          {
            name: 'Ostra tokoliza (Atosiban / Salbutamol / Terbutalina)',
            dose: 'Atosiban 6,75 mg i.v. bolus (1 min) lub Terbutalina 0,25 mg s.c.',
            route: 'Dożylnie / podskórnie (gdy skurcze nasilają bradykardię w drodze na blok)',
            indication: 'Natychmiast wyłącz wlew oksytocyny! Tokoliza nie może opóźnić rozpoczęcia cięcia cesarskiego.',
            badge: 'Relaksacja macicy'
          },
          {
            name: 'Tlenoterapia + Antybiotykoterapia okołoporodowa (Cefazolina)',
            dose: 'O₂ przez maskę 10 l/min · Cefazolina 2 g i.v. przed nacięciem skóry',
            route: 'Wziewnie / dożylnie',
            indication: 'Standardowe wsparcie w ratunkowym cięciu cesarskim kategorii 1 (cel decision-to-delivery <30 min).',
            badge: 'Blok operacyjny'
          }
        ],
        redFlags: [
          'NIGDY nie próbuj siłowo odprowadzać (wpychać) wypadniętej pętli pępowiny do jamy macicy — wywołasz śmiertelny skurcz naczyń pępowinowych!',
          'Nie wyjmuj ręki odbarczającej z pochwy podczas przewożenia pacjentki na salę operacyjną.',
          'Zawsze zabezpiecz obecność zespołu neonatologicznego i pobierz gazometrię z tętnicy i żyły pępowinowej po urodzeniu.'
        ]
      }
    };

    /* ---------- 4 SCENARIUSZE IZBY PRZYJĘĆ OB/GYN ---------- */
    const PATIENT_CASES = [
      {
        id: 'pph-atonia',
        shortTitle: 'Krwotok poporodowy (PPH)',
        title: 'Masywny krwotok poporodowy z powodu atonii macicy',
        category: 'Położnictwo · Stan nagły',
        severity: 'Krytyczny',
        age: '32 lata',
        gravida: 'G3P3 · 25 min po porodzie SN',
        gestation: 'Noworodek 4280 g',
        intro: 'Wieloródka 25 minut po porodzie drogami natury makrosomicznego noworodka (4280 g, przedłużony II okres porodu). Z dróg rodnych obfite krwawienie żywoczerwoną krwią ze skrzepami — szacowana utrata już ~1200 ml. Pacjentka blada, spocona, zgłasza zawroty głowy. W badaniu brzucha dno macicy miękkie, ciastowate, sięga 2 palce powyżej pępka.',
        vitalsInitial: { hr: 126, bp: '88/54', rr: 24, spo2: 96, temp: 36.6, shockIndex: 1.43, fhr: null },
        stages: [
          {
            name: 'Etap 1: Alarm PPH, stabilizacja i leczenie I rzutu',
            prompt: 'Utrata krwi przekroczyła 1000 ml, a wskaźnik wstrząsowy wynosi 1,43. Macica jest miękka i wiotka. Jakie działania podejmujesz natychmiast w pierwszych 5 minutach?',
            vitalsDelta: { hr: -12, bp: '96/60', rr: -3, spo2: 2, shockIndex: -0.24 },
            options: [
              {
                id: 'pph1_a',
                text: 'Wezwanie zespołu (położnik, anestezjolog, bank krwi), 2 wkłucia ≥16G, pobranie morfologii, koagulogramu, fibrynogenu i próby krzyżowej + przetoczenie ciepłych krystaloidów',
                type: 'key',
                points: 20,
                why: 'Krwotok poporodowy wymaga równoległego działania całego zespołu. Dwa szerokie dostępy żylne i pilne zabezpieczenie krwi oraz fibrynogenu ratują życie.'
              },
              {
                id: 'pph1_b',
                text: 'Natychmiastowy masaż dna macicy, opróżnienie pęcherza moczowego cewnikiem Foleya oraz podanie Oksytocyny i.v. (5 j.m. powoli + wlew 20–40 j.m.) i Kwasu traneksamowego 1 g i.v.',
                type: 'key',
                points: 25,
                why: 'Pełny pęcherz uniemożliwia obkurczenie macicy. Oksytocyna to uterotonik I rzutu, a kwas traneksamowy (TXA 1 g i.v. <3 h) wg badania WOMAN istotnie obniża śmiertelność.'
              },
              {
                id: 'pph1_c',
                text: 'Wstrzymanie resuscytacji płynowej i zamówienia krwi do czasu uzyskania wyniku hemoglobiny z laboratorium',
                type: 'harmful',
                points: -25,
                why: 'Błąd krytyczny! W ostrym krwotoku stężenie hemoglobiny początkowo nie odzwierciedla rzeczywistej utraty krwi. Decyzje podejmujemy na podstawie kliniki i wskaźnika wstrząsowego (SI = 1,43).'
              },
              {
                id: 'pph1_d',
                text: 'Podanie tlenu przez maskę i ogrzanie pacjentki kocem termicznym (zapobieganie triadzie śmierci)',
                type: 'key',
                points: 10,
                why: 'Hipotermia nasila koagulopatię i kwasicę. Tlenoterapia i utrzymanie normotermii są elementem standardu resuscytacji krwotoku.'
              },
              {
                id: 'pph1_e',
                text: 'Zlecenie samego pomiaru glikemii przyłóżkowej przed badaniem macicy',
                type: 'neutral',
                points: 0,
                why: 'Nie szkodzi bezpośrednio, ale nie stanowi priorytetu w masywnym krwotoku z atonii macicy.'
              }
            ]
          },
          {
            name: 'Etap 2: Różnicowanie 4T i eskalacja farmakologiczna',
            prompt: 'Po 10 minutach i podaniu oksytocyny oraz TXA krwawienie nadal utrzymuje się (łącznie ~1700 ml). Wstępny fibrynogen wynosi 1,6 g/l (norma w ciąży 4–6 g/l). Co robisz w kolejnym kroku?',
            vitalsDelta: { hr: -14, bp: '104/66', rr: -3, spo2: 1, shockIndex: -0.23 },
            options: [
              {
                id: 'pph2_a',
                text: 'Kontrola kanału rodnego we wziernikach (uraz szyjki/pochwy) oraz weryfikacja kompletności łożyska / przyłóżkowe USG jamy macicy (wykluczenie resztek — Trauma & Tissue)',
                type: 'key',
                points: 20,
                why: 'Każdy oporny PPH wymaga systematycznego wykluczenia wszystkich składowych 4T (Tone, Trauma, Tissue, Thrombin).'
              },
              {
                id: 'pph2_b',
                text: 'Włączenie uterotoników II rzutu (np. mizoprostol 800 µg s.l. lub karboprost 250 µg i.m. przy braku astmy / metyloergometryna 0,2 mg i.m. przy braku nadciśnienia)',
                type: 'key',
                points: 20,
                why: 'Brak pełnego obkurczenia macicy po oksytocynie wymaga szybkiej eskalacji do leku II rzutu w ciągu 10–15 min, z uwzględnieniem przeciwwskazań.'
              },
              {
                id: 'pph2_c',
                text: 'Uruchomienie protokołu masywnego przetoczenia (KKCz + FFP) oraz natychmiastowa suplementacja koncentratu fibrynogenu (2–4 g i.v.)',
                type: 'key',
                points: 20,
                why: 'Stężenie fibrynogenu <2 g/l w PPH ma niemal 100% wartość predykcyjną ciężkiego krwotoku i wymaga natychmiastowego wyrównania.'
              },
              {
                id: 'pph2_d',
                text: 'Podanie heparyny drobnocząsteczkowej w dawce leczniczej profilaktycznie przeciw zakrzepicy',
                type: 'harmful',
                points: -25,
                why: 'Błąd krytyczny! Antykoagulacja w czynnym masywnym krwotoku doprowadzi do niekontrolowanej utraty krwi i zgonu.'
              }
            ]
          },
          {
            name: 'Etap 3: Oporna atonia — interwencja mechaniczna i zabiegowa',
            prompt: 'Kanał rodny jest cały, jama macicy pusta w USG, ale dno macicy okresowo wiotczeje i nadal sączy krew. Jakie postępowanie ostatecznie stabilizuje pacjentkę?',
            vitalsDelta: { hr: -14, bp: '114/72', rr: -2, spo2: 0, shockIndex: -0.20 },
            options: [
              {
                id: 'pph3_a',
                text: 'Założenie wewnątrzmacicznego balonu tamponującego (np. Bakriego) pod kontrolą USG lub ucisk dwuręczny jako most do procedur zabiegowych',
                type: 'key',
                points: 25,
                why: 'Tamponada balonowa (Bakri / podwójny balon) jest skuteczną metodą oszczędzającą macicę w opornej atonii (>80% skuteczności) i kupuje czas.'
              },
              {
                id: 'pph3_b',
                text: 'Przygotowanie sali operacyjnej do szwów kompresyjnych (B-Lynch), podwiązania tętnic macicznych lub embolizacji tętnic macicznych w razie nieskuteczności balonu',
                type: 'key',
                points: 20,
                why: 'Algorytm PTGiP/FIGO zakłada płynne przejście do procedur chirurgicznych oszczędzających płodność, a w ostateczności histerektomii okołoporodowej, zanim rozwinie się nieodwracalny wstrząs.'
              },
              {
                id: 'pph3_c',
                text: 'Ścisły nadzór na sali pooperacyjnej/OIOM: bilans płynów, godzinowa diureza (>30 ml/h), kontrolna morfologia i fibrynogen',
                type: 'key',
                points: 15,
                why: 'Po opanowaniu krwotoku konieczny jest intensywny nadzór pod kątem nawrotu krwawienia, koagulopatii i zespołu Sheehana/AKI.'
              },
              {
                id: 'pph3_d',
                text: 'Przekazanie pacjentki bezpośrednio na zwykłą salę położniczą i usunięcie cewnika Foleya',
                type: 'harmful',
                points: -20,
                why: 'Błąd krytyczny! Pacjentka po masywnym PPH (>1500 ml) wymaga ciągłego monitorowania hemodynamicznego i diurezy godzinowej przez co najmniej 24 h.'
              }
            ]
          }
        ],
        debrief: {
          diagnosis: 'Wczesny krwotok poporodowy (PPH) w mechanizmie atonii macicy',
          code: 'ICD-10: O72.1',
          etiology: 'Nadmierne rozciągnięcie mięśnia macicy (makrosomia 4280 g), wielorództwo i przedłużony II okres porodu prowadzące do upośledzenia skurczu włókien mięśniowych i zamknięcia naczyń spiralnych.',
          keyRules: [
            'Najczęstszą przyczyną PPH (~70–80%) jest atonia macicy (Tone) — zawsze weryfikuj cały schemat 4T: Tone, Trauma, Tissue, Thrombin.',
            'Kwas traneksamowy (1 g i.v.) podaj natychmiast po rozpoznaniu PPH, najlepiej w ciągu 3 godzin od porodu (badanie WOMAN).',
            'W położnictwie fizjologiczny fibrynogen wynosi 4–6 g/l — wartość <2 g/l wymaga natychmiastowego podania koncentratu fibrynogenu.',
            'Wskaźnik wstrząsowy (SI = HR / SBP) ≥0,9 jest czulszym wskaźnikiem hipowolemii u położnicy niż samo ciśnienie tętnicze.'
          ],
          pearls: 'Złota godzina w PPH: nie traktuj utraty krwi „na oko” (niedoszacowanie sięga 30–50%). Waż podkłady, mierz wskaźnik wstrząsowy i działaj równolegle: uterotonik + TXA + wyrównanie fibrynogenu + mechaniczna tamponada.'
        }
      },
      {
        id: 'eclampsia-hellp',
        shortTitle: 'Ciężki PE / Zespół HELLP',
        title: 'Ciężki stan przedrzucawkowy zagrażający rzucawką i zespół HELLP',
        category: 'Położnictwo · Nadciśnienie',
        severity: 'Krytyczny',
        age: '29 lat',
        gravida: 'G1P0 · 34+2 Hbd',
        gestation: 'Ciąża pojedyncza, 34+2 Hbd',
        intro: 'Pierworódka w 34+2 Hbd zgłosiła się na Izbę Przyjęć z silnym, opasującym bólem w nadbrzuszu i prawym podżebrzu, pulsującym bólem głowy oraz mroczkami przed oczami. Ciśnienie tętnicze w dwóch pomiarach: 174/112 mmHg i 176/110 mmHg. Odruchy kolanowe wygórowane (klonus stóp). W pasku moczu białko 3+. KTG wyjściowo z prawidłową czynnością serca płodu 148/min.',
        vitalsInitial: { hr: 102, bp: '174/112', rr: 20, spo2: 97, temp: 36.8, shockIndex: 0.59, fhr: 148 },
        stages: [
          {
            name: 'Etap 1: Profilaktyka drgawek, hipotensja i diagnostyka HELLP',
            prompt: 'Pacjentka ma ciężki stan przedrzucawkowy z objawami zwiastującymi rzucawkę (OUN + ból w nadbrzuszu). Jakie leczenie i badania wdrażasz w pierwszej kolejności?',
            vitalsDelta: { hr: -8, bp: '148/94', rr: -2, spo2: 1, shockIndex: 0.05, fhr: -4 },
            options: [
              {
                id: 'pe1_a',
                text: 'Podanie siarczanu magnezu (MgSO₄) i.v.: dawka nasycająca 4–6 g w 15–20 min, następnie wlew podtrzymujący 1–2 g/h',
                type: 'key',
                points: 25,
                why: 'MgSO₄ jest bezwzględnym lekiem I rzutu w profilaktyce i leczeniu rzucawki (badanie Magpie — zmniejsza ryzyko drgawek o >50%).'
              },
              {
                id: 'pe1_b',
                text: 'Ostrożne obniżenie RR lekiem I rzutu (labetalol i.v. lub nifedypina p.o.) do bezpiecznego zakresu 140–150 / 90–100 mmHg',
                type: 'key',
                points: 25,
                why: 'RR ≥160/110 mmHg to stan naglący (ryzyko udaru krwotocznego matki), ale spadek nie może być gwałtowny, aby nie wywołać hipoperfuzji łożyska.'
              },
              {
                id: 'pe1_c',
                text: 'Pilny panel w kierunku HELLP (morfologia z płytkami, AST/ALT, LDH, bilirubina, kreatynina, koagulogram) oraz ciągły zapis KTG',
                type: 'key',
                points: 15,
                why: 'Ból w prawym podżebrzu/nadbrzuszu to klasyczny objaw rozciągania torebki Glissona w zespole HELLP (ryzyko pęknięcia krwiaka podtorebkowego wątroby!).'
              },
              {
                id: 'pe1_d',
                text: 'Podanie diazepamu i.v. zamiast MgSO₄ oraz kaptoprylu podjęzykowo dla szybkiego zbicia RR do 110/70 mmHg',
                type: 'harmful',
                points: -30,
                why: 'Podwójny błąd krytyczny! Inhibitory ACE są bezwzględnie przeciwwskazane w ciąży (fetotoksyczność), gwałtowna hipotensja dusi płód, a diazepam jest gorszy od MgSO₄ i powoduje depresję oddechową noworodka.'
              }
            ]
          },
          {
            name: 'Etap 2: Nadzór nad MgSO₄ i wyniki zespołu HELLP',
            prompt: 'Przyszły wyniki pilne: PLT 78 G/l, AST 192 U/l, ALT 168 U/l, LDH 720 U/l, haptoglobina nieoznaczalna (pełnoobjawowy zespół HELLP). Pacjentka otrzymuje wlew MgSO₄. Jak prowadzisz nadzór?',
            vitalsDelta: { hr: -4, bp: '144/90', rr: -2, spo2: 0, shockIndex: -0.01, fhr: -2 },
            options: [
              {
                id: 'pe2_a',
                text: 'Ścisły monitoring toksyczności MgSO₄: odruchy kolanowe, częstość oddechów (≥12/min), diureza godzinowa (>30 ml/h) + glukonian wapnia 10% w gotowości przy łóżku',
                type: 'key',
                points: 25,
                why: 'MgSO₄ wydalany jest przez nerki. Oliguria szybko prowadzi do hipermagnezemii, zniesienia odruchów i zatrzymania oddechu — antidotum to 10 ml 10% glukonianu wapnia i.v.'
              },
              {
                id: 'pe2_b',
                text: 'Ograniczenie płynoterapii dożylnej (~80 ml/h) i unikanie rutynowych dużych bolusów krystaloidów',
                type: 'key',
                points: 20,
                why: 'W ciężkim PE wzmożona przepuszczalność naczyń i hipoalbuminemia stwarzają bardzo wysokie ryzyko ostrego obrzęku płuc przy przewodnieniu.'
              },
              {
                id: 'pe2_c',
                text: 'Przetoczenie 2000 ml 0,9% NaCl w 1 godzinę w celu „rozrzedzenia” enzymów wątrobowych i wymuszenia diurezy',
                type: 'harmful',
                points: -25,
                why: 'Błąd krytyczny! Agresywna płynoterapia w ciężkim stanie przedrzucawkowym wywołuje obrzęk płuc — jedną z głównych przyczyn zgonów matek w PE.'
              },
              {
                id: 'pe2_d',
                text: 'Rozważenie podania pierwszej dawki glikokortykosteroidu (późny wcześniak 34+2 Hbd) wyłącznie pod warunkiem, że nie opóźni to pilnego rozwiązania',
                type: 'neutral',
                points: 0,
                why: 'W 34+2 Hbd głównym celem jest bezpieczeństwo matki i rozwiązanie ciąży; sterydy prenatalne nie mogą opóźniać porodu przy pełnoobjawowym HELLP.'
              }
            ]
          },
          {
            name: 'Etap 3: Decyzja położnicza i opieka poporodowa',
            prompt: 'Stan pacjentki został wstępnie ustabilizowany (RR 144/90, bez drgawek), KTG prawidłowe, ciąża 34+2 Hbd, rozpoznano pełnoobjawowy zespół HELLP. Jaka jest ostateczna decyzja położnicza?',
            vitalsDelta: { hr: -6, bp: '138/86', rr: 0, spo2: 1, shockIndex: -0.02, fhr: -2 },
            options: [
              {
                id: 'pe3_a',
                text: 'Kwalifikacja do pilnego ukończenia ciąży po stabilizacji matki (jedyne przyczynowe leczenie PE/HELLP — powyżej 34 Hbd nie prowadzimy postępowania wyczekującego)',
                type: 'key',
                points: 25,
                why: 'Zgodnie z PTGiP i ACOG zespół HELLP oraz ciężki PE ≥34+0 Hbd są bezwzględnym wskazaniem do ukończenia ciąży po wstępnej stabilizacji.'
              },
              {
                id: 'pe3_b',
                text: 'Kontynuacja wlewu MgSO₄ przez 24 godziny po porodzie oraz ścisłe monitorowanie RR, płytek i transaminaz (nadir PLT często w 24–48 h po porodzie)',
                type: 'key',
                points: 20,
                why: 'Aż do 30% napadów rzucawki występuje w okresie poporodowym, a zespół HELLP może przejściowo nasilić się w pierwszej dobie po porodzie.'
              },
              {
                id: 'pe3_c',
                text: 'Zlecenie znieczulenia przewodowego (zewnątrzoponowego) dopiero po potwierdzeniu bezpiecznej liczby płytek (zwykle ≥70–80 G/l i bez dynamicznego spadku); w przeciwnym razie znieczulenie ogólne',
                type: 'key',
                points: 15,
                why: 'Małopłytkowość <70 G/l lub gwałtowny spadek PLT zwiększają ryzyko krwiaka nadtwardówkowego przy znieczuleniu neuroosiowym.'
              },
              {
                id: 'pe3_d',
                text: 'Wypisanie pacjentki do domu z zaleceniem metylodopy p.o. i kontroli w poradni K za 7 dni (próba przedłużenia ciąży do 37 Hbd)',
                type: 'harmful',
                points: -30,
                why: 'Błąd krytyczny! Postępowanie wyczekujące w pełnoobjawowym zespole HELLP i ciężkim PE w 34+2 Hbd grozi rzucawką, DIC, pęknięciem wątroby i zgonem wewnątrzmacicznym płodu.'
              }
            ]
          }
        ],
        debrief: {
          diagnosis: 'Ciężki stan przedrzucawkowy zagrażający rzucawką z zespołem HELLP (34+2 Hbd)',
          code: 'ICD-10: O14.2 / O14.1',
          etiology: 'Nieprawidłowa inwazja trofoblastu w tętnice spiralne, niedokrwienie łożyska i uogólniona dysfunkcja śródbłonka prowadząca do skurczu naczyń, mikroangiopatii zakrzepowej (Hemolysis, Elevated Liver enzymes, Low Platelets) oraz obrzęku mózgu.',
          keyRules: [
            'MgSO₄ (4–6 g i.v. + 1–2 g/h) to lek I rzutu w profilaktyce i leczeniu rzucawki; kontynuuj wlew przez 24 h po porodzie.',
            'Leki hipotensyjne I rzutu w przełomie (≥160/110 mmHg): labetalol i.v., nifedypina p.o. (natychmiastowe uwalnianie) lub hydralazyna/urapidyl i.v. — cel 140–150/90–100 mmHg.',
            'Antidotum na przedawkowanie MgSO₄: 10 ml 10% glukonianu wapnia i.v. — monitoruj odruchy kolanowe, oddech i diurezę.',
            'Jedynym leczeniem przyczynowym PE/HELLP jest zakończenie ciąży (wydobycie łożyska) po wstępnej stabilizacji stanu matki.'
          ],
          pearls: 'Ból w nadbrzuszu lub prawym podżebrzu u ciężarnej w III trymestrze to NIE „zgaga”, dopóki nie wykluczysz zespołu HELLP (PLT, AST/ALT, LDH) i ciężkiego stanu przedrzucawkowego!'
        }
      },
      {
        id: 'ectopic-ruptured',
        shortTitle: 'Pęknięta ciąża ektopowa',
        title: 'Pęknięta ciąża jajowodowa ze wstrząsem hipowolemicznym',
        category: 'Ginekologia · Ostry brzuch',
        severity: 'Krytyczny',
        age: '27 lat',
        gravida: 'G1P0 · 7 tyg. od OM',
        gestation: 'Dodatni test ciążowy (β-hCG+)',
        intro: '27-letnia kobieta przywieziona przez ZRM po nagłym omdleniu w łazience. Ostatnia miesiączka 7 tygodni temu, domowy test ciążowy dodatni przed tygodniem, nie była jeszcze u ginekologa. Od 2 godzin rozdzierający ból podbrzusza, silniejsze krwawienie plamiące oraz kłucie w okolicy prawego barku (objaw Kehra). Skóra blada, chłodna, brzuch deskowato napięty w podbrzuszu z dodatnim objawem Blumberga.',
        vitalsInitial: { hr: 132, bp: '82/48', rr: 26, spo2: 95, temp: 36.3, shockIndex: 1.61, fhr: null },
        stages: [
          {
            name: 'Etap 1: Triage wstrząsu i szybkie potwierdzenie krwotoku',
            prompt: 'Pacjentka jest w jawnym wstrząsie hipowolemicznym (RR 82/48, HR 132, SI = 1,61) z dodatnim testem ciążowym i objawami otrzewnowymi. Co robisz natychmiast?',
            vitalsDelta: { hr: -12, bp: '92/56', rr: -3, spo2: 2, shockIndex: -0.31 },
            options: [
              {
                id: 'ect1_a',
                text: '2 szerokie dostępy żylne ≥16G, pobranie grupy krwi z próbą krzyżową, morfologii, β-hCG i koagulogramu, pilne zamówienie KKCz (w tym 0 RhD- na ratunek) + ostrożna płynoterapia',
                type: 'key',
                points: 25,
                why: 'Kobieta w wieku rozrodczym we wstrząsie z dodatnim β-hCG ma pękniętą ciążę ektopową do czasu udowodnienia czegoś innego — priorytetem jest zabezpieczenie krwi i hemostaza.'
              },
              {
                id: 'ect1_b',
                text: 'Szybkie przyłóżkowe USG FAST / przezpochwowe potwierdzające pustą jamę macicy i dużą ilość wolnego płynu w zatoce Douglasa oraz zachyłku Morisona + natychmiastowy alarm bloku operacyjnego',
                type: 'key',
                points: 25,
                why: 'Przyłóżkowe USG trwa <2 minuty i natychmiast potwierdza hemoperitoneum, skracając czas do operacji ratującej życie.'
              },
              {
                id: 'ect1_c',
                text: 'Transport niestabilnej pacjentki na tomografię komputerową (TK) jamy brzusznej z kontrastem w celu wykluczenia zapalenia wyrostka',
                type: 'harmful',
                points: -30,
                why: 'Błąd krytyczny („tunel śmierci”)! Niestabilna pacjentka we wstrząsie krwotocznym z płynem w jamie otrzewnej i dodatnim β-hCG nie jedzie na TK — jedzie na salę operacyjną.'
              },
              {
                id: 'ect1_d',
                text: 'Podanie tlenu przez maskę i przygotowanie kwasu traneksamowego (1 g i.v.)',
                type: 'key',
                points: 10,
                why: 'Tlenoterapia poprawia dostarczanie tlenu przy ostrej anemizacji, a TXA wspomaga hemostazę w ciężkim krwotoku.'
              }
            ]
          },
          {
            name: 'Etap 2: Decyzja terapeutyczna — zabieg vs farmakoterapia',
            prompt: 'USG przyłóżkowe wykazuje pustą jamę macicy (endometrium 11 mm), guz w rzucie prawego jajowodu (3,8 cm) oraz masywną ilość wolnego płynu z echami skrzepów aż po zachyłek Morisona. Hb wynosi 7,4 g/dl. Jaki jest właściwy wybór leczenia?',
            vitalsDelta: { hr: -20, bp: '108/68', rr: -4, spo2: 2, shockIndex: -0.37 },
            options: [
              {
                id: 'ect2_a',
                text: 'Pilna operacja w trybie natychmiastowym: laparoskopia (lub laparotomia przy skrajnej niestabilności) z usunięciem pękniętego jajowodu (salpingektomia) i ewakuacją krwi',
                type: 'key',
                points: 30,
                why: 'Leczenie chirurgiczne jest metodą z wyboru w pękniętej ciąży ektopowej i niestabilności hemodynamicznej. Przy zdrowym drugim jajowodzie zaleca się salpingektomię.'
              },
              {
                id: 'ect2_b',
                text: 'Śródoperacyjne przetoczenie KKCz i ścisła współpraca z anestezjologiem w celu wyrównania hipowolemii',
                type: 'key',
                points: 15,
                why: 'Hb 7,4 g/dl przy czynnym krwotoku i wstrząsie wymaga przetoczenia koncentratu krwinek czerwonych.'
              },
              {
                id: 'ect2_c',
                text: 'Podanie jednorazowej dawki metotreksatu (50 mg/m² i.m.) i obserwacja na oddziale z kontrolą β-hCG w 4. i 7. dobie',
                type: 'harmful',
                points: -30,
                why: 'Błąd krytyczny! Niestabilność hemodynamiczna, pęknięcie ciąży ektopowej i hemoperitoneum są bezwzględnymi przeciwwskazaniami do metotreksatu.'
              },
              {
                id: 'ect2_d',
                text: 'Odroczenie operacji o 48 godzin w celu oceny krzywej przyrostu β-hCG',
                type: 'harmful',
                points: -25,
                why: 'Błąd krytyczny! 48-godzinna obserwacja β-hCG dotyczy wyłącznie stabilnych pacjentek z ciążą o nieznanej lokalizacji (PUL), nigdy pękniętej ciąży ektopowej.'
              }
            ]
          },
          {
            name: 'Etap 3: Opieka pooperacyjna i profilaktyka powikłań',
            prompt: 'Wykonano pilną laparoskopię — usunięto pęknięty prawy jajowód i ewakuowano 1600 ml krwi ze skrzepami. Drugi jajowód prawidłowy. Wynik grupy krwi: A RhD-ujemna (przeciwciała odpornościowe nieobecne). O czym musisz pamiętać po zabiegu?',
            vitalsDelta: { hr: -14, bp: '118/74', rr: -3, spo2: 0, shockIndex: -0.20 },
            options: [
              {
                id: 'ect3_a',
                text: 'Podanie immunoglobuliny anty-D (i.m.) w ciągu 72 godzin w ramach profilaktyki konfliktu serologicznego',
                type: 'key',
                points: 25,
                why: 'Każda pacjentka RhD-ujemna po operacji z powodu ciąży ektopowej musi otrzymać immunoglobulinę anty-D w ciągu 72 godzin.'
              },
              {
                id: 'ect3_b',
                text: 'Kontrola morfologii, edukacja o podwyższonym ryzyku kolejnej ciąży ektopowej (~10–15%) oraz zalecenie wczesnego USG TV (ok. 5–6 Hbd) w następnej ciąży',
                type: 'key',
                points: 20,
                why: 'Przebyta ciąża ektopowa jest jednym z najsilniejszych czynników ryzyka nawrotu — w kolejnej ciąży konieczna jest wczesna lokalizacja pęcherzyka ciążowego.'
              },
              {
                id: 'ect3_c',
                text: 'Rezygnacja z immunoglobuliny anty-D, ponieważ ciąża była wczesna (7 Hbd) i pozamaciczna',
                type: 'harmful',
                points: -20,
                why: 'Błąd! Nawet we wczesnej ciąży ektopowej po interwencji chirurgicznej dochodzi do przecieku erytrocytów płodowych i ryzyka alloimmunizacji RhD.'
              },
              {
                id: 'ect3_d',
                text: 'Zlecenie badania histopatologicznego usuniętego jajowodu w celu ostatecznego potwierdzenia kosmków łożyska',
                type: 'key',
                points: 10,
                why: 'Potwierdzenie histopatologiczne wyklucza rzadką ciążę heterotopową lub brak usunięcia tkanki trofoblastycznej.'
              }
            ]
          }
        ],
        debrief: {
          diagnosis: 'Pęknięta ciąża jajowodowa powikłana wstrząsem hipowolemicznym (hemoperitoneum)',
          code: 'ICD-10: O00.1 + R57.1',
          etiology: 'Implantacja zarodka w bańce/cieśni jajowodu (95% ciąż ektopowych) z następowym przerwaniem ściany jajowodu i krwotokiem tętniczo-żylnym do jamy otrzewnej.',
          keyRules: [
            'Każda kobieta w wieku rozrodczym z bólem podbrzusza, krwawieniem lub omdleniem musi mieć wykonany test ciążowy (β-hCG)!',
            'Objaw Kehra (ból w okolicy barku) wynika z drażnienia przepony przez krew w jamie otrzewnej (nerw przeponowy C3–C5).',
            'Metotreksat (MTX) jest bezwzględnie przeciwwskazany przy niestabilności hemodynamicznej, podejrzeniu pęknięcia lub dużym wolnym płynie w jamie brzusznej.',
            'U pacjentki RhD-ujemnej po operacji ciąży ektopowej obowiązkowo podaj immunoglobulinę anty-D w ciągu 72 h.'
          ],
          pearls: 'Pusta jama macicy w USG TV przy β-hCG powyżej strefy dyskryminacyjnej (1500–3500 mIU/ml) + wolny płyn w zatoce Douglasa i zachyłku Morisona = pilna sala operacyjna, nie TK i nie czekanie na kolejne β-hCG.'
        }
      },
      {
        id: 'cord-prolapse',
        shortTitle: 'Wypadnięcie pępowiny',
        title: 'Wypadnięcie pępowiny po odpłynięciu płynu owodniowego',
        category: 'Położnictwo · Sala Porodowa',
        severity: 'Krytyczny',
        age: '31 lat',
        gravida: 'G2P1 · 39+1 Hbd',
        gestation: 'Położenie główkowe, główka wysoko',
        intro: 'Rodząca w 39+1 Hbd na sali porodowej (włączona indukcja porodu oksytocyną, rozwarcie 4 cm, główka wysoko nad wchodem). Przed 2 minutami samoistnie odpłynął obfity, czysty płyn owodniowy. Natychmiast na monitorze KTG pojawiła się głęboka, przedłużona bradykardia płodu 72/min. W badaniu wewnętrznym wyczuwasz w pochwie miękką, tętniącą pętlę pępowiny poniżej główki płodu!',
        vitalsInitial: { hr: 108, bp: '126/78', rr: 22, spo2: 98, temp: 36.7, shockIndex: 0.86, fhr: 72 },
        stages: [
          {
            name: 'Etap 1: Natychmiastowe odbarczenie pępowiny i alarm CC kat. 1',
            prompt: 'Rozpoznajesz jawne wypadnięcie pępowiny z bradykardią płodu 72/min. Liczy się każda sekunda. Co robisz natychmiast bez wyjmowania ręki badającej?',
            vitalsDelta: { hr: -4, bp: '122/76', rr: -2, spo2: 1, shockIndex: -0.01, fhr: 42 },
            options: [
              {
                id: 'cp1_a',
                text: 'Ręczne uniesienie główki płodu ku górze przez pochwę (odbarczenie ucisku na pępowinę) i utrzymanie ręki na miejscu aż do wydobycia dziecka na bloku',
                type: 'key',
                points: 30,
                why: 'Najważniejszy manewr ratujący życie płodu — mechaniczne odsunięcie części przodującej natychmiast przywraca przepływ w naczyniach pępowinowych.'
              },
              {
                id: 'cp1_b',
                text: 'Ułożenie pacjentki w pozycji kolankowo-łokciowej (lub głęboki Trendelenburg / lewoboczna z uniesioną miednicą), wyłączenie wlewu oksytocyny i ogłoszenie alarmu: Cięcie cesarskie kategoria 1',
                type: 'key',
                points: 25,
                why: 'Grawitacja wspomaga odciążenie pępowiny, wyłączenie oksytocyny zmniejsza ucisk skurczowy, a alarm kat. 1 mobilizuje zespół (położnik, anestezjolog, neonatolog).'
              },
              {
                id: 'cp1_c',
                text: 'Próba energicznego wepchnięcia (odprowadzenia) wypadniętej pętli pępowiny z powrotem ponad główkę do jamy macicy',
                type: 'harmful',
                points: -30,
                why: 'Błąd krytyczny! Manipulacja pępowiną wywołuje gwałtowny skurcz naczyń pępowinowych (wazospazm) i pogłębia ostrą zamartwicę płodu. Pępowinę jedynie chronimy przed uciskiem i wysychaniem.'
              },
              {
                id: 'cp1_d',
                text: 'Wyjęcie ręki badającej z pochwy, aby pacjentka mogła szybciej przesiąść się na wózek transportowy',
                type: 'harmful',
                points: -25,
                why: 'Błąd krytyczny! Zdjęcie ręki powoduje ponowne zaciśnięcie pępowiny przez główkę i natychmiastowy nawrót ciężkiej bradykardii.'
              }
            ]
          },
          {
            name: 'Etap 2: Transport na blok i wspomaganie odciążenia',
            prompt: 'Dzięki ręcznemu uniesieniu główki FHR wzrosło do 114/min. Zespół bloku operacyjnego jest gotowy za 5 minut, jednak utrzymują się częste skurcze macicy. Jak zabezpieczasz płód w trakcie przygotowań?',
            vitalsDelta: { hr: -6, bp: '120/74', rr: -2, spo2: 0, shockIndex: -0.03, fhr: 18 },
            options: [
              {
                id: 'cp2_a',
                text: 'Rozważenie podania ostrej tokolizy (np. atosiban i.v. lub terbutalina s.c.) w celu zniesienia skurczów uciskających pępowinę oraz tlenoterapia bierna u matki',
                type: 'key',
                points: 20,
                why: 'Ostra tokoliza znosi skurcze macicy pogłębiające bradykardię (szczególnie po wcześniejszej indukcji oksytocyną), pod warunkiem że nie opóźnia cięcia cesarskiego.'
              },
              {
                id: 'cp2_b',
                text: 'W razie przewidywanego opóźnienia transportu: wypełnienie pęcherza moczowego 500 ml ciepłego 0,9% NaCl przez cewnik Foleya (metoda Vago) z pamięcią o opróżnieniu przed nacięciem macicy',
                type: 'key',
                points: 15,
                why: 'Metoda Vago jest uznanym manewrem wspomagającym uniesienie części przodującej, gdy czas dotarcia na blok się wydłuża.'
              },
              {
                id: 'cp2_c',
                text: 'Utrzymywanie ręki odbarczającej w pochwie i monitorowanie FHR aż do momentu wydobycia płodu przez chirurga',
                type: 'key',
                points: 20,
                why: 'Ciągłość odbarczenia aż do nacięcia macicy zapewnia bezpieczną oksygenację płodu przez cały czas przygotowania do znieczulenia.'
              },
              {
                id: 'cp2_d',
                text: 'Zwiększenie dawki oksytocyny, aby przyspieszyć rozwarcie z 4 cm do 10 cm i ukończyć poród siłami natury',
                type: 'harmful',
                points: -30,
                why: 'Błąd krytyczny! Przy rozwarciu 4 cm i wysoko ustawionej główce nie ma warunków do szybkiego porodu pochwowego — nasilenie skurczów zabije płód.'
              }
            ]
          },
          {
            name: 'Etap 3: Wydobycie noworodka i postępowanie okołoporodowe',
            prompt: 'Pacjentka jest na stole operacyjnym (minęło 9 minut od rozpoznania). Jakie elementy zamykają prawidłowe postępowanie ratunkowe?',
            vitalsDelta: { hr: -8, bp: '118/72', rr: -2, spo2: 0, shockIndex: -0.06, fhr: 6 },
            options: [
              {
                id: 'cp3_a',
                text: 'Natychmiastowe cięcie cesarskie kategorii 1 (cel decision-to-delivery <30 min) w znieczuleniu ogólnym RSI lub szybkim przewodowym z obecnością zespołu neonatologicznego',
                type: 'key',
                points: 25,
                why: 'Przy niepełnym rozwarciu ratunkowe cięcie cesarskie jest jedyną bezpieczną drogą ukończenia porodu z wypadnięciem pępowiny.'
              },
              {
                id: 'cp3_b',
                text: 'Pobranie gazometrii z tętnicy i żyły pępowinowej (pH, BE, mleczany) zaraz po odpępnieniu do obiektywnej oceny stanu noworodka',
                type: 'key',
                points: 20,
                why: 'Gazometria pępowinowa z obu naczyń (tętnicy i żyły) jest standardem oceny niedotlenienia okołoporodowego (kryterium kwasicy: pH <7,0, BE ≤-12 mmol/l).'
              },
              {
                id: 'cp3_c',
                text: 'Wstrzymanie cięcia cesarskiego do czasu uzyskania wyniku aktualnej morfologii i koagulogramu z laboratorium (ok. 40 min)',
                type: 'harmful',
                points: -25,
                why: 'Błąd krytyczny! W cięciu cesarskim kategorii 1 z powodu wypadnięcia pępowiny nie wolno czekać na wyniki badań laboratoryjnych.'
              }
            ]
          }
        ],
        debrief: {
          diagnosis: 'Jawne wypadnięcie pępowiny z ostrą bradykardią płodu — cięcie cesarskie kat. 1',
          code: 'ICD-10: O69.0',
          etiology: 'Brak szczelnego przylegania części przodującej do wchodu miednicy w momencie pęknięcia pęcherza płodowego (wysoko ustawiona główka, położenie miednicowe/poprzeczne, wielowodzie, ciąża wielopłodowa, przedwczesna amniotomia).',
          keyRules: [
            'Po każdym odpłynięciu płynu owodniowego (szczególnie przy nieustalonej główce lub położeniu miednicowym) natychmiast osłuchaj FHR!',
            'Ręczne uniesienie części przodującej + pozycja kolankowo-łokciowa/Trendelenburga + alarm CC kat. 1 to triadą pierwszych 60 sekund.',
            'NIGDY nie odprowadzaj siłowo wypadniętej pępowiny do jamy macicy i nie zdejmuj ręki odbarczającej w czasie transportu.',
            'Poród pochwowy (próżnociąg/kleszcze) wchodzi w grę wyłącznie przy pełnym rozwarciu (10 cm) i nisko ustawionej główce, gdy wydobycie będzie szybsze niż CC.'
          ],
          pearls: 'Zasada sali porodowej: amniotomia przy wysoko ustawionej, balotującej główce to proszenie się o wypadnięcie pępowiny. Jeśli do niego dojdzie — Twoja dłoń w pochwie jest tymczasową „pompą życia” dla płodu aż do nacięcia macicy.'
        }
      }
    ];

    /* ---------- STAN SYMULACJI ---------- */
    let SIM_ACTIVE = null;

    /* ---------- OCENA PARAMETRÓW MATKI I PŁODU ---------- */
    function parseBp(bpStr) {
      const m = String(bpStr || '').match(/(\d+)\s*\/\s*(\d+)/);
      return m ? { sys: Number(m[1]), dia: Number(m[2]) } : null;
    }

    function getVitalStatus(key, val) {
      if (val === null || val === undefined) return 'ok';
      if (key === 'spo2') return val >= 95 ? 'ok' : (val >= 91 ? 'warn' : 'danger');
      if (key === 'temp') return (val >= 36.0 && val <= 37.5) ? 'ok' : (val <= 38.3 && val >= 35.5 ? 'warn' : 'danger');
      if (key === 'hr') return (val >= 60 && val <= 100) ? 'ok' : ((val > 100 && val <= 115) || (val >= 50 && val < 60) ? 'warn' : 'danger');
      if (key === 'rr') return (val >= 12 && val <= 20) ? 'ok' : (val <= 24 && val >= 10 ? 'warn' : 'danger');
      if (key === 'shockIndex') return val < 0.9 ? 'ok' : (val < 1.1 ? 'warn' : 'danger');
      if (key === 'fhr') return (val >= 110 && val <= 160) ? 'ok' : ((val >= 100 && val < 110) || (val > 160 && val < 180) ? 'warn' : 'danger');
      if (key === 'bp') {
        const bp = parseBp(val);
        if (!bp) return 'ok';
        if (bp.sys < 90 || bp.sys >= 160 || bp.dia >= 110) return 'danger';
        if (bp.sys < 100 || bp.sys >= 140 || bp.dia >= 90) return 'warn';
        return 'ok';
      }
      return 'ok';
    }

    function renderVitalsMonitor(v) {
      const bpStatus = getVitalStatus('bp', v.bp);
      const siVal = v.shockIndex != null ? Number(v.shockIndex).toFixed(2) : '–';
      const hasFhr = v.fhr !== null && v.fhr !== undefined;
      return `<div class="vitals-monitor" aria-label="Monitor parametrów życiowych">
        <div class="vital-chip ${getVitalStatus('hr', v.hr)}"><span class="v-lab">❤️ HR matki</span><span class="v-val">${esc(v.hr)}</span><span class="v-unit">/min</span></div>
        <div class="vital-chip ${bpStatus}"><span class="v-lab">🩸 RR</span><span class="v-val" style="font-size:1.05rem">${esc(v.bp)}</span><span class="v-unit">mmHg</span></div>
        <div class="vital-chip ${getVitalStatus('shockIndex', v.shockIndex)}"><span class="v-lab">⚡ Wsk. wstrząsu</span><span class="v-val">${esc(siVal)}</span><span class="v-unit">SI (&lt;0,9)</span></div>
        <div class="vital-chip ${getVitalStatus('spo2', v.spo2)}"><span class="v-lab">🫁 SpO₂</span><span class="v-val">${esc(v.spo2)}%</span><span class="v-unit">saturacja</span></div>
        <div class="vital-chip ${getVitalStatus('rr', v.rr)}"><span class="v-lab">💨 Oddech</span><span class="v-val">${esc(v.rr)}</span><span class="v-unit">/min</span></div>
        <div class="vital-chip ${getVitalStatus('temp', v.temp)}"><span class="v-lab">🌡️ Temp</span><span class="v-val">${esc(Number(v.temp || 36.6).toFixed(1))}</span><span class="v-unit">°C</span></div>
        ${hasFhr ? `<div class="vital-chip ${getVitalStatus('fhr', v.fhr)}"><span class="v-lab">👶 FHR płodu</span><span class="v-val">${esc(v.fhr)}</span><span class="v-unit">ud./min</span></div>` : ''}
      </div>`;
    }

    function renderEmergencyDrugTray(caseItem) {
      const cardData = EMERGENCY_DRUG_CARDS[caseItem.id];
      if (!cardData) return '';

      return `<div class="card emergency-doses-tray" style="margin:1rem 0;background:var(--surface);border:2px solid var(--red);box-shadow:var(--shadow-md)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem;flex-wrap:wrap;gap:.5rem">
          <div style="display:flex;align-items:center;gap:.55rem">
            <span style="font-size:1.3rem" aria-hidden="true">🚨</span>
            <div>
              <h3 style="margin:0;font-size:1.08rem;color:var(--red)">Szuflada Leków Ratunkowych OB/GYN</h3>
              <div style="font-size:.8rem;color:var(--ink-muted)">${esc(cardData.subtitle)}</div>
            </div>
          </div>
          <button type="button" class="btn sec sm" id="btnCloseEmergencyTray">✕ Zamknij</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:.7rem;margin-bottom:.85rem">
          ${cardData.drugs.map(drug => `
            <div style="background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:.75rem .9rem;display:flex;flex-direction:column;justify-content:space-between">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.35rem;gap:.4rem">
                  <b style="font-size:.92rem;color:var(--ink)">${esc(drug.name)}</b>
                  <span class="chip" style="background:var(--red-l);color:var(--red);font-weight:700;font-size:.68rem;padding:.15rem .45rem;border:0;white-space:nowrap">${esc(drug.badge)}</span>
                </div>
                <div style="padding:.45rem .6rem;background:var(--surface);border:1.5px solid var(--teal);border-radius:6px;margin-bottom:.4rem">
                  <span style="font-size:.7rem;color:var(--teal-d);display:block;font-weight:800;letter-spacing:.03em">DAWKOWANIE / PROCEDURA:</span>
                  <b style="font-size:.88rem;color:var(--teal);display:block;line-height:1.35">${esc(drug.dose)}</b>
                </div>
                <div style="font-size:.78rem;color:var(--ink-muted);margin-bottom:.25rem">
                  <b>Droga:</b> ${esc(drug.route)}
                </div>
              </div>
              <div style="font-size:.77rem;color:var(--ink);background:var(--teal-xl);padding:.38rem .55rem;border-radius:6px;margin-top:.35rem;line-height:1.38">
                ${esc(drug.indication)}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="background:var(--red-l);border:1px solid var(--red-b);padding:.75rem .95rem;border-radius:8px;font-size:.82rem;line-height:1.45;color:var(--ink)">
          <b style="color:var(--red)">⚠️ CZERWONE FLAGI I PRZECIWWSKAZANIA:</b>
          <ul style="margin:.35rem 0 0 1.15rem;padding:0">
            ${cardData.redFlags.map(rf => `<li>${esc(rf)}</li>`).join('')}
          </ul>
        </div>
      </div>`;
    }

    function renderRelatedBadge(caseId) {
      const map = {
        'pph-atonia': { link: '#/kalkulator', text: '🧮 Sprawdź kalkulator PPH / SI w Kalkulatorach OB →', col: 'var(--red)', bg: 'var(--red-l)' },
        'eclampsia-hellp': { link: '#/kalkulator', text: '🧮 Sprawdź schemat MgSO₄ w Kalkulatorach OB →', col: 'var(--amber-d)', bg: 'var(--amber-l)' },
        'ectopic-ruptured': { link: '#/badania', text: '🔬 Przećwicz USG wczesnej ciąży w KTG & USG →', col: 'var(--teal-d)', bg: 'var(--teal-l)' },
        'cord-prolapse': { link: '#/badania', text: '📈 Przećwicz bradykardię i KTG w Atlasie KTG →', col: 'var(--blue)', bg: 'var(--blue-l)' }
      };
      const item = map[caseId];
      if (!item) return '';
      return `<div style="margin-top:.55rem"><a class="chip" href="${item.link}" style="background:${item.bg};color:${item.col};font-weight:700;text-decoration:none;border:0">${esc(item.text)}</a></div>`;
    }

    function getClinicalRank(completedCount) {
      if (completedCount >= 7) return { title: 'Dyżurny Położnik-Ginekolog 🏆', color: 'var(--teal)' };
      if (completedCount >= 4) return { title: 'Rezydent Położnictwa i Ginekologii 🌟', color: 'var(--green)' };
      if (completedCount >= 2) return { title: 'Stażysta Izby Przyjęć 🏥', color: 'var(--amber)' };
      return { title: 'Student V roku · Ostry Dyżur 🩺', color: 'var(--ink-muted)' };
    }

    /* ---------- ROUTER WIDOKU #/pacjent ---------- */
    function viewPatient(parts, params) {
      const stations = getOsceStations();

      // 1. Stacja OSCE: #/pacjent/osce/:id
      if (parts[1] === 'osce' && parts[2]) {
        const station = stations.find(s => s.id === parts[2]);
        if (!station) {
          toast('Nie znaleziono stacji OSCE');
          location.hash = '#/pacjent?tab=osce';
          return;
        }
        if (ctx.osce && typeof ctx.osce.openStation === 'function') {
          ctx.osce.openStation(station);
        }
        return;
      }

      // 2. Bezpośrednie wejście #/pacjent/osce-...
      if (parts[1] && parts[1] !== 'osce') {
        const directOsce = stations.find(s => s.id === parts[1]);
        if (directOsce && ctx.osce && typeof ctx.osce.openStation === 'function') {
          ctx.osce.openStation(directOsce);
          return;
        }
      }

      // 3. Przypadek Izby Przyjęć: #/pacjent/:caseId
      const caseId = parts[1];
      if (caseId && caseId !== 'osce') {
        const caseItem = PATIENT_CASES.find(c => c.id === caseId);
        if (!caseItem) {
          toast('Nie znaleziono scenariusza klinicznego');
          location.hash = '#/pacjent';
          return;
        }
        if (!SIM_ACTIVE || SIM_ACTIVE.caseId !== caseId) {
          startPatientSim(caseItem);
        }
        renderActivePatientSim(caseItem);
        return;
      }

      // 4. Przełącznik trybu: Izba Przyjęć vs Stacje OSCE
      const tab = (parts[1] === 'osce' || (params && params.tab === 'osce')) ? 'osce' : 'sor';
      if (tab === 'osce' && ctx.osce && typeof ctx.osce.renderOsceStationList === 'function') {
        ctx.osce.renderOsceStationList();
      } else {
        renderPatientCaseList();
      }
    }

    function startPatientSim(caseItem) {
      SIM_ACTIVE = {
        caseId: caseItem.id,
        stageIdx: 0,
        state: 'deciding',
        selectedOptionIds: new Set(),
        score: 0,
        maxScore: 0,
        history: [],
        currentVitals: { ...caseItem.vitalsInitial },
        showEmergencyTray: false
      };
    }

    /* ---------- LISTA PRZYPADKÓW IZBY PRZYJĘĆ ---------- */
    function renderPatientCaseList() {
      window.scrollTo(0, 0);
      const stations = getOsceStations();
      const savedCases = ctx.S.patientCases || {};
      const savedOsce = ctx.S.osceCases || {};
      const completedSor = Object.keys(savedCases).length;
      const completedOsce = Object.keys(savedOsce).length;
      const totalCompleted = completedSor + completedOsce;
      const rank = getClinicalRank(totalCompleted);

      let scoreSum = 0;
      let scoreCount = 0;
      Object.values(savedCases).forEach(c => {
        if (typeof c.bestScore === 'number') { scoreSum += c.bestScore; scoreCount++; }
      });
      Object.values(savedOsce).forEach(c => {
        const sc = typeof c.bestScore === 'number' ? c.bestScore : c.score;
        if (typeof sc === 'number') { scoreSum += sc; scoreCount++; }
      });
      const avgScore = scoreCount ? Math.round(scoreSum / scoreCount) : 0;

      main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:1040px">
        <div class="eyebrow">Symulator kliniczny · Ostry Dyżur Położniczo-Ginekologiczny</div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:.8rem;margin-bottom:.6rem">
          <h2 style="margin:0">Izba Przyjęć &amp; Stacje OSCE</h2>
          <span class="sim-rank-chip" style="color:${rank.color}">${esc(rank.title)}</span>
        </div>

        <div class="conn-tabs" role="tablist" aria-label="Tryb symulatora klinicznego" style="margin-bottom:1.4rem">
          <button type="button" class="conn-tab-btn active" data-ptab="sor" role="tab" aria-selected="true">🚨 Izba Przyjęć · Przypadki ostre (${PATIENT_CASES.length})</button>
          <button type="button" class="conn-tab-btn" data-ptab="osce" role="tab" aria-selected="false">📋 Stacje OSCE (${stations.length})</button>
        </div>

        <p class="lead">Wieloetapowe scenariusze ostrych stanów w położnictwie i ginekologii wg wytycznych PTGiP / FIGO. Monitoruj parametry matki i płodu na żywo, korzystaj z szuflady leków ratunkowych i unikaj błędów krytycznych.</p>

        <div class="hero-strip" style="margin-bottom:1.8rem">
          <div class="hero-stat">
            <span class="val">${completedSor} / ${PATIENT_CASES.length}</span>
            <span class="lbl">Przypadki ostre</span>
          </div>
          <div class="hero-stat">
            <span class="val">${completedOsce} / ${stations.length}</span>
            <span class="lbl">Stacje OSCE</span>
          </div>
          <div class="hero-stat">
            <span class="val">${scoreCount ? avgScore + '%' : '–'}</span>
            <span class="lbl">Średni wynik</span>
          </div>
          <div class="hero-stat">
            <span class="val">PTGiP</span>
            <span class="lbl">Standard dydaktyczny</span>
          </div>
        </div>

        <div class="grid cols-2" style="gap:1.3rem">
          ${PATIENT_CASES.map(c => {
            const saved = savedCases[c.id];
            const best = saved ? saved.bestScore : null;
            const passed = best !== null && best >= 75;
            const hasFhr = c.vitalsInitial.fhr != null;
            return `<article class="card" style="display:flex;flex-direction:column;justify-content:space-between;border-top:4px solid var(--red)">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.55rem">
                  <span class="chip" style="background:var(--red-l);color:var(--red);font-weight:800;border:0">${esc(c.category)}</span>
                  <span style="font-size:.8rem;color:var(--ink-muted);font-weight:700">${esc(c.age)} · ${esc(c.gravida)}</span>
                </div>
                <h3 style="margin:.2rem 0 .45rem 0;font-size:1.15rem">
                  <a href="#/pacjent/${esc(c.id)}" style="color:inherit;text-decoration:none">${esc(c.title)}</a>
                </h3>
                <p style="font-size:.88rem;color:var(--ink-muted);line-height:1.48;margin-bottom:.9rem">${esc(c.intro)}</p>
                <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem">
                  <span class="chip">HR ${esc(c.vitalsInitial.hr)}/min</span>
                  <span class="chip">RR ${esc(c.vitalsInitial.bp)}</span>
                  <span class="chip">SI ${esc(Number(c.vitalsInitial.shockIndex).toFixed(2))}</span>
                  ${hasFhr ? `<span class="chip" style="background:var(--amber-l);color:var(--amber-d);border:0;font-weight:700">FHR ${esc(c.vitalsInitial.fhr)}/min</span>` : ''}
                  <span class="chip">${c.stages.length} etapy</span>
                </div>
              </div>

              <div style="border-top:1px solid var(--line-2);padding-top:.85rem;display:flex;align-items:center;justify-content:space-between;gap:.6rem;flex-wrap:wrap">
                <div>
                  ${best !== null ? `
                    <span class="chip" style="background:${passed ? 'var(--green-l)' : 'var(--amber-l)'};color:${passed ? 'var(--green)' : 'var(--amber-d)'};font-weight:800;border:0">
                      ${passed ? '✅ Najlepszy wynik' : '⚠ Do poprawy'}: ${best}%
                    </span>
                  ` : `<span class="chip" style="color:var(--ink-muted)">Nowy przypadek</span>`}
                </div>
                <a class="btn pri sm" href="#/pacjent/${esc(c.id)}">${best !== null ? 'Powtórz dyżur →' : 'Rozpocznij dyżur →'}</a>
              </div>
            </article>`;
          }).join('')}
        </div>

        <p class="srcline" style="margin-top:1.5rem;font-size:.8rem">
          Materiał edukacyjny dla studentów V roku medycyny. Decyzje kliniczne przy łóżku pacjentki należy weryfikować z aktualnymi rekomendacjami PTGiP/FIGO i ChPL.
        </p>
      </div></section>`;

      $$('.conn-tab-btn[data-ptab]').forEach(b => {
        b.onclick = () => {
          location.hash = b.dataset.ptab === 'osce' ? '#/pacjent/osce' : '#/pacjent';
        };
      });
    }

    /* ---------- AKTYWNA SYMULACJA PRZYPADKU ---------- */
    function renderActivePatientSim(caseItem) {
      if (SIM_ACTIVE.state === 'finished') {
        return renderPatientReport(caseItem);
      }

      const s = caseItem.stages[SIM_ACTIVE.stageIdx];
      const isReviewed = SIM_ACTIVE.state === 'reviewed';
      const totalSteps = caseItem.stages.length + 1;

      main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:920px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
          <a class="btn sec sm" href="#/pacjent">← Wróć do Izby Przyjęć</a>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            <button type="button" class="btn sec sm" id="btnToggleEmergencyTray" style="font-weight:700;color:var(--red);border-color:var(--red-b)">
              🚨 Leki ratunkowe ${SIM_ACTIVE.showEmergencyTray ? '▲' : '▼'}
            </button>
            <a class="btn sec sm" href="#/kalkulator" title="Kalkulatory położnicze">🧮 Kalkulatory OB</a>
          </div>
        </div>

        <div class="card" style="background:var(--surface);border-left:4px solid var(--teal);padding:1.1rem 1.35rem">
          <div style="display:flex;gap:.45rem;align-items:center;flex-wrap:wrap;margin-bottom:.35rem">
            <span class="chip" style="background:var(--teal-l);color:var(--teal-d);font-weight:800;border:0">${esc(caseItem.shortTitle)}</span>
            <span class="chip">${esc(caseItem.age)} · ${esc(caseItem.gravida)}</span>
            <span class="chip">${esc(caseItem.gestation)}</span>
          </div>
          <h2 style="font-size:1.3rem;margin:.25rem 0">${esc(caseItem.title)}</h2>
          <p class="srcline" style="margin-top:.35rem;font-size:.9rem;line-height:1.5">${esc(caseItem.intro)}</p>
          ${renderRelatedBadge(caseItem.id)}
        </div>

        ${renderVitalsMonitor(SIM_ACTIVE.currentVitals)}

        ${SIM_ACTIVE.showEmergencyTray ? renderEmergencyDrugTray(caseItem) : ''}

        <div class="sim-steps" style="grid-template-columns:repeat(${totalSteps}, 1fr)">
          ${caseItem.stages.map((st, i) => {
            const cls = i < SIM_ACTIVE.stageIdx ? 'done' : (i === SIM_ACTIVE.stageIdx ? 'active' : '');
            return `<div class="sim-step-item ${cls}">
              <span>${i < SIM_ACTIVE.stageIdx ? '✓' : (i + 1) + '.'}</span>
              <span>${esc(st.name.replace(/^Etap \d+:\s*/, ''))}</span>
            </div>`;
          }).join('')}
          <div class="sim-step-item ${SIM_ACTIVE.stageIdx >= caseItem.stages.length ? 'active' : ''}">
            <span>${totalSteps}.</span>
            <span>Debrief &amp; ICD-10</span>
          </div>
        </div>

        <div class="card" style="padding:1.35rem">
          <div class="eyebrow">${esc(s.name)}</div>
          <h3 style="font-size:1.2rem;margin:.3rem 0 .7rem 0">${esc(s.prompt)}</h3>

          ${!isReviewed ? `
            <p class="srcline" style="margin-bottom:.9rem">Zaznacz wszystkie działania wskazane na tym etapie (uwaga na błędy krytyczne):</p>
            <div class="action-grid" id="actionGrid">
              ${s.options.map(opt => {
                const isSel = SIM_ACTIVE.selectedOptionIds.has(opt.id);
                return `<label class="sim-action-card ${isSel ? 'selected' : ''}" data-opt="${esc(opt.id)}">
                  <input type="checkbox" ${isSel ? 'checked' : ''}>
                  <div style="flex:1">
                    <span style="font-weight:600;font-size:.95rem;line-height:1.42">${esc(opt.text)}</span>
                  </div>
                </label>`;
              }).join('')}
            </div>
            <div style="margin-top:1.3rem;display:flex;justify-content:flex-end">
              <button type="button" class="btn pri" id="btnSubmitStage" style="padding:.75rem 1.5rem">Zatwierdź działania i sprawdź reakcję →</button>
            </div>
          ` : `
            <div style="background:var(--bg);border-radius:10px;padding:.95rem 1.1rem;margin-bottom:1.1rem;border:1px solid var(--line-2)">
              <b style="font-size:1.02rem;display:block;margin-bottom:.3rem">Ocena postępowania na tym etapie:</b>
              <p class="srcline" style="margin:0">Parametry na monitorze powyżej zostały zaktualizowane. Sprawdź uzasadnienie każdej opcji wg standardów PTGiP/FIGO.</p>
            </div>

            <div class="action-grid">
              ${s.options.map(opt => {
                const wasSelected = SIM_ACTIVE.selectedOptionIds.has(opt.id);
                let cls = 'rev-neutral';
                let badge = `<span class="chip" style="background:var(--surface);color:var(--muted)">○ Działanie neutralne (0 pkt)</span>`;
                if (opt.type === 'key') {
                  cls = 'rev-key';
                  badge = wasSelected
                    ? `<span class="chip" style="background:var(--green-l);color:var(--green);font-weight:700;border:0">✓ Działanie kluczowe (+${opt.points} pkt)</span>`
                    : `<span class="chip" style="background:var(--amber-l);color:var(--amber-d);font-weight:700;border:0">⚠ Przeoczone działanie kluczowe (0 pkt)</span>`;
                } else if (opt.type === 'harmful') {
                  cls = 'rev-harmful';
                  badge = wasSelected
                    ? `<span class="chip" style="background:var(--red-l);color:var(--red);font-weight:700;border:0">✗ Błąd krytyczny (${opt.points} pkt)</span>`
                    : `<span class="chip" style="background:var(--green-l);color:var(--green);font-weight:700;border:0">✓ Prawidłowo uniknięto błędu</span>`;
                }

                return `<div class="sim-action-card ${cls}" style="cursor:default">
                  <div style="flex:1">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.35rem;flex-wrap:wrap;gap:.4rem">
                      ${badge}
                      ${wasSelected ? '<span class="chip" style="border-color:transparent;background:var(--surface);font-weight:700">Twój wybór</span>' : ''}
                    </div>
                    <div style="font-weight:700;font-size:.95rem;margin-bottom:.3rem">${esc(opt.text)}</div>
                    <div class="srcline" style="font-size:.86rem;line-height:1.45">${esc(opt.why)}</div>
                  </div>
                </div>`;
              }).join('')}
            </div>

            <div style="margin-top:1.3rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.8rem;border-top:1px solid var(--line-2);padding-top:1rem">
              <span style="font-weight:700;color:var(--teal)">Monitor życiowy zaktualizowany.</span>
              <button type="button" class="btn pri" id="btnNextStage" style="padding:.75rem 1.5rem">
                ${SIM_ACTIVE.stageIdx + 1 < caseItem.stages.length ? 'Przejdź do kolejnego etapu →' : 'Zobacz debrief i kartę wypisową →'}
              </button>
            </div>
          `}
        </div>
      </div></section>`;

      const btnToggleEmerg = $('#btnToggleEmergencyTray');
      if (btnToggleEmerg) {
        btnToggleEmerg.onclick = () => {
          SIM_ACTIVE.showEmergencyTray = !SIM_ACTIVE.showEmergencyTray;
          renderActivePatientSim(caseItem);
        };
      }
      const btnCloseEmerg = $('#btnCloseEmergencyTray');
      if (btnCloseEmerg) {
        btnCloseEmerg.onclick = () => {
          SIM_ACTIVE.showEmergencyTray = false;
          renderActivePatientSim(caseItem);
        };
      }

      if (!isReviewed) {
        const grid = $('#actionGrid');
        if (grid) {
          grid.addEventListener('click', e => {
            const card = e.target.closest('[data-opt]');
            if (!card) return;
            const optId = card.dataset.opt;
            const cb = card.querySelector('input[type="checkbox"]');
            if (e.target !== cb) cb.checked = !cb.checked;
            if (cb.checked) {
              SIM_ACTIVE.selectedOptionIds.add(optId);
              card.classList.add('selected');
            } else {
              SIM_ACTIVE.selectedOptionIds.delete(optId);
              card.classList.remove('selected');
            }
          });
        }
        const submitBtn = $('#btnSubmitStage');
        if (submitBtn) submitBtn.onclick = () => submitPatientStage(caseItem);
      } else {
        const nextBtn = $('#btnNextStage');
        if (nextBtn) nextBtn.onclick = () => nextPatientStage(caseItem);
      }
    }

    function submitPatientStage(caseItem) {
      if (SIM_ACTIVE.selectedOptionIds.size === 0) {
        toast('Zaznacz przynajmniej jedno działanie przed zatwierdzeniem etapu');
        return;
      }

      const s = caseItem.stages[SIM_ACTIVE.stageIdx];
      let stageScore = 0;
      let stageMax = 0;
      let hadHarmful = false;

      s.options.forEach(opt => {
        if (opt.type === 'key') {
          stageMax += opt.points;
          if (SIM_ACTIVE.selectedOptionIds.has(opt.id)) stageScore += opt.points;
        } else if (opt.type === 'harmful') {
          if (SIM_ACTIVE.selectedOptionIds.has(opt.id)) {
            stageScore += opt.points;
            hadHarmful = true;
          }
        }
      });

      SIM_ACTIVE.score += stageScore;
      SIM_ACTIVE.maxScore += stageMax;

      if (s.vitalsDelta) {
        const v = SIM_ACTIVE.currentVitals;
        const d = s.vitalsDelta;
        const factor = hadHarmful ? 0.35 : 1;
        if (typeof d.hr === 'number') v.hr = Math.max(45, Math.min(200, Math.round(v.hr + d.hr * factor)));
        if (typeof d.rr === 'number') v.rr = Math.max(10, Math.min(45, Math.round(v.rr + d.rr * factor)));
        if (typeof d.spo2 === 'number') v.spo2 = Math.max(70, Math.min(100, Math.round(v.spo2 + d.spo2 * factor)));
        if (typeof d.temp === 'number') v.temp = Math.max(35.0, Math.min(41.0, Math.round((v.temp + d.temp) * 10) / 10));
        if (typeof d.fhr === 'number' && v.fhr != null) v.fhr = Math.max(55, Math.min(200, Math.round(v.fhr + d.fhr * factor)));
        if (d.bp) v.bp = d.bp;
        const bpParsed = parseBp(v.bp);
        if (bpParsed && bpParsed.sys > 0) {
          v.shockIndex = Math.round((v.hr / bpParsed.sys) * 100) / 100;
        } else if (typeof d.shockIndex === 'number') {
          v.shockIndex = Math.max(0.4, Math.round((v.shockIndex + d.shockIndex * factor) * 100) / 100);
        }
      }

      SIM_ACTIVE.history.push({
        stageIdx: SIM_ACTIVE.stageIdx,
        selectedOptionIds: new Set(SIM_ACTIVE.selectedOptionIds),
        stageScore,
        stageMax
      });

      SIM_ACTIVE.state = 'reviewed';
      renderActivePatientSim(caseItem);
      const target = document.querySelector('.vitals-monitor') || document.querySelector('.sim-steps');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function nextPatientStage(caseItem) {
      if (SIM_ACTIVE.stageIdx + 1 < caseItem.stages.length) {
        SIM_ACTIVE.stageIdx++;
        SIM_ACTIVE.state = 'deciding';
        SIM_ACTIVE.selectedOptionIds = new Set();
        renderActivePatientSim(caseItem);
        const target = document.querySelector('.vitals-monitor') || document.querySelector('.sim-steps');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        SIM_ACTIVE.state = 'finished';
        renderPatientReport(caseItem);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    /* ---------- RAPORT KOŃCOWY I DEBRIEF ---------- */
    function renderPatientReport(caseItem) {
      const max = Math.max(1, SIM_ACTIVE.maxScore);
      const score = Math.max(0, SIM_ACTIVE.score);
      const scorePct = typeof pct === 'function'
        ? Math.min(100, pct(score, max))
        : Math.min(100, Math.round((score / max) * 100));

      let grade = 'Niezaliczone (błędy krytyczne)';
      let gradeColor = 'var(--red)';
      let gradeIcon = '❌';

      if (scorePct >= 90) {
        grade = 'Celujący (Ekspert Izby Przyjęć OB/GYN)';
        gradeColor = 'var(--green)';
        gradeIcon = '⭐';
      } else if (scorePct >= 75) {
        grade = 'Bardzo dobry (Skuteczna stabilizacja)';
        gradeColor = 'var(--green)';
        gradeIcon = '🟢';
      } else if (scorePct >= 60) {
        grade = 'Zadowalający (Zaliczony z uwagami)';
        gradeColor = 'var(--amber)';
        gradeIcon = '🟡';
      }

      ctx.S.patientCases = ctx.S.patientCases || {};
      const prev = ctx.S.patientCases[caseItem.id];
      const best = prev ? Math.max(prev.bestScore || 0, scorePct) : scorePct;
      ctx.S.patientCases[caseItem.id] = {
        bestScore: best,
        lastScore: scorePct,
        lastPlayed: Date.now()
      };
      save();

      main.innerHTML = `<section class="blk" style="border:0"><div class="wrap" style="max-width:920px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.3rem;flex-wrap:wrap;gap:.5rem">
          <a class="btn sec sm" href="#/pacjent">← Wróć do Izby Przyjęć</a>
          <span class="chip" style="font-weight:700">${esc(caseItem.shortTitle)}</span>
        </div>

        <div class="card" style="text-align:center;padding:2rem 1.4rem;border-top:4px solid ${gradeColor}">
          <div style="font-size:2.6rem;margin-bottom:.4rem" aria-hidden="true">${gradeIcon}</div>
          <h2 style="font-size:1.75rem;margin-bottom:.35rem;font-family:var(--font-display)">Twój wynik: ${scorePct}% (${score}/${max} pkt)</h2>
          <b style="font-size:1.1rem;color:${gradeColor}">${esc(grade)}</b>
          <p class="srcline" style="max-width:600px;margin:.9rem auto 0 auto">
            ${scorePct >= 75
              ? 'Świetne prowadzenie przypadku! Wdrożyłeś kluczowe procedury ratunkowe PTGiP/FIGO i skutecznie zabezpieczyłeś pacjentkę.'
              : 'Przeanalizuj błędy krytyczne i przeoczone kroki — w położnictwie i ginekologii kolejność działań i unikanie przeciwwskazań bezpośrednio decydują o rokowaniu matki i płodu.'}
          </p>

          <div style="display:flex;gap:.75rem;justify-content:center;margin-top:1.5rem;flex-wrap:wrap">
            <button type="button" class="btn pri" id="btnExportPatientNote">📋 Zapisz debrief do Notatnika</button>
            <button type="button" class="btn sec" id="btnRestartPatient">🔄 Powtórz przypadek</button>
            <a class="btn sec" href="#/pacjent">🩺 Inny przypadek</a>
          </div>
        </div>

        <div class="card" style="margin-top:1.4rem;padding:1.5rem">
          <div class="eyebrow">Debrief kliniczny i podsumowanie egzaminacyjne</div>
          <h3 style="font-size:1.3rem;margin:.35rem 0 .7rem 0">${esc(caseItem.debrief.diagnosis)} <span class="chip" style="font-size:.82rem;vertical-align:middle">${esc(caseItem.debrief.code)}</span></h3>
          <p class="srcline" style="margin-bottom:1.1rem"><b>Patofizjologia / etiologia:</b> ${esc(caseItem.debrief.etiology)}</p>

          <div style="background:var(--bg);padding:1.05rem 1.25rem;border-radius:10px;margin-bottom:1.2rem;border:1px solid var(--line-2)">
            <b style="font-size:1.02rem;color:var(--teal-d);display:block;margin-bottom:.55rem">💡 Złote zasady PTGiP / FIGO:</b>
            <ul style="margin:0;padding-left:1.2rem;display:flex;flex-direction:column;gap:.4rem">
              ${caseItem.debrief.keyRules.map(r => `<li style="font-size:.93rem;line-height:1.45">${esc(r)}</li>`).join('')}
            </ul>
          </div>

          <div class="tip" style="margin:0">
            <h4>Perła kliniczna ostrego dyżuru</h4>
            <p>${esc(caseItem.debrief.pearls)}</p>
          </div>
        </div>
      </div></section>`;

      $('#btnRestartPatient').onclick = () => {
        startPatientSim(caseItem);
        renderActivePatientSim(caseItem);
      };

      $('#btnExportPatientNote').onclick = () => {
        const v0 = caseItem.vitalsInitial;
        const md = `# Izba Przyjęć OB/GYN: ${caseItem.shortTitle}
**Rozpoznanie:** ${caseItem.debrief.diagnosis} (${caseItem.debrief.code})
**Data symulacji:** ${new Date().toLocaleString('pl-PL')}
**Pacjentka:** ${caseItem.age}, ${caseItem.gravida} (${caseItem.gestation})
**Wynik postępowania:** ${scorePct}% (${score}/${max} pkt) — ${grade}

---
### Wyjściowe parametry życiowe
- Tętno matki (HR): ${v0.hr}/min
- Ciśnienie tętnicze (RR): ${v0.bp} mmHg
- Wskaźnik wstrząsowy (SI): ${Number(v0.shockIndex).toFixed(2)}
- Saturacja (SpO₂): ${v0.spo2}%
- Oddech (RR): ${v0.rr}/min
- Temperatura: ${Number(v0.temp).toFixed(1)}°C${v0.fhr != null ? `\n- Czynność serca płodu (FHR): ${v0.fhr} ud./min` : ''}

---
### Złote zasady PTGiP / FIGO
${caseItem.debrief.keyRules.map(r => `- ${r}`).join('\n')}

**Perła kliniczna:**
> ${caseItem.debrief.pearls}
`;
        try {
          const notes = getNotes();
          notes.unshift({
            id: 'note_' + Date.now(),
            title: `Izba Przyjęć: ${caseItem.shortTitle} (${scorePct}%)`,
            content: md,
            body: md,
            updatedAt: Date.now(),
            updated: Date.now()
          });
          saveNotes(notes);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(md).catch(() => {});
          }
          toast('Zapisano debrief w Notatniku i skopiowano do schowka!');
        } catch (err) {
          toast('Nie udało się zapisać notatki');
        }
      };
    }

    return { viewPatient, cases: PATIENT_CASES, getVitalStatus, renderPatientCaseList };
  };
})();
